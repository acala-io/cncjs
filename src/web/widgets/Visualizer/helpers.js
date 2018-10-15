import * as THREE from 'three';

const getBoundingBox = object => {
  const box = new THREE.Box3().setFromObject(object);
  const boundingBox = {
    max: {
      x: box.max.x === -Infinity ? 0 : box.max.x,
      y: box.max.y === -Infinity ? 0 : box.max.y,
      z: box.max.z === -Infinity ? 0 : box.max.z,
    },
    min: {
      x: box.min.x === Infinity ? 0 : box.min.x,
      y: box.min.y === Infinity ? 0 : box.min.y,
      z: box.min.z === Infinity ? 0 : box.min.z,
    },
  };

  return boundingBox;
};

const loadTexture = (url, callback) => {
  let localCallback = callback;
  localCallback = localCallback || (() => {});

  const onLoad = texture => {
    localCallback(null, texture);
  };

  const onProgress = () => {
    // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  };

  const onError = () => {
    localCallback(new Error('Failed to load texture with the url ' + JSON.stringify(url)));
  };

  const loader = new THREE.TextureLoader();
  loader.load(url, onLoad, onProgress, onError);
};

export {getBoundingBox, loadTexture};
