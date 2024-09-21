import {prisma} from "@/utils/prisma/client";
import {NextResponse} from 'next/server'
import {handlePrismaError} from "@/utils/prisma/error";

export async function POST(req: Request) {
  try {
    const {
      gameId,
      userId,
      submission,
      submissionTime,
    } = await req.json()

    if (!gameId || !userId) {
      return NextResponse.json(
        {error: 'GameId and userId are required'},
        {status: 400}
      )
    }

    const newGameParticipant = await prisma.gameParticipant.create({
      data: {
        gameId,
        userId,
        submission,
        submissionTime,
        isTyping: false,
        lastActivity: new Date()
      },
      include: {
        game: true,
        user: true
      }
    })

    return NextResponse.json(newGameParticipant, {status: 201})
  } catch (error) {
    return NextResponse.json(handlePrismaError(error))
  }
}

export async function GET(req: Request) {
  try {
    const {searchParams} = new URL(req.url)
    const gameId = searchParams.get('gameId')
    const userId = searchParams.get('userId')

    if (!gameId || !userId) {
      return NextResponse.json(
        {error: 'GameId and userId are required'},
        {status: 400}
      )
    }

    const gameParticipant = await prisma.gameParticipant.findUnique({
      where: {
        gameId_userId: {
          gameId,
          userId
        }
      },
      include: {
        game: true,
        user: true
      }
    })

    if (!gameParticipant) {
      return NextResponse.json(
        {error: 'GameParticipant not found'},
        {status: 404}
      )
    }

    return NextResponse.json(gameParticipant)
  } catch (error) {
    return NextResponse.json(handlePrismaError(error))
  }
}