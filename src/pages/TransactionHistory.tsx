import { useState, useEffect } from "react";
import { getTransactions } from "../services/transactionService";
import { Transaction } from "../types/transaction";
import { useAuth } from "../context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  useMediaQuery,
  useTheme,
  Chip,
  TablePagination,
} from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const allTransactions = await getTransactions();

        if (!user || !user.uid) {
          console.warn("❌ User not found, cannot filter transactions.");
          setLoading(false);
          return;
        }

        const userTransactions = allTransactions
          .filter((t) => t.userId && t.userId === user.uid)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setTransactions(userTransactions);
      } catch (error) {
        console.error("❌ Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 4, minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 3 }}>
        Transaction History
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : transactions.length > 0 ? (
        <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
          <TableContainer>
            <Table size={isMobile ? "small" : "medium"}> {/* Responsive Table Size */}
              <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>
                    {isMobile ? "Stock" : "Stock (Symbol)"} {/* Conditionally Render Column Header */}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }} align="right">
                    Type
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }} align="right">
                    Price
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }} align="right">
                    Qty
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }} align="right">
                    Subtotal
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }} align="right">
                    Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((t, index) => (
                    <TableRow
                      key={index}
                      sx={{ bgcolor: index % 2 === 0 ? "#fafafa" : "#ffffff" }}
                    >
                      <TableCell>
                        {isMobile ? `${t.stockName}` : `${t.stockName} (${t.stockSymbol})`} {/* Conditionally render stock name or stock name with symbol */}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          icon={t.type === "buy" ? <ArrowUpward /> : <ArrowDownward />}
                          label={t.type.toUpperCase()}
                          color={t.type === "buy" ? "success" : "error"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">₹{t.price}</TableCell>
                      <TableCell align="right">{t.quantity}</TableCell>
                      <TableCell align="right">₹{(t.price * t.quantity).toFixed(2)}</TableCell>
                      <TableCell align="right">
                        {new Date(t.timestamp).toLocaleString(undefined, isMobile ? {month: 'numeric', day: 'numeric', year: '2-digit'} : undefined)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={transactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      ) : (
        <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
          No transactions found.
        </Typography>
      )}
    </Box>
  );
};
  
export default TransactionHistory;