import { veryfyAuthToken } from '../controllers/authController.js';
import { wsErrorCatchingLayer } from '../utils/helpers.js';


export const authenticate = wsErrorCatchingLayer(async (socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("[JWT SOCKET TOKEN]",token);
  const user = await veryfyAuthToken(token);
  socket.user = user;
  next()
})
