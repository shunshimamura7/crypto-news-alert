import { NextRequest, NextResponse } from "next/server";
import { getTop200Symbols } from "@/lib/coingecko";
import { fetchCryptoCompareNews } from "@/lib/cryptocompare";
import { filterUnsent, markAsSent } from "@/lib/kv";
import { sendNewsAlert } from "@/lib/telegram";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[cron] Starting news fetch...");

  try {
    const symbols = await getTop200Symbols();
    console.log(`[cron] Monitoring ${symbols.length} symbols`);

    const allNews = await fetchCryptoCompareNews(symbols);
    console.log(`[cron] Fetched ${allNews.length} scored articles`);

    if (allNews.length === 0) {
      return NextResponse.json({ sent: 0, message: "No news found" });
    }

    const allIds    = allNews.map((n) => n.id);
    const unsentIds = new Set(await filterUnsent(allIds));
    const newItems  = allNews.filter((n) => unsentIds.has(n.id));

    console.log(`[cron] ${newItems.length} new articles to send`);

    if (newItems.length === 0) {
      return NextResponse.json({ sent: 0, message: "All already sent" });
    }

    const toSend = newItems.slice(0, 10);

    // ログ：送信内容を記録
    toSend.forEach((n) => {
      console.log(`[cron] Sending: [${n.score}pt] ${n.scoreLabel} | ${n.title}`);
    });

    const sent = await sendNewsAlert(toSend);
    await markAsSent(toSend.map((n) => n.id));

    console.log(`[cron] Done. Sent ${sent}/${toSend.length} alerts`);
    return NextResponse.json({ sent, titles: toSend.map((n) => n.title) });
  } catch (err) {
    console.error("[cron] Fatal error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
