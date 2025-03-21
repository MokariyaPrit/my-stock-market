import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc, orderBy,serverTimestamp } from 'firebase/firestore';
import { CoinRequest } from '../types/CoinRequest';

// Get current user's pending requests count
export const getPendingRequestsCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'coinRequests'),
      where('userId', '==', userId),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting pending requests count:', error);
    throw error;
  }
};

// Send a coin request to admin
export const sendCoinRequest = async (requestData: Omit<CoinRequest, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Check if user has less than 3 pending requests
    const pendingCount = await getPendingRequestsCount(user.uid);
    if (pendingCount >= 3) {
      throw new Error('You can only have 3 pending requests at a time');
    }
    
    const coinRequestRef = await addDoc(collection(db, 'coinRequests'), {
      ...requestData,
      userId: user.uid,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    
    return coinRequestRef.id;
  } catch (error) {
    console.error('Error sending coin request:', error);
    throw error;
  }
};

// Get user's coin requests
// export const getUserCoinRequests = async (userId: string) => {
//   try {
//     const requestsRef = collection(db, "coinRequests");
//     const q = query(
//       requestsRef,
//       where("userId", "==", userId), // ✅ Filter by userId
//       orderBy("createdAt", "desc") // ✅ Order by createdAt
//     );

//     const snapshot = await getDocs(q);
//     return snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//   } catch (error) {
//     console.error("❌ Error getting user coin requests:", error);
//     throw error;
//   }
// };
export const getUserCoinRequests = async (userId: string): Promise<CoinRequest[]> => {
  try {
    const q = query(collection(db, "coinRequests"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // console.log("Raw API Data:", data); // ✅ Debug log

      return {
        id: doc.id,
        userId: data.userId || userId, 
        coinAmount: data.coinAmount !== undefined ? data.coinAmount : data.amount, // ✅ Correct Mapping
        reason: data.reason ?? "No reason provided",
        status: data.status,
        createdAt: data.createdAt ?? data.requestedAt ?? new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("Error getting user coin requests:", error);
    throw error;
  }
};


// Get all coin requests (for admin)
export const getAllCoinRequests = async (): Promise<CoinRequest[]> => {
  try {
    const q = query(
      collection(db, 'coinRequests'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CoinRequest[];
  } catch (error) {
    console.error('Error getting all coin requests:', error);
    throw error;
  }
};

// ✅ Function to update coin request status & credit user
export const updateCoinRequestStatus = async (
  requestId: string,
  status: "approved" | "rejected",
  adminId: string
) => {
  const requestRef = doc(db, "coinRequests", requestId);

  try {
    const requestSnap = await getDoc(requestRef);
    if (!requestSnap.exists()) throw new Error("Request not found.");

    const requestData = requestSnap.data();
    if (requestData.status !== "pending") throw new Error("Request already processed.");

    await updateDoc(requestRef, {
      status,
      adminId, // ✅ Store admin ID
      updatedAt: serverTimestamp(),
    });

    if (status === "approved") {
      const userRef = doc(db, "users", requestData.userId);
      
      // ✅ Fetch user's current coin balance
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;
      const currentCoins = userData?.coins || 0;

      // ✅ Add old balance + requested amount
      await updateDoc(userRef, {
        coins: currentCoins + requestData.coinAmount,
      });
    }

  } catch (error) {
    console.error("❌ Error updating request status:", error);
    throw error;
  }
};




export const getUserTransactionHistory = async (userId: string) => {
  try {


    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId), // ✅ Ensure this userId exists in Firestore
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);



    const transactions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        amount: data.amount ?? 0,
        balanceAfterTransaction: data.balanceAfterTransaction ?? 0,
        createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
      };
    });
    return transactions;
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    return [];
  }
};

export const getUserCoinBalance = async (userId: string): Promise<number> => {
  try {
  
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.warn("⚠️ User document not found!");
      return 0; // Default balance if user doesn't exist
    }

    const userData = userDoc.data();
    return userData.coins ?? 0; // ✅ Return user's coin balance
  } catch (error) {
    console.error("❌ Error fetching coin balance:", error);
    return 0; // Default to 0 if there's an error
  }
};