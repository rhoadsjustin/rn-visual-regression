import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
app.use('/screenshots', express.static(path.resolve('./screenshots')));

app.get('/api/runs', (req, res) => {
  const runs = fs
    .readdirSync('./screenshots')
    .filter((f) => f.endsWith('-analysis.json'))
    .map((file) => {
      const name = file.replace('-analysis.json', '');
      const json = JSON.parse(fs.readFileSync(`./screenshots/${file}`, 'utf-8'));
      return {
        name,
        analysis: json.result,
        baseline: `/screenshots/${name}.png`,
        current: `/screenshots/diffs/${name}.png`,
        diff: `/screenshots/diffs/${name}-diff.png`,
      };
    });
  res.json(runs);
});

app.listen(3001, () => console.log('🧪 API server running at http://localhost:3001'));
