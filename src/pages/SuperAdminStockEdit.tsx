import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
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
  DialogContentText,
  Snackbar,
  Alert,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

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
  const [deletingStockId, setDeletingStockId] = useState<string | null>(null);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "stocks"));
        const stocksData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Stock[];
        setStocks(stocksData);
      } catch (error) {
        console.error("Error fetching stocks:", error);
        setSnackbar({ open: true, message: "Failed to fetch stocks", type: "error" });
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

  const handleDelete = (stockId: string) => {
    setDeletingStockId(stockId);
    setOpenDeleteDialog(true);
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

  const confirmDelete = async () => {
    if (!deletingStockId) return;
    try {
      await deleteDoc(doc(db, "stocks", deletingStockId));
      setStocks((prevStocks) => prevStocks.filter((s) => s.id !== deletingStockId));
      setSnackbar({ open: true, message: "Stock deleted successfully!", type: "success" });
    } catch (error) {
      console.error("Error deleting stock:", error);
      setSnackbar({ open: true, message: "Failed to delete stock", type: "error" });
    } finally {
      setOpenDeleteDialog(false);
      setDeletingStockId(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: theme.palette.background.default,
        py: { xs: 2, sm: 4 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 900, px: { xs: 2, sm: 0 } }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: "bold", color: theme.palette.primary.main, mb: 4 }}
        >
          Super Admin - Manage Stocks
        </Typography>

        {/* Mobile Cards */}
        {isMobile ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {stocks.map((stock) => (
              <Card
                key={stock.id}
                sx={{
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  bgcolor: theme.palette.background.paper,
                  p: 2,
                }}
              >
                <CardContent sx={{ p: 1, textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: theme.palette.primary.main, mb: 1 }}>
                    {stock.symbol}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    <strong>Name:</strong> {stock.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    <strong>Price:</strong> ₹{stock.price}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    <strong>Shares:</strong> {stock.availableShares}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleEdit(stock)}
                      sx={{ borderRadius: 1, minWidth: 80 }}
                    >
                      Edit
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(stock.id)}
                      sx={{ p: 0.5 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 2, boxShadow: theme.shadows[4], overflowX: "auto" }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                  {['Symbol', 'Name', 'Price', 'Available Shares', 'Actions'].map((label) => (
                    <TableCell key={label} sx={{ color: "white", fontWeight: "bold" }}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {stocks.map((stock) => (
                  <TableRow key={stock.id} hover>
                    <TableCell>{stock.symbol}</TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell>₹{stock.price}</TableCell>
                    <TableCell>{stock.availableShares}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(stock)}
                        sx={{ mr: 1, borderRadius: 1 }}
                      >
                        Edit
                      </Button>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(stock.id)}
                        sx={{ p: 0.5 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

     
   
   
   
   {/* Edit Dialog */}
    {editingStock && (
      <Dialog
        open={!!editingStock}
        onClose={() => setEditingStock(null)}
        sx={{ "& .MuiDialog-paper": { borderRadius: 2, p: 2, width: "100%", maxWidth: 400 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2" }}>Edit Stock</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Stock Symbol"
            value={editingStock.symbol}
            onChange={(e) => handleChange("symbol", e.target.value)}
            margin="normal"
            variant="outlined"
            size="small"
          />
          <TextField
            fullWidth
            label="Company Name"
            value={editingStock.name}
            onChange={(e) => handleChange("name", e.target.value)}
            margin="normal"
            variant="outlined"
            size="small"
          />
          <TextField
            fullWidth
            label="Stock Price"
            type="number"
            value={editingStock.price}
            onChange={(e) => handleChange("price", e.target.value)}
            margin="normal"
            variant="outlined"
            size="small"
          />
          <TextField
            fullWidth
            label="Available Shares"
            type="number"
            value={editingStock.availableShares}
            onChange={(e) => handleChange("availableShares", e.target.value)}
            margin="normal"
            variant="outlined"
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setEditingStock(null)}
            color="secondary"
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            sx={{ borderRadius: 1 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    )}

    {/* Confirm Save Dialog */}
    <Dialog
      open={openSaveDialog}
      onClose={() => setOpenSaveDialog(false)}
      sx={{ "& .MuiDialog-paper": { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Changes</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to save these changes?</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={() => setOpenSaveDialog(false)}
          color="secondary"
          variant="outlined"
          sx={{ borderRadius: 1 }}
        >
          Cancel
        </Button>
        <Button
          onClick={confirmUpdate}
          color="primary"
          variant="contained"
          sx={{ borderRadius: 1 }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>

    {/* Confirm Delete Dialog */}
    <Dialog
      open={openDeleteDialog}
      onClose={() => setOpenDeleteDialog(false)}
      sx={{ "& .MuiDialog-paper": { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: "bold", color: "#d32f2f" }}>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete this stock? This action cannot be undone.</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={() => setOpenDeleteDialog(false)}
          color="secondary"
          variant="outlined"
          sx={{ borderRadius: 1 }}
        >
          Cancel
        </Button>
        <Button
          onClick={confirmDelete}
          color="error"
          variant="contained"
          sx={{ borderRadius: 1 }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>

    {/* Snackbar Notification */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity={snackbar.type}
        sx={{ width: "100%", borderRadius: 2 }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  </Box>
      </Box>
    
  );
};

export default SuperAdminStockEdit;
   
  