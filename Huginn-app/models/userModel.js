import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import {subYears} from 'date-fns';
import uniqueValidator from 'mongoose-unique-validator';
import slugify from 'slugify'

const userSchema = new mongoose.Schema({
  name: {
     type: String,
     required: [true, 'the user Name is required'],
     unique: [true, 'the user Name must be unique'],
     maxLength: [30, 'the user name can be a maximum 30 character long'],
     minLength: [3, 'the user name can be a minimum 30 character long'],
     trim: true
  },
  email: {
     type: String,
     required: [true, 'the email address is required'],
     unique: [true, 'the email address must be unique'],
     validate: [(val) => validator.isEmail(val), 'invalid email address form'],
     trim: true
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
  status: {
    type: String,
    default:"active"
  },
  accountStatus: {
    type: String,
    default:"active"
  },
  profilePic: {
    type: String,
    default: null
  },
  coverPic: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: null
  },
  accountSlag: {
    type: String,
    default: null
  },
  bthDay: {
    type: Date,
    validate: [
      { // min birth year
        validator: (val) => {
          let minDate = subYears(new Date(), 7);
          return minDate >= val
        },
        message: (props) => {
          let minDate = subYears(new Date(), 7);
          return `the minimum birth year allowed is ${minDate.getFullYear()}`
        }
      },
      { // max birth year
        validator: (val) => {
          let maxDate = subYears(new Date(), 100);
          return maxDate <= val
        },
        message: (props) => {
          let maxDate = subYears(new Date(), 100);
          return `the minimum birth year allowed is ${maxDate.getFullYear()}`
        }
      }
    ],
    default : null
  },
  active: {
    type: Boolean,
    select:false,
    default:true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  passwordUpdatedAt: Date,
  passwordResetToken: String,
  PasswordResetTokenExpiresAt: Date
},
{
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
})

// validate the fields with unique constraint
userSchema.plugin(uniqueValidator, {message: '{PATH} must be unique'});

/* VIRTUAL FIELDS */
userSchema.virtual('nameTag').get(function(){
  return (this.name).split(' ').map((w) => w[0]).slice(0,2).join('').toUpperCase();
})

/* MIDDLEWARES */

// create the account slag
userSchema.pre('save', function(next) {

  this.accountSlag = slugify(this.name, {
    replacement: '_',
    lower: true,
  });
  next();
});

// encrypt the password
userSchema.pre('save', async function(next) {

  if (!this.isModified('password')) return next();

   // set the password encryption time
  if(this.isNew) this.passwordUpdatedAt = new Date() - 1000;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  return next()
});

//  filter out the inactive users
userSchema.pre(/^find/, function(next) {
  this.find({active: true});
  next()
});


/* METHODS */

// check for correct password | <password> : pasword stored in the db <usePassword> : password used by the client to authenticate | returns : true if password matches
userSchema.methods.correctPassword = async function(password,userPassword) {
  let reslt = await bcrypt.compare(userPassword,password);
  return reslt
}

// check for correct password | <password> : pasword stored in the db <usePassword> : password used by the client to authenticate | returns : true if password matches
userSchema.methods.isOutadedToken =  function(initTime) {
  if (!this.passwordUpdatedAt) return false;

  let time = this.passwordUpdatedAt.getTime() / 1000;
  return time > initTime;
}

// create a reset token
userSchema.methods.createPasswordResetToken = function() {
  let token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
  this.PasswordResetTokenExpiresAt =  Date.now() + 10 * 60 * 1000;

  return token
}

// create a verification token
userSchema.methods.createverificationToken = function() {
  let token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(token).digest('hex')
  this.verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000;

  return token
}


const User = mongoose.model('User', userSchema);

export default User
