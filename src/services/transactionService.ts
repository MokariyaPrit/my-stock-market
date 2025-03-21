import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Transaction } from "../types/transaction";

// Define Firestore-compatible transaction type
type FirestoreTransaction = Omit<Transaction, "timestamp"> & { timestamp: Timestamp };

// Add a transaction with error handling
export const addTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    await addDoc(collection(db, "transactions"), {
      ...transaction,
      timestamp: Timestamp.now(),
    } as FirestoreTransaction);
    // console.log("✅ Transaction added successfully:", transaction);
  } catch (error) {
    console.error("❌ Error adding transaction:", error);
    throw error; // Re-throw for upstream handling
  }
};

// Fetch all transactions with caching consideration
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId as string,
        stockSymbol: data.stockSymbol as string,
        stockName: data.stockName as string,
        price: data.price as number,
        quantity: data.quantity as number,
        type: data.type as "buy" | "sell",
        timestamp: data.timestamp?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    return []; // Fallback to empty array
  }
};

// Fetch user-specific transactions (corrected collection)
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, "transactions"), // Fixed from "stocks" to "transactions"
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId as string,
        stockSymbol: data.stockSymbol as string,
        stockName: data.stockName as string,
        price: data.price as number,
        quantity: data.quantity as number,
        type: data.type as "buy" | "sell",
        timestamp: data.timestamp?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("❌ Error fetching user transactions:", error);
    return [];
  }
};

// Real-time subscription to user transactions
export const subscribeToUserTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void
): (() => void) => {
  const q = query(
    collection(db, "transactions"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc")
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const transactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Transaction, "id">),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
      callback(transactions);
    },
    (error) => {
      console.error("❌ Error in transaction subscription:", error);
      callback([]); // Fallback on error
    }
  );

  return unsubscribe; // Return cleanup function
};