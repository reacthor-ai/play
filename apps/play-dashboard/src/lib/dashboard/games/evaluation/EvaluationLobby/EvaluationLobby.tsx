'use client'

import {useEffect, useState} from 'react'
import {Loader2, RefreshCw, Users} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {GameWithCategoryAndParticipantsAndEvaluations} from "@/lib/dashboard/games/evaluation/utils";
import {createClient} from "@/utils/supabase/client";

type EvaluationLobbyProps = {
  game?: GameWithCategoryAndParticipantsAndEvaluations
}

export function EvaluationLobby({game}: EvaluationLobbyProps) {
  const [dots, setDots] = useState('.')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length >= 3 ? '.' : prevDots + '.'))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!game) return

    const gameChannel = supabase.channel(`game:${game.id}`)

    gameChannel.on('presence', {event: 'sync'}, () => {})
  }, [game])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    window.location.reload()
    setIsRefreshing(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Alert className="mb-8 max-w-md">
        <Users className="h-4 w-4"/>
        <AlertTitle>wait</AlertTitle>
        <AlertDescription>
          player is finishing their turn.
        </AlertDescription>
      </Alert>

      <Card className="w-[380px] text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">game in progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            <p className="text-xl font-semibold">chill{dots}</p>
          </div>

          <p className="mt-4 text-muted-foreground">
            dont close this page and come back later.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4"/>
                refresh?
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}