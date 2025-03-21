import { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const StockPanel = () => {
  const [stock, setStock] = useState({ symbol: "", name: "", price: "", availableShares: "" });
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleChange = (e:any) => {
    setStock({ ...stock, [e.target.name]: e.target.value.trim() });
  };

  const handleConfirm = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const addStockToDatabase = async () => {
    if (!stock.symbol || !stock.name || !stock.price || !stock.availableShares) {
      setSnackbarMessage("Please fill all fields");
      setSnackbarOpen(true);
      return;
    }
    try {
      await addDoc(collection(db, "stocks"), {
        symbol: stock.symbol.toUpperCase(),
        name: stock.name,
        price: parseFloat(stock.price),
        availableShares: parseInt(stock.availableShares, 10),
      });
      setSnackbarMessage("Stock added successfully!");
      setSnackbarOpen(true);
      setStock({ symbol: "", name: "", price: "", availableShares: "" });
    } catch (error) {
      console.error("Error adding stock: ", error);
      setSnackbarMessage("Failed to add stock");
      setSnackbarOpen(true);
    }
    setOpenDialog(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f5f5f5", // Light gray background for contrast
        p: { xs: 2, sm: 3 }, // Padding responsive to screen size
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 450, // Slightly wider for better form layout
          borderRadius: 3,
          boxShadow: 6, // Elevated shadow for depth
          bgcolor: "white",
          p: { xs: 2, sm: 3 }, // Responsive padding inside card
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              color: "#1976d2", // MUI primary color
            }}
          >
            Add New Stock
          </Typography>
          <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Stock Symbol"
              name="symbol"
              value={stock.symbol}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              size="small" // Compact input fields
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Company Name"
              name="name"
              value={stock.name}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Stock Price"
              name="price"
              type="number"
              value={stock.price}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Available Shares"
              name="availableShares"
              type="number"
              value={stock.availableShares}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleConfirm}
              sx={{
                mt: 3,
                py: 1.5, // Taller button for better clickability
                borderRadius: 2,
                textTransform: "none", // Avoid all-caps for a modern look
                fontSize: "1rem",
                fontWeight: "medium",
              }}
            >
              Add Stock
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{ "& .MuiDialog-paper": { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Confirm Stock Addition
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#555" }}>
            Are you sure you want to add this stock to the database?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseDialog}
            color="secondary"
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={addStockToDatabase}
            color="primary"
            variant="contained"
            sx={{ borderRadius: 1 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes("Failed") ? "error" : "success"}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StockPanel;