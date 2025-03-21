import React, { useEffect, useState, useCallback } from "react";
import { getUserActivityLogs } from "../services/activityService";
import { auth } from "../firebase";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Box,
  Divider,
  Avatar,
  ListItemAvatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Event as EventIcon } from "@mui/icons-material";

interface ActivityLog {
  id: string;
  action: string;
  timestamp?: Date;
}

const ActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchLogs = useCallback(async () => {
    if (!auth.currentUser) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const userLogs = await getUserActivityLogs(auth.currentUser.uid);
  
      // ✅ Convert Firestore timestamps to JavaScript Date objects
      const logsWithDates = userLogs.map((log) => ({
        ...log,
        timestamp: log.timestamp ? new Date(log.timestamp) : undefined,
      }));
  
      // ✅ Function to remove duplicate dates while keeping different times
      const uniqueDateLogs: ActivityLog[] = [];
      const seenDates = new Set();
  
      logsWithDates.forEach((log) => {
        if (log.timestamp) {
          const dateString = log.timestamp.toISOString().split("T")[0]; // Extract date part (YYYY-MM-DD)
          if (!seenDates.has(dateString)) {
            seenDates.add(dateString);
            uniqueDateLogs.push(log);
          }
        } else {
          uniqueDateLogs.push(log);
        }
      });
  
      // ✅ Always show 1 logs (fill with placeholders if needed)
      const maxLogs = 1;
      const emptyLogs = Array.from({ length: Math.max(0, maxLogs - uniqueDateLogs.length) }, (_, i) => ({
        id: `placeholder-${i}`,
        action: "No activity",
        timestamp: undefined,
      }));
  
      setLogs([...uniqueDateLogs.slice(0, maxLogs), ...emptyLogs]);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to load logs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  
  

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f4f6f8",
        padding: isMobile ? 2 : 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: isMobile ? "100%" : 600,
          width: "95%",
          p: 3,
          borderRadius: 2,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ textAlign: "center", mb: 2, fontWeight: "bold" }}>
          Activity Logs
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!loading && logs.length > 0 && (
          <List>
            {logs.map((log, index) => (
              <React.Fragment key={log.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <EventIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={log.action}
                    secondary={
                      log.timestamp ? (
                        <Typography sx={{ display: "inline" }} component="span" variant="body2" color="text.primary">
                          {log.timestamp.toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography sx={{ display: "inline" }} component="span" variant="body2" color="text.secondary">
                          No time available
                        </Typography>
                      )
                    }
                  />
                </ListItem>
                {index < logs.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default ActivityLogs;
