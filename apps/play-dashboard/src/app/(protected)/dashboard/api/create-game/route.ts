import { prisma } from "@/utils/prisma/client";
import { NextResponse } from 'next/server'
import { handlePrismaError } from "@/utils/prisma/error";
import { GameStatus } from "@thor/db";

export async function POST(req: Request) {
  try {
    const {
      prompt,
      duration,
      maxPlayers = 2,
      title,
      createdById,
      name,
      description,
      existingCategoryId,
      points
    } = await req.json()

    if (!prompt || !duration || !title || !createdById) {
      return NextResponse.json(
        { error: 'Prompt, duration, title, and createdById are required' },
        { status: 400 }
      )
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const roomCode = generateRoomCode();

    const newGame = await prisma.game.create({
      data: {
        prompt,
        duration,
        category: {
          connectOrCreate: {
            create: { name, description },
            where: { id: existingCategoryId }
          },
        },
        maxPlayers: maxPlayers ?? 2,
        startTime,
        endTime,
        roomCode,
        points,
        title,
        status: GameStatus.WAITING,
        createdBy: {
          connect: { id: createdById }
        }
      },
      include: {
        category: true,
        createdBy: true
      }
    })

    return NextResponse.json(newGame, { status: 201 })
  } catch (error) {
    return NextResponse.json(handlePrismaError(error))
  }
}

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}