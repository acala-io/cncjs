/* eslint no-console: 0 */
/* eslint strict: 0 */
const chalk = require('chalk');
const fs = require('fs');
const languages = require('./build.config').languages;

module.exports = {
  options: {
    debug: false,
    sort: false,
    func: {
      list: ['i18n.t', 't'],
      extensions: ['.js', '.jsx'],
    },
    lngs: languages,
    defaultValue: '__L10N__', // to indicate that a default value has not been defined for the key
    ns: [
      'resource', // default
    ],
    defaultNs: 'resource',
    resource: {
      loadPath: 'src/app/i18n/{{lng}}/{{ns}}.json',
      savePath: 'src/app/i18n/{{lng}}/{{ns}}.json', // or 'src/app/i18n/${lng}/${ns}.saveAll.json'
      jsonIndent: 4,
    },
    nsSeparator: ':', // namespace separator
    keySeparator: '.', // key separator
    pluralSeparator: '_', // plural separator
    contextSeparator: '_', // context separator
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
  transform: function(file, enc, done) {
    'use strict';

    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    let count = 0;

    parser.parseFuncFromString(content, {list: ['i18n._', 'i18n.__']}, (key, options) => {
      parser.set(
        key,
        Object.assign({}, options, {
          nsSeparator: false,
          keySeparator: false,
        })
      );
      ++count;
    });

    if (count > 0) {
      console.log(
        `[i18next-scanner] transform: count=${chalk.cyan(count)}, file=${chalk.yellow(JSON.stringify(file.relative))}`
      );
    }

    done();
  },
};
