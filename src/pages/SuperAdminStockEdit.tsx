import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Snackbar,
  Alert,
  Typography,
  Box,
} from "@mui/material";

interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: string;
  availableShares: string;
}

const SuperAdminStockEdit = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "stocks"));
        const stocksData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Stock[];
        setStocks(stocksData);
      } catch (error) {
        console.error("Error fetching stocks:", error);
      }
    };
    fetchStocks();
  }, []);

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
  };

  const handleChange = (field: keyof Stock, value: string) => {
    if (editingStock) {
      setEditingStock({ ...editingStock, [field]: value.trim() });
    }
  };

  const handleSave = () => {
    setOpenSaveDialog(true);
  };

  const confirmUpdate = async () => {
    if (!editingStock) return;
    try {
      const stockRef = doc(db, "stocks", editingStock.id);
      await updateDoc(stockRef, {
        symbol: editingStock.symbol.toUpperCase(),
        name: editingStock.name,
        price: parseFloat(editingStock.price),
        availableShares: parseInt(editingStock.availableShares, 10),
      });
      setStocks((prevStocks) => prevStocks.map((s) => (s.id === editingStock.id ? editingStock : s)));
      setSnackbar({ open: true, message: "Stock updated successfully!", type: "success" });
    } catch (error) {
      console.error("Error updating stock:", error);
      setSnackbar({ open: true, message: "Failed to update stock", type: "error" });
    } finally {
      setOpenSaveDialog(false);
      setEditingStock(null);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Super Admin - Manage Stocks
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Available Shares</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell>{stock.symbol}</TableCell>
                <TableCell>{stock.name}</TableCell>
                <TableCell>${stock.price}</TableCell>
                <TableCell>{stock.availableShares}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="secondary" onClick={() => handleEdit(stock)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      {editingStock && (
        <Dialog open={!!editingStock} onClose={() => setEditingStock(null)}>
          <DialogTitle>Edit Stock</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Stock Symbol" value={editingStock.symbol} onChange={(e) => handleChange("symbol", e.target.value)} margin="normal" />
            <TextField fullWidth label="Company Name" value={editingStock.name} onChange={(e) => handleChange("name", e.target.value)} margin="normal" />
            <TextField fullWidth label="Stock Price" type="number" value={editingStock.price} onChange={(e) => handleChange("price", e.target.value)} margin="normal" />
            <TextField fullWidth label="Available Shares" type="number" value={editingStock.availableShares} onChange={(e) => handleChange("availableShares", e.target.value)} margin="normal" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingStock(null)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Confirm Save Dialog */}
      <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>Are you sure you want to save these changes?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmUpdate} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.type}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SuperAdminStockEdit;