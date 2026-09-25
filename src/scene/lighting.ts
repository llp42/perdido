import * as THREE from 'three';

export function setupLighting(scene: THREE.Scene): void {
  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.7);
  directional.position.set(10, 20, 10);
  directional.castShadow = false;
  scene.add(directional);
}
