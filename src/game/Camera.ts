import * as THREE from 'three';

const ZOOM_MIN = 2;
const ZOOM_MAX = 10;
const PAN_SPEED = 0.01;

export function createCamera(): THREE.OrthographicCamera {
  const aspect = window.innerWidth / window.innerHeight;
  const zoom = 5;
  const camera = new THREE.OrthographicCamera(
    -zoom * aspect,
    zoom * aspect,
    zoom,
    -zoom,
    0.1,
    100,
  );

  // Standard isometric angle: 45° rotation, ~35.264° elevation
  const distance = 20;
  const angle = Math.PI / 4; // 45 degrees
  const elevation = Math.atan(Math.sqrt(2)); // ~35.264 degrees

  camera.position.set(
    distance * Math.cos(elevation) * Math.cos(angle),
    distance * Math.sin(elevation),
    distance * Math.cos(elevation) * Math.sin(angle),
  );
  camera.lookAt(4, 0, 4); // Center of 8x8 grid

  return camera;
}

export function setupCameraControls(
  camera: THREE.OrthographicCamera,
  canvas: HTMLCanvasElement,
): () => void {
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.001;
    const aspect = window.innerWidth / window.innerHeight;
    const currentZoom = camera.top;
    const newZoom = THREE.MathUtils.clamp(
      currentZoom + zoomDelta * currentZoom,
      ZOOM_MIN,
      ZOOM_MAX,
    );
    camera.top = newZoom;
    camera.bottom = -newZoom;
    camera.left = -newZoom * aspect;
    camera.right = newZoom * aspect;
    camera.updateProjectionMatrix();
  };

  const onMouseDown = (e: MouseEvent) => {
    if (e.button === 1 || e.button === 2) {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - lastX) * PAN_SPEED;
    const dy = (e.clientY - lastY) * PAN_SPEED;
    camera.position.x -= dx;
    camera.position.z -= dy;
    lastX = e.clientX;
    lastY = e.clientY;
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  const onResize = () => {
    const aspect = window.innerWidth / window.innerHeight;
    const zoom = camera.top;
    camera.left = -zoom * aspect;
    camera.right = zoom * aspect;
    camera.updateProjectionMatrix();
  };

  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('resize', onResize);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  return () => {
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('resize', onResize);
  };
}
