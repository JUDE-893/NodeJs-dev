const mongoose = require('mongoose');
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'the user name is required'],
    unique: [true, 'this user name is taken'],
    maxLength: [30, 'the use name must be less than 30 chars long'],
    minLength: [5, 'the use name must be more than 5 chars long'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'the email address is required'],
    unique: [true, 'this email address is used'],
    trim: true,
    validate: {
      message: 'Invalid email address',
      validator: (val) => validator.isEmail(val)
    }
  },
  password: {
    type: String,
    required: [true, 'the password is required'],
    trim: true,
    select: false,
    validate: {
      message: 'Invalid password value form',
      validator: (val) => /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(val)
    }
  },
  passwordConfirm: {
    type: String,
    required: [true, 'the password confirmation is required'],
    trim: true,
    validate: {
      message: "the password confirmation should match",
      validator: function(val) {
        return this.password === val;
      }
    }
  },
  role: {
    type: String,
    enum: {
      values: ['admin','manager','user'],
      message: 'The role must be eather: admin, manager or user'
    },
    default: 'user'
  },
  active: {
    type: Boolean,
    select:false,
    default:true
  },
  passwordUpdatedAt: Date,
  passwordResetToken: String,
  PasswordResetTokenExpiresAt: Date
});

// validate the fields with unique constraint
userSchema.plugin(uniqueValidator, {message: '{PATH} must be unique'});

// encrypting the password
userSchema.pre('save', async function(next) {
  if(!this.isModified('password')) return next();

  // if an updated document
  if (!this.isNew) this.passwordUpdatedAt= Date.now() -1000; // redude the update time to be older than the jwt creation time

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  return next();
});

// filtering inactive users selection out
userSchema.pre(/^find/, function(next) {
  this.find({active: true});
  next();
})

// password verfication on login method | <userPassword> recieved from the client <password> stored on the db
// Initially the resulting hash contains the salt as part of its structure. So, when you compare passwords using bcrypt.compare, bcrypt extracts the salt from the stored hash, applies it to the input password, and checks if the hashes match.
userSchema.methods.correctPassword = async function(password, userPassword) {
  let r = await bcrypt.compare(userPassword, password);
  return r
};

// comparing password update date with token creation time | invalidating token for later password updates
userSchema.methods.isOutDatedToken = function(initTime) {

  if (!this.passwordUpdatedAt) return false;
  // convet into a time amount (num of milisec) then to seconds
  const updateTime = this.passwordUpdatedAt.getTime() / 1000;
  // if token creation time is older than the password update
  if (initTime < updateTime) return true;

  return false
}

// genrating a password update token
userSchema.methods.createPassordResetToken = async function() {
  // generate the token
  const token = crypto.randomBytes(32).toString('hex');
  // encrypt the token
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.PasswordResetTokenExpiresAt = Date.now() + 10 *60* 1000;

  return token;
}

module.exports = mongoose.model('User', userSchema);
