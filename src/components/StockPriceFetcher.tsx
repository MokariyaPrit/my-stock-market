import { useEffect, useState } from "react";

const stockSymbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"];
const UPDATE_HOURS = [9, 11, 14, 17]; // 9 AM, 11 AM, 2 PM, 5 PM

async function fetchStockPrice(symbol: string) {
  const url = `http://localhost:5000/api/stock/${symbol}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) throw new Error(data.error);

    return { symbol, price: data.price };
  } catch (error) {
    console.error("Error fetching stock price:", error);
    return { symbol, price: "N/A" };
  }
}

export default function StockPriceFetcher() {
  const [stocks, setStocks] = useState<{ symbol: string; price: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>("");

  function getNextUpdateTime() {
    const now = new Date();
    const currentHour = now.getHours();


    let nextUpdateHour = UPDATE_HOURS.find((hour) => hour > currentHour);
    if (!nextUpdateHour) nextUpdateHour = UPDATE_HOURS[0]; // If past last update, set for tomorrow

    const nextUpdate = new Date();
    nextUpdate.setHours(nextUpdateHour, 0, 0, 0);

    if (nextUpdateHour <= currentHour) {
      nextUpdate.setDate(nextUpdate.getDate() + 1);
    }

    return nextUpdate;
  }

  function updateTimeLeft() {
    const now = new Date();
    const nextUpdate = getNextUpdateTime();
    const timeDiff = nextUpdate.getTime() - now.getTime();

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    setTimeLeft(`${hours}h ${minutes}m`);
  }

  async function getStockPrices() {
    const stockData = await Promise.all(
      stockSymbols.map((symbol) => fetchStockPrice(symbol))
    );
    setStocks(stockData);
  }

  useEffect(() => {
    getStockPrices();
    updateTimeLeft();

    // Set interval to update countdown every minute
    const interval = setInterval(() => {
      updateTimeLeft();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const now = new Date();
    const nextUpdate = getNextUpdateTime();
    const timeUntilNextUpdate = nextUpdate.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      getStockPrices();
    }, timeUntilNextUpdate);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div>
      <h2>Stock Prices</h2>
      <p>Next update in: {timeLeft}</p>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.symbol}>
            {stock.symbol}: ₹{stock.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
