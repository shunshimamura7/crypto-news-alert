import type { NewsItem } from "./cryptopanic";

interface CCNewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  published_on: number;
  categories: string;
  tags?: string;
}

export async function fetchCryptoCompareNews(symbols: string[]): Promise<NewsItem[]> {
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(apiKey ? { authorization: `Apikey ${apiKey}` } : {}),
  };

  try {
    const res = await fetch(
      "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest",
      { headers }
    );

    if (!res.ok) throw new Error(`CryptoCompare error: ${res.status}`);

    const data = await res.json();
    const articles: CCNewsArticle[] = data.Data || [];

    const cutoff = Date.now() / 1000 - 30 * 60;

    return articles
      .filter((article) => {
        if (article.published_on < cutoff) return false;
        const text = `${article.categories} ${article.tags || ""}`.toUpperCase();
        return symbols.some((s) => text.includes(s));
      })
      .map((article) => ({
        id: `cc_${article.id}`,
        title: article.title,
        url: article.url,
        source: article.source,
        publishedAt: new Date(article.published_on * 1000).toISOString(),
        currencies: symbols.filter((s) =>
          `${article.categories} ${article.tags || ""}`.toUpperCase().includes(s)
        ),
      }));
  } catch (err) {
    console.error("[cryptocompare] Failed to fetch news:", err);
    return [];
  }
}
