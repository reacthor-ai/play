import {createClient} from '@/utils/supabase/client'
import {prisma} from "@/utils/prisma/client";
import {handlePrismaError} from "@/utils/prisma/error";
import {createPrismaApiResult, type PrismaCustomAPIResult} from "@/utils/prisma/result";

type MessageField = 'session_id' | 'id' | 'timestamp' | 'message'

export const getMessages = async (
  sessionId: string,
  game_id: string,
  fields: MessageField[] | '*' = '*'
) => {
  const supabase = createClient()

  const query = supabase
    .from('chat_history')
    .select(fields === '*' ? '*' : fields.join(', '))
    .eq('session_id', sessionId)
    .eq('game_id', game_id)
    .order('timestamp', {ascending: true})

  const {data, error} = await query

  if (error) {
    console.error('Error fetching messages:', error)
    throw error
  }

  return data
}

export const fetchLastMessage = async (userId: string, gameId: string): Promise<PrismaCustomAPIResult<string | undefined>> => {
  try {
    const lastMessage = await prisma.chat_history.findFirst({
      where: {session_id: userId, game_id: gameId},
      orderBy: {timestamp: 'desc'},
      select: {message: true}
    });
    if (!lastMessage) {
      return createPrismaApiResult(false, undefined, {error: 'No messages found', status: 404});
    }
    return createPrismaApiResult(true, JSON.stringify(lastMessage.message));
  } catch (error) {
    return createPrismaApiResult(false, undefined, handlePrismaError(error));
  }
};