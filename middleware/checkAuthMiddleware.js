module.exports = (req, res, next) => {
    // Check if the user is authenticated
    if (req.isAuthenticated()) {
      // User is authenticated, continue to the next middleware or route handler
      return next();
    }
  
    // User is not authenticated, redirect to the login page
    res.redirect('./admin/login');
};