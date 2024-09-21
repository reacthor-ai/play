import {redirect} from 'next/navigation'
import {prisma} from '@/utils/prisma/client'
import {NAVIGATION} from "@/utils/navigation/routes";
import {createClient} from "@/utils/supabase/server";

export async function guardOnboardingInternals() {
  const supabase = createClient()

  const {data: {user}} = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  return user
}

export async function guardDashboardInternals() {
  const user = await guardOnboardingInternals()

  const internalUser = await prisma.user.findUnique({
    where: {supabaseId: user.id}
  })

  if (!internalUser) {
    redirect(NAVIGATION.Onboarding)
  }

  return internalUser
}