/**
 * Application configuration
 * Uses environment variables with fallback defaults for development
 */

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  tasks: `${config.apiUrl}/api/tasks`,
  health: `${config.apiUrl}/health`,
} as const
