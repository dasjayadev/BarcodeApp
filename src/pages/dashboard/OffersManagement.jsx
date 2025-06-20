import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ManageOffers from '../../components/Offers/ManageOffers';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const OffersManagement = () => {
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
          gap: isMobile ? 2 : 4,
          // padding: isMobile ? 1 : 2,
        }}
      >
        <ManageOffers />
      </Box>
    </DashboardLayout>
  );
};

export default OffersManagement;
