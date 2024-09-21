import {Prisma} from '@thor/db'

export interface PrismaErrorResponse {
  error: string,
  status: number
}

export function handlePrismaError(error: unknown): PrismaErrorResponse {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const field = error.message
      return {
        error: field,
        status: 409
      }
    }
    return {
      error: `Database error: ${error.message}`,
      status: 500
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      error: 'Invalid data provided',
      status: 400
    }
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      error: 'Database connection error',
      status: 500
    }
  } else if (error instanceof Error) {
    return {
      error: `Unexpected error: ${error.message}`,
      status: 500
    }
  } else {
    return {
      error: 'An unknown error occurred',
      status: 500
    }
  }
}
