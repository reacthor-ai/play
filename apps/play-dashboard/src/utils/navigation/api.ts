export const API_ROUTES = {
  user: {
    create: '/dashboard/api/create-user',
    get: '/dashboard/api/get-user',
  },
  categories: {
    get: '/dashboard/api/get-categories'
  },
  game: {
    create: '/dashboard/api/create-game',
    get: '/dashboard/api/get-games'
  },
  gameParticipant: {
    create: '/dashboard/api/create-participants',
    get: '/dashboard/api/get-participants'
  },
  agents: {
    evaluation: '/dashboard/api/evaluation-agent',
    play: '/dashboard/api/agents'
  }
} as const