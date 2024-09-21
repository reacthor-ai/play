import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";
import {SupabaseVectorStore} from "@langchain/community/vectorstores/supabase";
import {ChatAnthropic} from "@langchain/anthropic";
import {OpenAIEmbeddings} from "@langchain/openai";
import {executeReactTailwindAgent} from "@/agents/coding/execute";

export const runtime = "edge";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId;

    const chatModel = new ChatAnthropic({
      anthropicApiKey: ANTHROPIC_API_KEY,
      model: "claude-3-5-sonnet-20240620",
      temperature: 0.2,
    });

    const client = createClient();
    const vectorstore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
      client,
      tableName: "documents",
      queryName: "match_documents",
    });

    const chainWithHistory = await executeReactTailwindAgent(
      vectorstore,
      chatModel
    )

    const stream = await chainWithHistory.stream(
      {
        input: body.messages[body.messages.length - 1].content,
      },
      {
        configurable: {sessionId: userId},
      }
    );

    return new Response(stream);
  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: e.status ?? 500});
  }
}