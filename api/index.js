// Vercel API handler that imports our Express app
const path = require('path');

let app;

try {
  // Import the compiled Express app
  const serverModule = require('../dist/index.js');
  app = serverModule.default || serverModule;
  
  if (!app) {
    throw new Error('No Express app found in export');
  }
  
  console.log('✅ Successfully loaded Express app');
} catch (error) {
  console.error('❌ Failed to import Express app:', error);
  
  // Fallback error handler
  app = (req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  };
}

// Export the Express app as a Vercel function
module.exports = app;