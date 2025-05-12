import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ManageTables from '../../components/tables/ManageTables';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const TableManagement = () => {
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
        <ManageTables />
      </Box>
    </DashboardLayout>
  );
}
export default TableManagement;