const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const moment = require('moment');

// le service d'idées
class IdeaService {
  constructor() {
    this.ideas = [];
  }
  async find() {
    return this.ideas;
  }
  async create(data) {
    const idea = {
      id: this.ideas.length,
      text: data.text,
      tech: data.tech,
      viewer: data.viewer,
    };
    idea.time = moment().format('h:mm:ss a');

    this.ideas.push(idea);

    return idea;
  }
}

const app = express(feathers());

//parse JSON
app.use(express.json());

//configuration de l'api en temps reel avec socket.io
app.configure(socketio());

//activation des services REST
app.configure(express.rest());

//enregistrement des services
app.use('/ideas', new IdeaService());

// nouvelle connexion au channel '#stream'
app.on('connection', (conn) => app.channel('stream').join(conn));

//publier des evenements sur le channel '#stream'
app.publish((data) => app.channel('stream'));

const PORT = process.env.PORT || 8080;

app
  .listen(PORT)
  .on('listening', () =>
    console.log(`le serveur tourne en temps reel sur le port ${PORT}`)
  );

// création d'une idée
app.service('ideas').create({
  text: 'Apprendre une nouvelle techno',
  tech: 'feathers js',
  viewer: 'berenice',
  time: moment().format('h:mm:ss a'),
});
