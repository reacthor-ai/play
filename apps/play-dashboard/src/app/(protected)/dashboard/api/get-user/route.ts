import {prisma} from "@/utils/prisma/client";
import {NextResponse} from 'next/server'
import {handlePrismaError} from "@/utils/prisma/error";

export async function GET(req: Request) {
  try {
    const {searchParams} = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {error: 'User ID is required'},
        {status: 400}
      )
    }

    const user = await prisma.user.findUnique({
      where: {supabaseId: id}
    })

    if (!user) {
      return NextResponse.json(
        {error: 'User not found'},
        {status: 404}
      )
    }

    return NextResponse.json(user, {status: 200})
  } catch (error) {
    return NextResponse.json(handlePrismaError(error), { status: 404 })
  }
}