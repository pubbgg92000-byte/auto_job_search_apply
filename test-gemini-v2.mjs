import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Hi");
    console.log("Success with gemini-flash-latest:", result.response.text());
  } catch (e) {
    console.error("Failed with gemini-flash-latest:", e.message);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
      const result = await model.generateContent("Hi");
      console.log("Success with gemini-3.5-flash:", result.response.text());
    } catch (e2) {
      console.error("Failed with gemini-3.5-flash:", e2.message);
    }
  }
}

test();
