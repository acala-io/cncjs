import {get} from 'lodash';

class TinyGLineParserResultMotorTimeout {
  static parse(data) {
    const mt = get(data, 'r.mt');
    if (typeof mt === 'undefined') {
      return null;
    }

    const footer = get(data, 'f') || [];
    const statusCode = footer[1];
    const payload = {};
    if (mt && statusCode === 0) {
      payload.mt = mt;
    }

    return {
      type: TinyGLineParserResultMotorTimeout,
      payload,
    };
  }
}

export default TinyGLineParserResultMotorTimeout;
