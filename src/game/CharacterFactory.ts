import * as THREE from 'three';

const AGENT_COLORS: Record<string, number> = {
  axel: 0x5ee8b0,
  rue: 0x67d4e8,
  sentry: 0xff8a80,
};

const IDLE_LINES: Record<string, string[]> = {
  axel: [
    'Step 3 of 47...',
    'Per my earlier analysis...',
    'Clipboard: updated.',
    'Perfectly sequential.',
    'Planning a plan...',
    'Alpha and Also Alpha, reporting in.',
    'Counting things... 1, 2, 3...',
  ],
  rue: [
    'Ooh, what\'s that?!',
    'Let me look that up!',
    'Actually— wait— actually...',
    'I found 11 results!',
    'Can\'t. Sit. Still.',
    'Research hole time!',
    '*vibrates excitedly*',
    'What\'s next what\'s next?!',
  ],
  sentry: [
    'Just to be safe...',
    'Running extra sweep.',
    'Low-priority alert: squirrel.',
    'All clear... I think.',
    'Safety manual, page 47.',
    'One more check...',
    '*apologizes to a wall*',
    'Filing incident report...',
  ],
};

/** Offset from building center — characters stand to the side */
const CHARACTER_OFFSET = { x: 0.55, z: 0.35 };

/**
 * Creates a character mesh with geometric head + eyes.
 */
export function createCharacterMesh(agentId: string): THREE.Group {
  const color = AGENT_COLORS[agentId] ?? 0xffffff;
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.CapsuleGeometry(0.08, 0.12, 4, 8);
  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.4,
    metalness: 0.3,
    emissive: color,
    emissiveIntensity: 0.15,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.14;
  body.userData.part = 'body';
  group.add(body);

  // Head — sphere
  const headGeo = new THREE.SphereGeometry(0.07, 12, 12);
  const headMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.4,
    emissive: color,
    emissiveIntensity: 0.2,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 0.32;
  group.add(head);

  // Eyes — two small white spheres
  const eyeGeo = new THREE.SphereGeometry(0.02, 8, 8);
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.8,
  });

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.03, 0.34, 0.06);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.03, 0.34, 0.06);
  group.add(rightEye);

  // Glow ring under feet
  const glowGeo = new THREE.RingGeometry(0.06, 0.1, 16);
  const glowMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.01;
  glow.userData.part = 'glow';
  group.add(glow);

  // Agent-specific details
  if (agentId === 'axel') {
    // Clipboard at side
    const clipGeo = new THREE.BoxGeometry(0.04, 0.07, 0.03);
    const clipMat = new THREE.MeshStandardMaterial({ color: 0xffd166 });
    const clip = new THREE.Mesh(clipGeo, clipMat);
    clip.position.set(0.11, 0.15, 0);
    clip.userData.part = 'clipboard';
    group.add(clip);

    // Sentry-like wider body makes Axel a bit narrower/taller
    body.scale.set(0.9, 1.1, 0.9);
  } else if (agentId === 'rue') {
    // Bigger left eye (magnifier eye)
    leftEye.scale.set(1.4, 1.4, 1.4);

    // Antenna with glowing tip
    const antennaGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.1, 6);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x67d4e8 });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.set(0, 0.47, 0);
    group.add(antenna);

    const tipGeo = new THREE.SphereGeometry(0.018, 8, 8);
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0x67d4e8,
      emissive: 0x67d4e8,
      emissiveIntensity: 0.8,
    });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.set(0, 0.53, 0);
    tip.userData.part = 'antenna_tip';
    group.add(tip);

    // Orbiting data fragments — tiny cubes
    for (let i = 0; i < 3; i++) {
      const fragGeo = new THREE.BoxGeometry(0.015, 0.015, 0.015);
      const fragMat = new THREE.MeshStandardMaterial({
        color: 0x67d4e8,
        emissive: 0x67d4e8,
        emissiveIntensity: 0.5,
      });
      const frag = new THREE.Mesh(fragGeo, fragMat);
      frag.userData.part = 'data_fragment';
      frag.userData.orbitIndex = i;
      frag.position.y = 0.35;
      group.add(frag);
    }

    // Smaller, bouncier body
    body.scale.set(0.85, 0.9, 0.85);
  } else if (agentId === 'sentry') {
    // Hard hat — slightly too big
    const hatGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.04, 12);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xffd166 });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.set(0, 0.42, 0);
    hat.userData.part = 'hard_hat';
    group.add(hat);

    // Shield emblem on chest
    const shieldGeo = new THREE.CircleGeometry(0.025, 6);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 0.18, 0.09);
    group.add(shield);

    // Scanner arm — small cylinder on the side
    const scanGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.08, 6);
    const scanMat = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      emissive: 0xff4444,
      emissiveIntensity: 0.4,
    });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scanner.position.set(-0.11, 0.2, 0);
    scanner.rotation.z = Math.PI / 4;
    scanner.userData.part = 'scanner';
    group.add(scanner);

    // Wider, sturdier body
    body.scale.set(1.3, 0.95, 1.3);
  }

  group.scale.set(0.7, 0.7, 0.7);
  return group;
}

/**
 * Creates a speech bubble sprite.
 */
function createSpeechBubble(text: string, agentColor: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Rounded rect background
  ctx.fillStyle = 'rgba(15, 15, 26, 0.9)';
  const r = 10;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(canvas.width - r, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
  ctx.lineTo(canvas.width, canvas.height - r);
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
  ctx.lineTo(r, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  const colorHex = `#${agentColor.toString(16).padStart(6, '0')}`;
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#e0e0e0';
  ctx.font = '16px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.2, 0.3, 1);
  return sprite;
}

/**
 * Places a character next to a building (off-center).
 */
export function placeCharacterOnBuilding(
  scene: THREE.Scene,
  agentId: string,
  col: number,
  row: number,
  buildingHeight: number,
): void {
  removeCharacterFromBuilding(scene, col, row);

  const character = createCharacterMesh(agentId);
  const yPos = buildingHeight + 0.1;
  character.position.set(
    col + CHARACTER_OFFSET.x,
    yPos,
    row + CHARACTER_OFFSET.z,
  );

  character.userData = {
    type: 'character',
    agentId,
    col,
    row,
    baseY: yPos,
    baseX: col + CHARACTER_OFFSET.x,
    baseZ: row + CHARACTER_OFFSET.z,
    spawnTime: performance.now() / 1000,
    lastSpeechTime: performance.now() / 1000 + Math.random() * 5,
    hatSlidePhase: 0, // sentry hat timer
  };

  scene.add(character);
}

/**
 * Removes a character and its speech bubbles from a building position.
 */
export function removeCharacterFromBuilding(
  scene: THREE.Scene,
  col: number,
  row: number,
): void {
  const toRemove: THREE.Object3D[] = [];
  scene.traverse((obj) => {
    if (
      (obj.userData?.type === 'character' || obj.userData?.type === 'speech_bubble') &&
      obj.userData.col === col &&
      obj.userData.row === row
    ) {
      toRemove.push(obj);
    }
  });
  toRemove.forEach((obj) => scene.remove(obj));
}

/**
 * Per-frame animation for all characters. Each agent has unique idle behavior.
 */
export function animateCharacters(scene: THREE.Scene, time: number): void {
  const toRemove: THREE.Object3D[] = [];

  scene.traverse((obj) => {
    if (obj.userData?.type === 'character') {
      const agentId = obj.userData.agentId as string;
      const baseY = obj.userData.baseY as number;
      const baseX = obj.userData.baseX as number;
      const spawnOffset = obj.userData.spawnTime as number;
      const t = time + spawnOffset;

      // === AXEL: Methodical, head-tilt, clipboard-check, precise movement ===
      if (agentId === 'axel') {
        // Precise, small vertical bob — like counting steps
        obj.position.y = baseY + Math.sin(t * 1.2) * 0.015;
        // Head tilt 15 degrees when "thinking" (periodic)
        const thinkCycle = Math.sin(t * 0.3);
        obj.rotation.z = thinkCycle > 0.7 ? -0.26 : 0; // 15deg = 0.26rad
        // Slow deliberate rotation — looks one way, then the other
        obj.rotation.y = Math.sin(t * 0.25) * 0.3;
        // Clipboard bob — find and animate
        obj.traverse((child) => {
          if (child.userData?.part === 'clipboard') {
            // Raise clipboard when tilting head (checking it)
            child.position.y = thinkCycle > 0.7 ? 0.2 : 0.15;
            child.rotation.z = thinkCycle > 0.7 ? 0.2 : 0;
          }
        });
      }

      // === RUE: Bouncy, jittery, can't sit still, vibrates ===
      else if (agentId === 'rue') {
        // Fast energetic bounce
        obj.position.y = baseY + Math.abs(Math.sin(t * 3.5)) * 0.05;
        // Jittery vibration overlay
        obj.position.x = baseX + Math.sin(t * 12) * 0.004;
        // Quick head snaps — looks around rapidly
        const lookPhase = (t * 1.5) % 4;
        if (lookPhase < 1) obj.rotation.y = 0.5;
        else if (lookPhase < 2) obj.rotation.y = -0.6;
        else if (lookPhase < 3) obj.rotation.y = 0.2;
        else obj.rotation.y = -0.3;
        // Antenna tip spins fast
        obj.traverse((child) => {
          if (child.userData?.part === 'antenna_tip') {
            child.position.x = Math.sin(t * 6) * 0.025;
            child.position.z = Math.cos(t * 6) * 0.025;
          }
          // Orbiting data fragments
          if (child.userData?.part === 'data_fragment') {
            const i = child.userData.orbitIndex as number;
            const angle = t * 2 + (i * Math.PI * 2) / 3;
            const radius = 0.12 + Math.sin(t * 1.5 + i) * 0.02;
            child.position.x = Math.cos(angle) * radius;
            child.position.z = Math.sin(angle) * radius;
            child.position.y = 0.35 + Math.sin(t * 3 + i * 2) * 0.02;
            child.rotation.x = t * 3;
            child.rotation.y = t * 2;
          }
        });
      }

      // === SENTRY: Waddles, hat slides, scanner sweeps, concerned ===
      else if (agentId === 'sentry') {
        // Waddle — side to side rock
        obj.rotation.z = Math.sin(t * 2) * 0.08;
        obj.position.x = baseX + Math.sin(t * 2) * 0.015;
        // Slow careful bob
        obj.position.y = baseY + Math.sin(t * 1) * 0.01;
        // Slow cautious look-around
        obj.rotation.y = Math.sin(t * 0.4) * 0.5;
        // Hat slides down periodically
        obj.traverse((child) => {
          if (child.userData?.part === 'hard_hat') {
            // Every ~8 seconds the hat slides down, then gets pushed back up
            const hatCycle = (t * 0.7) % 8;
            if (hatCycle > 6 && hatCycle < 7) {
              // Sliding down
              child.position.y = 0.42 - (hatCycle - 6) * 0.06;
              child.rotation.z = (hatCycle - 6) * 0.15;
            } else if (hatCycle >= 7 && hatCycle < 7.3) {
              // Push back up
              const pushProgress = (hatCycle - 7) / 0.3;
              child.position.y = 0.36 + pushProgress * 0.06;
              child.rotation.z = 0.15 * (1 - pushProgress);
            } else {
              child.position.y = 0.42;
              child.rotation.z = 0;
            }
          }
          // Scanner arm sweeps
          if (child.userData?.part === 'scanner') {
            child.rotation.z = Math.PI / 4 + Math.sin(t * 1.5) * 0.3;
            // Scanner glow pulses
            const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 0.3 + Math.sin(t * 4) * 0.2;
          }
        });
      }

      // Glow ring pulse (all agents)
      obj.traverse((child) => {
        if (child.userData?.part === 'glow') {
          const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
          mat.opacity = 0.2 + Math.sin(t * 2) * 0.1;
        }
      });

      // Speech bubbles
      const lastSpeech = obj.userData.lastSpeechTime as number;
      const now = performance.now() / 1000;
      if (now - lastSpeech > 7) {
        if (Math.random() < 0.25) {
          const lines = IDLE_LINES[agentId];
          if (lines) {
            const line = lines[Math.floor(Math.random() * lines.length)];
            const color = AGENT_COLORS[agentId] ?? 0xffffff;
            const bubble = createSpeechBubble(line, color);
            bubble.position.set(obj.position.x, obj.position.y + 0.5, obj.position.z);
            bubble.userData = {
              type: 'speech_bubble',
              col: obj.userData.col,
              row: obj.userData.row,
              createdAt: now,
            };
            scene.add(bubble);
          }
        }
        obj.userData.lastSpeechTime = now;
      }
    }

    // Speech bubble lifecycle
    if (obj.userData?.type === 'speech_bubble') {
      const sprite = obj as THREE.Sprite;
      const mat = sprite.material as THREE.SpriteMaterial;
      const now = performance.now() / 1000;
      const age = now - (obj.userData.createdAt as number);

      sprite.position.y += 0.0003;

      if (age < 0.4) {
        mat.opacity = age / 0.4;
      } else if (age < 2.5) {
        mat.opacity = 1;
      } else if (age < 3.2) {
        mat.opacity = 1 - (age - 2.5) / 0.7;
      } else {
        mat.opacity = 0;
        toRemove.push(obj);
      }
    }
  });

  toRemove.forEach((obj) => {
    const sprite = obj as THREE.Sprite;
    (sprite.material as THREE.SpriteMaterial).map?.dispose();
    sprite.material.dispose();
    scene.remove(obj);
  });
}
