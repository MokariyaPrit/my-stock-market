import { useState, useEffect } from "react";
import { fetchUsers, deleteUser, updateUser, getCurrentUser } from "../services/userService";
import { useNavigate } from "react-router-dom";
import { User } from "../services/userService";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Box,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Mobile if < 600px

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const currentUserData = await getCurrentUser();
        if (!currentUserData || (currentUserData.role !== "admin" && currentUserData.role !== "superadmin")) {
          navigate("/unauthorized");
          return;
        }

        const allUsers = await fetchUsers();
        // Filter out admins and superadmins if current user is an admin (not superadmin)
        const filteredUsers =
          currentUserData.role === "admin"
            ? allUsers.filter((user) => user.role === "user")
            : allUsers; // Superadmins see all users
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [navigate]);

  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleChange = (field: keyof User, value: string) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, [field]: value });
    }
  };

  const handleSave = () => {
    setOpenSaveDialog(true);
  };

  const confirmUpdate = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, editingUser);
      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.id ? { ...user, ...editingUser } : user))
      );
      setToast({ open: true, message: "User updated successfully!", type: "success" });
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      setToast({ open: true, message: "Failed to update user.", type: "error" });
    }
    setOpenSaveDialog(false);
  };

  const handleDelete = (userId: string) => {
    setDeleteUserId(userId);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;
    try {
      await deleteUser(deleteUserId);
      setUsers((prev) => prev.filter((user) => user.id !== deleteUserId));
      setToast({ open: true, message: "User deleted successfully!", type: "success" });
    } catch (error) {
      console.error("Error deleting user:", error);
      setToast({ open: true, message: "Failed to delete user.", type: "error" });
    }
    setOpenDeleteDialog(false);
    setDeleteUserId(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

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
      <Box sx={{ width: "100%", maxWidth: 900, px: { xs: 2, sm: 0 } }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: "bold", color: "#1976d2", mb: 4 }}
        >
          User Management
        </Typography>

        {isMobile ? (
          // Mobile: Card-based layout
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {users.map((user) => (
              <Card
                key={user.id}
                sx={{ borderRadius: 2, boxShadow: 3, bgcolor: "white", p: 2 }}
              >
                <CardContent sx={{ p: 1, textAlign: "center" }}>
                  {editingUser?.id === user.id ? (
                    <>
                      <TextField
                        fullWidth
                        label="Name"
                        value={editingUser.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        margin="normal"
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        value={editingUser.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        margin="normal"
                        variant="outlined"
                        size="small"
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                        {user.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        <strong>Email:</strong> {user.email}
                      </Typography>
                    </>
                  )}
                  <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
                    {editingUser?.id === user.id ? (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={handleSave}
                          sx={{ borderRadius: 1 }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => setEditingUser(null)}
                          sx={{ borderRadius: 1 }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleEdit(user)}
                          sx={{ borderRadius: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(user.id)}
                          sx={{ borderRadius: 1 }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          // Desktop/Tablet: Table layout
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#1976d2" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id} hover sx={{ bgcolor: index % 2 === 0 ? "#fafafa" : "white" }}>
                    <TableCell>
                      {editingUser?.id === user.id ? (
                        <TextField
                          value={editingUser.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        user.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingUser?.id === user.id ? (
                        <TextField
                          value={editingUser.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        user.email
                      )}
                    </TableCell>
                    <TableCell>
                      {editingUser?.id === user.id ? (
                        <>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            sx={{ mr: 1, borderRadius: 1 }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => setEditingUser(null)}
                            sx={{ borderRadius: 1 }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleEdit(user)}
                            sx={{ mr: 1, borderRadius: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleDelete(user.id)}
                            sx={{ borderRadius: 1 }}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Confirm Save Dialog */}
        <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)} sx={{ "& .MuiDialog-paper": { borderRadius: 2 } }}>
          <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2" }}>Confirm Changes</DialogTitle>
          <DialogContent>
            <DialogContentText>Do you want to save these changes?</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenSaveDialog(false)} color="secondary" variant="outlined" sx={{ borderRadius: 1 }}>
              Cancel
            </Button>
            <Button onClick={confirmUpdate} color="primary" variant="contained" sx={{ borderRadius: 1 }}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Delete Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} sx={{ "& .MuiDialog-paper": { borderRadius: 2 } }}>
          <DialogTitle sx={{ fontWeight: "bold", color: "#d32f2f" }}>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to delete this user?</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenDeleteDialog(false)} color="secondary" variant="outlined" sx={{ borderRadius: 1 }}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained" sx={{ borderRadius: 1 }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast Notification */}
        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert severity={toast.type as "success" | "error"} sx={{ width: "100%", borderRadius: 2 }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminDashboard;