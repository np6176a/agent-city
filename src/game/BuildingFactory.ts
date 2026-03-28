import * as THREE from 'three';
import type { BuildingType } from '../types';

const BUILDING_CONFIGS: Record<
  BuildingType,
  { color: number; glow: number; height: number; details: (group: THREE.Group) => void }
> = {
  hospital: {
    color: 0xf0e6f6,
    glow: 0xe8b4f8,
    height: 1.2,
    details: (group) => {
      // Cross on top
      const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.08, 0.12),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffccee,
          emissiveIntensity: 0.6,
        }),
      );
      crossH.position.set(0, 1.24, 0);
      crossH.userData.animate = 'pulse';
      group.add(crossH);

      const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.08, 0.4),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffccee,
          emissiveIntensity: 0.6,
        }),
      );
      crossV.position.set(0, 1.24, 0);
      crossV.userData.animate = 'pulse';
      group.add(crossV);

      addWindows(group, 0xffc8e8, 1.2);

      // Interior glow light
      const light = new THREE.PointLight(0xe8b4f8, 0.6, 2.5);
      light.position.set(0, 0.6, 0);
      group.add(light);
    },
  },
  library: {
    color: 0xc8e8f8,
    glow: 0x88d0f0,
    height: 0.9,
    details: (group) => {
      // Glowing sphere beacon on roof
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0x88ddff,
          emissive: 0x88ddff,
          emissiveIntensity: 0.7,
        }),
      );
      sphere.position.set(0, 0.96, 0);
      sphere.userData.animate = 'float';
      sphere.userData.baseY = 0.96;
      group.add(sphere);

      addWindows(group, 0x88d0f0, 0.9);

      // Interior glow light
      const light = new THREE.PointLight(0x88d0f0, 0.5, 2);
      light.position.set(0, 0.45, 0);
      group.add(light);
    },
  },
  transit: {
    color: 0xd4c8f8,
    glow: 0xb49afa,
    height: 0.7,
    details: (group) => {
      // Cylinder pillars at corners
      const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0xc0a8f0,
        emissive: 0xb49afa,
        emissiveIntensity: 0.2,
      });
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
        new THREE.MeshStandardMaterial({
          color: 0xc0a8f0,
          emissive: 0xb49afa,
          emissiveIntensity: 0.25,
        }),
      );
      roof.position.set(0, 1.0, 0);
      roof.userData.animate = 'rotate';
      group.add(roof);

      // Interior glow light
      const light = new THREE.PointLight(0xb49afa, 0.5, 2);
      light.position.set(0, 0.35, 0);
      group.add(light);
    },
  },
  security: {
    color: 0xf8c8c0,
    glow: 0xf07060,
    height: 1.6,
    details: (group) => {
      // Tall narrow tower body override
      group.children[0].scale.set(0.7, 1, 0.7);

      // Cone beacon on top
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.25, 8),
        new THREE.MeshStandardMaterial({
          color: 0xff5544,
          emissive: 0xff5544,
          emissiveIntensity: 0.6,
        }),
      );
      cone.position.set(0, 1.72, 0);
      cone.userData.animate = 'float';
      cone.userData.baseY = 1.72;
      group.add(cone);

      // Custom windows for narrow tower (body scaled to 0.7)
      const windowGeo = new THREE.BoxGeometry(0.15, 0.15, 0.02);
      const windowMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xf07060,
        emissiveIntensity: 0.7,
      });
      const yPos = 1.6 * 0.4;
      const towerPositions = [
        { x: -0.15, z: 0.30 },
        { x: 0.15, z: 0.30 },
        { x: -0.15, z: -0.30 },
        { x: 0.15, z: -0.30 },
      ];
      for (const pos of towerPositions) {
        const win = new THREE.Mesh(windowGeo, windowMat.clone());
        win.position.set(pos.x, yPos, pos.z);
        win.userData.animate = 'breathe';
        group.add(win);
      }

      // Beacon glow light
      const beaconLight = new THREE.PointLight(0xff5544, 0.8, 3);
      beaconLight.position.set(0, 1.8, 0);
      beaconLight.userData.animate = 'light_pulse';
      beaconLight.userData.baseY = 1.8;
      group.add(beaconLight);

      // Interior glow light
      const interiorLight = new THREE.PointLight(0xf07060, 0.4, 2);
      interiorLight.position.set(0, 0.8, 0);
      group.add(interiorLight);
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
    color: 0xffffff,
    emissive: color,
    emissiveIntensity: 0.7,
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

  // Main body with emissive inner glow
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, config.height, 0.85),
    new THREE.MeshStandardMaterial({
      color: config.color,
      emissive: config.glow,
      emissiveIntensity: 0.15,
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
 * Add a pulsing orange ring around a broken building to indicate it can be repaired.
 */
export function addRepairIndicator(scene: THREE.Scene, col: number, row: number): void {
  // Avoid duplicates
  const existing = findRepairIndicator(scene, col, row);
  if (existing) return;

  const ringGeo = new THREE.RingGeometry(0.52, 0.58, 48);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xff9933,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(col, 0.06, row);
  ring.userData = { type: 'repair_indicator', col, row, animate: 'repair_pulse' };
  scene.add(ring);
}

/**
 * Remove the repair indicator ring from a building.
 */
export function removeRepairIndicator(scene: THREE.Scene, col: number, row: number): void {
  const ring = findRepairIndicator(scene, col, row);
  if (ring) {
    scene.remove(ring);
    (ring as THREE.Mesh).geometry.dispose();
    ((ring as THREE.Mesh).material as THREE.Material).dispose();
  }
}

function findRepairIndicator(scene: THREE.Scene, col: number, row: number): THREE.Object3D | null {
  let found: THREE.Object3D | null = null;
  scene.traverse((obj) => {
    if (
      obj.userData?.type === 'repair_indicator' &&
      obj.userData.col === col &&
      obj.userData.row === row
    ) {
      found = obj;
    }
  });
  return found;
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
        mat.emissiveIntensity = 0.4 + Math.sin(time * 3) * 0.3;
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
        mat.emissiveIntensity = 0.5 + Math.sin(time * 1.5 + obj.position.x * 5) * 0.3;
        break;
      }

      // Point light intensity pulse (security beacon)
      case 'light_pulse': {
        const light = obj as THREE.PointLight;
        light.intensity = 0.6 + Math.sin(time * 2) * 0.3;
        light.position.y = (obj.userData.baseY as number) + Math.sin(time * 2) * 0.04;
        break;
      }

      // Gentle pulsing orange repair indicator
      case 'repair_pulse': {
        const mesh = obj as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.4 + Math.sin(time * 2.5) * 0.3;
        break;
      }
    }
  });
}
