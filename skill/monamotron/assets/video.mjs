// Add an explicit duration to the simple WebM emitted by Chromium MediaRecorder.
// This preserves the original clusters and lets players display a finite duration.
function vint(bytes, offset, keepMarker = false) {
  let width = 1;
  let marker = 0x80;
  while (width <= 8 && !(bytes[offset] & marker)) { width++; marker >>= 1; }
  if (width > 8 || offset + width > bytes.length) throw new Error('Invalid EBML variable-length integer.');
  let value = keepMarker ? bytes[offset] : bytes[offset] & (marker - 1);
  let unknown = !keepMarker && value === marker - 1;
  for (let i = 1; i < width; i++) { value = value * 256 + bytes[offset + i]; unknown = unknown && bytes[offset + i] === 255; }
  return { width, value, unknown };
}

function itemAt(bytes, offset) {
  const id = vint(bytes, offset, true);
  const size = vint(bytes, offset + id.width);
  const data = offset + id.width + size.width;
  const end = size.unknown ? bytes.length : data + size.value;
  if (end > bytes.length) throw new Error('Truncated EBML element.');
  return { id: id.value, start: offset, sizeAt: offset + id.width, size, data, end };
}

function writeSize(bytes, offset, width, value) {
  const maximum = 2 ** (7 * width) - 2;
  if (!Number.isSafeInteger(value) || value > maximum) throw new Error('WebM duration metadata exceeds its size field.');
  for (let i = width - 1; i >= 0; i--) { bytes[offset + i] = value % 256; value = Math.floor(value / 256); }
  bytes[offset] |= 1 << (8 - width);
}

export function withWebMDuration(input, milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) throw new Error('Video duration must be positive.');
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let segment;
  for (let position = 0; position < bytes.length;) {
    const item = itemAt(bytes, position);
    if (item.id === 0x18538067) { segment = item; break; }
    position = item.end;
  }
  if (!segment) throw new Error('The recording is not a WebM Segment.');
  let info;
  for (let position = segment.data; position < segment.end;) {
    const item = itemAt(bytes, position);
    if (item.id === 0x114d9b74) throw new Error('Indexed WebM requires a full muxer for duration changes.');
    if (item.id === 0x1549a966) { info = item; break; }
    if (item.end <= position) throw new Error('Invalid WebM element order.');
    position = item.end;
  }
  if (!info || info.size.unknown) throw new Error('WebM recording lacks a finite Info element.');
  let timecodeScale = 1000000;
  let duration;
  for (let position = info.data; position < info.end;) {
    const item = itemAt(bytes, position);
    if (item.id === 0x2ad7b1) {
      timecodeScale = 0;
      for (let i = item.data; i < item.end; i++) timecodeScale = timecodeScale * 256 + bytes[i];
    }
    if (item.id === 0x4489) duration = item;
    position = item.end;
  }
  const ticks = milliseconds * 1000000 / timecodeScale;
  if (duration) {
    const copy = bytes.slice();
    const view = new DataView(copy.buffer, copy.byteOffset, copy.byteLength);
    if (duration.size.value === 8) view.setFloat64(duration.data, ticks, false);
    else if (duration.size.value === 4) view.setFloat32(duration.data, ticks, false);
    else throw new Error('Unsupported WebM duration float width.');
    return copy;
  }
  const addition = new Uint8Array(11);
  addition.set([0x44, 0x89, 0x88]);
  new DataView(addition.buffer).setFloat64(3, ticks, false);
  const result = new Uint8Array(bytes.length + addition.length);
  result.set(bytes.subarray(0, info.end));
  result.set(addition, info.end);
  result.set(bytes.subarray(info.end), info.end + addition.length);
  writeSize(result, info.sizeAt, info.size.width, info.size.value + addition.length);
  if (!segment.size.unknown) writeSize(result, segment.sizeAt, segment.size.width, segment.size.value + addition.length);
  return result;
}
