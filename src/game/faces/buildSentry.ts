import * as THREE from 'three';
import { makeMaterial, makeMetalMaterial, makeRoundedBoxGeometry } from './materials';

export function buildSentryFace(): THREE.Group {
  const group = new THREE.Group();
  const coral = makeMaterial('#FF8A80');
  const dark = makeMaterial('#0F1629');
  const metal = makeMetalMaterial();
  const white = makeMaterial('#ffffff');
  const orange = makeMaterial('#fb923c');

  // Head — rounded box
  const head = new THREE.Mesh(
    makeRoundedBoxGeometry(1.7, 1.0, 1.0, 0.18),
    coral,
  );
  group.add(head);

  // Hard hat dome
  const hatDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    orange,
  );
  hatDome.position.set(0, 0.5, 0);
  hatDome.name = 'hardHat';
  group.add(hatDome);

  // Hat brim
  const hatBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.65, 0.06, 16),
    orange,
  );
  hatBrim.position.set(0, 0.5, 0);
  hatBrim.name = 'hatBrim';
  group.add(hatBrim);

  // Hat stripe
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.05, 0.6),
    makeMaterial('#fbbf24'),
  );
  stripe.position.set(0, 0.55, 0);
  group.add(stripe);

  // Eye sockets
  const eyeGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.25, 16);
  eyeGeom.rotateX(Math.PI / 2);

  const leftSocket = new THREE.Mesh(eyeGeom, metal);
  leftSocket.position.set(-0.38, 0.05, 0.5);
  group.add(leftSocket);

  const rightSocket = new THREE.Mesh(eyeGeom.clone(), metal);
  rightSocket.position.set(0.38, 0.05, 0.5);
  group.add(rightSocket);

  // Eyeballs
  const leftEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 12),
    dark,
  );
  leftEye.position.set(-0.38, 0.05, 0.55);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 12),
    dark,
  );
  rightEye.position.set(0.38, 0.05, 0.55);
  group.add(rightEye);

  // Pupils
  const leftPupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 8, 8),
    white,
  );
  leftPupil.position.set(-0.38, 0.07, 0.66);
  leftPupil.name = 'leftPupil';
  group.add(leftPupil);

  const rightPupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 8, 8),
    white,
  );
  rightPupil.position.set(0.38, 0.07, 0.66);
  rightPupil.name = 'rightPupil';
  group.add(rightPupil);

  // Eyebrows
  const browGeom = new THREE.BoxGeometry(0.25, 0.04, 0.05);

  const leftBrow = new THREE.Mesh(browGeom, dark);
  leftBrow.position.set(-0.38, 0.25, 0.55);
  leftBrow.rotation.z = 0.2;
  leftBrow.name = 'leftBrow';
  group.add(leftBrow);

  const rightBrow = new THREE.Mesh(browGeom.clone(), dark);
  rightBrow.position.set(0.38, 0.25, 0.55);
  rightBrow.rotation.z = -0.2;
  rightBrow.name = 'rightBrow';
  group.add(rightBrow);

  // Mouth
  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.04, 0.05),
    dark,
  );
  mouth.position.set(0, -0.22, 0.52);
  mouth.name = 'mouth';
  group.add(mouth);

  return group;
}
