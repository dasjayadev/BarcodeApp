import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ManageMenu from '../../components/Menus/ManageMenu';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const MenuManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <DashboardLayout>
      <Box
        sx={{
          backgroundColor: '#f9fafb',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? 2 : 4
        }}
      >
        <ManageMenu    />
      </Box>
    </DashboardLayout>
  );
}
export default MenuManagement;