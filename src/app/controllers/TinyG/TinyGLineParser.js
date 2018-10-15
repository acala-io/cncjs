import { set } from 'lodash';
import TinyGLineParserResultMotorTimeout from './TinyGLineParserResultMotorTimeout';
import TinyGLineParserResultPowerManagement from './TinyGLineParserResultPowerManagement';
import TinyGLineParserResultQueueReports from './TinyGLineParserResultQueueReports';
import TinyGLineParserResultStatusReports from './TinyGLineParserResultStatusReports';
import TinyGLineParserResultSystemSettings from './TinyGLineParserResultSystemSettings';
import TinyGLineParserResultOverrides from './TinyGLineParserResultOverrides';
import TinyGLineParserResultReceiveReports from './TinyGLineParserResultReceiveReports';

class TinyGLineParser {
  parse(data) {
    const parsers = [
      TinyGLineParserResultMotorTimeout,
      TinyGLineParserResultPowerManagement,
      TinyGLineParserResultQueueReports,
      TinyGLineParserResultStatusReports,
      TinyGLineParserResultSystemSettings,
      TinyGLineParserResultOverrides,
      TinyGLineParserResultReceiveReports,
    ];

    for (const parser of parsers) {
      const result = parser.parse(data);
      if (result) {
        set(result, 'payload.raw', data);
        set(result, 'payload.f', data.f || []); // footer
        return result;
      }
    }

    return {
      type: null,
      payload: {
        raw: data,
        f: data.f || [], // footer
      },
    };
  }
}

export default TinyGLineParser;
