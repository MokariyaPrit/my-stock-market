import { useEffect, useState } from "react";
import { getLeaderboardUsers, LeaderboardUser } from "../services/leaderboardService";
import { Card, CardContent, Typography, List, ListItem, ListItemText } from "@mui/material";

const LeaderboardTest = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    getLeaderboardUsers().then((data) => {
      // console.log("🔥 Leaderboard Users:", data);
      setUsers(data);
    });
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Leaderboard
      </Typography>
      <Card style={{ width: "100%", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}>
        <CardContent>
          <List>
            {users.map((user, index) => (
              <ListItem key={user.id} divider>
                <ListItemText primary={`${index + 1}. ${user.name}`} secondary={`${user.coins} Coins`} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardTest;
