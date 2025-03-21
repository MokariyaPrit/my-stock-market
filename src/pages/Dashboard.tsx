import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  if (!user) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h6">Unauthorized Access</Typography>
      </Container>
    );
  }

  const roleBasedRoutes = {
    user: [
      // { path: "/RealStockTrade", label: "RealStockTrade" },
      { path: "/Portfolio", label: "Portfolio" },
      { path: "/stock-trade", label: "Stock Trade" },
      { path: "/transaction-history", label: "Transactions" },
      { path: "/Leaderboard", label: "Leaderboard" },
      { path: "/coin-transactions", label: "Coin Transactions" },
      { path: "/profile", label: "Profile" },
      { path: "/request-coins", label: "Request Coins" },
      { path: "/ActivityLogs", label: "Activity Logs" },
      { path: "/track-requests", label: "Track Requests" },
    ],
    admin: [
      { path: "/Portfolio", label: "Portfolio" },
      { path: "/profile", label: "Profile" },
      { path: "/transaction-history", label: "Transactions" },
      { path: "/Leaderboard", label: "Leaderboard" },
      { path: "/stock-trade", label: "Stock Trade" },
      { path: "/coin-transactions", label: "Coin Transactions" },
      { path: "/request-coins", label: "Request Coins" },
      { path: "/admin-coin-requests", label: "Manage Requests" },
      { path: "/admin-dashboard", label: "Admin Dashboard" },
      { path: "/ActivityLogs", label: "Activity Logs" },
      { path: "/admin-coin-requests", label: "Manage Coin Requests" },
    ],
    superadmin: [
      { path: "/StockPanel", label: "StockPanel" },
      { path: "/SuperAdminStockEdit", label: "SuperAdminStockEdit" },
      { path: "/Leaderboard", label: "Leaderboard" },
      { path: "/profile", label: "Profile" },
      { path: "/transaction-history", label: "Transactions" },
      { path: "/stock-trade", label: "Stock Trade" },
      { path: "/coin-transactions", label: "Coin Transactions" },
      { path: "/super-admin-dashboard", label: "Super Admin Panel" },
      { path: "/admin-coin-requests", label: "Manage Requests" },
      { path: "/ActivityLogs", label: "Activity Logs" },
    ],
  };

  const userRole = user.role || "user";
  const accessibleRoutes = roleBasedRoutes[userRole] || [];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
            
      <Typography variant="h4" gutterBottom textAlign="center">
        Dashboard
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {accessibleRoutes.map((route) => (
          <Grid item xs={12} sm={6} md={4} key={route.path}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card
                elevation={4}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  bgcolor: theme.palette.background.paper,
                }}
              >
                <CardActionArea component={Link} to={route.path} sx={{ height: "100%" }}>
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {route.label}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Navigate to {route.label} section.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      
    </Container>
  );
};

export default Dashboard;