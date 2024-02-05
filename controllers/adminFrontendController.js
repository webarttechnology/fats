const Admin = require('../models/Admin');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 


exports.renderLoginPage = (req, res) => {
    res.render('admin/login');
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

            // Render the dashboard and pass the list of users
            res.render('admin/dashboard');
       }
       catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
       }
};

exports.adminDashboard = async (req, res) => {
  res.render('admin/dashboard');
};

exports.userProfile = async (req, res) => {
  // console.log(req);
  const admin = await Admin.findOne().lean();
  res.render('admin/user/profile', { admin });
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

exports.adminEditProfileAction = async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        const admin = await Admin.findOne().lean();
    
        const updatedAdmin = await Admin.findOneAndUpdate(
            { name, phone, email }
          );
    
        if (!updatedAdmin) {
          return res.status(404).render('error', { message: 'Admin not found' });
        }
    
        return res.render('admin/user/profile', { successMessage: 'Profile updated successfully', admin:admin });
      } catch (error) {
        console.error(error);
    
        // Handle errors, e.g., render an error view
        return res.status(500).render('error', { message: 'Internal server error' });
      }
}

exports.adminChangePasswordAction = async (req, res) => {
  try{
        const { password, new_password, renew_password } = req.body;
        const user = await Admin.findOne().lean();

        if (new_password !== renew_password) {
          return res.render('admin/user/profile', { errorMessage: 'New passwords do not match', admin:user });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.render('admin/user/profile', { errorMessage: 'Current password is incorrect', admin:user });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        user.password = hashedPassword;
        await user.findOneAndUpdate({ password:hashedPassword });

        return res.render('admin/user/profile', { successMessage: 'Password updated successfully', admin:user });
  }catch (error) {
        console.error(error);
        return res.status(500).render('error', { message: 'Internal server error' });
      }
}