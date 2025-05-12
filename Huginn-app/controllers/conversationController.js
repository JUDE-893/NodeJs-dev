import { errorCatchingLayer, signJWT } from '../utils/helpers.js';
import AppError from '../utils/AppError.js';
import User from '../models/userModel.js';
import Message from '../models/messageModel.js';
import Conversation from '../models/conversationModel.js';
import UsersRelationship from '../models/usersRelationshipModel.js';
import crypto from 'crypto';


export const createConversation = errorCatchingLayer(async (req,res,next) => {
  const user = req.user;
  const rel_id = req.params.rel_id
  // check if the users already in relation & active relation
  const relation = await UsersRelationship.findById(rel_id);

  if (!relation) {
    return next( new AppError('Can\'t create conversation. No relationship found',403));
  }
  // if blocked
  if (relation.status !== 'active') {
    return next( new AppError('Can\'t create conversation. Relationship blocked',403));
  }

  const conversation = await Conversation.find({participantsHash: relation.participantsHash})

  if (Boolean(conversation.length)) {
    return res.status(200).json({status: 'success', message:'Conversation already exists', conversation});
  }

  // create new conversation
  const new_conversation = await Conversation.create({
    participants: [{participant: relation.participants[0]}, {participant: relation.participants[1]}],
    participantsHash: relation.participantsHash
  });

  return res.status(200).json({status: 'success', message:'Conversation created successfully', new_conversation})
})

export const getConversations = errorCatchingLayer(async (req,res,next) => {

  const user = req.user;

  let conversations = await Conversation.find({
  "participants.participant": user._id}).populate('participants.participant');

  console.log('conversation1', conversations);
  if(conversations) {
    conversations = await Promise.all(conversations.map( async (cnv) => {
      cnv.participants = cnv.participants.filter((po) => po.participant._id.toString()  !== user._id.toString());
      // last message
      const lastMessage = await Message.findOne({conversationId: cnv._id}).sort({createdAt: -1}).exec()
      cnv = cnv.toObject();
      cnv.lastMessage= lastMessage
      return cnv
    }))
    conversations.sort((a,b) => { b?.lastMessage?.createdAt - a?.lastMessage?.createdAt})
  }

  console.log('conversation2', conversations);
  return res.status(200).json({status: 'success', message: 'conversations fetched successfully', conversations});

})
