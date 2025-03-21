import { Box } from "@mui/material";
import LogoutButton from "./LogoutButton";

const Sidebar = () => {
  return (
    <Box
    sx={{
      width: { xs: "100%", sm: "250px" }, // Full width on small screens, 250px otherwise
      height: "100vh",
      backgroundColor: "#f4f4f4",
      padding: "1rem",
      position: "fixed", // Keep it fixed on the side
      left: 0,
      top: 0,
      overflowY: "auto",
    }}
  >
    <LogoutButton />
  </Box>
  
  );
};

export default Sidebar;
