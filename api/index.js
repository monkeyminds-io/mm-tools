// api/index.js - Vercel Serverless Function
module.exports = (req, res) => {
  // Import the Express app
  const app = require('../dist/index.js').default;
  
  // Execute the Express app
  return app(req, res);
};