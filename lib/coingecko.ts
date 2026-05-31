export async function getTop200Symbols(): Promise<string[]> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1&sparkline=false",
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);

    const coins = await res.json();
    return coins.map((c: { symbol: string }) => c.symbol.toUpperCase());
  } catch (err) {
    console.error("[coingecko] Failed to fetch top 200:", err);
    return ["BTC", "ETH", "BNB", "XRP", "SOL", "ADA", "DOGE", "TRX", "AVAX", "SHIB",
            "DOT", "LINK", "MATIC", "LTC", "UNI", "XLM", "ATOM", "XMR", "ETC", "FIL"];
  }
}
