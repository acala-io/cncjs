import authrequest from './authrequest';

const Controllers = {
  get: () =>
    new Promise((resolve, reject) => {
      authrequest.get('/api/controllers').end((err, res) => (err ? reject(res) : resolve(res)));
    }),
};

export default Controllers;
