import {prisma} from "@/utils/prisma/client";
import {type Game} from '@thor/db'
import {handlePrismaError} from "@/utils/prisma/error";
import {createPrismaApiResult, type PrismaCustomAPIResult} from "@/utils/prisma/result";

export const fetchGame = async (gameId: string): Promise<PrismaCustomAPIResult<Game | Pick<Game, 'prompt' | 'points'>>> => {
  try {
    const game = await prisma.game.findUnique({
      where: {id: gameId},
      select: {prompt: true, points: true}
    });
    if (!game) {
      return createPrismaApiResult(false, undefined, {error: 'Game not found', status: 404});
    }
    return createPrismaApiResult(true, game);
  } catch (error) {
    return createPrismaApiResult(false, undefined, handlePrismaError(error));
  }
};

export const updateGameStatus = async (gameId: string, winnerId: string | null): Promise<PrismaCustomAPIResult<void>> => {
  try {
    await prisma.game.update({
      where: { id: gameId },
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