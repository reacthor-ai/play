import {guardOnboardingInternals} from "@/utils/guard";
import {UserOnboarding} from "@/lib/onboarding";

export default async function DashboardOnboardingPage() {
  await guardOnboardingInternals()

  return (
    <div className='w-full'>
      <UserOnboarding/>
    </div>
  )
}