import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getAllCoinRequests,
  updateCoinRequestStatus,
} from "../services/coinService";
import { getUserById } from "../services/userService";
import { CoinRequest } from "../types/CoinRequest";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { formatDistanceToNow } from "date-fns";

const AdminCoinRequests = () => {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<CoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [adminNames, setAdminNames] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (!isAdmin && !isSuperAdmin)) {
      navigate("/");
      return;
    }

    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const allRequests = await getAllCoinRequests();
        setRequests(allRequests);

        const extractIds = (
          requests: CoinRequest[],
          key: "userId" | "adminId"
        ) => {
          return [
            ...new Set(
              requests
                .map((req) => req[key])
                .filter((id): id is string => typeof id === "string")
            ),
          ];
        };

        const userIds = extractIds(allRequests, "userId");
        const adminIds = extractIds(allRequests, "adminId");
        const namesMap = async (ids: string[], label: "user" | "admin") => {
          const map: Record<string, string> = {};
          await Promise.all(
            ids.map(async (id) => {
              try {
                const data = await getUserById(id);
                if (data) {
                  map[id] =
                    data.name ||
                    `Unknown ${label === "user" ? "User" : "Admin"}`;
                }
              } catch (err) {
                console.error(`Error fetching ${label} ${id}:`, err);
              }
            })
          );
          return map;
        };

        const [userMap, adminMap] = await Promise.all([
          namesMap(userIds, "user"),
          namesMap(adminIds, "admin"),
        ]);

        setUserNames(userMap);
        setAdminNames(adminMap);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user, isAdmin, isSuperAdmin, navigate]);

  const handleStatusUpdate = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    if (!user) return;

    try {
      setProcessingId(id);
      await updateCoinRequestStatus(id, status, user.uid);

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? {
                ...req,
                status,
                adminId: user.uid,
                updatedAt: new Date().toISOString(),
              }
            : req
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update request status");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter(
    (req) => activeTab === "all" || req.status === activeTab
  );

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Manage Coin Requests
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Review and process user coin requests
          </Typography>

          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{ mb: 3 }}
          >
            <Tab label="Pending" value="pending" />
            <Tab label="Approved" value="approved" />
            <Tab label="Rejected" value="rejected" />
            <Tab label="All" value="all" />
          </Tabs>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          ) : filtered.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
              No {activeTab} requests found.
            </Typography>
          ) : (
            <Box>
              {filtered.map((req) => (
                <React.Fragment key={req.id}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ py: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="h6">
                          {req.coinAmount} Coins - {req.status.toUpperCase()}
                        </Typography>
                        <Typography variant="body2">
                          From: {userNames[req.userId] || "Loading..."}
                        </Typography>
                        {req.adminId && (
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ mt: 1 }}
                          >
                            Approved by:{" "}
                            {adminNames[req.adminId] || "Unknown Admin"}
                          </Typography>
                        )}
                      </Box>

                      {/* {req.status === "pending" && (
                        <Box>
                          <Button
                            variant="outlined"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() =>
                              handleStatusUpdate(req.id, "approved")
                            }
                            disabled={processingId === req.id}
                            sx={{ mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() =>
                              handleStatusUpdate(req.id, "rejected")
                            }
                            disabled={processingId === req.id}
                          >
                            Reject
                          </Button>
                        </Box>
                      )} */}

                      {req.status === "pending" && (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 1,
                            alignItems: { xs: "stretch", sm: "center" },
                            mt: { xs: 1, sm: 0 },
                          }}
                        >
                          <Button
                            variant="outlined"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() =>
                              handleStatusUpdate(req.id, "approved")
                            }
                            disabled={processingId === req.id}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() =>
                              handleStatusUpdate(req.id, "rejected")
                            }
                            disabled={processingId === req.id}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Requested{" "}
                      {formatDistanceToNow(new Date(req.createdAt), {
                        addSuffix: true,
                      })}
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
