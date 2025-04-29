import mongoose from 'mongoose'

const usersRelationship = new mongoose.Schema(// relationshipSchema.js
{
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
        }
      }
    ],
    // validate conversation memebers
    validate: [
      {
      validator: function(val) {
        return val.length === 2
      },
      message: 'a user relationship requires exactly two users'
    }
  ]
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['contact', 'friend', 'family'],
    default: 'contact'
  },
  lastInteraction: Date,
  metadata: {
    createdAt: { type: Date, default: Date.now }
  }
})

usersRelationship.index({participantsHash :1});

/* MIDDLEWARES */

// create a users hash
usersRelationship.pre('save', function(next) {
  this.participantsHash = this.participants.map((p) => p.participant.toString())
    .join('-');
  next();
})

const UsersRelationship = mongoose.model('UsersRelationship', usersRelationship);

export default UsersRelationship;
