import React, { useState, useEffect } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";

const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Initialize sidebar state based on screen size
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  
  // Collapse sidebar automatically on small screens when component mounts or screen size changes
  useEffect(() => {
    if (isMobile && isExpanded) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar />
      <Sidebar isExpanded={isExpanded} toggleSidebar={toggleSidebar} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: isExpanded ? '220px' : '70px',
          transition: 'margin-left 0.3s ease',
          width: { 
            xs: `calc(100% - ${isExpanded ? '220px' : '70px'})`, 
            sm: `calc(100% - ${isExpanded ? '220px' : '70px'})`
          },
          marginTop: "64px", // Navbar height
          minHeight: "calc(100vh - 64px)",
          overflow: "auto",
          padding: isSmall ? 1 : 2
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
