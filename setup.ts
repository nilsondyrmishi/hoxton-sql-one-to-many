import Database from 'better-sqlite3';

const db = new Database('./data.db', {
  verbose: console.log
});
type Museum = {
  id: number;
  name: string;
  city: string;
};

type Work = {
  id: number;
  name: string;
  picture: string;
  museumId: number;
};
const museums: Omit<Museum, 'id'>[] = [
  { name: 'Albanian Museum', city: 'Tirane' },
  { name: 'Durres Institution', city: 'Durres' },
  { name: 'Louvre Museum', city: 'Paris' },
  { name: 'Vlora Museum', city: 'Vlore' }
];

const works: Omit<Work, 'id'>[] = [
  {
    name: 'Skanderbeg Picture',
    picture:'https://www.google.com/url?sa=i&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FSkanderbeg&psig=AOvVaw1UWQLkuSZLSpm_3uyamuXP&ust=1645656424023000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCNCwjpaylPYCFQAAAAAdAAAAABAD',
    museumId: 1
  },

  {
    name: 'Illyrian Helmet',
    picture:'https://www.google.com/url?sa=i&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FIllyrian_type_helmet&psig=AOvVaw1Xe3GE9_oeOq43EdVol7WO&ust=1645656504953000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCOjc2L2ylPYCFQAAAAAdAAAAABAD',
    museumId: 2
  },

  {
    name: 'Mona Lisa',
    picture:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/540px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    museumId: 3
  },


  {
    name: 'Amfora',
    picture:'https://www.google.com/url?sa=i&url=https%3A%2F%2Fsq.wikipedia.org%2Fwiki%2FAmfora&psig=AOvVaw2PLzOouhPMFxYWhhiBgcRn&ust=1645656477729000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCOiBza-ylPYCFQAAAAAdAAAAABAD',
    museumId: 4
  }
];

const dropMuseums = db.prepare(`DROP TABLE IF EXISTS museums;`);
const dropWorks = db.prepare(`DROP TABLE IF EXISTS works;`);
dropMuseums.run();
dropWorks.run();

const createMuseumsTable = db.prepare(`
CREATE TABLE museums (
  id     INTEGER,
  name   TEXT NOT NULL,
  city  TEXT NOT NULL,
  PRIMARY KEY(id)
);
`);

const createWorksTable = db.prepare(`
CREATE TABLE works (
  id    	INTEGER,
  name  	TEXT NOT NULL,
  picture 	TEXT NOT NULL,
  museumId INTEGER NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(museumId) REFERENCES museums(id)
);`);

createMuseumsTable.run();
createWorksTable.run();

const createMuseum = db.prepare(`
INSERT INTO museums (name, city) VALUES (?, ?);
`);

const createWork = db.prepare(`
INSERT INTO works (name, picture, museumId) VALUES (?, ?, ?);
`);

for (const museum of museums) {
  createMuseum.run(museum.name, museum.city);
}

for (const work of works) {
  createWork.run(work.name, work.picture, work.museumId);
}
