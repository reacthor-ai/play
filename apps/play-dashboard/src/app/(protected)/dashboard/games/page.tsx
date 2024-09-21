import {Games} from "@/lib/dashboard/games";
import {DashboardCustomLayout} from "@/components/custom/dashboard-layout";
import {getUser} from "@/api/internal/user";

export default async function DashboardGamesPage() {
  const user = await getUser()
  return (
    <DashboardCustomLayout>
      <Games user={user} />
    </DashboardCustomLayout>
  )
}