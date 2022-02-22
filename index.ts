import express = require("express");
import Database from 'better-sqlite3';

const app = express();
const PORT = 9090;
const cors = require("cors");

app.use(express.json());
app.use(
    cors({
      origin: "*"
    })
);
const db = new Database('./data.db', {
  verbose: console.log
});

const getAllMuseums = db.prepare(`
    SELECT * FROM museums;
`);

const getAllWorks = db.prepare(`
    SELECT * FROM works;
`);
const getWorkById = db.prepare(`
    SELECT * FROM works WHERE id =?;
`);
const getWorksByMuseumId = db.prepare(`
    SELECT * FROM works WHERE museumId = ?;
`);
const getMuseumById = db.prepare(`
    SELECT*FROM museums WHERE id =?;
`);

const createMuseum = db.prepare(`
    INSERT INTO museums (name,city) VALUES (?,?);
`);
const createWork = db.prepare(`
    INSERT INTO works (name,picture,museumId) VALUES (?,?,?);
`);

const deleteWorkById = db.prepare(`
    DELETE FROM works WHERE id=?;
`);
const deleteMuseumById = db.prepare(`
    DELETE FROM museums WHERE id = ?;
`);
const deleteWorksByMuseumId = db.prepare(`
    DELETE FROM works WHERE museumId = ?;
`);

app.get('/museums', (req, res) => {
  const museums = getAllMuseums.all();

  for (const museum of museums) {
    museum.works = getWorksByMuseumId.all(museum.id);
  }

  res.send(museums);
});

app.get('/museums/:id', (req, res) => {
  const id = req.params.id;
  const museum = getMuseumById.get(id);
  if (museum) {
    museum.works = getWorksByMuseumId.all(museum.id);
    res.send(museum);
  } else res.status(404).send({ error: 'Museum got robbed!' });
});

app.get('/works', (req, res) => {
  const works = getAllWorks.all();

  for (const work of works) {
    work.museum = getMuseumById.get(work.museumId);
  }

  res.send(works);
});

app.get('/works/:id', (req, res) => {
  const id = req.params.id;
  const work = getWorkById.get(id);
  if (work) {
    work.museum = getMuseumById.get(work.museumId);
    res.send(work);
  } else {
    res.status(404).send({ error: 'Work was not found!' });
  }
});

app.post('/museums', (req, res) => {
  const { name, city } = req.body;
  const errors = [];

  if (typeof name !== 'string') {
    errors.push('Name missing or not a string!');
  }
  if (typeof city !== 'string') {
    errors.push('City missing or not a string!');
  }

  if (errors.length === 0) {
    const outcome = createMuseum.run(name, city);
    const newMuseum = getMuseumById.get(outcome.lastInsertRowid);
    newMuseum.works = [];
    res.send(newMuseum);
  } else {
    res.status(400).send(errors);
  }
});

app.post('/works', (req, res) => {
  const { name, picture, museumId } = req.body;
  const errors = [];

  if (typeof name !== 'string') {
    errors.push('Name missing or not a string!');
  }
  if (typeof picture !== 'string') {
    errors.push('Picture missing or not a string!');
  }
  if (typeof museumId !== 'number') {
    errors.push('MuseumId missing or not a number!');
  }

  if (errors.length === 0) {
    const museum = getMuseumById.get(museumId);
    if (museum) {
      const outcome = createWork.run(name, picture, museumId);
      const newWork = getWorkById.get(outcome.lastInsertRowid);
      newWork.museum = museum;
      res.status(200).send(newWork);
    } else {
      res.status(400).send('This museum was not found!');
    }
  } else {
    res.status(400).send(errors);
  }
});

app.delete('/museums/:id', (req, res) => {
  const id = req.params.id;

  deleteWorksByMuseumId.run(id);
  const outcome = deleteMuseumById.run(id);
  if (outcome.changes !== 0) {
    res.send({ message: 'Museum deleted new tower was build :P!' });
  } else {
    res.status(404).send({ error: 'Museum was not found!' });
  }
});

app.delete('/works/:id', (req, res) => {
  const id = req.params.id;
  const outcome = deleteWorkById.run(id);
  if (outcome.changes !== 0) {
    res.send({ message: 'Work deleted lazy build!' });
  } else {
    res.status(404).send({ error: 'Work was not found!' });
  }
});

app.patch('/works/:id', (req, res) => {
  const { museumId } = req.body;
  const errors = [];
  if (typeof museumId !== 'number') {
    errors.push('MuseumId missing or not a number!');
  }
  const museum = getMuseumById.get(museumId);
  if (museum === undefined) {
    errors.push('Museum was not found');
  }else {
    res.status(404).send({ error: 'Work was not found!' });
  }


});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
