import * as THREE from 'three';

export function makeMaterial(color: string): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color: new THREE.Color(color),
  });
}

export function makeMetalMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x2d3748,
    metalness: 0.7,
    roughness: 0.3,
  });
}

/**
 * Create a box geometry with rounded edges by pushing corner vertices
 * toward an ellipsoid. `radius` controls how much rounding (0 = sharp box).
 */
export function makeRoundedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number,
  segments = 6,
): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(width, height, depth, segments, segments, segments);
  const pos = geo.attributes.position;
  const hw = width / 2;
  const hh = height / 2;
  const hd = depth / 2;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // How far past the inner box each axis is (0 inside, positive at edges)
    const ox = Math.max(0, Math.abs(v.x) - (hw - radius));
    const oy = Math.max(0, Math.abs(v.y) - (hh - radius));
    const oz = Math.max(0, Math.abs(v.z) - (hd - radius));

    // Distance from the inner box corner
    const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);

    if (dist > 0) {
      // Scale back to radius sphere surface
      const scale = radius / dist;
      const sx = Math.sign(v.x);
      const sy = Math.sign(v.y);
      const sz = Math.sign(v.z);
      v.x = sx * ((hw - radius) + ox * scale);
      v.y = sy * ((hh - radius) + oy * scale);
      v.z = sz * ((hd - radius) + oz * scale);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
  }

  geo.computeVertexNormals();
  return geo;
}
