module.exports = (req, res, next) => {
  let authToken = "";

  const cookieIndex = req.rawHeaders.findIndex(header => header === 'Cookie');
  // Check if 'Cookie' header is present
  if (cookieIndex !== -1 && req.rawHeaders.length > cookieIndex + 1) {
    // Get the value of 'Cookie' header
    const cookies = req.rawHeaders[cookieIndex + 1];

    // Parse the cookies into an object
    const parsedCookies = cookies.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {});

    // Get the value of 'authToken' cookie
    authToken = parsedCookies.authToken;

  }else{
    authToken = "";
  }

     // Set authToken directly in res
  res.authToken = authToken;

  if(authToken == ""){
    // res.redirect('admin/login');
    res.render('admin/login');
  }else{
    return next();
  }
};