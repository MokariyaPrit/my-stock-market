import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext";
import Box from "@mui/material/Box";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StockTrade from "./pages/StockTrade";
import RequestCoins from "./pages/RequestCoins";
import TrackRequests from "./pages/TrackRequests";
import AdminCoinRequests from "./pages/AdminCoinRequests";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import CoinTransactions from "./pages/CoinTransactions";
import TransactionHistory from "./pages/TransactionHistory";
import ActivityLogs from "./components/ActivityLogs";
import Portfolio from "./pages/Portfolio";
import LeaderboardTest from "./pages/LeaderboardTest";
import UserProfile from "./components/UserProfile";
import StockPanel from "./pages/StockPanel";
import SuperAdminStockEdit from "./pages/SuperAdminStockEdit";
import UserProfileView from "./pages/UserProfileView";
import { useEffect, useMemo, useState } from "react";
// import RealStockTrade from './components/RealStockTrade';
import { lightTheme, darkTheme } from "./theme/theme";

function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(true);

  // Persist mode to localStorage
  useEffect(() => {
    const storedMode = localStorage.getItem("theme") as "light" | "dark" | null;
    if (storedMode) {
      setMode(storedMode);
    }
    setLoading(false);
  }, []);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme", newMode);
  };

  const theme = useMemo(
    () => (mode === "light" ? lightTheme : darkTheme),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box
            sx={{
              minHeight: "100vh",
              visibility: loading ? "hidden" : "visible",
              transition: "opacity 0.3s ease-in-out",
              opacity: loading ? 0 : 1,
            }}
          >
            <Navbar toggleTheme={toggleTheme} currentMode={mode} />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/stock-trade"
                element={
                  <ProtectedRoute>
                    <StockTrade />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/request-coins"
                element={
                  <ProtectedRoute>
                    <RequestCoins />
                  </ProtectedRoute>
                }
              />

              {/* <Route path="/RealStockTrade" element={
                <ProtectedRoute>
                  <RealStockTrade />
                </ProtectedRoute>
              } />
        */}

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/track-requests"
                element={
                  <ProtectedRoute>
                    <TrackRequests />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/coin-transactions"
                element={
                  <ProtectedRoute>
                    <CoinTransactions />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/transaction-history"
                element={
                  <ProtectedRoute>
                    <TransactionHistory />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/Portfolio"
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ActivityLogs"
                element={
                  <ProtectedRoute>
                    <ActivityLogs />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin-coin-requests"
                element={
                  <AdminRoute>
                    <AdminCoinRequests />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin-dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              <Route
                path="/super-admin-dashboard"
                element={
                  <AdminRoute requireSuperAdmin={true}>
                    <SuperAdminDashboard />
                  </AdminRoute>
                }
              />

              <Route
                path="/StockPanel"
                element={
                  <AdminRoute requireSuperAdmin={true}>
                    <StockPanel />
                  </AdminRoute>
                }
              />
              <Route
                path="/SuperAdminStockEdit"
                element={
                  <AdminRoute requireSuperAdmin={true}>
                    <SuperAdminStockEdit />
                  </AdminRoute>
                }
              />

                <Route path="/Leaderboard" 
                element={
                <AdminRoute requireSuperAdmin={true}>
                  <LeaderboardTest />
                </AdminRoute>
              } />
              


              <Route
                path="/user/:userId"
                element={
                  <AdminRoute requireSuperAdmin={true}>
                    <UserProfileView />
                  </AdminRoute>
                }
              />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
