import { auth, db } from "../firebase";
import { logActivity } from "./activityService"; // ✅ Import logActivity
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc
} from "firebase/firestore";

// ✅ Register User with Initial Coins
export const registerUser = async (name: string, email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // ✅ Store user details in Firestore with initial 100K coins
  const userDocRef = doc(db, "users", user.uid);
  const userData = {
    id: user.uid,
    name,
    email: user.email,
    role: "user",
    coins: 100000,
    createdAt: new Date(),
  };

  await setDoc(userDocRef, userData);
  localStorage.setItem("user", JSON.stringify(userData)); // ✅ Store user data in localStorage

  return userData;
};

// ✅ Login User
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user) throw new Error("No user found.");

    // ✅ Fetch user data from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error("User not found in Firestore.");
    }

    const userData = userDoc.data();
    const fullUserData = {
      id: user.uid,
      name: userData.name || "Unknown",
      email: user.email,
      role: userData.role || "user",
      coins: userData.coins || 0,
      lastLogin: new Date().toISOString(), // ✅ Add last login timestamp
    };

    // ✅ Update last login time in Firestore
    await updateDoc(userDocRef, { lastLogin: new Date() });

    // ✅ Log login activity
    await logActivity("Logged in");

    // ✅ Store user data in localStorage
    localStorage.setItem("user", JSON.stringify(fullUserData));

    console.log("✅ User logged in:", fullUserData);
    return fullUserData;
  } catch (error) {
    console.error("❌ Login error:", error);
    throw error;
  }
};


// ✅ Logout User
export const logoutUser = async () => {
  await signOut(auth);
  localStorage.removeItem("user"); // ✅ Remove user session on logout
};
