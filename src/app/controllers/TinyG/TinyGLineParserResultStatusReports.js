import _ from 'lodash';

class TinyGLineParserResultStatusReports {
  static parse(data) {
    const sr = _.get(data, 'r.sr') || _.get(data, 'sr');
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
