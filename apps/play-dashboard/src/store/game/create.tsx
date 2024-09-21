import { useAtom } from 'jotai'
import { Game } from '@thor/db'
import { createMutationAtom } from '@/store/createMutationAtom'
import { API_ROUTES } from "@/utils/navigation/api"

export type CreateGameParams = {
  prompt: string;
  duration: number;
  maxPlayers?: number;
  points: number;
  title: string;
  createdById: string;
  name: string
  description: string
  existingCategoryId: string
}

export const CreateGameAtom = createMutationAtom<CreateGameParams, Game>(
  'CreateGame',
  API_ROUTES.game.create
)

export const useCreateGameAtom = () => useAtom(CreateGameAtom)
