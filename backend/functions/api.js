const serverless = require('serverless-http');
const app = require('../server');

// Wrap the express app for netlify serverless functions
module.exports.handler = serverless(app);
