import { useState, useEffect } from "react";
import { fetchUsers, deleteUser, updateUser } from "../services/userService";
import { getCurrentUser } from "../services/userService";
import { useNavigate } from "react-router-dom";
import {User} from "../services/userService"
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
  DialogActions,
  Snackbar,
  Alert,
  Box
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

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const currentUserData = await getCurrentUser();
        if (!currentUserData || (currentUserData.role !== "admin" && currentUserData.role !== "superadmin")) {
          navigate("/unauthorized");
          return;
        }
        const usersData = await fetchUsers();
        setUsers(usersData);
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

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <TableContainer component={Paper}>
        <Typography variant="h5" sx={{ padding: 2 }}>User Management</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {editingUser?.id === user.id ? (
                    <TextField value={editingUser.name} onChange={(e) => handleChange("name", e.target.value)} />
                  ) : (
                    user.name
                  )}
                </TableCell>
                <TableCell>
                  {editingUser?.id === user.id ? (
                    <TextField value={editingUser.email} onChange={(e) => handleChange("email", e.target.value)} />
                  ) : (
                    user.email
                  )}
                </TableCell>


                {/* <TableCell>
                  {editingUser?.id === user.id ? (
                    <Select
                      value={editingUser.role}
                      onChange={(e) => handleChange("role", e.target.value as User["role"])}
                      disabled={currentUser?.role === "admin"} // ❌ Admins CANNOT change roles
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="superadmin">SuperAdmin</MenuItem>
                    </Select>
                  ) : (
                    user.role
                  )}
                </TableCell> */}


                <TableCell>
                  {editingUser?.id === user.id ? (
                    <>
                      <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
                      <Button variant="outlined" color="secondary" onClick={() => setEditingUser(null)} sx={{ ml: 2 }}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outlined" color="secondary" onClick={() => handleEdit(user)}>
                        Edit
                      </Button>
                      <Button variant="contained" color="error" onClick={() => handleDelete(user.id)} sx={{ ml: 2 }}>
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

      {/* Confirm Save Dialog */}
      <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent><Typography>Do you want to save these changes?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={confirmUpdate} color="primary" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete this user?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
      <Alert severity={toast.type as "success" | "error" | "warning" | "info"}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
