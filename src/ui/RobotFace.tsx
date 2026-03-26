import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { buildAxelFace } from '../game/faces/buildAxel';
import { buildRueFace } from '../game/faces/buildRue';
import { buildSentryFace } from '../game/faces/buildSentry';
import { animateAxel, animateRue, animateSentry } from '../game/faces/animate';
import { expressions, applyExpression } from '../game/faces/expressions';
import type { Expression } from '../game/faces/types';

interface RobotFaceProps {
  agent: 'axel' | 'rue' | 'sentry';
  expression?: Expression;
  size?: number;
}

const builders = {
  axel: buildAxelFace,
  rue: buildRueFace,
  sentry: buildSentryFace,
};

const animators = {
  axel: animateAxel,
  rue: animateRue,
  sentry: animateSentry,
};

const FPS_INTERVAL = 1000 / 30; // Cap at 30fps

export function RobotFace({ agent, expression = 'idle', size = 200 }: RobotFaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ time: 0, expression });

  useEffect(() => {
    stateRef.current.expression = expression;
  }, [expression]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1.2, 1.2, 1.2, -1.2, 0.1, 10);
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(1, 2, 3);
    scene.add(dir);

    const faceGroup = builders[agent]();
    scene.add(faceGroup);

    // Store base pupil positions
    faceGroup.traverse((child) => {
      if (child.name === 'leftPupil' || child.name === 'rightPupil') {
        child.userData.baseX = child.position.x;
        child.userData.baseY = child.position.y;
      }
    });

    const clock = new THREE.Clock();
    let animId: number;
    let lastFrameTime = 0;

    function loop() {
      animId = requestAnimationFrame(loop);

      const now = performance.now();
      if (now - lastFrameTime < FPS_INTERVAL) return;
      lastFrameTime = now;

      const dt = clock.getDelta();
      stateRef.current.time += dt;

      animators[agent](faceGroup, stateRef.current);

      const config = expressions[stateRef.current.expression];
      applyExpression(faceGroup, config, dt);

      renderer.render(scene, camera);
    }
    loop();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) obj.material.dispose();
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [agent, size]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size, lineHeight: 0 }}
    />
  );
}
