import express from 'express';
import helmet from 'helmet'
import hpp from 'hpp';
import AppError from './utils/AppError.js'
import globalErrorCatcher from './controllers/globalErrorCatcher.js'
//
const app = express();

// Routers
import authRouter from './routes/authRoutes.js'

// seting up a security hzader parameter
app.use(helmet())

// prevent parameter polution
// app.use(hpp({
//   whitelist: []
// }))

// json parser
app.use(express.json())


// Router middlewares
app.use('/huginn/api/auth', authRouter)

app.get('/huginn/api', (req,res) => {
  res.end('Welcome to Huginn Chatting app Backend 🐦‍⬛')
})

// unhandled routes
app.all(/.*/, (req,res, next) => {
  next(new AppError(`cannot find route ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorCatcher)

export default app
