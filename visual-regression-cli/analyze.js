import 'dotenv/config';
import fs from 'fs';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function analyze({ name, baselinePath, currentPath, diffPath }) {
  console.log(`🧠 Analyzing '${name}' with OpenAI...`);

  const images = [
    fs.readFileSync(baselinePath).toString('base64'),
    fs.readFileSync(currentPath).toString('base64'),
    fs.readFileSync(diffPath).toString('base64'),
  ];

  const messages = [
    {
      role: 'system',
      content:
        'You are a UI testing assistant. Analyze visual UI differences and suggest whether changes are cosmetic, risky, or broken.',
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Analyze UI screenshots for '${name}'. What changed and how critical is it?`,
        },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${images[0]}` } },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${images[1]}` } },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${images[2]}` } },
      ],
    },
  ];

  const chat = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature: 0.4,
  });

  const result = chat.choices[0].message.content;
  const jsonPath = `./screenshots/${name}-analysis.json`;
  fs.writeFileSync(jsonPath, JSON.stringify({ result }, null, 2));
  console.log(`✅ Analysis written to ${jsonPath}`);
}
