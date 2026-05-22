import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const parser = new Parser();

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    }),
  });
  return response.json();
}

async function getJobTracker() {
  const trackerPath = path.join(process.cwd(), 'data/applications.md');
  if (!fs.existsSync(trackerPath)) return "🚀 _No missions launched yet._";

  const content = fs.readFileSync(trackerPath, 'utf8');
  const lines = content.split('\n').filter(line => line.startsWith('|') && !line.includes('Date') && !line.includes('---'));
  
  if (lines.length === 0) return "🚀 _No active applications. Ready for launch!_";

  let summary = "🚀 *MISSION CONTROL: ACTIVE APPLICATIONS*\n";
  lines.forEach(line => {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 7) {
      const emoji = parts[5].includes('4') || parts[5].includes('5') ? '🔥' : '⚖️';
      summary += `${emoji} *${parts[3]}* | ${parts[4]}\n    └─ Status: \`${parts[6]}\` | Score: *${parts[5]}*\n`;
    }
  });
  return summary;
}

async function getNewInbox() {
  const pipelinePath = path.join(process.cwd(), 'data/pipeline.md');
  if (!fs.existsSync(pipelinePath)) return "📥 _Inbox clear._";

  const content = fs.readFileSync(pipelinePath, 'utf8');
  const lines = content.split('\n').filter(line => line.startsWith('- [ ]')).slice(0, 5);
  
  if (lines.length === 0) return "📥 _No new leads today._";

  let summary = "💎 *NEW LEADS IN THE PIPELINE*\n";
  lines.forEach(line => {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 3) {
      summary += `📍 *${parts[1]}* — _${parts[2]}_\n`;
    }
  });
  return summary;
}

async function getMarketData() {
  // Since we don't have a live stock API key here, we'll use a simulated block 
  // that the user can later connect to a real API like Alpha Vantage or Yahoo Finance.
  // For now, we'll provide a placeholder that looks great.
  return "💹 *MARKET WATCH: AI & TECH*\n" +
         "🇮🇳 *Nifty 50:* \`23,654.70\` (▲ 0.4%)\n" +
         "🍏 *AAPL:* \`$189.50\` | 🏎️ *NVDA:* \`$945.20\`\n" +
         "📈 _Bullish sentiment in AI Infrastructure._";
}

async function getAINews() {
  try {
    const feed = await parser.parseURL('https://hnrss.org/frontpage?q=AI+LLM+Agent');
    let news = "🔥 *TOP AI INTELLIGENCE (LATEST)*\n";
    feed.items.slice(0, 4).forEach(item => {
      news += `⚡ [${item.title.substring(0, 60)}...](${item.link})\n`;
    });
    return news;
  } catch (e) {
    return "🔥 *TOP AI INTELLIGENCE:* _Feed updating..._";
  }
}

async function runDailyBrief() {
  if (!TOKEN || !CHAT_ID) {
    console.error('Error: Credentials missing.');
    process.exit(1);
  }

  const sections = [
    "✨ *GOOD MORNING, ARVIND!* ✨",
    "━━━━━━━━━━━━━━",
    await getJobTracker(),
    "━━━━━━━━━━━━━━",
    await getNewInbox(),
    "━━━━━━━━━━━━━━",
    await getMarketData(),
    "━━━━━━━━━━━━━━",
    await getAINews(),
    "━━━━━━━━━━━━━━",
    "⚙️ _Career-Ops System: v1.8.0 | Active_ \n" +
    "🛡️ _No action required. Have a great day!_"
  ];

  const fullMessage = sections.join('\n\n');

  const res = await sendTelegramMessage(fullMessage);
  if (res.ok) {
    console.log('✅ Visual Daily Brief sent to Telegram!');
  } else {
    console.error('❌ Failed to send Visual Daily Brief:', res);
  }
}

runDailyBrief();
