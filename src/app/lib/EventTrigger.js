import {noop} from 'lodash';

import config from '../services/configstore';

class EventTrigger {
  constructor(callback = noop) {
    this.callback = callback || noop;
  }

  trigger(eventKey) {
    if (!eventKey) {
      return;
    }

    const events = config.get('events', []);

    events.filter(event => event && event.event === eventKey).forEach(options => {
      const {commands, enabled = false, event, trigger} = {...options};

      if (!enabled) {
        return;
      }

      if (typeof this.callback === 'function') {
        this.callback(event, trigger, commands);
      }
    });
  }
}

export default EventTrigger;
