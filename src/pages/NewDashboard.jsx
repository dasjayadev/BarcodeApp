import React from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout'
import DashboardTable from '../components/dashboard/DashboardTable'
import DashboardOrders from '../components/dashboard/DashboardOrders'

const NewDashboard = () => {
  return (
    <>
    <DashboardLayout>
        <div style={{backgroundColor:"#f9fafb"}}>
            <div>
            <DashboardTable />
            </div>
            <div>
              <DashboardOrders />
            </div>
        </div>
    </DashboardLayout>
    </>
  )
}

export default NewDashboard