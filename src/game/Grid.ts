import * as THREE from 'three';

const GRID_SIZE = 8;
const TILE_SIZE = 1;
const TILE_HEIGHT = 0.1;
const TILE_GAP = 0.05;

export function createGrid(scene: THREE.Scene): THREE.Group {
  const gridGroup = new THREE.Group();

  // Base plate
  const baseGeometry = new THREE.BoxGeometry(
    GRID_SIZE + 0.4,
    0.15,
    GRID_SIZE + 0.4,
  );
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d2d44,
    roughness: 0.8,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.set(
    (GRID_SIZE - 1) / 2,
    -0.1,
    (GRID_SIZE - 1) / 2,
  );
  base.receiveShadow = true;
  gridGroup.add(base);

  // Grid tiles
  const tileGeometry = new THREE.BoxGeometry(
    TILE_SIZE - TILE_GAP,
    TILE_HEIGHT,
    TILE_SIZE - TILE_GAP,
  );

  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE; row++) {
      const tileMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d3d5c,
        roughness: 0.6,
      });
      const tile = new THREE.Mesh(tileGeometry, tileMaterial);
      tile.position.set(col, 0, row);
      tile.receiveShadow = true;
      tile.userData = { type: 'tile', col, row };
      gridGroup.add(tile);
    }
  }

  scene.add(gridGroup);
  return gridGroup;
}

export function highlightTile(
  mesh: THREE.Mesh,
  highlight: boolean,
): void {
  const material = mesh.material as THREE.MeshStandardMaterial;
  if (highlight) {
    material.color.set(0x5a5a8a);
    material.emissive.set(0x222244);
  } else {
    material.color.set(0x3d3d5c);
    material.emissive.set(0x000000);
  }
}
