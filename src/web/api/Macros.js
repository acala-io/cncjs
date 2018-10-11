import authrequest from './authrequest';

const Macros = {
  create: options =>
    new Promise((resolve, reject) => {
      authrequest
        .post('/api/macros')
        .send(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  delete: id =>
    new Promise((resolve, reject) => {
      authrequest.delete('/api/macros/' + id).end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  fetch: options =>
    new Promise((resolve, reject) => {
      authrequest
        .get('/api/macros')
        .query(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  read: id =>
    new Promise((resolve, reject) => {
      authrequest.get('/api/macros/' + id).end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  update: (id, options) =>
    new Promise((resolve, reject) => {
      authrequest
        .put('/api/macros/' + id)
        .send(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
};

export default Macros;
