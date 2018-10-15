import events from 'events';

class Feeder extends events.EventEmitter {
  state = {
    changed: false,
    hold: false,
    holdReason: null,
    pending: false,
    queue: [],
  };

  dataFilter = null;

  // @param {object} [options] The options object.
  // @param {function} [options.dataFilter] A function to be used to handle the data. The function accepts two arguments: The data to be sent to the controller, and the context.
  constructor(options) {
    super();

    if (typeof options.dataFilter === 'function') {
      this.dataFilter = options.dataFilter;
    }

    this.on('change', () => {
      this.state.changed = true;
    });
  }

  toJSON() {
    return {
      changed: this.state.changed,
      hold: this.state.hold,
      holdReason: this.state.holdReason,
      pending: this.state.pending,
      queue: this.state.queue.length,
    };
  }

  feed(data = [], context = {}) {
    let localData = data;
    localData = [].concat(localData);

    if (localData.length > 0) {
      this.state.queue = this.state.queue.concat(
        localData.map(command => {
          return {command: command, context: context};
        })
      );

      this.emit('change');
    }
  }

  hold(reason) {
    if (this.state.hold) {
      return;
    }

    this.state.hold = true;
    this.state.holdReason = reason;

    this.emit('hold');
    this.emit('change');
  }

  unhold() {
    if (!this.state.hold) {
      return;
    }

    this.state.hold = false;
    this.state.holdReason = null;

    this.emit('unhold');
    this.emit('change');
  }

  clear() {
    this.state.queue = [];
    this.state.pending = false;

    this.emit('change');
  }

  reset() {
    this.state.hold = false;
    this.state.holdReason = null;
    this.state.queue = [];
    this.state.pending = false;

    this.emit('change');
  }

  size() {
    return this.state.queue.length;
  }

  next() {
    if (this.state.queue.length === 0) {
      this.state.pending = false;
      return false;
    }

    while (!this.state.hold && this.state.queue.length > 0) {
      const {context} = this.state.queue.shift();
      let {command} = this.state.queue.shift();

      if (this.dataFilter) {
        command = this.dataFilter(command, context) || '';
        if (!command) {
          continue;
        }
      }

      this.state.pending = true;

      this.emit('data', command, context);
      this.emit('change');

      break;
    }

    return this.state.pending;
  }

  isPending() {
    return this.state.pending;
  }

  // Returns true if any state have changes
  peek() {
    const changed = this.state.changed;

    this.state.changed = false;

    return changed;
  }
}

export default Feeder;
