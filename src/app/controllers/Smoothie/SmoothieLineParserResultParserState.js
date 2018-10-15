import ensureArray from 'ensure-array';
import {get, includes, set, trim} from 'lodash';

import {SMOOTHIE_MODAL_GROUPS} from './constants';

class SmoothieLineParserResultParserState {
  // [G38.2 G54 G17 G21 G91 G94 M0 M5 M9 T0 F20. S0.]
  static parse(line) {
    const r = line.match(/^\[((?:[a-zA-Z][0-9]+(?:\.[0-9]*)?\s*)+)\]$/);
    if (!r) {
      return null;
    }

    const payload = {};
    const words = r[1]
      .split(' ')
      .filter(Boolean)
      .map(word => trim(word));

    for (let i = 0; i < words.length; ++i) {
      const word = words[i];

      // Gx, Mx
      if (word.indexOf('G') === 0 || word.indexOf('M') === 0) {
        const r = SMOOTHIE_MODAL_GROUPS.find(group => {
          return includes(group.modes, word);
        });

        if (!r) {
          continue;
        }

        const prevWord = get(payload, `modal.${r.group}`, '');
        if (prevWord) {
          set(payload, `modal.${r.group}`, ensureArray(prevWord).concat(word));
        } else {
          set(payload, `modal.${r.group}`, word);
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
      type: SmoothieLineParserResultParserState,
      payload,
    };
  }
}

export default SmoothieLineParserResultParserState;
