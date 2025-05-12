import mongoose from 'mongoose'


const messageSchema = new mongoose.Schema({
  // relational props
  conversationId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Conversation',
    required: [true, 'a message should belong to a conversation']
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'a message should belong to a sender']
  },
  content: {
    text: {
      type: String,
      required: [
        function() {
          return !this?.content?.media; // Text is required if media doesn't exist
        },
        'Text content is required when no media is attached'
      ]
    },
    // Optional rich media
    media: {
      url: String,
      type: {
         type: String,
         enum: {
          values: ['image','video','audio','call', 'contact'],
          message: 'invalid media type'
          }
        }
    }
  }, // content
  status: {
     type: String,
     enum: {
      values: ['sent','delivered','pending','error'],
      message: 'invalid status type'
      }
    },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: Date,

  // Optional metadata
  metadata: {
    isEdited: Boolean,
    editedAt: Date,
    reactions: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        },
       emoji: String
     }
    ],
    replyTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'Message'
    } // Thread replies
  }
})

// populate the replies
messageSchema.pre(/^find/, function(next) {
  this.populate([
    {path: 'metadata.replyTo'},
    {path: 'sender'},
  ])
  // .populate({path: 'tour', select: 'ratingsAvg name difficulty'});
  next()
})


const Message = mongoose.model('Message', messageSchema);

export default Message
