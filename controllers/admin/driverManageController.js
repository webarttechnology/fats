const User = require('../../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

exports.driverLists = async (req, res) => {
    const user = await User.find({ role: 'driver' }).lean();
    const successMessage = req.query.successMessage;
    const users = user.reverse();
    res.render('admin/driver/list', { users, successMessage });
};

exports.deleteDriver = async (req, res) => {
    const userId = req.params.userId;

    // Check if the user exists
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
    return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    await user.deleteOne();
    // res.send(req.flash('message'));
    res.redirect('../../driver/lists');
}

exports.addPage = async (req, res) => {
    res.render('admin/driver/add');
};

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads/driver'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Set up multer instance
const upload = multer({ storage: storage });
const uploadMiddleware = upload.single('image');


exports.saveDriver = async (req, res) => {
    try {
      uploadMiddleware(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          return res.status(400).json({ message: 'Image upload failed' });
        } else if (err) {
          // An unknown error occurred
          console.error(err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        const { name, username, email, phone, password, role } = req.body;
    
        // Retrieve the uploaded file information
        const image = req.file;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          const errorMessage = 'User already exists';
          return res.status(400).render('admin/driver/add', { errorMessage });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = "driver";
    
        // Create a new user
        let newUser;
        // const newUser = new User({ name, username, email, phone, password: hashedPassword, role: userRole, battery:10 });
        if (image) {
          // If image is found, save it along with other details
          newUser = new User({ name, username, email, phone, password: hashedPassword, role: userRole, battery:10, image: image.filename });
        } else {
            // If image is not found, save other details without the image
            newUser = new User({ name, username, email, phone, password: hashedPassword, role: userRole, battery:10 });
        }
        
        await newUser.save();
    
        const successMessage = 'Driver added successfully';
        return res.status(200).render('admin/driver/add', { successMessage });
        });
      } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
          // Handle validation errors with a more structured response
          const validationErrors = {};
          for (const field in error.errors) {
            validationErrors[field] = error.errors[field].message;
          }
          return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
        }
        res.status(500).json({ message: 'Internal server error' });
      }
}

exports.updatePage = async (req, res) => {
   const userId = req.params.userId;
   const user = await User.findOne({ _id: userId }).lean();

   // Check if the user is found
   if (!user) {
    // Handle the case where the user is not found
    return res.status(404).render('error', { message: 'User not found' });
   }

   res.render('admin/driver/update', { user });
};

// exports.updateAction = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     await User.findByIdAndUpdate(userId, req.body);
//     res.redirect('../../lists');
//   } catch (error) {
//     console.error(error);
//     res.status(500).render('error', { message: 'Internal server error' });
//   }
// }


exports.updateAction = async (req, res) => {
  try {
      const userId = req.params.userId;
      const userList = await User.find({ role: 'driver' }).lean();
      const users = userList.reverse();


      uploadMiddleware(req, res, async function (err) {
          if (err instanceof multer.MulterError) {
              // A Multer error occurred when uploading
              return res.status(400).json({ message: 'Image upload failed' });
          } else if (err) {
              // An unknown error occurred
              console.error(err);
              return res.status(500).json({ message: 'Internal server error' });
          }

          const { name, username, phone, email, battery, ...updateData } = req.body;
          const user = await User.findById(userId);

          if (req.file) {
              // Remove the old image file (if it exists)
              if (user.image) {
                  const imagePath = path.join(__dirname, '../../public/uploads/driver', user.image);
                  if (fs.existsSync(imagePath)) {
                      // Delete the file
                      fs.unlinkSync(imagePath);
                  } else {
                      console.warn('Old image file not found:', imagePath);
                  }
              }

              // Update the user with the new image filename
              updateData.image = req.file.filename;
          }

          await User.findByIdAndUpdate(userId, { name, username, phone, email, battery, ...updateData });

          const successMessage = 'Driver Updated Successfully';
          // res.render('admin/driver/list', { successMessage, users });

          res.redirect(`../../lists?successMessage=${encodeURIComponent(successMessage)}`);
      });
  } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Internal server error' });
  }
};


exports.changePassword = async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findOne({ _id: userId }).lean();

  if (!user) {
   return res.status(404).render('error', { message: 'User not found' });
  }

  res.render('admin/driver/change_password', { userId });
};

exports.updatePasswordAction = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { old_password, new_password, confirm_password } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    const driver = await User.find({ role: 'driver' }).lean();

    if (!user) {
      return res.status(404).render('error', { message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(old_password, user.password);
    if (!isPasswordValid) {
      const errorMessage = 'Old password is incorrect';
      return res.status(400).render('admin/driver/change_password', { errorMessage: errorMessage, userId: userId, });
    }

    if (new_password !== confirm_password) {
      const errorMessage = 'New password and confirm password do not match';
      return res.status(400).render('admin/driver/change_password', { errorMessage: errorMessage, userId: userId, });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    const successMessage = 'Password updated successfully';
    return res.status(200).render('admin/driver/list', { successMessage, user:driver });
    // return res.status(200).redirect('/admin/driver/list', { successMessage });
  } catch (error) {
    console.error(error);

    // Handle errors, e.g., render an error view
    res.status(500).render('error', { message: 'Internal server error' });
  }
};