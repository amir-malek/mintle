const mongoose = require('mongoose');

const { Schema } = mongoose;
const bcrypt = require('bcrypt-nodejs');
const createHash = require('sha.js');
const moment = require('moment');

const sha256 = createHash('sha256');
const config = require('config');

const UserSchema = new Schema({
  firstname: String,
  lastname: String,
  username: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  email: {
    type: String,
    required: true,
  },
  company: {
    type: String,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
  registration_date: {
    type: Date,
    default: Date.now,
  },
  last_login: {
    type: Date,
  },
  tokens: [
    {
      token: String,
      issue_date: {
        type: Date,
        default: Date.now,
      },
      expiry: {
        type: Date,
      },
      used: {
        type: Boolean,
        default: false,
      },
    },
  ],
  user_settings: Schema.Types.Mixed,
});

// method to be executed before the save function
UserSchema.pre('save', function (next) {
  const user = this;

  // check if the password has been changed
  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.hash(user.password, null, null, (err, hash) => {
    if (err) {
      return next(err);
    }

    // change the password with the hashed one
    user.password = hash;
    next();
  });
});

/**
 * Removes the password from any results
 */
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

/**
 * Method to generate the auth token using the sha256 algorythm
 */
UserSchema.methods.generateToken = function () {
  return sha256
    .update(config.get('security.secret') + moment(), 'utf8')
    .digest('hex');
};

/**
 * Method to issue a new security token
 */
UserSchema.methods.issueNewSecurityToken = function () {
  const user = this;
  const securityToken = user.generateToken();
  const tokenObj = {
    token: securityToken,
    expiry: moment().add(1, 'day'),
  };
  user.tokens.map((tk) => {
    tk.used = true;
    tk.expiry = moment().add(-1, 'hour');
    return tk;
  });
  user.tokens.push(tokenObj);
  user.save();
  return tokenObj;
};

UserSchema.methods.getLastToken = function () {
  const user = this;
  const { tokens } = user;
  let found = tokens.find((token) => {
    const now = moment();
    const isExpired = now.diff(token.expiry) >= 0;
    if (!isExpired && !token.used) {
      return token;
    }
  });

  if (!found) {
    user.issueNewSecurityToken();
    found = user.getLastToken();
  } // end if
  return found;
};

UserSchema.methods.isTokenValid = function (token) {
  const user = this;
  const lastToken = user.getLastToken();
  return token === lastToken;
};

UserSchema.methods.markTokenAsUsed = function (tokenToMark) {
  const user = this;
  user.tokens = user.tokens.map((item) => {
    if (item.token === tokenToMark) {
      item.used = true;
    }
    return item;
  });
  return user.tokens;
};

// method to compare the password sent by the user
UserSchema.methods.comparePassword = function (password) {
  const user = this;
  return bcrypt.compareSync(password, user.password);
};

UserSchema.methods.passwordTooShort = function (password) {
  return password.length < 12;
};

module.exports = mongoose.model('User', UserSchema);
