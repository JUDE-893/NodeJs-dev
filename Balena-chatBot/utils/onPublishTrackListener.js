import {Room } from 'livekit-client';

const serverUrl = process.env.LIVEKIT_URL;

/* -- WORK FLOW SO FAR
   initially no room is created, just after the server recieves a request from the client
   it generate an access token (Jwt) and return it to the client which recieve and try to
   authenticate with it to the room, but as the room did not exists yet ,livekit creates
   a new one and authenticate the user to it, now as i believe that we should listen on
   a room existance (or creation)
*/

/*
  function that initial a client to the room with the speacific access token, then listens
  on each track publishsed and filters it to get only the audios, after recieving an audio
  track we listen on each incomming frame of that speacific track
*/

export default async function onPublishTrackListener(at) {
  const room  = new Room();
  const client = await room.connect(serverUrl,at);

  room.on('connected', () => {
       console.log('Connected to the LiveKit room');
   });

   room.on('disconnected', () => {
       console.log('Disconnected from the room');
   });

  room.on('trackSubscribed', (track,publication,participant) => {
    console.log('track',track);
    //filter tracks for audio only publiacation
    if (track.kind === "audio") {
      console.log('participant',participant,'has published an audio');
    }
  })
}
