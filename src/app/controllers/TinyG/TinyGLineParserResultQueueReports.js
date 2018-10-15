import {get} from 'lodash';

class TinyGLineParserResultQueueReports {
  static parse(data) {
    const qr = get(data, 'r.qr') || get(data, 'qr');
    const qi = get(data, 'r.qi') || get(data, 'qi');
    const qo = get(data, 'r.qo') || get(data, 'qo');

    if (!qr) {
      return null;
    }

    const payload = {
      qr: Number(qr) || 0,
      qi: Number(qi) || 0,
      qo: Number(qo) || 0,
    };

    return {
      type: TinyGLineParserResultQueueReports,
      payload,
    };
  }
}

export default TinyGLineParserResultQueueReports;
