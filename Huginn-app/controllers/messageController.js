import { errorCatchingLayer, signJWT } from '../utils/helpers.js';
import AppError from '../utils/AppError.js';
import User from '../models/userModel.js';
import Message from '../models/messageModel.js';
import Conversation from '../models/conversationModel.js';
import UsersRelationship from '../models/usersRelationshipModel.js';
import crypto from 'crypto';


export const createMessage = errorCatchingLayer(async (req,res,next) => {
  const user = req.user;


  return res.status(201)
})

export const getMessages = errorCatchingLayer(async (req,res,next) => {

  const user = req.user;
  const conv_id = req.params.id;

  const messages = await Message.find({conversationId: conv_id});

  return res.status(200).json({status: 'success', message: 'conversation messages fetched successfully', messages});

})

export protectConversation = errorCatchingLayer(async (req,res,next) => {
  const user = req.user;
  const conv_id = req.params.conv_id

  const conversation = await Conversation.findById(conv_id);

  if (!Boolean(conversation)) {
    return next(new AppError('couldn\'t find conversation with the given id', 400))
  }
  // check if user belongs to
  if (!conversation?.participants.some((ptp) => ptp.participant.toString() === user._id.toString())) {
    return next( new AppError('User does not belong to this conversation',403));
  }

  req.conversation = conversation;
  next()

})

export isActiveConversation = errorCatchingLayer(async (req,res,next) => {
  const user = req.user;
  const conversation = req.conversation;

  // if blocked
  if (!conversation?.blackList.some((id) => id.toString() === user._id.toString())) {
    return next( new AppError('Inactive conversation. Relationship blocked',403));
  }

  next()

})


// TODO:
// 1) MIDDLEWARE / check it a user belongs to this conversation
// 2) FIX MODEL / SET THE CONVERSATION statE TO
// 3) MONGOOSE MIDDLEWARE  - FIND / encrypte the conversation id & remove the real id from selected data
// 4) MONGOOSE MIDDLEWARE - SAVE / encrypte message content on save
// 5) CLIENT DISPLAY / Dencrypte message content on recieve
