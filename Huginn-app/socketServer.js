import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv'
import app from './socketApp.js';
import socketHandler from './socket/socket.js';
import { connectDB } from './db/mongoose.js';

// LOAD ENVIRONEMET VARIABLES
dotenv.config();

// CONNECT TO DB
connectDB();

// INITIATE SERVER
const server = http.createServer(app);

// INITIATE WEBSOCKET SERVER
export const io = new Server(server, {
  cors: {
   origin: "http://localhost:3000", // Match your React app's URL
   methods: ["GET", "POST"],
   credentials: true
 },
 allowEIO3: true
});

// SET WS EVENTS HANDLERS
socketHandler(io).then()

// START SERVER
server.listen(process.env.WS_PORT || 5001, () => {
  console.log(`Huginn steam app started on port..........${process.env.WS_PORT}`);
});

/*
cd Desktop\Dev\Next.Js-dev\huginn-app-project
npm run dev

cd Desktop/Dev/NodeJs-dev/Huginn-app
npm start

*/
