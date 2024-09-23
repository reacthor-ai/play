"use client"

import React, {useMemo, useState} from "react"
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {Badge} from "@/components/ui/badge"
import {GameWithCategoryAndParticipantsAndEvaluations} from "@/lib/dashboard/games/evaluation/utils";
import {extractCodeAndExplanation} from "@/utils/extractCodeAndExplanation";
import {CodeViewer} from "@/lib/dashboard/games/play/CodeViewer/CodeViewer";

interface GameResult {
  games: GameWithCategoryAndParticipantsAndEvaluations[]
}

export function GameResultCards({games}: GameResult) {
  const [openDialog, setOpenDialog] = useState<string | null>(null)

  const gamesWithParticipants = useMemo(() => {
    return games.find(game => game.participants.length && game.id === openDialog) ?? null
  }, [games, openDialog])

  return (
    <div className="flex mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {games.map((game) => {
          return (
            <Dialog key={game.id} open={openDialog === game.id}
                    onOpenChange={(isOpen) => setOpenDialog(isOpen ? game.id : null)}>
              <DialogTrigger asChild>
                <Card className="bg-background cursor-pointer text-white border-white">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {game.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{game.prompt}</p>
                  </CardContent>
                  <CardFooter>
                    <Badge className='text-white'>
                      {game.category.name}
                    </Badge>
                  </CardFooter>
                </Card>
              </DialogTrigger>
              <DialogContent className="w-full border-none max-w-4xl">
                {gamesWithParticipants ? (
                  <div className="flex flex-col space-y-4">
                    <DialogHeader>
                      <DialogTitle className="text-white text-xl lowercase">task: {gamesWithParticipants.prompt}</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="w-full">
                      {gamesWithParticipants.participants.length >= 2 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {gamesWithParticipants.participants.map((participant, index) => {
                            if (!participant.submission) return
                            const result = extractCodeAndExplanation(JSON.parse(participant.submission as string).content);
                            const isWinner = gamesWithParticipants.winnerId === participant.userId
                            const evaluation = game.evaluations.find(d =>d.participantId === participant.id)
                            return (
                              <div key={participant.id} className="border-white lowercase border bg-background text-white p-4 rounded-lg">
                                <h3 className="font-bold mb-2">participant {index + 1} {isWinner ? 'winner' : 'loser'}</h3>
                                {result.code && (
                                  <div className="max-h-96 overflow-y-auto">
                                    <CodeViewer code={result.code} />
                                  </div>
                                )}
                                {
                                  evaluation && (
                                    <p className='mt-3'>feedback: {evaluation.feedback}</p>
                                  )
                                }
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center">no submission.</p>
                      )}
                    </DialogDescription>
                  </div>
                ) : (
                  <p className="text-center">no game data available. check later.</p>
                )}
              </DialogContent>
            </Dialog>
          )
        })}

      </div>
    </div>
  )
}