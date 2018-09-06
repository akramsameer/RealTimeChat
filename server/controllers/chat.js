const Conversation = require('../models/conversation'),
  User = require('../models/user'),
  Message = require('../models/message');

exports.getConversations = (req, res, next) => {
  // Only return one message from each conversation to display as snippet
  Conversation.find({ participants: req.user._id })
    .select('_id')
    .exec((err, conversations) => {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      // Setup Empty array to hold conversations + most recent messages
      let fullConversations = [];
      conversations.forEach(conversation => {
        Message.find({ conversationId: conversation._id })
          .sort('-createAt')
          .limit(1)
          .populate({
            path: 'author',
            select: 'profile.firstName profile.lastName'
          })
          .exec((err, message) => {
            if (err) {
              res.send({ error: err });
              return next(err);
            }
            fullConversations.push(message);

            //we are done
            if (fullConversations.length === conversations.length) {
              return res.status(200).json({ conversations: fullConversations });
            }
          });
      });
    });
};

exports.getConversation = (req, res, next) => {
  Message.find({ conversationId: req.params.conversationId })
    .select('createAt body author')
    .sort('-createAt')
    .populate({
      path: 'author',
      select: 'profile.firstName profile.lastName'
    })
    .exec((err, messages) => {
      if (err) {
        res.status(400).send({ error: err });
        return next(err);
      }

      res.status(200).json({ conversation: messages });
    });
};

exports.newConversation = (req, res, next) => {
  if (!req.params.recipient) {
    res
      .status(422)
      .send({ error: 'Please choose a valid recipient for you message.' });
    return next(err);
  }

  if (!req.body.composedMessage) {
    res.status(422).send({ error: 'Please enter a message.' });
    return next();
  }

  const newConversation = new Conversation({
    participants: [req.user._id, req.params.recipient]
  });

  newConversation
    .save()
    .then(newConversation => {
      const newMessage = new Message({
        conversationId: newConversation._id,
        body: req.body.composedMessage,
        author: req.user._id
      });

      return newMessage.save();
    })
    .then(msg => {
      res.status(200).json({
        message: 'Conversation started!',
        conversationId: newConversation._id
      });
      return next();
    })
    .catch(err => {
      res.status(400).send({ error: err });
      return next(err);
    });
};

exports.sendReply = (req, res, next) => {
  const reply = new Message({
    conversationId: req.params.conversationId,
    body: req.body.composedMessage,
    author: req.user._id
  });

  reply
    .save()
    .then(sentReply => {
      res.status(200).json({ message: 'Reply Successfuly sent!' });
      return next();
    })
    .catch(err => {
      res.send({ error: err });
      return next(err);
    });
};

exports.deleteConversation = (req, res, next) => {
  Conversation.findByIdAndRemove({
    $and: [{ _id: req.params.conversationId }, { participants: req.user._id }]
  })
    .then(() => {
      res.status(200).json({ message: 'Conversation Deleted!' });
      return next();
    })
    .catch(err => {
      res.send({ error: err });
      return next(err);
    });
};

exports.updateMessage = (req, res, next) => {
  Message.find({
    $and: [{ _id: req.params.messageId }, { author: req.user._id }]
  })
    .then(message => {
      message.body = req.body.composedMessage;

      return message.save();
    })
    .then(updateMessage => {
      res.status(200).json({ message: 'Message updated!' });
      return next();
    })
    .catch(err => {
      res.send({ error: err });
      return next(err);
    });
};
