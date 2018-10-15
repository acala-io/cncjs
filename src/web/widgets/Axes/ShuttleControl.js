import _ from 'lodash';
import events from 'events';

const HERTZ_LIMIT = 60; // 60 items per second
const FLUSH_INTERVAL = 250; // milliseconds
const QUEUE_LENGTH = Math.floor(HERTZ_LIMIT / (1000 / FLUSH_INTERVAL));

const DEFAULT_FEEDRATE_MIN = 500;
const DEFAULT_FEEDRATE_MAX = 1500;
const DEFAULT_HERTZ = 10; // 10 times per second
const DEFAULT_OVERSHOOT = 1;

class ShuttleControl extends events.EventEmitter {
  zone = 0;
  axis = '';
  queue = [];
  timer = null;

  accumulate(zone = 0, {axis = '', distance = 1, feedrateMin, feedrateMax, hertz, overshoot}) {
    let localZone = zone;
    let localFeedrateMin = feedrateMin;
    let localFeedrateMax = feedrateMax;
    let localHertz = hertz;
    let localOvershoot = overshoot;
    localZone = Number(localZone) || 0;
    axis = String(axis).toUpperCase();
    localFeedrateMin = Number(localFeedrateMin) || DEFAULT_FEEDRATE_MIN;
    localFeedrateMax = Number(localFeedrateMax) || DEFAULT_FEEDRATE_MAX;
    localHertz = Number(localHertz) || DEFAULT_HERTZ;
    localOvershoot = Number(localOvershoot) || DEFAULT_OVERSHOOT;

    if (this.zone !== localZone || this.axis !== axis || this.queue.length >= QUEUE_LENGTH) {
      this.flush();
    }

    const zoneMax = 7; // Shuttle Zone +7/-7
    const zoneMin = 1; // Shuttle Zone +1/-1
    const direction = localZone < 0 ? -1 : 1;
    const feedrate =
      (localFeedrateMax - localFeedrateMin) * distance * ((Math.abs(localZone) - zoneMin) / (zoneMax - zoneMin)) + localFeedrateMin;
    const relativeDistance = (direction * localOvershoot * (feedrate / 60.0)) / localHertz;

    this.zone = localZone;
    this.axis = axis;
    this.queue.push({
      feedrate,
      relativeDistance,
    });

    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.flush();
      }, FLUSH_INTERVAL);
    }
  }

  clear() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.queue = [];
  }

  flush(callback) {
    if (this.queue.length === 0) {
      return;
    }

    const accumulatedResult = {
      axis: this.axis,
      feedrate: _.sumBy(this.queue, o => o.feedrate) / this.queue.length,
      relativeDistance: _.sumBy(this.queue, o => o.relativeDistance),
    };

    clearTimeout(this.timer);
    this.timer = null;
    this.queue = [];
    this.emit('flush', accumulatedResult);
    if (typeof callback === 'function') {
      callback(accumulatedResult);
    }
  }
}

export default ShuttleControl;
