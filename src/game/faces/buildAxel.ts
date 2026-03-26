import * as THREE from 'three';
import { makeMaterial, makeMetalMaterial, makeRoundedBoxGeometry } from './materials';

export function buildAxelFace(): THREE.Group {
  const group = new THREE.Group();
  const mint = makeMaterial('#5EE8B0');
  const dark = makeMaterial('#0F1629');
  const metal = makeMetalMaterial();
  const white = makeMaterial('#ffffff');

  // Head — rounded box
  const head = new THREE.Mesh(
    makeRoundedBoxGeometry(1.6, 1.1, 1.0, 0.18),
    mint,
  );
  group.add(head);

  // Eye sockets
  const eyeGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.3, 16);
  eyeGeom.rotateX(Math.PI / 2);

  const leftSocket = new THREE.Mesh(eyeGeom, metal);
  leftSocket.position.set(-0.35, 0.1, 0.5);
  group.add(leftSocket);

  const rightSocket = new THREE.Mesh(eyeGeom.clone(), metal);
  rightSocket.position.set(0.35, 0.1, 0.5);
  group.add(rightSocket);

  // Eyeballs
  const eyeballGeom = new THREE.SphereGeometry(0.16, 16, 16);

  const leftEye = new THREE.Mesh(eyeballGeom, dark);
  leftEye.position.set(-0.35, 0.1, 0.55);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeballGeom.clone(), dark);
  rightEye.position.set(0.35, 0.1, 0.55);
  group.add(rightEye);

  // Pupils
  const pupilGeom = new THREE.SphereGeometry(0.06, 8, 8);

  const leftPupil = new THREE.Mesh(pupilGeom, white);
  leftPupil.position.set(-0.35, 0.12, 0.68);
  leftPupil.name = 'leftPupil';
  group.add(leftPupil);

  const rightPupil = new THREE.Mesh(pupilGeom.clone(), white);
  rightPupil.position.set(0.35, 0.12, 0.68);
  rightPupil.name = 'rightPupil';
  group.add(rightPupil);

  // Antenna
  const antennaStick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8),
    metal,
  );
  antennaStick.position.set(0, 0.72, 0);
  group.add(antennaStick);

  const antennaBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 12),
    makeMaterial('#5EE8B0'),
  );
  antennaBall.position.set(0, 0.95, 0);
  antennaBall.name = 'antennaBall';
  group.add(antennaBall);

  // Mouth
  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.04, 0.05),
    dark,
  );
  mouth.position.set(0, -0.22, 0.52);
  mouth.name = 'mouth';
  group.add(mouth);

  return group;
}
