import { useState } from "react";
import { TextField, Button, Card, CardContent, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert } from "@mui/material";
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
    <Card style={{ maxWidth: 400, margin: "auto", padding: 20, textAlign: "center" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add New Stock
        </Typography>
        <TextField
          fullWidth
          label="Stock Symbol"
          name="symbol"
          value={stock.symbol}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Company Name"
          name="name"
          value={stock.name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Stock Price"
          name="price"
          type="number"
          value={stock.price}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Available Shares"
          name="availableShares"
          type="number"
          value={stock.availableShares}
          onChange={handleChange}
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleConfirm} style={{ marginTop: 20 }}>
          Add Stock
        </Button>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Stock Addition</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to add this stock to the database?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          <Button onClick={addStockToDatabase} color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default StockPanel;