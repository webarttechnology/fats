const Vehicle = require('../../models/Vehicle');
const Task = require('../../models/Task');
const multer = require('multer');
const path = require('path');

exports.vehicleLists = async (req, res) => {
    const vehicle = await Vehicle.find().lean();
    const vehicles = vehicle.reverse();
    res.render('admin/vehicle/list', { vehicles });
};

exports.vehicleAddPage = async (req, res) => {
    res.render('admin/vehicle/add');
};

/**
 * Image Upload
*/

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../../public/uploads/'));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Set up multer instance
const upload = multer({ storage: storage });
const uploadMiddleware = upload.single('image');

exports.vehicleAddAction = async (req, res) => {
    try {

    // Use upload middleware to handle the image file
    uploadMiddleware(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          return res.status(400).json({ message: 'Image upload failed' });
        } else if (err) {
          // An unknown error occurred
          console.error(err);
          return res.status(500).json({ message: 'Internal server error' });
        }
  
        // Image upload successful, process other form data
        const { modelNo, type } = req.body;
  
        // Retrieve the uploaded file information
        const image = req.file;
  
        let newVehicle;
        if (image) {
          newVehicle = new Vehicle({ modelNo, type, image: image.filename });
        }else{
          newVehicle = new Vehicle({ modelNo, type });
        }

        // Create a new vehicle
        await newVehicle.save();
  
        const successMessage = 'Vehicle Added successfully';
        return res.status(200).render('admin/vehicle/add', { successMessage });
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

exports.vehicleUpdatePage = async (req, res) => {
  const vehicleId = req.params.vehicleId;
  const vehicle = await Vehicle.findOne({ _id: vehicleId }).lean();

  res.render('admin/vehicle/update', { vehicle });
};

exports.deleteVehicle = async (req, res) => {
  const vehicleId = req.params.vehicleId;
  let successMessage = "";
  let errorMessage = "";

  const existVehicle = await Task.findOne({ vehicleId:vehicleId }).lean();
  
  const vehicle = await Vehicle.findById(vehicleId);
  if(!existVehicle){
    await vehicle.deleteOne();
    successMessage = 'Vehicle Deleted successfully';
  }else{
    errorMessage = 'Vehicle is already in Use';
  }
  
  const allVehicle = await Vehicle.find().lean();
  const vehicles = allVehicle.reverse();

  res.render('admin/vehicle/list', { successMessage, errorMessage, vehicles });
}

/**
 * Problem to be solved
*/

exports.vehicleUpdateAction = async (req, res) => {
  try {
      const vehicleId = req.params.vehicleId;
      const { modelNo, type, image } = req.body;
      console.log(req.body);

      if (req.file) {
          upload.single('image')(req, res, async function (err) {
              if (err instanceof multer.MulterError) {
                  console.error(err);
                  return res.status(400).render('error', { message: 'Image upload failed' });
              } else if (err) {
                  console.error(err);
                  return res.status(500).render('error', { message: 'Internal server error' });
              }

              await Vehicle.findByIdAndUpdate(vehicleId, { modelNo, type, image: req.file.filename });
              res.redirect('../../lists');
          });
      } else {
          await Vehicle.findByIdAndUpdate(vehicleId, { modelNo, type });
          res.redirect('../../lists');
      }
  } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Internal server error' });
  }
};