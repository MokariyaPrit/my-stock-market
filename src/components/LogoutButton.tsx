import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { logout } from "../redux/store/authSlice";
import { logoutUser } from "../services/authService";  // ✅ Import logoutUser

const LogoutButton = () => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logoutUser(); // ✅ Logout from Firebase
      dispatch(logout()); // ✅ Update Redux state
    } catch (error) {
      alert("Logout failed!");
    }
  };

  return (
    <Button variant="contained" color="secondary" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
