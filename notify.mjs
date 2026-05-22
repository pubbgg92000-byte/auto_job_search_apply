import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
    }),
  });
  return response.json();
}

async function notify() {
  if (!TOKEN || !CHAT_ID) {
    console.error('Error: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing in .env');
    process.exit(1);
  }

  const trackerPath = path.join(process.cwd(), 'data/applications.md');
  if (!fs.existsSync(trackerPath)) {
    console.error('Error: data/applications.md not found');
    process.exit(1);
  }

  const content = fs.readFileSync(trackerPath, 'utf8');
  const lines = content.split('\n').filter(line => line.startsWith('|') && !line.includes('Date') && !line.includes('---'));
  
  if (lines.length === 0) {
    await sendTelegramMessage('📊 *Career-Ops Update*\nNo applications tracked yet.');
    return;
  }

  let message = '📊 *Career-Ops: Current Applications*\n\n';
  lines.forEach(line => {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 7) {
      const id = parts[1];
      const company = parts[3];
      const role = parts[4];
      const score = parts[5];
      const status = parts[6];
      message += `*#${id} ${company}*\nRole: ${role}\nScore: ${score} | Status: ${status}\n\n`;
    }
  });

  const res = await sendTelegramMessage(message);
  if (res.ok) {
    console.log('✅ Update sent to Telegram!');
  } else {
    console.error('❌ Failed to send Telegram message:', res);
  }
}

notify();
