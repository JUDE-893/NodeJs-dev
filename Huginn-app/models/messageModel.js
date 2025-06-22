import mongoose from 'mongoose'

// DEFINE THE MESSAGES MEDIA CONTENT DISCRIMINATORY PROPERTY
const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['image','video','audio','call','contact']
  }
}, {
  _id: false,                   // no _id on the media sub‐doc
  discriminatorKey: 'type',     // tell Mongoose to switch on `media.type`
})

// BASE SCHEMA DEFINITION
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
          return (!this?.content?.media); // Text is required if media doesn't exist
        },
        'Text content is required when no media is attached'
      ]
    },
    // Optional rich media
    media: {
      type: mediaSchema
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
});

// DEFINE DISCRIMINATORY SCHEMAS FOR THE CONTENT TYPE
const callSchema = new mongoose.Schema({
  metadata: {
    endedAt: Date,
    status: {
      type: String,
      enum: ['non-established','responded','rejected'],
      required: true
    }
  }
}, { _id: false })

const contactSchema = new mongoose.Schema({
  contact: { type:mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { _id: false })

const urlSchema = new mongoose.Schema({
  url: { type: String, required: true }
}, { _id: false })

// ATTACH DISCRIMINATORS TO SCHEMA
messageSchema
  .discriminator('call',    callSchema)
  .discriminator('contact', contactSchema)
  .discriminator('image',   urlSchema)
  .discriminator('video',   urlSchema)
  .discriminator('audio',   urlSchema)


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

  // Get readerId from query options
  const { readerId } = this.getOptions();

  this.transform((docs) => {
    // multiple docs retrieval
    if (Array.isArray(docs)) {
      docs = docs?.map((d) => d.removeContentIfDeleted(readerId) )
      // single docs retrieval
    } else if (docs){
       docs = docs.removeContentIfDeleted(readerId)
    };

    return docs;
  });
  next();
});

// METHOD THAT CHECKS IF THE USER HAS DELETED A SPECIFIC DOCUMENT
messageSchema.methods.removeContentIfDeleted = function(readerId) {

  // Check if reader has deleted this message
  let c = this.metadata?.deleteStatus?.deletedBy?.some(id =>{
    return id?.id?.toString() === readerId?.toString()}
  )
  if (c) {
    // remove content
    this.content = null;
  }
  return this
}

const Message = mongoose.model('Message', messageSchema);

export default Message






// {
//   media: {
//     content: function() {
//
//       if (this.content.media.type === "call") {
//         return {metadata: {
//           endedAt: Date,
//           status: {
//              type: String,
//              enum: {
//               values: ['non-established', 'responded', 'rejected'],
//               message: 'invalid call status'
//               }
//             }
//         }}
//       }
//       else if (this.content.media.type === "contact") {
//         return {contact: {
//           type: mongoose.Schema.ObjectId,
//           ref: 'User'
//         }}
//       }
//       else {
//         return {url: String}
//       }
//     },
//
//     type: {
//        type: String,
//        enum: {
//         values: ['image','video','audio','call', 'contact'],
//         message: 'invalid media type'
//         }
//       }
//   }
// }
