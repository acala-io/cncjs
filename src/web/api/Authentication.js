import authrequest from './authrequest';

export const signin = options =>
  new Promise((resolve, reject) => {
    const {name, password, token} = {...options};

    authrequest
      .post('/api/signin')
      .send({name, password, token})
      .end((err, res) => (err ? reject(res) : resolve(res)));
  });
