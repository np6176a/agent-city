import * as THREE from 'three';
import type { AnimationState } from './types';
import { expressions } from './expressions';

export function animateAxel(group: THREE.Group, state: AnimationState): void {
  const t = state.time;
  const config = expressions[state.expression];

  // Periodic "clipboard check" cycle: every ~5 seconds, look down then nod
  const clipCycle = t % 5.0;
  let clipTiltX = 0;
  let clipNod = 0;
  if (clipCycle > 3.2 && clipCycle < 3.6) {
    // Look down at clipboard
    clipTiltX = 0.1;
  } else if (clipCycle > 3.6 && clipCycle < 3.9) {
    // Small nod — "yes, that's correct"
    clipNod = -0.06;
  } else if (clipCycle > 3.9 && clipCycle < 4.1) {
    clipNod = 0.03;
  } else if (clipCycle > 4.1 && clipCycle < 4.3) {
    clipNod = -0.04;
  }
  group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, clipTiltX + clipNod, 0.12);

  // Steady deliberate head turns — slow, measured (he's surveying methodically)
  group.rotation.y = THREE.MathUtils.lerp(
    group.rotation.y,
    Math.sin(t * 0.6) * 0.08,
    0.08,
  );

  // Head tilt — signature left lean when thinking, slight upright sway otherwise
  const tiltTarget = config.headTiltZ + Math.sin(t * 0.4) * 0.02;
  group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, tiltTarget, 0.05);

  // Antenna ball — bounces more during clipboard check, gentle pulse otherwise
  const ball = group.getObjectByName('antennaBall');
  if (ball) {
    const baseY = 0.95;
    const clipBounce = clipCycle > 3.2 && clipCycle < 4.3 ? 0.05 : 0.03;
    ball.position.y = baseY + Math.sin(t * 2.5) * clipBounce;
    // Subtle glow pulse via scale
    const pulse = 1.0 + Math.sin(t * 3) * 0.1;
    ball.scale.setScalar(pulse);
  }

  // Pupils — focused, deliberate movement; look down during clipboard check
  const baseIntensity = 0.025;
  animatePupils(group, t, baseIntensity);
  // Extra downward glance during clipboard check
  const lp = group.getObjectByName('leftPupil');
  const rp = group.getObjectByName('rightPupil');
  if (lp && rp && clipCycle > 3.2 && clipCycle < 3.6) {
    const downShift = -0.04;
    lp.position.y += downShift;
    rp.position.y += downShift;
  }

  // Mouth — slight purse during clipboard check (concentrating)
  const mouth = group.getObjectByName('mouth');
  if (mouth) {
    const pursed = clipCycle > 3.2 && clipCycle < 4.3 ? 0.7 : 1.0;
    mouth.scale.x = THREE.MathUtils.lerp(mouth.scale.x, pursed, 0.1);
  }
}

export function animateRue(group: THREE.Group, state: AnimationState): void {
  const t = state.time;
  const config = expressions[state.expression];

  // Bouncy energy
  group.position.y = Math.sin(t * 3) * config.bounceIntensity;
  group.rotation.y = Math.sin(t * 1.2) * 0.08;

  // Spinning antenna ring
  const ring = group.getObjectByName('antennaRing');
  if (ring) ring.rotation.z = t * config.antennaSpeed;

  // Orbiting data particles
  for (let i = 0; i < 3; i++) {
    const p = group.getObjectByName(`dataParticle${i}`);
    if (p) {
      const angle = t * 1.5 + (i * Math.PI * 2) / 3;
      p.position.x = Math.cos(angle) * 0.9;
      p.position.y = 0.3 + Math.sin(angle * 0.7) * 0.3;
      p.position.z = Math.sin(angle) * 0.4;
    }
  }

  // Pupils — more active drift
  animatePupils(group, t, 0.04);

  // Big eye zoom on thinking
  if (state.expression === 'thinking') {
    const bigPupil = group.getObjectByName('leftPupil');
    if (bigPupil) bigPupil.scale.setScalar(1 + Math.sin(t * 4) * 0.2);
  }
}

export function animateSentry(group: THREE.Group, state: AnimationState): void {
  const t = state.time;
  const config = expressions[state.expression];

  // Periodic alert scan: every ~4 seconds, quick look left then right then center
  const scanCycle = t % 4.0;
  let scanY = 0;
  if (scanCycle > 2.8 && scanCycle < 3.1) {
    // Quick look left
    scanY = -0.12;
  } else if (scanCycle > 3.1 && scanCycle < 3.4) {
    // Quick look right
    scanY = 0.12;
  } else if (scanCycle > 3.4 && scanCycle < 3.6) {
    // Snap back to center
    scanY = 0;
  }
  group.rotation.y = THREE.MathUtils.lerp(
    group.rotation.y,
    Math.sin(t * 0.5) * 0.06 + scanY,
    0.12,
  );

  // Subtle waddle/sway side to side
  group.rotation.z = Math.sin(t * 1.2) * 0.02;
  group.position.x = Math.sin(t * 0.8) * 0.01;

  // Hard hat slide — more pronounced, occasional bigger slip
  const hat = group.getObjectByName('hardHat');
  const brim = group.getObjectByName('hatBrim');
  const bigSlip = Math.max(0, Math.sin(t * 0.3)) * 0.06;
  // Extra slip during scan moments
  const extraSlip = scanCycle > 2.8 && scanCycle < 3.6 ? 0.03 : 0;
  const totalSlide = bigSlip + extraSlip + config.hatSlide;
  if (hat) {
    hat.position.y = THREE.MathUtils.lerp(hat.position.y, 0.5 - totalSlide, 0.1);
  }
  if (brim) {
    brim.position.y = THREE.MathUtils.lerp(brim.position.y, 0.5 - totalSlide, 0.1);
  }

  // Eyebrow twitch — more animated, reacts to scan
  const leftBrow = group.getObjectByName('leftBrow');
  const rightBrow = group.getObjectByName('rightBrow');
  const browPulse = Math.sin(t * 1.5) * 0.06;
  const alertBrow = scanCycle > 2.8 && scanCycle < 3.6 ? 0.08 : 0;
  if (leftBrow) leftBrow.rotation.z = config.browAngle + browPulse + alertBrow;
  if (rightBrow) rightBrow.rotation.z = -config.browAngle - browPulse - alertBrow;

  // Pupils — wider scanning range, speed up during alert scan
  const scanIntensity = scanCycle > 2.8 && scanCycle < 3.6 ? 0.06 : 0.03;
  animatePupils(group, t, scanIntensity);

  // Mouth tightens during scan (worried clench)
  const mouth = group.getObjectByName('mouth');
  if (mouth) {
    const clench = scanCycle > 2.8 && scanCycle < 3.6 ? 0.7 : 1.0;
    mouth.scale.x = THREE.MathUtils.lerp(mouth.scale.x, clench, 0.1);
  }
}

function animatePupils(
  group: THREE.Group,
  time: number,
  intensity: number,
): void {
  const leftPupil = group.getObjectByName('leftPupil');
  const rightPupil = group.getObjectByName('rightPupil');

  if (leftPupil && rightPupil) {
    const offsetX = Math.sin(time * 0.7) * intensity;
    const offsetY = Math.cos(time * 0.5) * intensity * 0.5;

    leftPupil.position.x = (leftPupil.userData.baseX as number) + offsetX;
    leftPupil.position.y = (leftPupil.userData.baseY as number) + offsetY;
    rightPupil.position.x = (rightPupil.userData.baseX as number) + offsetX;
    rightPupil.position.y = (rightPupil.userData.baseY as number) + offsetY;
  }
}
