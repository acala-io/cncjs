import authrequest from './authrequest';

const Events = {
  create: options =>
    new Promise((resolve, reject) => {
      authrequest
        .post('/api/events')
        .send(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  delete: id =>
    new Promise((resolve, reject) => {
      authrequest.delete(`/api/events/${id}`).end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  fetch: options =>
    new Promise((resolve, reject) => {
      authrequest
        .get('/api/events')
        .query(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  read: id =>
    new Promise((resolve, reject) => {
      authrequest.get(`/api/events/${id}`).end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  update: (id, options) =>
    new Promise((resolve, reject) => {
      authrequest
        .put(`/api/events/${id}`)
        .send(options)
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
};

export default Events;
