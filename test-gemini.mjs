import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

async function test() {
  const models = ["gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      console.log(`Success with ${m}:`, result.response.text());
      return;
    } catch (e) {
      console.error(`Failed with ${m}:`, e.message);
    }
  }
}

test();
