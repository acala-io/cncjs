import _ from 'lodash';

class TinyGLineParserResultReceiveReports {
  static parse(data) {
    const r = _.get(data, 'r.r') || _.get(data, 'r');
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
