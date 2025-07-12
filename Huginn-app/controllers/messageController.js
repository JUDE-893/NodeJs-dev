import { errorCatchingLayer, signJWT } from '../utils/helpers.js';
import AppError from '../utils/AppError.js';
import User from '../models/userModel.js';
import Message from '../models/messageModel.js';
import Conversation from '../models/conversationModel.js';
import UsersRelationship from '../models/usersRelationshipModel.js';
import crypto from 'crypto';

export const createMessage = async (sender, conversationId, data) => {

  data = {...data, sender, conversationId}
  const message = await Message.create(data);
  return message;
}

export const setDeletedStatus = async (deleter, conversation, data) => {
  let message = await Message.findById(data?.msgId);

  if (!message) {
    throw new AppError('Cannot find a message with the provider identifier', 404);
  };
  // if the message is already deleted
  if( message.metadata?.deleteStatus?.deleteFor === "all") {
    return null
  }
  // if the user is the sender of the message
  let isSender = message.sender._id.toString() === deleter.toString();

  let deleterRole = conversation.participants.filter((p) => {
    return p.participant.toString() === deleter.toString()
  })[0].role;

  // if the user role in the conversation is admin
  let isAdmin = deleterRole === "admin" // fat models, skinny controllers
  let deleteFor = (isSender || isAdmin) ? data.deleteFor : 'user'

  message = await Message.findOneAndUpdate({_id: message._id},
    {$set: {
      updatedAt: Date.now(),
      "metadata.deleteStatus.deleteFor": deleteFor
    },
    $addToSet: { "metadata.deleteStatus.deletedBy": deleter }
  },
  {new: true} //return the updated message
)

  return message;
}

export const updateMessage = async (msgId, data) => {

  const updatedMessage = await Message.findOneAndUpdate( { _id: msgId }, { $set: { ...data } }, { new: true,useFindAndModify: false } );

  return updatedMessage;
}

export const sendMessage = errorCatchingLayer(async (req,res,next) => {
  const user = req.user;
  const conversation = req.conversation;
  const payload = req.body

  const message = await createMessage(user._id, conversation._id, payload )
  return res.status(201).end()
})

export const getMessages = errorCatchingLayer(async (req,res,next) => {

  const user = req.user;
  const conv_id = req.conversation._id;
  const { page } = req.query;
  let limite = +(process.env.MESSAGES_PAGE_LENGTH);
  let skipp = +(process.env.MESSAGES_PAGE_LENGTH) * ((+page)-1);

  console.log("___",skipp, limite);

  let messages = await Message.find({ conversationId: conv_id })
  .setOptions({ readerId: user?._id })
  .sort({ createdAt: -1 })
  .limit(limite)
  .skip(skipp);

  messages = messages?.reverse();

  return res.status(200).json({status: 'success', message: 'conversation messages fetched successfully', messages});

})







// TODO:
// 1) MIDDLEWARE / check it a user belongs to this conversation
// 2) FIX MODEL / SET THE CONVERSATION statE TO
// 3) MONGOOSE MIDDLEWARE  - FIND / encrypte the conversation id & remove the real id from selected data
// 4) MONGOOSE MIDDLEWARE - SAVE / encrypte message content on save
// 5) CLIENT DISPLAY / Dencrypte message content on recieve
