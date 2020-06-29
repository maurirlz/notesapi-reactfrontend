const router = require('express').Router();
const mongoose = require('mongoose');
const Note = require('../models/note');
const User = require('../models/user');

router.post('/reset', async (request, response) => {
  await Note.deleteMany({});
  await User.deleteMany({});

  response.status(204).end();
});
