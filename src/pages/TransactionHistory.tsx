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
  Card,
  CardContent,
} from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Mobile if < 600px

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
    setPage(0); // Reset to first page when rows per page changes
  };

  // Calculate paginated transactions
  const paginatedTransactions = transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f4f6f8",
        py: { xs: 2, sm: 4 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 900, px: { xs: 2, sm: 0 } }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#1976d2",
            mb: 4,
          }}
        >
          Transaction History
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : transactions.length > 0 ? (
          <>
            {isMobile ? (
              // Mobile: Card-based layout
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {paginatedTransactions.map((t, index) => (
                  <Card
                    key={index}
                    sx={{
                      borderRadius: 2,
                      boxShadow: 3,
                      bgcolor: "white",
                      p: 2,
                    }}
                  >
                    <CardContent sx={{ p: 1, textAlign: "center" }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}>
                        {t.stockName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        <strong>Type:</strong>{" "}
                        <Chip
                          icon={t.type === "buy" ? <ArrowUpward /> : <ArrowDownward />}
                          label={t.type.toUpperCase()}
                          color={t.type === "buy" ? "success" : "error"}
                          variant="outlined"
                          size="small"
                        />
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        <strong>Price:</strong> ₹{t.price}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        <strong>Quantity:</strong> {t.quantity}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        <strong>Subtotal:</strong> ₹{(t.price * t.quantity).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#555", mt: 1 }}>
                        <strong>Date:</strong>{" "}
                        {new Date(t.timestamp).toLocaleString(undefined, {
                          month: "numeric",
                          day: "numeric",
                          year: "2-digit",
                        })}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              // Desktop/Tablet: Table layout
              <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 4 }}>
                <TableContainer>
                  <Table size="medium">
                    <TableHead sx={{ bgcolor: "#1976d2" }}>
                      <TableRow>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Stock (Symbol)</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">
                          Type
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">
                          Price
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">
                          Qty
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">
                          Subtotal
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">
                          Date
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedTransactions.map((t, index) => (
                        <TableRow
                          key={index}
                          hover
                          sx={{ bgcolor: index % 2 === 0 ? "#fafafa" : "white" }}
                        >
                          <TableCell>{`${t.stockName} (${t.stockSymbol})`}</TableCell>
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
                          <TableCell align="right">{new Date(t.timestamp).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
            {/* Pagination at the Bottom */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={transactions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ mt: 2, display: "flex", justifyContent: "center" }}
            />
          </>
        ) : (
          <Typography variant="body1" sx={{ textAlign: "center", mt: 4, color: "#555" }}>
            No transactions found.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TransactionHistory;