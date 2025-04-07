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
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import Loginimg from "../components/Loginimg.tsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // new state
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userData = await loginUser(email, password);

      if (userData && userData.email) {
        dispatch(
          loginSuccess({
            id: userData.id,
            name: userData.name || "Unknown",
            email: userData.email || "",
            role: userData.role || "user",
            coins: userData.coins || 0,
          })
        );
        navigate("/dashboard");
      } else {
        setError("Invalid user data received.");
      }
    } catch (error: any) {
      setError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // Show a loading spinner while checking auth state
  if (checkingAuth) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
};

export default Login;
