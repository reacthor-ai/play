import {prisma} from "@/utils/prisma/client";

import {NextResponse} from 'next/server'
import {handlePrismaError} from "@/utils/prisma/error";

export async function POST(req: Request) {
  const {
    winner,
    quitter
  } = await req.json()
  try {
    if (!winner || !quitter) {
      return NextResponse.json(
        {error: 'winner and quitter are required'},
        {status: 400}
      )
    }

    const updateQuittersPoints = prisma.user.update({
      where: { id: quitter.id },
      data: { totalPoints: { decrement: quitter.points } },
    })

    const updateWinnersPoints = prisma.user.update({
      where: { id: winner.id },
      data: { totalPoints: { increment: winner.points } },
    })

    await Promise.all([updateQuittersPoints, updateWinnersPoints])

    return NextResponse.json({ success: true }, {status: 201})
  } catch (error) {
    return NextResponse.json(handlePrismaError(error))
  }
}