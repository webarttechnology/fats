const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const mongoose = require('mongoose');
const exphbs = require('express-handlebars'); // express handlebars

const app = express();
const PORT = process.env.PORT || 3000;

// for partials
const hbs = require("hbs");

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/user_registration_db', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// builtin middleware
app.engine('hbs', exphbs.create({
    extname: 'hbs',
    defaultLayout: 'dashboard',
    layoutsDir: __dirname + '/views/admin/',
    partialsDir: __dirname + '/views/commons/'
}).engine);

app.set('view engine', 'hbs');

// Define routes
const userApiRoutes = require('./routes/api/userRoutes');
const adminDisplayRoutes = require('./routes/admin/adminRoutes');

app.use('/', userApiRoutes);
app.use('/admin', adminDisplayRoutes);

// Serve static files from the "assets" folder
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});