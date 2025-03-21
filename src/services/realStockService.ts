// import axios from "axios";
// import { Stock } from "../types/stock";
// import { db } from "../firebase";
// import { doc, setDoc, getDoc } from "firebase/firestore";

// const nameMap: { [key: string]: string } = {
//   "RELIANCE": "Reliance Industries",
//   "TCS": "Tata Consultancy Services",
//   "HDFCBANK": "HDFC Bank",
//   "INFY": "Infosys",
//   "ICICIBANK": "ICICI Bank",
// };

// const API_KEY = "AVGC6PO3YSKGUBBR"; // Replace with your actual key
// const SYMBOLS = ["RELIANCE.BO", "TCS.BO", "HDFCBANK.BO", "INFY.BO", "ICICIBANK.BO"];
// const DAILY_CALL_LIMIT = 5;

// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// // Extend Stock interface to include lastUpdated (optional in types/stock.ts)
// interface StockWithTimestamp extends Stock {
//   lastUpdated: string; // ISO string (e.g., "2025-03-20T09:30:00.000Z")
// }

// // Firestore utility functions
// const storeStocks = async (stocks: StockWithTimestamp[]) => {
//   const stockDocRef = doc(db, "stocks", "current");
//   await setDoc(stockDocRef, {
//     stocks,
//     lastUpdated: new Date().toISOString(),
//     callCount: (await getCallCount()) + 1,
//   });
// };

// const getStoredStocks = async (): Promise<StockWithTimestamp[] | null> => {
//   const stockDocRef = doc(db, "stocks", "current");
//   const snapshot = await getDoc(stockDocRef);
//   if (snapshot.exists()) {
//     return snapshot.data().stocks as StockWithTimestamp[];
//   }
//   return null;
// };

// const getCallCount = async (): Promise<number> => {
//   const stockDocRef = doc(db, "stocks", "current");
//   const snapshot = await getDoc(stockDocRef);
//   if (snapshot.exists()) {
//     return snapshot.data().callCount || 0;
//   }
//   return 0;
// };

// // Fetch and store stock data with timestamps
// export const fetchAndStoreStocks = async (): Promise<StockWithTimestamp[]> => {
//   const stocks = await Promise.all(
//     SYMBOLS.map(async (symbol, index) => {
//       await delay(index * 1000); // Stagger requests
//       try {
//         const response = await axios.get(
//           `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
//         );
//         console.log(`Raw response for ${symbol}:`, JSON.stringify(response.data, null, 2));
//         const data = response.data["Global Quote"];
//         if (!data || !data["05. price"]) {
//           console.warn(`No valid data for ${symbol}. Response:`, response.data);
//           return null;
//         }
//         const cleanSymbol = symbol.replace(".BO", "");
//         const price = parseFloat(data["05. price"]);
//         if (isNaN(price) || price <= 0) {
//           console.warn(`Invalid price (${data["05. price"]}) for ${symbol}`);
//           return null;
//         }
//         return {
//           id: symbol,
//           symbol: cleanSymbol,
//           name: nameMap[cleanSymbol] || cleanSymbol,
//           price,
//           availableShares: 1000,
//           lastUpdated: new Date().toISOString(), // Timestamp of this fetch
//         };
//       } catch (error) {
//         console.error(`Error fetching ${symbol}:`, error);
//         return null;
//       }
//     })
//   );

//   const validStocks = stocks.filter((stock): stock is StockWithTimestamp => stock !== null);
//   await storeStocks(validStocks);
//   return validStocks;
// };

// // Get stored stocks or fetch if needed
// export const getStocks = async (): Promise<StockWithTimestamp[]> => {
//   console.log("Fetching stored stocks...");
//   const storedStocks = await getStoredStocks();
//   console.log("Stored stocks:", storedStocks);

//   const callCount = await getCallCount();
//   console.log("API call count:", callCount, "Daily limit:", DAILY_CALL_LIMIT);

//   if (storedStocks && callCount < DAILY_CALL_LIMIT) {
//     const stockDocRef = doc(db, "stocks", "current");
//     const snapshot = await getDoc(stockDocRef);
//     const data = snapshot.data();

//     console.log("Firestore stock data:", data);

//     if (data?.lastUpdated) {
//       const lastUpdateTime = new Date(data.lastUpdated);
//       const now = new Date();

//       console.log("Last update time:", lastUpdateTime.toISOString());
//       console.log("Current time:", now.toISOString());

//       if (lastUpdateTime.toDateString() === now.toDateString()) {
//         console.log("Returning stored stocks...");
//         return storedStocks;
//       }
//     }
//   }

//   console.log("Fetching fresh stock data...");
//   const freshStocks = await fetchAndStoreStocks();
//   console.log("Fetched fresh stocks:", freshStocks);

//   return freshStocks;
// };

// // Scheduler for 5 daily updates
// export const scheduleStockUpdates = (callback: (stocks: StockWithTimestamp[]) => void) => {
//   const updateTimes = [
//     { hour: 9, minute: 30 },  // 9:30 AM IST
//     { hour: 11, minute: 30 }, // 11:30 AM IST
//     { hour: 13, minute: 30 }, // 1:30 PM IST
//     { hour: 14, minute: 30 }, // 2:30 PM IST
//     { hour: 15, minute: 30 }, // 3:30 PM IST
//   ];

//   const checkAndUpdate = async () => {
//     const now = new Date();
//     const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
//     const istTime = new Date(now.getTime() + istOffset);

//     const callCount = await getCallCount();
//     if (callCount >= DAILY_CALL_LIMIT) {
//       const storedStocks = await getStoredStocks();
//       if (storedStocks) {
//         console.log("Daily limit reached. Using cached stocks.");
//         callback(storedStocks);
//       } else {
//         console.warn("Daily limit reached, no cached stocks available.");
//         callback([]);
//       }
//       return;
//     }

//     for (const { hour, minute } of updateTimes) {
//       const updateTime = new Date(istTime);
//       updateTime.setHours(hour, minute, 0, 0);

//       if (Math.abs(istTime.getTime() - updateTime.getTime()) < 60 * 1000) {
//         const stocks = await fetchAndStoreStocks();
//         callback(stocks);
//         break;
//       }
//     }

//     const storedStocks = await getStoredStocks();
//     callback(storedStocks || await getStocks());
//   };

//   checkAndUpdate();
//   const interval = setInterval(checkAndUpdate, 60 * 1000);

//   return () => clearInterval(interval);
// };

// // Reset call count daily
// const resetCallCountDaily = () => {
//   const now = new Date();
//   const midnightIST = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
//   midnightIST.setHours(0, 0, 0, 0);
//   const timeToMidnight = midnightIST.getTime() - now.getTime() + 24 * 60 * 60 * 1000;

//   setTimeout(async () => {
//     const stockDocRef = doc(db, "stocks", "current");
//     await setDoc(stockDocRef, { callCount: 0 }, { merge: true });
//     resetCallCountDaily();
//   }, timeToMidnight);
// };
// resetCallCountDaily();