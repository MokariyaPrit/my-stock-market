import { useEffect, useState } from "react";
import { fetchUsers, updateUser, deleteUser, User } from "../services/userService";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Snackbar,
  Alert,
} from "@mui/material";
import { WarningAmber } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
// import { useMediaQuery } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridToolbar,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowId,
} from "@mui/x-data-grid";

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "info" | "warning" | "error",
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: "name",
      sort: "asc",
    },
  ]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const theme = useTheme();
  
  // const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const getUsers = async () => {
      const usersData: User[] = await fetchUsers();
      setUsers(usersData);
    };
    getUsers();
  }, []);

  const handleEditClick = (id: GridRowId) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: GridRowId) => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleSortModelChange = (newModel: GridSortModel) => {
    setSortModel(newModel);
    const sortedUsers = [...users].sort((a, b) => {
      const sortItem = newModel[0];
      if (!sortItem?.field || !sortItem?.sort) return 0;

      const field = sortItem.field as keyof User;
      const sortDir = sortItem.sort === 'asc' ? 1 : -1;

      const aValue = a[field];
      const bValue = b[field];

      if (!aValue || !bValue) return 0;
      if (aValue < bValue) return -1 * sortDir;
      if (aValue > bValue) return 1 * sortDir;
      return 0;
    });
    setUsers(sortedUsers);
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    if (!newRow?.id) throw new Error("Invalid row data");
    
    try {
      const emailExists = users.some(
        (u) => u.email === newRow.email && u.id !== newRow.id
      );
      if (emailExists) {
        throw new Error("Email already exists!");
      }
      
      await updateUser(newRow.id.toString(), newRow as User);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === newRow.id ? (newRow as User) : user))
      );
      setToast({
        open: true,
        message: "User updated successfully!",
        type: "success",
      });
      return newRow;
    } catch (error) {
      setToast({
        open: true,
        message: error instanceof Error ? error.message : "Error updating user!",
        type: "error",
      });
      throw error;
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
      setToast({
        open: true,
        message: "User deleted successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({ open: true, message: "Error deleting user!", type: "error" });
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      editable: true,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      editable: true,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      editable: true,
      type: "singleSelect",
      valueOptions: ["user", "admin", "superadmin"],
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;

        return isInEditMode ? (
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSaveClick(params.id)}
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleCancelClick(params.id)}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleEditClick(params.id)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </Button>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 2, backgroundColor: theme.palette.background.default }}>
      <Typography variant="h4" gutterBottom>
        Super Admin Dashboard
      </Typography>

      <Box sx={{ height: "auto", minHeight: 400, width: "100%" }}>
        <DataGrid
          rows={users}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          sortingMode="client"
          filterMode="client"
          density="comfortable"
          hideFooterPagination
          editMode="row"
          rowModesModel={rowModesModel}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(error: Error) => {
            console.error('Error updating row:', error);
            setToast({
              open: true,
              message: error.message || "Error updating user!",
              type: "error",
            });
          }}
          slots={{
            toolbar: GridToolbar,
          }}
          sx={{
            "& .MuiDataGrid-cell": {
              whiteSpace: "normal",
              lineHeight: "normal",
            },
            // Removed invalid MuiDataGrid reference
          }}
        />
      </Box>

      {/* Dialogs and Toast */}
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
            <Button
              onClick={confirmDelete}
              variant="contained"
              color="error"
              sx={{ ml: 2 }}
            >
              Delete
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.type}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SuperAdminDashboard;
