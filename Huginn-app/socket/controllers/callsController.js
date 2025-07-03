import { isAuthorized, distributeEvent, getConversationActives, generateRAT } from '../middlewares.js';
import { wsErrorCatchingLayer, decrypt } from '../../utils/helpers.js';
import { createMessage, updateMessage } from '../../controllers/messageController.js'


export const newCall = (socket, redis, user, activeUsers) => wsErrorCatchingLayer(async (data, callback) => {
  /* #INTEGRITY VALIDATION */
  const authorized = await isAuthorized(socket, redis, user, data)
   // 3) is authorized ? proceeds
    if (Boolean(authorized)) {

      // create message
      data = {...data, content:{
        media: {type: 'call',
         metadata: {
           status: 'non-established',
           type: data.type},
         }}};

      const message = await createMessage(user._id, decrypt(data.conv_id, process.env.CONVERSATION_SECRET), data);
      // const message = {...data}
      // // distribute
      let actives = await getConversationActives(authorized, activeUsers);
      let pld = {...message._doc, sender: {...user._doc, nameTag: user.nameTag, password: undefined, passwordUpdatedAt: undefined}};

      await distributeEvent(socket, actives, 'start-call', {...pld, conv_id: data.conv_id}, async (data, user) => {
        let tempToken = await generateRAT(data.conv_id, user)
        return {...data, tempToken}
      });
      // respond
      data = {...data, callID: message._id, ready: false}
      if (actives.filter((u) => u !== user._id.toString()).length > 0) {
        let callToken = await generateRAT(data.conv_id, user._id)
        data = {...data, ready: true, callToken}
      }
      callback(JSON.stringify(data));
    }
})

export const respondCall = (socket, redis, user, activeUsers) => wsErrorCatchingLayer(async (data, callback) => {
  /* #INTEGRITY VALIDATION */
  const authorized = await isAuthorized(socket, redis, user, data)
   // 3) is authorized ? proceeds
    if (Boolean(authorized)) {

      // set up update data
      let updateData = {};
      switch (data.action) {
        case "end":
          updateData = {"content.media.metadata.endedAt": new Date(),
        "content.media.metadata.status": "responded"}
          break;
        case "respond":
          updateData = {"content.media.metadata.startedAt": new Date(),
        "content.media.metadata.status": "responded"}
          break;
        case "reject":
          updateData = {
        "content.media.metadata.status": "rejected"}
          break;
      }
      // find & update message
      const message = await updateMessage(data.callID, updateData);


      // // distribute if call eneded or rejected
      if (['reject', 'end'].includes(data.action)) {
        let actives = await getConversationActives(authorized, activeUsers);
        let pld = {action: 'end', conv_id: data.conv_id, callObj: message};
        await distributeEvent(socket, actives, 'respond-call', pld);
        callback(JSON.stringify(pld));
      }

      // respond
      callback(JSON.stringify(data));
    }
})
