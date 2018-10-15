import * as THREE from 'three';
import colornames from 'colornames';
import Toolpath from 'gcode-toolpath';

import log from '../../lib/log';

const defaultColor = new THREE.Color(colornames('lightgrey'));
const motionColor = {
  G0: new THREE.Color(colornames('green')),
  G1: new THREE.Color(colornames('blue')),
  G2: new THREE.Color(colornames('deepskyblue')),
  G3: new THREE.Color(colornames('deepskyblue')),
};

class GCodeVisualizer {
  constructor() {
    this.group = new THREE.Object3D();
    this.geometry = new THREE.Geometry();

    // Example
    // [
    //   {
    //     code: 'G1 X1',
    //     vertexIndex: 2
    //   }
    // ]
    this.frames = []; // Example
    this.frameIndex = 0;

    return this;
  }

  render(gcode) {
    const toolpath = new Toolpath({
      // @param {object} modal The modal object.
      // @param {object} v1 A 3D vector of the start point.
      // @param {object} v2 A 3D vector of the end point.
      addLine: (modal, v1, v2) => {
        const {motion} = modal;
        const color = motionColor[motion] || defaultColor;
        this.geometry.vertices.push(new THREE.Vector3(v2.x, v2.y, v2.z));
        this.geometry.colors.push(color);
      },
      // @param {object} modal The modal object.
      // @param {object} v1 A 3D vector of the start point.
      // @param {object} v2 A 3D vector of the end point.
      // @param {object} v0 A 3D vector of the fixed point.
      addArcCurve: (modal, v1, v2, v0) => {
        const {motion, plane} = modal;
        const isClockwise = motion === 'G2';
        const radius = Math.sqrt((v1.x - v0.x) ** 2 + (v1.y - v0.y) ** 2);
        const startAngle = Math.atan2(v1.y - v0.y, v1.x - v0.x);
        let endAngle = Math.atan2(v2.y - v0.y, v2.x - v0.x);

        // Draw full circle if startAngle and endAngle are both zero
        if (startAngle === endAngle) {
          endAngle += 2 * Math.PI;
        }

        const arcCurve = new THREE.ArcCurve(
          v0.x, // aX
          v0.y, // aY
          radius, // aRadius
          startAngle, // aStartAngle
          endAngle, // aEndAngle
          isClockwise // isClockwise
        );
        const divisions = 30;
        const points = arcCurve.getPoints(divisions);
        const color = motionColor[motion] || defaultColor;

        for (let i = 0; i < points.length; ++i) {
          const point = points[i];
          const z = ((v2.z - v1.z) / points.length) * i + v1.z;

          if (plane === 'G17') {
            // XY-plane
            this.geometry.vertices.push(new THREE.Vector3(point.x, point.y, z));
          } else if (plane === 'G18') {
            // ZX-plane
            this.geometry.vertices.push(new THREE.Vector3(point.y, z, point.x));
          } else if (plane === 'G19') {
            // YZ-plane
            this.geometry.vertices.push(new THREE.Vector3(z, point.x, point.y));
          }
          this.geometry.colors.push(color);
        }
      },
    });

    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
      child.geometry.dispose();
    }

    toolpath.loadFromStringSync(gcode, line => {
      this.frames.push({
        data: line,
        vertexIndex: this.geometry.vertices.length, // remember current vertex index
      });
    });

    const workpiece = new THREE.Line(
      new THREE.Geometry(),
      new THREE.LineBasicMaterial({
        color: defaultColor,
        linewidth: 1,
        opacity: 0.5,
        transparent: true,
        vertexColors: THREE.VertexColors,
      })
    );
    workpiece.geometry.vertices = this.geometry.vertices.slice();
    workpiece.geometry.colors = this.geometry.colors.slice();

    this.group.add(workpiece);

    log.debug({
      frameIndex: this.frameIndex,
      frames: this.frames,
      workpiece: workpiece,
    });

    return this.group;
  }

  setFrameIndex(frameIndex) {
    let localFrameIndex = frameIndex;
    if (this.frames.length === 0) {
      return;
    }

    localFrameIndex = Math.min(localFrameIndex, this.frames.length - 1);
    localFrameIndex = Math.max(localFrameIndex, 0);

    const v1 = this.frames[this.frameIndex].vertexIndex;
    const v2 = this.frames[localFrameIndex].vertexIndex;

    // Completed path is grayed out
    if (v1 < v2) {
      const workpiece = this.group.children[0];
      for (let i = v1; i < v2; ++i) {
        workpiece.geometry.colors[i] = defaultColor;
      }
      workpiece.geometry.colorsNeedUpdate = true;
    }

    // Restore the path to its original colors
    if (v2 < v1) {
      const workpiece = this.group.children[0];
      for (let i = v2; i < v1; ++i) {
        workpiece.geometry.colors[i] = this.geometry.colors[i];
      }
      workpiece.geometry.colorsNeedUpdate = true;
    }

    this.frameIndex = localFrameIndex;
  }
}

export default GCodeVisualizer;
