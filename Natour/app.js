const express = require('express');
const fs = require('fs');

// expressing our express
const app = express();
const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');

// reading templates
const form = fs.readFileSync('./dev-data/templates/form-template.html');

// setting the middleware that automatically parse & inject json ddata to the bosy of the request
// NOTE: that it essentiel for accessing request' body data or the body would be undefined
app.use(express.json())

// setting the middleware that connect the router with the corresponding domain
// the the request are applyed only on the router instance with the corresponding url prefix
app.use('/api/users', usersRouter);
app.use('/api/tours',toursRouter);

//routes' callback functions
const root = (req,res) => {
  res.status(200).end(form);
}

// Api Routes
app.route('/').get(root);

const getAllEndpoints = (app) => {
  const endpoints = [];

  app._router.stack.forEach((middleware) => {
    if (middleware.route) { // Routes by itself
      endpoints.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: middleware.route.path,
      });
    } else if (middleware.name === 'router') { // Middleware (like app.use())
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          endpoints.push({
            method: Object.keys(handler.route.methods)[0].toUpperCase(),
            path: handler.route.path,
          });
        }
      });
    }
  });

  return endpoints;
};

// Usage
const endpoints = getAllEndpoints(app);

module.exports = app;
