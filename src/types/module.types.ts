// src/types/module.types.ts - Definisi Tipe Kasus dan Baris Kode (SSOT: SDD.md)

export type RelationalOperator = '==' | '!=' | '>' | '<' | '>=' | '<=';

export type BranchType = 'INIT' | 'CONDITION' | 'BRANCH_IF' | 'BRANCH_ELSE' | 'OUTPUT';

export interface CodeLine {
  lineNumber: number;
  pseudoText: string;
  cText: string;
  branchType: BranchType;
}

export interface CaseModule {
  id: string; // Contoh: 'm01', 'm02', 'm03', 'm04', 'm05'
  title: string; // Judul kasus kontekstual
  cycleRequired: 1 | 2; // 1: Siklus I (Aktif), 2: Siklus II (Terkunci)
  concept: string; // Konsep yang diuji
  storyPrompt: string; // Cerita masalah kontekstual di dunia nyata
  inputVariable: string; // Nama variabel input, misal 'saldo_kartu'
  inputLabel: string; // Label input pada antarmuka
  defaultInput: number;
  minInput?: number;
  maxInput?: number;
  targetComparison: {
    op: RelationalOperator;
    boundaryValue: number;
  };
  lines: CodeLine[];
  hints: {
    level1: string;
    level2: string;
    level3: string;
  };
}
