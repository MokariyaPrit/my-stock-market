import { collection, getDocs, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  availableShares?: number;
}

// Fetch all stocks
export const getStocks = async (): Promise<Stock[]> => {
  try {
    const stocksRef = collection(db, "stocks");
    const snapshot = await getDocs(stocksRef);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      symbol: doc.data().symbol as string,
      name: doc.data().name as string,
      price: doc.data().price as number,
      availableShares: doc.data().availableShares as number,
    }));
  } catch (error) {
    console.error("❌ Error fetching stocks:", error);
    return [];
  }
};

// Update stock shares
export const updateStockShares = async (stockId: string, newShares: number): Promise<void> => {
  try {
    const stockRef = doc(db, "stocks", stockId);
    await updateDoc(stockRef, { availableShares: newShares });
  } catch (error) {
    console.error("❌ Error updating stock shares:", error);
    throw error;
  }
};

// Optimized stock price update with throttling
const updateStockPrices = async () => {
  const stocksRef = collection(db, "stocks");
  const snapshot = await getDocs(stocksRef);

  const updates = snapshot.docs.map(async (stockDoc) => {
    const stockData = stockDoc.data();
    const currentPrice = stockData.price as number;

    if (!currentPrice || isNaN(currentPrice)) return;

    const percentageChange = (Math.random() * 4 + 1) / 100; // 1% to 5%
    const direction = Math.random() > 0.5 ? 1 : -1;
    const priceChange = currentPrice * percentageChange * direction;
    let newPrice = Math.max(1, currentPrice + priceChange).toFixed(2);

    if (newPrice !== currentPrice.toFixed(2)) {
      await updateDoc(doc(db, "stocks", stockDoc.id), { price: Number(newPrice) });
    }
  });

  await Promise.all(updates);
};

// Real-time stock price subscription
export const subscribeToStockPrices = (callback: (stocks: Stock[]) => void): (() => void) => {
  const stocksRef = collection(db, "stocks");
  const unsubscribe = onSnapshot(
    stocksRef,
    (snapshot) => {
      const stocks = snapshot.docs.map((doc) => ({
        id: doc.id,
        symbol: doc.data().symbol as string,
        name: doc.data().name as string,
        price: doc.data().price as number,
        availableShares: doc.data().availableShares as number,
      }));
      callback(stocks);
    },
    (error) => {
      console.error("❌ Error in stock price subscription:", error);
      callback([]);
    }
  );

  return unsubscribe;
};

// Throttled price updates (every 10 minutes)
let lastUpdate = 0;
setInterval(async () => {
  const now = Date.now();
  if (now - lastUpdate >= 600000) { // 10 minutes = 600,000 milliseconds
    await updateStockPrices();
    lastUpdate = now;
  }
}, 1000); // Check every second