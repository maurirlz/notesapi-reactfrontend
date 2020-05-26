require('dotenv').config();
const express = require('express');
const app = express();
const Note = require('./models/note');
const cors = require('cors');

app.use(express.static('build'));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('<h1>Main notes page.</h1>')
});

app.get('/api/notes', (req, res) => {

    Note.find({}).then(notes => {
        res.json(notes);
    });
});

app.get('/api/notes/:id', (request, response, next) => {

    Note.findById(request.params.id).then(note => {
        if (note) {
            response.json(note);
        } else {
            response.status(404).end();
        }
    })
        .catch(error => next(error));
});

app.delete('/api/notes/:id', (request, response, next) => {

    Note.findByIdAndRemove(request.params.id)
        .then(result => {

            response.status(204).end();
        })
        .catch(error => next(error));
});

app.post('/api/notes', (request, response) => {

    const body = request.body;

    if (body.content === undefined) {

        return response.status(400).json({
            error: 'content missing'
        });
    }

    const note = new Note ({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    });

    note.save().then(savedNote => {
        response.json(savedNote);
    });
});

app.put('/api/notes/:id', (req, res, next) => {

   const body = req.body;

   const note = {
       content: body.content,
       important: body.important,
   };

   Note.findByIdAndUpdate(req.params.id, note, {new: true})
       .then(updatedNote => {
           res.json(updatedNote);
       })
       .catch(error => next(error));
});

const unknownEndpoint = (req, res) => {

    response.status(404).send({error: 'unknown endpoint '});
}

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
    console.error(error.message);

    if (error.name === 'CastError') {

        return response.status(400).send({error: 'malformatted id'});
    }

    next(error);
}

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});