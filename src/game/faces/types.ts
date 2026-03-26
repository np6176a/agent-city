export type Expression = 'idle' | 'happy' | 'worried' | 'broken' | 'thinking';

export interface AnimationState {
  time: number;
  expression: Expression;
}

export interface ExpressionConfig {
  pupilScale: number;
  pupilOffsetY: number;
  mouthScaleX: number;
  mouthScaleY: number;
  mouthOffsetY: number;
  headTiltZ: number;
  browAngle: number;
  hatSlide: number;
  bounceIntensity: number;
  antennaSpeed: number;
}
