import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ShoppingCart as OrdersIcon,
  TableRestaurant as TableIcon,
  Restaurant as MenuIcon,
  LocalOffer as OffersIcon,
  People as UserManagementIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isExpanded, toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleUserClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Navigation items with role-based access
  const navigationItems = [
    { text: "Orders", icon: <OrdersIcon />, path: "/dashboard/orders", roles: ["owner", "manager", "staff"] },
    { text: "Table Management", icon: <TableIcon />, path: "/dashboard/tables", roles: ["owner", "manager"] },
    { text: "Menu Management", icon: <MenuIcon />, path: "/dashboard/menu", roles: ["owner", "manager"] },
    { text: "Offers Management", icon: <OffersIcon />, path: "/dashboard/offers", roles: ["owner", "manager"] },
    { text: "User Management", icon: <UserManagementIcon />, path: "/dashboard/users", roles: ["owner"] },
  ];

  // Filter navigation items based on the user's role
  const filteredNavigationItems = navigationItems.filter((item) =>
    item.roles.includes(currentUser?.role)
  );

  return (
    <Box
      sx={{
        width: isExpanded ? 220 : 70,
        bgcolor: "background.paper",
        height: "calc(100vh - 64px)", // Adjusted for navbar height
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        transition: "width 0.3s ease",
        position: "fixed",
        top: "64px", // Positioned below the navbar
        left: 0,
        zIndex: 8,
      }}
    >
      {/* Toggle Button */}
      <IconButton
        onClick={toggleSidebar}
        sx={{
          position: "absolute",
          right: -20,
          top: 0,
          zIndex: 1,
        }}
      >
        {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
      </IconButton>

      {/* Navigation Items */}
      <List>
        {filteredNavigationItems.map((item) => (
          <Tooltip
            key={item.text}
            title={!isExpanded ? item.text : ""}
            placement="right"
            arrow
          >
            <ListItem
              button="true"
              onClick={() => handleNavigation(item.path)}
              sx={{
                px: 2,
                py: 1.5,
                justifyContent: isExpanded ? "flex-start" : "center",
                "&:hover": {
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  cursor: "pointer",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: isExpanded ? "36px" : "24px", color: "#F57400" }}>
                {item.icon}
              </ListItemIcon>
              {isExpanded && <ListItemText primary={item.text} />}
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {/* Bottom Section */}
      <Box sx={{ mt: "auto", p: 2 }}>
        <Divider sx={{ mb: 1 }} />
        <Tooltip title={!isExpanded ? "Settings" : ""} placement="right" arrow>
          <ListItem
            button="true"
            onClick={() => handleNavigation("/dashboard/settings")}
            sx={{
              px: 2,
              py: 1.5,
              justifyContent: isExpanded ? "flex-start" : "center",
              "&:hover": {
                bgcolor: "action.hover",
                borderRadius: 1,
                cursor: "pointer",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: isExpanded ? "36px" : "24px" }}>
              <SettingsIcon sx={{color: "#F57400"}} />
            </ListItemIcon>
            {isExpanded && <ListItemText primary="Settings" />}
          </ListItem>
        </Tooltip>

        <Tooltip title={!isExpanded ? currentUser?.name : ""} placement="right" arrow>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: isExpanded ? "flex-start" : "center",
              padding: "12px 16px",
              "&:hover": {
                bgcolor: "action.hover",
                borderRadius: 1,
                cursor: "pointer",
              },
            }}
            onClick={handleUserClick}
          >
            <ListItemIcon sx={{ minWidth: isExpanded ? "36px" : "24px", color: "#F57400" }}>
              <PersonIcon />
            </ListItemIcon>
            {isExpanded && <ListItemText primary={currentUser?.name || "User"} />}
          </Box>
        </Tooltip>

        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: "36px",color: "#F57400" }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Sidebar;
