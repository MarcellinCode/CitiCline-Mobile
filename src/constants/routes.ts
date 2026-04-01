export const ROUTES = {
  // Routes statiques principales
  WALLET: '/wallet' as const,
  ABONNEMENTS: '/abonnements' as const,
  MES_DECHETS: '/mes-dechets' as const,
  MAP: '/map' as const,
  MISSIONS: '/missions' as const,
  NOTIFICATIONS: '/notifications' as const,
  MARKETPLACE: '/marketplace' as const,
  FLEET: '/fleet' as const,

  // Groupe Espace
  ESPACE: '/espace' as const,
  ESPACE_OFFRES: '/espace/offres' as const,
  ESPACE_AGENTS: '/espace/agents' as const,
  ESPACE_ANALYTICS: '/espace/analytics' as const,
  ESPACE_RESERVATIONS: '/espace/reservations' as const,
  ESPACE_IMPACT_RSE: '/espace/impact-rse' as const,
  ESPACE_FLOTTE: '/espace/flotte' as const,

  // Groupe Paramètres et Auth
  SETTINGS: '/settings' as const,
  SETTINGS_SECURITY: '/settings/security' as const,
  SETTINGS_PRIVACY: '/settings/privacy' as const,
  SETTINGS_HELP: '/settings/help' as const,
  SETTINGS_TERMS: '/settings/terms' as const,
  LOGIN: '/(auth)/login' as const,
  SIGNUP: '/(auth)/signup' as const,

  // Routes dynamiques
  CHAT_DETAILS: (id: string) => `/chat/${id}` as const,
  MISSION_DETAILS: (id: string) => `/missions/${id}` as const,
  MARKETPLACE_DETAILS: (id: string) => `/marketplace/${id}` as const,
};

export type AppRoute = typeof ROUTES[keyof typeof ROUTES] | string;
