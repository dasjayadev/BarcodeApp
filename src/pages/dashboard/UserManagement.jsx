import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ManageUsers from '../../components/Users/ManageUsers';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const UserManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <DashboardLayout>
      <Box 
        sx={{
          backgroundColor: '#f9fafb',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? 2 : 4,
          // padding: isMobile ? 1 : 2,
        }}
      >
        <ManageUsers />
      </Box>
    </DashboardLayout>
  );
};

export default UserManagement;
