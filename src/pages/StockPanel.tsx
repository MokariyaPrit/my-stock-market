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
import { useTheme } from "@mui/material/styles";

const StockPanel = () => {
  const theme = useTheme();
  const [stock, setStock] = useState({ symbol: "", name: "", price: "", availableShares: "" });
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleChange = (e: any) => {
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
        bgcolor: theme.palette.background.default,
        px: 2,
        py: 4,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 4,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          p: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            fontWeight="bold"
            align="center"
            color="primary"
            gutterBottom
          >
            Add New Stock
          </Typography>
          <Box component="form" onSubmit={(e) => e.preventDefault()} mt={2}>
            <TextField
              fullWidth
              label="Stock Symbol"
              name="symbol"
              value={stock.symbol}
              onChange={handleChange}
              margin="normal"
              size="small"
            />
            <TextField
              fullWidth
              label="Company Name"
              name="name"
              value={stock.name}
              onChange={handleChange}
              margin="normal"
              size="small"
            />
            <TextField
              fullWidth
              label="Stock Price"
              name="price"
              type="number"
              value={stock.price}
              onChange={handleChange}
              margin="normal"
              size="small"
            />
            <TextField
              fullWidth
              label="Available Shares"
              name="availableShares"
              type="number"
              value={stock.availableShares}
              onChange={handleChange}
              margin="normal"
              size="small"
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleConfirm}
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Add Stock
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle fontWeight="bold" color="primary.main">
          Confirm Stock Addition
        </DialogTitle>
        <DialogContent>
          <DialogContentText color="text.secondary">
            Are you sure you want to add this stock to the database?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={addStockToDatabase}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

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