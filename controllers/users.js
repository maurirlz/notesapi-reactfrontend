const bcrypt = require('bcrypt');
const usersRouter = require('express').Router()
const User = new require('../models/user');

usersRouter.get('/', async (req, res) => {

  const allUsers = await User
    .find({}).populate('notes', { content: 1, date: 1 });

  res.json(allUsers.map(user => user.toJSON()))
});

usersRouter.post('/', async (req, res) => {
  const body = req.body;

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save();

  res.json(savedUser);
})

usersRouter.delete('/:id', async (request, response) => {

  await User.findByIdAndRemove(request.params.id);
  response.status(204).end();
})

module.exports = usersRouter;