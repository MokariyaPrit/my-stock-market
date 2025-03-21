import axios from "axios";

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

const cache: { [key: string]: { price: number; time: number } } = {}; // ✅ Store recent API results

export const getStockPricesFromAPI = async (symbol: string) => {
  const now = Date.now();
  const cacheEntry = cache[symbol];

  // ✅ Use cached price if it was fetched in the last 30 seconds
  if (cacheEntry && now - cacheEntry.time < 30000) {
    console.log(`✅ Using cached price for ${symbol}`);
    return { symbol, price: cacheEntry.price, time: cacheEntry.time };
  }

  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        function: "TIME_SERIES_INTRADAY",
        symbol: symbol,
        interval: "5min",
        apikey: API_KEY,
      },
    });

    const data = response.data;
    if (data["Time Series (5min)"]) {
      const latestTime = Object.keys(data["Time Series (5min)"])[0];
      const stockInfo = data["Time Series (5min)"][latestTime];

      const newPrice = parseFloat(stockInfo["1. open"]); // Convert price to number

      // ✅ Save to cache
      cache[symbol] = { price: newPrice, time: now };

      return { symbol, price: newPrice, time: latestTime };
    } else {
      console.error("Invalid API Response:", data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching stock price:", error);
    return null;
  }
};
