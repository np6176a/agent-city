import * as THREE from 'three';
import gsap from 'gsap';

/**
 * Elastic pop-in when a building is placed on the grid.
 * Scales from 0 → 1 with elastic easing.
 */
export function animateBuildingPopIn(group: THREE.Group): void {
  group.scale.set(0, 0, 0);
  gsap.to(group.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: 0.6,
    ease: 'elastic.out(1, 0.4)',
  });
}

/**
 * Green pulse ring expanding outward from a building on success.
 */
export function animateSuccess(
  scene: THREE.Scene,
  col: number,
  row: number,
): void {
  // Expanding ring
  const ringGeo = new THREE.RingGeometry(0.1, 0.15, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x5ee8b0,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(col, 0.15, row);
  scene.add(ring);

  gsap.to(ring.scale, {
    x: 8,
    y: 8,
    z: 8,
    duration: 0.8,
    ease: 'power2.out',
  });
  gsap.to(ringMat, {
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    onComplete: () => {
      scene.remove(ring);
      ringGeo.dispose();
      ringMat.dispose();
    },
  });

  // Building glow brightening
  const buildingGroup = findBuildingAt(scene, col, row);
  if (buildingGroup) {
    // Brief upward bounce
    gsap.to(buildingGroup.position, {
      y: 0.15,
      duration: 0.15,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    });

    // Brighten all emissive materials
    buildingGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.emissive) {
          const orig = mat.emissiveIntensity;
          gsap.to(mat, {
            emissiveIntensity: orig + 0.6,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
          });
        }
      }
    });
  }
}

/**
 * Red shake + warning flash on a building failure.
 */
export function animateFailure(
  scene: THREE.Scene,
  col: number,
  row: number,
): void {
  const buildingGroup = findBuildingAt(scene, col, row);
  if (!buildingGroup) return;

  // Shake left-right
  const origX = buildingGroup.position.x;
  gsap.to(buildingGroup.position, {
    x: origX + 0.08,
    duration: 0.05,
    repeat: 7,
    yoyo: true,
    ease: 'power1.inOut',
    onComplete: () => {
      buildingGroup.position.x = origX;
    },
  });

  // Red flash on the main body
  const body = buildingGroup.children[0];
  if (body instanceof THREE.Mesh) {
    const mat = body.material as THREE.MeshStandardMaterial;
    const origColor = mat.color.getHex();
    mat.color.set(0xff4444);
    mat.emissive.set(0xff4444);
    gsap.to(mat, {
      emissiveIntensity: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        mat.color.set(origColor);
        mat.emissive.set(0x000000);
      },
    });
  }

  // Red warning ring (smaller, fades fast)
  const ringGeo = new THREE.RingGeometry(0.1, 0.15, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xff8a80,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(col, 0.15, row);
  scene.add(ring);

  gsap.to(ring.scale, {
    x: 4,
    y: 4,
    z: 4,
    duration: 0.5,
    ease: 'power2.out',
  });
  gsap.to(ringMat, {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out',
    onComplete: () => {
      scene.remove(ring);
      ringGeo.dispose();
      ringMat.dispose();
    },
  });
}

function findBuildingAt(
  scene: THREE.Scene,
  col: number,
  row: number,
): THREE.Group | null {
  let found: THREE.Group | null = null;
  scene.traverse((obj) => {
    if (
      obj.userData?.type === 'building' &&
      obj.userData.col === col &&
      obj.userData.row === row
    ) {
      found = obj as THREE.Group;
    }
  });
  return found;
}
