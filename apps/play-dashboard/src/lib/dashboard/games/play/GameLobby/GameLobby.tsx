'use client'

import { useState, useEffect } from 'react'
import { Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {useRouter} from "next/navigation";
import {NAVIGATION} from "@/utils/navigation/routes";

export default function GameLobby() {
  const router = useRouter()
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length >= 3 ? '.' : prevDots + '.'))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Alert className="mb-8 max-w-md">
        <Users className="h-4 w-4" />
        <AlertTitle>Waiting for Opponent</AlertTitle>
        <AlertDescription>
          Please wait while we find an opponent for you. The game will start automatically once a player joins.
        </AlertDescription>
      </Alert>

      <Card className="w-[380px] text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Game Lobby</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xl font-semibold">Waiting for opponent{dots}</p>
          </div>
          <p className="mt-4 text-muted-foreground">
            Your game will begin as soon as another player joins. Get ready!
          </p>

          <p className="mt-4 text-red-500">
            Once the game starts you will not be able to quit, quitting could cost you -1 point
          </p>

        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => {
            router.push(NAVIGATION.Dashboard.Games)
          }}>
            Cancel and Return to Games List
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}