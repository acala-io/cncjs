import authrequest from './authrequest';

import store from '../store_old';

export const loadGCode = options =>
  new Promise((resolve, reject) => {
    const {ident = '', name = '', gcode = '', context = {}} = {...options};

    authrequest
      .post('/api/gcode')
      .send({
        context,
        gcode,
        ident,
        name,
      })
      .end((err, res) => (err ? reject(res) : resolve(res)));
  });

export const fetchGCode = options =>
  new Promise((resolve, reject) => {
    const {ident = ''} = {...options};

    authrequest
      .get('/api/gcode')
      .query({ident})
      .end((err, res) => (err ? reject(res) : resolve(res)));
  });

export const downloadGCode = options => {
  const {ident = ''} = {...options};

  const $form = document.createElement('form');
  $form.setAttribute('id', 'export');
  $form.setAttribute('method', 'POST');
  $form.setAttribute('enctype', 'multipart/form-data');
  $form.setAttribute('action', 'api/gcode/download');

  const $ident = document.createElement('input');
  $ident.setAttribute('name', 'ident');
  $ident.setAttribute('value', ident);

  const $token = document.createElement('input');
  $token.setAttribute('name', 'token');
  $token.setAttribute('value', store.get('session.token'));

  $form.appendChild($ident);
  $form.appendChild($token);

  document.body.append($form);
  $form.submit();
  document.body.removeChild($form);
};
