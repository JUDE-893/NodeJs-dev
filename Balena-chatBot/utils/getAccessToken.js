import {AccessToken} from 'livekit-server-sdk'

const apiKey = process.env.LIVEKIT_API_KEY;
const secretKey = process.env.LIVEKIT_SECRET_KEY;


/*
* function that returns a JWT token to provide it to the client in order to autheticate him to in asked room on the LiveKit server.
* the JWT contain the the user's identity, the room name, and permission, beside of the LIVEKIT_API_KEY
* the JWT hold a signature of the LIVEKIT_SECRET_KEY which is only encoded (!), plus the the encoding algorithm that helps to decode back the LIVEKIT_SECRET_KEY
* on the LiveKit server the apiKey is retrieved and with the secret key from the segnature (after decoding), then that secret key is compared with the one stored on the server, to ensure authenticity
*/

export default async function getAccessToken(roomName,participantName) {

  // initiat an access token object
  const token = await new AccessToken(apiKey,secretKey,{
    identity: participantName
  });

  // set permissions on the access token
  await token.addGrant({
    roomJoin: true,
    roomName: roomName,
    canPublish: true,
    canSubscribe: true
  })

  let jwt = await token.toJwt();
  return jwt;
}
