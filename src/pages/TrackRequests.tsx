import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserCoinRequests } from '../services/coinService';
import { CoinRequest } from '../types/CoinRequest';
import { Box, Card, CardContent, Typography, Button, Chip, Divider, CircularProgress } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const TrackRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const userRequests = await getUserCoinRequests(user.uid);
    
    
        const formattedRequests: CoinRequest[] = userRequests
          .map((req: any) => ({
            id: req.id,
            userId: req.userId || user.uid,
            coinAmount: req.coinAmount ?? req.amount ?? 0,
            reason: req.reason ?? "No reason provided",
            status: req.status,
            createdAt: req.createdAt ?? req.requestedAt ?? new Date().toISOString(),
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // ✅ Sort by time (newest first)
    
        setRequests(formattedRequests);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load your requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user, navigate]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <div>
              <Typography variant="h5" component="h2" gutterBottom>
                Track Your Requests
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Monitor the status of your coin requests
              </Typography>
            </div>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/request-coins')}
            >
              New Request
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center" sx={{ p: 3 }}>
              {error}
            </Typography>
          ) : requests.length === 0 ? (
            <Typography align="center" color="textSecondary" sx={{ p: 3 }}>
              You haven't made any requests yet.
            </Typography>
          ) : (
            <Box>
              {requests.map((request, index) => (
                <React.Fragment key={request.id}>
                  {index > 0 && <Divider sx={{ my: 2 }} />}
                  <Box sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6">
                        {request.coinAmount} Coins
                      </Typography>
                      {getStatusChip(request.status)}
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Reason: {request.reason}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TrackRequests;
