import { useEffect, useState } from "react";
import { fetchUsers, updateUser, deleteUser } from "../services/userService";
import { User } from "../services/userService";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Snackbar,
  Alert,
} from "@mui/material";
import { WarningAmber, CheckCircle } from "@mui/icons-material";

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<Partial<User> | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "info" | "warning" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const getUsers = async () => {
      const usersData: User[] = await fetchUsers();
      setUsers(usersData);
    };
    getUsers();
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleChange = (field: keyof User, value: string) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, [field]: value });
    }
  };

  const handleSave = (user: User) => {
    // Check for duplicate email
    const emailExists = users.some((u) => u.email === user.email && u.id !== user.id);
    if (emailExists) {
      setToast({ open: true, message: "Email already exists!", type: "error" });
      return;
    }

    setUserToUpdate(user);
    setOpenSaveDialog(true); // Open confirmation dialog
  };

  const confirmUpdate = async () => {
    if (!userToUpdate || !userToUpdate.id) return;

    try {
      await updateUser(userToUpdate.id, userToUpdate);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userToUpdate.id ? { ...u, ...userToUpdate } : u))
      );
      setToast({ open: true, message: "User updated successfully!", type: "success" });
    } catch (error) {
      console.error("Error updating user:", error);
      setToast({ open: true, message: "Error updating user!", type: "error" });
    } finally {
      setOpenSaveDialog(false);
      setEditingUser(null);
    }
  };

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete);
      setUsers(users.filter((user) => user.id !== userToDelete));
      setToast({ open: true, message: "User deleted successfully!", type: "success" });
    } catch (error) {
      console.error("Error deleting user:", error);
      setToast({ open: true, message: "Error deleting user!", type: "error" });
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Super Admin Dashboard
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
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
                <TableCell>
                  {editingUser?.id === user.id ? (
                    <Select value={editingUser.role} onChange={(e) => handleChange("role", e.target.value as User["role"])}>
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="superadmin">SuperAdmin</MenuItem>
                    </Select>
                  ) : (
                    user.role
                  )}
                </TableCell>
                <TableCell>
                  {editingUser?.id === user.id ? (
                    <>
                      <Button variant="contained" color="primary" onClick={() => handleSave(editingUser)}>
                        Save
                      </Button>
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
        <Box sx={{ textAlign: "center", p: 3 }}>
          <CheckCircle sx={{ fontSize: 60, color: "green" }} />
          <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Changes</DialogTitle>
          <DialogContent>
            <Typography variant="body1" color="textSecondary">
              Do you want to save these changes?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", mt: 1 }}>
            <Button onClick={() => setOpenSaveDialog(false)} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={confirmUpdate} color="primary" variant="contained" sx={{ ml: 2 }}>
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <Box sx={{ textAlign: "center", p: 3 }}>
          <WarningAmber sx={{ fontSize: 60, color: "red" }} />
          <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography variant="body1" color="textSecondary">
              Are you sure you want to delete this user? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", mt: 1 }}>
            <Button onClick={() => setOpenDeleteDialog(false)} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained" sx={{ ml: 2 }}>
              Delete
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.type}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SuperAdminDashboard;
