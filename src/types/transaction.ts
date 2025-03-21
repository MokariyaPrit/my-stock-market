export interface Transaction {
  id?: string; // Optional, included by getTransactions
  stockSymbol: string;
  stockName: string;
  price: number;
  quantity: number;
  userId: string;
  type: "buy" | "sell";
  timestamp: Date;
}