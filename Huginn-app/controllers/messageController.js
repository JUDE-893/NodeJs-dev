import { errorCatchingLayer, signJWT } from '../utils/helpers.js';
import AppError from '../utils/AppError.js';
import User from '../models/userModel.js';
import Message from '../models/messageModel.js';
import Conversation from '../models/conversationModel.js';
import UsersRelationship from '../models/usersRelationshipModel.js';
import crypto from 'crypto';


export const createMessage = errorCatchingLayer(async (req,res,next) => {
  const user = req.user;
  const conversation = req.conversation;
  const payload = req.body
  payload.sender = user._id;
  payload.conversationId = conversation._id;

  const message = await Message.create(payload)
  console.log(message);
  console.log(payload);
  return res.status(201).end()
})

export const getMessages = errorCatchingLayer(async (req,res,next) => {

  const user = req.user;
  const conv_id = req.conversation._id;

  const messages = await Message.find({conversationId: conv_id});

  return res.status(200).json({status: 'success', message: 'conversation messages fetched successfully', messages});

})



// TODO:
// 1) MIDDLEWARE / check it a user belongs to this conversation
// 2) FIX MODEL / SET THE CONVERSATION statE TO
// 3) MONGOOSE MIDDLEWARE  - FIND / encrypte the conversation id & remove the real id from selected data
// 4) MONGOOSE MIDDLEWARE - SAVE / encrypte message content on save
// 5) CLIENT DISPLAY / Dencrypte message content on recieve
