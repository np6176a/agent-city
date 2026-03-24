export type BuildingType = 'hospital' | 'library' | 'transit' | 'security';

export type GamePhase =
  | 'start'
  | 'place'
  | 'assign'
  | 'configure'
  | 'resolve'
  | 'feedback'
  | 'repair_select'
  | 'repair_configure'
  | 'end';

export type AutonomyLevel = 'low' | 'medium' | 'high';

export type BuildingStatus = 'idle' | 'running' | 'broken' | 'success';

export type AgentName = 'Axel' | 'Rue' | 'Sentry';

export type EventSeverity = 'minor' | 'major';

export type FailureCause =
  | 'no_tools'
  | 'no_memory'
  | 'high_autonomy_no_guardrails'
  | 'wrong_agent'
  | 'poor_fit';

export interface AgentConfig {
  tools: boolean;
  memory: boolean;
  autonomy: AutonomyLevel;
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
  correctConfig: AgentConfig;
  diagnosisOptions?: DiagnosisOption[];
}
