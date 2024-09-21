export type SupabaseResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const createSupabaseResult = <T>(success: boolean, data?: T, error?: string): SupabaseResult<T> => ({
  success,
  data,
  error
});