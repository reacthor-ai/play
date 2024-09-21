import {PlayerRoom} from "@/lib/dashboard/games/play";
import {prisma} from "@/utils/prisma/client";
import {notFound} from "next/navigation";
import type {GameWithCategoryAndParticipants} from "@/store/game/get";

export default async function DashboardPlayerRoomPage(props) {
  const gameId = props.params.gameId

  if (!gameId) {
    notFound()
  }

  const game = await prisma.game.findUnique({
    where: {id: gameId},
    include: {
      category: true,
      participants: true
    },
  })

  if (!game) {
    notFound()
  }

  return (
    <PlayerRoom game={game as unknown as GameWithCategoryAndParticipants}/>
  )
}