import { Container, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <Container sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h3" gutterBottom>Welcome to Stock Market Simulator</Typography>
      <Typography variant="h6" color="textSecondary">
        Buy, sell, and trade stocks in real-time with our interactive platform.
      </Typography>
      <Button variant="contained" color="primary" sx={{ mt: 3 }} component={Link} to="/login">
        Get Started
      </Button>
    </Container>
  );
};

export default LandingPage;
