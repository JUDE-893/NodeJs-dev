import bloomFilter from 'bloom-filters';
const { ScalableBloomFilter } =  bloomFilter;
import { io } from '../server.js';
import { authenticate } from './auth.js';
import { protectConversation, distributeEvent } from './middlewares.js';
import { wsErrorCatchingLayer, decrypt } from '../utils/helpers.js';
import { redisSet } from '../utils/cache.js';
import { createRedisClient } from '../db/redis.js';
import { createMessage } from '../controllers/messageController.js'

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
    socket.on('new-message', wsErrorCatchingLayer(async (data, callback) => {

      /* #INTEGRITY VALIDATION */

       // 1) check if authorization from cached
       let authorized = await redis.get(`${user._id.toString()}-${data.conv_id}`) // => conversation doc
       authorized = Boolean(authorized) ? JSON.parse(authorized) : null

       // 2) check authorization from db + cache permission
       if (authorized === null) {
         authorized = await protectConversation(socket, data);
         await redis.set(`${user._id.toString()}-${data.conv_id}`,
              JSON.stringify(authorized),
              {EX: +(process.env.REDIS_CONVERSATION_AUTHORIZATION_EXPIRY)}
            );
       }

       // 3) is authorized ? proceeds
        if (Boolean(authorized)) {
          console.log('[user]', user);
          const message = await createMessage(user._id, decrypt(data.conv_id, process.env.CONVERSATION_SECRET), data);
          await distributeEvent(socket, authorized, activeUsers, 'new-message', JSON.stringify({...message._doc, vol_id: data.vol_id,conv_id: data.conv_id, sender: {...user._doc, nameTag: user.nameTag, password: undefined, passwordUpdatedAt: undefined}}))
        }

    }))

    // ON DECONNECTION
    socket.on('disconnect', async () => {
      user.status = 'offline';
      await user.save({validateBeforeSave: false});
      activeUsers.remove(user._id.toString());

    })
  })




}
