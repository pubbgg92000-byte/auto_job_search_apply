import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

let lastUpdateId = 0;

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
    }),
  });
}

async function handleMessage(msg) {
  const text = msg.text;
  if (!text) return;

  console.log(`📩 Received: ${text}`);

  if (text.startsWith('/start')) {
    await sendTelegramMessage("🤖 *Career-Ops Interactive Agent Online*\n\nI am your job search command center. You can chat with me, ask for status updates, or send me job URLs to evaluate.\n\nCommands:\n/status - Current applications\n/scan - Run a fresh job scan\n/help - See what I can do");
    return;
  }

  if (text.startsWith('/status')) {
    const trackerPath = path.join(process.cwd(), 'data/applications.md');
    if (!fs.existsSync(trackerPath)) {
      await sendTelegramMessage("❌ No applications found.");
      return;
    }
    const content = fs.readFileSync(trackerPath, 'utf8');
    await sendTelegramMessage(`📊 *Current Status:*\n\n${content.split('\n').slice(0, 10).join('\n')}`);
    return;
  }

  // General Chat with Gemini
  try {
    const prompt = `You are the Career-Ops AI Agent. You help the user (Arvind) with his job search. 
    Context: Arvind is a Frontend Developer & AI Automation Builder. He is targeting 10-15 LPA roles in India.
    Current Task: Be helpful, direct, and slightly technical.
    
    User says: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    await sendTelegramMessage(response.text());
  } catch (error) {
    console.error("Gemini Error:", error);
    await sendTelegramMessage("⚠️ I'm having trouble thinking right now. Check my console logs.");
  }
}

async function poll() {
  const url = `https://api.telegram.org/bot${TG_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        if (update.message && update.message.chat.id.toString() === CHAT_ID) {
          await handleMessage(update.message);
        }
      }
    }
  } catch (error) {
    console.error("Polling Error:", error);
  }
  
  // Continuous polling
  setTimeout(poll, 1000);
}

console.log("🚀 Interactive Telegram Agent is starting...");
sendTelegramMessage("✅ *Interactive Agent Online.* How can I help you with your career today, Arvind?");
poll();
