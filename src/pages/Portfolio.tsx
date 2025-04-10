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
  Card,
  CardContent,
  Divider
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
  const [sortKey, setSortKey] = useState<"symbol" | "quantity" | "value" | "pl" | "buying" | "current">("symbol");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToStockPrices((stocks) => {
      const prices = stocks.reduce((acc, stock) => {
        const symbol = stock.symbol?.trim() || "";
        if (symbol) acc[symbol] = stock.price || 0;
        return acc;
      }, {} as { [key: string]: number });
      setStockPrices(prices);
    });

    const fetchData = async () => {
      try {
        const userData = await getUserData(user.uid);
        const formattedPortfolio = userData?.ownedStocks
          ? Object.entries(userData.ownedStocks)
              .map(([symbol, quantity]) => ({
                symbol: symbol.trim(),
                quantity: Number(quantity) || 0,
              }))
              .filter(stock => stock.symbol)
          : [];
        setPortfolio(formattedPortfolio);

        const allTransactions = await getTransactions();
        const userTransactions: Transaction[] = allTransactions.filter(
          (t) => t.userId === user.uid
        );
        setTransactions(userTransactions);

        const stocks = await getStocks();
        const initialPrices = stocks.reduce((acc, stock) => {
          const symbol = stock.symbol?.trim() || "";
          if (symbol) acc[symbol] = stock.price || 0;
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
    return () => unsubscribe();
  }, [user?.uid]);

  const getBuyingPrice = (symbol: string): number => {
    const buyTransactions = transactions.filter(
      (t) => t.stockSymbol === symbol && t.type === "buy"
    );
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

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedPortfolio = [...portfolio].sort((a, b) => {
    const aBuyingPrice = getBuyingPrice(a.symbol);
    const bBuyingPrice = getBuyingPrice(b.symbol);
    const aCurrentPrice = stockPrices[a.symbol] || 0;
    const bCurrentPrice = stockPrices[b.symbol] || 0;

    let aValue = aCurrentPrice * a.quantity;
    let bValue = bCurrentPrice * b.quantity;

    let aPL = aBuyingPrice ? ((aCurrentPrice - aBuyingPrice) / aBuyingPrice) * 100 : 0;
    let bPL = bBuyingPrice ? ((bCurrentPrice - bBuyingPrice) / bBuyingPrice) * 100 : 0;

    const compare = {
      symbol: a.symbol.localeCompare(b.symbol),
      quantity: a.quantity - b.quantity,
      value: aValue - bValue,
      pl: aPL - bPL,
      buying: aBuyingPrice - bBuyingPrice,
      current: aCurrentPrice - bCurrentPrice,
    };

    const result = compare[sortKey];
    return sortOrder === "asc" ? result : -result;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Card sx={{ boxShadow:'0 2px 12px rgba(0, 0, 0, 0.08)', p: 4, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={600} textAlign="center" gutterBottom>
          Portfolio Overview
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary">
          Total Value: ₹{calculateTotalValue().toFixed(2)}
        </Typography>
      </Card>

      <Box mt={4}>
        {isMobile ? (
          <Grid container spacing={3}>
            {sortedPortfolio.map((stock) => {
              const buyingPrice = getBuyingPrice(stock.symbol);
              const currentPrice = stockPrices[stock.symbol] || 0;
              const profitLossPercent = buyingPrice
                ? ((currentPrice - buyingPrice) / buyingPrice) * 100
                : 0;

              return (
                <Grid item xs={12} key={stock.symbol}>
                  <Card sx={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600}>{stock.symbol}</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography>Quantity: {stock.quantity}</Typography>
                      <Typography>Buying Price: ₹{buyingPrice.toFixed(2)}</Typography>
                      <Typography>Current Price: ₹{currentPrice.toFixed(2)}</Typography>
                      <Typography sx={{ mt: 1 }}>
                        P/L:
                        <Chip
                          label={`${profitLossPercent.toFixed(2)}%`}
                          color={profitLossPercent >= 0 ? "success" : "error"}
                          icon={profitLossPercent >= 0 ? <TrendingUp /> : <TrendingDown />}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => handleSort("symbol")} style={{ cursor: "pointer" }}>
                    Stock {sortKey === "symbol" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                  </TableCell>
                  <TableCell align="right" onClick={() => handleSort("quantity")} style={{ cursor: "pointer" }}>
                    Quantity {sortKey === "quantity" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                  </TableCell>
                  <TableCell align="right" onClick={() => handleSort("buying")} style={{ cursor: "pointer" }}>
                    Buying Price {sortKey === "buying" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                  </TableCell>
                  <TableCell align="right" onClick={() => handleSort("current")} style={{ cursor: "pointer" }}>
                    Current Price {sortKey === "current" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                  </TableCell>
                  <TableCell align="right" onClick={() => handleSort("value")} style={{ cursor: "pointer" }}>
                    Value {sortKey === "value" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                  </TableCell>
                  <TableCell align="right" onClick={() => handleSort("pl")} style={{ cursor: "pointer" }}>
                    P/L % {sortKey === "pl" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedPortfolio.map((stock) => {
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
      </Box>
    </Container>
  );
};

export default Portfolio;