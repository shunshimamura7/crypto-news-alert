export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  currencies: string[];
  isImportant: boolean;
}

interface CCNewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  published_on: number;
  categories: string;
  tags?: string;
}

// 価格に大きく影響する重要キーワード
const IMPORTANT_KEYWORDS = [
  // 規制・法律
  'sec', 'etf', 'regulation', 'ban', 'banned', 'lawsuit', 'legal', 'congress', 'senate', 'court',
  'approved', 'approval', 'rejected', 'legislation', 'enforcement',
  // セキュリティ
  'hack', 'hacked', 'exploit', 'breach', 'stolen', 'vulnerability', 'attack', 'drain',
  // 企業・市場
  'bankruptcy', 'bankrupt', 'insolvency', 'insolvent', 'delist', 'delisted', 'listing', 'listed',
  'acquisition', 'acquired', 'merger', 'partnership', 'collapse', 'shutdown',
  // マクロ経済
  'fed', 'federal reserve', 'interest rate', 'inflation', 'recession', 'fomc',
  // チェーン固有イベント
  'halving', 'fork', 'upgrade', 'mainnet', 'launch', 'airdrop',
  // 大型資金
  'billion', 'investment', 'fund', 'treasury', 'reserve', 'custody',
  // 大手企業
  'blackrock', 'fidelity', 'jpmorgan', 'goldman', 'microsoft', 'apple', 'tesla', 'coinbase', 'binance',
];

function isImportantNews(title: string): boolean {
  const lower = title.toLowerCase();
  return IMPORTANT_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function fetchCryptoCompareNews(
  top200Symbols: string[]
): Promise<NewsItem[]> {
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(apiKey ? { authorization: `Apikey ${apiKey}` } : {}),
  };

  try {
    const res = await fetch(
      "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular",
      { headers }
    );

    if (!res.ok) throw new Error(`CryptoCompare error: ${res.status}`);

    const data = await res.json();
    const articles: CCNewsArticle[] = data.Data || [];

    // 過去60分以内
    const cutoff = Date.now() / 1000 - 60 * 60;

    const results: NewsItem[] = [];

    for (const article of articles) {
      if (article.published_on < cutoff) continue;

      const text = `${article.categories} ${article.tags || ""}`.toUpperCase();
      const important = isImportantNews(article.title);

      // Top200銘柄に関連する → 通知
      const matchedSymbols = top200Symbols.filter((s) => text.includes(s));
      if (matchedSymbols.length > 0) {
        results.push({
          id: `cc_${article.id}`,
          title: article.title,
          url: article.url,
          source: article.source,
          publishedAt: new Date(article.published_on * 1000).toISOString(),
          currencies: matchedSymbols,
          isImportant: important,
        });
        continue;
      }

      // Top200外でも重要キーワードがあれば通知
      if (important) {
        results.push({
          id: `cc_${article.id}`,
          title: article.title,
          url: article.url,
          source: article.source,
          publishedAt: new Date(article.published_on * 1000).toISOString(),
          currencies: [],
          isImportant: true,
        });
      }
    }

    // 重要ニュースを先頭に
    return results.sort((a, b) => Number(b.isImportant) - Number(a.isImportant));
  } catch (err) {
    console.error("[cryptocompare] Failed to fetch news:", err);
    return [];
  }
}
