import * as THREE from 'three';
import { makeMaterial, makeMetalMaterial, makeRoundedBoxGeometry } from './materials';

export function buildRueFace(): THREE.Group {
  const group = new THREE.Group();
  const cyan = makeMaterial('#67D4E8');
  const dark = makeMaterial('#0F1629');
  const metal = makeMetalMaterial();
  const white = makeMaterial('#ffffff');
  const glow = makeMaterial('#a5f3fc');

  // Head — rounded box
  const head = new THREE.Mesh(
    makeRoundedBoxGeometry(1.4, 1.1, 0.9, 0.18),
    cyan,
  );
  group.add(head);

  // Big eye (left) — magnifier style
  const bigEyeGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16);
  bigEyeGeom.rotateX(Math.PI / 2);
  const bigSocket = new THREE.Mesh(bigEyeGeom, metal);
  bigSocket.position.set(-0.3, 0.1, 0.45);
  group.add(bigSocket);

  // Magnifier bezel
  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.04, 8, 24),
    metal,
  );
  bezel.position.set(-0.3, 0.1, 0.6);
  group.add(bezel);

  const bigEyeball = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 16),
    dark,
  );
  bigEyeball.position.set(-0.3, 0.1, 0.5);
  group.add(bigEyeball);

  const bigPupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    white,
  );
  bigPupil.position.set(-0.3, 0.12, 0.65);
  bigPupil.name = 'leftPupil';
  group.add(bigPupil);

  // Small eye (right)
  const smallEyeGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 12);
  smallEyeGeom.rotateX(Math.PI / 2);
  const smallSocket = new THREE.Mesh(smallEyeGeom, metal);
  smallSocket.position.set(0.35, 0.0, 0.45);
  group.add(smallSocket);

  const smallEyeball = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 12),
    dark,
  );
  smallEyeball.position.set(0.35, 0.0, 0.5);
  group.add(smallEyeball);

  const smallPupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    white,
  );
  smallPupil.position.set(0.35, 0.02, 0.58);
  smallPupil.name = 'rightPupil';
  group.add(smallPupil);

  // Antenna cone
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.25, 8),
    metal,
  );
  cone.position.set(0.1, 0.75, 0);
  group.add(cone);

  // Orbiting ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.015, 8, 24),
    glow,
  );
  ring.position.set(0.1, 0.82, 0);
  ring.rotation.x = Math.PI / 4;
  ring.name = 'antennaRing';
  group.add(ring);

  // Data particles
  for (let i = 0; i < 3; i++) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      glow,
    );
    particle.name = `dataParticle${i}`;
    group.add(particle);
  }

  // Mouth
  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.04, 0.05),
    dark,
  );
  mouth.position.set(0, -0.25, 0.47);
  mouth.name = 'mouth';
  group.add(mouth);

  return group;
}
