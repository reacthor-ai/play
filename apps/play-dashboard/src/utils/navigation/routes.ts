export const NAVIGATION = {
  Home: '/',
  Dashboard: {
    Games: '/dashboard/games',
    Results: '/dashboard/results',
    Settings: '/dashboard/settings',
  },
  Play: (gameId: string) => `/dashboard/games/play/${gameId}`,
  Onboarding: '/onboarding',
  Evaluation: (gameId: string) => `/dashboard/games/evaluation/${gameId}`
} as const