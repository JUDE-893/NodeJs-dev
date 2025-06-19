import { errorCatchingLayer, signJWT, decrypt } from '../utils/helpers.js';
import AppError from '../utils/AppError.js';
import User from '../models/userModel.js';
import Message from '../models/messageModel.js';
import Conversation from '../models/conversationModel.js';
import UsersRelationship from '../models/usersRelationshipModel.js';

export const verifyConversation = async (user, conv_id) => {
  conv_id = decrypt(conv_id, process.env.CONVERSATION_SECRET);

  const conversation = await Conversation.findById(conv_id);

  if (!Boolean(conversation)) {
    throw new AppError('couldn\'t find conversation with the given id', 400);
  }
  // check if user belongs to
  if (!conversation?.participants.some((ptp) => ptp.participant.toString() === user._id.toString())) {
    throw  new AppError('User does not belong to this conversation',403);
  }

  return conversation
}

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

  if(conversations) {
    conversations = await Promise.all(conversations.map( async (cnv) => {
      cnv.participants = cnv.participants.filter((po) => po.participant._id.toString()  !== user._id.toString());
      // last message
      const lastMessage = await Message.findOne({conversationId: cnv._id}).sort({createdAt: -1}).setOptions({ readerId: user?._id }).exec()
      cnv = cnv.toObject();
      cnv.lastMessage= lastMessage
      return cnv
    }))
    conversations.sort((a,b) => { b?.lastMessage?.createdAt - a?.lastMessage?.createdAt})
  }

  return res.status(200).json({status: 'success', message: 'conversations fetched successfully', conversations});

})

export const protectConversation = errorCatchingLayer(async (req,res,next) => {
  const user = req.user;
  let conv_id = req.params.conv_id;
  console.log('------------',req.params);

  const conversation = await verifyConversation(user, conv_id)

  req.conversation = conversation;
  next()

})

export const isActiveConversation = errorCatchingLayer(async (req,res,next) => {
  const user = req.user;
  const conversation = req.conversation;

  // if blocked
  if (conversation?.blackList.some((id) => id.toString() === user._id.toString())) {
    return next( new AppError('Inactive conversation. Relationship blocked',403));
  }

  next()

})
