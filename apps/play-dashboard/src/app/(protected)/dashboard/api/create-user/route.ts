import {prisma} from "@/utils/prisma/client";

import {NextResponse} from 'next/server'
import {handlePrismaError} from "@/utils/prisma/error";

export async function POST(req: Request) {
  try {
    const {username, email, supabaseId, country, onboarding} = await req.json()

    if (!username || !email || !supabaseId) {
      return NextResponse.json(
        {error: 'Username, email, and supabaseId are required'},
        {status: 400}
      )
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        supabaseId,
        country,
        onboarding: onboarding ?? false,
      },
    })
    return NextResponse.json(newUser, {status: 201})
  } catch (error) {
    return NextResponse.json(handlePrismaError(error))
  }
}