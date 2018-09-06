const express = require('express');
const passport = require('passport');

const authenticationController = require('./controllers/authentication');
const ChatController = require('./controllers/chat');
const passportService = require('./config/passport');

const roles = require('./constants');

// Middleware to require login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

module.exports = app => {
  //Intialize routes group
  const apiRoutes = express.Router();
  const authRoutes = express.Router();
  const chatRoutes = express.Router();

  //=========================
  // Auth Routes
  //=========================

  // Set auth routes as subgroup/middleware to apiRoutes
  apiRoutes.use('/auth', authRoutes);
  apiRoutes.use('/chat', chatRoutes);

  // Registration route
  authRoutes.post('/register', authenticationController.register);

  // Login route
  authRoutes.post('/login', requireLogin, authenticationController.login);

  // Set chat routes as a subgroup/middleware to apiRoutes
  apiRoutes.use('/chat', chatRoutes);

  // View messages to and from authenticated user
  chatRoutes.get('/', requireAuth, ChatController.getConversations);

  // Retrieve single conversation
  chatRoutes.get(
    '/:conversationId',
    requireAuth,
    ChatController.getConversation
  );

  // Send reply in conversation
  chatRoutes.post('/:conversationId', requireAuth, ChatController.sendReply);

  // Start new conversation
  chatRoutes.post(
    '/new/:recipient',
    requireAuth,
    ChatController.newConversation
  );

  // Set url for API group routes
  app.use('/api', apiRoutes);
};
