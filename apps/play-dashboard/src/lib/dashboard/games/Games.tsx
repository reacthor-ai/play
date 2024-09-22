'use client'

import {useState} from 'react'
import {X} from 'lucide-react'
import {Button} from "@/components/ui/button"
import {CreateGame} from "@/lib/dashboard/games/CreateGame";
import {useRouter} from "next/navigation";
import {NAVIGATION} from "@/utils/navigation/routes";
import {GameStatus, User} from '@thor/db'
import {useGetCategoryQuery} from "@/store/category/get";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

import {useGetGameQuery} from "@/store/game/get";
import {Onlinethoreans} from "@/lib/dashboard/games/Onlinethoreans/Onlinethoreans";

type GamesProps = {
  user: User
}

export function Games({user}: GamesProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const router = useRouter()

  const existingCategories = useGetCategoryQuery()
  const {game: games, isLoading} = useGetGameQuery()

  return (
    <div className="min-h-screen bg-[#090d21] text-white p-8">
      {user && <Onlinethoreans user={user}/>}
      <h1 className="text-3xl mb-5">{`{${user.username}}`}, {user.totalPoints} points <i className='line-through'>remaining</i> <i>for now</i></h1>
      <div className="flex justify-between items-center mb-8">
        {
          isLoading ? '' :
            (
              <div>
                {
                  games && <h1 className="text-2xl font-bold transition">{games.length} Game{games.length > 1 ? 's' : ''}</h1>
                }
              </div>
            )
        }
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsPopupOpen(true)}>
          create game?
        </Button>
      </div>
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index}
                      className="bg-[#090d21] border border-gray-700 rounded-lg overflow-hidden animate-pulse">
                  <Skeleton className="w-full h-40"/>
                  <CardHeader className="p-4">
                    <Skeleton className="h-6 w-1/2 mb-2"/>
                    <Skeleton className="h-4 w-full"/>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex justify-between my-4 text-sm text-gray-400">
                      <Skeleton className="h-4 w-1/4"/>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button disabled className="w-full rounded-none bg-green-600">
                      Loading...
                    </Button>
                  </CardFooter>
                </Card>
              ))
          ) : (
            <>
              {
                games && games.map((game) => {
                  return (
                    <Card key={game.id} className="bg-[#090d21] border border-gray-700 rounded-lg overflow-hidden">
                      {game.prompt.includes('http') && (
                        <img src={game.prompt} alt={game.title} className="w-full h-40 object-cover"/>
                      )}
                      <CardHeader className="p-4">
                        <CardTitle className="font-bold text-xl text-white mb-2">{game.title}</CardTitle>
                        <CardDescription
                          className="mb-2 text-gray-300 text-sm">{!game.prompt.includes('http') && game.prompt}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>status: {game.status} {game.status === GameStatus.WAITING ? 'battle here' : ''}</span>
                        </div>

                        <div className="flex mt-4 justify-between text-sm text-gray-400">
                          <span>category: {game?.category?.name}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          onClick={() => router.push(NAVIGATION.Play(game.id))}
                          className="w-full rounded-none bg-green-600 hover:bg-white hover:text-black"
                          disabled={game.status !== GameStatus.WAITING || game.participants.length >= 2}
                        >
                          {game.status !== GameStatus.WAITING ? 'done' : 'play ?'}
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })
              }
            </>
          )}
        </div>
      </main>

      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create New Game</h2>
              <Button variant="ghost" onClick={() => setIsPopupOpen(false)}>
                <X className="h-6 w-6"/>
              </Button>
            </div>
            <CreateGame existingCategories={existingCategories as any} userId={user.id} onClose={setIsPopupOpen}/>
          </div>
        </div>

      )}
    </div>
  )
}