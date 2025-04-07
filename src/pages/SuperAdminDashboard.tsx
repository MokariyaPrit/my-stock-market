import { useEffect, useState } from "react";
import { fetchUsers, updateUser, deleteUser, User } from "../services/userService";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  TextField, Select, MenuItem, Box, Typography, Dialog, DialogTitle, DialogActions,
  DialogContent, Snackbar, Alert, useMediaQuery
} from "@mui/material";
import { WarningAmber, CheckCircle } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<Partial<User> | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "info" | "warning" | "error" });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const getUsers = async () => {
      const usersData: User[] = await fetchUsers();
      setUsers(usersData);
    };
    getUsers();
  }, []);

  const handleEdit = (user: User) => setEditingUser(user);
  const handleChange = (field: keyof User, value: string) => {
    if (editingUser) setEditingUser({ ...editingUser, [field]: value });
  };

  const handleSave = (user: User) => {
    const emailExists = users.some((u) => u.email === user.email && u.id !== user.id);
    if (emailExists) {
      setToast({ open: true, message: "Email already exists!", type: "error" });
      return;
    }
    setUserToUpdate(user);
    setOpenSaveDialog(true);
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
      setToast({ open: true, message: "Error updating user!", type: "error" });
    } finally {
      setOpenSaveDialog(false);
      setEditingUser(null);
    }
  };

  const handleDelete = (id: string) => {
    setUserToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete);
      setUsers(users.filter((user) => user.id !== userToDelete));
      setToast({ open: true, message: "User deleted successfully!", type: "success" });
    } catch (error) {
      setToast({ open: true, message: "Error deleting user!", type: "error" });
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Super Admin Dashboard
      </Typography>

      {isSmallScreen ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {users.map((user) => {
            const isEditing = editingUser?.id === user.id;
            return (
              <Paper key={user.id} sx={{ p: 2 }}>
                <Typography variant="h6">{isEditing ? "Editing User" : user.name}</Typography>
                <Box mt={1}>
                  {isEditing ? (
                    <TextField fullWidth label="Name" value={editingUser.name} onChange={(e) => handleChange("name", e.target.value)} />
                  ) : (
                    <Typography>Name: {user.name}</Typography>
                  )}
                </Box>
                <Box mt={1}>
                  {isEditing ? (
                    <TextField fullWidth label="Email" value={editingUser.email} onChange={(e) => handleChange("email", e.target.value)} />
                  ) : (
                    <Typography>Email: {user.email}</Typography>
                  )}
                </Box>
                <Box mt={1}>
                  {isEditing ? (
                    <Select fullWidth value={editingUser.role} onChange={(e) => handleChange("role", e.target.value as User["role"])}>
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="superadmin">SuperAdmin</MenuItem>
                    </Select>
                  ) : (
                    <Typography>Role: {user.role}</Typography>
                  )}
                </Box>
                <Box mt={2} display="flex" gap={1}>
                  {isEditing ? (
                    <>
                      <Button fullWidth variant="contained" color="primary" onClick={() => handleSave(editingUser)}>
                        Save
                      </Button>
                      <Button fullWidth variant="outlined" color="secondary" onClick={() => setEditingUser(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button fullWidth variant="outlined" onClick={() => handleEdit(user)}>
                        Edit
                      </Button>
                      <Button fullWidth variant="contained" color="error" onClick={() => handleDelete(user.id)}>
                        Delete
                      </Button>
                    </>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      ) : (
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
      )}

      {/* Dialogs and Toast */}
      <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
        <Box sx={{ textAlign: "center", p: 3 }}>
          <CheckCircle sx={{ fontSize: 60, color: "green" }} />
          <DialogTitle>Confirm Changes</DialogTitle>
          <DialogContent>
            <Typography>Do you want to save these changes?</Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", mt: 1 }}>
            <Button onClick={() => setOpenSaveDialog(false)} variant="outlined">
              Cancel
            </Button>
            <Button onClick={confirmUpdate} variant="contained" sx={{ ml: 2 }}>
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <Box sx={{ textAlign: "center", p: 3 }}>
          <WarningAmber sx={{ fontSize: 60, color: "red" }} />
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this user?</Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", mt: 1 }}>
            <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
              Cancel
            </Button>
            <Button onClick={confirmDelete} variant="contained" color="error" sx={{ ml: 2 }}>
              Delete
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.type}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SuperAdminDashboard;
