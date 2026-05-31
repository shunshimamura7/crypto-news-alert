export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  currencies: string[];
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

    // 過去24時間（本番は60分に戻す）
    const cutoff = Date.now() / 1000 - 24 * 60 * 60;

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
