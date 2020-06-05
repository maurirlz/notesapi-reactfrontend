const notesRouter = require('express').Router();
const Note = require('../models/note');

notesRouter.get('/', async (req, res) => {

  const notes = await Note.find({});
  res.json(notes.map((note) => note.toJSON()));
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

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  });

  const savedNote = await note.save();
  res.json(savedNote.toJSON());
});

notesRouter.delete('/:id', async (req, res, next) => {

  await Note.findByIdAndRemove(req.params.id)
  res.status(204).end();

});

notesRouter.put('/:id', (req, res, next) => {

  const body = req.body;

  const note = {
    content: body.content,
    important: body.important
  };

  Note.findByIdAndUpdate(req.params.id, note, {new: true})
    .then(updatedNote => {
      res.json(updatedNote.toJSON);
    })
    .catch(error => next(error));
});

module.exports = notesRouter;