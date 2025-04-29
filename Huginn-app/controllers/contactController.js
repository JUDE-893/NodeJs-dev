import { errorCatchingLayer, signJWT } from '../utils/helpers.js';
import AppError from '../utils/AppError.js';
import User from '../models/userModel.js';
import Invitation from '../models/invitationModel.js';
import Conversation from '../models/conversationModel.js';
import UsersRelationship from '../models/usersRelationshipModel.js';
import crypto from 'crypto';


export const inviteContact = errorCatchingLayer(async (req,res,next) => {
  const user = req.user;
  const username= req.body.username;

  // check if the recipient user exists
  const recipient = await User.findOne({$and: [{accountSlag: username},{accountSlag: {$ne: user.accountSlag}}] });

  if (!recipient) {
    return next(new AppError('couldn\'t find a user with the provided username', 404))
  }

  // check if the recipient user exists
  const hash = [user._id, recipient._id].sort().join('-');

  // check if the relationship already exists
  const relation = await UsersRelationship.findOne({participantsHash: hash});

  if (relation) {
    return next(new AppError('user already realted', 409))
  }

  // check if the invitation already sent
  const invitation = await Invitation.findOne({invitationHash: hash});

  if (invitation) {
    return next(new AppError('invitation already sent', 409))
  }

  // create new invitation
  const new_invt = await Invitation.create({sender: user._id, recipient: recipient._id, invitationHash: hash})

  return res.status(201).json({status: 'success', message: 'invitation sent successfully'})
})
