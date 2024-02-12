const Incident = require('../../models/Incident');
const AssignHome = require('../../models/AssignToHome');

exports.incidentLists = async (req, res) => {
    const incident = await Incident.find().lean();
    const incidents = incident.reverse();
    res.render('admin/incident/list', { incidents });
};

exports.incidentAddPage = async (req, res) => {
    res.render('admin/incident/add');
};

exports.saveIncident = async (req, res) => {
    try {

        const { title, description, street_address, building, landmark, zip  } = req.body;

        // Create a new Incident
        const newIncident = new Incident({ title, description, street_address, building, landmark, zip });
        await newIncident.save();
        const incidentDetail = await Incident.findById(newIncident._id).lean();
    
        const successMessage = 'Incident added successfully';
        // return res.status(200).render('admin/incident/add', { successMessage, incidentDetail });

        const redirectUrl = `/admin/incident/tasks?incidentDetail=${JSON.stringify(incidentDetail._id)}`;

        // Return a script that opens the result page in a new tab
        res.send(`
            <script>
                window.open('/admin/incident/save').close();
                window.open('/admin/incident/add/page');
                window.open('${redirectUrl}', '_blank');
            </script>
        `);

        // return res.status(200).render('admin/incident/add', { successMessage, incidentDetail });
        // res.redirect(`/admin/incident/tasks?incidentDetail=${JSON.stringify(incidentDetail)}`);

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
  const incidentId = req.params.incidentId;
  const incident = await Incident.findOne({ _id: incidentId }).lean();

  res.render('admin/incident/update', { incident });
};

exports.incidentUpdateAction = async (req, res) => {
    try {
      const incidentId = req.params.incidentId;
      const incident = await Incident.find().lean();
      const incidents = incident.reverse();

      await Incident.findByIdAndUpdate(incidentId, req.body);
      const successMessage = 'Incident updated successfully';
      res.render('admin/incident/list', { successMessage, incidents });
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Internal server error' });
    }
}

exports.deleteIncident = async (req, res) => {
  const incidentId = req.params.incidentId;
  
  const assignHome = await AssignHome.find({ incidentId }).lean();
  
  if(assignHome.length > 0){
    await AssignHome.deleteMany({ incidentId });
  }

   await Incident.findByIdAndDelete(incidentId);
  const incident = await Incident.find().lean();
  const incidents = incident.reverse();

  const successMessage = 'Incident Deleted successfully';
  res.render('admin/incident/list', { successMessage, incidents });
};