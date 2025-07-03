import { authenticate } from './auth.js';
import { redisSet } from '../utils/cache.js';
import { createRedisClient } from '../db/redis.js';
import { newMessage, deleteMessage } from './controllers/messagesController.js'
import { newCall, respondCall } from './controllers/callsController.js'

export default async function socketHandler(io) {

  // AUTHORIZE THE USER - CHECK VALID JWT
  io.use(authenticate);

  // CONNECTIONS DATA
  const redis = await createRedisClient();
  const activeUsers = await redisSet(redis, 'users:active');

  // LISTEN FOR UPCONMMING CONNECTIONS
  io.on('connection', async (socket) => {
    const user =  socket?.user;

    console.log('[CONNECTION] ', user?._id);

    // CREATE AND JOIN A USER ROOM
    socket.join(user?._id?.toString())

    // SET USER SATATUS TO ONLINE (TO BE CONTINUED...+ TYPING ...)
    user.status = 'active';
    await user.save({validateBeforeSave: false});
    activeUsers.add(user._id.toString());

    // NEW MESSAGE EVENTS
    socket.on('new-message', newMessage(socket, redis, user, activeUsers))

    // DELETE MESSAGE EVENTS
    socket.on('delete-message', deleteMessage(socket, redis, user, activeUsers))

    // NEW CALL EVENTS
    socket.on('start-call', newCall(socket, redis, user, activeUsers))

    // RESPOND CALL EVENTS
    socket.on('respond-call', respondCall(socket, redis, user, activeUsers))

    // ON ERROR EVENT
    socket.on("error", (err) => {
      console.log("Socket error:", err);
      console.error("Socket error:", err);
      // Optionally notify the client or attempt recovery
    });

    // ON DECONNECTION
    socket.on('disconnect', async () => {
      user.status = 'offline';
      await user.save({validateBeforeSave: false});
      activeUsers.remove(user._id.toString());

    })
  })




}
