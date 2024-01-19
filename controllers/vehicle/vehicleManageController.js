const Vehicle = require('../../models/Vehicle');

exports.vehicleLists = async (req, res) => {
    const vehicle = await Vehicle.find({ role: 'fire_fighter' }).lean();
    const vehicles = vehicle.reverse();
    res.render('admin/vehicle/list', { vehicles });
};