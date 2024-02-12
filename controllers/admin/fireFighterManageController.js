const User = require('../../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

exports.fireFighterLists = async (req, res) => {
    const user = await User.find({ role: 'fire_fighter' }).lean();
    const successMessage = req.query.successMessage;
    const users = user.reverse();
    res.render('admin/fire_fighter/list', { users, successMessage });
};

exports.fireFighterAddPage = async (req, res) => {
    res.render('admin/fire_fighter/add');
};


// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads/fire_fighter'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Set up multer instance
const upload = multer({ storage: storage });
const uploadMiddleware = upload.single('image');

exports.fireFighterAddAction = async (req, res) => {
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
    
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          const errorMessage = 'Fire Fighter already exists';
          return res.status(400).render('admin/fire_fighter/add', { errorMessage });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = "fire_fighter";

        // Retrieve the uploaded file information
        const image = req.file;
    
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

        // const newUser = new User({ name, username, email, phone, password: hashedPassword, role: userRole, battery: 10, image: image.filename });
        await newUser.save();
    
        const successMessage = 'Fire Fighter added successfully';
        return res.status(200).render('admin/fire_fighter/add', { successMessage });
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

exports.fireFighterUpdatePage = async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findOne({ _id: userId }).lean();
 
    if (!user) {
     return res.status(404).render('error', { message: 'Fire Fighter not found' });
    }
 
    res.render('admin/fire_fighter/update', { user });
};

// exports.fireFighterUpdateAction = async (req, res) => {
//     try {
//       const userId = req.params.userId;
//       const user = await User.find({ role: 'fire_fighter' }).lean();
//       const users = user.reverse();

//       await User.findByIdAndUpdate(userId, req.body);
//       const successMessage = 'Fire Fighter updated successfully';
//       res.render('admin/fire_fighter/list', { successMessage, users });
//     } catch (error) {
//       console.error(error);
//       res.status(500).render('error', { message: 'Internal server error' });
//     }
// }


exports.fireFighterUpdateAction = async (req, res) => {
  try {
      const userId = req.params.userId;
      const userList = await User.find({ role: 'fire_fighter' }).lean();
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
                  const imagePath = path.join(__dirname, '../../public/uploads/fire_fighter', user.image);
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

          const successMessage = 'Fire Fighter Updated Successfully';
          // res.render('admin/driver/list', { successMessage, users });

          res.redirect(`../../lists?successMessage=${encodeURIComponent(successMessage)}`);
      });
  } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Internal server error' });
  }
};

exports.deleteFireFighter = async (req, res) => {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    
    const allUser = await User.find({ role: 'fire_fighter' }).lean();
    const users = allUser.reverse();

    if (!user) {
        return res.status(404).json({ message: 'Fire Fighter not found' });
    }

    await user.deleteOne();
    const successMessage = 'Fire Fighter Deleted successfully';
    res.render('admin/fire_fighter/list', { successMessage, users });
}