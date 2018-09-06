const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt-nodejs');

const UserSchema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true
    },
    password: {
      type: String,
      require: true
    },
    profile: {
      firstName: {
        type: String
      },
      lastName: { type: String }
    },
    role: {
      type: String,
      enum: ['Member', 'Client', 'Owner', 'Admin'],
      default: 'Member'
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
  },
  { timestamps: true }
);

//Pre-Save of user to database, hash password if password modified or new
UserSchema.pre('save', function(next) {
  const user = this,
    SALT_FACTOR = 5;

  if (!user.isModified('password')) next();

  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) next(err);

    bcrypt.hash(user.password, salt, null, (err, hashed) => {
      if (err) next(err);
      user.password = hashed;
      next();
    });
  });
});

// Method to compare password for login
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }

    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);
