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
        <AlertTitle>wait</AlertTitle>
        <AlertDescription>
          the game will start automatically once a player joins.
        </AlertDescription>
      </Alert>

      <Card className="w-[380px] text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">chill.</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xl font-semibold"> looking{dots}</p>
          </div>

          <p className="mt-4 text-red-500">
            leaving the game cost: -1
          </p>

        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => {
            router.push(NAVIGATION.Dashboard.Games)
          }}>
            turn back?
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}