export async function fetchStockPrice(symbol: string) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.BO`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (!data.chart || !data.chart.result) {
        throw new Error("Invalid response from API");
      }
  
      // Extract latest stock price
      const meta = data.chart.result[0].meta;
      const latestPrice = meta.regularMarketPrice;
  
      return { symbol, price: latestPrice };
    } catch (error) {
      console.error("Error fetching stock price:", error);
      return { symbol, price: "N/A" };
    }
  }
  