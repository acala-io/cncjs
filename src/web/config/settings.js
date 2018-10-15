import endsWith from 'lodash/endsWith';
import mapKeys from 'lodash/mapKeys';
import sha1 from 'sha1';

import log from '../lib/log';

import pkg from '../../package.json';

const webroot = '/';
const {name, productName, version} = pkg;

const settings = {
  analytics: {
    trackingId: process.env.TRACKING_ID,
  },
  error: {
    corruptedWorkspaceSettings: false,
  },
  i18next: {
    // https://github.com/i18next/i18next-xhr-backend
    backend: {
      addPath: 'api/i18n/sendMissing/{{lng}}/{{ns}}',
      allowMultiLoading: false,
      crossDomain: false,
      loadPath: `${webroot}i18n/{{lng}}/{{ns}}.json`,
      parse(data, url) {
        log.debug(`Loading resource: url="${url}"`);

        if (endsWith(url, '/gcode.json') || endsWith(url, '/resource.json')) {
          return mapKeys(JSON.parse(data), (value, key) => sha1(key));
        }

        return JSON.parse(data);
      },
    },
    debug: false,
    defaultNS: 'resource',
    // https://github.com/i18next/i18next-browser-languageDetector
    detection: {
      caches: ['localStorage', 'cookie'],
      lookupCookie: 'lang',
      lookupLocalStorage: 'lang',
      lookupQuerystring: 'lang',
      // order and from where user language should be detected
      order: ['querystring', 'cookie', 'localStorage'],
    },
    fallbackLng: 'en',
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
    keySeparator: '.',
    load: 'currentOnly',
    lowerCaseLng: true,
    ns: [
      'controller', // Grbl|Smoothie|TinyG
      'gcode',
      'resource',
    ],
    nsSeparator: ':',
    preload: [],
    whitelist: process.env.LANGUAGES, // see webpack.webconfig.xxx.js
  },
  log: {
    level: 'warn',
  },
  name,
  productName,
  version,
  webroot,
};

export default settings;
