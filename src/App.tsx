import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { createScene } from './game/Scene';
import { createCamera, setupCameraControls } from './game/Camera';
import { createGrid, highlightTile } from './game/Grid';
import { createBuildingMesh, animateBuildings } from './game/BuildingFactory';
import { animateBuildingPopIn, animateSuccess, animateFailure } from './game/Animations';
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
import eventsData from './data/events.json';
import type { AgentConfig, TeachingCard } from './types';

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
        if (hoveredTileRef.current) {
          highlightTile(hoveredTileRef.current, false);
        }
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

        // Handle repair selection: click on a broken building
        if (state.phase === 'repair_select') {
          const key = `${col}:${row}`;
          const tile = state.grid.get(key);
          if (!tile?.buildingId) return;
          const building = state.buildings.find(
            (b) => b.id === tile.buildingId && b.status === 'broken',
          );
          if (!building) return;
          useGameStore.getState().setRepairBuilding(building.id);
          useGameStore.getState().setPhase('repair_assign');
          return;
        }

        // Normal placement
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

        const mesh = createBuildingMesh(state.selectedBuildingType, col, row);
        scene.add(mesh);
        animateBuildingPopIn(mesh);

        useGameStore.getState().placeBuilding(building);
        useGameStore.getState().setPhase('assign');
      },
    });

    const clock = new THREE.Clock();
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      animateBuildings(scene, clock.getElapsedTime());
      renderer.render(scene, camera);
    };
    animate();

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

  const handleAgentConfirm = useCallback((agentId: string) => {
    const currentPhase = useGameStore.getState().phase;

    if (currentPhase === 'assign') {
      const buildings = useGameStore.getState().buildings;
      const latestBuilding = buildings[buildings.length - 1];
      if (latestBuilding && !latestBuilding.agentId) {
        useAgentStore.getState().assignAgent(latestBuilding.id, agentId);
        useGameStore.getState().updateBuilding(latestBuilding.id, { agentId });
        useGameStore.getState().setPhase('configure');
      }
    } else if (currentPhase === 'repair_assign') {
      const repairId = useGameStore.getState().repairBuildingId;
      if (repairId) {
        useAgentStore.getState().assignAgent(repairId, agentId);
        useGameStore.getState().updateBuilding(repairId, { agentId });
        useGameStore.getState().setPhase('repair_configure');
      }
    }

    useAgentStore.getState().selectAgent(null);
  }, []);

  const handleConfigConfirm = useCallback((config: AgentConfig) => {
    const state = useGameStore.getState();
    const isRepair = state.phase === 'repair_configure';
    const buildingId = isRepair
      ? state.repairBuildingId
      : state.buildings[state.buildings.length - 1]?.id;

    if (!buildingId) return;

    // Update building config
    useGameStore.getState().updateBuilding(buildingId, { config });
    useGameStore.getState().setPhase('resolve');
    useGameStore.getState().incrementTurnsPlayed();

    if (isRepair) {
      useGameStore.getState().incrementRepairs();
    }

    const updatedBuildings = useGameStore.getState().buildings;
    const building = updatedBuildings.find((b) => b.id === buildingId)!;
    const agents = useAgentStore.getState().agents;
    const agent = agents.find((a) => a.id === building.agentId)!;

    const event = evaluateTurn(building, agent, isRepair, state.turn);

    // Trigger 3D animations
    if (sceneRef.current) {
      if (event.type === 'success') {
        animateSuccess(sceneRef.current, building.position.col, building.position.row);
      } else {
        animateFailure(sceneRef.current, building.position.col, building.position.row);
      }
    }

    if (event.type === 'success') {
      if (isRepair) {
        useGameStore.getState().addScore(75);
        useGameStore.getState().addBudget(25);
      } else {
        useGameStore.getState().addScore(100);
        useGameStore.getState().addBudget(50);
      }
      useGameStore.getState().updateBuilding(building.id, { status: 'success' });

      // Check for perfect config (right agent + all correct settings)
      if (
        agent.strengths.includes(building.type) &&
        config.tools &&
        config.memory
      ) {
        useGameStore.getState().addScore(50); // bonus for perfect
        useGameStore.getState().incrementPerfectConfigs();
      }
    } else {
      if (isRepair) {
        useGameStore.getState().addScore(-10);
      } else {
        useGameStore.getState().addScore(-25);
      }
      useGameStore.getState().updateBuilding(building.id, { status: 'broken' });
    }

    // Track concept
    const card = eventsData.teachingCards.find(
      (c) => c.id === event.teachingCardId,
    ) as TeachingCard | undefined;
    if (card) {
      useEventStore.getState().addSeenConcept(card.concept);
    }

    useEventStore.getState().setCurrentEvent(event);
    useEventStore.getState().addToHistory(event);
    useGameStore.getState().setPhase('feedback');
  }, []);

  const handleDiagnosisContinue = useCallback((diagnosedCorrectly: boolean) => {
    const currentEvent = useEventStore.getState().currentEvent;

    // Record diagnosis for failures
    if (currentEvent?.type === 'breakdown') {
      useGameStore.getState().recordDiagnosis(diagnosedCorrectly);
      if (diagnosedCorrectly) {
        useGameStore.getState().addScore(50);
      }
    }

    useEventStore.getState().clearEvent();

    // Update consecutive repair counter
    const wasRepair = currentEvent?.isRepair ?? false;
    if (wasRepair) {
      useGameStore.getState().incrementConsecutiveRepairs();
    } else {
      useGameStore.getState().resetConsecutiveRepairs();
    }

    // Route to next phase using advanceTurn which handles all routing
    useGameStore.getState().advanceTurn();
  }, []);

  const handleChangeAgent = useCallback(() => {
    const currentPhase = useGameStore.getState().phase;
    if (currentPhase === 'configure') {
      useGameStore.getState().setPhase('assign');
    } else if (currentPhase === 'repair_configure') {
      useGameStore.getState().setPhase('repair_assign');
    }
    useAgentStore.getState().selectAgent(null);
  }, []);

  const handleRestart = useCallback(() => {
    resetGame();
    useAgentStore.getState().resetAssignments();
    useEventStore.getState().resetEvents();
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
        <HUD onReset={handleRestart} />
        <BuildPanel />
        <AgentSelect onConfirm={handleAgentConfirm} />
        <ConfigPanel onConfirm={handleConfigConfirm} onChangeAgent={handleChangeAgent} />
        <DiagnosisModal onContinue={handleDiagnosisContinue} />
        <TeachingPopup />
      </div>
    </>
  );
}
