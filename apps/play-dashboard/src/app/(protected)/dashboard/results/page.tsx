import {DashboardCustomLayout} from "@/components/custom/dashboard-layout";
import {prisma} from "@/utils/prisma/client";
import {getUser} from "@/api/internal/user";
import {GameResultCards} from "@/lib/dashboard/results/Results";
import Link from "next/link";
import {NAVIGATION} from "@/utils/navigation/routes";

export default async function DashboardResults() {

  const user = await getUser()

  const games = await prisma.game.findMany({
    where: {
      createdById: user?.id
    },
    include: {
      category: true,
      participants: true,
      evaluations: true
    },
  })
  return (
    <DashboardCustomLayout>
      <div className='w-full ml-10'>
        <br/>
        <br/>
        <h1 className='text-xl'>Result</h1>

        <div className="mt-5">
          {!!games.length ? <GameResultCards games={games}/> :
            (
              <>
                <span>nothing yet...{" "}
                  <Link className='text-red-800 italic' href={NAVIGATION.Dashboard.Games}>create game?</Link>
                </span>
              </>
            )
          }
        </div>
      </div>
    </DashboardCustomLayout>
  )
}