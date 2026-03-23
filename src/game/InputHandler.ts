import * as THREE from 'three';

export class InputHandler {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private camera: THREE.OrthographicCamera;
  private scene: THREE.Scene;
  private onTileHover: ((col: number, row: number) => void) | null = null;
  private onTileClick: ((col: number, row: number) => void) | null = null;
  private onTileUnhover: (() => void) | null = null;
  private canvas: HTMLCanvasElement;

  constructor(
    camera: THREE.OrthographicCamera,
    scene: THREE.Scene,
    canvas: HTMLCanvasElement,
  ) {
    this.camera = camera;
    this.scene = scene;
    this.canvas = canvas;

    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('click', this.handleClick);
  }

  setHandlers(handlers: {
    onTileHover?: (col: number, row: number) => void;
    onTileClick?: (col: number, row: number) => void;
    onTileUnhover?: () => void;
  }): void {
    this.onTileHover = handlers.onTileHover ?? null;
    this.onTileClick = handlers.onTileClick ?? null;
    this.onTileUnhover = handlers.onTileUnhover ?? null;
  }

  private updateMouse(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  private getTileIntersection(): { col: number; row: number } | null {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true,
    );

    for (const intersect of intersects) {
      const obj = intersect.object;
      if (obj.userData?.type === 'tile') {
        return { col: obj.userData.col, row: obj.userData.row };
      }
    }
    return null;
  }

  private handleMouseMove = (event: MouseEvent): void => {
    this.updateMouse(event);
    const tile = this.getTileIntersection();
    if (tile) {
      this.onTileHover?.(tile.col, tile.row);
    } else {
      this.onTileUnhover?.();
    }
  };

  private handleClick = (event: MouseEvent): void => {
    if (event.button !== 0) return;
    this.updateMouse(event);
    const tile = this.getTileIntersection();
    if (tile) {
      this.onTileClick?.(tile.col, tile.row);
    }
  };

  dispose(): void {
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('click', this.handleClick);
  }
}
