import {prisma} from "@/utils/prisma/client";
import {handlePrismaError} from "@/utils/prisma/error";
import {createPrismaApiResult, type PrismaCustomAPIResult} from "@/utils/prisma/result";

export const updateGameStatus = async (gameId: string, winnerId: string | null): Promise<PrismaCustomAPIResult<void>> => {
  try {
    await prisma.game.update({
      where: {id: gameId},
      data: {
        status: 'COMPLETED',
        winnerId
      }
    });
    return createPrismaApiResult(true);
  } catch (error) {
    return createPrismaApiResult(false, undefined, handlePrismaError(error));
  }
};