import { useState } from "react";
import { TextField, Button, Container, Typography, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await registerUser(name, email, password);
      if (user) {
        alert("User registered successfully! 100,000 coins have been credited to your account.");
        navigate("/profile");
      }
    } catch (error: any) {
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
            Register
          </Typography>
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
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;