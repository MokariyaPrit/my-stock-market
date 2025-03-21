// import { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import {
//   Typography,
//   Container,
//   TextField,
//   Button,
//   Card,
//   CardContent,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Box,
//   Alert,
// } from "@mui/material";
// import { CheckCircle, WarningAmber } from "@mui/icons-material";
// import { getUserData, updateUserCoins, updateUserStocks } from "../services/userService";
// import { addTransaction } from "../services/transactionService";
// import { scheduleStockUpdates } from "../services/realStockService";
// import RealStockSearch from "./RealStockSearch";
// import { useNavigate } from "react-router-dom";
// import { Stock } from "../types/stock";

// const RealStockTrade = () => {
//   const { user } = useAuth();
//   const [quantity, setQuantity] = useState<number>(1);
//   const [coins, setCoins] = useState<number>(0);
//   const [ownedStocks, setOwnedStocks] = useState<{ [key: string]: number }>({});
//   const [error, setError] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const navigate = useNavigate();
//   const [openBuyDialog, setOpenBuyDialog] = useState(false);
//   const [openSellDialog, setOpenSellDialog] = useState(false);
//   const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
//   const [currentTime, setCurrentTime] = useState<string>(""); // State for live timer

//   useEffect(() => {
//     if (!user) return;

//     const fetchUserData = async () => {
//       try {
//         const userData = await getUserData(user.uid);
//         if (userData) {
//           setCoins(userData.coins || 0);
//           setOwnedStocks(userData.ownedStocks || {});
//         }
//       } catch (error) {
//         console.error("Failed to fetch user data:", error);
//       }
//     };
//     fetchUserData();

//     // Schedule stock updates
//     const unsubscribeStockUpdates = scheduleStockUpdates((stocks) => {
//       if (selectedStock) {
//         const updatedStock = stocks.find((stock) => stock.symbol === selectedStock.symbol);
//         if (updatedStock) {
//           setSelectedStock(updatedStock);
//           console.log("Updated selected stock:", updatedStock);
//         }
//       }
//     });

//     // Live timer updating every second
//     const updateTimer = () => {
//       const now = new Date();
//       const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
//       const istTime = new Date(now.getTime() + istOffset);
//       const hours = istTime.getHours().toString().padStart(2, "0");
//       const minutes = istTime.getMinutes().toString().padStart(2, "0");
//       const seconds = istTime.getSeconds().toString().padStart(2, "0");
//       setCurrentTime(`${hours}:${minutes}:${seconds}`);
//     };
//     updateTimer(); // Initial call
//     const timerInterval = setInterval(updateTimer, 1000); // Update every second

//     return () => {
//       unsubscribeStockUpdates();
//       clearInterval(timerInterval); // Clean up timer on unmount
//     };
//   }, [user, selectedStock?.symbol]);

//   const handleStockSelect = (stock: Stock) => {
//     console.log("Stock selected in RealStockTrade:", stock);
//     setSelectedStock(stock);
//     setError(null);
//   };

//   const confirmBuyStock = async () => {
//     if (!selectedStock || !user || quantity < 1) {
//       setError("Invalid stock selection or quantity");
//       return;
//     }

//     setIsProcessing(true);
//     setOpenBuyDialog(false);
//     const totalCost = selectedStock.price * quantity;

//     if (coins < totalCost) {
//       setError("Not enough coins");
//       setIsProcessing(false);
//       return;
//     }

//     try {
//       await addTransaction({
//         userId: user.uid,
//         stockSymbol: selectedStock.symbol,
//         stockName: selectedStock.name,
//         price: selectedStock.price,
//         quantity,
//         type: "buy",
//         timestamp: new Date(),
//       });

//       await updateUserCoins(user.uid, coins - totalCost);
//       setCoins(coins - totalCost);
//       await updateUserStocks(user.uid, {
//         ...ownedStocks,
//         [selectedStock.symbol]: (ownedStocks[selectedStock.symbol] || 0) + quantity,
//       });
//       navigate("/portfolio");
//     } catch (error) {
//       console.error("Buy transaction failed:", error);
//       setError("Transaction failed");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const confirmSellStock = async () => {
//     if (!selectedStock || !user || quantity < 1) {
//       setError("Invalid stock selection or quantity");
//       return;
//     }

//     setIsProcessing(true);
//     setOpenSellDialog(false);
//     const ownedQuantity = ownedStocks[selectedStock.symbol] || 0;

//     if (quantity > ownedQuantity) {
//       setError("Not enough shares to sell");
//       setIsProcessing(false);
//       return;
//     }

//     const totalSale = selectedStock.price * quantity;

//     try {
//       await addTransaction({
//         userId: user.uid,
//         stockSymbol: selectedStock.symbol,
//         stockName: selectedStock.name,
//         price: selectedStock.price,
//         quantity,
//         type: "sell",
//         timestamp: new Date(),
//       });

//       await updateUserCoins(user.uid, coins + totalSale);
//       setCoins(coins + totalSale);
//       await updateUserStocks(user.uid, {
//         ...ownedStocks,
//         [selectedStock.symbol]: ownedQuantity - quantity,
//       });
//       navigate("/portfolio");
//     } catch (error) {
//       console.error("Sell transaction failed:", error);
//       setError("Transaction failed");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Format lastUpdated timestamp to HH:MM:SS IST (optional, for reference)
//   const formatLastUpdated = (isoString?: string): string => {
//     if (!isoString) return "N/A";
//     const date = new Date(isoString);
//     const istOffset = 5.5 * 60 * 60 * 1000;
//     const istDate = new Date(date.getTime() + istOffset);
//     const hours = istDate.getHours().toString().padStart(2, "0");
//     const minutes = istDate.getMinutes().toString().padStart(2, "0");
//     const seconds = istDate.getSeconds().toString().padStart(2, "0");
//     return `${hours}:${minutes}:${seconds}`;
//   };

//   return (
//     <Container sx={{ mt: 4, mb: 4 }}>
//       <Typography variant="h4">Real Stock Trading</Typography>
//       <Card sx={{ p: 2, mb: 2 }}>
//         <CardContent>
//           <Typography variant="h6">Your Coin Balance 💰</Typography>
//           <Typography variant="h5">{coins.toLocaleString()} Coins</Typography>
//         </CardContent>
//       </Card>

//       {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

//       <RealStockSearch onSelectStock={handleStockSelect} />

//       {selectedStock && (
//         <Box sx={{ mt: 2, mb: 2 }}>
//           <Typography>
//             Selected: {selectedStock.name} (₹{selectedStock.price.toFixed(2)})
//           </Typography>
//           <Typography>
//             Last Price Update: {formatLastUpdated(selectedStock.lastUpdated)}
//           </Typography>
//           <Typography>
//             Current Time: {currentTime} IST
//           </Typography>
//         </Box>
//       )}

//       <TextField
//         fullWidth
//         label="Quantity"
//         type="number"
//         value={quantity}
//         onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
//         margin="normal"
//         required
//         inputProps={{ min: 1 }}
//         disabled={!selectedStock}
//       />

//       <Button
//         variant="contained"
//         color="primary"
//         onClick={() => setOpenBuyDialog(true)}
//         fullWidth
//         sx={{ mt: 2 }}
//         disabled={!selectedStock || isProcessing}
//       >
//         Buy
//       </Button>

//       <Button
//         variant="contained"
//         color="secondary"
//         onClick={() => setOpenSellDialog(true)}
//         fullWidth
//         sx={{ mt: 2 }}
//         disabled={!selectedStock || isProcessing}
//       >
//         Sell
//       </Button>

//       <Dialog open={openBuyDialog} onClose={() => setOpenBuyDialog(false)}>
//         <Box sx={{ textAlign: "center", p: 3 }}>
//           <CheckCircle sx={{ fontSize: 60, color: "green" }} />
//           <DialogTitle>Confirm Purchase</DialogTitle>
//           <DialogContent>
//             <Typography>
//               {selectedStock
//                 ? `Buy ${quantity} shares of ${selectedStock.name} for ₹${(
//                     selectedStock.price * quantity
//                   ).toFixed(2)}?`
//                 : "No stock selected"}
//             </Typography>
//             {selectedStock && (
//               <>
//                 <Typography>
//                   Price Last Updated: {formatLastUpdated(selectedStock.lastUpdated)}
//                 </Typography>
//                 <Typography>
//                   Current Time: {currentTime} IST
//                 </Typography>
//               </>
//             )}
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setOpenBuyDialog(false)} disabled={isProcessing}>
//               Cancel
//             </Button>
//             <Button
//               onClick={confirmBuyStock}
//               color="primary"
//               variant="contained"
//               disabled={isProcessing || !selectedStock}
//             >
//               Confirm
//             </Button>
//           </DialogActions>
//         </Box>
//       </Dialog>

//       <Dialog open={openSellDialog} onClose={() => setOpenSellDialog(false)}>
//         <Box sx={{ textAlign: "center", p: 3 }}>
//           <WarningAmber sx={{ fontSize: 60, color: "red" }} />
//           <DialogTitle>Confirm Sale</DialogTitle>
//           <DialogContent>
//             <Typography>
//               {selectedStock
//                 ? `Sell ${quantity} shares of ${selectedStock.name} for ₹${(
//                     selectedStock.price * quantity
//                   ).toFixed(2)}?`
//                 : "No stock selected"}
//             </Typography>
//             {selectedStock && (
//               <>
//                 <Typography>
//                   Price Last Updated: {formatLastUpdated(selectedStock.lastUpdated)}
//                 </Typography>
//                 <Typography>
//                   Current Time: {currentTime} IST
//                 </Typography>
//               </>
//             )}
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setOpenSellDialog(false)} disabled={isProcessing}>
//               Cancel
//             </Button>
//             <Button
//               onClick={confirmSellStock}
//               color="error"
//               variant="contained"
//               disabled={isProcessing || !selectedStock}
//             >
//               Sell
//             </Button>
//           </DialogActions>
//         </Box>
//       </Dialog>
//     </Container>
//   );
// };

// export default RealStockTrade;