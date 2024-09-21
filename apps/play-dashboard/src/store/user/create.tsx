import {useAtom} from 'jotai'
import {User} from '@thor/db'
import {createMutationAtom} from '@/store/createMutationAtom'
import {API_ROUTES} from "@/utils/navigation/api";

type CreateUserParams = Pick<User, 'username' | 'email' | 'supabaseId' | 'country'> & {
  onboarding?: boolean
}

export const CreateUserAtom = createMutationAtom<CreateUserParams, User>(
  'CreateUser',
  API_ROUTES.user.create
)

export const useCreateUserAtom = () => useAtom(CreateUserAtom)