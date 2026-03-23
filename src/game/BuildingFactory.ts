import * as THREE from 'three';
import type { BuildingType } from '../types';

const BUILDING_CONFIGS: Record<
  BuildingType,
  { color: number; height: number; details: (group: THREE.Group) => void }
> = {
  hospital: {
    color: 0x5ee8b0,
    height: 1.2,
    details: (group) => {
      // Cross on top
      const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.08, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xffffff }),
      );
      crossH.position.set(0, 1.24, 0);
      group.add(crossH);

      const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.08, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xffffff }),
      );
      crossV.position.set(0, 1.24, 0);
      group.add(crossV);

      // Window insets
      addWindows(group, 0x3cb88a, 1.2);
    },
  },
  library: {
    color: 0x67d4e8,
    height: 0.9,
    details: (group) => {
      // Glowing sphere beacon on roof
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0x67d4e8,
          emissive: 0x67d4e8,
          emissiveIntensity: 0.5,
        }),
      );
      sphere.position.set(0, 0.96, 0);
      group.add(sphere);

      addWindows(group, 0x4aabb8, 0.9);
    },
  },
  transit: {
    color: 0xa78bfa,
    height: 0.7,
    details: (group) => {
      // Cylinder pillars at corners
      const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x8b6fe0 });
      const offsets = [
        [-0.35, 0.35],
        [0.35, 0.35],
        [-0.35, -0.35],
        [0.35, -0.35],
      ];
      for (const [x, z] of offsets) {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, 0.85, z);
        group.add(pillar);
      }

      // Flat roof
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.05, 0.85),
        new THREE.MeshStandardMaterial({ color: 0x8b6fe0 }),
      );
      roof.position.set(0, 1.0, 0);
      group.add(roof);
    },
  },
  security: {
    color: 0xff8a80,
    height: 1.6,
    details: (group) => {
      // Tall narrow tower body override
      group.children[0].scale.set(0.7, 1, 0.7);

      // Cone beacon on top
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.25, 8),
        new THREE.MeshStandardMaterial({
          color: 0xff4444,
          emissive: 0xff4444,
          emissiveIntensity: 0.4,
        }),
      );
      cone.position.set(0, 1.72, 0);
      group.add(cone);

      // Point light for beacon glow
      const light = new THREE.PointLight(0xff4444, 0.5, 3);
      light.position.set(0, 1.8, 0);
      group.add(light);
    },
  },
};

function addWindows(
  group: THREE.Group,
  color: number,
  buildingHeight: number,
): void {
  const windowGeo = new THREE.BoxGeometry(0.15, 0.15, 0.02);
  const windowMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.3,
  });

  const yPos = buildingHeight * 0.4;
  const positions = [
    { x: -0.2, z: 0.46 },
    { x: 0.2, z: 0.46 },
    { x: -0.2, z: -0.46 },
    { x: 0.2, z: -0.46 },
  ];

  for (const pos of positions) {
    const win = new THREE.Mesh(windowGeo, windowMat);
    win.position.set(pos.x, yPos, pos.z);
    group.add(win);
  }
}

export function createBuildingMesh(
  type: BuildingType,
  col: number,
  row: number,
): THREE.Group {
  const config = BUILDING_CONFIGS[type];
  const group = new THREE.Group();

  // Main body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, config.height, 0.85),
    new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.3,
      metalness: 0.1,
    }),
  );
  body.position.y = config.height / 2 + 0.05;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Add building-specific details
  config.details(group);

  // Position on grid
  group.position.set(col, 0, row);
  group.userData = { type: 'building', buildingType: type, col, row };

  return group;
}
