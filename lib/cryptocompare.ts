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

// ネガティブ絶対ドロップ
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
  'trap', 'at risk', 'short positions',
  'plunge', 'plunges', 'crash', 'crashes',
  'dump', 'dumps', 'selloff', 'sell-off',
  'liquidation', 'liquidations',
  'bear trap', 'dead cat', 'capitulation',
  'outflow', 'outflows',
  'delisting', 'delisted', 'warning', 'watchlist',
];

// 銘柄フルネーム→シンボル対応テーブル
const COIN_NAME_MAP: Record<string, string> = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'solana': 'SOL',
  'ripple': 'XRP',
  'cardano': 'ADA',
  'avalanche': 'AVAX',
  'dogecoin': 'DOGE',
  'polkadot': 'DOT',
  'chainlink': 'LINK',
  'polygon': 'MATIC',
  'stellar': 'XLM',
  'litecoin': 'LTC',
  'uniswap': 'UNI',
  'tron': 'TRX',
  'cosmos': 'ATOM',
  'monero': 'XMR',
  'filecoin': 'FIL',
  'aave': 'AAVE',
  'shiba inu': 'SHIB',
  'pepe': 'PEPE',
  'sui': 'SUI',
  'aptos': 'APT',
  'arbitrum': 'ARB',
  'optimism': 'OP',
  'near': 'NEAR',
  'injective': 'INJ',
  'render': 'RNDR',
  'hedera': 'HBAR',
  'vechain': 'VET',
  'algorand': 'ALGO',
};

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

// ヒットしたらスコア×0.5（最初のヒットのみ）
const SOFT_NEGATIVE_KEYWORDS: string[] = [
  'concerns', 'concern', 'delayed', 'delay', 'cautious', 'caution',
  'weak', 'weakness', 'decline', 'declines', 'slump', 'falls', 'drops',
  'down', 'losing', 'underperform', 'rejected', 'fails', 'fears', 'worry',
  'volatile', 'volatility', 'uncertain', 'uncertainty', 'pressure',
  'struggles', 'struggle',
];

// ソース信頼度
const SOURCE_HIGH = ['coindesk', 'reuters', 'bloomberg', 'theblock', 'cointelegraph', 'decrypt'];
const SOURCE_LOW  = ['bitcoinworld', 'ambcrypto', 'cryptopolitan', 'timestabloid', 'cointurken', 'utoday', 'coinotag'];

// "$XXX billion/million" / "USD XXX million" または "XXX億" を抽出してUSD換算
// $またはUSDが付いていない "257 Billion SHIB" 等は抽出しない
function extractAmount(text: string): number | null {
  const enMatch = text.match(/(?:\$|USD\s*)(\d+(?:\.\d+)?)\s*(billion|bn|million|m|b)\b/i);
  if (enMatch) {
    const value = parseFloat(enMatch[1]);
    const unit  = enMatch[2].toLowerCase();
    if (unit === 'billion' || unit === 'bn' || unit === 'b') return value * 1e9;
    if (unit === 'million' || unit === 'm')                  return value * 1e6;
  }
  const jaMatch = text.match(/(\d+(?:\.\d+)?)億/);
  if (jaMatch) return parseFloat(jaMatch[1]) * 1e8;
  return null;
}

function getScaleScore(amount: number): number {
  if (amount >= 10e9)  return 50;
  if (amount >= 1e9)   return 40;
  if (amount >= 500e6) return 30;
  if (amount >= 100e6) return 20;
  return 10;
}

const MIN_SCORE_WITH_SYMBOL    = 30;
const MIN_SCORE_WITHOUT_SYMBOL = 55;

// nullを返したらドロップ
function scoreNews(title: string): { score: number; label: string } | null {
  const lower  = title.toLowerCase();
  const first30 = lower.slice(0, 30);

  // ① ネガティブ絶対ドロップ
  for (const kw of DROP_KEYWORDS) {
    if (lower.includes(kw)) return null;
  }

  // ② カテゴリキャップ付きスコアリング（タイトル前半30文字なら×1.3）
  let mainScore  = 0;
  let bonusScore = 0;
  let topLabel   = "";
  let topScore   = -999;
  let first      = true;

  for (const rule of SCORING_RULES) {
    const matchedKw = rule.keywords.find((kw) => lower.includes(kw));
    if (matchedKw) {
      const posMultiplier = first30.includes(matchedKw) ? 1.3 : 1.0;
      if (first && rule.score > 0) {
        mainScore = Math.round(rule.score * posMultiplier);
        first = false;
      } else if (rule.score > 0) {
        // 2個目以降のポジティブは10%ボーナス
        bonusScore += Math.round(rule.score * 0.1 * posMultiplier);
      } else {
        // ネガティブはそのまま加算
        mainScore += rule.score;
      }
      if (rule.score > topScore) {
        topScore = rule.score;
        topLabel = rule.label;
      }
    }
  }

  // ③ 規模スコア加算
  const amount = extractAmount(title);
  if (amount !== null) {
    bonusScore += getScaleScore(amount);
  }

  // ④ ソフトネガティブ：最初のヒットでスコア×0.5
  let rawScore = mainScore + bonusScore;
  for (const kw of SOFT_NEGATIVE_KEYWORDS) {
    if (lower.includes(kw)) {
      rawScore = Math.round(rawScore * 0.5);
      break;
    }
  }

  // ⑤ 合計（0〜100クランプ）
  const total = Math.min(Math.max(0, rawScore), 100);

  // ⑥ 0以下はドロップ
  if (total <= 0) return null;

  return { score: total, label: topLabel };
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

// タイトルからフルネームで銘柄を検出してシンボルに変換
function matchCoinNames(title: string, top200Symbols: string[]): string[] {
  const lower = title.toLowerCase();
  const found: string[] = [];
  for (const [name, symbol] of Object.entries(COIN_NAME_MAP)) {
    if (lower.includes(name) && top200Symbols.includes(symbol)) {
      found.push(symbol);
    }
  }
  return found;
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

      const scored = scoreNews(article.title);
      if (scored === null) continue;

      // タグ・カテゴリからシンボルマッチ
      const tagText = `${article.categories} ${article.tags || ""}`.toUpperCase();
      const tagMatches = matchSymbols(tagText, top200Symbols);

      // タイトルからフルネームマッチ
      const nameMatches = matchCoinNames(article.title, top200Symbols);

      // 両方マージして重複排除
      const matchedSymbols = [...new Set([...tagMatches, ...nameMatches])];

      // ソース格付けによるスコア補正
      const srcLower = article.source.toLowerCase();
      let sourceMult = 1.0;
      if (SOURCE_HIGH.some((s) => srcLower.includes(s))) sourceMult = 1.2;
      else if (SOURCE_LOW.some((s) => srcLower.includes(s))) sourceMult = 0.8;
      const finalScore = Math.min(100, Math.round(scored.score * sourceMult));

      const hasSymbol = matchedSymbols.length > 0;
      const minScore  = hasSymbol ? MIN_SCORE_WITH_SYMBOL : MIN_SCORE_WITHOUT_SYMBOL;

      if (finalScore >= minScore) {
        results.push({
          id: `cc_${article.id}`,
          title: article.title,
          url: article.url,
          source: article.source,
          publishedAt: new Date(article.published_on * 1000).toISOString(),
          currencies: matchedSymbols,
          isImportant: finalScore >= 50,
          score: finalScore,
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
