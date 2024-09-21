import {PrismaErrorResponse} from "@/utils/prisma/error";

export type PrismaCustomAPIResult<T> = {
  success: boolean;
  data?: T;
  error?: PrismaErrorResponse;
};

export const createPrismaApiResult = <T>(success: boolean, data?: T, error?: PrismaErrorResponse): PrismaCustomAPIResult<T> => ({
  success,
  data,
  error
});