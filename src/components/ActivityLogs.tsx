import React, { useEffect, useState, useCallback } from "react";
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
import { getUserActivityLogs } from "../services/activityService";
import { auth } from "../firebase";

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

      const logsWithDates = userLogs.map((log) => ({
        ...log,
        timestamp: log.timestamp ? new Date(log.timestamp) : undefined,
      }));

      const uniqueDateLogs: ActivityLog[] = [];
      const seenDates = new Set();

      logsWithDates.forEach((log) => {
        if (log.timestamp) {
          const dateString = log.timestamp.toISOString().split("T")[0];
          if (!seenDates.has(dateString)) {
            seenDates.add(dateString);
            uniqueDateLogs.push(log);
          }
        } else {
          uniqueDateLogs.push(log);
        }
      });

      const maxLogs = 1;
      const emptyLogs = Array.from(
        { length: Math.max(0, maxLogs - uniqueDateLogs.length) },
        (_, i) => ({
          id: `placeholder-${i}`,
          action: "No activity",
          timestamp: undefined,
        })
      );

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
        bgcolor: theme.palette.background.default,
        px: 2,
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 600,
          p: isMobile ? 2 : 4,
          borderRadius: 3,
          boxShadow: theme.custom.deepShadow,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: theme.palette.text.primary,
          }}
        >
          Activity Logs
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : (
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
                    primary={
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        color={theme.palette.text.primary}
                      >
                        {log.action}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color={log.timestamp ? "text.secondary" : "text.disabled"}
                      >
                        {log.timestamp
                          ? log.timestamp.toLocaleString()
                          : "No timestamp available"}
                      </Typography>
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
