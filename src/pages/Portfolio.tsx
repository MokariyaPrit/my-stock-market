import { useState, useEffect } from "react";
import { getUserData } from "../services/userService";
import { getStocks, subscribeToStockPrices } from "../services/stockService"; // Fix missing import
import { getTransactions } from "../services/transactionService";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Typography,
  Box,
  // useMediaQuery,
  // useTheme,
  Card,
} from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid"; // Add DataGrid and GridToolbar for filtering
import { Transaction } from "../types/transaction";

interface PortfolioStock {
  symbol: string;
  quantity: number;
}

const Portfolio = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([]);
  const [stockPrices, setStockPrices] = useState<{ [key: string]: number }>({});
  const [stockNames, setStockNames] = useState<{ [key: string]: string }>({}); // Add state for stock names
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToStockPrices((stocks: { symbol: string; price: number }[]) => {
      const prices = stocks.reduce((acc: { [key: string]: number }, stock) => {
        const symbol = stock.symbol?.trim() || "";
        if (symbol) acc[symbol] = stock.price || 0;
        return acc;
      }, {});
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

        const names = stocks.reduce((acc, stock) => {
          const symbol = stock.symbol?.trim() || "";
          if (symbol) acc[symbol] = stock.name || ""; // Extract stock names
          return acc;
        }, {} as { [key: string]: string });
        setStockNames(names);
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
        setPortfolio([]);
        setTransactions([]);
        setStockPrices({});
        setStockNames({});
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


  const columns: GridColDef[] = [
    { field: "name", headerName: "Stock Name", flex: 1, sortable: true },
    { field: "symbol", headerName: "Symbol", flex: 1, sortable: true },
    { field: "quantity", headerName: "Quantity", flex: 1, sortable: true, type: "number" },
    { field: "buyingPrice", headerName: "Buying Price", flex: 1, sortable: true, type: "number" },
    { field: "currentPrice", headerName: "Current Price", flex: 1, sortable: true, type: "number" },
    { field: "value", headerName: "Value", flex: 1, sortable: true, type: "number" },
    { field: "pl", headerName: "P/L %", flex: 1, sortable: true, type: "number" },
  ];

  const rows = portfolio.map((stock, index) => {
    const buyingPrice = getBuyingPrice(stock.symbol);
    const currentPrice = stockPrices[stock.symbol] || 0;
    const totalValue = currentPrice * stock.quantity;
    const profitLossPercent = buyingPrice
      ? ((currentPrice - buyingPrice) / buyingPrice) * 100
      : 0;

    return {
      id: index,
      name: stockNames[stock.symbol] || "Unknown Name",
      symbol: stock.symbol,
      quantity: stock.quantity,
      buyingPrice: buyingPrice,
      currentPrice: currentPrice,
      value: totalValue,
      pl: profitLossPercent,
    };
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Card sx={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', p: 4, borderRadius: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" fontWeight={600} textAlign="center" gutterBottom>
            Portfolio Overview
          </Typography>
          </Box>
        <Typography variant="h6" textAlign="center" color="text.secondary">
          Total Value: ₹{calculateTotalValue().toFixed(2)}
        </Typography>
      </Card>

      <Box mt={4} sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          density="comfortable"
          sortingMode="client" // Enable client-side sorting
          hideFooterPagination
          slots={{
            toolbar: GridToolbar, // Add toolbar for filtering
          }}
          sx={{
            "& .MuiDataGrid-cell": {
              whiteSpace: "normal",
              lineHeight: "normal",
            },
          }}
        />
      </Box>
    </Container>
  );
};

export default Portfolio;