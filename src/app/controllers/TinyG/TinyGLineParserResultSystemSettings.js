import {get} from 'lodash';

// https://github.com/synthetos/g2/wiki/Text-Mode#displaying-settings-and-groups
class TinyGLineParserResultSystemSettings {
  static parse(data) {
    const sys = get(data, 'r.sys') || get(data, 'sys');
    if (!sys) {
      return null;
    }

    const payload = {
      sys,
    };

    return {
      type: TinyGLineParserResultSystemSettings,
      payload,
    };
  }
}

export default TinyGLineParserResultSystemSettings;
