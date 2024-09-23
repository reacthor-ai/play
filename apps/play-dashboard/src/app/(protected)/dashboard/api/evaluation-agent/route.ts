import {NextRequest, NextResponse} from 'next/server';
import {evaluateSubmissions} from "@/agents/evaluation/helper";
import {updateGameStatus} from "@/api/internal/game";
import {fetchLastMessage} from "@/api/internal/messages";
import {createPrismaApiResult} from "@/utils/prisma/result";
import {
  fetchParticipants,
  PickGameParticipants,
  updateParticipantEvaluation,
  updateParticipantSubmission
} from "@/api/internal/participant";
import {handlePrismaError} from "@/utils/prisma/error";
import {prisma} from "@/utils/prisma/client";
import {updateCreatorPoints, updateUserWinnerPoints} from "@/api/internal/user";


export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const {
      gameId,
      userId,
      game,
    } = await req.json();

    const participantsResult = await fetchParticipants(gameId);
    if (!participantsResult.success) {
      return NextResponse.json({error: (participantsResult as any).error.error}, {status: (participantsResult as any).error.status});
    }

    const allParticipants = participantsResult.data!;
    const participantsWithSubmissions = await Promise.all(
      allParticipants.map(async (participant: PickGameParticipants) => {
        if (!participant.submission && participant.userId === userId) {
          const lastMessageResult = await fetchLastMessage(participant.userId, participant.gameId);
          if (!lastMessageResult.success) {
            return createPrismaApiResult(false, undefined, lastMessageResult.error);
          }
          const updateResult = await updateParticipantSubmission(participant.id, lastMessageResult.data!);
          if (!updateResult.success) {
            return createPrismaApiResult(false, undefined, updateResult.error);
          }
          return createPrismaApiResult(true, {...participant, submission: lastMessageResult.data});
        }
        return createPrismaApiResult(true, participant);
      })
    );

    const failedParticipant = participantsWithSubmissions.find(result => !result.success);
    if (failedParticipant) {
      return NextResponse.json({error: failedParticipant.error!.error}, {status: failedParticipant.error!.status});
    }

    const allSubmitted = participantsWithSubmissions.every(p => (p as any).data.submission);
    if (!allSubmitted) {
      return NextResponse.json({
        message: 'Submission received, waiting for other participant',
      });
    }

    const evaluationResult = await evaluateSubmissions(
      (participantsWithSubmissions as unknown as any).map((r: any) => r.data!),
      game.prompt,
      userId
    );

    // Determine the winner
    const winnerIndex = evaluationResult.evaluations.reduce((maxIndex, evals, currentIndex, array) =>
      evals.score > array[maxIndex].score ? currentIndex : maxIndex, 0);

    const winner = participantsWithSubmissions[winnerIndex].data!;

    // Update all participants with their evaluation
    const evaluationUpdateResults = await Promise.all(
      participantsWithSubmissions.map((participantResult, index) =>
        updateParticipantEvaluation(
          participantResult.data!.id,
          index === winnerIndex ? game.points : 0, // Only winner gets points
          evaluationResult.evaluations[index].explanation,
          gameId
        )
      )
    );

    // Check if any evaluation update failed
    const failedEvaluationUpdate = evaluationUpdateResults.find(result => !result.success);
    if (failedEvaluationUpdate) {
      return NextResponse.json({error: failedEvaluationUpdate.error!.error}, {status: failedEvaluationUpdate.error!.status});
    }

    // Update winner's points
    const winnerPointsUpdateResult = await updateUserWinnerPoints(winner.userId, game.points);
    if (!winnerPointsUpdateResult.success) {
      return NextResponse.json({error: winnerPointsUpdateResult.error!.error}, {status: winnerPointsUpdateResult.error!.status});
    }

    // Update game creator's points (deduct the bid amount)
    const creatorPointsUpdateResult = await updateCreatorPoints(game.createdById, game.points);
    if (!creatorPointsUpdateResult.success) {
      return NextResponse.json({error: creatorPointsUpdateResult.error!.error}, {status: creatorPointsUpdateResult.error!.status});
    }

    // Update game status
    const gameStatusUpdateResult = await updateGameStatus(gameId, winner.userId);
    if (!gameStatusUpdateResult.success) {
      return NextResponse.json({error: gameStatusUpdateResult.error!.error}, {status: gameStatusUpdateResult.error!.status});
    }

    return NextResponse.json({
      message: 'Game completed and evaluated',
      evaluationResult: {
        ...evaluationResult,
        winner: winner.userId
      }
    });

  } catch (e: any) {
    console.error('Error in POST handler:', e);
    const error = handlePrismaError(e);
    return NextResponse.json({error: error.error}, {status: error.status});
  } finally {
    await prisma.$disconnect();
  }
}