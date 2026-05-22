import 'dotenv/config';

const GEMINI_KEY = process.env.GEMINI_API_KEY;

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
