export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  currencies: string[];
  isImportant: boolean;
  score: number;
  scoreLabel: string;
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

interface KeywordRule {
  keywords: string[];
  score: number;
  label: string;
}

// ネガティブ絶対ドロップ（スコア計算前に排除）
const DROP_KEYWORDS: string[] = [
  'hack', 'hacked', 'hacking',
  'exploit', 'exploited',
  'stolen', 'drained',
  'rug pull', 'rugpull',
  'scam', 'fraud', 'phishing',
  'breach', 'attack',
  'bankruptcy', 'bankrupt', 'insolvent', 'insolvency',
  'collapse', 'collapsed',
  'shutdown', 'shuts down',
  'freezes withdrawals', 'suspend withdrawals',
  'exit scam',
];

// スコアリングルール（0〜100スケール、カテゴリキャップ制）
const SCORING_RULES: KeywordRule[] = [
  {
    score: 100,
    label: "🚀 取引所上場（確定）",
    keywords: [
      'listed on coinbase', 'coinbase listing',
      'listed on binance', 'binance listing',
      'listed on kraken', 'listed on upbit',
      'listed on bithumb', 'listed on bybit',
      'listed on okx', 'listed on kucoin',
      'new listing',
    ],
  },
  {
    score: 95,
    label: "🚀 ETF承認",
    keywords: [
      'etf approved', 'etf approval',
      'sec approves', 'sec approved etf',
      'spot etf', 'bitcoin etf approved',
      'ethereum etf approved',
    ],
  },
  {
    score: 90,
    label: "🚀 国家・政府採用",
    keywords: [
      'legal tender', 'national reserve',
      'strategic reserve', 'government adopts',
      'country adopts', 'nation adopts',
      'sovereign wealth',
    ],
  },
  {
    score: 88,
    label: "🚀 大手機関買い",
    keywords: [
      'blackrock buys', 'blackrock acquires',
      'fidelity buys', 'microstrategy buys',
      'adds bitcoin', 'adds crypto',
      'buys bitcoin', 'purchases bitcoin',
      'treasury buys', 'corporate treasury',
    ],
  },
  {
    score: 80,
    label: "🚀 大型提携・統合（大手）",
    keywords: [
      'partners with visa', 'partners with mastercard',
      'partners with paypal', 'partners with google',
      'partners with amazon', 'partners with apple',
      'partners with microsoft', 'partners with samsung',
      'visa integration', 'mastercard integration',
      'paypal integration',
    ],
  },
  {
    score: 78,
    label: "🚀 大型資金調達",
    keywords: [
      'raises $1 billion', 'raises $500 million',
      'raises $200 million', '$1b funding',
      '$500m funding', 'series c', 'series d',
    ],
  },
  {
    score: 70,
    label: "🚨 上場・規制承認",
    keywords: [
      'listing', 'listed', 'approved', 'approval',
      'sec approves', 'cftc approves',
      'regulatory approval', 'license granted', 'licensed',
    ],
  },
  {
    score: 68,
    label: "🚨 メジャーアップグレード",
    keywords: [
      'mainnet launch', 'mainnet upgrade',
      'major upgrade', 'protocol upgrade',
      'network upgrade', 'hard fork',
      'ethereum upgrade', 'layer 2 launch',
    ],
  },
  {
    score: 60,
    label: "🚨 大型提携",
    keywords: [
      'partnership', 'partners with',
      'collaboration', 'integrates with',
      'strategic partnership', 'joint venture',
      'signs deal',
    ],
  },
  {
    score: 58,
    label: "🚨 機関投資家動向",
    keywords: [
      'blackrock', 'fidelity', 'jpmorgan',
      'goldman sachs', 'morgan stanley',
      'hedge fund', 'institutional',
      'asset manager', 'investment fund',
    ],
  },
  {
    score: 55,
    label: "🚨 エアドロップ",
    keywords: [
      'airdrop', 'token distribution',
      'free tokens', 'snapshot',
    ],
  },
  {
    score: 45,
    label: "📰 規制・法律動向",
    keywords: [
      'sec', 'cftc', 'regulation', 'congress',
      'senate', 'legislation', 'crypto bill',
      'crypto law', 'framework', 'policy',
    ],
  },
  {
    score: 43,
    label: "📰 マクロ経済",
    keywords: [
      'fed cuts', 'rate cut', 'interest rate cut',
      'federal reserve cuts', 'fomc',
      'inflation data', 'cpi data', 'jobs report',
    ],
  },
  {
    score: 40,
    label: "📰 大型資金",
    keywords: [
      'billion', '$100 million', '$200 million',
      '$500 million', 'acquisition', 'acquired', 'merger',
    ],
  },
  {
    score: 38,
    label: "📰 焼却・供給削減",
    keywords: [
      'burn', 'token burn', 'buyback',
      'supply reduction', 'deflationary',
    ],
  },
  {
    score: -20,
    label: "⚠️ 規制禁止",
    keywords: [
      'ban', 'banned', 'bans crypto',
      'prohibits', 'crackdown',
      'enforcement action', 'charges',
      'lawsuit', 'sued',
    ],
  },
  {
    score: -10,
    label: "⚠️ ネガティブ規制",
    keywords: [
      'rejected', 'rejects', 'denies',
      'denied', 'blocks', 'blocked',
    ],
  },
];

const MIN_SCORE_WITH_SYMBOL    = 30;
const MIN_SCORE_WITHOUT_SYMBOL = 55;

// nullを返したらドロップ（通知しない）
function scoreNews(title: string): { score: number; label: string } | null {
  const lower = title.toLowerCase();

  // ① ネガティブ絶対ドロップ
  for (const kw of DROP_KEYWORDS) {
    if (lower.includes(kw)) return null;
  }

  // ② カテゴリキャップ付きスコアリング（各カテゴリ1回だけ加算）
  let totalScore = 0;
  let topLabel   = "";
  let topScore   = -999;

  for (const rule of SCORING_RULES) {
    const hit = rule.keywords.some((kw) => lower.includes(kw));
    if (hit) {
      totalScore += rule.score;
      if (rule.score > topScore) {
        topScore = rule.score;
        topLabel = rule.label;
      }
    }
  }

  // ③ スコアが0以下もドロップ
  if (totalScore <= 0) return null;

  // ④ 上限100キャップ
  const capped = Math.min(totalScore, 100);

  return { score: capped, label: topLabel };
}

function matchSymbols(text: string, symbols: string[]): string[] {
  return symbols.filter((s) => {
    if (s.length <= 3) {
      const regex = new RegExp(`(?<![A-Z])${s}(?![A-Z])`);
      return regex.test(text);
    }
    return text.includes(s);
  });
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
    const cutoff = Date.now() / 1000 - 60 * 60;
    const results: NewsItem[] = [];

    for (const article of articles) {
      if (article.published_on < cutoff) continue;

      // スコアリング（nullならドロップ）
      const scored = scoreNews(article.title);
      if (scored === null) continue;

      const text = `${article.categories} ${article.tags || ""}`.toUpperCase();
      const matchedSymbols = matchSymbols(text, top200Symbols);

      const hasSymbol = matchedSymbols.length > 0;
      const minScore  = hasSymbol ? MIN_SCORE_WITH_SYMBOL : MIN_SCORE_WITHOUT_SYMBOL;

      if (scored.score >= minScore) {
        results.push({
          id: `cc_${article.id}`,
          title: article.title,
          url: article.url,
          source: article.source,
          publishedAt: new Date(article.published_on * 1000).toISOString(),
          currencies: matchedSymbols,
          isImportant: scored.score >= 50,
          score: scored.score,
          scoreLabel: scored.label,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  } catch (err) {
    console.error("[cryptocompare] Failed to fetch news:", err);
    return [];
  }
}
