import * as THREE from 'three';

class GridLine {
  group = new THREE.Object3D();

  colorCenterLine = new THREE.Color(0x444444);
  colorGrid = new THREE.Color(0x888888);

  // eslint-disable-next-line max-params
  constructor(sizeX, stepX, sizeY, stepY, colorCenterLine, colorGrid) {
    let localSizeY = sizeY;
    let localStepY = stepY;
    let localColorCenterLine = colorCenterLine;
    let localColorGrid = colorGrid;
    localColorCenterLine = new THREE.Color(localColorCenterLine) || this.colorCenterLine;
    localColorGrid = new THREE.Color(localColorGrid) || this.colorGrid;

    localSizeY = typeof localSizeY === 'undefined' ? sizeX : localSizeY;
    localStepY = typeof localStepY === 'undefined' ? stepX : localStepY;

    for (let i = -1 * sizeX; i <= sizeX; i += stepX) {
      const geometry = new THREE.Geometry();
      const material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors,
      });
      const color = i === 0 ? localColorCenterLine : localColorGrid;

      geometry.vertices.push(new THREE.Vector3(-sizeX, i, 0), new THREE.Vector3(sizeX, i, 0));
      geometry.colors.push(color, color);

      this.group.add(new THREE.Line(geometry, material));
    }

    for (let i = -1 * localSizeY; i <= localSizeY; i += localStepY) {
      const geometry = new THREE.Geometry();
      const material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors,
      });
      const color = i === 0 ? localColorCenterLine : localColorGrid;

      geometry.vertices.push(new THREE.Vector3(i, -localSizeY, 0), new THREE.Vector3(i, localSizeY, 0));
      geometry.colors.push(color, color);

      this.group.add(new THREE.Line(geometry, material));
    }

    return this.group;
  }
}

export default GridLine;
