export interface Stock {
    id: string; // Firestore document ID
    symbol: string;
    name: string;
    price: number;
    availableShares: number;
    lastUpdated?: string; // Optional ISO timestamp
  }
  