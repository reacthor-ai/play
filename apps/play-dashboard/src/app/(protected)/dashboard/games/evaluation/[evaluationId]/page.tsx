import {prisma} from "@/utils/prisma/client";
import {notFound} from "next/navigation";

export default async function DashboardEvaluationPage(props) {
  const gameId = props.params.evaluationId

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
    <>Hello, world</>
  )
}