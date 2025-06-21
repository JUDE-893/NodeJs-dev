import http from 'http';
import dotenv from 'dotenv'
import app from './index.js';
import { connectDB } from './db/mongoose.js';

// LOAD ENVIRONEMET VARIABLES
dotenv.config();

// CONNECT TO DB
connectDB();

// INITIATE SERVER
const server = http.createServer(app);

// START SERVER
server.listen(process.env.PORT || 5000, () => {
  console.log(`Huginn app started on port..........${process.env.PORT}`);
});
