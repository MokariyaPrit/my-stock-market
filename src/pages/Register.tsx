import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Link,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import Signupimg from "../components/Signupimg";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await registerUser(name, email, password);
      if (user) {
        alert("User registered successfully! 100,000 coins have been credited to your account.");
        setTimeout(() => {
          navigate("/login");
        }, 100);
      }
    } catch (error: any) {
      setError(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "90vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "background.default",
      }}
    >
      {/* Left: Image */}
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
            Sign Up
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Create your account to get started.
          </Typography>

          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleRegister}>
            <TextField
              label="Full Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
            />
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
              {loading ? <CircularProgress size={24} /> : "Register"}
            </Button>
          </form>

          <Typography variant="body2" align="center">
            Already have an account?{" "}
            <Link
              component="button"
              onClick={() => navigate("/login")}
              sx={{ color: "primary.main", fontWeight: "bold" }}
            >
              Login
            </Link>
          </Typography>
        </Box>
        
      </Box>
    {/* Right: Register Form */}
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
        <Signupimg width="80%" />
      </Box>
    </Box>
  );
};

export default Register;
