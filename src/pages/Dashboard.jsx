import React from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout'
import DashboardTable from '../components/dashboard/DashboardTable'
import DashboardOrders from '../components/dashboard/DashboardOrders'
import DashboardMenu from '../components/dashboard/DashboardMenu'
import DashboardStaff from '../components/dashboard/DashboardStaff'
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
        <DashboardMenu />
        <DashboardStaff />
      </Box>
    </DashboardLayout>
  )
}

export default NewDashboard