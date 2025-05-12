import express from 'express';
import helmet from 'helmet'
import hpp from 'hpp';
import cors from 'cors';
import AppError from './utils/AppError.js';
import globalErrorCatcher from './controllers/globalErrorCatcher.js';
//
const app = express();

// Routers
import authRouter from './routes/authRoutes.js'
import contactRouter from './routes/contactRoutes.js'
import conversationRouter from './routes/conversationRoutes.js'
import messageRouter from './routes/messageRoutes.js'

// seting up a security header parameter
app.use(helmet())

// setup cors policy
app.use(cors({
  origin: process.env.CLIENT_SCHEME ?? 'http://localhost:3000'
}))

// prevent parameter polution
// app.use(hpp({
//   whitelist: []
// }))

// json parser
app.use(express.json())


// Router middlewares
app.all(/^.*/, (req,res,next) => {
  console.log(process.env.CLIENT_SCHEME);
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

// unhandled routes
app.all(/.*/, (req,res, next) => {
  next(new AppError(`cannot find route ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorCatcher)

export default app
