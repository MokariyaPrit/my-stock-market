import { useEffect, useState } from "react";
import { getLeaderboardUsers, LeaderboardUser } from "../services/leaderboardService";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const LeaderboardTest = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Mobile if < 600px

  useEffect(() => {
    getLeaderboardUsers().then((data) => {
      // Filter to only include users with role: "user"
      const filteredUsers = data.filter((user) => user.role === "user");
      // Sort users by coins in descending order (highest to lowest)
      const sortedUsers = filteredUsers.sort((a, b) => b.coins - a.coins);
      // console.log("🔥 Sorted Leaderboard Users:", sortedUsers);
      setUsers(sortedUsers);
    });
  }, []);

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
      <Box sx={{ width: "100%", maxWidth: 600, px: { xs: 2, sm: 0 } }}>
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
          Leaderboard
        </Typography>
        <Card
          sx={{
            width: "100%",
            borderRadius: 3,
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            bgcolor: "white",
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <List>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <ListItem
                    key={user.id}
                    divider={index < users.length - 1} // No divider on last item
                    sx={{
                      py: 1.5,
                      "&:hover": { bgcolor: "#f5f5f5" }, // Subtle hover effect
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                          {`${index + 1}. ${user.name}`}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: "#555" }}>
                          {`${user.coins} Coins`}
                        </Typography>
                      }
                      primaryTypographyProps={{ fontSize: isMobile ? "1rem" : "1.1rem" }}
                      secondaryTypographyProps={{ fontSize: isMobile ? "0.875rem" : "0.95rem" }}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ textAlign: "center", color: "#555" }}>
                        No users found.
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default LeaderboardTest;