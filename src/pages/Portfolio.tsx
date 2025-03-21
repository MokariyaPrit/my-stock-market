import { useState, useEffect } from "react";
import { getUserData } from "../services/userService";
import { getStocks, subscribeToStockPrices } from "../services/stockService";
import { getTransactions } from "../services/transactionService";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  useMediaQuery,
  useTheme,
  Grid,
} from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import { Transaction } from "../types/transaction";

interface PortfolioStock {
  symbol: string;
  quantity: number;
}

const Portfolio = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([]);
  const [stockPrices, setStockPrices] = useState<{ [key: string]: number }>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!user?.uid) return;

    // Set up real-time stock price subscription
    const unsubscribe = subscribeToStockPrices((stocks) => {
      const prices = stocks.reduce((acc, stock) => {
        const symbol = stock.symbol ? stock.symbol.trim() : '';
        if (symbol) {
          acc[symbol] = stock.price || 0;
        }
        return acc;
      }, {} as { [key: string]: number });
      setStockPrices(prices);
    });

    const fetchData = async () => {
      try {
        // Fetch user portfolio
        const userData = await getUserData(user.uid);
        const formattedPortfolio = userData?.ownedStocks
          ? Object.entries(userData.ownedStocks).map(([symbol, quantity]) => ({
              symbol: symbol ? symbol.trim() : '',
              quantity: Number(quantity) || 0,
            })).filter(stock => stock.symbol) // Remove entries with empty symbols
          : [];
        setPortfolio(formattedPortfolio);

        // Fetch transactions
        const allTransactions = await getTransactions();
        const userTransactions: Transaction[] = allTransactions.filter(
          (t) => t.userId === user.uid
        );
        setTransactions(userTransactions);

        // Initial stock prices fetch as fallback
        const stocks = await getStocks();
        const initialPrices = stocks.reduce((acc, stock) => {
          const symbol = stock.symbol ? stock.symbol.trim() : '';
          if (symbol) {
            acc[symbol] = stock.price || 0;
          }
          return acc;
        }, {} as { [key: string]: number });
        setStockPrices(initialPrices);
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
        setPortfolio([]);
        setTransactions([]);
        setStockPrices({});
      }
    };

    fetchData();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user?.uid]);

  const getBuyingPrice = (symbol: string): number => {
    if (!symbol || transactions.length === 0) return 0;

    const buyTransactions = transactions.filter(
      (t) => t.stockSymbol === symbol && t.type === "buy"
    );

    if (buyTransactions.length === 0) return 0;

    const totalCost = buyTransactions.reduce(
      (sum, t) => sum + (t.price || 0) * (t.quantity || 0),
      0
    );
    const totalQuantity = buyTransactions.reduce(
      (sum, t) => sum + (t.quantity || 0),
      0
    );

    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
  };

  const calculateTotalValue = (): number => {
    return portfolio.reduce((total, stock) => {
      const currentPrice = stockPrices[stock.symbol] || 0;
      return total + (currentPrice * stock.quantity);
    }, 0);
  };

  return (
    <Container
      maxWidth="md"
      sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", mt: 4 }}
    >
      <Box mb={4} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Portfolio
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Total Value: ₹{calculateTotalValue().toFixed(2)}
        </Typography>
      </Box>

      {isMobile ? (
        <Grid container spacing={2} justifyContent="center">
          {portfolio.map((stock) => {
            const buyingPrice = getBuyingPrice(stock.symbol);
            const currentPrice = stockPrices[stock.symbol] || 0;
            const profitLossPercent = buyingPrice
              ? ((currentPrice - buyingPrice) / buyingPrice) * 100
              : 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={stock.symbol}>
                <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h6">{stock.symbol}</Typography>
                  <Typography>Quantity: {stock.quantity}</Typography>
                  <Typography>Buying Price: ₹{buyingPrice.toFixed(2)}</Typography>
                  <Typography>Current Price: ₹{currentPrice.toFixed(2)}</Typography>
                  <Typography>
                    P/L:
                    <Chip
                      label={`${profitLossPercent.toFixed(2)}%`}
                      color={profitLossPercent >= 0 ? "success" : "error"}
                      icon={profitLossPercent >= 0 ? <TrendingUp /> : <TrendingDown />}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Stock</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Buying Price</TableCell>
                <TableCell align="right">Current Price</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell align="right">P/L %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolio.map((stock) => {
                const buyingPrice = getBuyingPrice(stock.symbol);
                const currentPrice = stockPrices[stock.symbol] || 0;
                const profitLossPercent = buyingPrice
                  ? ((currentPrice - buyingPrice) / buyingPrice) * 100
                  : 0;
                const totalValue = currentPrice * stock.quantity;

                return (
                  <TableRow key={stock.symbol}>
                    <TableCell>{stock.symbol}</TableCell>
                    <TableCell align="right">{stock.quantity}</TableCell>
                    <TableCell align="right">₹{buyingPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{currentPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{totalValue.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${profitLossPercent.toFixed(2)}%`}
                        color={profitLossPercent >= 0 ? "success" : "error"}
                        icon={profitLossPercent >= 0 ? <TrendingUp /> : <TrendingDown />}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Portfolio;