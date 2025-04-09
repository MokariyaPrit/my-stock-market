import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Link,
  alpha,
  CircularProgress,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { loginSuccess } from "../redux/store/authSlice";
import { useAuth } from "../context/AuthContext";
import Loginimg from "../components/Loginimg.tsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, authChecked } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (authChecked && user) {
      setIsNavigating(true);
      // Use replace to avoid adding to history stack
      navigate("/dashboard", { replace: true });
    }
  }, [user, authChecked, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    setError("");
    setLoading(true);

    try {
      const userData = await loginUser(email, password);
      if (userData && userData.email) {
        dispatch(loginSuccess({
          id: userData.id,
          name: userData.name || "Unknown",
          email: userData.email || "",
          role: userData.role || "user",
          coins: userData.coins || 0,
        }));
        await new Promise(resolve => setTimeout(resolve, 2500)); // Add delay before navigation
        navigate("/dashboard", { replace: true });
      } else {
        setError("Invalid user data received.");
      }
    } catch (error: any) {
      setError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth or during navigation
  if (!authChecked || isNavigating) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If we have checked auth and there's no user, show login form
  if (authChecked && !user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          bgcolor: "background.default",
        }}
      >
        {/* Left: Image */}
        <Box
          sx={{
            flex: 1,
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "center",
            bgcolor: alpha("#2563eb", 0.1),
            p: 4,
          }}
        >
          <Loginimg width="80%" />
        </Box>

        {/* Right: Login Form */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: { xs: 3, md: 6 },
          }}
        >
          <Box sx={{ maxWidth: 400, width: "100%" }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Login
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Welcome back! Please login to your account.
            </Typography>

            {error && (
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, mt: 2, mb: 2 }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <Typography variant="body2" align="center">
              Don’t have an account?{" "}
              <Link
                component="button"
                onClick={() => navigate("/register")}
                sx={{ color: "primary.main", fontWeight: "bold" }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return null; // Render nothing while handling navigation
};

export default Login;
