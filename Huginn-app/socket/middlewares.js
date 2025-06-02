import { verifyConversation } from '../controllers/conversationController.js'
import { createMessage } from '../controllers/messageController.js'
import { wsErrorCatchingLayer } from '../utils/helpers.js';

export const protectConversation = async (socket, data) => {

  // if user belongs, conversation exists..
  console.log('[EVENT DATA]', data);
  const conversation = await verifyConversation(socket?.user, data.conv_id);

  const user = socket.user;

  // if blocked
  if (conversation?.blackList.some((id) => id.toString() === user._id.toString())) {
    throw new AppError('Inactive conversation. Relationship blocked', 403);
  }
  // authorized acceess;
  return conversation
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
