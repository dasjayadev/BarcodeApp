import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ManageOrder from '../../components/Orders/ManageOrders';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const OrderManagement = () => {
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
        <ManageOrder />
      </Box>
    </DashboardLayout>
  );
}
export default OrderManagement;