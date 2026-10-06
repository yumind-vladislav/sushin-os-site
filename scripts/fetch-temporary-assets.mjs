// Downloads the temporary third-party assets used on localhost only: ryOS icons,
// the Rover sprite and the 21st.dev Morph Gallery photos. They are gitignored
// because the repository is public — see ICON_LICENSES.md.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'public');

const icons = [
  'contacts', 'mac', 'file-pdf', 'applications', 'dictionary', 'sites', 'chats', 'mail',
  'automator', 'stickies', 'calendar', 'calculator', 'minesweeper-app', 'synth', 'paint',
  'ipod', 'winamp', 'videos', 'assistant', 'trash-empty',
];

const wallpapers = {
  forest: ['eceae69f56b5b3e29b9372032b5c22e96bd5fc9c167ce072813868aa871d52af', '69dbb246d917da410f7e79e87e53aaf6302023baa9db05f1075fca5bcb255410'],
  'night-peak': ['95b854c8c5fc73249ba12e729548a432ff171dab87d960e2aaf098f1db941828', '3d637a6ebf76a17643434f0a6939ae4a0e15853797ba886588071bf792dd12d9'],
  lake: ['15a4a367001c723a22cc1f5b480cfdc6abc1e50fdf87e0555ddd324f404fb98a', 'b88e4af2580633f65cd2fce4867c647be4e317e3bf54c47dac854aab211e6dde'],
  hills: ['6947b2d1b15fc6614fe30af02282fe6418b3c43556fbfe6ad8e2fa16c72ae700', 'e025ceb111646f4030ac36225aa4997e5024d098c4c939c409cddd281bd2c314'],
  wildflowers: ['40907f0afb67e9bf2767a5982d24f0d56e6f49dd12b859cf92eb9b3b9771f4a4', '38b66ef8fe46060a916db605710e709522a9534ff72aa549c1233c543f0a92a9'],
  beach: ['ef4b96d0e0de49e89f600b77edbe0a150e1f93f8ba92ae1422d285d267b7bd47', 'f8ee65346d7a36d4a795ca4628042627baa2f3f5e1c79d1dd471f874c8a6f0a4'],
};

const mirror = (hash) => `https://cdn.21st.dev/assets/mirror/${hash.slice(0, 2)}/${hash}.jpg`;

const jobs = [
  ...icons.map((name) => [`https://os.ryo.lu/icons/macosx/${name}.png`, `icons/ryos/${name}.png`]),
  ['https://os.ryo.lu/assets/assistant/rover/map.png', 'assistant/rover/map.png'],
  ['https://os.ryo.lu/assets/assistant/rover/agent.json', 'assistant/rover/agent.json'],
  ...Object.entries(wallpapers).flatMap(([name, [full, thumb]]) => [
    [mirror(full), `wallpapers/morph/${name}.jpg`],
    [mirror(thumb), `wallpapers/morph/${name}-thumb.jpg`],
  ]),
];

let failed = 0;
for (const [url, target] of jobs) {
  const destination = path.join(root, target);
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 sushin-os-local-setup' } });
    if (!response.ok) throw new Error(String(response.status));
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    failed += 1;
    console.error(`failed ${target}: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

console.log(`temporary assets: ${jobs.length - failed}/${jobs.length} downloaded`);
if (failed) process.exitCode = 1;
