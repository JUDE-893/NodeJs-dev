import express from 'express';
import cors from 'cors';
// import AppError from './utils/AppError.js';
import globalErrorCatcher from './controllers/globalErrorCatcher.js';
//
const app = express();

// SETUP CORS POLICY
app.use(cors({
  origin: process.env.CLIENT_SCHEME ?? 'http://localhost:3000'
}))

// JSON PARSER
app.use(express.json())


// ROUTER MIDDLEWARES
app.all(/^.*/, (req,res,next) => {
  console.log(`[WS] ${req.method} ${req.path}........`);
  next()
})


app.get('/huginn/stream', (req,res) => {
  res.end('Welcome to Huginn Chatting app Realtime Endpoint 🐦‍⬛')
})

// UNHANDLED ROUTES
// app.all(/.*/, (req,res, next) => {
//   next(new AppError(`cannot find route ${req.originalUrl} on this server!`, 404));
// });

// ERRORS CATCHING MIDDLEWARE
app.use(globalErrorCatcher)

export default app
