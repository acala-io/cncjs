import authrequest from './authrequest';

const Watch = {
  getFiles: options =>
    new Promise((resolve, reject) => {
      const {path} = {...options};

      authrequest
        .post('/api/watch/files')
        .send({path})
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
  readFile: options =>
    new Promise((resolve, reject) => {
      const {file} = {...options};

      authrequest
        .post('/api/watch/file')
        .send({file})
        .end((err, res) => (err ? reject(res) : resolve(res)));
    }),
};

export default Watch;
