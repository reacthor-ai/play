import {GameWithCategoryAndParticipants} from "@/store/game/get";
import {Evaluation} from '@thor/db'

export type GameWithCategoryAndParticipantsAndEvaluations =
  GameWithCategoryAndParticipants & { evaluations: Evaluation[] }

export const findWinnerAndLoser = (game: GameWithCategoryAndParticipantsAndEvaluations, currentUserId: string) => {
  const sortedEvaluations = [...game.evaluations].sort((a, b) => b.score - a.score);

  const createParticipantInfo = (evaluation, index) => {
    const participant = game.participants[index];
    return {
      evaluation: evaluation,
      participant: participant,
      isCurrentUser: participant.userId === currentUserId
    };
  };

  const winner = sortedEvaluations[0].score !== 0 ? createParticipantInfo(sortedEvaluations[0], game.evaluations.indexOf(sortedEvaluations[0])) : null;
  const loser = sortedEvaluations[sortedEvaluations.length - 1].score !== sortedEvaluations[0].score ?
    createParticipantInfo(
      sortedEvaluations[sortedEvaluations.length - 1],
      game.evaluations.indexOf(sortedEvaluations[sortedEvaluations.length - 1])
    ) : null;

  return {winner, loser};
};