import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon
import { Brightness7,Brightness4 } from "@mui/icons-material";
// type Props = {
//   toggleTheme: () => void;
//   currentMode: "light" | "dark";
// };

const Navbar = ({ toggleTheme, currentMode }:any) => {
  const { user, logout, isAdmin, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileAnchorEl, setMobileAnchorEl] = React.useState<null | HTMLElement>(null);

  if (loading) return null;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileClose = () => {
    setMobileAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
    handleClose();
    handleMobileClose();
  };


  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={Link}
          to="/dashboard"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            alignItems: "center",
          }}
        >
          Stock Market App
        </Typography>
        <IconButton color="inherit" onClick={toggleTheme}>
          {currentMode === "dark" ? <Brightness7 /> : <Brightness4 />}
        </IconButton>

        {/* Desktop Menu */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
          {user ? (
            <>
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/stock-trade">
              Stock Trade 
              </Button>
              <Button color="inherit" component={Link} to="/request-coins">
                Request Coins
              </Button>
              <Button color="inherit" component={Link} to="/track-requests">
                Track Requests
              </Button>

              {(isAdmin || isSuperAdmin) && (
                <Button color="inherit" component={Link} to="/admin-coin-requests">
                  Manage Requests
                </Button>
              )}

              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircleIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <Box>
                  <MenuItem component={Link} to="/profile" onClick={handleClose}>
                    Profile
                  </MenuItem>
                  <Divider/>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Box>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>

        {/* Mobile Menu */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            edge="end"
            aria-label="menu"
            aria-controls="mobile-menu-appbar"
            aria-haspopup="true"
            onClick={handleMobileMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="mobile-menu-appbar"
            anchorEl={mobileAnchorEl}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            keepMounted
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={Boolean(mobileAnchorEl)}
            onClose={handleMobileClose}
          >
           <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={handleMobileClose} aria-label="close menu">
                <CloseIcon />
              </IconButton>
            </Box>
            <Box>
              {user ? (
                <>
                  <MenuItem component={Link} to="/dashboard" onClick={handleMobileClose}>
                    Dashboard
                  </MenuItem>
                  <MenuItem component={Link} to="/stock-trade" onClick={handleMobileClose}>
                    Trade
                  </MenuItem>
                  <MenuItem component={Link} to="/request-coins" onClick={handleMobileClose}>
                    Request Coins
                  </MenuItem>
                  <MenuItem component={Link} to="/track-requests" onClick={handleMobileClose}>
                    Track Requests
                  </MenuItem>

                  {(isAdmin || isSuperAdmin) && (
                    <MenuItem component={Link} to="/admin-coin-requests" onClick={handleMobileClose}>
                      Manage Requests
                    </MenuItem>
                  )}
                  <Divider/>
                  <MenuItem component={Link} to="/profile" onClick={handleMobileClose}>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </>
              ) : (
                <>
                  <MenuItem component={Link} to="/login" onClick={handleMobileClose}>
                    Login
                  </MenuItem>
                  <MenuItem component={Link} to="/register" onClick={handleMobileClose}>
                    Register
                  </MenuItem>
                </>
              )}
            </Box>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;