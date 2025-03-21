import { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box, Paper } from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { loginSuccess } from "../redux/store/authSlice";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAuthChecked, setIsAuthChecked] = useState(false); // Add state to track auth check

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthChecked(true); // Mark auth check as complete
      if (user) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
        alert("Error: Invalid user data received.");
      }
    } catch (error: any) {
      console.error("❌ Login Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthChecked) {
    // Render a loading state while checking Firebase auth
    return (
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Typography variant="h6" textAlign="center">
            Checking authentication...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, width: "100%", maxWidth: 400 }}>
          <Typography variant="h4" textAlign="center" fontWeight="bold" mb={2}>
            Login
          </Typography>
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
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;