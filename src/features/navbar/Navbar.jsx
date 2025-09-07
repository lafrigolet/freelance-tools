import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { styled, alpha } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Link } from "react-router-dom";

// Import your existing components
import { LoginDialog, LoginButton } from '../auth/LoginDialog';
import SignUpDialog from '../auth/SignUpDialog';
import { useAuthContext } from "../auth/AuthContext";

// Custom styled search box
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  width: "100%",
  maxWidth: 600,
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
}));

export default function Navbar() {
  // user comes from your AuthProvider
  const { user } = useAuthContext(); 
  
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" color="inherit" elevation={1}>
      <Toolbar>
        {/* Left Section: Logo or Menu */}
        {/* Show menu icon only on mobile */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton edge="start" color="inherit" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
        </Box>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ display: { xs: "none", sm: "block" }, mr: 2 }}
        >
          MyApp
        </Typography>

        {/* Center Section: Search */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ "aria-label": "search" }}
          />
        </Search>

        {/* Menu links for desktop */}
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{ textDecoration: "none", color: "inherit", mr: 2 }}
          >
            Home
          </Typography>

          <Typography
            component={Link}
            to="/about"
            variant="h6"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            About
          </Typography>
        </Box>

        {/* Right Section: Auth / Profile */}
        <Box sx={{ flexGrow: 1 }} />

        {user ? (
          <IconButton edge="end" color="inherit">
            <AccountCircle />
          </IconButton>
        ) : (
          <>
            <LoginButton />
            <SignUpDialog />
          </>
        )}
      </Toolbar>

      {/* Dropdown Menu for mobile */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem component={Link} to="/" onClick={handleMenuClose}>
          Home
        </MenuItem>
        <MenuItem component={Link} to="/about" onClick={handleMenuClose}>
          About
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
