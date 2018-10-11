import authrequest from './authrequest';

const Commands = {
  create: options =>
    new Promise((resolve, reject) => {
      authrequest
        .post('/api/commands')
        .send(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  delete: id =>
    new Promise((resolve, reject) => {
      authrequest.delete('/api/commands/' + id).end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  fetch: options =>
    new Promise((resolve, reject) => {
      authrequest
        .get('/api/commands')
        .query(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  read: id =>
    new Promise((resolve, reject) => {
      authrequest.get('/api/commands/' + id).end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  run: id =>
    new Promise((resolve, reject) => {
      authrequest.post('/api/commands/run/' + id).end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  update: (id, options) =>
    new Promise((resolve, reject) => {
      authrequest
        .put('/api/commands/' + id)
        .send(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
};

export default Commands;
