import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc, addDoc, serverTimestamp,onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

// ✅ Define User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  coins: number;
  ownedStocks?: { [key: string]: number }; // ✅ Fix: Add stocks field
}

// ✅ Fetch all users from Firestore
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "Unnamed",
      email: doc.data().email,
      role: doc.data().role as "user" | "admin" | "superadmin",
      coins: doc.data().coins || 0,
      ownedStocks: doc.data().ownedStocks || {}, // ✅ Fetch stocks
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// ✅ Get User Coins
export const getUserCoins = async (userId: string): Promise<number> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data().coins || 0 : 0;
  } catch (error) {
    console.error("Error fetching user coins:", error);
    return 0;
  }
};

// ✅ Update User Coins
export const updateUserCoins = async (userId: string, newCoinBalance: number) => {
  if (newCoinBalance < 0) {
    throw new Error("Coin balance cannot be negative.");
  }
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { coins: newCoinBalance });
  await logCoinTransaction(userId, newCoinBalance, "debit");
};

// ✅ Log Coin Transactions
export const logCoinTransaction = async (userId: string, amount: number, type: "credit" | "debit") => {
  await addDoc(collection(db, "coinTransactions"), {
    userId,
    amount,
    type,
    createdAt: serverTimestamp(),
  });
};

// ✅ Automatically Deposit 100K Coins on Signup
export const createUserInFirestore = async (userId: string, name: string, email: string) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name,
      email,
      role: "user",
      coins: 100000,
      ownedStocks: {}, // ✅ Fix: Ensure user starts with no stocks
      createdAt: serverTimestamp(),
    });
    await logCoinTransaction(userId, 100000, "credit");
  }
};

// ✅ Delete user by ID
export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, "users", userId));
    // console.log(`User  deleted successfully.`);
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

// ✅ Update user role
export const updateUserRole = async (userId: string, newRole: "user" | "admin" | "superadmin") => {
  try {
    await updateDoc(doc(db, "users", userId), { role: newRole });
    // console.log(`User ${userId} role updated to ${newRole}`);
  } catch (error) {
    console.error("Error updating user role:", error);
  }
};

// ✅ Update user details
export const updateUser = async (userId: string, updatedData: Partial<User>) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updatedData);
    // console.log("User updated successfully!");
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

// ✅ Get the currently logged-in user
export const getCurrentUser = async (): Promise<User | null> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return null;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const userData = userSnap.data();
  return {
    id: user.uid,
    name: userData.name || "Unknown",
    email: userData.email,
    role: userData.role as "user" | "admin" | "superadmin",
    coins: userData.coins || 0,
    ownedStocks: userData.ownedStocks || {}, // ✅ Fetch stocks when user logs in
  };
};

// ✅ Fetch user data by ID
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.warn("User not found in Firestore.");
      return null;
    }

    const userData = userDoc.data();
    return {
      id: userId,
      name: userData.name || "Unknown",
      email: userData.email,
      role: userData.role as "user" | "admin" | "superadmin",
      coins: userData.coins || 0,
      ownedStocks: userData.ownedStocks || {}, // ✅ Ensure owned stocks are fetched
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};


export const getUserById = async (userId: string) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        id: userDoc.id,
        name: userData.name || "Unknown User",  // ✅ Ensures name exists
        email: userData.email || "No Email",    // ✅ Ensures email exists
      };
    } else {
      console.warn(`User not found: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching user ${userId}:`, error);
    return null;
  }
};

export const updateUserStocks = async (userId: string, updatedStocks: { [key: string]: number }) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { ownedStocks: updatedStocks });
    // console.log("User stocks updated successfully.");
  } catch (error) {
    console.error("Error updating user stocks:", error);
  }
};

export const subscribeToUserCoins = (userId: string, callback: (coins: number) => void) => {
  const userDocRef = doc(db, "users", userId);

  return onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().coins || 0);
    }
  });
};