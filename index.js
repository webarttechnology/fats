const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const mongoose = require('mongoose');
const exphbs = require('express-handlebars'); // express handlebars
const baseUrlMiddleware = require('./middleware/baseUrl'); // to declare baseUrl for assets
// const checkAuthMiddleware = require('./middleware/checkAuthMiddleware');
const handlebarsHelpers = require('./helpers/handlebars-helpers');
// const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// for partials
const hbs = require("hbs");

app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost/user_registration_db', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// builtin middleware
app.engine('hbs', exphbs.create({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/commons/',
    partialsDir: __dirname + '/views/commons/',
    // helpers: handlebarsHelpers,
    helpers: {
        ...handlebarsHelpers, // Spread your custom helpers
        addOne: function(index) {
            return index + 1;
        },
        eq: function (a, b) {
            return a === b;
        },
        generateSequence: function (count, options) {
            let result = '';
            for (let i = 0; i < (count - 1); i++) {
              result += options.fn(i + 1);
            }
            return result;
          },
          isUserAssigned: function (userId, assignedUsers) {
            if (!Array.isArray(assignedUsers)) {
                return false; // or handle it accordingly
            }

            const isUserAssigned = assignedUsers.some((user) => user.userId.toString() === userId.toString());
            return isUserAssigned;
        },

    }
}).engine);

app.set('view engine', 'hbs');

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));

// Apply the checkAuthMiddleware to the routes you want to protect
// app.use(checkAuthMiddleware);


// Define routes
const userApiRoutes = require('./routes/api/userRoutes');
const frontendRoutes = require('./routes/frontend/frontRoutes');
const adminApiRoutes = require('./routes/api/adminApiRoutes');
const adminDisplayRoutes = require('./routes/admin/adminRoutes');

app.use('/api/', userApiRoutes);
app.use('/', frontendRoutes);
app.use('/admin/api', adminApiRoutes);
app.use('/admin', adminDisplayRoutes);

// Serve static files from the "assets" folder
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(baseUrlMiddleware);
// app.use(checkAuthMiddleware);

// Use cookie-parser middleware
// app.use(cookieParser());

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});