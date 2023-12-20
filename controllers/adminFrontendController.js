const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 


/**
 * This Node.js script uses the crypto module to generate a random hexadecimal 
   string of a specified length.
*/ 

exports.renderLoginPage = (req, res) => {
    res.render('admin/login');
};

exports.adminDashboard = (req, res) => {
    res.render('admin/dashboard');
};

exports.userProfile = (req, res) => {
    res.render('admin/user/profile');
};

exports.adminLoginAction = async (req, res) => {
       try{
            const { email, password } = req.body;
            
            // Find the user by email
            const user = await Admin.findOne({ email });

            if (!user) {
                // Display error message on login page
                return res.render('./admin/login', { errorMessage: 'Invalid email or password' });
            }

            // Compare the entered password with the hashed password in the database
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                // Display error message on login page
                return res.render('./admin/login', { errorMessage: 'Invalid email or password' });
            }

            // Create a JWT token
            const secretKey = generateRandomString(64);
            const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

            // Store the token securely on the client side
            res.cookie('authToken', token);

            // Redirect to the dashboard upon successful login
            res.redirect('../dashboard');
       }
       catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
       }
};

/**
 * Logout
*/

exports.adminLogout = (req, res) => {

    // Clear the authentication token (e.g., remove the cookie)
    res.clearCookie("authToken");

    // Redirect to the login page or any other page after logout
    res.redirect('/admin/login');
};

/**
 * Generate a Random string
*/

const generateRandomString = (length) => {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex') // convert to hexadecimal format
      .slice(0, length); // return required number of characters
};  