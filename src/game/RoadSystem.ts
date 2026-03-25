import * as THREE from 'three';
import gsap from 'gsap';
import type { Building } from '../types';

/** Road visual sits just above the tile surface */
const ROAD_Y = 0.07;
const ROAD_WIDTH = 0.12;
const ROAD_HEIGHT = 0.02;
const LIGHT_RADIUS = 0.035;
const LIGHT_SPEED = 1.2; // units per second

interface RoadSegment {
  /** start col/row */
  fromCol: number;
  fromRow: number;
  /** direction: 'h' = +col, 'v' = +row */
  dir: 'h' | 'v';
}

interface TravellingLight {
  mesh: THREE.Mesh;
  path: { x: number; z: number }[];
  progress: number; // 0..1
  speed: number; // normalized per-second speed for this path length
}

const roadGroup = new THREE.Group();
roadGroup.userData = { type: 'road_system' };

const travellingLights: TravellingLight[] = [];

/**
 * Compute a simple Manhattan path (horizontal first, then vertical)
 * from source to target, returning a list of grid waypoints.
 */
function manhattanPath(
  fromCol: number,
  fromRow: number,
  toCol: number,
  toRow: number,
): { col: number; row: number }[] {
  const points: { col: number; row: number }[] = [{ col: fromCol, row: fromRow }];
  let c = fromCol;
  let r = fromRow;

  // Move horizontally
  const colStep = toCol > c ? 1 : -1;
  while (c !== toCol) {
    c += colStep;
    points.push({ col: c, row: r });
  }

  // Move vertically
  const rowStep = toRow > r ? 1 : -1;
  while (r !== toRow) {
    r += rowStep;
    points.push({ col: c, row: r });
  }

  return points;
}

/**
 * Convert a waypoint path into unique road segments (deduplicated).
 */
function pathToSegments(
  waypoints: { col: number; row: number }[],
): RoadSegment[] {
  const segments: RoadSegment[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    if (a.col !== b.col) {
      // Horizontal segment
      const minCol = Math.min(a.col, b.col);
      segments.push({ fromCol: minCol, fromRow: a.row, dir: 'h' });
    } else {
      // Vertical segment
      const minRow = Math.min(a.row, b.row);
      segments.push({ fromCol: a.col, fromRow: minRow, dir: 'v' });
    }
  }
  return segments;
}

function segmentKey(s: RoadSegment): string {
  return `${s.fromCol}:${s.fromRow}:${s.dir}`;
}

/**
 * Rebuild all roads connecting buildings to the transit hub.
 * Call this whenever a building is placed or removed.
 */
export function updateRoads(scene: THREE.Scene, buildings: Building[]): void {
  // Clear existing roads
  clearRoads(scene);

  const transit = buildings.find((b) => b.type === 'transit');
  if (!transit) return;

  const others = buildings.filter((b) => b.id !== transit.id);
  if (others.length === 0) return;

  // Collect all unique segments
  const segmentMap = new Map<string, RoadSegment>();
  const allPaths: { col: number; row: number }[][] = [];

  for (const b of others) {
    const path = manhattanPath(
      b.position.col,
      b.position.row,
      transit.position.col,
      transit.position.row,
    );
    allPaths.push(path);
    const segs = pathToSegments(path);
    for (const seg of segs) {
      const key = segmentKey(seg);
      if (!segmentMap.has(key)) {
        segmentMap.set(key, seg);
      }
    }
  }

  // Create road segment meshes
  const segGeo = new THREE.BoxGeometry(1, ROAD_HEIGHT, ROAD_WIDTH);
  const segGeoV = new THREE.BoxGeometry(ROAD_WIDTH, ROAD_HEIGHT, 1);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0xb49afa,
    emissive: 0xb49afa,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.6,
    roughness: 0.4,
  });

  for (const seg of segmentMap.values()) {
    const isH = seg.dir === 'h';
    const mesh = new THREE.Mesh(isH ? segGeo : segGeoV, roadMat.clone());
    if (isH) {
      mesh.position.set(seg.fromCol + 0.5, ROAD_Y, seg.fromRow);
    } else {
      mesh.position.set(seg.fromCol, ROAD_Y, seg.fromRow + 0.5);
    }
    mesh.receiveShadow = true;
    roadGroup.add(mesh);
  }

  // Add junction dots at intersections / waypoints
  const junctionGeo = new THREE.BoxGeometry(ROAD_WIDTH + 0.02, ROAD_HEIGHT, ROAD_WIDTH + 0.02);
  const visited = new Set<string>();
  for (const seg of segmentMap.values()) {
    // Add dots at both ends of each segment
    const pts = seg.dir === 'h'
      ? [{ c: seg.fromCol, r: seg.fromRow }, { c: seg.fromCol + 1, r: seg.fromRow }]
      : [{ c: seg.fromCol, r: seg.fromRow }, { c: seg.fromCol, r: seg.fromRow + 1 }];
    for (const p of pts) {
      const k = `${p.c}:${p.r}`;
      if (!visited.has(k)) {
        visited.add(k);
        const dot = new THREE.Mesh(junctionGeo, roadMat.clone());
        dot.position.set(p.c, ROAD_Y, p.r);
        roadGroup.add(dot);
      }
    }
  }

  scene.add(roadGroup);

  // Animate road segments popping in
  roadGroup.scale.set(1, 0, 1);
  gsap.to(roadGroup.scale, {
    y: 1,
    duration: 0.4,
    ease: 'back.out(2)',
  });

  // Create travelling lights for each path
  createTravellingLights(allPaths);
}

/**
 * Create small glowing spheres that travel along each road path.
 */
function createTravellingLights(
  paths: { col: number; row: number }[][],
): void {
  const lightGeo = new THREE.SphereGeometry(LIGHT_RADIUS, 8, 8);

  for (const path of paths) {
    if (path.length < 2) continue;

    // Convert waypoints to world positions
    const worldPath = path.map((p) => ({ x: p.col, z: p.row }));

    // Calculate total path length for speed normalization
    let totalLength = 0;
    for (let i = 0; i < worldPath.length - 1; i++) {
      totalLength += Math.abs(worldPath[i + 1].x - worldPath[i].x)
        + Math.abs(worldPath[i + 1].z - worldPath[i].z);
    }

    // Create 2 lights per path, staggered
    const lightsPerPath = 2;
    for (let l = 0; l < lightsPerPath; l++) {
      const lightMat = new THREE.MeshBasicMaterial({
        color: 0xeeddff,
        transparent: true,
        opacity: 0.9,
      });
      const lightMesh = new THREE.Mesh(lightGeo, lightMat);
      lightMesh.position.set(worldPath[0].x, ROAD_Y + 0.04, worldPath[0].z);
      lightMesh.userData = { type: 'road_light' };
      roadGroup.add(lightMesh);

      travellingLights.push({
        mesh: lightMesh,
        path: worldPath,
        progress: l / lightsPerPath, // stagger starting positions
        speed: totalLength > 0 ? LIGHT_SPEED / totalLength : 1,
      });
    }
  }
}

/**
 * Animate all road elements. Call once per frame.
 */
export function animateRoads(time: number, delta: number): void {
  if (travellingLights.length === 0) return;

  for (const light of travellingLights) {
    // Advance progress
    light.progress += light.speed * delta;
    if (light.progress > 1) {
      light.progress -= 1; // loop back
    }

    // Interpolate position along path
    const path = light.path;
    const totalSegments = path.length - 1;
    const exactSegment = light.progress * totalSegments;
    const segIndex = Math.min(Math.floor(exactSegment), totalSegments - 1);
    const segT = exactSegment - segIndex;

    const a = path[segIndex];
    const b = path[Math.min(segIndex + 1, path.length - 1)];

    light.mesh.position.x = a.x + (b.x - a.x) * segT;
    light.mesh.position.z = a.z + (b.z - a.z) * segT;

    // Subtle pulse on the light
    const mat = light.mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.5 + Math.sin(time * 4 + light.progress * Math.PI * 2) * 0.4;
    const scale = 0.8 + Math.sin(time * 3 + light.progress * 6) * 0.3;
    light.mesh.scale.set(scale, scale, scale);
  }

  // Subtle pulse on the road segments themselves
  roadGroup.traverse((obj) => {
    if (obj instanceof THREE.Mesh && !obj.userData?.type) {
      const mat = obj.material as THREE.MeshStandardMaterial;
      if (mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = 0.2 + Math.sin(time * 2 + obj.position.x + obj.position.z) * 0.1;
      }
    }
  });
}

/**
 * Remove all roads and travelling lights from the scene.
 */
export function clearRoads(scene: THREE.Scene): void {
  // Dispose all geometries and materials in the road group
  roadGroup.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      if (obj.material instanceof THREE.Material) {
        obj.material.dispose();
      }
    }
  });

  roadGroup.clear();
  scene.remove(roadGroup);
  travellingLights.length = 0;
}
