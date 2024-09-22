import {User} from '@thor/db'
import {
  findWinnerAndLoser,
  GameWithCategoryAndParticipantsAndEvaluations
} from "@/lib/dashboard/games/evaluation/utils";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import Link from "next/link";
import {NAVIGATION} from "@/utils/navigation/routes";

type EvaluationRoomProps = {
  game: GameWithCategoryAndParticipantsAndEvaluations
  user: User
}

export const EvaluationRoom = async (props: EvaluationRoomProps) => {
  const {game, user} = props

  const {winner, loser} = findWinnerAndLoser(game, user.id);

  const gameData = {
    title: game.title,
    description: game.prompt,
    winner,
    loser
  }

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center italic">result</h1>
        <Card className="bg-background text-white text-center border-none mb-8">
          <CardHeader>
            <span>your task:</span>
            <CardTitle className="lowercase text-white text-2xl text-center">{gameData.title}</CardTitle>
            <CardContent className='lowercase'>{gameData.description}</CardContent>
          </CardHeader>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-background border-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className='text-white'>winner</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="mb-2 bg-green-600">{winner.isCurrentUser ? 'you' : 'other player'}</Badge>
              <p className="text-sm text-white mb-4">score: {winner.evaluation.score}</p>
              <p className="text-sm text-white">{winner.evaluation.feedback}</p>
            </CardContent>
          </Card>

          <Card className="bg-red-500 border-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className='text-white'>loser</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="mb-2">{!winner.isCurrentUser ? 'you lost. play more?' : 'other player'}</Badge>
              <p className="text-sm text-white mb-4">score: {loser.evaluation.score}</p>
              <p className="text-sm text-white">{loser.evaluation.feedback}</p>
            </CardContent>
          </Card>

          <span className='text-white'>play another{" "}
            <Link href={NAVIGATION.Dashboard.Games}><i className='text-red-800'>game?</i></Link>
          </span>
        </div>
      </div>
    </div>
  )
}