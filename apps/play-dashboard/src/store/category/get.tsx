import type { Category } from '@thor/db'
import { atom, useAtom } from 'jotai'
import { createQueryAtom } from '@/store/createQueryAtom'
import { useCallback, useEffect } from "react"
import { API_ROUTES } from "@/utils/navigation/api"

type CategoryQueryParams = {
  id: string
}

const categoryIdAtom = atom<CategoryQueryParams>({
  id: ''
})

export const getCategoryQueryAtom = createQueryAtom<CategoryQueryParams, Category | Category[]>(
  'getCategory',
  API_ROUTES.categories.get,
  categoryIdAtom,
  ({id}) => ({id})
)

export function useGetCategoryQuery(initialCategoryId: string): {
  category: Category | null,
  isLoading: boolean,
  error: any
};
export function useGetCategoryQuery(): {
  category: Category[] | null
  isLoading: boolean,
  error: any
};
export function useGetCategoryQuery(initialCategoryId?: string) {
  const [, setCategoryId] = useAtom(categoryIdAtom);
  const [{ data, isLoading, error }] = useAtom(getCategoryQueryAtom);

  const handleFetchCategory = useCallback(
    (id: string) => {
      if (id) {
        setCategoryId({ id });
      }
    },
    [setCategoryId]
  );

  useEffect(() => {
    if (initialCategoryId) {
      handleFetchCategory(initialCategoryId);
    }
  }, [initialCategoryId, handleFetchCategory]);

  return {
    category: data?.data ?? null,
    isLoading,
    error,
  };
}