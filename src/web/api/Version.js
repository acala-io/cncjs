import authrequest from './authrequest';

export const getLatestVersion = () =>
  new Promise((resolve, reject) => {
    authrequest.get('/api/version/latest').end((err, res) => (err ? reject(res) : resolve(res)));
  });
