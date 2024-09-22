import {NextRequest, NextResponse} from "next/server";
import {ChatAnthropic} from "@langchain/anthropic";
import {executeReactTailwindAgent} from "@/agents/coding/execute";
import {LangChainAdapter, StreamData} from 'ai';
import {AIMessage, BaseMessage, HumanMessage} from "@langchain/core/messages";
import {updateChatHistoryWithGameId} from "@/api/internal/messages";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId;
    const gameId = body.gameId

    const chatModel = new ChatAnthropic({
      anthropicApiKey: ANTHROPIC_API_KEY,
      model: "claude-3-5-sonnet-20240620",
      temperature: 0.2,
      streaming: true,
    });

    const chainWithHistory = await executeReactTailwindAgent(chatModel);

    let messages: BaseMessage[];
    const currentTime = new Date().toISOString();

    if ("messages" in body) {
      messages = body.messages.map((msg: any) => {
        const messageTime = msg.timestamp || currentTime;
        return msg.role === 'user'
          ? new HumanMessage({content: msg.content, additional_kwargs: {timestamp: messageTime}})
          : new AIMessage({content: msg.content, additional_kwargs: {timestamp: messageTime}});
      });
    } else {
      messages = [new HumanMessage({content: body.prompt, additional_kwargs: {timestamp: currentTime}})];
    }

    const data = new StreamData();

    const lastMessage = messages[messages.length - 1];

    const stream = await chainWithHistory.stream(
      {
        input: lastMessage.content as string,
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
          await updateChatHistoryWithGameId(userId, gameId)
          await data.close();
        },
      },
    });

  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: e.status ?? 500});
  }
}