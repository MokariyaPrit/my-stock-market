import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAllCoinRequests, updateCoinRequestStatus } from '../services/coinService';
import { getUserById } from '../services/userService';
import { CoinRequest } from '../types/CoinRequest';
import { 
  Box, Card, CardContent, Typography, Button,
  Tabs, Tab, CircularProgress, Divider, Alert
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const AdminCoinRequests = () => {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [adminNames, setAdminNames] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (!isAdmin && !isSuperAdmin)) {
      navigate('/');
      return;
    }
const fetchRequests = async () => {
  try {
    setIsLoading(true);
    const allRequests = await getAllCoinRequests();
    setRequests(allRequests);

    const userIds = [...new Set(allRequests.map(req => req.userId).filter(id => typeof id === "string"))];
    const adminIds = [...new Set(allRequests.map(req => req.adminId).filter(id => typeof id === "string"))];

    const userNamesMap: Record<string, string> = {};
    const adminNamesMap: Record<string, string> = {};

    await Promise.all([
      ...userIds.map(async (userId) => {
        try {
          const userData = await getUserById(userId as string);
          if (userData) {
            userNamesMap[userId as string] = userData.name || "Unknown User";
          }
        } catch (err) {
          console.error(`Error fetching user ${userId}:`, err);
        }
      }),
      ...adminIds.map(async (adminId) => {
        try {
          const adminData = await getUserById(adminId as string);
          if (adminData) {
            adminNamesMap[adminId as string] = adminData.name || "Unknown Admin";
          }
        } catch (err) {
          console.error(`Error fetching admin ${adminId}:`, err);
        }
      }),
    ]);

    setUserNames(userNamesMap);
    setAdminNames(adminNamesMap);
  } catch (err) {
    console.error("Error fetching requests:", err);
    setError("Failed to load requests");
  } finally {
    setIsLoading(false);
  }
};


    fetchRequests();
  }, [user, isAdmin, isSuperAdmin, navigate]);

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    
    try {
      setProcessingId(requestId);
      await updateCoinRequestStatus(requestId, status, user.uid);

      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId ? { ...req, status, adminId: user.uid, updatedAt: new Date().toISOString() } : req
        )
      );
    } catch (err) {
      console.error('Error updating request status:', err);
      setError('Failed to update request status');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'all') return true;
    return req.status === activeTab;
  });

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Manage Coin Requests
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Review and process user requests for coins
          </Typography>

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Pending" value="pending" />
            <Tab label="Approved" value="approved" />
            <Tab label="Rejected" value="rejected" />
            <Tab label="All Requests" value="all" />
          </Tabs>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          ) : filteredRequests.length === 0 ? (
            <Typography align="center" color="textSecondary" sx={{ p: 3 }}>
              No {activeTab} requests found.
            </Typography>
          ) : (
            <Box>
              {filteredRequests.map((request) => (
                <React.Fragment key={request.id}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box>
                        <Typography variant="h6">
                          {request.coinAmount} Coins {request.status}
                        </Typography>
                        <Typography variant="body2">
                          From: {userNames[request.userId] || 'Loading...'}
                        </Typography>
                        {request.adminId && (
                         <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                         Approved by: {request.adminId ? adminNames[request.adminId] || "Unknown Admin" : "N/A"}
                       </Typography>                       
                        )}
                      </Box>

                      {request.status === 'pending' && (
                        <Box>
                          <Button
                            variant="outlined"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleUpdateStatus(request.id, 'approved')}
                            disabled={processingId === request.id}
                            sx={{ mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleUpdateStatus(request.id, 'rejected')}
                            disabled={processingId === request.id}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </Box>
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

export default AdminCoinRequests;
