import React, { useState } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Menu,
  MenuItem,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
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
  ChevronRight as ExpandIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const open = Boolean(anchorEl);
  
  // Example user data - in a real app, this would come from authentication context
  const user = {
    name: "John Doe"
  };

  const handleUserClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Implement logout functionality here
    handleClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const navigationItems = [
    { text: 'Orders', icon: <OrdersIcon />, path: '/orders' },
    { text: 'Table Management', icon: <TableIcon />, path: '/tables' },
    { text: 'Menu Management', icon: <MenuIcon />, path: '/menu' },
    { text: 'Offers Management', icon: <OffersIcon />, path: '/offers' },
    { text: 'User Management', icon: <UserManagementIcon />, path: '/users' },
  ];

  return (
    <Box
      sx={{
        width: isExpanded ? 220 : 70,
        bgcolor: 'background.paper',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid',
        borderColor: 'divider',
        transition: 'width 0.3s ease',
        position: 'relative',
        // overflow: 'hidden'   
      }}
    >
      {/* Toggle Button */}
      <IconButton 
        onClick={toggleSidebar}
        sx={{
          position: 'absolute',
          right: -20,
          top: 0,
          zIndex: 1
        }}
      >
        {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
      </IconButton>
      
      {/* Brand logo/name */}
      {/* <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        {isExpanded ? (
          <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
            BarcodeApp
          </Typography>
        ) : (
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            BA
          </Typography>
        )}
      </Box>
      
      <Divider /> */}
      
      {/* Navigation Items */}
      <List>
        {navigationItems.map((item) => (
          <Tooltip
            key={item.text}
            title={!isExpanded ? item.text : ""}
            placement="right"
          >
            <ListItem 
              button
              onClick={() => handleNavigation(item.path)}
              sx={{
                px: 2,
                py: 1.5,
                justifyContent: isExpanded ? 'flex-start' : 'center',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  cursor: 'pointer'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: isExpanded ? '36px' : '24px' }}>
                {item.icon}
              </ListItemIcon>
              {isExpanded && <ListItemText primary={item.text} />}
            </ListItem>
          </Tooltip>
        ))}
      </List>
      
      {/* Bottom Section */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 1 }} />
        <Tooltip title={!isExpanded ? "Settings" : ""} placement="right">
          <ListItem 
            button
            onClick={() => handleNavigation('/settings')}
            sx={{
              px: 2,
              py: 1.5,
              justifyContent: isExpanded ? 'flex-start' : 'center',
              '&:hover': {
                bgcolor: 'action.hover',
                borderRadius: 1,
                cursor: 'pointer'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: isExpanded ? '36px' : '24px' }}>
              <SettingsIcon />
            </ListItemIcon>
            {isExpanded && <ListItemText primary="Settings" />}
          </ListItem>
        </Tooltip>
        
        <Tooltip title={!isExpanded ? user.name : ""} placement="right">
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              padding: '12px 16px',
              '&:hover': {
                bgcolor: 'action.hover',
                borderRadius: 1,
                cursor: 'pointer'
              }
            }}
            onClick={handleUserClick}
          >
            <ListItemIcon sx={{ minWidth: isExpanded ? '36px' : '24px' }}>
              <PersonIcon />
            </ListItemIcon>
            {isExpanded && <ListItemText primary={user.name} />}
          </Box>
        </Tooltip>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItem onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: '36px' }}>
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