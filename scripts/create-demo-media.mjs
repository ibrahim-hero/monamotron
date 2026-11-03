import { mkdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const media = resolve(root, 'docs/media');
const input = resolve(media, 'neural-network-demo.webm');
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';

function encode(args) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: 'inherit', windowsHide: true,
  });
  if (result.error) throw new Error(`Install FFmpeg or set FFMPEG_PATH to its executable. ${result.error.message}`);
  if (result.status !== 0) throw new Error(`FFmpeg exited with code ${result.status ?? result.signal}.`);
}

async function main() {
  await stat(input);
  const mp4 = resolve(media, 'neural-network-demo.mp4');
  const gif = resolve(media, 'neural-network-demo.gif');

  // MediaRecorder's time base can look like 1000 fps to FFmpeg. Set the delivery
  // frame rate explicitly while preserving the complete, normal-speed timeline.
  encode(['-i', input, '-vf', 'fps=24', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);

  // Lead with the finished board so even a still thumbnail is useful, then play
  // the explicitly accelerated 5x preview. The full video keeps its teaching pace.
  const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', mp4], { encoding: 'utf8', windowsHide: true });
  const duration = probe.stderr?.match(/Duration:\s+(\d+):(\d+):(\d+(?:\.\d+)?)/u);
  if (!duration) throw new Error('Could not read the encoded MP4 duration.');
  const seconds = Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]);
  const previewDuration = (1 + seconds / 5).toFixed(3);
  const inputs = ['-loop', '1', '-framerate', '10', '-t', '1', '-i', resolve(media, 'neural-network-preview.png'), '-i', mp4];
  const preview =
    '[0:v]fps=10,scale=960:-1:flags=lanczos,setpts=PTS-STARTPTS[cover];' +
    '[1:v]setpts=0.2*(PTS-STARTPTS),fps=10,scale=960:-1:flags=lanczos[motion];' +
    `[cover][motion]concat=n=2:v=1:a=0,trim=duration=${previewDuration}[preview];`;

  // Two passes avoid buffering the entire animation while calculating a palette.
  const scratch = resolve(root, '.artifacts/demo-media');
  await mkdir(scratch, { recursive: true });
  const palette = resolve(scratch, 'palette.png');
  encode([...inputs, '-filter_complex', preview + '[preview]palettegen=stats_mode=diff:max_colors=192:reserve_transparent=0[palette]',
    '-map', '[palette]', '-frames:v', '1', palette]);
  encode([...inputs, '-i', palette, '-filter_complex', preview + '[preview][2:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle[gif]',
    '-map', '[gif]', '-an', '-t', previewDuration, '-loop', '0', gif]);

  for (const path of [mp4, gif]) {
    console.log(`Created ${path}: ${((await stat(path)).size / 1048576).toFixed(2)} MiB.`);
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
