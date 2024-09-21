import { useAtom } from 'jotai'
import { GameParticipant } from '@thor/db'
import { createMutationAtom } from '@/store/createMutationAtom'
import { API_ROUTES } from "@/utils/navigation/api"

export type CreateGameParticipantParams = {
  gameId: string;
  userId: string;
  submission?: string;
  submissionTime?: string
}

export const CreateGameParticipantAtom = createMutationAtom<CreateGameParticipantParams, GameParticipant>(
  'CreateGameParticipant',
  API_ROUTES.gameParticipant.create
)

export const useCreateGameParticipantAtom = () => useAtom(CreateGameParticipantAtom)