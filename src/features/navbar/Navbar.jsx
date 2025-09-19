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
import LoginIconButton from "../auth/LoginIconButton";
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
  const { user, logout } = useAuthContext(); // assuming logout() is available
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const [userAnchorEl, setUserAnchorEl] = useState(null);

  // Mobile menu handlers
  const handleMobileMenuOpen = (event) => setMobileAnchorEl(event.currentTarget);
  const handleMobileMenuClose = () => setMobileAnchorEl(null);

  // User menu handlers
  const handleUserMenuOpen = (event) => setUserAnchorEl(event.currentTarget);
  const handleUserMenuClose = () => setUserAnchorEl(null);

  return (
    <AppBar position="fixed" color="inherit" elevation={1}>
      <Toolbar>
        {/* Left Section: Logo or Menu */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton edge="start" color="inherit" onClick={handleMobileMenuOpen}>
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
          <>
            <IconButton edge="end" color="inherit" onClick={handleUserMenuOpen}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={userAnchorEl}
              open={Boolean(userAnchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                component={Link}
                to="/profile"
                onClick={handleUserMenuClose}
              >
                Profile
              </MenuItem>
              <MenuItem
                component={Link}
                to="/stripe"
                onClick={handleUserMenuClose}
              >
                Checkout
              </MenuItem>
              <MenuItem
                component={Link}
                to="/paymentmethods"
                onClick={handleUserMenuClose}
              >
                Payment Methods
              </MenuItem>
              <MenuItem
                onClick={() => {
                  logout();
                  handleUserMenuClose();
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <LoginIconButton />
          </>
        )}
      </Toolbar>

      {/* Dropdown Menu for mobile */}
      <Menu
        anchorEl={mobileAnchorEl}
        open={Boolean(mobileAnchorEl)}
        onClose={handleMobileMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem component={Link} to="/" onClick={handleMobileMenuClose}>
          Home
        </MenuItem>
        <MenuItem component={Link} to="/about" onClick={handleMobileMenuClose}>
          About
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
