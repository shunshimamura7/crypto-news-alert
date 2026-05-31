export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  currencies: string[];
  votes?: number;
}

interface CryptoPanicPost {
  id: number;
  title: string;
  url: string;
  source: { title: string };
  published_at: string;
  currencies?: { code: string }[];
  votes?: { positive: number; negative: number; important: number };
}

const MIN_VOTES = 3;

export async function fetchCryptoPanicNews(symbols: string[]): Promise<NewsItem[]> {
  const apiKey = process.env.CRYPTOPANIC_API_KEY;
  const baseUrl = "https://cryptopanic.com/api/v1/posts/";

  const params = new URLSearchParams({
    ...(apiKey ? { auth_token: apiKey } : {}),
    public: "true",
    kind: "news",
    filter: "rising",
  });

  try {
    const res = await fetch(`${baseUrl}?${params}`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`CryptoPanic error: ${res.status}`);

    const data = await res.json();
    const posts: CryptoPanicPost[] = data.results || [];

    const symbolSet = new Set(symbols);

    return posts
      .filter((post) => {
        const postCurrencies = post.currencies?.map((c) => c.code.toUpperCase()) || [];
        const hasMatchingCurrency =
          postCurrencies.length === 0 ||
          postCurrencies.some((c) => symbolSet.has(c));

        const totalVotes =
          (post.votes?.positive || 0) +
          (post.votes?.important || 0);
        const hasEnoughVotes = !apiKey || totalVotes >= MIN_VOTES;

        return hasMatchingCurrency && hasEnoughVotes;
      })
      .map((post) => ({
        id: `cp_${post.id}`,
        title: post.title,
        url: post.url,
        source: post.source.title,
        publishedAt: post.published_at,
        currencies: post.currencies?.map((c) => c.code.toUpperCase()) || [],
        votes: (post.votes?.positive || 0) + (post.votes?.important || 0),
      }));
  } catch (err) {
    console.error("[cryptopanic] Failed to fetch news:", err);
    return [];
  }
}
