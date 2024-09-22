import { prisma } from "@/utils/prisma/client";
import { NextResponse } from 'next/server'
import { handlePrismaError } from "@/utils/prisma/error";

export async function POST(req: Request) {
  try {
    const { gameId, userId } = await req.json()

    if (!gameId || !userId) {
      return NextResponse.json(
        { error: 'Game ID and User ID are required' },
        { status: 400 }
      )
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { createdById: true, status: true }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    if (game.createdById !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the game creator can delete the game' },
        { status: 403 }
      )
    }

    if (game.status !== 'WAITING') {
      return NextResponse.json(
        { error: 'Cannot delete a game that has already started or finished' },
        { status: 400 }
      )
    }

    await prisma.game.delete({
      where: { id: gameId }
    });

    return NextResponse.json(
      { message: 'Game successfully deleted' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(handlePrismaError(error))
  }
}