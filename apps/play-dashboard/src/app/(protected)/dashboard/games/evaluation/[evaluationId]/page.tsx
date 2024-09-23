import {prisma} from "@/utils/prisma/client";
import {notFound} from "next/navigation";
import {EvaluationRoom} from "@/lib/dashboard/games/evaluation";
import {getUser} from "@/api/internal/user";
import {NextPageProps} from "@/app/(protected)/types";
import {EvaluationLobby} from "@/lib/dashboard/games/evaluation/EvaluationLobby";

export default async function DashboardEvaluationPage(props: NextPageProps<{ evaluationId: string }>) {
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

  if (!game || !currentUser) {
    notFound()
  }

  const isPlayerWaiting = game.evaluations.length <= 1
  if (isPlayerWaiting) {
    return <EvaluationLobby game={game} />
  }

  return (
    <EvaluationRoom
      game={game}
      user={currentUser}
    />
  )
}