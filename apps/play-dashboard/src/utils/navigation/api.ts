export const API_ROUTES = {
  user: {
    create: '/dashboard/api/create-user',
    get: '/dashboard/api/get-user',
    updatePoints: '/dashboard/api/update-points'
  },
  categories: {
    get: '/dashboard/api/get-categories'
  },
  game: {
    create: '/dashboard/api/create-game',
    get: '/dashboard/api/get-games',
    delete: '/dashboard/api/delete-game',
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