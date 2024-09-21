import {atomWithMutation} from 'jotai-tanstack-query'
import {handlePrismaError, type PrismaErrorResponse} from "@/utils/prisma/error";

type MutationResult<R> = {
  status: 'fulfilled' | 'rejected'
  result: R | null
  error: PrismaErrorResponse | Error | null
}

export const createMutationAtom = <T, R>(
  key: string,
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST'
) => {
  return atomWithMutation(() => ({
    mutationKey: [key],
    mutationFn: async (params: T): Promise<MutationResult<R>> => {
      const body = JSON.stringify(params)
      try {
        const response = await fetch(endpoint, {
          method,
          body,
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()
        if (!response.ok || data && "error" in data) {
          const prismaError = data as PrismaErrorResponse
          return {
            status: 'rejected',
            result: null,
            error: handlePrismaError(prismaError.error)
          }
        }

        return {
          status: 'fulfilled',
          result: data as R,
          error: null
        }
      } catch (error) {
        console.error(`Error in ${key} mutation:`, error)
        return {
          status: 'rejected',
          result: null,
          error: error instanceof Error ? error : new Error(String(error))
        }
      }
    }
  }))
}