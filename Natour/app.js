const express = require('express');
const fs = require('fs');
const AppErrorTrigger = require('./utils/AppErrorTrigger');
const globalErrorCatcher = require('./controllers/globalErrorCatcher');


// expressing our express
const app = express();
const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');

// reading templates
const form = fs.readFileSync('./dev-data/templates/form-template.html');

// setting the middleware that automatically parse & inject json ddata to the bosy of the request
// NOTE: that it essentiel for accessing request' body data or the body would be undefined
app.use(express.json())
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.url}`);
  next();
});
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

// Unhandled Route middleware
app.all('*', (req,res, next) => {
  next(new AppErrorTrigger(`cannot find route ${req.originalUrl} on this server!`, 404));
});

// Usage
// const endpoints = getAllEndpoints(app);

// GLOBAL ERROR ROUTE
app.use(globalErrorCatcher)


module.exports = app;
