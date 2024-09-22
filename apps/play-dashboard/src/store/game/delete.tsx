import { useAtom } from 'jotai'
import { createMutationAtom } from '@/store/createMutationAtom'
import { API_ROUTES } from "@/utils/navigation/api"

export type DeleteGameParams = {
  gameId: string;
  userId: string;
}

export type DeleteGameResponse = {
  message: string;
}

export const DeleteGameAtom = createMutationAtom<DeleteGameParams, DeleteGameResponse>(
  'DeleteGame',
  API_ROUTES.game.delete
)

export const useDeleteGameAtom = () => useAtom(DeleteGameAtom)