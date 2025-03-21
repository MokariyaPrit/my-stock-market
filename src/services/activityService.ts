import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";

// ✅ Function to log a user activity into Firestore
export const logActivity = async (action: string) => {
  if (!auth.currentUser) {
    console.error("❌ Error: No authenticated user.");
    return;
  }

  try {
    await addDoc(collection(db, "activity_logs"), {
      userId: auth.currentUser.uid,
      action,
      timestamp: new Date(), // ✅ Store as Firestore timestamp
    });

    // console.log("✅ Activity logged:", action);
  } catch (error) {
    console.error("❌ Error logging activity:", error);
  }
};

// ✅ Fetch user activity logs from Firestore
export const getUserActivityLogs = async (userId: string) => {
  try {
    const q = query(
      collection(db, "activity_logs"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        action: data.action,
        timestamp: data.timestamp && "seconds" in data.timestamp
          ? new Date(data.timestamp.seconds * 1000) // ✅ Convert Firestore timestamp
          : new Date(), // ✅ Default to current time if missing
      };
    });
  } catch (error) {
    console.error("❌ Error fetching activity logs:", error);
    return [];
  }
};
