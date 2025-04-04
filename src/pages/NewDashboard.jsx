import React from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout'
import DashboardTable from '../components/dashboard/DashboardTable'

const NewDashboard = () => {
  return (
    <>
    <DashboardLayout>
        <div>
            <DashboardTable />
        </div>
    </DashboardLayout>
    </>
  )
}

export default NewDashboard