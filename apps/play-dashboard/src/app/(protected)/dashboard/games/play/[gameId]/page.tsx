import {prisma} from "@/utils/prisma/client";
import {notFound} from "next/navigation";
import {getUser} from "@/api/internal/user";
import {GameStatus} from "@thor/db";
import {PlayerRoom} from "@/lib/dashboard/games/play";

export default async function DashboardPlayerRoomPage(props: any) {
  const gameId = props.params.gameId

  if (!gameId) {
    notFound()
  }

  const game = await prisma.game.findUnique({
    where: {id: gameId},
    include: {
      category: true,
      participants: true,
      evaluations: true
    },
  })

  const user = await getUser()

  if (!game || !user) {
    notFound()
  }

  if (game.evaluations.length === 2 || game.status === GameStatus.COMPLETED) {
    notFound()
  }

  return (
    <PlayerRoom user={user} game={game}/>
  )
}