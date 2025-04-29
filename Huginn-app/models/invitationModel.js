import mongoose from 'mongoose'

const invitationSchema = new mongoose.Schema({

  invitationHash: {type:String, unique:true},
  type: {
    type: String,
    enum: ["direct", "group", "channel"],
    default: 'direct'
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'the sender id is required']
  },
  recipient: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'the recipient id is required']
    },

  target: String,

  status: {
    type: String,
    enum: ["hanging", "accepted", "rejected", "expired"],
    default: "hanging"
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
    message: String // Custom invite message
  }
})

invitationSchema.index({sender:1})
invitationSchema.index({recipient:1})

const Invitation = mongoose.model('Invitation', invitationSchema)

export default Invitation
