import {get} from 'lodash';

class TinyGLineParserResultReceiveReports {
  static parse(data) {
    const r = get(data, 'r.r') || get(data, 'r');
    if (!r) {
      return null;
    }

    const payload = {
      r,
    };

    return {
      type: TinyGLineParserResultReceiveReports,
      payload,
    };
  }
}

export default TinyGLineParserResultReceiveReports;
