import {get} from 'lodash';

class TinyGLineParserResultStatusReports {
  static parse(data) {
    const sr = get(data, 'r.sr') || get(data, 'sr');
    if (!sr) {
      return null;
    }

    const payload = {
      sr,
    };

    return {
      type: TinyGLineParserResultStatusReports,
      payload,
    };
  }
}

export default TinyGLineParserResultStatusReports;
