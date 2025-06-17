import mongoose from 'mongoose'

// SCHEMA DEFINITION
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
      type: {
        iv: {
          type: Buffer,
          set: (val) => Buffer.from(val, 'hex')
        },
        encrypted: {
          type: Buffer,
          set: (val) => Buffer.from(val, 'hex')
        }
      },
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
    }, // Thread replies
    deleteStatus: {
      deletedBy: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }],
      deleteFor: {
         type: String,
         enum: {
          values: ['user', 'all'],
          message: 'invalid delete for option'
        },
          default: 'user'
      },
    }
  }
},
{
  toObject: {
    transform: function (doc, ret) {
      if (ret?.metadata?.deleteStatus?.deleteFor === 'all') {
        ret['content'] = null;
      }
    }
  },
  toJSON: {
    transform: function (doc, ret) {
      if (ret?.metadata?.deleteStatus?.deleteFor === 'all') {
        ret['content'] = null;
      }
    }
  }
})

// POPULATE WITH RELATED DOC
messageSchema.pre(/^find/, function(next) {
  this.populate([
    {path: 'metadata.replyTo'},
    {path: 'sender'},
    {path: 'metadata.deleteStatus.deletedBy', select: '_id'}
  ])

  // .populate({path: 'tour', select: 'ratingsAvg name difficulty'});
  next()
});

// REMOVE CONTENT OF DELETED MESSAGE BY USER
messageSchema.pre(/^find/, function(next) {
  this.transform((doc) => {
    // Get readerId from query options
    const readerId = this.getOptions()?.readerId;

    console.log('some',doc, doc.metadata?.deleteStatus?.deletedBy.some(id => id?.toString() === readerId?.toString()));
    // Check if reader has deleted this message
    if (readerId &&
        doc.metadata?.deleteStatus?.deletedBy?.some(id =>
          id.toString() === readerId.toString()
        )) {
          console.log('[readerID]', readerId);
      // remove content
      doc.content = null;
    }
    return doc;
  });
  next();
});


const Message = mongoose.model('Message', messageSchema);

export default Message
