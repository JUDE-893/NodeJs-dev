import { errorCatchingLayer, signJWT } from '../utils/helpers.js';
import AppError from '../utils/AppError.js';
import User from '../models/userModel.js';
import Invitation from '../models/invitationModel.js';
import Conversation from '../models/conversationModel.js';
import UsersRelationship from '../models/usersRelationshipModel.js';
import crypto from 'crypto';


/* RELATIONS */
export const getUserRelations = errorCatchingLayer(async (req,res,next) => {
  const user = req.user;

  let relations = await UsersRelationship.find({participants: {$in: [user._id]}}).populate('participants');

  if (relations) {
    relations = relations.map((r, i) => {
      r = r.toObject()
      r.participants = r.participants.filter((p) => p._id.toString() !== user._id.toString());
      r.contact = r.participants[0];
      r.participants = undefined;
      return r;
    });
  }

  return res.status(200).json({status: 'success', message:'relations fetched successfully', relations})
})


/* INVITATIONS */

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

export const responseInvitation = errorCatchingLayer(async (req, res, next) => {
  const inv_id = req.body.id,
  inv_res = req.body.response;
  const user = req.user;

  // check for required body
  if (!inv_id || !inv_res) {
    return next(new AppError('invitation identifier and respond are required', 400))
  }

  if (![0, 1].includes(+inv_res)) {
    return next(new AppError('invalid invitation response. response should include eather 1 or 0', 400))
  }

  // check if invitation exists
  const invitation = await Invitation.findById(inv_id);

  if (!invitation || invitation?.recipient?.toString() !== user?._id?.toString()) {
    return next(new AppError('invitation does not exists or already expired', 404))
  }

  // check if invitaion already have response
  if (invitation.status !== 'hanging') {
    return next(new AppError('invitation already responded', 422))
  }

  // set invitation satus
  var relationship;
  if (!!inv_res) {
    invitation.status = 'accepted';

    // create a new relationship
    relationship = await UsersRelationship.create({participants:[invitation?.sender, invitation?.recipient]})
  }
  else invitation.status = 'rejected';

  invitation.recipient = invitation.sender
  invitation.sender = user._id;
  invitation.save();
  relationship.participantsHash= undefined;

  // success
  return res.status(200).json({status: 'success', message: 'invitation response sent successfully',relationship})
})

export const cancelInvitation = errorCatchingLayer(async (req, res, next) => {

  const inv_id = req.params.id;
  const user = req.user;

  // check for required body
  if (!inv_id) {
    return next(new AppError('invitation identifier is required', 400))
  }

  // check if invitation exists
  const invitation = await Invitation.findById(inv_id);

  if (!invitation || invitation?.sender.toString() !== user?._id.toString()) {
    return next(new AppError('invitation does not exists or already expired', 404))
  }

  // check if invitaion already have response
  if (invitation.status !== 'hanging') {
    return next(new AppError('invitation already responded', 422))
  }

  await invitation.deleteOne();

  // success
  return res.status(200).json({status: 'success', message: 'invitation  canceled successfully'})
})

export const getInvitations = errorCatchingLayer(async (req, res, next) => {
  const user = req.user;

  const sentQuery = Invitation.find({sender: user._id}).populate('recipient');
  const recievedQuery = Invitation.find({recipient: user._id}).populate('sender');

  const [sent, recieved] = await Promise.all([sentQuery, recievedQuery]);

  return res.status(200).json({status: 'success', message: 'invitations fetched successfully', invitations: {sent,recieved}})
})
