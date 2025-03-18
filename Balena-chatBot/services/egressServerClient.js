import { EgressClient, RoomServiceClient } from 'livekit-server-sdk'
import getAccessToken from './getAccessToken.js'

// 1 - create an egressClient
const egressClient = new EgressClient(process.env.LIVEKIT_URL, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_SECRET_KEY );

const roomService = new RoomServiceClient(process.env.LIVEKIT_URL, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_SECRET_KEY );

// 2 - authHeader | genrate an authorisation headers that is then used to authenticate in the livekit server with the necessary authoriasation.

export default async function egressServerClient(roomName, trackID) {
  console.log("-------------rrooom",roomName);

  // Define room options
       const roomOptions = {
           name: roomName,   // Required room name
           maxParticipants: 10,  // Limit room to 10 participants
           emptyTimeout: 600,    // Auto-delete room after 10 min if empty
           metadata: JSON.stringify({ roomType: "meeting" }) // Store custom data
       };

       // Create the room
       const room = await roomService.createRoom(roomOptions);
  // const jwt = await getAccessToken(roomName, 'EgressClient001');
  // console.log("////JWT////",jwt);
  // await egressClient.authHeader({videoGrant: jwt});

  const rooms = await roomService.listRooms();
  console.log("room",rooms);


  // staart a track egress | Export individual tracks
    const trackEgress = await egressClient.startTrackEgress(
      roomName,  // The name of the room from which the track is being egressed
      process.env.WEBSOCKET_ENDPOINT,  // The destination for the stream (RTMP URL, WebRTC, or file output)
      trackID  // The ID of the track (audio or video) to be streamed
  );

  return trackEgress
}
