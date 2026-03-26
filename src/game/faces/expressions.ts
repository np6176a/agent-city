import * as THREE from 'three';
import type { Expression, ExpressionConfig } from './types';

export const expressions: Record<Expression, ExpressionConfig> = {
  idle: {
    pupilScale: 1.0,
    pupilOffsetY: 0,
    mouthScaleX: 1.0,
    mouthScaleY: 1.0,
    mouthOffsetY: 0,
    headTiltZ: 0,
    browAngle: 0.2,
    hatSlide: 0,
    bounceIntensity: 0.02,
    antennaSpeed: 2,
  },
  happy: {
    pupilScale: 1.3,
    pupilOffsetY: 0.02,
    mouthScaleX: 1.5,
    mouthScaleY: 2.0,
    mouthOffsetY: 0.03,
    headTiltZ: 0,
    browAngle: -0.1,
    hatSlide: 0,
    bounceIntensity: 0.05,
    antennaSpeed: 4,
  },
  worried: {
    pupilScale: 0.7,
    pupilOffsetY: -0.02,
    mouthScaleX: 0.6,
    mouthScaleY: 1.0,
    mouthOffsetY: -0.03,
    headTiltZ: -0.05,
    browAngle: 0.35,
    hatSlide: 0.06,
    bounceIntensity: 0.005,
    antennaSpeed: 0.5,
  },
  broken: {
    pupilScale: 0.5,
    pupilOffsetY: 0,
    mouthScaleX: 2.0,
    mouthScaleY: 4.0,
    mouthOffsetY: -0.05,
    headTiltZ: 0.1,
    browAngle: 0.45,
    hatSlide: 0.1,
    bounceIntensity: 0,
    antennaSpeed: 0,
  },
  thinking: {
    pupilScale: 1.0,
    pupilOffsetY: 0.03,
    mouthScaleX: 0.8,
    mouthScaleY: 1.0,
    mouthOffsetY: 0,
    headTiltZ: 0.15,
    browAngle: 0.15,
    hatSlide: 0.02,
    bounceIntensity: 0.01,
    antennaSpeed: 1,
  },
};

export function applyExpression(
  group: THREE.Group,
  config: ExpressionConfig,
  dt: number,
): void {
  const lerpSpeed = 4 * dt;

  const lp = group.getObjectByName('leftPupil');
  const rp = group.getObjectByName('rightPupil');
  if (lp && rp) {
    const targetScale = config.pupilScale;
    lp.scale.setScalar(THREE.MathUtils.lerp(lp.scale.x, targetScale, lerpSpeed));
    rp.scale.setScalar(THREE.MathUtils.lerp(rp.scale.x, targetScale, lerpSpeed));
  }

  const mouth = group.getObjectByName('mouth');
  if (mouth) {
    mouth.scale.x = THREE.MathUtils.lerp(mouth.scale.x, config.mouthScaleX, lerpSpeed);
    mouth.scale.y = THREE.MathUtils.lerp(mouth.scale.y, config.mouthScaleY, lerpSpeed);
  }

  const lb = group.getObjectByName('leftBrow');
  const rb = group.getObjectByName('rightBrow');
  if (lb && rb) {
    lb.rotation.z = THREE.MathUtils.lerp(lb.rotation.z, config.browAngle, lerpSpeed);
    rb.rotation.z = THREE.MathUtils.lerp(rb.rotation.z, -config.browAngle, lerpSpeed);
  }

  const hat = group.getObjectByName('hardHat');
  if (hat) {
    hat.position.y = THREE.MathUtils.lerp(hat.position.y, 0.5 - config.hatSlide, lerpSpeed);
  }
}
