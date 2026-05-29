// Application configuration
export const config = {
  app: {
    name: 'MovikFestivalen',
    version: '1.0.0',
    description: 'Official website for MovikFestivalen 2026'
  },
  
  api: {
    // Future API endpoints can be configured here
    baseUrl: import.meta.env.VITE_API_BASE_URL || ''
  },

  features: {
    countdown: true,
    ticketSales: false, // Can be enabled later
    lineup: false       // Can be enabled later
  }
} as const

export type Config = typeof config
