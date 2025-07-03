import { isAuthorized, distributeEvent, getConversationActives } from '../middlewares.js';
import { wsErrorCatchingLayer, decrypt } from '../../utils/helpers.js';
import { createMessage, setDeletedStatus } from '../../controllers/messageController.js'


export const newMessage = (socket, redis, user, activeUsers) => wsErrorCatchingLayer(async (data, callback) => {

  /* #INTEGRITY VALIDATION */
  const authorized = await isAuthorized(socket, redis, user, data)
   // 3) is authorized ? proceeds
    if (Boolean(authorized)) {
      // create msg
      const message = await createMessage(user._id, decrypt(data.conv_id, process.env.CONVERSATION_SECRET), data);
      // distribute
      let pld = {...message._doc, sender: {...user._doc, nameTag: user.nameTag, password: undefined, passwordUpdatedAt: undefined}}
      let actives = await getConversationActives(authorized, activeUsers);
      await distributeEvent(socket, actives, 'new-message', JSON.stringify({...pld, vol_id: data.vol_id,conv_id: data.conv_id}));
      // respond
      callback(JSON.stringify({conv_id: data.conv_id, data: {_id: message._id, id: data.vol_id}}));
    }
})

export const deleteMessage = (socket, redis, user, activeUsers) => wsErrorCatchingLayer(async (data, callback) => {

  /* #INTEGRITY VALIDATION */
  const authorized = await isAuthorized(socket, redis, user, data)
   // 3) is authorized ? proceeds
    if (Boolean(authorized)) {
      const message = await setDeletedStatus(user._id, authorized, data);
      // distribute the athoer users if deleted for all
      console.log('+++++',message?.metadata?.deleteStatus?.deleteFor);
      if (message?.metadata?.deleteStatus?.deleteFor === "all") {
        let actives = await getConversationActives(authorized, activeUsers);
        await distributeEvent(socket, actives, 'delete-message', JSON.stringify({...data}))
      }
      // aknowlege delete-message event
      callback(JSON.stringify({...data}));
    }
})
