const notesRouter = require('express').Router();
const User = new require('../models/user');
const Note = new require('../models/note');


notesRouter.get('/', async (req, res) => {

  const notes = await Note
    .find({}).populate('user', { username: 1, name: 1 });

  res.json(notes.map(note => note.toJSON()))
});

notesRouter.get('/:id', async (req, res, next) => {

  const requestedNote = await Note.findById(req.params.id);

  if (requestedNote) {
    res.send(requestedNote.toJSON());
  } else {
    res.status(404);
  }
});

notesRouter.post('/', async (req, res, next) => {

  const body = req.body;
  const user = await User.findById(body.userId);

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user._id,
  });

  const savedNote = await note.save();
  user.notes = user.notes.concat(savedNote._id)
  await user.save();
  res.json(savedNote.toJSON);
});

notesRouter.delete('/:id', async (req, res, next) => {

  await Note.findByIdAndRemove(req.params.id)
  res.status(204).end();

});

notesRouter.put('/:id', async (req, res, next) => {

  const body = req.body;

  const note = {
    content: body.content || " ",
    important: body.important || false
  };

  const updatedNote = await Note.findByIdAndUpdate(req.params.id, note, {new: true});
  res.json(updatedNote.toJSON);
});

module.exports = notesRouter;