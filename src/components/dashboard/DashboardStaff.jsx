import React, { useEffect, useState } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'
import { getUsers } from '../../services/api'
const DashboardStaff = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState([])

  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>DashboardStaff</div>
  )
}

export default DashboardStaff