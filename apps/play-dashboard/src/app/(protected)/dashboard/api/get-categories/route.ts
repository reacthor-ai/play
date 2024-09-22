import { prisma } from "@/utils/prisma/client";
import { NextResponse } from 'next/server'
import { handlePrismaError } from "@/utils/prisma/error";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json(
      {error: 'User ID is required'},
      {status: 400}
    )
  }

  try {
    if (id.length >= 1) {
      const category = await prisma.category.findUnique({
        where: { id },
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(category, { status: 200 })
    } else {
      const categories = await prisma.category.findMany({
        include: {
          games: {
            select: {
              id: true,
            }
          }
        }
      })
      return NextResponse.json(categories, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json(handlePrismaError(error))
  }

}