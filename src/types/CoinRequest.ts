import { Timestamp } from "firebase/firestore";
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc, orderBy, } from 'firebase/firestore';
export interface CoinRequest {
  id: string;
  userId: string;
  coinAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  adminId?: string;
  amount?: number; 
  requestedAt?: string; 
}

export const getCoinHistory = async (userId: string) => {
  const transactionsRef = collection(db, "coinTransactions");
  const q = query(transactionsRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      type: data.type,
      amount: data.amount,
      createdAt: data.createdAt instanceof Timestamp
        ? new Date(data.createdAt.toDate()) // ✅ Properly convert Firestore timestamp
        : new Date(), // Fallback if timestamp is missing
    };
  });
};





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



// Get user's coin requests
// export const getUserCoinRequests = async (userId: string): Promise<CoinRequest[]> => {
//   try {
//     const q = query(
//       collection(db, 'coinRequests'),
//       where('userId', '==', userId),
//       orderBy('createdAt', 'desc')
//     );

//     const querySnapshot = await getDocs(q);
//     return querySnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     })) as CoinRequest[];
//   } catch (error) {
//     console.error('Error getting user coin requests:', error);
//     throw error;
//   }
// };

export const getUserCoinRequests = async (userId: string): Promise<CoinRequest[]> => {
  try {
    const q = query(collection(db, "coinRequests"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        userId: data.userId,
        coinAmount: data.amount || data.coinAmount, // ✅ Ensure correct field mapping
        reason: data.reason || "No reason provided",
        status: data.status,
        createdAt: data.requestedAt || data.createdAt || new Date().toISOString(), // ✅ Ensure correct timestamp
      };
    }) as CoinRequest[];
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

// Update coin request status (approve/reject)
export const updateCoinRequestStatus = async (requestId: string, status: 'approved' | 'rejected', adminId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'coinRequests', requestId);

    // Get the request to check if it exists
    const requestSnap = await getDoc(requestRef);
    if (!requestSnap.exists()) {
      throw new Error('Request not found');
    }

    await updateDoc(requestRef, {
      status,
      updatedAt: new Date().toISOString(),
      adminId
    });
  } catch (error) {
    console.error('Error updating coin request status:', error);
    throw error;
  }
};

import { getAuth } from "firebase/auth";

export const sendCoinRequest = async (requestData: any) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  try {
    const coinRequestsRef = collection(db, "coinRequests");

    await addDoc(coinRequestsRef, {
      ...requestData,
      userId: user.uid, // ✅ Ensure the user ID is correct
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    console.log("✅ Coin request sent successfully.");
  } catch (error) {
    console.error("❌ Error sending coin request:", error);
    throw error;
  }
};
