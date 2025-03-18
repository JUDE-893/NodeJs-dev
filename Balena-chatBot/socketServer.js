import {Server} from 'socket.io';
import dotenv from 'dotenv';
import { toRawWavFormat } from './services/decodeToRawAudio.js';
import transcribeAudio from './services/transcribeAudio.js';

// bootrap the env variables
dotenv.config();

// initiate a websocket server on port 5004
const io = new Server(process.env.WEBSOCKET_PORT);

// listen
io.on("connection", (socket) => {
  console.log('Someones connected, Hmm..');

  // on ffmpeg error handling
  toRawWavFormat().stderr.on('data', (err) => {console.log('FFMPEG error : ', err)});

  // pipe the stremed (recieved) audio chunks in to the decoding service
  io.on('message', (chunk) => {
    toRawWavFormat().stdin.write(chunk);
  });

  // pipe the decoded audio into the transcription service
  toRawWavFormat().pipe(transcribeAudio().stdin);

  // retrieve the output text | TO BE CONTINUED..
  transcribeAudio().stdout.on('data', (text) => {
    console.log('[OUTPUT]', text);
  });

  // on transcribe audio error
  transcribeAudio().stderr.on('data', (err) => {
    console.log('[OUTPUT ERROR]', err);
  });

  // closed connection - stop listening
  io.on('close', () => {
        console.log('WebSocket closed');
        toRawWavFormat().stdin.end();
    });
})






// WORKFLOW SO FAR..
// 1 - redirect the audio to ws endpoint "egressClient.startTrackEgress(roomName, 'ws://127.0.0.1:5004' .."
// 2 - ffmpeg listen on the ws endpoint "ffmpeg('ws://127.0.0.1:5004')"
// 3 - decode then pip to whisper service "ffmpegStream.pipe(whisperProcess.stdin);"
// 4 - transcribe then stream the output text in real Time


// "start": "concurrently \"--env-file=.env node server.js\" \"node socketServer.js\"",
