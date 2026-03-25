import * as THREE from 'three';
import type { BuildingType } from '../types';

const BUILDING_CONFIGS: Record<
  BuildingType,
  { color: number; height: number; details: (group: THREE.Group) => void }
> = {
  hospital: {
    color: 0xe8e8f0,
    height: 1.2,
    details: (group) => {
      // Cross on top
      const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.08, 0.12),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 0.2,
        }),
      );
      crossH.position.set(0, 1.24, 0);
      crossH.userData.animate = 'pulse';
      group.add(crossH);

      const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.08, 0.4),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 0.2,
        }),
      );
      crossV.position.set(0, 1.24, 0);
      crossV.userData.animate = 'pulse';
      group.add(crossV);

      addWindows(group, 0xc0c0d0, 1.2);
    },
  },
  library: {
    color: 0x3b6b8c,
    height: 0.9,
    details: (group) => {
      // Glowing sphere beacon on roof
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0x4a8aaa,
          emissive: 0x4a8aaa,
          emissiveIntensity: 0.5,
        }),
      );
      sphere.position.set(0, 0.96, 0);
      sphere.userData.animate = 'float';
      sphere.userData.baseY = 0.96;
      group.add(sphere);

      addWindows(group, 0x2d5570, 0.9);
    },
  },
  transit: {
    color: 0x5c4b8a,
    height: 0.7,
    details: (group) => {
      // Cylinder pillars at corners
      const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4a3d70 });
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

      // Flat roof - slow rotation
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.05, 0.85),
        new THREE.MeshStandardMaterial({ color: 0x4a3d70 }),
      );
      roof.position.set(0, 1.0, 0);
      roof.userData.animate = 'rotate';
      group.add(roof);
    },
  },
  security: {
    color: 0x8b3a3a,
    height: 1.6,
    details: (group) => {
      // Tall narrow tower body override
      group.children[0].scale.set(0.7, 1, 0.7);

      // Cone beacon on top
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.25, 8),
        new THREE.MeshStandardMaterial({
          color: 0xaa2222,
          emissive: 0xaa2222,
          emissiveIntensity: 0.4,
        }),
      );
      cone.position.set(0, 1.72, 0);
      cone.userData.animate = 'float';
      cone.userData.baseY = 1.72;
      group.add(cone);

      // Point light for beacon glow
      const light = new THREE.PointLight(0xaa2222, 0.5, 3);
      light.position.set(0, 1.8, 0);
      light.userData.animate = 'light_pulse';
      light.userData.baseY = 1.8;
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
    const win = new THREE.Mesh(windowGeo, windowMat.clone());
    win.position.set(pos.x, yPos, pos.z);
    win.userData.animate = 'breathe';
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

/**
 * Animate all building idle effects. Call once per frame with elapsed time.
 */
export function animateBuildings(scene: THREE.Scene, time: number): void {
  scene.traverse((obj) => {
    const anim = obj.userData?.animate;
    if (!anim) return;

    switch (anim) {
      // Sine wave float on beacon lights (library sphere, security cone)
      case 'float': {
        const baseY = obj.userData.baseY as number;
        obj.position.y = baseY + Math.sin(time * 2) * 0.04;
        break;
      }

      // Gentle emissive pulse on hospital cross
      case 'pulse': {
        const mesh = obj as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.2 + Math.sin(time * 3) * 0.15;
        break;
      }

      // Slow Y rotation on transit roof
      case 'rotate': {
        obj.rotation.y = time * 0.3;
        break;
      }

      // Breathing window glow
      case 'breathe': {
        const mesh = obj as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.25 + Math.sin(time * 1.5 + obj.position.x * 5) * 0.15;
        break;
      }

      // Point light intensity pulse (security beacon)
      case 'light_pulse': {
        const light = obj as THREE.PointLight;
        light.intensity = 0.4 + Math.sin(time * 2) * 0.2;
        light.position.y = (obj.userData.baseY as number) + Math.sin(time * 2) * 0.04;
        break;
      }
    }
  });
}
