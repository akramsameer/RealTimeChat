const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      require: true
    }
  },
  {
    timestamps: true //Saves createAt and updateAt as dates, createAt will be our  timestamp.
  }
);

module.exports = mongoose.model('Message', messageSchema);
