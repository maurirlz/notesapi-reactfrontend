const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Note = require('../models/note');
const helper = require('./test_helper');

const api = supertest(app);



beforeEach(async () => {
  await Note.deleteMany({});

  const noteObjects = helper.initialNotes.map(note => new Note(note));

  const promiseArray = noteObjects.map((note) => note.save());

  await Promise.all(promiseArray);
})

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
});

test('notes have a property named id', async () => {

  const notes = await helper.notesInDb();

  expect(notes[0].id).toBeDefined();
});

test('note is properly saved in database', async () => {

  const toPostNote = {
    content: 'async/await simplifies making async calls',
    important: true,
    date: new Date(),
  }

  await api
    .post('/api/notes')
    .send(toPostNote)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const response = await helper.notesInDb();
  expect(response).toHaveLength(helper.initialNotes.length + 1);

  const contents = response.map((note) => note.content);

  expect(contents).toContain('async/await simplifies making async calls');
});

test('note without content is not added', async () => {

  const newNote = {
    important: true,
  };

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400);

  const response = await helper.notesInDb();
  expect(response).toHaveLength(helper.initialNotes.length);
});

test('a specific note can be viewed', async () => {

  const startingNotes = await helper.notesInDb();

  const noteToView = startingNotes[0];

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(resultNote.body.content).toEqual(noteToView.content);
});

test('a specific note can be deleted', async () => {

  const startingNotes = await helper.notesInDb();
  const noteToDelete = startingNotes[0];

  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204);

  const endingNotes = await helper.notesInDb();
  expect(endingNotes).toHaveLength(startingNotes.length - 1);


  const contents = endingNotes.map((note) => note.content);
  expect(contents).not.toContain(noteToDelete.content);
});

afterAll(() => {
  mongoose.connection.close();
});