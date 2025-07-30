import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import AppError from './utils/AppError.js'
import globalErrorCatcher from './controllers/globalErrorCatcher.js'
import urlRouter from './routes/urlRetrieval_routes.js'

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});

// app routes
app.use('/MLC/api/location', urlRouter)

// UNHANDLED ROUTES
app.all(/.*/, (req,res, next) => {
  next(new AppError(`cannot find route ${req.originalUrl} on this server!`, 404));
});

// ERRORS CATCHING MIDDLEWARE
app.use(globalErrorCatcher)

export default app;
