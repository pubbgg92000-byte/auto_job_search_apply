import 'dotenv/config';

const GEMINI_KEY = process.env.GEMINI_API_KEY;

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Hi" }] }]
    })
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
