import React, { useEffect, useState } from "react";
import { getCurrentUser, updateUser } from "../services/userService";
import { User } from "../services/userService";
import {
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Paper,
  Grid,
  Avatar,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import {
  getAuth,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { logActivity } from "../services/activityService";

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setFormData(currentUser);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const confirmSave = () => {
    setOpenSaveDialog(true);
  };

  const confirmUpdate = async () => {
    setOpenSaveDialog(false);
    if (!user) return;
    try {
      if (formData.name !== user.name) {
        await updateUser(user.id, formData);
        await logActivity(user.id, "Updated profile details.");
      }
      if (newPassword) {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          const credential = EmailAuthProvider.credential(currentUser.email || "", currentPassword);
          await reauthenticateWithCredential(currentUser, credential);
          await updatePassword(currentUser, newPassword);
          await logActivity(user.id, "Changed password.");
          setNewPassword("");
          setCurrentPassword("");
        }
      }
      setToast({ open: true, message: "Profile updated successfully!", type: "success" });
    } catch (error: any) {
      console.error("Update error:", error);
      setToast({ open: true, message: "Error updating profile.", type: "error" });
    }
  };

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#f4f6f8", p: 3 }}>
      <Paper elevation={3} sx={{ maxWidth: isMobile ? "95%" : 500, width: "100%", p: 4, borderRadius: 3, textAlign: "center" }}>
        <Avatar sx={{ width: 80, height: 80, margin: "auto", bgcolor: "primary.main" }}>{user.name?.[0]}</Avatar>
        <Typography variant="h5" sx={{ my: 2 }}>Edit Profile</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label="Name" name="name" value={formData.name || ""} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Email" name="email" value={formData.email || ""} disabled fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" fullWidth onClick={confirmSave}>Save Changes</Button>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
        <DialogTitle sx={{ textAlign: "center" }}>
          <CheckCircle sx={{ fontSize: 50, color: "green" }} /> Confirm Changes
        </DialogTitle>
        <DialogContent>
          <Typography>Do you want to save these changes?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={() => setOpenSaveDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={confirmUpdate} variant="contained" sx={{ ml: 2 }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
        <Alert severity={toast.type}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;