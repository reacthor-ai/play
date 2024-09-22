import { useAtom } from 'jotai'
import { Game } from '@thor/db'
import { createMutationAtom } from '@/store/createMutationAtom'
import { API_ROUTES } from "@/utils/navigation/api"

export type UpdateUserPointsParams = {
  winner: {
    points: number
    id: string
  },
  quitter: {
    points: number
    id: string
  }
}

export const UpdateUserPointsAtom = createMutationAtom<UpdateUserPointsParams, Game>(
  'UpdateUserPoints',
  API_ROUTES.user.updatePoints
)

export const useUpdateUserPointsAtom = () => useAtom(UpdateUserPointsAtom)
