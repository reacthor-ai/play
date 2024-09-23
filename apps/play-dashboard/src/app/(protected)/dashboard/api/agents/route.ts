import {NextRequest, NextResponse} from "next/server";
import {ChatAnthropic} from "@langchain/anthropic";
import {executeReactTailwindAgent} from "@/agents/coding/execute";
import {LangChainAdapter, StreamData} from 'ai';
import {createClient} from "@/utils/supabase/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId;
    const gameId = body.gameId
    const supabase = createClient()

    const chatModel = new ChatAnthropic({
      anthropicApiKey: ANTHROPIC_API_KEY,
      model: "claude-3-5-sonnet-20240620",
      temperature: 0.2,
      streaming: true,
    });

    const chainWithHistory = await executeReactTailwindAgent(chatModel);

    const currentTime = new Date().toISOString();

    const data = new StreamData();

    const stream = await chainWithHistory.stream(
      {
        input: body.prompt,
        current_time: currentTime,
      },
      {
        configurable: {sessionId: userId},
      },
    )

    return LangChainAdapter.toDataStreamResponse(stream, {
      data,
      callbacks: {
        async onFinal() {

          try {
            const updateHistory = supabase
              .from('chat_history')
              .update({game_id: gameId})
              .eq('session_id', userId)
            const closeData = data.close();

            await Promise.all([updateHistory, closeData])
          } catch (error) {
            console.log(`Error_saving_messages: `, error)
          }
        },
      },
    });

  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: e.status ?? 500});
  }
}