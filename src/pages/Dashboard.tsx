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
  Box,
} from "@mui/material";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();

  if (!user) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6" color="error">
          Unauthorized Access
        </Typography>
      </Container>
    );
  }

  const roleBasedRoutes = {
    user: [
      { path: "/Portfolio", label: "Portfolio" },
      { path: "/stock-trade", label: "Stock Trade" },
      { path: "/transaction-history", label: "Transactions" },
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
      { path: "/admin-coin-requests", label: "Manage Coin Requests" },
      { path: "/admin-dashboard", label: "Admin Dashboard" },
      { path: "/ActivityLogs", label: "Activity Logs" },
    ],
    superadmin: [
      { path: "/Portfolio", label: "Portfolio" },
      { path: "/StockPanel", label: "Stock Panel" },
      { path: "/SuperAdminStockEdit", label: "Edit Stocks" },
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
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box textAlign="center" mb={5}>
        <Typography variant="h3" fontWeight={700}>
          Welcome to Your Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Explore the tools and pages available to your role.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {accessibleRoutes.map((route) => (
          <Grid item xs={12} sm={6} md={4} key={route.path}>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                elevation={6}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  background: theme.palette.background.default,
                  transition: "0.3s",
                }}
              >
                <CardActionArea component={Link} to={route.path} sx={{ height: "100%" }}>
                  <CardContent
                    sx={{
                      p: 4,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {route.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Go to {route.label}
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
