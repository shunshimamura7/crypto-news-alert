import { NewsItem } from "./cryptocompare";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID!;

function getIcon(score: number): string {
  if (score >= 80) return "🚀";
  if (score >= 50) return "🚨";
  return "📰";
}

function getScoreBar(score: number): string {
  // 0〜100スケールで10ブロック表示
  const filled = Math.round(score / 10);
  const empty  = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatMessage(item: NewsItem): string {
  const icon     = getIcon(item.score);
  const bar      = getScoreBar(item.score);
  const title    = escapeHtml(item.title);
  const tags     = item.currencies.map((c) => `#${c}`).join(" ");
  const label    = escapeHtml(item.scoreLabel);

  return [
    `${icon} <b>${title}</b>`,
    ``,
    `${label}`,
    `📊 ${bar} (${item.score}pt)`,
    tags ? tags : "",
    `🔗 <a href="${item.url}">記事を読む</a>  |  📡 ${escapeHtml(item.source)}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

async function sendMessage(text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id:    TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[telegram] sendMessage failed:", body);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendNewsAlerts(items: NewsItem[]): Promise<number> {
  // スコア高い順に最大10件
  const targets = items.slice(0, 10);
  let sent = 0;

  for (const item of targets) {
    const text = formatMessage(item);
    await sendMessage(text);
    sent++;
    await sleep(1000); // Telegram rate limit対策
  }

  return sent;
}
