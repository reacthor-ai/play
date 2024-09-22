import {Games} from "@/lib/dashboard/games";
import {DashboardCustomLayout} from "@/components/custom/dashboard-layout";
import {getUser} from "@/api/internal/user";
import {notFound} from "next/navigation";

export default async function DashboardGamesPage() {
  const user = await getUser()

  if (!user) {
    notFound()
  }

  return (
    <DashboardCustomLayout>
      <Games user={user} />
    </DashboardCustomLayout>
  )
}