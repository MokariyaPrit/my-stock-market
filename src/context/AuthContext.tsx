import { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// ✅ Extended User Type with role
interface ExtendedUser extends User {
  role: "user" | "admin" | "superadmin";
}

// ✅ AuthContext Type Definition
interface AuthContextType {
  user: ExtendedUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  authChecked: boolean; // Add this property
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ✅ Create Auth Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Auth Provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          const role = userSnap.exists() ? userSnap.data().role : "user";
          const extendedUser: ExtendedUser = { ...firebaseUser, role };
          setUser(extendedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setUser(null);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Don't render anything until initial auth check is complete
  if (!authChecked) {
    return null;
  }

  // ✅ Login Function
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await new Promise(resolve => setTimeout(resolve, 3500)); // Add delay before navigation
    } catch (error) {
      throw error;
    }
  };

  // ✅ Register Function (Ensures role is stored)
  const register = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // ✅ Save user details in Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        name,
        email,
        role: "user", // Default role is "user"
      });

      // ✅ Extend Firebase user with role
      const extendedUser: ExtendedUser = { ...firebaseUser, role: "user" };
      setUser(extendedUser);
      await new Promise(resolve => setTimeout(resolve, 2500)); // Add delay before navigation
    } catch (error) {
      throw error;
    }
  };

  // ✅ Logout Function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      await new Promise(resolve => setTimeout(resolve, 2500)); // Add delay before navigation
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAdmin: user?.role === "admin", 
        isSuperAdmin: user?.role === "superadmin", 
        loading,
        authChecked, // Add this property
        login, 
        register, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook for easy use
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
