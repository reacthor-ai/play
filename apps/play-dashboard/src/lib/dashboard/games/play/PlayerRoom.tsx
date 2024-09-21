"use client"

import React, {memo, useCallback, useEffect, useRef, useState} from 'react'
import {useRouter} from 'next/navigation'
import {useCompletion} from 'ai/react'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {CircleX, Clock, Info, MessageCircle, MessageSquare, PenToolIcon, UserPlus} from 'lucide-react'
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {createClient} from "@/utils/supabase/client"
import {toast, Toaster} from 'react-hot-toast'
import {useGetUserQuery} from "@/store/user/get"
import {NAVIGATION} from "@/utils/navigation/routes"
import {getMessages} from "@/api/internal/messages";
import {extractCodeAndExplanation} from "@/utils/extractCodeAndExplanation";
import {CodeViewer} from "@/lib/dashboard/games/play/CodeViewer/CodeViewer";
import {CheckboxIcon} from "@radix-ui/react-icons";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {GameWithCategoryAndParticipants} from "@/store/game/get";
import GameLobby from "@/lib/dashboard/games/play/GameLobby/GameLobby";
import {useCreateGameParticipantAtom} from "@/store/gamePartcipants/create";
import {API_ROUTES} from "@/utils/navigation/api";

type Message = {
  text: string;
  sender: 'player' | 'llm' | 'opponent';
  senderId: string;
}

type PlayerStatus = 'online' | 'offline' | 'away';

type PlayerData = {
  id: string;
  userId: string;
  cursorX: number | null;
  cursorY: number | null;
  isTyping: boolean;
  currentInput: string;
  lastActivity: Date;
}

export const PlayerRoom: React.FC<{ game: GameWithCategoryAndParticipants }> = memo(({game}: {
  game: GameWithCategoryAndParticipants
}) => {
  const router = useRouter()
  const gameId = game.id
  const supabase = createClient()
  const [messages1, setMessages1] = useState<Message[]>([])
  const [messages2, setMessages2] = useState<Message[]>([])
  const [timeLeft, setTimeLeft] = useState<number>(game.duration * 60)
  const [opponentStatus, setOpponentStatus] = useState<PlayerStatus>('offline')
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [joinState, setJoinState] = useState<'joining' | 'joined' | 'ready'>('joining');
  const chatRef1 = useRef<HTMLDivElement>(null)
  const chatRef2 = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)

  const user = useGetUserQuery()
  const [{
    mutate: createGameParticipant
  }] = useCreateGameParticipantAtom()

  const {
    completion: player1Completion,
    input: player1Input,
    handleInputChange: handlePlayer1InputChange,
    handleSubmit: handlePlayer1Submit,
    error: player1Error,
    isLoading
  } =
    useCompletion({
      api: API_ROUTES.agents.play,
      body: {
        userId: user?.id,
        gameId
      },
    });

  useEffect(() => {
    const handleJoining = async () => {
      if (!user?.id || !gameId || joinState !== 'joined') return;

      try {
        const {data: existingParticipants} = await supabase
          .from('GameParticipant')
          .select('id, userId')
          .eq('gameId', gameId);

        if (existingParticipants && existingParticipants.length >= 2) {
          if (existingParticipants.some(p => p.userId === user.id)) {
            toast.success('Joined');
          } else {
            toast.error('full. try another');
          }
          return;
        }

        if (!existingParticipants || !existingParticipants.some(p => p.userId === user.id)) {
          await createGameParticipant({
            gameId,
            userId: user.id
          }, {
            onSettled: (data) => {
              if (data && data.status === 'fulfilled') {
                toast.success('cool. your in');
              } else {
                toast.error('trying to get you in.');
                router.push(NAVIGATION.Dashboard.Games);
              }
            }
          });
        } else {
        }
      } catch (error) {
        toast.error('something. must have happened. wait for instructions.');
        router.push(NAVIGATION.Dashboard.Games);
      }
    };

    handleJoining();
  }, [joinState]);

  useEffect(() => {
    if (!user?.id || joinState !== 'joined') return

    const fetchCurrentPlayerMessages = async () => {
      const messagesData = await getMessages(user.id, gameId, '*')

      const formattedMessages: Message[] = messagesData.map((msgData: any) => ({
        text: msgData.message.content,
        sender: msgData.message.type === 'human' ? 'player' : 'llm',
        senderId: msgData.message.type === 'human' ? user.id : 'llm'
      }))

      setMessages1(formattedMessages)
    }

    fetchCurrentPlayerMessages()
  }, [joinState])

  useEffect(() => {
    if (joinState !== 'joined' || !user?.id) return;

    const updateMessages = (newContent: string, sender: 'player' | 'llm') => {
      setMessages1(prevMessages => {
        const lastMessage = prevMessages[prevMessages.length - 1];

        if (lastMessage && lastMessage.sender === sender && newContent.startsWith(lastMessage.text)) {
          return [
            ...prevMessages.slice(0, -1),
            {...lastMessage, text: newContent}
          ];
        }

        return [
          ...prevMessages,
          {
            text: newContent,
            sender: sender,
            senderId: sender === 'llm' ? 'llm' : user.id
          }
        ];
      });
    };

    if (player1Completion) {
      updateMessages(player1Completion, 'llm');
    }
  }, [joinState, player1Completion]);

  useEffect(() => {
    if (!user?.id || !gameId) return;

    const gameChannel = supabase.channel(`game:${gameId}`)

    gameChannel
      .on('presence', {event: 'sync'}, () => {
        const state = gameChannel.presenceState();
        const presenceEntries = Object.values(state).flat();

        const opponentPresence = presenceEntries.find((presence: unknown) =>
          (presence as { user_id: string }).user_id !== user.id
        );

        setOpponentStatus(opponentPresence ? 'online' : 'offline');
        if (presenceEntries.length === 2) {
          setJoinState('joined');
          toast.success('all present. begin.');

          setPlayers(prevPlayers => {
            if (prevPlayers.length < 2 && opponentPresence) {
              return [
                ...prevPlayers,
                {
                  id: (opponentPresence as unknown as { user_id: string }).user_id,
                  userId: (opponentPresence as unknown as { user_id: string }).user_id,
                  cursorX: null,
                  cursorY: null,
                  isTyping: false,
                  currentInput: '',
                  lastActivity: new Date()
                }
              ];
            }
            return prevPlayers;
          });
        }
      })
    gameChannel
      .on('broadcast', {event: 'new_message'}, ({payload}) => {
        const newMessage = payload as Message & { recipientId: string }
        if (newMessage.recipientId === user.id) {
          setMessages1(prev => [
            ...prev,
            {
              ...newMessage,
              sender:
                newMessage.senderId === 'llm' ? 'llm' : 'player'
            }
          ])
        } else {
          setMessages2(prev => [
            ...prev,
            {
              ...newMessage,
              sender:
                newMessage.senderId === 'llm' ? 'llm' : 'player'
            }
          ])
        }
      })
      .on('broadcast', {event: 'cursor'}, ({payload}) => {
        setPlayers(prevPlayers => prevPlayers.map(player =>
          player.userId === payload.userId
            ? {...player, cursorX: payload.x, cursorY: payload.y}
            : player
        ))
      })
      .on('broadcast', {event: 'typing'}, ({payload}) => {
        setPlayers(prevPlayers => prevPlayers.map(player =>
          player.userId === payload.userId
            ? {...player, isTyping: payload.isTyping, currentInput: payload.currentInput}
            : player
        ))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await gameChannel.track({user_id: user.id})
        }
      })

    return () => {
      supabase.removeChannel(gameChannel).catch(err => err)
    }
  }, [user?.id, gameId]);


  const handleSubmission = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(API_ROUTES.agents.evaluation, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          userId: user?.id,
          game: {
            prompt: game.prompt,
            points: game.points,
            createdById: game.createdById
          },
        }),
      });

      if (!response.ok) {
        toast.error('something. must have happened. wait for instructions.');
        setLoading(false)
      }

      const result = await response.json();

      if (result.message === 'Game completed and evaluated') {
        toast.success('Game completed! Redirecting to results...');
        setLoading(false)
        router.push(NAVIGATION.Evaluation(gameId));
      } else if (result.message === 'Submission received, waiting for other participant') {
        toast.custom("wait. an ai will determine your performance");
        setLoading(false)
        router.push(NAVIGATION.Evaluation(gameId));
      } else {
        setLoading(false)
        toast.success(result.message);
      }
    } catch (error) {
      setLoading(false)
      toast.error('something. must have happened. wait for instructions.');
    }
  }, [gameId, user?.id, game.prompt, game.points])

  const handleManualSubmission = () => handleSubmission();

  useEffect(() => {
    if (joinState !== 'joined' || !user?.id) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmission().catch(() => {
            toast.error('something. must have happened. wait for instructions.');
          })
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [joinState, handleSubmission]);

  useEffect(() => {
    if (!user?.id) return
    if (chatRef1.current) {
      chatRef1.current.scrollTop = chatRef1.current.scrollHeight
    }
    if (chatRef2.current) {
      chatRef2.current.scrollTop = chatRef2.current.scrollHeight
    }
  }, [user?.id])

  const getOpponentData = () => players.find(player => player.userId !== user?.id) || null

  const handleSend = async (playerId: string) => {
    const isCurrentUser = playerId === user?.id
    if (isCurrentUser && player1Input.trim()) {
      const newMessage = {text: player1Input, sender: 'player', senderId: user.id}

      const gameChannel = supabase.channel(`game:${gameId}`)
      await gameChannel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: {...newMessage, recipientId: playerId}
      })

      handlePlayer1InputChange({target: {value: ''}} as React.ChangeEvent<HTMLInputElement>)
      await handlePlayer1Submit(new Event('submit'))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, playerId: string) => {
    const isCurrentUser = playerId === user?.id
    if (isCurrentUser) {
      handlePlayer1InputChange(e)
    }

    const gameChannel = supabase.channel(`game:${gameId}`)

    gameChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {userId: user?.id, isTyping: true, currentInput: e.target.value}
    })
  }

  const handleExitGame = async () => {
    await supabase.from('Game').update({status: 'CANCELLED'}).eq('id', gameId)
    router.push(NAVIGATION.Dashboard.Games)
  }

  const updateCursorPosition = async (x: number, y: number) => {
    const gameChannel = supabase.channel(`game:${gameId}`)
    await gameChannel.send({
      type: 'broadcast',
      event: 'cursor',
      payload: {userId: user?.id, x, y}
    })
  }

  const getStatusColor = (status: PlayerStatus): string => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'offline':
        return 'bg-red-500'
      case 'away':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const opponentPlayer = players.find(p => p.userId !== user?.id);

  if (!user) {
    return <>Loading... waiting for user data to come in.</>
  }

  if (joinState !== 'joined') {
    return <GameLobby/>
  }
  return (
    <div className="flex flex-col h-screen" onMouseMove={(e) => updateCursorPosition(e.clientX, e.clientY)}>
      <Toaster/>
      <div className="bg-zinc-900 text-white p-2 flex items-center justify-between rounded-full mx-4 my-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(opponentStatus)} mr-2`}/>
          {opponentStatus.charAt(0).toUpperCase() + opponentStatus.slice(1)}
        </div>
        {joinState === 'joined' && (
          <div className="flex items-center space-x-2 bg-green-500 px-3 py-1 rounded-full">
            <UserPlus size={16}/>
            <span>cool. both online. play,</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <div className="bg-zinc-800 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
            <Clock className="h-3 w-3 mr-1"/>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800 rounded-full">
                <CheckboxIcon className="h-5 w-5"/>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <Button
                variant="success"
                className="w-full"
                onClick={handleManualSubmission}
                disabled={timeLeft === 0 || loading}
              >
                {loading ? 'load...' : 'send your code'}
              </Button>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800 rounded-full">
                <CircleX className="h-5 w-5"/>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleExitGame}
              >
                sure? exits cost.
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Alert className="my-5 bg-red-500">
        <Info className="h-4 w-4"/>
        <AlertTitle>({game.title})</AlertTitle>
        <AlertDescription>
          instruct: {game.prompt} <br/>
          look on the top right you can submit or cancel.
        </AlertDescription>
      </Alert>
      <div className="flex flex-1 overflow-hidden">
        {/* Current User's Chat */}
        <div className="flex-1 p-4 relative">

          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <h2 className="text-2xl font-bold">You</h2>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto relative" ref={chatRef1}>
              {player1Error && (
                <div className="p-4 text-center text-white bg-red-500">
                  {player1Error.message}
                </div>
              )}
              {messages1.map((message, index) => {
                const {explanation, originalText, code} = extractCodeAndExplanation(message.text)

                const currentMessage = message.sender === 'llm'
                  ? (explanation || originalText)
                  : message.text;
                return (
                  <>
                    <div
                      key={index}
                      className={`flex ${message.sender === 'llm' ? 'justify-start' : 'justify-end'} mb-4`}
                    >
                      <div className={`flex items-start ${message.sender === 'llm' ? 'flex-row' : 'flex-row-reverse'}`}>
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={message.sender === 'llm' ? "/placeholder.svg?height=32&width=32" : `/placeholder-user.jpg`}
                          />
                          <AvatarFallback>{message.sender === 'llm' ? 'AI' : 'You'}</AvatarFallback>
                        </Avatar>
                        <div
                          onCopy={e => {
                            e.preventDefault()
                          }}
                          className={`rounded-lg p-2 mr-4 ${
                            message.sender === 'llm' ? 'bg-secondary' : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          {
                            message.sender === 'llm' && code && (
                              <CodeViewer isLoading={isLoading} code={code}/>
                            )
                          }
                          {currentMessage}
                        </div>
                      </div>
                    </div>
                  </>
                )
              })}
              {isLoading && (
                <div className="flex items-center space-x-2 p-2 bg-secondary rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32"/>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"
                         style={{animationDelay: '0s'}}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"
                         style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"
                         style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSend(user.id);
              }} className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={player1Input}
                  onChange={(e) => handleInputChange(e, user.id)}
                  onPaste={(e) => {
                    e.preventDefault()
                  }}
                />
                <Button type="submit" size="icon">
                  <MessageSquare className="h-4 w-4"/>
                  <span className="sr-only">send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>

        {/* Opponent's Chat */}
        <div className="flex-1 p-4 relative">

          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <h2 className="text-2xl font-bold">Opponent</h2>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto relative" ref={chatRef2}>
              {messages2.map((message, index) => (
                <div
                  key={index}
                  className={`flex justify-start mb-4`}
                >
                  <div className="flex items-start flex-row">
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarImage src="/placeholder-user.jpg"/>
                      <AvatarFallback>Opp</AvatarFallback>
                    </Avatar>
                    <div className="bg-blue-200 text-blue-800 rounded-lg p-2">
                      <p>your opponent is sending messages, why wait? ...</p>
                    </div>
                  </div>
                </div>
              ))}
              {opponentPlayer?.isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-start flex-row">
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarImage src="/placeholder-user.jpg"/>
                      <AvatarFallback>Opp</AvatarFallback>
                    </Avatar>
                    <div className="bg-blue-200 text-blue-800 rounded-lg p-2">
                      typing...<MessageCircle className="w-5 h-5 inline ml-1"/>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="w-full bg-gray-100 rounded-md p-2 text-gray-500">
                {
                  opponentPlayer?.isTyping ? 'typing...' : 'idle'
                }
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {getOpponentData() && (
        <PenToolIcon
          className="absolute text-blue-500"
          style={{
            left: getOpponentData()?.cursorX ?? 0,
            top: getOpponentData()?.cursorY ?? 0,
            transition: 'all 0.1s ease-out',
            pointerEvents: 'none',
          }}
          size={40}
        />
      )}
    </div>
  )
})

PlayerRoom.displayName = "PlayerRoom"