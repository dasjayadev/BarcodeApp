import React from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout'
import DashboardTable from '../components/dashboard/DashboardTable'
import DashboardOrders from '../components/dashboard/DashboardOrders'
import { Box, useTheme, useMediaQuery } from '@mui/material'

const NewDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <DashboardLayout>
      <Box 
        sx={{
          backgroundColor: "#f9fafb",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? 2 : 4
        }}
      >
        <DashboardTable />
        <DashboardOrders />
      </Box>
    </DashboardLayout>
  )
}

export default NewDashboard