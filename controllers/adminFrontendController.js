exports.renderLoginPage = (req, res) => {
    console.log(122222);
    res.render('admin/login'); // Assuming your Handlebars file is named 'login.handlebars'
};

exports.adminDashboard = (req, res) => {
    console.log(1);
    res.render('admin/dashboard'); // Assuming your Handlebars file is named 'login.handlebars'
};