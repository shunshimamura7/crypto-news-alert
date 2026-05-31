import type { NewsItem } from "./cryptocompare";

const TELEGRAM_API = "https://api.telegram.org";

export async function sendNewsAlert(items: NewsItem[]): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHAT_ID!;

  for (const item of items) {
    const currencies =
      item.currencies.length > 0
        ? item.currencies.map((c) => `#${c}`).join(" ")
        : "#CRYPTO";

    const text = [
      `📰 <b>${escapeHtml(item.title)}</b>`,
      ``,
      `${currencies}`,
      `🔗 <a href="${item.url}">記事を読む</a>`,
      `📡 ${escapeHtml(item.source)}`,
    ].join("\n");

    try {
      const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("[telegram] Send failed:", JSON.stringify(err));
      }

      await sleep(1000);
    } catch (err) {
      console.error("[telegram] Request failed:", err);
    }
  }
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
