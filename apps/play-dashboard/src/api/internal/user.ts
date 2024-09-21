import {createClient} from "@/utils/supabase/server";
import {prisma} from "@/utils/prisma/client";
import {User} from "@thor/db";
import {createPrismaApiResult, PrismaCustomAPIResult} from "@/utils/prisma/result";
import {handlePrismaError} from "@/utils/prisma/error";

export const getUser = async (): Promise<User | null> => {
  const supabase = createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return null
  }

  return await prisma.user.findUnique({
    where: {supabaseId: user.id}
  })
}

export const updateUserWinnerPoints = async (userId: string, points: number): Promise<PrismaCustomAPIResult<void>> => {
  try {
    await prisma.user.update({
      where: {id: userId},
      data: {totalPoints: {increment: points}}
    });
    return createPrismaApiResult(true);
  } catch (error) {
    return createPrismaApiResult(false, undefined, handlePrismaError(error));
  }
};

export const updateCreatorPoints = async (userId: string, points: number): Promise<PrismaCustomAPIResult<void>> => {
  try {
    await prisma.user.update({
      where: {id: userId},
      data: {totalPoints: {decrement: points}}
    });
    return createPrismaApiResult(true);
  } catch (error) {
    return createPrismaApiResult(false, undefined, handlePrismaError(error));
  }
};