import mongoose from 'mongoose';
import {encrypt, decrypt} from '../utils/helpers.js';


const conversationSchema = new mongoose.Schema({

  type: {
    type: String,
    enum: ["direct", "group", "channel"],
    default: 'direct'
  },
  participantsHash: String,
  participants: {
    // participants schema
    type: [
      {
        participant: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: true,
          // validate if participant exists
          validate: {
            validator: async (vl) => {
              const user = await mongoose.model('User').exists({_id: vl});
              return Boolean(user)
            },
            message: props => `user ${props.value} does not exist`
          }
        },
        joinedAt: Date,
        role: {// For groups/channels
          type: String,
          enum: ["member", "admin", "moderator"],
          default: "member"
        },
        lastRead: Date // Last read timestamp per user
      }
    ],
    // validate conversation memebers
    validate: [
      {
      validator: function(val) {
        if (this.type === 'direct') return val.length === 2
        return val.length > 0
      },
      message: function(props) {
        if (this.type === 'direct') return 'a conversation requires exactly two users';

        return 'One participant is required at least'
      }
    },
    {
      validator: function(val) {
        const partis = this.participants.map((p) => p.participant.toString());
        return new Set(partis).size === partis.length
      },
      message: "duplicate participants are not allowed"
    }
  ]
  },
  blackList: {
    type: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  metadata: {
    title: String, // Group/channel name
    avatar: String,
    createdAt: Date,
    updatedAt: Date,
    description: String
  },
  settings: {
    isPublic: Boolean, // For channels/groups
    readReceipts: Boolean,
    typingIndicators: Boolean
  },
  // Optimizations
  lastMessage: { // Cached for quick access
    type: mongoose.Schema.ObjectId,
    ref: 'Message'
  },
  unreadCounts: { // Per-user counters
    type: Map,
    of: Number
  }
},{
  toJSON: {
    transform: function(doc, ret) {
      ret._id = encrypt(ret._id.toString(), process.env.CONVERSATION_SECRET);
      return ret
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret._id = encrypt(ret._id.toString(), process.env.CONVERSATION_SECRET);
      return ret
    }
  }
})

// // encrypte the document _id
// conversationSchema.post(/^find/, function(docs) {
//
//   if (Array.isArray(docs)) {
//     docs.forEach((doc) => doc.encryptId())
//   } else if (docs) {
//     docs.encryptId();
//   }
// })
//
// /* METHODS */
// conversationSchema.methods.encryptId = function() {
//   this.toObject();
//   this.idzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz = encrypt(this._id.toString(), process.env.CONVERSATION_SECRET);
//   console.log('[encryptId Method]', this);
//   return this
// }

const Conversation = mongoose.model('Conversation', conversationSchema);



export default Conversation
