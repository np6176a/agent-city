import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { createScene } from './game/Scene';
import { createCamera, setupCameraControls } from './game/Camera';
import { createGrid, highlightTile } from './game/Grid';
import { createBuildingMesh } from './game/BuildingFactory';
import { InputHandler } from './game/InputHandler';
import { evaluateTurn } from './game/Evaluate';
import { useGameStore, BUILDING_COSTS } from './state/gameStore';
import { useAgentStore } from './state/agentStore';
import { useEventStore } from './state/eventStore';
import { HUD } from './ui/HUD';
import { BuildPanel } from './ui/BuildPanel';
import { AgentSelect } from './ui/AgentSelect';
import { ConfigPanel } from './ui/ConfigPanel';
import { DiagnosisModal } from './ui/DiagnosisModal';
import { TeachingPopup } from './ui/TeachingPopup';
import { StartScreen } from './ui/StartScreen';
import { EndScreen } from './ui/EndScreen';
import type { AgentConfig } from './types';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const hoveredTileRef = useRef<THREE.Mesh | null>(null);

  const phase = useGameStore((s) => s.phase);
  const startGame = useGameStore((s) => s.startGame);
  const resetGame = useGameStore((s) => s.resetGame);

  // Initialize Three.js scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const scene = createScene();
    sceneRef.current = scene;

    const camera = createCamera();
    const cleanupControls = setupCameraControls(camera, canvas);

    createGrid(scene);

    const inputHandler = new InputHandler(camera, scene, canvas);

    inputHandler.setHandlers({
      onTileHover: (col, row) => {
        // Unhighlight previous
        if (hoveredTileRef.current) {
          highlightTile(hoveredTileRef.current, false);
        }
        // Find and highlight tile
        scene.traverse((obj) => {
          if (
            obj.userData?.type === 'tile' &&
            obj.userData.col === col &&
            obj.userData.row === row
          ) {
            highlightTile(obj as THREE.Mesh, true);
            hoveredTileRef.current = obj as THREE.Mesh;
          }
        });
      },
      onTileUnhover: () => {
        if (hoveredTileRef.current) {
          highlightTile(hoveredTileRef.current, false);
          hoveredTileRef.current = null;
        }
      },
      onTileClick: (col, row) => {
        const state = useGameStore.getState();
        if (state.phase !== 'place') return;
        if (!state.selectedBuildingType) return;

        const key = `${col}:${row}`;
        const tile = state.grid.get(key);
        if (!tile || tile.buildingId) return;

        const cost = BUILDING_COSTS[state.selectedBuildingType];
        if (state.budget < cost) return;

        const buildingId = `bld_${Date.now()}`;
        const building = {
          id: buildingId,
          type: state.selectedBuildingType,
          position: { col, row },
          agentId: null,
          config: { tools: false, memory: false, autonomy: 'medium' as const },
          status: 'idle' as const,
          turnsActive: 0,
        };

        // Add 3D mesh
        const mesh = createBuildingMesh(state.selectedBuildingType, col, row);
        scene.add(mesh);

        // Update state
        useGameStore.getState().placeBuilding(building);
        useGameStore.getState().setPhase('assign');
      },
    });

    // Render loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationId);
      cleanupControls();
      inputHandler.dispose();
      renderer.dispose();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Handle agent assignment (when agent is selected during assign phase)
  useEffect(() => {
    if (phase !== 'assign') return;

    const unsub = useAgentStore.subscribe((state) => {
      if (state.selectedAgentId && useGameStore.getState().phase === 'assign') {
        const buildings = useGameStore.getState().buildings;
        const latestBuilding = buildings[buildings.length - 1];
        if (latestBuilding && !latestBuilding.agentId) {
          useAgentStore
            .getState()
            .assignAgent(latestBuilding.id, state.selectedAgentId);
          useGameStore
            .getState()
            .updateBuilding(latestBuilding.id, {
              agentId: state.selectedAgentId,
            });
          useGameStore.getState().setPhase('configure');
        }
      }
    });

    return unsub;
  }, [phase]);

  const handleConfigConfirm = useCallback((config: AgentConfig) => {
    const state = useGameStore.getState();
    const latestBuilding = state.buildings[state.buildings.length - 1];
    if (!latestBuilding) return;

    // Update building config
    useGameStore.getState().updateBuilding(latestBuilding.id, { config });

    // Resolve
    useGameStore.getState().setPhase('resolve');

    const updatedBuildings = useGameStore.getState().buildings;
    const building = updatedBuildings.find((b) => b.id === latestBuilding.id)!;
    const agents = useAgentStore.getState().agents;
    const agent = agents.find((a) => a.id === building.agentId)!;

    const event = evaluateTurn(building, agent);

    // Update score
    if (event.type === 'success') {
      useGameStore.getState().addScore(100);
      useGameStore.getState().addBudget(50);
      useGameStore
        .getState()
        .updateBuilding(building.id, { status: 'success' });
    } else {
      useGameStore.getState().addScore(-25);
      useGameStore
        .getState()
        .updateBuilding(building.id, { status: 'broken' });
    }

    useEventStore.getState().setCurrentEvent(event);
    useEventStore.getState().addToHistory(event);
    useGameStore.getState().setPhase('feedback');
  }, []);

  const handleDiagnosisContinue = useCallback(() => {
    useEventStore.getState().clearEvent();
    useGameStore.getState().nextTurn();
  }, []);

  const handleRestart = useCallback(() => {
    resetGame();
    useAgentStore.getState().resetAssignments();
    // Clear 3D buildings from scene
    if (sceneRef.current) {
      const toRemove: THREE.Object3D[] = [];
      sceneRef.current.traverse((obj) => {
        if (obj.userData?.type === 'building') toRemove.push(obj);
      });
      toRemove.forEach((obj) => sceneRef.current!.remove(obj));
    }
  }, [resetGame]);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" />
      <div className="pointer-events-none fixed inset-0 z-10 [&>*]:pointer-events-auto">
        {phase === 'start' && <StartScreen onStart={startGame} />}
        {phase === 'end' && <EndScreen onRestart={handleRestart} />}
        <HUD />
        <BuildPanel />
        <AgentSelect />
        <ConfigPanel onConfirm={handleConfigConfirm} />
        <DiagnosisModal onContinue={handleDiagnosisContinue} />
        <TeachingPopup />
      </div>
    </>
  );
}
