import {defaults, noop} from 'lodash';

export default class PivotPoint3 {
  // @param {object} options The options object
  // @param {number} [options.x] The pivot point on the x-axis
  // @param {number} [options.y] The pivot point on the y-axis
  // @param {number} [options.z] The pivot point on the z-axis
  // @param callback {function} The callback function
  constructor(options, callback = noop) {
    let localOptions = options;
    localOptions = defaults({}, localOptions, {x: 0, y: 0, z: 0});

    localOptions.x = Number(localOptions.x) || 0;
    localOptions.y = Number(localOptions.y) || 0;
    localOptions.z = Number(localOptions.z) || 0;

    this.pivotPoint = {x: 0, y: 0, z: 0};
    this.callback = callback;

    this.set(localOptions.x, localOptions.y, localOptions.z);
  }
  // Sets a new pivot point to rotate objects
  // @param {number} x The pivot point on the x-axis
  // @param {number} y The pivot point on the y-axis
  // @param {number} z The pivot point on the z-axis
  set(x, y, z) {
    let localX = x;
    let localY = y;
    let localZ = z;
    const {pivotPoint} = this;

    localX = Number(localX) || 0;
    localY = Number(localY) || 0;
    localZ = Number(localZ) || 0;

    // Pass relative position to the callback
    this.callback(-(localX - pivotPoint.x), -(localY - pivotPoint.y), -(localZ - pivotPoint.z));

    this.pivotPoint = {x: localX, y: localY, z: localZ};
  }
  // Gets the pivot point
  // @return {object} The { x, y, z } position of the pivot point
  get() {
    return this.pivotPoint;
  }
  // Sets the pivot point to the origin point (0, 0, 0)
  clear() {
    const {pivotPoint} = this;

    this.callback(pivotPoint.x, pivotPoint.y, pivotPoint.z);

    this.pivotPoint = {x: 0, y: 0, z: 0};
  }
}
