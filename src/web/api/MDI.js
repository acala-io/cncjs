import authrequest from './authrequest';

const MDI = {
  bulkUpdate: options =>
    new Promise((resolve, reject) => {
      authrequest
        .put('/api/mdi/')
        .send(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  create: options =>
    new Promise((resolve, reject) => {
      authrequest
        .post('/api/mdi')
        .send(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  delete: id =>
    new Promise((resolve, reject) => {
      authrequest.delete(`/api/mdi/${id}`).end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  fetch: options =>
    new Promise((resolve, reject) => {
      authrequest
        .get('/api/mdi')
        .query(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  read: id =>
    new Promise((resolve, reject) => {
      authrequest.get(`/api/mdi/${id}`).end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  update: (id, options) =>
    new Promise((resolve, reject) => {
      authrequest
        .put(`/api/mdi/${id}`)
        .send(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
};

export default MDI;
