const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    minlength: 6,
    maxlength: 15,
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 15,
  },
  passwordHash: String,
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
    }
  ],
});

userSchema.plugin(uniqueValidator)

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
   returnedObject.id = returnedObject._id.toString();
   delete returnedObject._id;
   delete returnedObject.__v;
   delete returnedObject.passwordHash;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;