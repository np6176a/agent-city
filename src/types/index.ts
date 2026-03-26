export type BuildingType = 'hospital' | 'library' | 'transit' | 'security';

export type Difficulty = 'normal' | 'hard';

export type GamePhase =
  | 'start'
  | 'place'
  | 'assign'
  | 'configure'
  | 'resolve'
  | 'feedback'
  | 'repair_select'
  | 'repair_assign'
  | 'repair_configure'
  | 'end';

export type AutonomyLevel = 'low' | 'medium' | 'high';

export type BuildingStatus = 'idle' | 'running' | 'broken' | 'success';

export type AgentName = 'Axel' | 'Rue' | 'Sentry';

export type EventSeverity = 'minor' | 'major';

export type ToolId =
  | 'web_search'
  | 'calculator'
  | 'memory_bank'
  | 'planner'
  | 'code_executor'
  | 'alert_system';

export type FailureCause =
  | 'no_tools'
  | 'no_memory'
  | 'high_autonomy_no_guardrails'
  | 'wrong_agent'
  | 'poor_fit'
  | 'no_required_tool'
  | 'no_search'
  | 'no_calculator'
  | 'no_planner'
  | 'no_alert'
  | 'no_code'
  | 'memory_tool_mismatch';

export interface NormalModeConfig {
  mode: 'normal';
  tools: boolean;
  memory: boolean;
  autonomy: AutonomyLevel;
}

export interface HardModeConfig {
  mode: 'hard';
  tools: [ToolId, ToolId];
  autonomy: AutonomyLevel;
}

export type AgentConfig = NormalModeConfig | HardModeConfig;

export function isHardMode(config: AgentConfig): config is HardModeConfig {
  return config.mode === 'hard';
}

export function getDefaultConfig(difficulty: Difficulty): AgentConfig {
  if (difficulty === 'hard') {
    return { mode: 'hard', tools: [] as unknown as [ToolId, ToolId], autonomy: 'medium' };
  }
  return { mode: 'normal', tools: false, memory: false, autonomy: 'medium' };
}

export interface GridTile {
  col: number;
  row: number;
  buildingId: string | null;
}

export interface Building {
  id: string;
  type: BuildingType;
  position: { col: number; row: number };
  agentId: string | null;
  config: AgentConfig;
  status: BuildingStatus;
  turnsActive: number;
}

export interface Agent {
  id: string;
  name: AgentName;
  role: string;
  teaches: string;
  color: string;
  portrait: string;
  strengths: BuildingType[];
  weakness: BuildingType[];
  affinityTools?: ToolId[];
  pronouns: string;
  tagline: string;
  motto: string;
  bio: string;
  personality: string[];
  reactions: Record<string, string>;
}

export interface Tool {
  id: ToolId;
  name: string;
  description: string;
  aiConcept: string;
  icon: string;
  memoryInteraction: {
    withoutMemory: string;
    withMemory: string;
    memoryImportance: 'none' | 'helpful' | 'critical';
  };
}

export interface GameEvent {
  id: string;
  type: 'breakdown' | 'success';
  buildingId: string;
  agentId: string;
  cause: FailureCause | 'success';
  teachingCardId: string;
  severity: EventSeverity;
  isRepair?: boolean;
}

export interface DiagnosisOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface TeachingCard {
  id: string;
  title: string;
  concept: string;
  explanation: string;
  whatWentWrong: string;
  correctConfig: AgentConfig | Record<string, unknown>;
  diagnosisOptions?: DiagnosisOption[];
}
