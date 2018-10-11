import authrequest from './authrequest';

const users = {
  create: options =>
    new Promise((resolve, reject) => {
      authrequest
        .post('/api/users')
        .send(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  delete: id =>
    new Promise((resolve, reject) => {
      authrequest.delete('/api/users/' + id).end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  fetch: options =>
    new Promise((resolve, reject) => {
      authrequest
        .get('/api/users')
        .query(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  read: id =>
    new Promise((resolve, reject) => {
      authrequest.get('/api/users/' + id).end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  update: (id, options) =>
    new Promise((resolve, reject) => {
      authrequest
        .put('/api/users/' + id)
        .send(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
};

export default users;
