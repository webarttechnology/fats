// middleware/baseUrl.js

function baseUrlMiddleware(req, res, next) {
    // Define your base URL here
    const baseUrl = 'http://127.0.0.1:3000/';
  
    // Add baseUrl to res.locals for access in Handlebars templates
    res.locals.baseUrl = baseUrl;
  
    // Continue to the next middleware
    next();
  }
  
  module.exports = baseUrlMiddleware;
  