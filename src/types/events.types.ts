// src/types/events.types.ts - Definisi Kontrak Event Bus EventCenter (SSOT: SDD.md Section 3.1.D)

export interface RunSimulationPayload {
  inputVal: number;
  conditionResult: boolean;
  moduleId: string;
}

export interface SetTracingModulePayload {
  moduleId: string;
}

export interface GateOpenedPayload {
  branch: 'IF' | 'ELSE';
}

export interface HeroCompletedBranchPayload {
  moduleId: string;
  branch: 'IF' | 'ELSE';
}

export interface StartBattlePayload {
  enemyId: string;
  conditionRule: string;
}

export interface ExecuteBattleTurnPayload {
  conditionRule?: string;
  chosenAction?: string;
  action?: string;
  isCorrect: boolean;
  damage?: number;
  enemyHp?: number;
  heroHp?: number;
}

export interface BattleResolvedPayload {
  won: boolean;
  xpEarned: number;
}
