import {GameParticipant} from '@thor/db'
import {prisma} from "@/utils/prisma/client";
import {handlePrismaError} from "@/utils/prisma/error";
import {createPrismaApiResult, type PrismaCustomAPIResult} from "@/utils/prisma/result";

export type PickGameParticipants = Pick<GameParticipant, 'id' | 'userId' | 'gameId' | 'submission'>

export const fetchParticipants = async (gameId: string): Promise<PrismaCustomAPIResult<PickGameParticipants[]>> => {
  try {
    const participants = await prisma.gameParticipant.findMany({
      where: {gameId},
      select: {id: true, userId: true, gameId: true, submission: true}
    });
    return createPrismaApiResult(true, participants);
  } catch (error) {
    return createPrismaApiResult(false, undefined, handlePrismaError(error));
  }
};

export const fetchParticipant = async (participantId: string): Promise<PrismaCustomAPIResult<PickGameParticipants>> => {
  try {
    const participant = await prisma.gameParticipant.findUnique({
      where: { id: participantId },
      select: { id: true, userId: true, gameId: true, submission: true }
    });
    if (!participant) {
      return createPrismaApiResult(false, undefined, { error: 'Participant not found', status: 404 });
    }
    return createPrismaApiResult(true, participant);
  } catch (error) {
    return createPrismaApiResult(false, undefined, handlePrismaError(error));
  }
};

export const updateParticipantSubmission = async (participantId: string, submission: string): Promise<PrismaCustomAPIResult<void>> => {
  try {
    await prisma.gameParticipant.update({
      where: {id: participantId},
      data: {submission}
    });
    return createPrismaApiResult(true);
  } catch (error) {
    return createPrismaApiResult(false, undefined, handlePrismaError(error));
  }
};

export const updateParticipantEvaluation = async (participantId: string, points: number, finalEvaluation: string, gameId: string): Promise<PrismaCustomAPIResult<void>> => {
  try {
    await prisma.evaluation.upsert({
      where: {participantId},
      update: {score: points, feedback: finalEvaluation},
      create: {participantId, score: points, feedback: finalEvaluation, gameId}
    });
    return createPrismaApiResult(true);
  } catch (error) {
    return createPrismaApiResult(false, undefined, handlePrismaError(error));
  }
};