import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import multer from 'multer';
import { exec } from 'child_process';

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.json());
app.use('/screenshots', express.static(path.resolve('./screenshots')));

// New endpoint to get grouped runs
app.get('/api/runs', (req, res) => {
  const root = './screenshots';
  const builds = fs
    .readdirSync(root)
    .filter((dir) => fs.statSync(path.join(root, dir)).isDirectory());
  const result = builds.map((build) => {
    const flows = fs
      .readdirSync(path.join(root, build))
      .filter((f) => fs.statSync(path.join(root, build, f)).isDirectory());
    return { build, flows };
  });
  res.json(result);
});

// Endpoint to receive images and trigger analysis
app.post('/api/upload-finished', upload.array('images'), (req, res) => {
  const flowName = req.query.flowName || 'default';
  const build = req.query.build || 'latest';
  const targetDir = path.join('screenshots', build, flowName);

  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  console.log(
    `📩 Upload received for build: ${build} | flow: ${flowName} - ${req.files.length} files`
  );

  for (const file of req.files) {
    const targetPath = path.join(targetDir, file.originalname);
    fs.renameSync(file.path, targetPath);
    console.log(`✅ Saved to ${targetPath}`);
  }

  exec(`node analyze.js ${path.join(build, flowName)}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Analysis error: ${error.message}`);
      return res.status(500).send('Error triggering analysis');
    }
    console.log(`✅ Analysis triggered\n${stdout}`);
    res.send('Analysis complete');
  });
});

app.listen(3001, () => console.log('🧪 API server running at http://localhost:3001'));
