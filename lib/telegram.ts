import type { NewsItem } from "./cryptocompare";

const TELEGRAM_API = "https://api.telegram.org";

function getIcon(score: number): string {
  if (score >= 80) return "🚀";
  if (score >= 50) return "🚨";
  return "📰";
}

function buildScoreBar(score: number): string {
  // 10ブロック・10pt刻み（1行に収まる）
  const clamped = Math.max(0, Math.min(100, score));
  const filled  = Math.round(clamped / 10);
  const empty   = 10 - filled;
  const block   = score >= 80 ? "🟥" : score >= 50 ? "🟧" : "🟨";
  return `${score}/100 ${block.repeat(filled)}${"░".repeat(empty)}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendNewsAlert(items: NewsItem[]): Promise<number> {
  const token  = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHAT_ID!;
  let sent = 0;

  for (const item of items) {
    const icon       = getIcon(item.score);
    const scoreBar   = buildScoreBar(item.score);
    const currencies = item.currencies.length > 0
      ? item.currencies.map((c) => `#${c}`).join(" ")
      : "#CRYPTO";
    const labelLine  = item.scoreLabel ? escapeHtml(item.scoreLabel) : "";

    const lines = [
      `${icon} <b>${escapeHtml(item.title)}</b>`,
      ``,
      labelLine,
      `📊 ${scoreBar}`,
      currencies,
      `🔗 <a href="${item.url}">記事を読む</a>  |  📡 ${escapeHtml(item.source)}`,
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("[telegram] Send failed:", JSON.stringify(err));
      } else {
        sent++;
      }

      await sleep(1000);
    } catch (err) {
      console.error("[telegram] Request failed:", err);
    }
  }

  return sent;
}
