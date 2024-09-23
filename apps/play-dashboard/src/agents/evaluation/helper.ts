import {ChatAnthropic} from "@langchain/anthropic";
import {executeCodeEvaluationAgent} from "@/agents/evaluation/execute";
import {PickGameParticipants} from "@/api/internal/participant";

export const evaluateSubmissions = async (submissions: PickGameParticipants[], instructions: string, userId: string) => {
  const chatModel = new ChatAnthropic({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-opus-20240229",
  });

  const evaluationAgent = await executeCodeEvaluationAgent(chatModel);

  const result = await evaluationAgent.invoke({
    input: `
Task Instructions:
${instructions}

Player 1's Code Submission:
${submissions[0].submission}

Player 2's Code Submission:
${submissions[1].submission}

Please evaluate both code submissions based on the given instructions and provide scores, explanations, and determine a winner.`
  }, {
    configurable: {sessionId: userId}
  });

  return {
    evaluations: [
      {
        userId: submissions[0].userId,
        score: result.player1Score,
        explanation: result.player1Explanation
      },
      {
        userId: submissions[1].userId,
        score: result.player2Score,
        explanation: result.player2Explanation
      }
    ],
    winner: result.winner,
    overallExplanation: result.overallExplanation
  };
};