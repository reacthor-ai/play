import type { Game, Category, GameParticipant } from '@thor/db'
import { atom, useAtom } from 'jotai'
import { createQueryAtom } from '@/store/createQueryAtom'
import { useCallback, useEffect } from "react"
import { API_ROUTES } from "@/utils/navigation/api"

export type GameWithCategoryAndParticipants = Game & { category: Category } & { participants: GameParticipant[] }

type GameQueryParams = {
  id: string
}

const gameIdAtom = atom<GameQueryParams>({
  id: ''
})

export const getGameQueryAtom = createQueryAtom<GameQueryParams, Game | Game[]>(
  'getGame',
  API_ROUTES.game.get,
  gameIdAtom,
  ({id}) => ({id})
)

export function useGetGameQuery(initialCategoryId: string): {
  game: GameWithCategoryAndParticipants | null,
  isLoading: boolean,
  error: any
};
export function useGetGameQuery(): {
  game: GameWithCategoryAndParticipants[] | null
  isLoading: boolean,
  error: any
};
export function useGetGameQuery(initialCategoryId?: string) {
  const [, setGameId] = useAtom(gameIdAtom);
  const [{ data, isLoading, error }] = useAtom(getGameQueryAtom);

  const handleFetchGame = useCallback(
    (id: string) => {
      if (id) {
        setGameId({ id });
      }
    },
    [setGameId]
  );

  useEffect(() => {
    if (initialCategoryId) {
      handleFetchGame(initialCategoryId);
    }
  }, [initialCategoryId, handleFetchGame]);

  return {
    game: data?.data ?? null,
    isLoading,
    error,
  };
}