import {User} from '@thor/db'
import {atom, useAtom} from 'jotai'
import {createQueryAtom} from '@/store/createQueryAtom'
import {useCallback, useEffect} from "react";
import {API_ROUTES} from "@/utils/navigation/api";
import {createClient} from "@/utils/supabase/client";

type UserQueryParams = {
  id: string
}

const userIdAtom = atom<UserQueryParams>({
  id: ''
})

export const getUserQueryAtom = createQueryAtom<UserQueryParams, User>(
  'getUser',
  API_ROUTES.user.get,
  userIdAtom,
  ({id}) => ({id})
)

export const useGetUserQuery = () => {
  const supabase = createClient()
  const [, setUserId] = useAtom(userIdAtom)
  const [query] = useAtom(getUserQueryAtom)

  const handleFetchUser = useCallback(async () => {
    const {data: {user}} = await supabase.auth.getUser()
    if (user && user.id) {
      setUserId({id: user.id})
    }
  }, [setUserId, supabase.auth])

  useEffect(() => {
    handleFetchUser()
  }, [handleFetchUser])
  
  return query.data?.data ?? null
}