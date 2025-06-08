const express = require('express');
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const {doubleCsrf} = require('csrf-csrf');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const hpp = require('hpp');
const fs = require('fs');
const globalErrorCatcher = require('./controllers/globalErrorCatcher');
const AppErrorTrigger = require('./utils/AppErrorTrigger');

// expressing our express
const app = express();


const tasksRouter = require('./routes/taskRoutes');
const usersRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
// const reviewRouter = require('./routes/reviewRoutes');

//setting up a security headers
app.use(helmet())

// configure & set the rate limitting middelware.
// Uses in-memory storage to track the number of requests made by each IP address. Each incoming request is associated with a unique key—usually the client's IP address—and this key is stored in memory along with the request count and timestamp.
// <max> : number on reqs <windowMs> : time interval in ms
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this ip address. Please try again"
})
app.use('/api',limiter);

// setting the cookie parser middleware , parse the recieved cookie from the headers and injecte it into the req object
app.use(cookieParser());

// setting cors middleware to allow request from client
app.use(cors({
  origin: 'http://localhost:3000', // Explicit origin
  credentials: true, // 👈 Required for withCredentials
}));

// configure & set the csrf middleware
const {doubleCsrfProtection} = doubleCsrf({
  getSecret: () => process.env.CSRF_TOKEN_SECRET,
  cookieName: '_csrf',
  cookieOptions: {
    httpOnly: process.env.CSRF_HTTPONLY === 'true',
    sameSite: process.env.CSRF_SAMESITE,
    secure: process.env.NODE_ENV === 'production',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS']
});
// app.use(doubleCsrfProtection);

// reading templates
const form = fs.readFileSync('./dev-data/templates/form-template.html');

// setting the middleware that automatically parse & inject json ddata to the bosy of the request
// NOTE: that it essentiel for accessing request' body data or the body would be undefined
app.use(express.json({limit:'100kb'}));

// setting up a NoSql middleware
// skip all speacial mongo character
app.use(mongoSanitize());

// setting up a anti-xss middleware
// skip html speacial character
app.use(xss())

// prevent parameter polution
app.use(hpp({
  whitelist: ['duration', 'price','ratingsAvg','difficulty','maxGroupSize']
}));

// test routes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.get('/csrf-token', (req, res) => {
  console.log(req.csrfToken());
  // res.cookie('_csrf',req.csrfToken(), {
  //   exipres: new Date(Date.now()+process.env.REQUEST_TIMEOUT*1000),
  //   httpOnly: process.env.CSRF_HTTPONLY === 'true',
  //   sameSite: process.env.CSRF_SAMESITE,
  //   secure: process.env.NODE_ENV === 'production'
  // })
  res.json({ csrfToken: req.csrfToken() });
});

// setting the middleware that connect the router with the corresponding domain
// the the request are applyed only on the router instance with the corresponding url prefix
app.use('/api/users', usersRouter);
app.use('/api/tasks',tasksRouter);
app.use('/api/auth', authRouter);
// app.use('/api/reviews', reviewRouter);

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
