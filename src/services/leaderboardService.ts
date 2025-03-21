import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// ✅ Define LeaderboardUser type
export interface LeaderboardUser {
  id: string;
  name: string;
  coins: number;
  portfolioValue: number;
}

// ✅ Fetch users & sort by highest coins
export const getLeaderboardUsers = async (): Promise<LeaderboardUser[]> => {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  const users: LeaderboardUser[] = snapshot.docs.map((doc) => {
    const data = doc.data();

    // ✅ Ensure valid data
    const coins = data.coins ? Number(data.coins) : 100000; // Default to 100k
    const portfolioValue = data.portfolioValue ? Number(data.portfolioValue) : coins; // Default to starting coins

    return {
      id: doc.id,
      name: data.name ?? "Unknown",
      coins, // ✅ Sorting by coins
      portfolioValue,
    };
  });

  // ✅ Sort by highest coins
  return users.sort((a, b) => b.coins - a.coins);
};