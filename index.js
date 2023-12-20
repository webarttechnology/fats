const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const mongoose = require('mongoose');
const exphbs = require('express-handlebars'); // express handlebars
const baseUrlMiddleware = require('./middleware/baseUrl'); // to declare baseUrl for assets
// const checkAuthMiddleware = require('./middleware/checkAuthMiddleware');

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
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/commons/',
    partialsDir: __dirname + '/views/commons/'
}).engine);

app.set('view engine', 'hbs');

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Apply the checkAuthMiddleware to the routes you want to protect
// app.use(checkAuthMiddleware);

// Define routes
const userApiRoutes = require('./routes/api/userRoutes');
const adminApiRoutes = require('./routes/api/adminApiRoutes');
const adminDisplayRoutes = require('./routes/admin/adminRoutes');

app.use('/', userApiRoutes);
app.use('/admin/api', adminApiRoutes);
app.use('/admin', adminDisplayRoutes);

// Serve static files from the "assets" folder
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(baseUrlMiddleware);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});