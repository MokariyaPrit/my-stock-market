import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path to your Firebase config

export interface LeaderboardUser {
  id: string;
  name: string;
  coins: number;
  role: "user" | "admin" | "superadmin";
}

export const getLeaderboardUsers = async (): Promise<LeaderboardUser[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "Unknown",
      coins: doc.data().coins || 0, // Ensure coins is a number
      role: doc.data().role || "user", // Fallback to "user" if missing
    }));
  } catch (error) {
    console.error("Error fetching leaderboard users:", error);
    return [];
  }
};