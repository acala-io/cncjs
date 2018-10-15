import ensureArray from 'ensure-array';
import { trim, includes, get, set } from 'lodash';
import {GRBL_MODAL_GROUPS} from './constants';

class GrblLineParserResultParserState {
  // * Grbl v0.9
  //   [G38.2 G54 G17 G21 G91 G94 M0 M5 M9 T0 F20. S0.]
  // * Grbl v1.1
  //   [GC:G0 G54 G17 G21 G90 G94 M0 M5 M9 T0 S0.0 F500.0]
  static parse(line) {
    const r = line.match(/^\[(?:GC:)?((?:[a-zA-Z][0-9]+(?:\.[0-9]*)?\s*)+)\]$/);
    if (!r) {
      return null;
    }

    const payload = {};
    const words = _(r[1].split(' '))
      .compact()
      .map(word => {
        return trim(word);
      })
      .value();

    for (let i = 0; i < words.length; ++i) {
      const word = words[i];

      // Gx, Mx
      if (word.indexOf('G') === 0 || word.indexOf('M') === 0) {
        const modalGroup = GRBL_MODAL_GROUPS.find(group => includes(group.modes, word));

        if (!modalGroup) {
          continue;
        }

        const prevWord = get(payload, `modal.${modalGroup.group}`, '');
        if (prevWord) {
          set(payload, `modal.${modalGroup.group}`, ensureArray(prevWord).concat(word));
        } else {
          set(payload, `modal.${modalGroup.group}`, word);
        }

        continue;
      }

      // T: tool number
      if (word.indexOf('T') === 0) {
        set(payload, 'tool', word.substring(1));
        continue;
      }

      // F: feed rate
      if (word.indexOf('F') === 0) {
        set(payload, 'feedrate', word.substring(1));
        continue;
      }

      // S: spindle speed
      if (word.indexOf('S') === 0) {
        set(payload, 'spindle', word.substring(1));
        continue;
      }
    }

    return {
      payload,
      type: GrblLineParserResultParserState,
    };
  }
}

export default GrblLineParserResultParserState;
