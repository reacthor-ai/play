import { prisma } from "@/utils/prisma/client";
import { NextResponse } from 'next/server'
import { handlePrismaError } from "@/utils/prisma/error";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  try {
    if (id.length >= 1) {
      const game = await prisma.game.findUnique({
        where: { id },
      })

      if (!game) {
        return NextResponse.json(
          { error: 'Games not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(game, { status: 200 })
    } else {
      const games = await prisma.game.findMany({
        include: {
          category: true,
          participants: true
        },
      })
      return NextResponse.json(games, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json(handlePrismaError(error))
  }
}