import {prisma} from "@/utils/prisma/client";
import {notFound} from "next/navigation";
import {EvaluationRoom} from "@/lib/dashboard/games/evaluation";
import {getUser} from "@/api/internal/user";

export default async function DashboardEvaluationPage(props) {
  const gameId = props.params.evaluationId

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

  const currentUser = await getUser()

  const isParticipantWaiting = game.participants.length === 1

  if (!game || isParticipantWaiting) {
    notFound()
  }

  return (
    <EvaluationRoom
      game={game}
      user={currentUser}
    />
  )
}