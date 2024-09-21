import {atomWithQuery} from 'jotai-tanstack-query'
import {PrimitiveAtom} from 'jotai'
import {handlePrismaError, PrismaErrorResponse} from "@/utils/prisma/error";

export type WithInitialValue<Value> = {
  init: Value
}

type QueryResult<T> = {
  status: 'fulfilled' | 'rejected'
  data: T | null
  error: PrismaErrorResponse | Error | null
}

type QueryParams = Record<string, string | number | boolean>

export const createQueryAtom = <T, E>(
  key: string,
  endpoint: string,
  atom: PrimitiveAtom<T> & WithInitialValue<T>,
  paramsBuilder: (value: T) => QueryParams
) => {
  return atomWithQuery(get => {
    const atomValue = get(atom)
    const queryParams = paramsBuilder(atomValue)
    const queryKey = [key, queryParams]

    return {
      queryKey,
      queryFn: async ({queryKey: [, params]}): Promise<QueryResult<E>> => {
        const searchParams = new URLSearchParams()
        Object.entries(params as QueryParams).forEach(([key, value]) => {
          searchParams.append(key, String(value))
        })

        const url = `${endpoint}?${searchParams.toString()}`

        try {
          const response = await fetch(url, {
            next: {revalidate: 3600},
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          const result = await response.json()

          if (!response.ok) {
            const prismaError = result as PrismaErrorResponse
            return {
              status: 'rejected',
              data: null,
              error: handlePrismaError(prismaError.error)
            }
          }

          return {
            status: 'fulfilled',
            data: result as E,
            error: null
          }
        } catch (error) {
          console.error(`Error in ${key} query:`, error)
          return {
            status: 'rejected',
            data: null,
            error: error instanceof Error ? error : new Error(String(error))
          }
        }
      }
    }
  })
}