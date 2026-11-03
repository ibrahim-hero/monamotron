import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from '../skill/monamotron/scripts/lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = parseArgs(process.argv.slice(2), { owner: 'value', 'dry-run': 'flag', help: 'flag' });

if (args.help) {
  console.log('Usage: node scripts/configure-github.mjs --owner YOUR_ACTUAL_GITHUB_USERNAME [--dry-run]');
  console.log('Fills repository/demo URLs in the README, guides, launch posts, and issue-form contacts.');
  console.log('This edits local files only; it does not create a repository or upload anything.');
} else {
  const owner = args.owner?.trim();
  if (!owner || owner.length > 39 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(owner)) {
    throw new Error('Use your actual GitHub username (1–39 letters/numbers, with single internal hyphens).');
  }
  const configPath = resolve(root, 'github.config.json');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const owners = [...new Set(['YOUR_GITHUB_USERNAME', config.owner].filter(Boolean))];
  const files = [
    'README.md', 'CONTRIBUTING.md', 'docs/GITHUB_PUBLISHING.md',
    'docs/GITHUB_LAUNCH_PLAYBOOK.md', 'docs/VIDEO_AND_MEDIA.md',
    'docs/LAUNCH_POSTS.md', '.github/ISSUE_TEMPLATE/config.yml',
  ];
  const changes = [];
  for (const file of files) {
    const path = resolve(root, file);
    const original = await readFile(path, 'utf8');
    let text = original;
    for (const oldOwner of owners) {
      text = text.replaceAll(`https://github.com/${oldOwner}/${config.repository}`, `https://github.com/${owner}/${config.repository}`);
      text = text.replaceAll(`https://${oldOwner}.github.io/${config.repository}`, `https://${owner}.github.io/${config.repository}`);
      text = text.replaceAll(`${oldOwner}/${config.repository}`, `${owner}/${config.repository}`);
    }
    if (text !== original) changes.push({ path, file, text });
  }
  if (args['dry-run']) {
    console.log(`Would configure ${owner}/${config.repository} in ${changes.length} files:`);
    changes.forEach(({ file }) => console.log(`  ${file}`));
  } else {
    for (const { path, text } of changes) await writeFile(path, text);
    config.owner = owner;
    config.repositoryUrl = `https://github.com/${owner}/${config.repository}`;
    config.demoUrl = `https://${owner}.github.io/${config.repository}/`;
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
    console.log(`Configured ${owner}/${config.repository}; updated ${changes.length} files.`);
    console.log(`Repository: ${config.repositoryUrl}`);
    console.log(`Demo after enabling Pages: ${config.demoUrl}`);
  }
}
