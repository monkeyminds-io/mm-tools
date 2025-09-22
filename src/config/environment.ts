import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  
  // Base URL for different environments
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://tools.monkeyminds.io'
    : `http://localhost:${process.env.PORT || 3000}`,
    
  // Rate limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: process.env.NODE_ENV === 'production' ? 100 : 1000,
  },
  
  // Cache settings
  cache: {
    staticFiles: process.env.NODE_ENV === 'production' ? '1y' : '0',
    manifests: '1h',
  },
  
  // Build paths
  paths: {
    src: './src',
    dist: './dist',
    solutions: './src/solutions',
    public: './dist'
  }
} as const;

// Validation
if (!config.port || config.port < 1 || config.port > 65535) {
  throw new Error('Invalid PORT configuration');
}

console.log(`🔧 Config loaded: ${config.nodeEnv} environment`);

export type Config = typeof config;