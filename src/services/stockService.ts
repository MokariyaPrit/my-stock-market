import { collection, getDocs, doc, updateDoc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
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

const globalSettingsRef = doc(db, "settings", "global");

export const updateGlobalStockPrices = async () => {
  try {
    const stocksRef = collection(db, "stocks");
    const snapshot = await getDocs(stocksRef);

    const updates = snapshot.docs.map(async (stockDoc) => {
      const stockData = stockDoc.data();
      const currentPrice = stockData.price as number;

      if (!currentPrice || isNaN(currentPrice)) return;

      const percentageChange = (Math.random() * 4 + 1) / 100;
      const direction = Math.random() > 0.5 ? 1 : -1;
      const priceChange = currentPrice * percentageChange * direction;
      const newPrice = Math.max(1, currentPrice + priceChange);

      await updateDoc(doc(db, "stocks", stockDoc.id), {
        price: Number(newPrice.toFixed(2)),
      });
    });

    await Promise.all(updates);
    await setDoc(globalSettingsRef, { lastUpdate: Date.now() }, { merge: true });
  } catch (error) {
    console.error("❌ Error updating global stock prices:", error);
  }
};

export const getLastUpdateTimestamp = async (): Promise<number> => {
  try {
    const docSnapshot = await getDoc(globalSettingsRef);
    return docSnapshot.exists() ? docSnapshot.data().lastUpdate || 0 : 0;
  } catch (error) {
    console.error("Error fetching last update timestamp:", error);
    return 0;
  }
};

// Real-time stock price subscription
export const subscribeToStockPrices = (callback: (stocks: Stock[]) => void): (() => void) => {
  const stocksRef = collection(db, "stocks");
  return onSnapshot(
    stocksRef,
    (snapshot) => {
      const stocks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Stock[];
      callback(stocks);
    },
    (error) => {
      console.error("Error in stock price subscription:", error);
      callback([]);
    }
  );
};

// Global price update management
const globalPriceUpdateInterval = 300000; // 5 minutes in milliseconds

export const manageGlobalPriceUpdates = async () => {
  try {
    const now = Date.now();
    const lastUpdate = await getLastUpdateTimestamp();

    if (now - lastUpdate >= globalPriceUpdateInterval) {
      console.log("Updating global stock prices...");
      await updateGlobalStockPrices();
      console.log("Global stock prices updated successfully.");
    } else {
      console.log("Skipping update. Last update was too recent.");
    }

    setTimeout(manageGlobalPriceUpdates, globalPriceUpdateInterval); // Schedule the next update
  } catch (error) {
    console.error("❌ Error managing global price updates:", error);
    setTimeout(manageGlobalPriceUpdates, globalPriceUpdateInterval); // Retry after interval
  }
};

// Call this function once to start the global price update cycle
export const startGlobalPriceUpdateCycle = () => {
  manageGlobalPriceUpdates();
};