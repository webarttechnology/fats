const Admin = require('../../models/Admin');
const bcrypt = require('bcrypt');

exports.addAdmin = async (req, res) => {
    try {
        const { email, password, name, phone, profileImage, status } = req.body;
  
        // Hash the password
        const hashedPassword = await bcrypt.hash('12345678', 10);

      // Create a new admin
        const newAdmin = await Admin.create({
            email: 'admin@admin.com',
            password: hashedPassword,
            name: 'Admin',
            phone: '1234567890',
            profileImage: null,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Respond with the created admin data
        return res.status(201).json({ message: 'User registered successfully', 'details':newAdmin  });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
};