import chokidar from 'chokidar';
import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import path from 'path';

const SCREENSHOTS_DIR = './screenshots';
const DIFF_DIR = path.join(SCREENSHOTS_DIR, 'diffs');
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR);
if (!fs.existsSync(DIFF_DIR)) fs.mkdirSync(DIFF_DIR);

const watcher = chokidar.watch(SCREENSHOTS_DIR, {
  ignored: /(^|[/\\])\../,
  persistent: true,
  ignoreInitial: false,
});

const baselineMap = new Map();

watcher.on('add', async (filePath) => {
  if (!filePath.endsWith('.png')) return;
  const fileName = path.basename(filePath);
  const name = fileName.replace(/\.png$/, '');

  if (!baselineMap.has(name)) {
    baselineMap.set(name, filePath);
    console.log(`📸 Saved baseline: ${fileName}`);
    return;
  }

  const baselinePath = baselineMap.get(name);
  const currentPath = filePath;
  const diffPath = path.join(DIFF_DIR, `${name}-diff.png`);

  const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
  const img2 = PNG.sync.read(fs.readFileSync(currentPath));
  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  console.log(`🟢 ${name}: ${diffPixels} pixels changed.`);
  if (diffPixels > 0) {
    const analyze = await import('./analyze.js');
    await analyze.default({ name, baselinePath, currentPath, diffPath });
  }
});
