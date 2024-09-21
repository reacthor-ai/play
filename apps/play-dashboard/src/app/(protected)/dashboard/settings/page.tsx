import {SignOut} from "@/components/custom/sign-out";
import {DashboardCustomLayout} from "@/components/custom/dashboard-layout";

export default async function DashboardSettings() {

  return (
    <DashboardCustomLayout>
      <div className='w-full ml-10 mt-8'>
        <h1 className='text-xl'>Settings</h1>

        <div className="mt-5">
          <SignOut/>
        </div>
      </div>
    </DashboardCustomLayout>
  )
}