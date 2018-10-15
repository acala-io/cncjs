import {trim} from 'lodash';

class GrblLineParserResultSettings {
  static parse(line) {
    const r = line.match(/^(\$[^=]+)=([^ ]*)\s*(.*)/);
    if (!r) {
      return null;
    }

    const payload = {
      message: trim(r[3], '()'),
      name: r[1],
      value: r[2],
    };

    return {
      payload,
      type: GrblLineParserResultSettings,
    };
  }
}

export default GrblLineParserResultSettings;
