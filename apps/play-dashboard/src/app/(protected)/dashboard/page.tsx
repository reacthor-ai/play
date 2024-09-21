import {Dashboard} from "@/lib/dashboard/Dashboard";
import {DashboardCustomLayout} from "@/components/custom/dashboard-layout";

export default async function DashboardPage() {
  return (
    <DashboardCustomLayout>
      <div className='w-full'>
        <Dashboard/>
      </div>
    </DashboardCustomLayout>
  )
}