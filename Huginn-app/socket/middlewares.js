import { verifyConversation } from '../controllers/conversationController.js'
import { createMessage } from '../controllers/messageController.js'
import { wsErrorCatchingLayer } from '../utils/helpers.js';
import { AccessToken } from 'livekit-server-sdk';


export const protectConversation = async (socket, data) => {

  // if user belongs, conversation exists..
  const conversation = await verifyConversation(socket?.user, data.conv_id);

  const user = socket.user;

  // if blocked
  if (conversation?.blackList.some((id) => id.toString() === user._id.toString())) {
    throw new AppError('Inactive conversation. Relationship blocked', 403);
  }
  // authorized acceess;
  return conversation
}

// function that check if-authorized user to a conversation from the cache or the DB
//  returns conversation Doc if authorized, otherway null
export const isAuthorized = async (socket, redis, user, data) => {

   // 1) check if authorization from cached
   let authorized = await redis.get(`${user?._id?.toString()}-${data?.conv_id}`) // => conversation doc
   authorized = Boolean(authorized) ? JSON.parse(authorized) : null

   // 2) check authorization from db + cache permission
   if (authorized === null) {
     authorized = await protectConversation(socket, data);
     await redis.set(`${user._id?.toString()}-${data.conv_id}`,
          JSON.stringify(authorized),
          {EX: +(process.env.REDIS_CONVERSATION_AUTHORIZATION_EXPIRY)}
        );
   }

   return authorized
}

// get a converssation active users
export const getConversationActives = async (conversation, activeUsers) => {
  const ids = conversation.participants.map(p => p.participant.toString());
  const actives = await Promise.all(
    ids.map(async id => (await activeUsers.has(id)) ? id : null)
  );
  return actives.filter(Boolean);
};


// function that checks conversation active users and distribute  messages to it
export const distributeEvent = async (socket, actives, event , data, callback=(d) => d) => {

  console.log('[actives]', actives);
  actives.forEach(async (u) => {
      console.log(u, 'is active');
      data = await callback(data, u)
      socket.to(u).emit(event, JSON.stringify(data));
  });

}

// function that generate livekit's room access token
export const generateRAT = async (room, user) => {

    const apiKey = process.env.LIVEKIT_API_KEY;
    const secretKey = process.env.LIVEKIT_SECRET_KEY;

    // initiat an access token object
    const token = new AccessToken(apiKey,secretKey,{
      identity: user,
      name: user,
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomRecord: true
    });

    // set permissions on the access token
    await token.addGrant({
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomRecord: true,
      room,
      canSubscribeMetrics: true,
    });

    let jwti = await token.toJwt();

    return jwti;
}

//
