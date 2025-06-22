import { verifyConversation } from '../controllers/conversationController.js'
import { createMessage } from '../controllers/messageController.js'
import { wsErrorCatchingLayer } from '../utils/helpers.js';

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

// function that checks conversation active users and distribute  messages to it
export const distributeEvent = async (socket, conversation, activeUsers, event , data) => {
  let ids = conversation.participants.map( p => p.participant.toString());
  let actives = await Promise.all(ids.map( userId =>  activeUsers.has(userId)));
  console.log('[actives]', ids, actives);
  actives.forEach((isActive, i) => {
    console.log(ids[i],isActive);
    if (isActive) {
      console.log('[ids[i]]', ids[i]);
      socket.to(ids[i]).emit(event, data);
    }
  });

}
