import { useEffect, useState } from "react";
import { getLeaderboardUsers, LeaderboardUser } from "../services/leaderboardService";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PersonIcon from "@mui/icons-material/Person";

const LeaderboardTest = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    getLeaderboardUsers().then((data) => {
      const filtered = data.filter((u) => u.role === "user");
      const sorted = filtered.sort((a, b) => b.coins - a.coins);
      setUsers(sorted);
    });
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: theme.palette.background.default,
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
            color: theme.palette.primary.main,
            mb: 4,
          }}
        >
          🏆 Leaderboard
        </Typography>

        <Card
          sx={{
            width: "100%",
            borderRadius: 3,
            boxShadow: 4,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <List>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <ListItem
                    key={user.id}
                    divider={index < users.length - 1}
                    sx={{
                      py: 1.5,
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                        cursor: "pointer",
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor:
                            index === 0
                              ? "#FFD700"
                              : index === 1
                              ? "#C0C0C0"
                              : index === 2
                              ? "#CD7F32"
                              : theme.palette.primary.main,
                        }}
                      >
                        {index < 3 ? <EmojiEventsIcon /> : <PersonIcon />}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "medium", fontSize: isMobile ? "1rem" : "1.1rem" }}
                        >
                          {`${index + 1}. ${user.name}`}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            fontSize: isMobile ? "0.9rem" : "1rem",
                            color: theme.palette.primary.main,
                          }}
                        >
                          {`${user.coins.toFixed(2)} Coins`}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ textAlign: "center", color: "#777" }}>
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
