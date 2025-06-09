import express from 'express';
import helmet from 'helmet'
import hpp from 'hpp';
import cors from 'cors';
import AppError from './utils/AppError.js';
import globalErrorCatcher from './controllers/globalErrorCatcher.js';
//
const app = express();

// ROUTERS
import authRouter from './routes/authRoutes.js'
import contactRouter from './routes/contactRoutes.js'
import conversationRouter from './routes/conversationRoutes.js'
import messageRouter from './routes/messageRoutes.js'

// SETING UP A SECURITY HEADER PARAMETER
app.use(helmet())

// SETUP CORS POLICY
app.use(cors({
  origin: process.env.CLIENT_SCHEME ?? 'http://localhost:3000'
}))

// PREVENT PARAMETER POLUTION
// app.use(hpp({
//   whitelist: []
// }))

// JSON PARSER
app.use(express.json())


// ROUTER MIDDLEWARES
app.all(/^.*/, (req,res,next) => {
  console.log(`[req] ${req.method} ${req.path}........`);
  next()
})
app.use('/huginn/api/contact', contactRouter)
app.use('/huginn/api/auth', authRouter)
app.use('/huginn/api/conversations', conversationRouter)
app.use('/huginn/api/conversations/:conv_id/messages', messageRouter)


app.get('/huginn/api', (req,res) => {
  res.end('Welcome to Huginn Chatting app Backend 🐦‍⬛')
})

// UNHANDLED ROUTES
app.all(/.*/, (req,res, next) => {
  next(new AppError(`cannot find route ${req.originalUrl} on this server!`, 404));
});

// ERRORS CATCHING MIDDLEWARE
app.use(globalErrorCatcher)

export default app
