import { get } from 'lodash';

// https://github.com/synthetos/TinyG/wiki/Power-Management
class TinyGLineParserResultPowerManagement {
  static parse(data) {
    const pwr = get(data, 'r.pwr');
    if (typeof pwr === 'undefined') {
      return null;
    }

    const footer = get(data, 'f') || [];
    const statusCode = footer[1];
    const payload = {};
    if (pwr && statusCode === 0) {
      payload.pwr = pwr;
    }

    return {
      type: TinyGLineParserResultPowerManagement,
      payload,
    };
  }
}

export default TinyGLineParserResultPowerManagement;
