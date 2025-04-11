import { useState, useEffect } from "react";
import { updateStockShares, getLastUpdateTimestamp } from "../services/stockService";
import { addTransaction } from "../services/transactionService";
import { getUserData, updateUserCoins, updateUserStocks } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { Stock } from "../types/stock";
import {
  Typography,
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Divider,
} from "@mui/material";
import StockSearch from "../components/StockSearch";
import { CheckCircle, WarningAmber } from "@mui/icons-material";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

const StockTrade = () => {
  const { user } = useAuth();
  const [_, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [coins, setCoins] = useState<number>(0);
  const [ownedStocks, setOwnedStocks] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const [, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });
  const [timeLeft, setTimeLeft] = useState<string>("Loding"); // Initial value

  const [openBuyDialog, setOpenBuyDialog] = useState(false);
  const [openSellDialog, setOpenSellDialog] = useState(false);

  // Timer logic
  useEffect(() => {
    const updateInterval = 300000; // 5 minutes in milliseconds
    const checkInterval = 1000; // Update every second

    const calculateTimeLeft = (lastUpdate: number) => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdate;
      const timeRemaining = updateInterval - (timeSinceLastUpdate % updateInterval);

      const minutes = Math.floor(timeRemaining / 60000);
      const seconds = Math.floor((timeRemaining % 60000) / 1000);
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const syncTimerWithGlobalUpdate = async () => {
      try {
        const lastUpdate = await getLastUpdateTimestamp();
        setTimeLeft(calculateTimeLeft(lastUpdate));
      } catch (error) {
        console.error("❌ Error syncing timer with global update:", error);
        setTimeLeft("Error: Unable to fetch update time"); // Display error message
      }
    };

    syncTimerWithGlobalUpdate();

    const timer = setInterval(() => {
      syncTimerWithGlobalUpdate();
    }, checkInterval);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "stocks"), (snapshot) => {
      const stockData: Stock[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Stock[];
      setStocks(stockData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const userData = await getUserData(user.uid);
      if (userData) {
        setCoins(userData.coins || 0);
        setOwnedStocks(userData.ownedStocks || {});
      }
    };

    fetchUserData();
  }, [user]);

  const calculateTotal = () => {
    if (selectedStock && quantity > 0) {
      return selectedStock.price * quantity;
    }
    return 0;
  };

  const confirmBuyStock = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setOpenBuyDialog(false);

    if (!selectedStock || !user || quantity < 1 || quantity > selectedStock.availableShares) {
      setError("Invalid stock selection or quantity");
      setIsProcessing(false);
      return;
    }

    const totalCost = selectedStock.price * quantity;
    if (coins < totalCost) {
      setError("Not enough coins");
      setIsProcessing(false);
      return;
    }

    try {
      await addTransaction({
        userId: user.uid,
        stockSymbol: selectedStock.symbol,
        stockName: selectedStock.name,
        price: selectedStock.price,
        quantity,
        type: "buy",
        timestamp: new Date(),
      });

      await updateStockShares(selectedStock.id, selectedStock.availableShares - quantity);
      await updateUserCoins(user.uid, coins - totalCost);

      const updatedUser = await getUserData(user.uid);
      setCoins(updatedUser?.coins || 0);

      await updateUserStocks(user.uid, {
        ...ownedStocks,
        [selectedStock.symbol]: (ownedStocks[selectedStock.symbol] || 0) + quantity,
      });

      setSnackbar({ open: true, message: "Stock purchased successfully!", type: "success" });
      navigate("/portfolio");
    } catch (error) {
      setSnackbar({ open: true, message: "Transaction failed", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmSellStock = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setOpenSellDialog(false);

    if (!selectedStock || !user) {
      setError("Select a stock and login first.");
      setIsProcessing(false);
      return;
    }
    if (quantity < 1) {
      setError("Quantity must be at least 1.");
      setIsProcessing(false);
      return;
    }

    const ownedQuantity = ownedStocks[selectedStock.symbol] || 0;
    if (quantity > ownedQuantity) {
      setError("Not enough shares to sell.");
      setIsProcessing(false);
      return;
    }

    const totalSale = selectedStock.price * quantity;

    try {
      await addTransaction({
        userId: user.uid,
        stockSymbol: selectedStock.symbol,
        stockName: selectedStock.name,
        price: selectedStock.price,
        quantity,
        type: "sell",
        timestamp: new Date(),
      });

      await updateStockShares(selectedStock.id, selectedStock.availableShares + quantity);
      await updateUserCoins(user.uid, coins + totalSale);

      const updatedUser = await getUserData(user.uid);
      setCoins(updatedUser?.coins || 0);

      await updateUserStocks(user.uid, {
        ...ownedStocks,
        [selectedStock.symbol]: ownedQuantity - quantity,
      });

      setSnackbar({ open: true, message: "Stock sold successfully!", type: "success" });
      navigate("/portfolio");
    } catch (error) {
      setSnackbar({ open: true, message: "Transaction failed", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h4" gutterBottom>Stock Trading</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Next Price Update In: {timeLeft}
        </Typography>
      </Box>

      <Card sx={{ p: 2, mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Your Coin Balance 💰</Typography>
          <Typography variant="h5">{coins.toLocaleString()} Coins</Typography>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <StockSearch onSelectStock={setSelectedStock} />

      <TextField
        fullWidth
        label="Quantity"
        type="number"
        value={quantity || ""}
        onChange={(e) => setQuantity(Number(e.target.value))}
        margin="normal"
        required
        inputProps={{ min: 1 }}
      />

      {/* Add this Card component to show the total */}
      {selectedStock && quantity > 0 && (
        <Card sx={{ my: 2, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transaction Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>Price per share:</Typography>
              <Typography>₹{selectedStock.price.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography>Quantity:</Typography>
              <Typography>{quantity}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">₹{calculateTotal().toFixed(2)}</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <Button variant="contained" color="primary" onClick={() => setOpenBuyDialog(true)} fullWidth sx={{ mt: 2 }} disabled={isProcessing}>
        Buy
      </Button>

      <Button variant="contained" color="secondary" onClick={() => setOpenSellDialog(true)} fullWidth sx={{ mt: 2 }} disabled={isProcessing}>
        Sell
      </Button>

      {/* Buy Confirmation Dialog */}
      <Dialog open={openBuyDialog} onClose={() => setOpenBuyDialog(false)}>
        <Box sx={{ textAlign: "center", p: 3 }}>
          <CheckCircle sx={{ fontSize: 60, color: "green" }} />
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to buy {quantity} shares of {selectedStock?.name}?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBuyDialog(false)}>Cancel</Button>
            <Button onClick={confirmBuyStock} color="primary" variant="contained">Confirm</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Sell Confirmation Dialog */}
      <Dialog open={openSellDialog} onClose={() => setOpenSellDialog(false)}>
        <Box sx={{ textAlign: "center", p: 3 }}>
          <WarningAmber sx={{ fontSize: 60, color: "red" }} />
          <DialogTitle>Confirm Sale</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to sell {quantity} shares of {selectedStock?.name}?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSellDialog(false)}>Cancel</Button>
            <Button onClick={confirmSellStock} color="error" variant="contained">Sell</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
};

export default StockTrade;