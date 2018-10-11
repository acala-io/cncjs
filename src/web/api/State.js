import authrequest from './authrequest';

export const getState = options =>
  new Promise((resolve, reject) => {
    const {key} = {...options};

    authrequest
      .get('/api/state')
      .query({key})
      .end((err, res) => (err ? reject(res) : resolve(res)));
  });

export const setState = options =>
  new Promise((resolve, reject) => {
    const data = {...options};

    authrequest
      .post('/api/state')
      .send(data)
      .end((err, res) => (err ? reject(res) : resolve(res)));
  });

export const unsetState = options =>
  new Promise((resolve, reject) => {
    const {key} = {...options};

    authrequest
      .delete('/api/state')
      .query({key})
      .end((err, res) => (err ? reject(res) : resolve(res)));
  });
