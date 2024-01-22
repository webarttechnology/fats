const vehicle = require('../../models/Vehicle');

/**
 * All Vehicles 
*/

exports.existingVehicles = async (req, res) => {
    try {
        const vehicles = await vehicle.find(); 

        const vehiclesWithImagePath = vehicles.map(vehicle => ({
            _id: vehicle._id,
            modelNo: vehicle.modelNo,
            type: vehicle.type,
            imagePath: `/uploads/${vehicle.image}`
        }));

        res.status(200).json(vehiclesWithImagePath);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
};


exports.vehicleByType = async (req, res) => {
    try {
        const vehicleType = req.params.type;
        const vehicles = await vehicle.find({ type: vehicleType }); 

        const vehiclesWithImagePath = vehicles.map(vehicle => ({
            _id: vehicle._id,
            modelNo: vehicle.modelNo,
            type: vehicle.type,
            imagePath: `/uploads/${vehicle.image}`
        }));

        res.status(200).json(vehiclesWithImagePath);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
};

