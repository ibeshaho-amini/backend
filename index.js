// const mongoose = require("mongoose");
// const routes1 = require("./userRoutes");
// const routes2 = require("./blogRoutes");
// const passport = require('passport');
// const express = require('express');
// const app = express();

// app.use(express.json());
// app.use(passport.initialize());
// app.use('/api', routes1);
// app.use('/api', routes2);

// if (process.env.NODE_ENV !== 'test') {
//     mongoose.connect("mongodb://localhost:27017/blog")
//         .then(() => {
//             app.listen(5000, () => {
//                 console.log("Server has started!");
//             });
//         });
// }

// module.exports = app;  // Export the app for testing



const mongoose = require("mongoose");
const routes1 = require("./userRoutes");
const routes2 = require("./blogRoutes");
const passport = require('passport');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog API',
      version: '1.0.0',
      description: 'API for Blog and User operations',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
      },
    ],
  },
  apis: ['./userRoutes.js', './blogRoutes.js'], // Paths to the route files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api', routes1);
app.use('/api', routes2);

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect to MongoDB and start the server
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect("mongodb://localhost:27017/blog", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        app.listen(5000, () => {
            console.log("Server has started on port 5000!");
            console.log('Swagger docs are available on http://localhost:5000/api-docs');
        });
    })
    .catch(err => console.error('Could not connect to MongoDB...', err));
}

module.exports = app;  // Export the app for testing
