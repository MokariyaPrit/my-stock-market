import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserData } from "../services/userService";
import { getTransactions } from "../services/transactionService";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { Transaction } from "../types/transaction";

const UserProfileView = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return;
        const user = await getUserData(userId);
        const allTransactions = await getTransactions();
        const userTransactions = allTransactions.filter((t) => t.userId === userId);

        setUserData(user);
        setTransactions(userTransactions);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <Container>
        <Typography variant="h6" align="center">
          Loading user profile...
        </Typography>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container>
        <Typography variant="h6" align="center" color="error">
          User not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {userData.name}'s Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Coins: {userData.coins.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>
        Trade History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Stock</TableCell>
              <TableCell align="right">Type</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.stockName}</TableCell>
                <TableCell align="right">
                  <Chip
                    label={transaction.type.toUpperCase()}
                    color={transaction.type === "buy" ? "success" : "error"}
                  />
                </TableCell>
                <TableCell align="right">₹{transaction.price.toFixed(2)}</TableCell>
                <TableCell align="right">{transaction.quantity}</TableCell>
                <TableCell align="right">
                  {new Date(transaction.timestamp).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default UserProfileView;
