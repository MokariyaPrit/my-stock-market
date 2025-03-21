import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { sendCoinRequest, getPendingRequestsCount } from '../services/coinService';
import { Box, Button, Card, CardContent, Typography, TextField, Alert, CircularProgress } from '@mui/material';

const RequestCoins = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchPendingCount = async () => {
      try {
        const count = await getPendingRequestsCount(user.uid);
        setPendingCount(count);
      } catch (err) {
        console.error('Error fetching pending count:', err);
      }
    };

    fetchPendingCount();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!coinAmount || coinAmount <= 0) {
      setError('Please enter a valid coin amount');
      return;
    }
    
    if (!reason.trim()) {
      setError('Please provide a reason for your request');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await sendCoinRequest({
        userId: user!.uid,
        coinAmount,
        reason
      });
      
      // Reset form and update pending count
      setCoinAmount(0);
      setReason('');
      setPendingCount(prev => prev + 1);
      setSuccess(true);
      
      // Redirect to track requests page after a short delay
      setTimeout(() => {
        navigate('/track-requests');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Request Coins
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Submit a request for coins to be approved by an admin.
            You can have a maximum of 3 pending requests.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ my: 2 }}>
              Your request has been submitted successfully!
            </Alert>
          )}
          
          {pendingCount >= 3 ? (
            <Alert severity="warning" sx={{ my: 2 }}>
              You already have 3 pending requests. Please wait for admins to process them before submitting more.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Coin Amount"
                type="number"
                value={coinAmount || ''}
                onChange={(e) => setCoinAmount(Number(e.target.value))}
                margin="normal"
                required
                inputProps={{ min: 1 }}
              />
              
              <TextField
                fullWidth
                label="Reason"
                multiline
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                margin="normal"
                required
                placeholder="Explain why you need these coins"
              />
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Pending Requests: {pendingCount}/3
                </Typography>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={isSubmitting || pendingCount >= 3}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Submit Request'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RequestCoins;