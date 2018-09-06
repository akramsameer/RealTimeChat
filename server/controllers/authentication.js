const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/user');
const config = require('../config/main');

const generateToken = user => {
  return jwt.sign(user, config.secret, {
    expiresIn: 10080 // in seconds
  });
};

const setUserInfo = request => {
  return {
    _id: request._id,
    firstName: request.profile.firstName,
    lastName: request.profile.lastName,
    email: request.email,
    role: request.role
  };
};

// Login Route
exports.login = (req, res, next) => {
  console.log(req.user);
  const userInfo = setUserInfo(req.user);

  res.status(200).json({
    token: `JWT ${generateToken(userInfo)}`,
    user: userInfo
  });
};

//Registeration Route
exports.register = (req, res, next) => {
  //check registeration errors
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password;

  // Return error if no email provided
  if (!email) {
    return res.status(422).json({ error: 'You must enter an email address' });
  }
  // Return error if full name not provided
  if (!firstName || !lastName) {
    return res.status(422).send({ error: 'You must enter your full name.' });
  }

  // Return error if no password provided
  if (!password) {
    return res.status(422).send({ error: 'You must enter a password.' });
  }

  User.findOne({ email: email })
    .then(existingUser => {
      if (existingUser) {
        return res
          .status(422)
          .send({ error: 'That email address is already in use.' });
      }

      let user = new User({
        email: email,
        password,
        profile: { firstName: firstName, lastName: lastName }
      });

      //Saving user
      user
        .save()
        .then(user => {
          let userInfo = setUserInfo(user);
          res.status(201).json({
            token: `JWT ${generateToken(userInfo)}`,
            user: userInfo
          });
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

//========================================
// Authorization Middleware
//========================================

// Role authorization check
exports.roleAuthorization = role => {
  return (req, res, next) => {
    const user = req.user;

    User.findById(user._id).then(user => {
      if (user.role === role) {
        return next();
      }

      res
        .status(401)
        .json({ error: 'You are not authorized to view this content.' });
      return next('Unauthorized');
    });
  };
};
