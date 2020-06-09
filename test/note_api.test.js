const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Note = require('../models/note');
const helper = require('./test_helper');
const bcrypt = require('bcrypt');
const User = require('../models/user')

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

describe('when there is initially oner user in db', function () {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root' , passwordHash });

    await user.save();
  });

  test('creation succeeds with a fresh username', async () => {

    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails with proper statuscode and message if username already taken', async () => {

    const usersAtStart = helper.usersInDb();

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'selainen',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});