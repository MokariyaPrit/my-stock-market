import { useState } from "react";
import { TextField, Button, Container, Typography, Box, Link, Paper } from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService"; 
import { loginSuccess } from "../redux/store/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const userData = await loginUser(email, password); // ✅ Ensure `loginUser` returns a complete User object
      
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
            <Box display="flex" justifyContent="space-between" mt={1} mb={2}>
              <Link href="/forgot-password" underline="hover">
                Forgot Password?
              </Link>
              <Link href="/register" underline="hover">
                Register
              </Link>
            </Box>
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
