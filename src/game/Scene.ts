import * as THREE from 'three';

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1a1a2e');

  // Ambient light - warm white
  const ambient = new THREE.AmbientLight(0xfff5e6, 0.4);
  scene.add(ambient);

  // Directional light - soft shadows from top-left
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(-5, 10, 5);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 2048;
  directional.shadow.mapSize.height = 2048;
  directional.shadow.camera.near = 0.5;
  directional.shadow.camera.far = 50;
  directional.shadow.camera.left = -10;
  directional.shadow.camera.right = 10;
  directional.shadow.camera.top = 10;
  directional.shadow.camera.bottom = -10;
  scene.add(directional);

  return scene;
}
