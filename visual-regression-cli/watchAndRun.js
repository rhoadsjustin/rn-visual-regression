import chokidar from 'chokidar';
import fs from 'fs';
import pixelmatch from 'pixelmatch';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const SCREENSHOTS_DIR = './screenshots';
const watcher = chokidar.watch(SCREENSHOTS_DIR, {
  ignored: /(^|[/\\])\../,
  persistent: true,
  ignoreInitial: false,
});

watcher.on('add', async (filePath) => {
  if (!filePath.endsWith('.png')) return;
  if (!filePath.includes('-current.png')) return;

  const parsed = path.parse(filePath);
  const flowName = path.basename(filePath).replace('-current.png', '');
  const flowDir = path.dirname(filePath);
  const buildDir = path.basename(path.dirname(flowDir));
  const baselinePath = path.join(flowDir, `${flowName}-baseline.png`);
  const diffPath = path.join(flowDir, `${flowName}-diff.png`);
  const metricsPath = path.join(flowDir, `${flowName}-metrics.json`);

  if (!fs.existsSync(baselinePath)) {
    console.warn(`⚠️  Baseline not found for ${flowName}, skipping diff.`);
    return;
  }

  const img1 = await loadImage(baselinePath);
  const img2 = await loadImage(filePath);
  const width = img1.width;
  const height = img1.height;

  const canvas1 = createCanvas(width, height);
  const canvas2 = createCanvas(width, height);
  const ctx1 = canvas1.getContext('2d');
  const ctx2 = canvas2.getContext('2d');
  ctx1.drawImage(img1, 0, 0);
  ctx2.drawImage(img2, 0, 0);

  const imgData1 = ctx1.getImageData(0, 0, width, height);
  const imgData2 = ctx2.getImageData(0, 0, width, height);

  const diffCanvas = createCanvas(width, height);
  const diffCtx = diffCanvas.getContext('2d');
  const diffData = diffCtx.createImageData(width, height);

  let boundingBox = { top: height, left: width, right: 0, bottom: 0 };

  const diffPixelCount = pixelmatch(imgData1.data, imgData2.data, diffData.data, width, height, {
    threshold: 0.1,
    includeAA: true,
    diffMask: false,
  });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (diffData.data[i] !== 0 || diffData.data[i + 1] !== 0 || diffData.data[i + 2] !== 0) {
        boundingBox.top = Math.min(boundingBox.top, y);
        boundingBox.bottom = Math.max(boundingBox.bottom, y);
        boundingBox.left = Math.min(boundingBox.left, x);
        boundingBox.right = Math.max(boundingBox.right, x);
      }
    }
  }

  diffCtx.putImageData(diffData, 0, 0);
  const out = fs.createWriteStream(diffPath);
  const stream = diffCanvas.createPNGStream();
  stream.pipe(out);
  await new Promise((resolve) => out.on('finish', resolve));

  const percentChanged = (diffPixelCount / (width * height)) * 100;
  const metrics = {
    pixelDiff: diffPixelCount,
    percent: Number(percentChanged.toFixed(2)),
    boundingBox,
  };

  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  console.log(
    `✅ [${buildDir}] ${flowName} | Diff: ${metrics.percent}% | Pixels: ${metrics.pixelDiff}`
  );
});
