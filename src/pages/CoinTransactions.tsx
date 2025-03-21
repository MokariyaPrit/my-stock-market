import { useEffect, useState } from "react";
import {
  getUserCoinRequests,
  getUserCoinBalance,
  getUserTransactionHistory,
} from "../services/coinService";
import { useAuth } from "../context/AuthContext";
import {
  Typography,
  Container,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
} from "@mui/material";

interface CoinTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  createdAt: string;
}

interface CoinRequest {
  id: string;
  coinAmount: number; // ✅ Fixed naming
  status: "pending" | "approved" | "rejected";
  createdAt: string; // ✅ Ensure correct date handling
}

const CoinTransactions = () => {
  const { user } = useAuth();
  const [coins, setCoins] = useState<number | null>(null);
  const [coinHistory, setCoinHistory] = useState<CoinTransaction[]>([]);
  const [pendingRequests, setPendingRequests] = useState<CoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const balance = await getUserCoinBalance(user.uid);
        setCoins(balance);

        const transactions = await getUserTransactionHistory(user.uid);
        setCoinHistory(
          transactions.map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: t.amount ?? 0, // ✅ Ensure amount exists
            createdAt: t.createdAt ?? new Date().toISOString(), // ✅ Fix missing date
          }))
        );

        const requests = await getUserCoinRequests(user.uid);
        if (!Array.isArray(requests)) {
          throw new Error("Invalid coin requests data received");
        }

        setPendingRequests(
          requests.map((r: any) => ({
            id: r.id,
            coinAmount: r.amount ?? r.coinAmount ?? 0, // ✅ Fix naming
            status: r.status,
            createdAt: r.requestedAt ?? r.createdAt ?? new Date().toISOString(), // ✅ Ensure correct timestamp
          }))
        );
      } catch (err) {
        setError("Failed to load data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]); // ✅ Ensure it updates when `user` changes

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Coin Transactions
      </Typography>

      {/* Show Coin Balance */}
      <Card sx={{ mt: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h6">Your Coin Balance 💰</Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <Typography variant="h5">
              {coins !== null
                ? `${coins.toLocaleString()} Coins`
                : "Error loading coins"}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests */}
     {/* Pending Requests */}
{pendingRequests.length > 0 && (
  <Card sx={{ mt: 3, p: 2 }}>
    <CardContent>
      <Typography variant="h6">Approved Coin Requests</Typography>
      <List>
        {pendingRequests
          .filter((request) => request.status === "approved") // ✅ Show only approved requests
          .map((request) => (
            <ListItem key={request.id}>
              <ListItemText
                primary={`Approved: ${request.coinAmount} Coins`}
                secondary={`Date: ${new Date(request.createdAt).toLocaleString()}`}
                sx={{
                  color: "green",
                }}
              />
            </ListItem>
          ))}
      </List>
    </CardContent>
  </Card>
)}


      {/* Coin Transaction History */}
      <Card sx={{ mt: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h6">Coin Transaction History</Typography>
          {coinHistory.length === 0 ? (
            <Typography>No transactions found.</Typography>
          ) : (
            <List>
              {coinHistory.map((transaction) => (
                <ListItem key={transaction.id}>
                  <ListItemText
                    primary={`${transaction.type.toUpperCase()}: ${transaction.amount} Coins`}
                    secondary={`Date: ${new Date(transaction.createdAt).toLocaleString()}`}
                    sx={{
                      color: transaction.type === "credit" ? "green" : "red",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default CoinTransactions;
