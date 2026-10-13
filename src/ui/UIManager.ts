// src/ui/UIManager.ts - Pengendali 12 Layar Antarmuka Retro GBA DOM (SSOT: DESIGN.md & antislop-ui)
import { CASE_MODULES } from '../logic/modules.data';
import { MATERI_BANK, getMateriTopicById, MateriTopic } from '../logic/materi.data';
import { CaseModule } from '../types/module.types';
import { StudentSession, ModuleProgress, ProgressionState, FormativeScores, TracingWizardStep, MissionGuidanceMeta } from '../types/session.types';
import { StorageService, POSTTEST_CYCLE_URLS, DRIVE_CYCLE_URLS, DEFAULT_DRIVE_URL } from '../services/StorageService';
import { soundFx } from '../services/AudioService';
import { AssessmentExportService, DirectUploadResult } from '../services/AssessmentExportService';
import { CycleGuard } from '../logic/CycleGuard';
import { traceModuleExecution, TraceExecutionResult, validateNumericInput } from '../logic/TracerEngine';
import { EventCenter } from '../game/EventCenter';
import { SyntaxRenderer } from './SyntaxRenderer';
import { CoverageView, MODULE_BRANCHES } from './CoverageView';
import { FlowgorithmView } from './FlowgorithmView';
import { renderCaseIllustrationPixelArt } from './CaseIllustrationRenderer';
import { escapeHtml, isValidSafeName, sanitizeWebUrl } from '../utils/security';

export type PixelIconType =
  | 'book'
  | 'gamepad'
  | 'bolt'
  | 'shield'
  | 'map'
  | 'gear'
  | 'refresh'
  | 'target'
  | 'chat'
  | 'school'
  | 'flask'
  | 'swords'
  | 'chart'
  | 'bulb'
  | 'check'
  | 'trophy'
  | 'drive'
  | 'save'
  | 'run'
  | 'star'
  | 'play'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-down'
  | 'document'
  | 'help'
  | 'speaker'
  | 'speaker-off'
  | 'music'
  | 'music-off'
  | 'lock'
  | 'unlock'
  | 'terminal'
  | 'cross'
  | 'upload';

export function renderPixelIcon(name: PixelIconType, size = 16, color = 'currentColor'): string {
  switch (name) {
    case 'terminal':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><polyline points="3 5 7 8 3 11"/><line x1="9" y1="12" x2="14" y2="12"/></svg>`;
    case 'lock':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="${color}" fill-opacity="0.18"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>`;
    case 'unlock':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="${color}" fill-opacity="0.18"/><path d="M5 7V5a3 3 0 0 1 6 0"/></svg>`;
    case 'music':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><circle cx="4.5" cy="12.5" r="2" fill="${color}" fill-opacity="0.25"/><circle cx="12.5" cy="10.5" r="2" fill="${color}" fill-opacity="0.25"/><path d="M6.5 12.5V3l8-2v9.5"/><path d="M6.5 6l8-2"/></svg>`;
    case 'music-off':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><circle cx="4.5" cy="12.5" r="2" fill="${color}" fill-opacity="0.25"/><circle cx="12.5" cy="10.5" r="2" fill="${color}" fill-opacity="0.25"/><path d="M6.5 12.5V3l8-2v9.5"/><path d="M6.5 6l8-2"/><line x1="2" y1="2" x2="14" y2="14" stroke="${color}" stroke-width="1.8"/></svg>`;
    case 'help':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><circle cx="8" cy="8" r="6.5"/><path d="M6.5 6.2a1.6 1.6 0 0 1 3.1.5c0 1-.9 1.5-1.6 1.8v.5"/><circle cx="8" cy="11.5" r="0.5" fill="${color}"/></svg>`;
    case 'speaker':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M2 5h3l4-3v12l-4-3H2V5z" fill="${color}"/><path d="M12 5c1 1.5 1 4.5 0 6M14 3c2 3 2 7 0 10"/></svg>`;
    case 'speaker-off':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M2 5h3l4-3v12l-4-3H2V5z" fill="${color}"/><line x1="12" y1="6" x2="15" y2="10"/><line x1="15" y1="6" x2="12" y2="10"/></svg>`;
    case 'book':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M2 3h5v10H2V3zm7 0h5v10H9V3z"/><path d="M4 6h2m-2 3h2m5-3h2m-2 3h2"/></svg>`;
    case 'gamepad':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" style="vertical-align: middle; display: inline-block;"><path d="M2 5h12v6H2z"/><rect x="4" y="7" width="3" height="2" fill="#1c1917"/><rect x="5" y="6" width="1" height="4" fill="#1c1917"/><circle cx="11" cy="7" r="1" fill="#f59e0b"/><circle cx="12" cy="9" r="1" fill="#10b981"/></svg>`;
    case 'bolt':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" style="vertical-align: middle; display: inline-block;"><path d="M9 1L4 9h4l-1 6 6-8H9l1-6z"/></svg>`;
    case 'shield':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" style="vertical-align: middle; display: inline-block;"><path d="M8 2l6 2v5c0 3.5-3.5 5.5-6 6-2.5-.5-6-2.5-6-6V4l6-2z" fill="${color}" fill-opacity="0.18"/></svg>`;
    case 'map':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M2 4l4-2 4 2 4-2v10l-4 2-4-2-4 2V4z"/><path d="M6 2v10m4-8v10"/></svg>`;
    case 'gear':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" style="vertical-align: middle; display: inline-block;"><path d="M7 1h2v2h-2zm0 12h2v2h-2zM1 7h2v2H1zm12 0h2v2h-2zM3 3h2v2H3zm8 8h2v2h-2zM3 11h2v2H3zm8-8h2v2h-2z"/><circle cx="8" cy="8" r="2.5" fill="none" stroke="${color}" stroke-width="1.5"/></svg>`;
    case 'refresh':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" style="vertical-align: middle; display: inline-block;"><path d="M13 8A5 5 0 1 1 8 3c1.8 0 3.3.9 4.2 2.3L14 3v4H9.5"/></svg>`;
    case 'target':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" style="vertical-align: middle; display: inline-block;"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="1.2" fill="${color}"/></svg>`;
    case 'chat':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" style="vertical-align: middle; display: inline-block;"><path d="M2 3h12v8H6l-3 3v-3H2V3z"/></svg>`;
    case 'school':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" style="vertical-align: middle; display: inline-block;"><path d="M8 2L2 6v1h1v7h10V7h1V6L8 2zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-2 5h4v4H6v-4z"/></svg>`;
    case 'flask':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M6 2h4m-3 0v4L3 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l-4-7V2" fill="${color}" fill-opacity="0.2"/></svg>`;
    case 'swords':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" style="vertical-align: middle; display: inline-block;"><path d="M2 2l4 4-1 1-4-4 1-1zm8 8l4 4-1 1-4-4 1-1zm3-7l1 1-8 8-1-1 8-8zm-9 9l-1 1 1 1 1-1-1-1zm7-7l1 1-1 1-1-1 1-1z"/></svg>`;
    case 'chart':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" style="vertical-align: middle; display: inline-block;"><path d="M2 14h12v1H1V2h1v12zm3-3h2v2H5v-2zm3-4h2v6H8V7zm3-4h2v10h-2V3z"/></svg>`;
    case 'bulb':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" style="vertical-align: middle; display: inline-block;"><path d="M8 2a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5V11h4v-1.5c1.2-.7 2-2 2-3.5a4 4 0 0 0-4-4z" fill="${color}" fill-opacity="0.18"/><path d="M6 13h4m-3 2h2"/></svg>`;
    case 'check':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><polyline points="3 8 7 12 13 4"/></svg>`;
    case 'trophy':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M4 3h8v5a4 4 0 0 1-8 0V3z" fill="${color}" fill-opacity="0.2"/><path d="M4 5H2a2 2 0 0 0 2 2m8-2h2a2 2 0 0 1-2 2M8 11v3m-3 0h6"/></svg>`;
    case 'drive':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M4 11a3.5 3.5 0 0 1-.5-7 5 5 0 0 1 9.5 1.5A3.5 3.5 0 0 1 12 11H4zm4-4v5m-2-3l2-2 2 2"/></svg>`;
    case 'save':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" style="vertical-align: middle; display: inline-block;"><path d="M3 2h8l2 2v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 1v3h6V3H4zm1 7h6v3H5v-3z"/></svg>`;
    case 'run':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" style="vertical-align: middle; display: inline-block;"><circle cx="10" cy="3" r="1.5"/><path d="M9 5l-2 3 2 2v4h-1.5v-3L6 9.5l-1.5 2H3l2.5-3.5L7 7l-.5-2H9z"/></svg>`;
    case 'star':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" style="vertical-align: middle; display: inline-block;"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>`;
    case 'play':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" style="vertical-align: middle; display: inline-block;"><path d="M4 3l9 5-9 5V3z"/></svg>`;
    case 'arrow-left':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><line x1="12" y1="8" x2="4" y2="8"/><polyline points="8 4 4 8 8 12"/></svg>`;
    case 'arrow-right':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><line x1="4" y1="8" x2="12" y2="8"/><polyline points="8 4 12 8 8 12"/></svg>`;
    case 'arrow-up':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><line x1="8" y1="12" x2="8" y2="4"/><polyline points="4 8 8 4 12 8"/></svg>`;
    case 'arrow-down':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><line x1="8" y1="4" x2="8" y2="12"/><polyline points="4 8 8 12 12 8"/></svg>`;
    case 'document':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M4 2h6l3 3v9H4V2z"/><path d="M10 2v3h3m-6 3h4m-4 3h4"/></svg>`;
    case 'cross':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></svg>`;
    case 'upload':
      return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;"><path d="M2 11v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2"/><polyline points="5 5 8 2 11 5"/><line x1="8" y1="2" x2="8" y2="10"/></svg>`;
    default:
      return '';
  }
}

export type ScreenId =
  | 'MENU'
  | 'PANDUAN'
  | 'OVERWORLD'
  | 'DIALOG'
  | 'MATERI'
  | 'TRACING'
  | 'BATTLE'
  | 'EVALUASI'
  | 'PROGRES'
  | 'SETTINGS'
  | 'OFFLINE';

export interface ScreenGuidanceStep {
  number: number;
  title: string;
  desc: string;
}

export interface ScreenGuidanceConfig {
  tag: string;
  title: string;
  icon: PixelIconType;
  purpose: string;
  steps: ScreenGuidanceStep[];
  cycleNote?: string;
  primaryActionLabel: string;
  secondaryAction?: {
    label: string;
    action: () => void;
  };
}

export class UIManager {
  private overlayContainer: HTMLElement;
  private globalHeader: HTMLElement | null = null;
  private globalFooter: HTMLElement | null = null;
  private currentScreen: ScreenId = 'MENU';

  // State sesi & modul aktif
  private session?: StudentSession;
  private activeModule: CaseModule = CASE_MODULES[0]!;
  private isCycle2Unlocked = false;
  private progressionState?: ProgressionState;
  private allModuleProgress: Record<string, ModuleProgress> = {};

  // Komponen pembantu
  private syntaxRenderer!: SyntaxRenderer;
  private coverageView!: CoverageView;
  private flowgorithmView!: FlowgorithmView;
  private tracingWorkbenchViewMode: 'CODE' | 'FLOW' | 'BOTH' = 'BOTH';

  // State Materi Pembelajaran (Layar 04)
  private activeMateriId: string = 'pra-01';
  private readMateriIds: string[] = [];

  // State Pelacak Pop-Up Modal Kontekstual Layar (Muncul pertama kali per sesi & siklus)
  private shownScreenGuidanceSet = new Set<string>();

  // State Tracing
  private isInputApplied: boolean = false;
  private currentInputValue: number = CASE_MODULES[0]!.defaultInput;
  private currentTraceResult: TraceExecutionResult | null = null;
  private currentStepIndex = 0;
  private userPrediction: string | null = null;
  private autoPlayTimer: number | null = null;
  private isTracingHeroCollapsed: boolean = false;
  private bypassTracingGuardOnce: boolean = false;
  private tracingWizardStep: TracingWizardStep = 1;
  private isSimRunning: boolean = false;

  // State Logo Ketuk 3x untuk Guru
  private logoClickCount = 0;
  private logoClickTimer: number | null = null;

  // State Soal Formatif (Layar 07-08)
  private currentQuestionIndex = 0;
  private selectedAnswer: number | null = null;
  private answerSubmitted = false;
  private evaluasiAnswers: number[] = [];
  private evaluasiCorrectCount = 0;
  private isEvaluasiSessionActive = false;
  private isEvaluasiPracticeMode = false;
  private formativeScores: FormativeScores | null = null;

  // State Pertarungan RPG (Layar 06)
  private currentBattleRound = 1;
  private enemyHp = 50;
  private maxEnemyHp = 50;
  private playerHp = 45;
  private maxPlayerHp = 45;
  private battleLog = 'Pilih aksi serangan yang sesuai dengan evaluasi kondisi.';
  private isBattleSessionActive = false;
  private isBattlePracticeMode = false;
  private isTracingPracticeMode = false;

  // State Progressive Disclosure Stack Panduan Belajar (Layar 02)
  private activeGuideStack: 1 | 2 | 3 = 1;
  private maxUnlockedGuideStack: 1 | 2 | 3 = 1;

  // State Progressive Disclosure Stack Dialog Orientasi Guru Pak Budi (Layar 03)
  private activeDialogStack: 1 | 2 | 3 = 1;
  private maxUnlockedDialogStack: 1 | 2 | 3 = 1;

  // State Progressive Disclosure Stack Materi Pembelajaran (Layar 04)
  private materiActiveStackMap: Record<string, 1 | 2 | 3> = {};
  private materiMaxUnlockedStackMap: Record<string, 1 | 2 | 3> = {};

  // State Progressive Disclosure Stack Dasbor Progres & Portofolio Belajar (Layar 08)
  private activeProgressStack: 1 | 2 | 3 = 1;
  private maxUnlockedProgressStack: 1 | 2 | 3 = 1;
  private progressPortfolioSubTab: 'MODULES' | 'BADGES' = 'MODULES';
  private lastCloudUploadResult: DirectUploadResult | null = null;
  private isCloudUploading = false;

  constructor(overlayElementId: string) {
    const el = document.getElementById(overlayElementId);
    if (!el) {
      throw new Error(`Element #${overlayElementId} tidak ditemukan.`);
    }
    this.overlayContainer = el;
  }

  public async init(): Promise<void> {
    this.session = await StorageService.getSession();
    const cycle = await StorageService.getCycleState();
    this.isCycle2Unlocked = cycle === 2;
    this.progressionState = await StorageService.getProgressionState();
    this.readMateriIds = await StorageService.getReadMateriIds();
    if (this.isCycle2Unlocked) {
      const curMateriTopic = getMateriTopicById(this.activeMateriId);
      if (curMateriTopic.cycleRequired === 1) {
        this.activeMateriId = 'ptk-04';
      }
    }
    this.formativeScores = await StorageService.getFormativeScores(cycle);
    await StorageService.getGasApiUrl();
    await StorageService.getPosttestUrl(1);
    await StorageService.getPosttestUrl(2);

    this.syntaxRenderer = new SyntaxRenderer({
      lines: this.activeModule.lines,
      inputValue: this.currentInputValue,
      onSyntaxChange: () => {
        soundFx.playButtonBlip();
      }
    });

    this.allModuleProgress = await StorageService.getAllProgress();
    const rawProg = await StorageService.getModuleProgress(this.activeModule.id);
    const initialProgress: ModuleProgress = rawProg || {
      testedBranches: [],
      stars: 0,
      isCompleted: false,
      xpEarned: 0,
      updatedAt: Date.now()
    };
    this.coverageView = new CoverageView(initialProgress, this.activeModule.id, this.formativeScores?.tracingScore || 0, this.isCycle2Unlocked);
    this.flowgorithmView = new FlowgorithmView();
    this.flowgorithmView.setModule(this.activeModule.id, this.currentInputValue);

    this.recalculateTrace();

    // Inisialisasi Backsound & dengarkan perubahan statusnya
    soundFx.initBgm('/assets/backsound.mp3');
    soundFx.onBgmChange((isPlaying) => {
      this.updateAllBgmButtons(isPlaying);
    });

    // Dengarkan navigasi layar dari Phaser Canvas (Pin & Gerbang)
    EventCenter.on('NAVIGATE_SCREEN', (screenTarget: string) => {
      this.setScreen(screenTarget as ScreenId);
    });

    // Dengarkan pembukaan Siklus 2 secara dinamis
    EventCenter.on('CYCLE_UNLOCKED', async (cycle: number) => {
      this.isCycle2Unlocked = cycle >= 2;
      this.readMateriIds = await StorageService.getReadMateriIds();
      if (this.isCycle2Unlocked) {
        this.activeMateriId = 'ptk-04';
      }
      this.formativeScores = await StorageService.getFormativeScores(cycle >= 2 ? 2 : 1);
      this.renderGlobalHeader();
      this.render();
    });

    // Pemulihan layar aman saat peramban di-refresh
    let initialScreen = this.currentScreen;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const saved = window.sessionStorage.getItem('iobranch_active_screen') as ScreenId | null;
        if (saved && this.isScreenUnlocked(saved) && saved !== 'BATTLE' && saved !== 'EVALUASI') {
          initialScreen = saved;
        }

        const rawShown = window.sessionStorage.getItem('iobranch_shown_screen_guidance');
        if (rawShown) {
          const parsed = JSON.parse(rawShown);
          if (Array.isArray(parsed)) {
            this.shownScreenGuidanceSet = new Set(parsed);
          }
        }
      }
    } catch {
      // Abaikan jika sessionStorage tidak didukung
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', (e) => {
        if ((this.currentScreen === 'EVALUASI' && this.isEvaluasiSessionActive && this.selectedAnswer !== null) ||
          (this.currentScreen === 'BATTLE' && this.isBattleSessionActive && this.currentBattleRound > 1)) {
          e.preventDefault();
          e.returnValue = '';
        }
      });
    }

    this.setScreen(initialScreen);
  }

  /**
   * Pengecekan Keterbukaan Layar (Strict Sequential Progression Gating)
   */
  public isScreenUnlocked(screen: ScreenId): boolean {
    if (this.progressionState?.teacherBypassMode) return true;
    const hasIndividualSession = !!(this.session && this.session.studentName && this.session.studentAbsen);
    const hasPairSession = !!(this.session && this.session.student1Name && this.session.student2Name);
    const hasSession = !!(this.progressionState?.stepRegistrationCompleted || hasIndividualSession || hasPairSession);
    switch (screen) {
      case 'MENU':
      case 'PANDUAN':
      case 'SETTINGS':
      case 'OFFLINE':
        return true;
      case 'OVERWORLD':
      case 'DIALOG':
        return hasSession;
      case 'MATERI':
        return hasSession && !!(
          this.progressionState?.stepDialogCompleted ||
          this.progressionState?.stepMaterialCompleted ||
          this.progressionState?.stepTracingCompleted ||
          this.progressionState?.stepBattleCompleted ||
          this.progressionState?.stepEvaluationCompleted
        );
      case 'TRACING':
        return hasSession && !!(
          this.progressionState?.stepMaterialCompleted ||
          this.progressionState?.stepTracingCompleted ||
          this.progressionState?.stepBattleCompleted ||
          this.progressionState?.stepEvaluationCompleted
        );
      case 'BATTLE':
        return hasSession && !!(
          this.progressionState?.stepTracingCompleted ||
          this.progressionState?.stepBattleCompleted ||
          this.progressionState?.stepEvaluationCompleted
        );
      case 'EVALUASI':
        return hasSession && !!(
          this.progressionState?.stepBattleCompleted ||
          this.progressionState?.stepEvaluationCompleted
        );
      case 'PROGRES':
        return hasSession && !!this.progressionState?.stepEvaluationCompleted;
      default:
        return true;
    }
  }

  /**
   * Mengambil informasi syarat pembuka langkah
   */
  public getScreenLockInfo(screen: ScreenId): { stepNum: string; title: string; desc: string; redirectScreen: ScreenId } {
    switch (screen) {
      case 'OVERWORLD':
      case 'DIALOG':
        return {
          stepNum: 'Langkah 01',
          title: 'Daftarkan Profil Murid Terlebih Dahulu',
          desc: 'Kamu harus mendaftarkan Nomor Absen serta Nama Lengkap pada menu Beranda sebelum dapat menjelajah kota dan membaca materi.',
          redirectScreen: 'MENU'
        };
      case 'MATERI':
        if (!this.progressionState?.stepDialogCompleted) {
          return {
            stepNum: 'Langkah 01',
            title: 'Temui Guru Pak Budi Terlebih Dahulu',
            desc: 'Kamu harus menemui dan berbicara terlebih dahulu dengan Guru Pak Budi di ujung kiri jalan (di antara pohon) untuk orientasi masalah sebelum ruang kelas materi dibuka.',
            redirectScreen: 'DIALOG'
          };
        }
        return {
          stepNum: 'Langkah 01',
          title: 'Daftarkan Profil Murid Terlebih Dahulu',
          desc: 'Kamu harus mendaftarkan Nomor Absen serta Nama Lengkap pada menu Beranda sebelum dapat menjelajah kota dan membaca materi.',
          redirectScreen: 'MENU'
        };
      case 'TRACING':
        return {
          stepNum: 'Langkah 02',
          title: 'Pelajari Materi Kasus Terlebih Dahulu',
          desc: 'Buka dan pahami studi kasus percabangan di tab MATERI, lalu tekan tombol konfirmasi "Pahami Konsep & Lanjut ke Telusur Alur" di bagian bawah materi.',
          redirectScreen: 'MATERI'
        };
      case 'BATTLE':
        return {
          stepNum: 'Langkah 03',
          title: 'Uji Cabang Kode di Lab Telusur Terlebih Dahulu',
          desc: 'Lakukan simulasi penelusuran baris demi baris di tab TELUSUR dan buktikan alur percabangan (minimal uji satu cabang kondisi bernilai Benar/Salah) untuk membuka arena tantangan monster.',
          redirectScreen: 'TRACING'
        };
      case 'EVALUASI':
        return {
          stepNum: 'Langkah 04',
          title: 'Selesaikan Tantangan Bug Monster Terlebih Dahulu',
          desc: 'Kalahkan Bug Monster di arena TANTANGAN dengan strategi evaluasi kondisi yang tepat sebelum masuk ke evaluasi formatif reflektif.',
          redirectScreen: 'BATTLE'
        };
      case 'PROGRES':
        return {
          stepNum: 'Langkah 05',
          title: 'Selesaikan Soal Evaluasi Terlebih Dahulu',
          desc: 'Jawab semua butir soal evaluasi pemahaman di tab EVALUASI untuk membuka rekap nilai, lencana prestasi, dan sertifikat capaian murid.',
          redirectScreen: 'EVALUASI'
        };
      default:
        return {
          stepNum: 'Langkah Belum Terbuka',
          title: 'Selesaikan Langkah Sebelumnya',
          desc: 'Ikuti prosedur pembelajaran secara berurutan untuk menuntaskan misi pembelajaran.',
          redirectScreen: 'MENU'
        };
    }
  }

  /**
   * Menampilkan dialog instruksi taktis saat murid mencoba melompat ke langkah terkunci
   */
  public showLockedNotice(screen: ScreenId): void {
    soundFx.playLogicFalse();
    const info = this.getScreenLockInfo(screen);

    const screenLabels: Record<string, string> = {
      MENU: 'Beranda',
      DIALOG: 'Dialog Guru',
      MATERI: 'Materi Kasus',
      TRACING: 'Lab Telusur',
      BATTLE: 'Tantangan Monster',
      EVALUASI: 'Evaluasi Mandiri',
      PROGRES: 'Dasbor Progres'
    };
    const targetLabel = screenLabels[info.redirectScreen] || info.redirectScreen;

    this.showCelebrationModal(
      `${info.stepNum}: ${info.title}`,
      info.desc,
      [
        {
          label: `Menuju ke ${targetLabel}`,
          isPrimary: true,
          action: () => {
            this.setScreen(info.redirectScreen);
          }
        },
        {
          label: 'Mengerti',
          isPrimary: false,
          action: () => { }
        }
      ]
    );
  }

  /**
   * Pengecekan ketuntasan seluruh modul pada siklus yang sedang aktif
   */
  private isTracingCycleCompleted(): boolean {
    const requiredModuleIds = this.isCycle2Unlocked
      ? ['m04', 'm05']
      : ['m01', 'm02', 'm03'];
    return requiredModuleIds.every((id) => {
      const prog = this.allModuleProgress[id];
      const branchDefs = MODULE_BRANCHES[id] || [];
      return (prog?.testedBranches?.length || 0) >= branchDefs.length;
    });
  }

  public setScreen(screen: ScreenId): void {
    // 0. Penjaga Navigasi Sesi Aktif: Lab Telusur (Siklus Dinamis & Pilihan A1)
    if (this.currentScreen === 'TRACING' && screen !== 'TRACING') {
      if (this.bypassTracingGuardOnce) {
        this.bypassTracingGuardOnce = false;
      } else {
        const isCycleComplete = this.isTracingCycleCompleted();
        if (!isCycleComplete) {
          const currentCycleText = this.isCycle2Unlocked ? 'Siklus 2' : 'Siklus 1';
          const requiredCount = this.isCycle2Unlocked ? 2 : 3;
          this.showCelebrationModal(
            'Sesi Lab Telusur Sedang Berjalan',
            `Kamu belum menuntaskan pengujian cabang kondisi (Target Bintang 2 per kasus) pada ${requiredCount} kasus ${currentCycleText}. Apakah kamu yakin ingin meninggalkan meja kerja telusur?`,
            [
              {
                label: 'Lanjutkan Pengujian Cabang',
                isPrimary: true,
                action: () => { }
              },
              {
                label: 'Keluar dari Meja Kerja',
                isPrimary: false,
                action: () => {
                  this.bypassTracingGuardOnce = true;
                  this.setScreen(screen);
                }
              }
            ]
          );
          return;
        }
      }
    }

    // 1. Penjaga Navigasi Sesi Aktif: Tantangan Tempur
    if (this.currentScreen === 'BATTLE' && this.isBattleSessionActive && screen !== 'BATTLE') {
      this.showCelebrationModal(
        'Sesi Tantangan Sedang Berlangsung',
        'Selesaikan seluruh 5 ronde evaluasi kondisi pada pertarungan ini terlebih dahulu agar capaian belajar tercatat dengan akurat. Apakah kamu yakin ingin keluar?',
        [
          {
            label: 'Lanjutkan Pertarungan',
            isPrimary: true,
            action: () => { }
          },
          {
            label: 'Keluar dari Sesi',
            isPrimary: false,
            action: () => {
              this.isBattleSessionActive = false;
              this.setScreen(screen);
            }
          }
        ]
      );
      return;
    }

    // 2. Penjaga Navigasi Sesi Aktif: Evaluasi Mandiri 5 Soal
    if (this.currentScreen === 'EVALUASI' && this.isEvaluasiSessionActive && screen !== 'EVALUASI') {
      this.showCelebrationModal(
        'Sesi Evaluasi Sedang Berlangsung',
        'Kamu sedang mengerjakan soal evaluasi pemahaman konsep logika percabangan. Selesaikan seluruh butir soal terlebih dahulu sebelum berpindah ke halaman lain. Apakah kamu yakin ingin keluar?',
        [
          {
            label: 'Lanjutkan Pengerjaan Soal',
            isPrimary: true,
            action: () => { }
          },
          {
            label: 'Keluar dari Sesi',
            isPrimary: false,
            action: () => {
              this.isEvaluasiSessionActive = false;
              this.setScreen(screen);
            }
          }
        ]
      );
      return;
    }

    if (!this.isScreenUnlocked(screen)) {
      this.showLockedNotice(screen);
      return;
    }

    // Inisialisasi status sesi saat memasuki layar BATTLE
    if (screen === 'BATTLE') {
      const isAlreadyCompleted = this.isCycle2Unlocked
        ? Boolean(this.formativeScores?.isBattleLocked)
        : Boolean(this.progressionState?.stepBattleCompleted || this.formativeScores?.isBattleLocked);
      this.isBattlePracticeMode = isAlreadyCompleted;
      this.isBattleSessionActive = true;
      this.currentBattleRound = 1;
      this.enemyHp = 50;
      this.playerHp = 45;
      this.battleLog = 'Pilih aksi serangan yang sesuai dengan evaluasi kondisi.';

      // Tampilkan modal informasi jika masuk kembali ke mode latihan
      if (isAlreadyCompleted) {
        window.setTimeout(() => {
          this.showCelebrationModal(
            'Mode Latihan Tantangan',
            'Kamu telah menyelesaikan misi Tantangan ini sebelumnya. Kamu dipersilakan berlatih kembali untuk mengasah pemahaman evaluasi kondisi percabangan, namun sesi latihan ini tidak mengubah nilai formatif resmimu.',
            [
              {
                label: 'Mulai Latihan Mandiri',
                isPrimary: true,
                action: () => { }
              }
            ]
          );
        }, 120);
      }
    }

    // Inisialisasi status sesi saat memasuki layar EVALUASI
    if (screen === 'EVALUASI') {
      const isAlreadyCompleted = this.isCycle2Unlocked
        ? Boolean(this.formativeScores?.isEvaluasiLocked)
        : Boolean(this.progressionState?.stepEvaluationCompleted || this.formativeScores?.isEvaluasiLocked);
      this.isEvaluasiPracticeMode = isAlreadyCompleted;
      this.isEvaluasiSessionActive = true;
      this.currentQuestionIndex = 0;
      this.selectedAnswer = null;
      this.answerSubmitted = false;
      this.evaluasiAnswers = [];
      this.evaluasiCorrectCount = 0;

      if (isAlreadyCompleted) {
        const cycleLabel = this.isCycle2Unlocked ? 'Siklus 2' : 'Siklus 1';
        window.setTimeout(() => {
          this.showCelebrationModal(
            'Mode Latihan Evaluasi',
            `Kamu telah menyelesaikan evaluasi resmi ${cycleLabel} sebelumnya. Kamu dipersilakan mengerjakan ulang untuk memperdalam pemahaman konsep logika percabangan, namun nilai formatif resmi tetap menggunakan hasil pengerjaan pertama.`,
            [
              {
                label: 'Mulai Latihan Mandiri',
                isPrimary: true,
                action: () => { }
              }
            ]
          );
        }, 120);
      }
    }

    // Inisialisasi status sesi saat membuka layar TRACING
    if (screen === 'TRACING') {
      const isTracingAlreadyLocked = Boolean(this.formativeScores?.isTracingLocked);
      this.isTracingPracticeMode = isTracingAlreadyLocked;

      void StorageService.getFormativeScores(this.isCycle2Unlocked ? 2 : 1).then((scores) => {
        this.formativeScores = scores;
        const prog = this.allModuleProgress[this.activeModule.id] || {
          testedBranches: [],
          stars: 0,
          isCompleted: false,
          xpEarned: 0,
          updatedAt: Date.now()
        };
        this.coverageView.update(prog, this.activeModule.id, this.formativeScores.tracingScore, this.isCycle2Unlocked);
      });

      // Tampilkan modal Mode Latihan jika nilai telusur sudah dikunci (sudah selesai sebelumnya)
      if (isTracingAlreadyLocked) {
        window.setTimeout(() => {
          this.showCelebrationModal(
            'Mode Latihan Lab Telusur',
            'Kamu telah menyelesaikan misi Lab Telusur ini sebelumnya. Kamu dipersilakan berlatih kembali untuk mengasah pemahaman penelusuran kondisi percabangan, namun sesi latihan ini tidak mengubah nilai formatif resmimu.',
            [
              {
                label: 'Mulai Latihan Mandiri',
                isPrimary: true,
                action: () => { }
              }
            ]
          );
        }, 120);
      }
    }

    // Arahkan topik materi ke materi Siklus 2 jika Siklus 2 aktif dan murid membuka layar MATERI
    if (screen === 'MATERI' && this.isCycle2Unlocked) {
      const curMateriTopic = getMateriTopicById(this.activeMateriId);
      if (curMateriTopic.cycleRequired === 1) {
        const unreadC2 = MATERI_BANK.find((t) => t.cycleRequired === 2 && !this.readMateriIds.includes(t.id));
        this.activeMateriId = unreadC2 ? unreadC2.id : 'ptk-04';
      }
    }

    // Sinkronisasi realtime nilai formatif saat membuka layar PROGRES
    if (screen === 'PROGRES') {
      void StorageService.getFormativeScores(this.isCycle2Unlocked ? 2 : 1).then((scores) => {
        this.formativeScores = scores;
        if (this.currentScreen === 'PROGRES') {
          this.render();
        }
      });
    }

    soundFx.playButtonBlip();
    this.currentScreen = screen;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('iobranch_active_screen', screen);
      }
    } catch {
      // Abaikan jika sessionStorage diblokir
    }
    if (this.autoPlayTimer !== null) {
      window.clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }

    const consoleWrapper = document.getElementById('game-console-wrapper');
    const app = document.getElementById('app');

    const isGameVisible = screen === 'OVERWORLD' || screen === 'BATTLE';
    if (consoleWrapper) {
      consoleWrapper.style.display = isGameVisible ? 'flex' : 'none';
      consoleWrapper.dataset.screen = screen;
    }
    EventCenter.emit('SCREEN_CHANGED', screen);
    if (app) {
      if (isGameVisible) {
        app.classList.add('split-mode');
      } else {
        app.classList.remove('split-mode');
      }
      if (screen === 'MENU') {
        app.classList.add('menu-mode');
      } else {
        app.classList.remove('menu-mode');
      }
    }

    try {
      window.dispatchEvent(new Event('resize'));
    } catch {
      // Abaikan jika lingkungan uji tanpa window resize event
    }

    try {
      const phaser = (window as unknown as { phaserGame?: Phaser.Game }).phaserGame;
      if (phaser && phaser.scene) {
        if (screen === 'OVERWORLD') {
          if (phaser.scene.isActive('BattleScene')) phaser.scene.stop('BattleScene');
          if (!phaser.scene.isActive('WorldScene')) {
            phaser.scene.start('WorldScene');
          }
        } else if (screen === 'BATTLE') {
          if (phaser.scene.isActive('WorldScene')) phaser.scene.stop('WorldScene');
          if (!phaser.scene.isActive('BattleScene')) {
            phaser.scene.start('BattleScene');
          }
        } else {
          if (phaser.scene.isActive('WorldScene')) phaser.scene.stop('WorldScene');
          if (phaser.scene.isActive('BattleScene')) phaser.scene.stop('BattleScene');
          EventCenter.emit('LEAVE_BATTLE');
        }
      } else {
        if (screen === 'OVERWORLD') {
          EventCenter.emit('LEAVE_BATTLE');
        } else if (screen === 'BATTLE') {
          EventCenter.emit('START_BATTLE');
        } else {
          EventCenter.emit('LEAVE_BATTLE');
        }
      }
    } catch {
      // Abaikan jika scene sedang dalam siklus transisi
    }

    if (screen === 'PROGRES') {
      void (async () => {
        this.allModuleProgress = await StorageService.getAllProgress();
        this.render();
        this.scrollToTop();
      })();
    }

    if (screen === 'TRACING') {
      this.resetTracingToInitialState();
      window.setTimeout(() => {
        if (this.currentScreen === 'TRACING') {
          const visitKey = `TRACING_c${this.isCycle2Unlocked ? '2' : '1'}`;
          if (this.shownScreenGuidanceSet.has(visitKey)) {
            this.showMissionGuidanceToast(1);
          }
        }
      }, 180);
    }

    this.renderGlobalHeader();
    this.renderGlobalFooter();
    this.render();
    this.scrollToTop();
    requestAnimationFrame(() => {
      this.scrollToTop();
    });

    // Pemicu Pop-Up Modal petunjuk kontekstual saat pertama kali masuk ke layar
    this.checkAndTriggerScreenGuidanceModal(screen);
  }

  /**
   * Mengembalikan posisi scroll seluruh kontainer UI ke tampilan awal paling atas (Scroll Restoration).
   * Memastikan ketika murid berpindah halaman atau aktivitas belajar, tampilan selalu dimulai dari awal.
   */
  public scrollToTop(): void {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    const mainWorkspace = document.getElementById('main-workspace');
    if (mainWorkspace) {
      mainWorkspace.scrollTop = 0;
    }

    if (this.overlayContainer) {
      this.overlayContainer.scrollTop = 0;
    }

    const screenWrapper = this.overlayContainer?.querySelector('.screen-content-wrapper') as HTMLElement | null;
    if (screenWrapper) {
      screenWrapper.scrollTop = 0;
    }

    const contentCard = document.querySelector('.materi-content-card') as HTMLElement | null;
    if (contentCard) {
      contentCard.scrollTop = 0;
    }
  }

  /**
   * Mengembalikan seluruh state Lab Telusur ke kondisi awal (belum diapa-apain)
   * Memastikan Langkah 1 aktif, Langkah 2 belum terisi, Langkah 3 & 4 terkunci
   */
  private resetTracingToInitialState(): void {
    this.isInputApplied = false;
    this.userPrediction = null;
    this.currentStepIndex = 0;
    this.currentInputValue = this.activeModule.defaultInput;
    this.isTracingHeroCollapsed = false;
    this.tracingWizardStep = 1;
    this.isSimRunning = false;
    if (this.autoPlayTimer !== null) {
      window.clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
    if (this.syntaxRenderer) {
      this.syntaxRenderer.setLines(this.activeModule.lines, this.currentInputValue);
      this.syntaxRenderer.setActiveLine(null);
      this.syntaxRenderer.setSkippedLines([]);
    }
    this.recalculateTrace();
    if (this.flowgorithmView) {
      this.flowgorithmView.setModule(this.activeModule.id, this.currentInputValue);
    }
  }

  private renderGlobalHeader(): void {
    if (!this.globalHeader) {
      this.globalHeader = document.getElementById('global-header');
    }
    if (!this.globalHeader) return;

    this.globalHeader.innerHTML = '';
    const navBar = this.createNavigationBar();
    this.globalHeader.appendChild(navBar);
  }

  private renderGlobalFooter(): void {
    if (!this.globalFooter) {
      this.globalFooter = document.getElementById('global-footer');
    }
    if (!this.globalFooter) return;

    this.globalFooter.innerHTML = '';
    const footer = this.createUniversalFooter();
    this.globalFooter.appendChild(footer);
  }

  private render(): void {
    this.overlayContainer.innerHTML = '';

    // Cadangan jika global-header tidak ditemukan di DOM luar
    if (!this.globalHeader && !document.getElementById('global-header')) {
      const navBar = this.createNavigationBar();
      this.overlayContainer.appendChild(navBar);
    }

    // Kontainer Isi Layar Aktif
    const isGameVisible = this.currentScreen === 'OVERWORLD' || this.currentScreen === 'TRACING' || this.currentScreen === 'BATTLE';
    const screenWrapper = document.createElement('section');
    screenWrapper.className = `screen-content-wrapper ${this.currentScreen === 'MENU' ? 'is-menu' : ''} ${isGameVisible ? 'is-game-visible' : ''}`;
    screenWrapper.setAttribute('aria-label', `Layar ${this.currentScreen}`);

    switch (this.currentScreen) {
      case 'MENU':
        screenWrapper.appendChild(this.renderScreenMenu());
        break;
      case 'PANDUAN':
        screenWrapper.appendChild(this.renderScreenPanduan());
        break;
      case 'OVERWORLD':
        screenWrapper.appendChild(this.renderScreenOverworld());
        break;
      case 'DIALOG':
        screenWrapper.appendChild(this.renderScreenDialogPakBudi());
        break;
      case 'MATERI':
        screenWrapper.appendChild(this.renderScreenMateri());
        break;
      case 'TRACING':
        screenWrapper.appendChild(this.renderScreenTracing());
        break;
      case 'BATTLE':
        screenWrapper.appendChild(this.renderScreenBattle());
        break;
      case 'EVALUASI':
        screenWrapper.appendChild(this.renderScreenEvaluasi());
        break;
      case 'PROGRES':
        screenWrapper.appendChild(this.renderScreenProgres());
        break;
      case 'SETTINGS':
        screenWrapper.appendChild(this.renderScreenSettings());
        break;
      case 'OFFLINE':
        screenWrapper.appendChild(this.renderScreenOffline());
        break;
    }

    this.overlayContainer.appendChild(screenWrapper);

    // Cadangan jika global-footer tidak ditemukan di DOM luar
    if (!this.globalFooter && !document.getElementById('global-footer')) {
      this.overlayContainer.appendChild(this.createUniversalFooter());
    }
  }

  // =================================================================
  // 1. Bilah Navigasi Retro GBA & Universal Footer
  // =================================================================
  private createNavigationBar(): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'retro-navbar';

    // Masthead Editorial Resmi & Pemicu 3-Ketuk Fasilitator (Tersembunyi Bersih)
    const logoWrapper = document.createElement('div');
    logoWrapper.className = 'navbar-brand-wrapper';
    logoWrapper.setAttribute('role', 'banner');
    logoWrapper.innerHTML = `
      <div class="navbar-brand-plate">
        <img src="/assets/logo.webp" alt="iobranch Logo" class="navbar-brand-logo" />
        <div class="navbar-brand-meta">
          <span class="navbar-brand-title">IOBRANCH</span>
          <span class="navbar-brand-subtitle eyebrow-label">
            SIKLUS ${this.isCycle2Unlocked ? '2 (MAJU)' : '1 (DASAR)'}
          </span>
        </div>
      </div>
    `;

    logoWrapper.addEventListener('click', () => {
      this.handleLogoClick();
    });

    // Container Navigasi Tab dengan Tombol Bantuan Scroll
    const tabsContainer = document.createElement('nav');
    tabsContainer.className = 'gba-tab-nav-container';
    tabsContainer.setAttribute('aria-label', 'Navigasi Utama Layar');

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'gba-tab-scroll-btn gba-tab-scroll-prev';
    prevBtn.setAttribute('aria-label', 'Geser tab ke kiri');
    prevBtn.innerHTML = renderPixelIcon('arrow-left', 11, 'currentColor');

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'gba-tab-scroll-btn gba-tab-scroll-next';
    nextBtn.setAttribute('aria-label', 'Geser tab ke kanan');
    nextBtn.innerHTML = renderPixelIcon('arrow-right', 11, 'currentColor');

    // Tab Navigasi Bersih GBA (Cartridge Slots)
    const tabsWrapper = document.createElement('div');
    tabsWrapper.className = 'gba-tab-bar';

    const navItems: Array<{ id: ScreenId; label: string; icon: PixelIconType }> = [
      { id: 'MENU', label: 'BERANDA', icon: 'gamepad' },
      { id: 'PANDUAN', label: 'PANDUAN', icon: 'help' },
      { id: 'OVERWORLD', label: 'PETA', icon: 'map' },
      { id: 'DIALOG', label: 'DIALOG', icon: 'chat' },
      { id: 'MATERI', label: 'MATERI', icon: 'book' },
      { id: 'TRACING', label: 'TELUSUR', icon: 'flask' },
      { id: 'BATTLE', label: 'TANTANGAN', icon: 'swords' },
      { id: 'EVALUASI', label: 'EVALUASI', icon: 'document' },
      { id: 'PROGRES', label: 'PROGRES', icon: 'trophy' }
    ];

    let isPointerDown = false;
    let startX = 0;
    let initialScrollLeft = 0;
    let totalMoved = 0;

    navItems.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = this.currentScreen === item.id;
      const isUnlocked = this.isScreenUnlocked(item.id);
      btn.className = `gba-tab-item ${isActive ? 'active' : ''} ${!isUnlocked ? 'is-locked' : ''}`;

      const lockBadge = !isUnlocked
        ? `<span style="display: inline-flex; align-items: center; opacity: 0.75; margin-left: 3px;">${renderPixelIcon('lock', 10, 'currentColor')}</span>`
        : '';

      btn.innerHTML = `${renderPixelIcon(item.icon, 13, isActive ? '#ffffff' : (!isUnlocked ? 'var(--text-muted)' : 'var(--text-secondary)'))} <span>${item.label}</span>${lockBadge}`;
      btn.addEventListener('click', (e) => {
        if (totalMoved > 6) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        this.setScreen(item.id);
      });
      tabsWrapper.appendChild(btn);
    });

    // Gestur Geser & Tarik (Touch Swipe & Pointer Drag-to-Scroll)
    tabsWrapper.addEventListener('pointerdown', (e: PointerEvent) => {
      isPointerDown = true;
      startX = e.clientX;
      initialScrollLeft = tabsWrapper.scrollLeft;
      totalMoved = 0;
    });

    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (!isPointerDown) return;
      const dx = e.clientX - startX;
      totalMoved += Math.abs(dx);
      tabsWrapper.scrollLeft = initialScrollLeft - dx;
      if (Math.abs(dx) > 4) {
        tabsWrapper.classList.add('is-dragging');
      }
    });

    const endDrag = () => {
      if (isPointerDown) {
        isPointerDown = false;
        tabsWrapper.classList.remove('is-dragging');
      }
    };

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // Konversi Roda Mouse Vertikal ke Geser Horizontal
    tabsWrapper.addEventListener('wheel', (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        tabsWrapper.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    // Tombol Navigasi Cepat (Scroll Buttons)
    prevBtn.addEventListener('click', () => {
      tabsWrapper.scrollBy({ left: -140, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      tabsWrapper.scrollBy({ left: 140, behavior: 'smooth' });
    });

    tabsContainer.appendChild(prevBtn);
    tabsContainer.appendChild(tabsWrapper);
    tabsContainer.appendChild(nextBtn);

    // Auto-center tab aktif agar langsung tampak di layar
    setTimeout(() => {
      const activeTab = tabsWrapper.querySelector<HTMLElement>('.gba-tab-item.active');
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 60);

    const topBar = document.createElement('div');
    topBar.className = 'navbar-top-bar';
    topBar.appendChild(logoWrapper);

    const rightControls = document.createElement('div');
    rightControls.className = 'navbar-right-controls';

    // Chip Identitas Murid (Profil Taktil Impeccable)
    if (this.session) {
      const studentName = this.session.studentName || this.session.student1Name || (this.session.pairId ? `Tim ${this.session.pairId}` : 'Murid');
      const studentAbsen = this.session.studentAbsen ?? this.session.student1Absen;
      const absenText = studentAbsen !== undefined ? `Absen ${String(studentAbsen).padStart(2, '0')}` : 'Murid';

      const studentBadge = document.createElement('div');
      studentBadge.className = 'navbar-student-badge';
      studentBadge.setAttribute('title', `${absenText} • ${studentName}`);
      studentBadge.setAttribute('aria-label', `Identitas Murid: ${absenText} • ${studentName}`);
      studentBadge.innerHTML = `
        <span class="navbar-student-label">
          <span class="navbar-student-absen">${absenText}</span>
          <span class="navbar-student-sep">•</span>
          <span class="navbar-student-name">${studentName}</span>
        </span>
      `;
      rightControls.appendChild(studentBadge);
    }

    // Tombol petunjuk hanya dimunculkan pada layar aktivitas belajar (ditiadakan di halaman beranda / MENU)
    if (this.currentScreen !== 'MENU') {
      const guideBtn = document.createElement('button');
      guideBtn.type = 'button';
      guideBtn.id = 'btn-navbar-screen-guide';
      guideBtn.className = 'navbar-guide-btn';
      guideBtn.setAttribute('aria-label', 'Buka Petunjuk Halaman');
      guideBtn.setAttribute('title', 'Buka Petunjuk & Panduan Langkah Halaman Ini');
      guideBtn.innerHTML = `${renderPixelIcon('bulb', 13, 'currentColor')} <span class="guide-btn-label">Petunjuk</span>`;
      guideBtn.addEventListener('click', () => {
        soundFx.playButtonBlip();
        this.showScreenContextGuidanceModal(this.currentScreen, true);
      });
      rightControls.appendChild(guideBtn);
    }

    topBar.appendChild(rightControls);

    nav.appendChild(topBar);
    nav.appendChild(tabsContainer);
    return nav;
  }

  private createUniversalFooter(): HTMLElement {
    const footer = document.createElement('footer');
    footer.className = 'game-footer-banner';

    const isMuted = soundFx.isAudioMuted();
    const isBgmActive = soundFx.isBgmActive();

    footer.innerHTML = `
      <div class="footer-brand-minimal">
        <img src="/assets/logo.webp" alt="iobranch" class="footer-brand-logo" style="object-fit: contain;" />
        <span class="footer-brand-name">iobranch</span>
      </div>

      <div class="footer-controls-minimal">
        <button id="btn-footer-bgm" class="footer-btn-minimal" type="button" aria-label="Toggle Musik Latar" title="Nyalakan atau Matikan Musik Latar">
          <span class="footer-bgm-icon">${renderPixelIcon(isBgmActive ? 'music' : 'music-off', 12, 'currentColor')}</span>
          <span class="footer-bgm-label">${isBgmActive ? 'Musik ON' : 'Musik OFF'}</span>
        </button>
        <button id="btn-footer-audio" class="footer-btn-minimal" type="button" aria-label="Toggle Audio" title="Bisu / Aktifkan Suara Efek">
          <span class="footer-audio-icon">${renderPixelIcon(isMuted ? 'speaker-off' : 'speaker', 12, 'currentColor')}</span>
          <span class="footer-audio-label">${isMuted ? 'Bisu' : 'Suara'}</span>
        </button>
        <span class="footer-version-minimal">v1.1</span>
      </div>
    `;

    const footerLogo = footer.querySelector('.footer-brand-minimal');
    if (footerLogo) {
      footerLogo.addEventListener('click', () => {
        this.handleLogoClick();
      });
    }

    // Pasang handler interaksi kontrol footer
    const bgmFooterBtn = footer.querySelector<HTMLButtonElement>('#btn-footer-bgm');
    if (bgmFooterBtn) {
      bgmFooterBtn.addEventListener('click', () => {
        soundFx.playButtonBlip();
        soundFx.toggleBgm();
      });
    }

    const audioBtn = footer.querySelector<HTMLButtonElement>('#btn-footer-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const muted = soundFx.toggleMute();
        soundFx.playButtonBlip();
        const iconSpan = audioBtn.querySelector('.footer-audio-icon');
        const labelSpan = audioBtn.querySelector('.footer-audio-label');
        if (iconSpan) {
          iconSpan.innerHTML = renderPixelIcon(muted ? 'speaker-off' : 'speaker', 12, 'currentColor');
``        }
        if (labelSpan) {
          labelSpan.textContent = muted ? 'Bisu' : 'Suara';
        }
      });
    }

    return footer;
  }

  private handleLogoClick(): void {
    this.logoClickCount++;
    if (this.logoClickTimer !== null) {
      window.clearTimeout(this.logoClickTimer);
    }
    this.logoClickTimer = window.setTimeout(() => {
      this.logoClickCount = 0;
    }, 1200);

    if (this.logoClickCount >= 3) {
      this.logoClickCount = 0;
      soundFx.playLogicTrue();
      this.showTeacherModal();
    }
  }

  // =================================================================
  // Layar 01: Halaman Awal / Menu Utama & Hero Landing
  // =================================================================
  public renderScreenHome(): HTMLElement {
    return this.renderScreenMenu();
  }

  private renderScreenMenu(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'hero-landing-wrapper';

    const hasSession = !!this.session;
    const hasReadGuide = !!(this.progressionState?.stepGuideCompleted || this.progressionState?.teacherBypassMode || hasSession);

    wrapper.innerHTML = `
      <!-- Panggung Visual Latar Belakang (Gambar Hero + Masking Transparansi Lembut) -->
      <div class="hero-stage-grid" aria-hidden="true">
        <img
          src="/assets/hero_image.webp"
          alt=""
          class="hero-character-visual"
          loading="eager"
          decoding="async"
        />
        <div class="hero-landing-overlay hero-backdrop-layer"></div>
      </div>

      <!-- Kartu Menu Interaktif (Tactile Parchment Dossier - 100% Solid & Jelas) -->
      <div class="hero-menu-card tactile-card">
        <div class="hero-header-block">
            <div class="hero-menu-logo-box">
              <img id="hero-menu-logo" src="/assets/logo.webp" alt="iobranch Logo" class="hero-menu-logo" title="iobranch" />
            </div>
          <h1 class="hero-card-title">
            IOBRANCH: LOGIC BRANCHING
          </h1>
          <p class="hero-card-subtitle">
            Media Pembelajaran Interaktif Penelusuran Alur Kode (Tracing) dan Percabangan Logika
          </p>
        </div>

        <!-- Info Sesi Murid Aktif (Jika Terdaftar) -->
        ${this.session ? `
          <div class="tactile-panel hero-student-profile-panel">
            <div class="hero-student-meta">
              <span class="eyebrow-label hero-student-role">Murid Terdaftar</span>
              <div class="hero-student-name">
                ${this.session.studentName
                  ? `Absen ${String(this.session.studentAbsen || 0).padStart(2, '0')} • ${escapeHtml(this.session.studentName)}`
                  : `${escapeHtml(this.session.pairId || 'Murid')} (${escapeHtml(this.session.student1Name || '')} &amp; ${escapeHtml(this.session.student2Name || '')})`
                }
              </div>
            </div>
            <span class="badge-pill hero-student-score">
              Nilai Formatif: ${this.formativeScores?.finalScore ?? 0} / 100
            </span>
          </div>
        ` : ''}

        <!-- Indikator Tahap Belajar & Tombol Buka Siklus 2 -->
        <div class="hero-cycle-strip">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="eyebrow-label" style="font-size: 9.5px; color: var(--text-secondary);">Tahap Belajar:</span>
            <span style="font-size: 11.5px; font-weight: 700; color: ${this.isCycle2Unlocked ? 'var(--warning-dark, #92400e)' : 'var(--primary)'};">
              ${this.isCycle2Unlocked ? 'Siklus 2 (Maju)' : 'Siklus 1 (Dasar)'}
            </span>
          </div>
          ${!this.isCycle2Unlocked
            ? `<button id="btn-menu-token" type="button" class="game-btn game-btn-gold btn-menu-token-trigger" style="font-size: 11px; padding: 6px 12px; min-height: 44px; display: inline-flex; align-items: center; gap: 6px;" title="Masukkan Token Kelas dari Guru untuk Membuka Siklus 2">
                ${renderPixelIcon('lock', 11, '#ffffff')} Buka Siklus 2
              </button>`
            : `<span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--success); border-color: var(--success); background: rgba(21, 128, 61, 0.1);">
                ${renderPixelIcon('check', 10, 'var(--success)')} Siklus 2 Aktif
              </span>`
          }
        </div>

        <!-- Hierarki Tombol Aksi Impeccable -->
        <div class="hero-actions-container">
          ${!hasSession ? `
            <!-- Kasus A: Murid Baru / Belum Terdaftar -->
            <button id="btn-start-game" type="button" class="game-btn game-btn-gold hero-primary-btn" style="min-height: 50px;">
              ${renderPixelIcon(hasReadGuide ? 'play' : 'book', 14, '#ffffff')}
              <span>${hasReadGuide ? 'Daftarkan Profil Murid' : '1. Baca Panduan &amp; Mulai Pendaftaran'}</span>
            </button>
            ${hasReadGuide ? `
              <div class="hero-utility-grid">
                <button id="btn-menu-panduan" type="button" class="game-btn game-btn-secondary hero-utility-btn">
                  ${renderPixelIcon('help', 13, 'var(--primary)')} <span>Panduan Belajar</span>
                </button>
                <button id="btn-menu-settings" type="button" class="game-btn game-btn-secondary hero-utility-btn">
                  ${renderPixelIcon('gear', 13, 'var(--primary)')} <span>Pengaturan</span>
                </button>
              </div>
            ` : `
              <button id="btn-menu-settings" type="button" class="hero-secondary-utility-link">
                ${renderPixelIcon('gear', 13, 'currentColor')} <span>Pengaturan</span>
              </button>
            `}
          ` : `
            <!-- Kasus B: Sesi Murid Aktif Terdaftar -->
            <button id="btn-start-game" type="button" class="game-btn game-btn-gold hero-primary-btn" style="min-height: 52px;">
              ${renderPixelIcon('play', 14, '#ffffff')}
              <span>Lanjutkan Petualangan Logika</span>
            </button>
            <button id="btn-menu-progres" type="button" class="game-btn game-btn-secondary hero-secondary-btn tactile-action-btn">
              ${renderPixelIcon('trophy', 14, 'var(--primary)')}
              <span>Lihat Portofolio &amp; Capaian Nilai</span>
            </button>
            <div class="hero-utility-grid">
              <button id="btn-menu-panduan" type="button" class="game-btn game-btn-secondary hero-utility-btn">
                ${renderPixelIcon('help', 13, 'var(--primary)')} <span>Panduan Belajar</span>
              </button>
              <button id="btn-menu-settings" type="button" class="game-btn game-btn-secondary hero-utility-btn">
                ${renderPixelIcon('gear', 13, 'var(--primary)')} <span>Pengaturan</span>
              </button>
            </div>
          `}
        </div>

        <!-- Tautan Ganti Akun Murid yang Aman dan Terhindar dari Reset Tak Sengaja -->
        ${this.session ? `
          <div class="hero-footer-account">
            <button id="btn-menu-switch-profile" type="button" class="hero-discrete-link">
              Ingin berganti akun? <span>Ganti Profil Murid</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    wrapper.querySelector('#hero-menu-logo')?.addEventListener('click', () => {
      this.handleLogoClick();
    });

    wrapper.querySelectorAll<HTMLButtonElement>('.btn-menu-token-trigger, #btn-menu-token').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundFx.playButtonBlip();
        this.showStudentTokenModal();
      });
    });

    wrapper.querySelector<HTMLButtonElement>('#btn-start-game')?.addEventListener('click', () => {
      if (!this.session) {
        if (!hasReadGuide) {
          soundFx.playButtonBlip();
          this.setScreen('PANDUAN');
          return;
        }
        soundFx.playButtonBlip();
        this.showOnboardingModal();
      } else {
        soundFx.playButtonBlip();
        this.setScreen('OVERWORLD');
      }
    });

    wrapper.querySelector<HTMLButtonElement>('#btn-menu-progres')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.setScreen('PROGRES');
    });

    wrapper.querySelector<HTMLButtonElement>('#btn-menu-panduan')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.setScreen('PANDUAN');
    });

    wrapper.querySelector<HTMLButtonElement>('#btn-menu-settings')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.setScreen('SETTINGS');
    });

    wrapper.querySelector<HTMLButtonElement>('#btn-menu-switch-profile')?.addEventListener('click', () => {
      this.showCelebrationModal(
        'Ganti Profil Murid',
        'Apakah kamu yakin ingin mengganti akun profil murid? Data progres yang telah dicapai tetap tersimpan di penyimpanan perangkat lokal.',
        [
          {
            label: 'Ganti Profil',
            isPrimary: true,
            action: async () => {
              await StorageService.clearSession();
              this.session = undefined;
              this.render();
            }
          },
          {
            label: 'Batalkan',
            isPrimary: false,
            action: () => { }
          }
        ]
      );
    });

    return wrapper;
  }

  // =================================================================
  // Layar: Panduan Permainan & Alur Aksi Murid (Progressive Disclosure Stack)
  // =================================================================
  private renderScreenPanduan(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'guide-page-container';

    const hasSession = !!this.session;
    const hasReadGuide = !!(this.progressionState?.stepGuideCompleted || this.progressionState?.teacherBypassMode || hasSession);

    // Jika murid sudah pernah menuntaskan panduan, seluruh stack langsung terbuka agar bebas dibaca ulang
    if (hasReadGuide) {
      this.maxUnlockedGuideStack = 3;
    }

    container.innerHTML = `
      <!-- 1. Header Panduan Dossier -->
      <section class="tactile-card" style="padding: 20px 22px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          <div>
            <span class="eyebrow-label" style="color: var(--primary); margin-bottom: 3px; display: block;">
              Panduan Belajar Murid • Informatika
            </span>
            <h1 style="font-size: 16.5px; font-weight: 700; color: var(--text-primary); margin: 3px 0 2px; letter-spacing: 0.2px;">
              Petunjuk Petualangan &amp; Alur Misi Logika
            </h1>
            <p style="font-size: 12px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
              Panduan terstruktur untuk menelusuri logika percabangan <em>if-else</em> secara mandiri terbimbing.
            </p>
          </div>
          <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; color: var(--warning-dark); background: rgba(217, 119, 6, 0.08); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(217, 119, 6, 0.2); letter-spacing: 0.3px;">
            <span style="width: 5px; height: 5px; border-radius: 50%; background-color: var(--warning-dark);"></span>
            1 Murid • 1 Perangkat
          </span>
        </div>
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.55; margin: 0;">
          Pelajari 3 tahap panduan di bawah ini secara berurutan untuk memahami alur petualangan logika di kelas.
        </p>
      </section>

      <!-- Bilah Stepper Progres Panduan -->
      <div class="guide-stepper-box">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <span style="font-family: var(--font-code); font-size: 11px; font-weight: 700; color: var(--primary); display: inline-flex; align-items: center; gap: 6px;">
            ${renderPixelIcon('target', 12, 'var(--primary)')} Langkah Panduan Bertahap
          </span>
          <span id="guide-progress-text" style="font-family: var(--font-code); font-size: 10.5px; font-weight: 700; color: var(--text-secondary);">
            Tahap ${this.activeGuideStack} dari 3 • ${hasReadGuide || this.maxUnlockedGuideStack === 3 ? '100% Siap' : `${Math.round((this.activeGuideStack / 3) * 100)}% Dibaca`}
          </span>
        </div>
        <div class="guide-progress-track">
          <div id="guide-progress-fill" class="guide-progress-fill" style="width: ${hasReadGuide || this.maxUnlockedGuideStack === 3 ? '100%' : `${(this.activeGuideStack / 3) * 100}%`};"></div>
        </div>
        <div class="guide-stepper-pills">
          <button id="guide-stepper-pill-1" type="button" class="guide-stepper-pill ${this.activeGuideStack === 1 ? 'active' : (this.maxUnlockedGuideStack >= 2 ? 'completed' : '')}">
            ${renderPixelIcon('gamepad', 12, 'currentColor')} <span>Langkah 1: Pola Mandiri</span>
          </button>
          <button id="guide-stepper-pill-2" type="button" class="guide-stepper-pill ${this.activeGuideStack === 2 ? 'active' : (this.maxUnlockedGuideStack >= 3 ? 'completed' : (this.maxUnlockedGuideStack < 2 && !hasReadGuide ? 'locked' : ''))}">
            ${renderPixelIcon(this.maxUnlockedGuideStack >= 2 || hasReadGuide ? 'map' : 'lock', 12, 'currentColor')} <span>Langkah 2: Peta Misi</span>
          </button>
          <button id="guide-stepper-pill-3" type="button" class="guide-stepper-pill ${this.activeGuideStack === 3 ? 'active' : (this.maxUnlockedGuideStack >= 3 ? (hasReadGuide ? 'completed' : '') : (hasReadGuide ? '' : 'locked'))}">
            ${renderPixelIcon(this.maxUnlockedGuideStack >= 3 || hasReadGuide ? 'target' : 'lock', 12, 'currentColor')} <span>Langkah 3: Target Capaian</span>
          </button>
        </div>
      </div>

      <!-- LANGKAH 1: Pola Mandiri 1 Murid 1 Perangkat di Lab Komputer -->
      <article id="guide-stack-card-1" class="guide-stack-card active">
        <button id="guide-stack-header-1" type="button" class="guide-stack-header" aria-expanded="true">
          <div class="guide-stack-title-box">
            <div class="guide-stack-num-badge">01</div>
            <div>
              <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary);">
                Pola Mandiri di Lab Komputer
              </div>
              <div style="font-size: 11px; color: var(--text-secondary); margin-top: 1px;">
                1 Murid • 1 Perangkat (Fokus Penuh &amp; Eksplorasi Digital)
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="guide-stack-badge-1" class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); border: 1px solid rgba(15, 118, 110, 0.25); background: rgba(15, 118, 110, 0.08); display: inline-flex; align-items: center; gap: 4px;">
              <span style="width: 5px; height: 5px; border-radius: 50%; background: var(--primary);"></span> Sedang Dibaca
            </span>
            <span id="guide-stack-chevron-1" class="guide-stack-chevron expanded">
              ${renderPixelIcon('arrow-down', 12, 'var(--text-secondary)')}
            </span>
          </div>
        </button>

        <div id="guide-stack-body-1" class="guide-stack-body">
          <p style="font-size: 12.5px; color: var(--text-primary); line-height: 1.6; margin-bottom: 12px;">
            Setiap murid memegang <strong>1 perangkat mandiri</strong> di laboratorium komputer untuk mengeksplorasi kode logika secara langsung tanpa kendala lembar fisik:
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 10px; font-size: 12px; color: var(--text-secondary);">
            <div style="padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.07); border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                ${renderPixelIcon('gamepad', 13, 'var(--primary)')}
                <strong style="color: var(--primary);">Penyelidikan Mandiri di Perangkat:</strong>
              </div>
              Menguji nilai masukan pada kasus logika, mengamati eksekusi cabang baris demi baris di kanvas, dan membuktikan hasil secara mandiri.
            </div>
            <div style="padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.07); border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                ${renderPixelIcon('save', 13, 'var(--primary)')}
                <strong style="color: var(--primary);">Pencatatan Portofolio Digital:</strong>
              </div>
              Seluruh kemajuan belajar, capaian bintang cabang, dan skor tantangan tersimpan otomatis di perangkat lokal tanpa risiko data hilang.
            </div>
          </div>

          <div class="guide-advance-btn-box">
            <button id="btn-advance-stack-1" type="button" class="game-btn game-btn-primary" style="width: 100%; min-height: 48px; font-size: 13px; font-weight: 700; gap: 8px; justify-content: center;">
              <span>Pahami Pola Ini &amp; Lanjut ke Langkah 2: Peta Misi Digital</span>
              ${renderPixelIcon('arrow-right', 12, '#ffffff')}
            </button>
          </div>
        </div>
      </article>

      <!-- LANGKAH 2: Peta Misi Digital 4 Tahap -->
      <article id="guide-stack-card-2" class="guide-stack-card ${hasReadGuide ? '' : 'locked'}">
        <button id="guide-stack-header-2" type="button" class="guide-stack-header" aria-expanded="false">
          <div class="guide-stack-title-box">
            <div class="guide-stack-num-badge">02</div>
            <div>
              <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary);">
                Peta Misi Digital 4 Tahap
              </div>
              <div style="font-size: 11px; color: var(--text-secondary); margin-top: 1px;">
                Alur Berurutan: Materi -&gt; Telusur -&gt; Tantangan -&gt; Posttest
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="guide-stack-badge-2" class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${hasReadGuide ? 'var(--success)' : 'var(--text-muted)'}; border: 1px solid ${hasReadGuide ? 'rgba(21, 128, 61, 0.25)' : 'rgba(28, 25, 23, 0.15)'}; background: ${hasReadGuide ? 'rgba(21, 128, 61, 0.08)' : 'rgba(0, 0, 0, 0.04)'}; display: inline-flex; align-items: center; gap: 4px;">
              ${renderPixelIcon(hasReadGuide ? 'check' : 'lock', 10, 'currentColor')} ${hasReadGuide ? 'Selesai Dibaca' : 'Terkunci'}
            </span>
            <span id="guide-stack-chevron-2" class="guide-stack-chevron">
              ${renderPixelIcon('arrow-down', 12, 'var(--text-secondary)')}
            </span>
          </div>
        </button>

        <div id="guide-stack-body-2" class="guide-stack-body" style="display: none;">
          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.55; margin-bottom: 12px;">
            Selesaikan 4 tahap misi terarah berikut secara berurutan untuk menuntaskan petualangan:
          </p>

          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px;">
            <div style="display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
              <div style="width: 28px; height: 28px; border-radius: 6px; background: var(--primary); color: #ffffff; display: flex; align-items: center; justify-content: center; font-family: var(--font-code); font-size: 11px; font-weight: 700; flex-shrink: 0;">
                01
              </div>
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
                  1. Pahami Materi Digital
                </div>
                <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.45;">
                  ${this.isCycle2Unlocked
                    ? 'Pelajari konsep percabangan bertingkat (ELSE-IF dan SWITCH-CASE) beserta contoh kode dan diagram alur interaktif.'
                    : 'Pelajari konsep dasar percabangan (IF dan IF-ELSE) beserta contoh kode dan diagram alur interaktif.'}
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
              <div style="width: 28px; height: 28px; border-radius: 6px; background: var(--warning-dark); color: #ffffff; display: flex; align-items: center; justify-content: center; font-family: var(--font-code); font-size: 11px; font-weight: 700; flex-shrink: 0;">
                02
              </div>
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
                  2. Uji Kasus di Lab Telusur
                </div>
                <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.45;">
                  Masukkan nilai uji, buat prediksi kondisi, dan telusuri alur eksekusi baris demi baris hingga meraih 2 Bintang.
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
              <div style="width: 28px; height: 28px; border-radius: 6px; background: var(--danger); color: #ffffff; display: flex; align-items: center; justify-content: center; font-family: var(--font-code); font-size: 11px; font-weight: 700; flex-shrink: 0;">
                03
              </div>
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
                  3. Taklukkan Arena Tantangan
                </div>
                <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.45;">
                  Hadapi Bug Monster dengan menganalisis nilai variabel secara akurat untuk melancarkan serangan logika tepat sasaran.
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
              <div style="width: 28px; height: 28px; border-radius: 6px; background: var(--success); color: #ffffff; display: flex; align-items: center; justify-content: center; font-family: var(--font-code); font-size: 11px; font-weight: 700; flex-shrink: 0;">
                04
              </div>
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
                  4. ${this.isCycle2Unlocked ? 'Posttest Form C &amp; Kirim Rekap' : 'Posttest Form B &amp; Kirim Rekap'}
                </div>
                <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.45;">
                  Kerjakan evaluasi akhir mandiri, unduh salinan berkas lokal, lalu kirimkan laporan nilai 1-Klik ke Google Drive Guru.
                </div>
              </div>
            </div>
          </div>

          <div class="guide-advance-btn-box">
            <button id="btn-advance-stack-2" type="button" class="game-btn game-btn-primary" style="width: 100%; min-height: 48px; font-size: 13px; font-weight: 700; gap: 8px; justify-content: center;">
              <span>Pahami Peta Misi &amp; Lanjut ke Langkah 3: Target Capaian</span>
              ${renderPixelIcon('arrow-right', 12, '#ffffff')}
            </button>
          </div>
        </div>
      </article>

      <!-- LANGKAH 3: Target Capaian (Dinamis Antar-Siklus) -->
      <article id="guide-stack-card-3" class="guide-stack-card ${hasReadGuide ? '' : 'locked'}">
        <button id="guide-stack-header-3" type="button" class="guide-stack-header" aria-expanded="false">
          <div class="guide-stack-title-box">
            <div class="guide-stack-num-badge">03</div>
            <div>
              <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary);">
                Target Capaian &amp; Rekapitulasi
              </div>
              <div style="font-size: 11px; color: var(--text-secondary); margin-top: 1px;">
                ${this.isCycle2Unlocked
                  ? 'Tuntaskan Kasus 4 &amp; 5 (2 Bintang • Total 100 Poin)'
                  : 'Tuntaskan 3 Kasus Wajib (Kasus 1, 2, &amp; 3 • Total 100 Poin)'}
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="guide-stack-badge-3" class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${hasReadGuide ? 'var(--success)' : 'var(--text-muted)'}; border: 1px solid ${hasReadGuide ? 'rgba(21, 128, 61, 0.25)' : 'rgba(28, 25, 23, 0.15)'}; background: ${hasReadGuide ? 'rgba(21, 128, 61, 0.08)' : 'rgba(0, 0, 0, 0.04)'}; display: inline-flex; align-items: center; gap: 4px;">
              ${renderPixelIcon(hasReadGuide ? 'check' : 'lock', 10, 'currentColor')} ${hasReadGuide ? 'Selesai Dibaca' : 'Terkunci'}
            </span>
            <span id="guide-stack-chevron-3" class="guide-stack-chevron">
              ${renderPixelIcon('arrow-down', 12, 'var(--text-secondary)')}
            </span>
          </div>
        </button>

        <div id="guide-stack-body-3" class="guide-stack-body" style="display: none;">
          ${this.isCycle2Unlocked ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 10px; margin-bottom: 14px;">
            <div style="padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.07); border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(15, 118, 110, 0.1); border-color: rgba(15, 118, 110, 0.25);">
                  Kasus 4 • 50 Poin
                </span>
                <span style="font-family: var(--font-code); font-size: 10.5px; font-weight: 700; color: var(--text-muted);">ELSE-IF</span>
              </div>
              <div style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px;">
                Router Wi-Fi Laboratorium
              </div>
              <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.45;">
                Uji cabang Cepat (&gt;= 50 Mbps), Sedang (&gt;= 20 Mbps), dan Lambat (&lt; 20 Mbps) untuk membuktikan alur bertingkat.
              </div>
            </div>

            <div style="padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.07); border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(15, 118, 110, 0.1); border-color: rgba(15, 118, 110, 0.25);">
                  Kasus 5 • 50 Poin
                </span>
                <span style="font-family: var(--font-code); font-size: 10.5px; font-weight: 700; color: var(--text-muted);">SWITCH-CASE</span>
              </div>
              <div style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px;">
                Mesin Minuman Otomatis
              </div>
              <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.45;">
                Uji menu Kopi (1), Teh (2), Susu (3), dan cabang Standar / Batal (9) untuk melengkapi pengujian multi-kategori.
              </div>
            </div>
          </div>

          <div style="padding: 10px 14px; background: rgba(21, 128, 61, 0.06); border: 1px solid rgba(21, 128, 61, 0.2); border-radius: 8px; margin-bottom: 16px; font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">
            <strong style="color: var(--success);">Standar Kelulusan:</strong> Menyelesaikan salah satu kasus memberi <strong>1 Bintang (50 Poin)</strong>, dan menuntaskan kedua kasus mengunci <strong>2 Bintang (100 Poin Penuh)</strong> pada percobaan pertama.
          </div>
          ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 10px; margin-bottom: 14px;">
            <div style="padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.07); border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(15, 118, 110, 0.1); border-color: rgba(15, 118, 110, 0.25);">
                  Kasus 1 • 30 Poin
                </span>
                <span style="font-family: var(--font-code); font-size: 10.5px; font-weight: 700; color: var(--text-muted);">IF</span>
              </div>
              <div style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px;">
                Palang Pintu Kereta MRT
              </div>
              <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.45;">
                Uji kecukupan saldo tiket (&gt;= 14.000) untuk membuka gerbang otomatis masuk stasiun kereta.
              </div>
            </div>

            <div style="padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.07); border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(15, 118, 110, 0.1); border-color: rgba(15, 118, 110, 0.25);">
                  Kasus 2 • 30 Poin
                </span>
                <span style="font-family: var(--font-code); font-size: 10.5px; font-weight: 700; color: var(--text-muted);">IF-ELSE</span>
              </div>
              <div style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px;">
                Radar Tilang Kecepatan
              </div>
              <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.45;">
                Uji kecepatan kendaraan (&gt; 80 km/jam) untuk memisahkan jalur tilang kamera dan jalur normal.
              </div>
            </div>

            <div style="padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.07); border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(15, 118, 110, 0.1); border-color: rgba(15, 118, 110, 0.25);">
                  Kasus 3 • 40 Poin
                </span>
                <span style="font-family: var(--font-code); font-size: 10.5px; font-weight: 700; color: var(--text-muted);">KONDISI</span>
              </div>
              <div style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px;">
                Kasir Toko Kota Harmoni
              </div>
              <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.45;">
                Uji total belanja (&gt;= 100.000) untuk memberikan potongan diskon belanja otomatis bagi pelanggan.
              </div>
            </div>
          </div>

          <div style="padding: 10px 14px; background: rgba(21, 128, 61, 0.06); border: 1px solid rgba(21, 128, 61, 0.2); border-radius: 8px; margin-bottom: 16px; font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">
            <strong style="color: var(--success);">Standar Kelulusan:</strong> Menuntaskan 3 Kasus Wajib mengunci <strong>2 Bintang (100 Poin Penuh)</strong> pada percobaan pertama di perangkat masing-masing.
          </div>
          `}

          <!-- Konfirmasi Final Card -->
          <div class="tactile-card" style="padding: 20px 18px; text-align: center; border: 1px solid ${!hasReadGuide ? 'rgba(15, 118, 110, 0.3)' : 'var(--border-subtle)'}; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px -2px rgba(15, 118, 110, 0.06);">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(15, 118, 110, 0.08); margin-bottom: 8px; border: 1px solid rgba(15, 118, 110, 0.25);">
              ${renderPixelIcon(hasReadGuide ? 'check' : 'book', 20, 'var(--primary)')}
            </div>
            <h2 style="font-size: 14.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
              ${!hasReadGuide ? 'Siap Memulai Petualangan Logika?' : 'Panduan Berhasil Dipahami'}
            </h2>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 14px; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.5;">
              ${!hasReadGuide
                ? 'Klik tombol di bawah untuk membuka formulir pendaftaran identitas murid dan memulai misi.'
                : 'Pilih menu aksi di bawah untuk melanjutkan penelusuran logika di media pembelajaran iobranch.'
              }
            </p>

            <div class="guide-nav-bar">
              ${!hasReadGuide ? `
                <button id="btn-complete-guide" type="button" class="game-btn game-btn-gold" style="min-height: 48px; font-size: 12px; font-family: var(--font-pixel); width: 100%; max-width: 440px; gap: 8px;">
                  ${renderPixelIcon('check', 13, '#ffffff')} Saya Paham Panduan, Daftarkan Profil ${renderPixelIcon('arrow-right', 12, '#ffffff')}
                </button>
              ` : `
                <button id="btn-guide-start" type="button" class="game-btn game-btn-gold" style="min-height: 48px; font-size: 11.5px; font-family: var(--font-pixel); padding: 8px 16px;">
                  ${renderPixelIcon('play', 12, '#ffffff')} ${this.session ? 'Lanjutkan ke Peta' : 'Mulai Pendaftaran'}
                </button>
                <div class="guide-nav-group-secondary">
                  <button id="btn-guide-materi" type="button" class="game-btn game-btn-primary" style="min-height: 44px; font-size: 12px;">
                    ${renderPixelIcon('book', 13, '#ffffff')} Pelajari Materi
                  </button>
                  <button id="btn-guide-tracing" type="button" class="game-btn game-btn-secondary" style="min-height: 44px; font-size: 12px;">
                    ${renderPixelIcon('flask', 13, 'var(--primary)')} Buka Lab Telusur
                  </button>
                </div>
              `}
            </div>
          </div>
        </div>
      </article>
    `;

    // Interaktivitas Accordion Progressive Disclosure Stack
    const stackCards = [
      container.querySelector<HTMLElement>('#guide-stack-card-1'),
      container.querySelector<HTMLElement>('#guide-stack-card-2'),
      container.querySelector<HTMLElement>('#guide-stack-card-3')
    ];
    const stackBodies = [
      container.querySelector<HTMLElement>('#guide-stack-body-1'),
      container.querySelector<HTMLElement>('#guide-stack-body-2'),
      container.querySelector<HTMLElement>('#guide-stack-body-3')
    ];
    const stackBadges = [
      container.querySelector<HTMLElement>('#guide-stack-badge-1'),
      container.querySelector<HTMLElement>('#guide-stack-badge-2'),
      container.querySelector<HTMLElement>('#guide-stack-badge-3')
    ];
    const stackChevrons = [
      container.querySelector<HTMLElement>('#guide-stack-chevron-1'),
      container.querySelector<HTMLElement>('#guide-stack-chevron-2'),
      container.querySelector<HTMLElement>('#guide-stack-chevron-3')
    ];
    const stepperPills = [
      container.querySelector<HTMLButtonElement>('#guide-stepper-pill-1'),
      container.querySelector<HTMLButtonElement>('#guide-stepper-pill-2'),
      container.querySelector<HTMLButtonElement>('#guide-stepper-pill-3')
    ];
    const progressFill = container.querySelector<HTMLElement>('#guide-progress-fill');
    const progressText = container.querySelector<HTMLElement>('#guide-progress-text');

    const updateStackViews = (targetStack: 1 | 2 | 3, shouldScroll = false) => {
      this.activeGuideStack = targetStack;
      const isComplete = this.maxUnlockedGuideStack === 3 && hasReadGuide;

      // Update Stepper Bar
      const percent = isComplete ? 100 : Math.round((this.activeGuideStack / 3) * 100);
      if (progressFill) progressFill.style.width = `${percent}%`;
      if (progressText) {
        progressText.textContent = isComplete
          ? 'Panduan Lengkap (100% Siap)'
          : `Tahap ${this.activeGuideStack} dari 3 • ${percent}% Dibaca`;
      }

      for (let i = 1; i <= 3; i++) {
        const idx = i - 1;
        const card = stackCards[idx];
        const body = stackBodies[idx];
        const badge = stackBadges[idx];
        const chevron = stackChevrons[idx];
        const pill = stepperPills[idx];

        if (!card || !body || !badge || !chevron || !pill) continue;

        const isUnlocked = i <= this.maxUnlockedGuideStack || hasReadGuide;
        const isOpen = i === this.activeGuideStack;
        const isCompleted = (i < this.maxUnlockedGuideStack) || hasReadGuide;

        // Card classes
        card.classList.toggle('active', isOpen);
        card.classList.toggle('locked', !isUnlocked);
        card.classList.toggle('completed', isCompleted && !isOpen);

        // Body display
        body.style.display = isOpen ? 'block' : 'none';

        // Chevron
        chevron.classList.toggle('expanded', isOpen);

        // Badge
        if (!isUnlocked) {
          badge.innerHTML = `${renderPixelIcon('lock', 10, 'var(--text-muted)')} <span style="font-size: 10px; color: var(--text-muted); font-weight: 700;">Terkunci</span>`;
          badge.style.borderColor = 'rgba(28, 25, 23, 0.15)';
          badge.style.background = 'rgba(0, 0, 0, 0.04)';
          badge.style.color = 'var(--text-muted)';
        } else if (isOpen) {
          badge.innerHTML = `<span style="width: 5px; height: 5px; border-radius: 50%; background: var(--primary);"></span> <span style="font-size: 10px; color: var(--primary); font-weight: 700;">Sedang Dibaca</span>`;
          badge.style.borderColor = 'rgba(15, 118, 110, 0.25)';
          badge.style.background = 'rgba(15, 118, 110, 0.08)';
          badge.style.color = 'var(--primary)';
        } else {
          badge.innerHTML = `${renderPixelIcon('check', 10, 'var(--success)')} <span style="font-size: 10px; color: var(--success); font-weight: 700;">Selesai Dibaca</span>`;
          badge.style.borderColor = 'rgba(21, 128, 61, 0.25)';
          badge.style.background = 'rgba(21, 128, 61, 0.08)';
          badge.style.color = 'var(--success)';
        }

        // Stepper Pill
        pill.className = `guide-stepper-pill ${isOpen ? 'active' : (isCompleted ? 'completed' : (isUnlocked ? '' : 'locked'))}`;
        const pillIcon = !isUnlocked ? 'lock' : (i === 1 ? 'gamepad' : (i === 2 ? 'map' : 'target'));
        const pillLabel = i === 1 ? 'Langkah 1: Pola Mandiri' : (i === 2 ? 'Langkah 2: Peta Misi' : 'Langkah 3: Target Capaian');
        pill.innerHTML = `${renderPixelIcon(pillIcon, 12, 'currentColor')} <span>${pillLabel}</span>`;
      }

      if (shouldScroll) {
        const activeCard = stackCards[targetStack - 1];
        if (activeCard) {
          activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };

    // Handler klik Header Stack & Pill Navigasi
    for (let i = 1; i <= 3; i++) {
      const idx = i - 1;
      const headerBtn = container.querySelector<HTMLButtonElement>(`#guide-stack-header-${i}`);
      const pill = stepperPills[idx];

      const handleStepClick = () => {
        const isUnlocked = i <= this.maxUnlockedGuideStack || hasReadGuide;
        if (!isUnlocked) {
          soundFx.playLogicFalse();
          this.showRetroToast(`Selesaikan dan pahami Tahap ${i - 1} terlebih dahulu.`, false);
          const c = stackCards[idx];
          if (c) {
            c.classList.add('shake');
            setTimeout(() => c.classList.remove('shake'), 400);
          }
          return;
        }
        soundFx.playButtonBlip();
        updateStackViews(i as 1 | 2 | 3, true);
      };

      headerBtn?.addEventListener('click', handleStepClick);
      pill?.addEventListener('click', handleStepClick);
    }

    // Tombol Lanjut ke Tahap 2
    container.querySelector<HTMLButtonElement>('#btn-advance-stack-1')?.addEventListener('click', () => {
      soundFx.playBranchSuccessChime();
      this.maxUnlockedGuideStack = Math.max(this.maxUnlockedGuideStack, 2) as 1 | 2 | 3;
      updateStackViews(2, true);
    });

    // Tombol Lanjut ke Tahap 3
    container.querySelector<HTMLButtonElement>('#btn-advance-stack-2')?.addEventListener('click', () => {
      soundFx.playBranchSuccessChime();
      this.maxUnlockedGuideStack = Math.max(this.maxUnlockedGuideStack, 3) as 1 | 2 | 3;
      updateStackViews(3, true);
    });

    // Event Listeners Tombol Aksi Konfirmasi Final
    container.querySelector<HTMLButtonElement>('#btn-complete-guide')?.addEventListener('click', async () => {
      soundFx.playLogicTrue();
      this.progressionState = await StorageService.saveProgressionState({ stepGuideCompleted: true });
      this.showRetroToast('Panduan berhasil dipahami! Langkah pendaftaran profil murid kini dibuka.', true);
      this.showOnboardingModal();
    });

    container.querySelector<HTMLButtonElement>('#btn-guide-start')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      if (!this.session) {
        this.showOnboardingModal();
      } else {
        this.setScreen('OVERWORLD');
      }
    });

    container.querySelector<HTMLButtonElement>('#btn-guide-materi')?.addEventListener('click', () => {
      this.setScreen('MATERI');
    });

    container.querySelector<HTMLButtonElement>('#btn-guide-tracing')?.addEventListener('click', () => {
      this.setScreen('TRACING');
    });

    container.querySelector<HTMLButtonElement>('#btn-unlock-cycle2-materi')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.showStudentTokenModal();
    });

    return container;
  }

  // Modal Registrasi Profil Murid (Mode Mandiri)
  private showOnboardingModal(): void {
    const hasReadGuide = !!(this.progressionState?.stepGuideCompleted || this.progressionState?.teacherBypassMode || this.session);
    if (!hasReadGuide) {
      soundFx.playLogicFalse();
      this.showRetroToast('Kamu wajib membaca Panduan Petualangan terlebih dahulu sebelum mendaftar!', false);
      this.setScreen('PANDUAN');
      return;
    }

    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    modalBackdrop.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(28, 25, 23, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    `;

    const modalContent = document.createElement('div');
    modalContent.className = 'tactile-card';
    modalContent.setAttribute('role', 'dialog');
    modalContent.setAttribute('aria-modal', 'true');
    modalContent.setAttribute('aria-label', 'Registrasi Penyelidik Logika');
    modalContent.style.cssText = `
      max-width: 500px;
      width: 100%;
      padding: 22px;
      max-height: 90vh;
      max-height: 90dvh;
      overflow-y: auto;
    `;

    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 2px solid var(--border-retro); padding-bottom: 8px;">
        <span class="eyebrow-label" style="font-size: 11px; color: var(--primary);">
          ${renderPixelIcon('shield', 13, 'var(--primary)')} Registrasi Penyelidik Logika
        </span>
        <button type="button" class="btn-close-modal" aria-label="Tutup jendela registrasi" style="background: none; border: 1.5px solid var(--border-retro); border-radius: 4px; padding: 8px 12px; min-width: 44px; min-height: 44px; color: var(--text-muted); font-family: var(--font-code); font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">Tutup [X]</button>
      </div>

      <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5;">
        Masukkan nama lengkap dan nomor absen kamu (1–46) untuk merekam portofolio pembelajaran mandiri di aplikasi iobranch.
      </p>

      <form id="form-onboarding" style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: grid; grid-template-columns: 1fr 88px; gap: 8px;">
          <div>
            <label for="input-student-name" style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">
              Nama Lengkap Murid:
            </label>
            <input id="input-student-name" type="text" maxlength="50" class="pixel-input" placeholder="Nama Lengkap Kamu" required style="width: 100%; min-height: 44px;" autocomplete="name" />
          </div>
          <div>
            <label for="input-student-absen" style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">
              No. Absen:
            </label>
            <input id="input-student-absen" type="number" min="1" max="46" class="pixel-input" placeholder="1-46" required style="width: 100%; min-height: 44px;" inputmode="numeric" />
          </div>
        </div>

        <button type="submit" class="game-btn game-btn-gold" style="width: 100%; margin-top: 4px; min-height: 48px;">
          Simpan &amp; Mulai Petualangan
        </button>
      </form>
    `;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const closeModal = () => {
      window.removeEventListener('keydown', handleKeyDown);
      modalBackdrop.remove();
    };

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });

    modalContent.querySelector('.btn-close-modal')?.addEventListener('click', closeModal);

    const form = modalContent.querySelector<HTMLFormElement>('#form-onboarding');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const studentName = (modalContent.querySelector('#input-student-name') as HTMLInputElement).value.trim();
      const studentAbsen = parseInt((modalContent.querySelector('#input-student-absen') as HTMLInputElement).value, 10);

      if (studentName.length < 2) {
        soundFx.playLogicFalse();
        this.showRetroToast('Nama lengkap murid minimal 2 karakter!', false);
        return;
      }
      if (studentName.length > 50) {
        soundFx.playLogicFalse();
        this.showRetroToast('Nama murid maksimal 50 karakter!', false);
        return;
      }
      if (!isValidSafeName(studentName)) {
        soundFx.playLogicFalse();
        this.showRetroToast('Nama murid mengandung karakter tidak diizinkan!', false);
        return;
      }
      if (isNaN(studentAbsen) || studentAbsen < 1 || studentAbsen > 46) {
        soundFx.playLogicFalse();
        this.showRetroToast('Nomor absen harus berada dalam rentang 1 sampai 46!', false);
        return;
      }

      const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const studentIdStr = `Absen ${String(studentAbsen).padStart(2, '0')}`;

      const newSession: StudentSession = {
        studentName,
        studentAbsen,
        studentId: `${studentIdStr} - ${studentName}`,
        pairId: studentIdStr,
        student1Name: studentName,
        student1Absen: studentAbsen,
        student2Name: '-',
        student2Absen: 0,
        teamSymbol: 'algoritma',
        totalXp: 0,
        currentLevel: 1,
        createdAt: Date.now()
      };

      try {
        await StorageService.saveSession(newSession);
        this.session = newSession;
        this.progressionState = await StorageService.getProgressionState();
        soundFx.playLogicTrue();
        closeModal();
        this.showRetroToast(`Pendaftaran berhasil! Selamat datang, ${studentName} (${studentIdStr}). Temui Guru Pak Budi di SMA Harmoni!`, true);
        this.setScreen('OVERWORLD');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);
  }

  // =================================================================
  // Layar 02: Eksplorasi Peta Dunia (Overworld Map HUD & Active Quest Card)
  // =================================================================
  private renderScreenOverworld(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `display: flex; flex-direction: column; gap: 14px;`;

    // Tentukan Misi Utama Aktif Murid Berdasarkan Kemajuan Nyata
    let activeStepNum = '01';
    let activeMissionTitle = 'Orientasi Masalah bersama Guru Pak Budi';
    let activeLocation = 'Ujung Kiri Jalan • Di Antara Pepohonan';
    let activeDesc = 'Kota Harmoni mengalami gangguan sistem otomatis akibat kesalahan logika percabangan. Bicaralah terlebih dahulu dengan Guru Pak Budi di ujung kiri jalan utama antara pepohonan untuk mendapatkan arahan orientasi kasus sebelum masuk ke ruang kelas materi.';
    let primaryBtnLabel = 'Temui & Bicara dengan Pak Budi';
    let primaryBtnIcon: PixelIconType = 'chat';
    let primaryBtnScreen: ScreenId = 'DIALOG';
    let secondaryBtnLabel = '';
    let secondaryBtnScreen: ScreenId = 'DIALOG';

    if (this.progressionState?.teacherBypassMode) {
      activeStepNum = 'DEMO';
      activeMissionTitle = 'Mode Demo Fasilitator Guru Aktif';
      activeLocation = 'Semua Landmark Terbuka Bebas';
      activeDesc = 'Mode bebas demonstrasi guru aktif. Seluruh gedung di peta dapat diakses langsung tanpa pembatasan urutan langkah.';
      primaryBtnLabel = 'Kunjungi Sekolah (Materi)';
      primaryBtnIcon = 'school';
      primaryBtnScreen = 'MATERI';
      secondaryBtnLabel = 'Bicara dengan Pak Budi';
      secondaryBtnScreen = 'DIALOG';
    } else if (!this.progressionState?.stepMaterialCompleted) {
      if (!this.progressionState?.stepDialogCompleted) {
        activeStepNum = '01';
        activeMissionTitle = 'Orientasi Masalah bersama Guru Pak Budi';
        activeLocation = 'Ujung Kiri Jalan • Di Antara Pepohonan';
        activeDesc = 'Kota Harmoni mengalami gangguan sistem otomatis akibat kesalahan logika percabangan. Temui dan bicaralah terlebih dahulu dengan Guru Pak Budi di ujung kiri jalan utama antara pepohonan untuk mendapatkan arahan orientasi sebelum ruang kelas materi dibuka.';
        primaryBtnLabel = 'Temui & Bicara dengan Pak Budi';
        primaryBtnIcon = 'chat';
        primaryBtnScreen = 'DIALOG';
        secondaryBtnLabel = '';
        secondaryBtnScreen = 'DIALOG';
      } else {
        activeStepNum = '01';
        activeMissionTitle = 'Pelajari Materi Percabangan di Ruang Kelas';
        activeLocation = 'Gedung Sekolah • Ruang Kelas Informatika';
        activeDesc = 'Pak Budi telah membimbing orientasi masalah! Sekarang masuki Gedung Sekolah untuk mempelajari materi percabangan, representasi alur, dan mencoba simulator kondisi.';
        primaryBtnLabel = 'Buka Ruang Kelas (Materi)';
        primaryBtnIcon = 'book';
        primaryBtnScreen = 'MATERI';
        secondaryBtnLabel = 'Bicara kembali dengan Pak Budi';
        secondaryBtnScreen = 'DIALOG';
      }
    } else if (!this.progressionState?.stepTracingCompleted) {
      activeStepNum = '02';
      activeMissionTitle = 'Uji Cabang Kode di Lab Telusur';
      activeLocation = 'Gedung Laboratorium Komputer';
      activeDesc = 'Kamu telah memahami materi percabangan! Sekarang masuki Lab Telusur Kode, uji nilai variabel, dan buktikan semua jalur kondisi (cabang IF dan ELSE) untuk membuka arena tantangan.';
      primaryBtnLabel = 'Masuk Lab Telusur Kode';
      primaryBtnIcon = 'flask';
      primaryBtnScreen = 'TRACING';
      secondaryBtnLabel = '';
      secondaryBtnScreen = 'TRACING';
    } else if (!this.progressionState?.stepBattleCompleted) {
      activeStepNum = '03';
      activeMissionTitle = 'Taklukkan Bug Monster di Arena Tantangan';
      activeLocation = 'Taman Kota (Arena Bug Logika)';
      activeDesc = 'Gerbang sistem di Lab berhasil distabilkan! Masuki Taman Kota untuk menantang Bug Monster dengan ketepatan evaluasi kondisi percabangan.';
      primaryBtnLabel = 'Masuk Arena Tantangan';
      primaryBtnIcon = 'swords';
      primaryBtnScreen = 'BATTLE';
      secondaryBtnLabel = '';
      secondaryBtnScreen = 'BATTLE';
    } else if (!this.progressionState?.stepEvaluationCompleted) {
      activeStepNum = '04';
      activeMissionTitle = 'Selesaikan Evaluasi Pemahaman Formatif';
      activeLocation = 'Gedung Perpustakaan Kota';
      activeDesc = 'Bug Monster berhasil dikalahkan! Masuki Perpustakaan untuk menuntaskan kuis evaluasi pemahaman formatif.';
      primaryBtnLabel = 'Buka Ruang Evaluasi Formatif';
      primaryBtnIcon = 'document';
      primaryBtnScreen = 'EVALUASI';
      secondaryBtnLabel = '';
      secondaryBtnScreen = 'EVALUASI';
    } else {
      activeStepNum = '05';
      activeMissionTitle = 'Misi Kota Harmoni Selesai dengan Gemilang!';
      activeLocation = 'Balai Kota & Arsip Capaian';
      activeDesc = 'Seluruh langkah pembelajaran telah kamu tuntaskan dengan gemilang! Buka menu Progres untuk melihat nilai formatif, lencana capaian, dan mengekspor bukti laporan belajar.';
      primaryBtnLabel = 'Lihat Rekap Capaian';
      primaryBtnIcon = 'trophy';
      primaryBtnScreen = 'PROGRES';
      secondaryBtnLabel = '';
      secondaryBtnScreen = 'PROGRES';
    }

    // 1. PANDUAN KENDALI EKSPLORASI DI PALING ATAS (Tactile Console Control Strip)
    const controlHud = document.createElement('section');
    controlHud.className = 'tactile-card';
    controlHud.style.cssText = `padding: 16px 18px; box-sizing: border-box;`;
    controlHud.setAttribute('aria-label', 'Panduan Kendali & Navigasi Kota');
    controlHud.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
        <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
          ${renderPixelIcon('gamepad', 14, 'var(--primary)')} PANDUAN KENDALI &amp; NAVIGASI KOTA
        </div>
        <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; color: var(--primary); background: rgba(15, 118, 110, 0.06); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(15, 118, 110, 0.18); letter-spacing: 0.3px;">
          <span style="width: 5px; height: 5px; border-radius: 50%; background-color: var(--primary);"></span>
          KANVAS &amp; PAPAN TERHUBUNG
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px;">
        <!-- Kontrol Keyboard / Komputer -->
        <div style="padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
          <div style="font-size: 10.5px; font-weight: 700; letter-spacing: 0.4px; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            ${renderPixelIcon('drive', 11, 'var(--primary)')} KEYBOARD / KOMPUTER
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.55; margin: 0;">
            Gunakan tombol <kbd style="display: inline-block; padding: 1px 5px; font-family: var(--font-code); font-size: 10.5px; font-weight: 600; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 4px; box-shadow: 0 1px 1px rgba(0,0,0,0.05);">Panah</kbd> atau <kbd style="display: inline-block; padding: 1px 5px; font-family: var(--font-code); font-size: 10.5px; font-weight: 600; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 4px; box-shadow: 0 1px 1px rgba(0,0,0,0.05);">WASD</kbd> untuk berjalan, dan <kbd style="display: inline-block; padding: 1px 5px; font-family: var(--font-code); font-size: 10.5px; font-weight: 600; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 4px; box-shadow: 0 1px 1px rgba(0,0,0,0.05);">Spasi</kbd> di depan gedung untuk interaksi.
          </p>
        </div>

        <!-- Kontrol Layar Sentuh / Tablet -->
        <div style="padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
          <div style="font-size: 10.5px; font-weight: 700; letter-spacing: 0.4px; color: var(--warning-dark); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            ${renderPixelIcon('target', 11, 'var(--warning-dark)')} LAYAR SENTUH / TABLET
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.55; margin: 0;">
            <strong style="color: var(--text-primary); font-weight: 600;">Sentuh jalur jalan</strong> di peta untuk berjalan otomatis ke lokasi, atau gunakan tombol kontrol <strong style="color: var(--text-primary); font-weight: 600;">D-Pad virtual</strong> di layar.
          </p>
        </div>

        <!-- Pintasan Instan -->
        <div style="padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
          <div style="font-size: 10.5px; font-weight: 700; letter-spacing: 0.4px; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            ${renderPixelIcon('bolt', 11, 'var(--primary)')} PINTASAN INSTAN
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.55; margin: 0;">
            Kamu juga bisa <strong style="color: var(--text-primary); font-weight: 600;">mengetuk pin gedung</strong> pada kanvas peta atau menekan tombol aksi pada papan misi di bawah.
          </p>
        </div>
      </div>
    `;
    container.appendChild(controlHud);

    // 2. KARTU PAPAN MISI UTAMA AKTIF (Primary Active Quest Focus)
    const questCard = document.createElement('section');
    questCard.className = 'tactile-card';
    questCard.style.cssText = `padding: 18px 20px; box-sizing: border-box;`;
    questCard.setAttribute('aria-label', 'Misi Aktif');
    questCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
        <span class="badge-pill" style="font-size: 11px; color: var(--primary); font-weight: 700; letter-spacing: 0.3px;">
          ${renderPixelIcon('target', 12, 'var(--primary)')} MISI AKTIF • LANGKAH ${activeStepNum}
        </span>
      </div>
      <div style="font-family: var(--font-ui); font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 8px 0 6px; line-height: 1.4;">
        ${activeMissionTitle}
      </div>
      <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--primary); font-weight: 600; margin-bottom: 10px; background: rgba(15, 118, 110, 0.05); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(15, 118, 110, 0.15);">
        ${renderPixelIcon('map', 13, 'var(--primary)')} Lokasi Sasaran: <span style="color: var(--text-primary); font-weight: 600;">${activeLocation}</span>
      </div>
      <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 16px;">
        ${activeDesc}
      </p>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button id="btn-quest-primary" type="button" class="game-btn game-btn-primary" style="flex: 1; min-width: 220px; min-height: 42px; font-size: 12.5px; font-weight: 700; border-radius: 8px; letter-spacing: 0.3px; gap: 8px;">
          ${renderPixelIcon(primaryBtnIcon, 14, '#ffffff')} ${primaryBtnLabel}
        </button>
        ${secondaryBtnLabel ? `
        <button id="btn-quest-secondary" type="button" class="game-btn game-btn-secondary" style="min-height: 42px; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 8px; gap: 7px;">
          ${renderPixelIcon(secondaryBtnScreen === 'DIALOG' ? 'chat' : 'book', 13, 'var(--primary)')} ${secondaryBtnLabel}
        </button>
        ` : ''}
      </div>
    `;
    container.appendChild(questCard);

    questCard.querySelector('#btn-quest-primary')?.addEventListener('click', () => {
      this.setScreen(primaryBtnScreen);
    });
    questCard.querySelector('#btn-quest-secondary')?.addEventListener('click', () => {
      this.setScreen(secondaryBtnScreen);
    });

    return container;
  }

  // =================================================================
  // Layar 03: Dialog Karakter Guru Pak Budi (TSK-08: 2 Balon Dialog Padat To-the-Point)
  // =================================================================
  public renderScreenDialogPakBudi(): HTMLElement {
    return this.renderScreenDialog();
  }

  private renderScreenDialog(): HTMLElement {
    const isTracingUnlocked = this.isScreenUnlocked('TRACING');
    const studentDisplayName = this.session?.studentName || this.session?.student1Name || 'Penyelidik Logika';
    const studentAbsenDisplay = this.session?.studentAbsen ? `Absen ${String(this.session.studentAbsen).padStart(2, '0')}` : (this.session?.pairId || '-');

    const hasReadDialog = !!(this.progressionState?.stepDialogCompleted || this.progressionState?.teacherBypassMode);
    if (hasReadDialog) {
      this.maxUnlockedDialogStack = 3;
    }

    const container = document.createElement('div');
    container.className = 'dialog-page-container';
    container.setAttribute('aria-label', 'Sesi Dialog Orientasi Masalah Guru Pak Budi');

    container.innerHTML = `
      <!-- 1. Header Dossier Orientasi Masalah -->
      <section class="tactile-card" style="padding: 20px 22px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; font-family: var(--font-ui); font-size: 11.5px; color: var(--text-muted);">
            <span>Kota Harmoni</span>
            <span style="opacity: 0.5;">/</span>
            <span>Tepi Jalan Barat</span>
            <span style="opacity: 0.5;">/</span>
            <span style="color: var(--primary); font-weight: 600;">Pertemuan Guru Pak Budi</span>
          </div>
          <span class="badge-pill" style="font-size: 10px; color: var(--primary); font-weight: 700; letter-spacing: 0.3px; border: 1px solid rgba(15, 118, 110, 0.25); background: rgba(15, 118, 110, 0.08);">
            ${renderPixelIcon('target', 11, 'var(--primary)')} LANGKAH 01: ORIENTASI MASALAH
          </span>
        </div>

        <!-- Banner Sambutan Identitas Murid -->
        <div style="background: rgba(15, 118, 110, 0.04); border: 1px solid rgba(15, 118, 110, 0.16); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: #ffffff; border: 1px solid rgba(15, 118, 110, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${renderPixelIcon('chat', 16, 'var(--primary)')}
            </div>
            <div>
              <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">
                Sesi Orientasi Masalah: ${escapeHtml(studentDisplayName)}
              </div>
              <div style="font-size: 11.5px; color: var(--text-secondary);">
                Murid Penyelidik: <strong style="color: var(--primary); font-weight: 600;">${escapeHtml(studentDisplayName)}</strong> (${escapeHtml(studentAbsenDisplay)})
              </div>
            </div>
          </div>
          <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; color: var(--primary); background: #ffffff; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(15, 118, 110, 0.25);">
            ${renderPixelIcon('bulb', 11, 'var(--primary)')}
            Penyelidikan Mandiri 1 Murid 1 Perangkat
          </span>
        </div>
      </section>

      <!-- 2. Bilah Stepper Progres Dialog (3-step pill indicator + 4px progress line) -->
      <div class="dialog-stepper-box">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <span style="font-family: var(--font-code); font-size: 11px; font-weight: 700; color: var(--primary); display: inline-flex; align-items: center; gap: 6px;">
            ${renderPixelIcon('target', 12, 'var(--primary)')} Langkah Orientasi Masalah
          </span>
          <span id="dialog-progress-text" style="font-family: var(--font-code); font-size: 10.5px; font-weight: 700; color: var(--text-secondary);">
            Tahap ${this.activeDialogStack} dari 3 • ${hasReadDialog || this.maxUnlockedDialogStack === 3 ? '100% Siap' : `${Math.round((this.activeDialogStack / 3) * 100)}% Dibaca`}
          </span>
        </div>
        <div class="dialog-progress-track">
          <div id="dialog-progress-fill" class="dialog-progress-fill" style="width: ${hasReadDialog || this.maxUnlockedDialogStack === 3 ? '100%' : `${(this.activeDialogStack / 3) * 100}%`};"></div>
        </div>
        <div class="dialog-stepper-pills">
          <button id="dialog-stepper-pill-1" type="button" class="dialog-stepper-pill ${this.activeDialogStack === 1 ? 'active' : (this.maxUnlockedDialogStack >= 2 ? 'completed' : '')}">
            ${renderPixelIcon('chat', 12, 'currentColor')} <span>Langkah 1: Panggilan Guru</span>
          </button>
          <button id="dialog-stepper-pill-2" type="button" class="dialog-stepper-pill ${this.activeDialogStack === 2 ? 'active' : (this.maxUnlockedDialogStack >= 3 ? 'completed' : (this.maxUnlockedDialogStack < 2 && !hasReadDialog ? 'locked' : ''))}">
            ${renderPixelIcon(this.maxUnlockedDialogStack >= 2 || hasReadDialog ? 'bolt' : 'lock', 12, 'currentColor')} <span>Langkah 2: Fasilitas Krisis</span>
          </button>
          <button id="dialog-stepper-pill-3" type="button" class="dialog-stepper-pill ${this.activeDialogStack === 3 ? 'active' : (this.maxUnlockedDialogStack >= 3 ? (hasReadDialog ? 'completed' : '') : (hasReadDialog ? '' : 'locked'))}">
            ${renderPixelIcon(this.maxUnlockedDialogStack >= 3 || hasReadDialog ? 'target' : 'lock', 12, 'currentColor')} <span>Langkah 3: Rencana Aksi</span>
          </button>
        </div>
      </div>

      <!-- LANGKAH 1: Panggilan Guru & Karakter Guru Pak Budi -->
      <article id="dialog-stack-card-1" class="dialog-stack-card active">
        <button id="dialog-stack-header-1" type="button" class="dialog-stack-header" aria-expanded="true">
          <div class="dialog-stack-title-box">
            <div class="dialog-stack-num-badge">01</div>
            <div>
              <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary);">
                Panggilan Guru &amp; Orientasi Masalah
              </div>
              <div style="font-size: 11px; color: var(--text-secondary); margin-top: 1px;">
                Guru Informatika SMA • Pos Tepi Jalan Barat
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="dialog-stack-badge-1" class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); border: 1px solid rgba(15, 118, 110, 0.25); background: rgba(15, 118, 110, 0.08); display: inline-flex; align-items: center; gap: 4px;">
              <span style="width: 5px; height: 5px; border-radius: 50%; background: var(--primary);"></span> Sedang Dibaca
            </span>
            <span id="dialog-stack-chevron-1" class="dialog-stack-chevron expanded">
              ${renderPixelIcon('arrow-down', 12, 'var(--text-secondary)')}
            </span>
          </div>
        </button>

        <div id="dialog-stack-body-1" class="dialog-stack-body">
          <!-- Portrait Pak Budi & Speech Balloon Layout -->
          <div class="pak-budi-dialog-layout">
            <!-- Avatar Card Pak Budi -->
            <div class="pak-budi-portrait-card">
              <img src="/assets/images/pak_budi_portrait.jpg" alt="Guru Pak Budi" class="pak-budi-avatar-img" />
              <h3 style="font-family: var(--font-pixel); font-size: 11px; color: var(--primary); margin: 8px 0 2px;">
                Pak Budi
              </h3>
              <p style="font-size: 11px; color: var(--text-secondary); margin: 0;">
                Guru Informatika SMA
              </p>
              <span style="display: inline-block; margin-top: 6px; font-size: 9.5px; font-weight: 700; color: var(--warning-dark); background: rgba(217, 119, 6, 0.1); border: 1px solid rgba(217, 119, 6, 0.3); border-radius: 4px; padding: 2px 6px;">
                Pos Jalan Barat
              </span>
            </div>

            <!-- Speech Balloon -->
            <div class="pak-budi-speech-balloon">
              <div style="font-family: var(--font-ui); font-size: 11px; font-weight: 700; color: var(--warning-dark); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                ${renderPixelIcon('bolt', 13, 'var(--warning-dark)')}
                <span>PESAN ORIENTASI DARI GURU PAK BUDI</span>
              </div>

              <p class="pak-budi-dialog-prose">
                ${this.isCycle2Unlocked
                  ? `"Selamat datang di pos orientasi lanjutan, <strong>${escapeHtml(studentDisplayName)}</strong>! Jaringan dan fasilitas cerdas sekolah sedang mengalami gangguan akibat kesalahan logika percabangan bertingkat. <strong>Router pembagian bandwidth Wi-Fi sekolah (Kasus 4)</strong> keliru membagi kuota internet sehingga koneksi lab tersendat, dan <strong>mesin penjual minuman otomatis (Kasus 5)</strong> salah mengeluarkan kaleng minuman saat tombol pilihan ditekan. Mari kita selidiki dan perbaiki aturan logika sistem tersebut!"`
                  : `"Selamat datang di pos orientasi, <strong>${escapeHtml(studentDisplayName)}</strong>! Sistem otomasi dan lalu lintas kota sedang mengalami kekacauan akibat kekeliruan aturan kondisi logika. <strong>Gerbang tiket stasiun MRT (Kasus 1)</strong> menolak penumpang dengan saldo cukup, <strong>sistem alarm suhu server (Kasus 2)</strong> keliru bereaksi, dan <strong>kasir toko kota (Kasus 3)</strong> keliru menghitung potongan harga belanja. Kita membutuhkan kemampuan penyelidikanmu untuk menelusuri kode mereka!"`
                }
              </p>

              <div style="padding: 10px 12px; background: var(--surface-panel-alt); border: 1px solid var(--border-subtle); border-radius: 8px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary);">
                ${renderPixelIcon('bulb', 13, 'var(--primary)')}
                <span>
                  ${this.isCycle2Unlocked
                    ? `Fokus Penyelidikan: <strong>2 Kasus Bertingkat</strong> (Router Wi-Fi &amp; Mesin Minuman Otomatis).`
                    : `Fokus Penyelidikan: <strong>3 Kasus Wajib</strong> (Gerbang MRT, Alarm Server, &amp; Kasir Toko Kota).`
                  }
                </span>
              </div>
            </div>
          </div>

          <!-- Advance Action Button -->
          <div class="dialog-advance-btn-box">
            <button id="btn-dialog-advance-1" type="button" class="game-btn game-btn-primary" style="width: 100%; min-height: 48px; font-size: 13px; font-weight: 700; gap: 8px; justify-content: center;">
              <span>Paham, Lanjut ke Langkah Berikutnya: 5 Fasilitas Krisis</span>
              ${renderPixelIcon('arrow-right', 13, '#ffffff')}
            </button>
          </div>
        </div>
      </article>

      <!-- LANGKAH 2: 5 Fasilitas Krisis Kota Harmoni -->
      <article id="dialog-stack-card-2" class="dialog-stack-card ${hasReadDialog ? '' : 'locked'}">
        <button id="dialog-stack-header-2" type="button" class="dialog-stack-header" aria-expanded="false">
          <div class="dialog-stack-title-box">
            <div class="dialog-stack-num-badge">02</div>
            <div>
              <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary);">
                5 Fasilitas Krisis Kota Harmoni
              </div>
              <div style="font-size: 11px; color: var(--text-secondary); margin-top: 1px;">
                MRT, Server, Kasir Toko, Router Wi-Fi, &amp; Mesin Minuman
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="dialog-stack-badge-2" class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${hasReadDialog ? 'var(--success)' : 'var(--text-muted)'}; border: 1px solid ${hasReadDialog ? 'rgba(21, 128, 61, 0.25)' : 'rgba(28, 25, 23, 0.15)'}; background: ${hasReadDialog ? 'rgba(21, 128, 61, 0.08)' : 'rgba(0, 0, 0, 0.04)'}; display: inline-flex; align-items: center; gap: 4px;">
              ${renderPixelIcon(hasReadDialog ? 'check' : 'lock', 10, 'currentColor')} ${hasReadDialog ? 'Selesai Dibaca' : 'Terkunci'}
            </span>
            <span id="dialog-stack-chevron-2" class="dialog-stack-chevron">
              ${renderPixelIcon('arrow-down', 12, 'var(--text-secondary)')}
            </span>
          </div>
        </button>

        <div id="dialog-stack-body-2" class="dialog-stack-body" style="display: none;">
          <p style="font-family: var(--font-ui); font-size: 14.5px; line-height: 1.6; color: var(--text-primary); margin: 0 0 10px 0;">
            Berikut 5 titik fasilitas perkotaan yang mengalami gangguan logika cabang. Selidiki kondisi percabangan pada masing-masing sistem:
          </p>

          <!-- 5 Crisis Facility Cards Grid (2-column desktop / 1-column mobile 360px) -->
          <div class="dialog-crisis-grid">
            <!-- 1. MRT -->
            <div class="dialog-crisis-card">
              <div class="dialog-crisis-header">
                <span class="dialog-crisis-title">1. Gerbang Tiket MRT</span>
                <span class="badge-pill" style="font-size: 9.5px; font-weight: 800; color: var(--primary); background: rgba(15, 118, 110, 0.1); border-color: rgba(15, 118, 110, 0.25);">
                  IF TUNGGAL
                </span>
              </div>
              <div class="dialog-crisis-desc">
                Kondisi: <code>saldo &gt;= 14000</code>. Palang gerbang menolak terbuka bagi penumpang yang memiliki saldo tiket mencukupi tarif.
              </div>
              <div class="dialog-crisis-meta">
                <span style="color: var(--text-muted);">Siklus 1 • Kasus 1</span>
                <span style="color: var(--primary); font-weight: 700;">30 Poin</span>
              </div>
            </div>

            <!-- 2. Alarm Suhu Server -->
            <div class="dialog-crisis-card">
              <div class="dialog-crisis-header">
                <span class="dialog-crisis-title">2. Alarm Suhu Server</span>
                <span class="badge-pill" style="font-size: 9.5px; font-weight: 800; color: var(--primary); background: rgba(15, 118, 110, 0.1); border-color: rgba(15, 118, 110, 0.25);">
                  IF TUNGGAL
                </span>
              </div>
              <div class="dialog-crisis-desc">
                Kondisi: <code>suhu &gt; 30</code>. Sirine ruang server sekolah harus menyala kencang saat suhu ruangan melampaui batas aman pendingin.
              </div>
              <div class="dialog-crisis-meta">
                <span style="color: var(--text-muted);">Siklus 1 • Kasus 2</span>
                <span style="color: var(--primary); font-weight: 700;">30 Poin</span>
              </div>
            </div>

            <!-- 3. Kasir Toko Kota -->
            <div class="dialog-crisis-card">
              <div class="dialog-crisis-header">
                <span class="dialog-crisis-title">3. Kasir Toko Kota</span>
                <span class="badge-pill" style="font-size: 9.5px; font-weight: 800; color: var(--warning-dark); background: rgba(217, 119, 6, 0.1); border-color: rgba(217, 119, 6, 0.25);">
                  IF - ELSE
                </span>
              </div>
              <div class="dialog-crisis-desc">
                Kondisi: <code>total &gt;= 100000</code>. Menentukan potongan diskon belanja otomatis 10% atau harga normal bagi pelanggan.
              </div>
              <div class="dialog-crisis-meta">
                <span style="color: var(--text-muted);">Siklus 1 • Kasus 3</span>
                <span style="color: var(--warning-dark); font-weight: 700;">40 Poin</span>
              </div>
            </div>

            <!-- 4. Router Wi-Fi Laboratorium -->
            <div class="dialog-crisis-card" style="${this.isCycle2Unlocked ? 'border-color: rgba(15, 118, 110, 0.35); background: rgba(15, 118, 110, 0.04);' : ''}">
              <div class="dialog-crisis-header">
                <span class="dialog-crisis-title">4. Router Wi-Fi Lab</span>
                <span class="badge-pill" style="font-size: 9.5px; font-weight: 800; color: var(--primary); background: rgba(15, 118, 110, 0.1); border-color: rgba(15, 118, 110, 0.25);">
                  ELSE - IF
                </span>
              </div>
              <div class="dialog-crisis-desc">
                Kondisi: <code>kecepatan &gt;= 50, &gt;= 20, &lt; 20</code>. Membagi kecepatan bandwidth internet sekolah secara bertingkat.
              </div>
              <div class="dialog-crisis-meta">
                <span style="color: ${this.isCycle2Unlocked ? 'var(--primary)' : 'var(--text-muted)'}; font-weight: ${this.isCycle2Unlocked ? '700' : '400'};">
                  ${this.isCycle2Unlocked ? 'Siklus 2 • Aktif' : 'Siklus 2 • Lanjutan'}
                </span>
                <span style="color: var(--primary); font-weight: 700;">50 Poin</span>
              </div>
            </div>

            <!-- 5. Mesin Minuman Otomatis -->
            <div class="dialog-crisis-card" style="${this.isCycle2Unlocked ? 'border-color: rgba(15, 118, 110, 0.35); background: rgba(15, 118, 110, 0.04);' : ''}">
              <div class="dialog-crisis-header">
                <span class="dialog-crisis-title">5. Mesin Minuman Otomatis</span>
                <span class="badge-pill" style="font-size: 9.5px; font-weight: 800; color: #4f46e5; background: rgba(79, 70, 229, 0.08); border-color: rgba(79, 70, 229, 0.25);">
                  SWITCH - CASE
                </span>
              </div>
              <div class="dialog-crisis-desc">
                Kondisi: <code>case 1, 2, 3, default</code>. Memproses pilihan kaleng minuman serta penanganan tombol asing dengan aman.
              </div>
              <div class="dialog-crisis-meta">
                <span style="color: ${this.isCycle2Unlocked ? 'var(--primary)' : 'var(--text-muted)'}; font-weight: ${this.isCycle2Unlocked ? '700' : '400'};">
                  ${this.isCycle2Unlocked ? 'Siklus 2 • Aktif' : 'Siklus 2 • Lanjutan'}
                </span>
                <span style="color: var(--primary); font-weight: 700;">50 Poin</span>
              </div>
            </div>
          </div>

          <!-- Advance Action Button -->
          <div class="dialog-advance-btn-box">
            <button id="btn-dialog-advance-2" type="button" class="game-btn game-btn-primary" style="width: 100%; min-height: 48px; font-size: 13px; font-weight: 700; gap: 8px; justify-content: center;">
              <span>Paham Masalah Krisis, Lanjut ke Langkah Berikutnya: Rencana Aksi</span>
              ${renderPixelIcon('arrow-right', 13, '#ffffff')}
            </button>
          </div>
        </div>
      </article>

      <!-- LANGKAH 3: Tuntutan Misi & Rencana Aksi -->
      <article id="dialog-stack-card-3" class="dialog-stack-card ${hasReadDialog ? '' : 'locked'}">
        <button id="dialog-stack-header-3" type="button" class="dialog-stack-header" aria-expanded="false">
          <div class="dialog-stack-title-box">
            <div class="dialog-stack-num-badge">03</div>
            <div>
              <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary);">
                Tuntutan Misi &amp; Rencana Aksi
              </div>
              <div style="font-size: 11px; color: var(--text-secondary); margin-top: 1px;">
                Target Capaian 2 Bintang (100 Poin) di Perangkat Masing-Masing
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="dialog-stack-badge-3" class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${hasReadDialog ? 'var(--success)' : 'var(--text-muted)'}; border: 1px solid ${hasReadDialog ? 'rgba(21, 128, 61, 0.25)' : 'rgba(28, 25, 23, 0.15)'}; background: ${hasReadDialog ? 'rgba(21, 128, 61, 0.08)' : 'rgba(0, 0, 0, 0.04)'}; display: inline-flex; align-items: center; gap: 4px;">
              ${renderPixelIcon(hasReadDialog ? 'check' : 'lock', 10, 'currentColor')} ${hasReadDialog ? 'Selesai Dibaca' : 'Terkunci'}
            </span>
            <span id="dialog-stack-chevron-3" class="dialog-stack-chevron">
              ${renderPixelIcon('arrow-down', 12, 'var(--text-secondary)')}
            </span>
          </div>
        </button>

        <div id="dialog-stack-body-3" class="dialog-stack-body" style="display: none;">
          <div style="font-family: var(--font-ui); font-size: 11px; font-weight: 700; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            ${renderPixelIcon('target', 13, 'var(--primary)')}
            <span>INSTRUKSI TUGAS PENYELIDIKAN LOGIKA</span>
          </div>

          <p class="pak-budi-dialog-prose">
            ${this.isCycle2Unlocked
              ? `"Misi utamamu: Masuk ke Ruang Kelas untuk mempelajari aturan percabangan bertingkat (ELSE-IF) dan switch-case, lalu lakukan pengujian mandiri di <strong>Meja Kerja Lab Telusur</strong> pada perangkatmu untuk membuktikan kedua kasus tersebut hingga meraih <strong>2 Bintang (100 Poin Penuh)</strong>. Setelah membuktikannya, masuki <strong>Arena Tantangan</strong> untuk menaklukkan Bug Monster!"`
              : `"Misi utamamu: Masuk ke Ruang Kelas untuk memahami konsep percabangan dasar, lalu lakukan pengujian mandiri di <strong>Meja Kerja Lab Telusur</strong> pada perangkatmu untuk menuntaskan 3 Kasus Wajib hingga meraih <strong>2 Bintang (100 Poin Penuh)</strong>. Setelah membuktikannya, masuki <strong>Arena Tantangan</strong> untuk menguji ketangkasan analisismu!"`
            }
          </p>

          <!-- Target Box -->
          <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); background: rgba(21, 128, 61, 0.06); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(21, 128, 61, 0.2); margin-bottom: 16px;">
            ${renderPixelIcon('check', 13, 'var(--success)')}
            <span>Target Kelulusan: <strong>2 Bintang (100 Poin)</strong> terkunci pada percobaan pertama di perangkat masing-masing.</span>
          </div>

          <!-- Action Gating Buttons -->
          <div style="display: flex; flex-direction: column; gap: 10px; border-top: 1px dashed var(--border-subtle); padding-top: 14px;">
            <button id="btn-dialog-to-materi" type="button" class="game-btn game-btn-primary" style="width: 100%; min-height: 48px; font-size: 13px; font-weight: 700; gap: 10px; justify-content: center; border-radius: 8px;">
              ${renderPixelIcon('book', 15, '#ffffff')}
              <span>Masuk Ruang Kelas (Pelajari Materi Percabangan)</span>
              ${renderPixelIcon('arrow-right', 13, '#ffffff')}
            </button>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              ${isTracingUnlocked ? `
              <button id="btn-dialog-to-tracing" type="button" class="game-btn game-btn-secondary" style="flex: 1; min-height: 44px; font-size: 12px; font-weight: 600; gap: 8px; justify-content: center; border-radius: 8px;">
                ${renderPixelIcon('flask', 13, 'var(--primary)')} Langsung ke Lab Telusur Kode
              </button>
              ` : ''}
              <button id="btn-dialog-to-overworld" type="button" class="game-btn game-btn-secondary" style="flex: 1; min-height: 44px; font-size: 12px; font-weight: 600; gap: 8px; justify-content: center; border-radius: 8px;">
                ${renderPixelIcon('arrow-left', 13, 'var(--text-secondary)')} Kembali ke Peta
              </button>
            </div>
          </div>
        </div>
      </article>
    `;

    // Interaktivitas Accordion Progressive Disclosure Stack Dialog
    const stackCards = [
      container.querySelector<HTMLElement>('#dialog-stack-card-1'),
      container.querySelector<HTMLElement>('#dialog-stack-card-2'),
      container.querySelector<HTMLElement>('#dialog-stack-card-3')
    ];
    const stackBodies = [
      container.querySelector<HTMLElement>('#dialog-stack-body-1'),
      container.querySelector<HTMLElement>('#dialog-stack-body-2'),
      container.querySelector<HTMLElement>('#dialog-stack-body-3')
    ];
    const stackBadges = [
      container.querySelector<HTMLElement>('#dialog-stack-badge-1'),
      container.querySelector<HTMLElement>('#dialog-stack-badge-2'),
      container.querySelector<HTMLElement>('#dialog-stack-badge-3')
    ];
    const stackChevrons = [
      container.querySelector<HTMLElement>('#dialog-stack-chevron-1'),
      container.querySelector<HTMLElement>('#dialog-stack-chevron-2'),
      container.querySelector<HTMLElement>('#dialog-stack-chevron-3')
    ];
    const stepperPills = [
      container.querySelector<HTMLButtonElement>('#dialog-stepper-pill-1'),
      container.querySelector<HTMLButtonElement>('#dialog-stepper-pill-2'),
      container.querySelector<HTMLButtonElement>('#dialog-stepper-pill-3')
    ];
    const progressFill = container.querySelector<HTMLElement>('#dialog-progress-fill');
    const progressText = container.querySelector<HTMLElement>('#dialog-progress-text');

    const updateDialogStackViews = (targetStack: 1 | 2 | 3, shouldScroll = false) => {
      this.activeDialogStack = targetStack;
      const isComplete = this.maxUnlockedDialogStack === 3 && (hasReadDialog || targetStack === 3);

      // Update Stepper Bar
      const percent = isComplete ? 100 : Math.round((this.activeDialogStack / 3) * 100);
      if (progressFill) progressFill.style.width = `${percent}%`;
      if (progressText) {
        progressText.textContent = isComplete
          ? 'Orientasi Lengkap (100% Siap)'
          : `Tahap ${this.activeDialogStack} dari 3 • ${percent}% Dibaca`;
      }

      for (let i = 1; i <= 3; i++) {
        const idx = i - 1;
        const card = stackCards[idx];
        const body = stackBodies[idx];
        const badge = stackBadges[idx];
        const chevron = stackChevrons[idx];
        const pill = stepperPills[idx];

        if (!card || !body || !badge || !chevron || !pill) continue;

        const isUnlocked = i <= this.maxUnlockedDialogStack || hasReadDialog;
        const isOpen = i === this.activeDialogStack;
        const isCompleted = (i < this.maxUnlockedDialogStack) || hasReadDialog;

        // Card classes
        card.classList.toggle('active', isOpen);
        card.classList.toggle('locked', !isUnlocked);
        card.classList.toggle('completed', isCompleted && !isOpen);

        // Body display
        body.style.display = isOpen ? 'block' : 'none';

        // Chevron
        chevron.classList.toggle('expanded', isOpen);

        // Badge
        if (!isUnlocked) {
          badge.innerHTML = `${renderPixelIcon('lock', 10, 'var(--text-muted)')} <span style="font-size: 10px; color: var(--text-muted); font-weight: 700;">Terkunci</span>`;
          badge.style.borderColor = 'rgba(28, 25, 23, 0.15)';
          badge.style.background = 'rgba(0, 0, 0, 0.04)';
          badge.style.color = 'var(--text-muted)';
        } else if (isOpen) {
          badge.innerHTML = `<span style="width: 5px; height: 5px; border-radius: 50%; background: var(--primary);"></span> <span style="font-size: 10px; color: var(--primary); font-weight: 700;">Sedang Dibaca</span>`;
          badge.style.borderColor = 'rgba(15, 118, 110, 0.25)';
          badge.style.background = 'rgba(15, 118, 110, 0.08)';
          badge.style.color = 'var(--primary)';
        } else {
          badge.innerHTML = `${renderPixelIcon('check', 10, 'var(--success)')} <span style="font-size: 10px; color: var(--success); font-weight: 700;">Selesai Dibaca</span>`;
          badge.style.borderColor = 'rgba(21, 128, 61, 0.25)';
          badge.style.background = 'rgba(21, 128, 61, 0.08)';
          badge.style.color = 'var(--success)';
        }

        // Stepper Pill
        pill.className = `dialog-stepper-pill ${isOpen ? 'active' : (isCompleted ? 'completed' : (isUnlocked ? '' : 'locked'))}`;
        const pillIcon = !isUnlocked ? 'lock' : (i === 1 ? 'chat' : (i === 2 ? 'bolt' : 'target'));
        const pillLabel = i === 1 ? 'Langkah 1: Panggilan Guru' : (i === 2 ? 'Langkah 2: Fasilitas Krisis' : 'Langkah 3: Rencana Aksi');
        pill.innerHTML = `${renderPixelIcon(pillIcon, 12, 'currentColor')} <span>${pillLabel}</span>`;
      }

      if (shouldScroll) {
        const activeCard = stackCards[targetStack - 1];
        if (activeCard) {
          activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };

    // Handler klik Header Stack & Pill Navigasi
    for (let i = 1; i <= 3; i++) {
      const idx = i - 1;
      const headerBtn = container.querySelector<HTMLButtonElement>(`#dialog-stack-header-${i}`);
      const pill = stepperPills[idx];

      const handleStepClick = () => {
        const isUnlocked = i <= this.maxUnlockedDialogStack || hasReadDialog;
        if (!isUnlocked) {
          soundFx.playLogicFalse();
          this.showRetroToast(`Selesaikan dan pahami Tahap ${i - 1} terlebih dahulu.`, false);
          const c = stackCards[idx];
          if (c) {
            c.classList.add('shake');
            setTimeout(() => c.classList.remove('shake'), 400);
          }
          return;
        }
        soundFx.playButtonBlip();
        updateDialogStackViews(i as 1 | 2 | 3);
      };

      headerBtn?.addEventListener('click', handleStepClick);
      pill?.addEventListener('click', handleStepClick);
    }

    // Tombol Aksi Maju Bertahap (Action Gating)
    container.querySelector('#btn-dialog-advance-1')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.maxUnlockedDialogStack = Math.max(this.maxUnlockedDialogStack, 2) as 1 | 2 | 3;
      updateDialogStackViews(2, true);
    });

    container.querySelector('#btn-dialog-advance-2')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.maxUnlockedDialogStack = 3;
      if (this.progressionState && !this.progressionState.stepDialogCompleted) {
        this.progressionState.stepDialogCompleted = true;
        void StorageService.saveProgressionState({ stepDialogCompleted: true });
      }
      updateDialogStackViews(3, true);
    });

    // Pasang Event Listeners Navigasi Layar
    container.querySelector('#btn-dialog-to-materi')?.addEventListener('click', () => {
      if (this.progressionState && !this.progressionState.stepDialogCompleted) {
        this.progressionState.stepDialogCompleted = true;
        void StorageService.saveProgressionState({ stepDialogCompleted: true });
      }
      soundFx.playButtonBlip();
      this.setScreen('MATERI');
    });

    container.querySelector('#btn-dialog-to-tracing')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.setScreen('TRACING');
    });

    container.querySelector('#btn-dialog-to-overworld')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.setScreen('OVERWORLD');
    });

    return container;
  }

  /**
   * Menentukan apakah suatu materi telah tuntas dipelajari murid.
   * Pada Siklus 2, seluruh materi prasyarat & Siklus 1 (cycleRequired === 1) otomatis tuntas.
   * Materi Siklus 2 (ptk-04 & ptk-05) wajib dipelajari bertahap oleh murid.
   */
  private isMateriRead(topicOrId: MateriTopic | string): boolean {
    const topic = typeof topicOrId === 'string' ? getMateriTopicById(topicOrId) : topicOrId;
    if (this.isCycle2Unlocked && topic.cycleRequired === 1) {
      return true;
    }
    return this.readMateriIds.includes(topic.id) || !!this.progressionState?.teacherBypassMode;
  }

  /**
   * Menghitung status dan jumlah materi yang telah tuntas dipelajari murid secara realtime
   */
  private getMateriReadProgress(): { readCount: number; totalCount: number; isAllRead: boolean } {
    const requiredTopics = MATERI_BANK.filter((t) =>
      this.isCycle2Unlocked ? true : t.cycleRequired === 1
    );
    const readCount = requiredTopics.filter((t) =>
      this.isMateriRead(t)
    ).length;
    const totalCount = requiredTopics.length;
    const isAllRead = readCount >= totalCount || !!this.progressionState?.teacherBypassMode;
    return { readCount, totalCount, isAllRead };
  }

  // =================================================================
  // Layar 04: Materi Pembelajaran (Modular Concept Reader 2-Column)
  // =================================================================
  private renderScreenMateri(): HTMLElement {
    // Sinkronisasi memori lokal agar seluruh 8 materi Siklus 1 langsung tercatat di memori saat Siklus 2 aktif
    if (this.isCycle2Unlocked) {
      const cycle1MateriIds = [
        'pra-01', 'pra-02', 'pra-03', 'pra-04', 'pra-05',
        'ptk-01', 'ptk-02', 'ptk-03'
      ];
      for (const id of cycle1MateriIds) {
        if (!this.readMateriIds.includes(id)) {
          this.readMateriIds.push(id);
        }
      }
    }

    const currentTopic = getMateriTopicById(this.activeMateriId);
    const currentIndex = MATERI_BANK.findIndex((t) => t.id === currentTopic.id);
    const isCurrentTopicLocked = currentTopic.cycleRequired === 2 && !this.isCycle2Unlocked;
    const nextTopic = currentIndex < MATERI_BANK.length - 1 ? MATERI_BANK[currentIndex + 1] : null;
    const isNextTopicCycle2Locked = Boolean(nextTopic && nextTopic.cycleRequired === 2 && !this.isCycle2Unlocked);
    const isNextTopicPrereqLocked = Boolean(this.isCycle2Unlocked && nextTopic && nextTopic.id === 'ptk-05' && !this.readMateriIds.includes('ptk-04') && !this.progressionState?.teacherBypassMode);
    const topicId = currentTopic.id;
    const isAlreadyRead = this.isMateriRead(topicId);

    // Inisialisasi status progres tumpukan kartu topik aktif
    if (isAlreadyRead || !!this.progressionState?.teacherBypassMode) {
      this.materiMaxUnlockedStackMap[topicId] = 3;
    } else if (!this.materiMaxUnlockedStackMap[topicId]) {
      this.materiMaxUnlockedStackMap[topicId] = 1;
    }

    // Jika murid sudah berada pada Stack 3 topik aktif, langsung pastikan topik tercatat tuntas di memori
    if ((this.materiActiveStackMap[topicId] === 3 || this.materiMaxUnlockedStackMap[topicId] === 3) && !isCurrentTopicLocked && !this.readMateriIds.includes(topicId)) {
      this.readMateriIds.push(topicId);
      void StorageService.markMateriAsRead(topicId);
    }

    // Hitung materi wajib dibaca secara realtime
    const { readCount: readRequiredCount, totalCount: totalRequired, isAllRead: isAllRequiredRead } = this.getMateriReadProgress();

    const container = document.createElement('div');
    container.className = 'materi-layout';

    // -------------------------------------------------------------
    // Kolom Kiri: Navigasi Sidebar Modul Pembelajaran (Responsif Mobile)
    // -------------------------------------------------------------
    const sidebar = document.createElement('aside');
    sidebar.className = 'tactile-card materi-sidebar';
    sidebar.setAttribute('aria-label', 'Daftar Modul Pembelajaran');

    const prasyaratTopics = MATERI_BANK.filter((t) => t.category === 'PRASYARAT');
    const percabanganTopics = MATERI_BANK.filter((t) => t.category === 'PERCABANGAN');

    sidebar.innerHTML = `
      <!-- Header Sidebar dengan Tombol Buka/Tutup di Mobile -->
      <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid var(--border-retro); padding-bottom: 8px; gap: 6px;">
        <div class="eyebrow-label" style="color: var(--primary); display: flex; align-items: center; gap: 6px; margin: 0; flex-wrap: wrap;">
          ${renderPixelIcon('book', 13, 'var(--primary)')}
          <span>Daftar Modul</span>
          <span class="badge-pill" style="font-size: 8.5px; padding: 1px 6px;">${MATERI_BANK.length} TOPIK</span>
          ${this.isCycle2Unlocked ? `
            <button id="btn-materi-c2-info" type="button" class="game-btn game-btn-secondary" style="font-size: 8px; padding: 2px 6px; min-height: 22px; gap: 4px;" title="Lihat Petunjuk Fokus Materi Siklus 2">
              ${renderPixelIcon('bulb', 10, 'var(--warning-dark)')} <span>Info Siklus 2</span>
            </button>
          ` : ''}
        </div>
        <button id="btn-toggle-module-list" type="button" class="game-btn game-btn-secondary materi-mobile-toggle" aria-expanded="false">
          <span id="label-toggle-module-list">Pilih Modul</span>
          <span id="icon-toggle-module-list">${renderPixelIcon('arrow-down', 10, 'currentColor')}</span>
        </button>
      </div>

      <!-- Ringkasan Status Modul Aktif di Mobile & Desktop -->
      <div class="tactile-panel" style="margin-top: 10px; padding: 10px 12px; font-size: 11px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 6px;">
          <span style="color: var(--warning); font-weight: bold; display: inline-flex; align-items: center; gap: 5px;">
            ${renderPixelIcon('shield', 11, 'var(--warning)')} Status Modul:
          </span>
          <span class="badge-pill" style="font-size: 8.5px; padding: 1px 6px; color: ${currentTopic.category === 'PERCABANGAN' ? 'var(--primary)' : 'var(--warning-dark)'};">
            ${currentTopic.badgeLabel}
          </span>
        </div>
        <div style="color: var(--text-secondary); font-size: 11.5px; line-height: 1.4;">
          Topik ${currentIndex + 1} dari ${MATERI_BANK.length} Aktif: <strong style="color: var(--text-primary);">${currentTopic.title}</strong>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">${currentTopic.categoryLabel}</div>
        </div>
      </div>

      <!-- Wadah Daftar Modul (Bisa diciutkan di Layar Sempit) -->
      <div id="materi-sidebar-body" class="materi-sidebar-body">
        <!-- Kategori 1: Materi Prasyarat (Dasar Algoritma) -->
        <div style="margin-top: 12px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; padding: 0 4px;">
            <span style="font-family: var(--font-pixel, monospace); font-size: 8.5px; color: var(--warning-dark, #92400E); letter-spacing: 0.5px; font-weight: bold; display: inline-flex; align-items: center; gap: 5px;">
              ${renderPixelIcon('shield', 11, 'var(--warning-dark)')} Fondasi Prasyarat
            </span>
            <span class="badge-pill" style="font-size: 8px; padding: 1px 5px; color: var(--warning-dark); border-color: rgba(217, 119, 6, 0.3);">
              ${prasyaratTopics.length} Topik
            </span>
          </div>
          <div id="materi-list-prasyarat" class="materi-topics-grid"></div>
        </div>

        <!-- Kategori 2: Struktur Percabangan (Siklus 1 & Siklus 2) -->
        <div style="margin-bottom: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; padding: 0 4px;">
            <span style="font-family: var(--font-pixel, monospace); font-size: 8.5px; color: var(--primary); letter-spacing: 0.5px; font-weight: bold; display: inline-flex; align-items: center; gap: 5px;">
              ${renderPixelIcon('bolt', 11, 'var(--primary)')} Struktur Percabangan
            </span>
            <span class="badge-pill" style="font-size: 8px; padding: 1px 5px; color: var(--primary); border-color: rgba(15, 118, 110, 0.3);">
              ${percabanganTopics.length} Topik
            </span>
          </div>
          <div id="materi-list-percabangan" class="materi-topics-grid"></div>
        </div>
      </div>
    `;

    // Pasang handler toggle di mobile
    const toggleBtn = sidebar.querySelector<HTMLButtonElement>('#btn-toggle-module-list');
    const sidebarBody = sidebar.querySelector<HTMLElement>('#materi-sidebar-body');
    const toggleLabel = sidebar.querySelector<HTMLElement>('#label-toggle-module-list');
    const toggleIcon = sidebar.querySelector<HTMLElement>('#icon-toggle-module-list');

    if (toggleBtn && sidebarBody) {
      toggleBtn.addEventListener('click', () => {
        soundFx.playButtonBlip();
        const isOpen = sidebarBody.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (toggleLabel) {
          toggleLabel.textContent = isOpen ? 'Tutup Daftar' : 'Pilih Modul';
        }
        if (toggleIcon) {
          toggleIcon.innerHTML = renderPixelIcon(isOpen ? 'arrow-up' : 'arrow-down', 10, 'currentColor');
        }
      });
    }

    // Pasang tombol info pengingat materi Siklus 2
    sidebar.querySelector('#btn-materi-c2-info')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.showCycle2MateriReminderModal();
    });

    // Populate Tombol Prasyarat
    const listPrasyarat = sidebar.querySelector('#materi-list-prasyarat');
    prasyaratTopics.forEach((topic) => {
      const isActive = topic.id === currentTopic.id;
      const isRead = this.isMateriRead(topic);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.topicId = topic.id;
      btn.className = `game-btn ${isActive ? 'game-btn-primary' : 'game-btn-secondary'}`;
      btn.style.cssText = `display: flex; align-items: center; justify-content: flex-start; text-align: left; font-size: 11px; min-height: 40px; width: 100%; padding: 6px 10px; gap: 6px; line-height: 1.35; box-sizing: border-box; ${isActive ? 'border-left: 3px solid var(--warning);' : ''}`;

      const checkIcon = isRead
        ? `<span class="icon-materi-checked" style="color: var(--success); display: inline-flex; align-items: center; margin-left: auto; padding-left: 4px; flex-shrink: 0;" title="Materi telah dipelajari">${renderPixelIcon('check', 11, 'var(--success)')}</span>`
        : '';

      btn.innerHTML = `<span style="font-family: var(--font-pixel, monospace); font-size: 8.5px; opacity: 0.85; flex-shrink: 0;">${topic.order}.</span> <span style="flex: 1; min-width: 0;">${topic.title}</span>${checkIcon}`;
      btn.addEventListener('click', () => {
        soundFx.playButtonBlip();
        this.activeMateriId = topic.id;
        this.render();
        this.scrollToTop();
        if (this.isCycle2Unlocked) {
          this.showRetroToast(`Topik "${topic.title}" adalah materi prasyarat. Kamu dapat membaca ulang atau melanjutkan ke materi Siklus 2.`, true);
        }
      });
      listPrasyarat?.appendChild(btn);
    });

    // Populate Tombol Percabangan
    const listPercabangan = sidebar.querySelector('#materi-list-percabangan');
    percabanganTopics.forEach((topic) => {
      const isActive = topic.id === currentTopic.id;
      const isLocked = topic.cycleRequired === 2 && !this.isCycle2Unlocked;
      const isRead = this.isMateriRead(topic);
      const isPrereqLocked = this.isCycle2Unlocked && topic.id === 'ptk-05' && !this.readMateriIds.includes('ptk-04') && !this.progressionState?.teacherBypassMode;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.topicId = topic.id;
      btn.className = `game-btn ${isActive ? 'game-btn-primary' : 'game-btn-secondary'} ${isLocked || isPrereqLocked ? 'is-locked' : ''}`;
      btn.style.cssText = `display: flex; align-items: center; justify-content: flex-start; text-align: left; font-size: 11px; min-height: 40px; width: 100%; padding: 6px 10px; gap: 6px; line-height: 1.35; box-sizing: border-box; ${isActive ? 'border-left: 3px solid var(--primary-light, #14b8a6);' : ''}`;

      const statusBadge = isLocked
        ? `<span class="badge-pill" style="font-size: 7.5px; padding: 1px 4px; color: var(--warning-dark); border-color: rgba(217, 119, 6, 0.4); background: rgba(217, 119, 6, 0.1); margin-left: auto; flex-shrink: 0;">${renderPixelIcon('lock', 9, 'currentColor')} SIKLUS 2</span>`
        : (isPrereqLocked
          ? `<span class="badge-pill" style="font-size: 7.5px; padding: 1px 4px; color: var(--warning-dark); border-color: rgba(217, 119, 6, 0.4); background: rgba(217, 119, 6, 0.1); margin-left: auto; flex-shrink: 0;">${renderPixelIcon('lock', 9, 'currentColor')} PRASYARAT</span>`
          : (isRead
            ? `<span class="icon-materi-checked" style="color: var(--success); display: inline-flex; align-items: center; margin-left: auto; padding-left: 4px; flex-shrink: 0;" title="Materi telah dipelajari">${renderPixelIcon('check', 11, 'var(--success)')}</span>`
            : ''));

      btn.innerHTML = `<span style="font-family: var(--font-pixel, monospace); font-size: 8.5px; opacity: 0.85; flex-shrink: 0;">${topic.order}.</span> <span style="flex: 1; min-width: 0;">${topic.title}</span>${statusBadge}`;

      btn.addEventListener('click', () => {
        if (isLocked) {
          soundFx.playLogicFalse();
        } else if (isPrereqLocked) {
          soundFx.playLogicFalse();
          this.showRetroToast('Pelajari materi Percabangan Bertingkat (Topik 9) secara tuntas terlebih dahulu sebelum membuka Topik 10!', false);
          return;
        } else {
          soundFx.playButtonBlip();
        }
        this.activeMateriId = topic.id;
        this.render();
        this.scrollToTop();
        if (this.isCycle2Unlocked && topic.cycleRequired === 1) {
          this.showRetroToast(`Topik "${topic.title}" telah dipelajari di Siklus 1. Beralihlah ke Topik 9 & 10 untuk materi utama Siklus 2!`, true);
        }
      });
      listPercabangan?.appendChild(btn);
    });

    // -------------------------------------------------------------
    // Kolom Kanan: Kartu Baca Materi
    // -------------------------------------------------------------
    const contentCard = document.createElement('article');
    contentCard.className = 'tactile-card materi-content-card';
    contentCard.setAttribute('aria-label', `Modul Materi: ${currentTopic.title}`);

    // Helper Format Kode & Escape (TSK-L04)
    const escapeHtml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const formatCodeLines = (codeText: string) => {
      const lines = codeText.trim().split('\n');
      const gutter = lines.map((_, i) => `<span class="code-line-num">${i + 1}</span>`).join('');
      const code = lines.map((l) => `<span class="code-line-text">${escapeHtml(l)}</span>`).join('');
      return `<div class="code-viewport"><div class="code-gutter">${gutter}</div><pre class="code-content"><code>${code}</code></pre></div>`;
    };

    // Render HTML Sections
    let sectionsHtml = '';
    currentTopic.sections.forEach((sec, sIdx) => {
      let codeSnippetHtml = '';
      if (sec.codeSnippet) {
        const snippet = sec.codeSnippet;
        const hasDualVersion = !!(snippet.codeC && snippet.codePseudo);

        if (hasDualVersion) {
          const safeC = formatCodeLines(snippet.codeC || '');
          const safePseudo = formatCodeLines(snippet.codePseudo || '');
          const descHtml = snippet.description
            ? `<div class="code-dual-desc">${escapeHtml(snippet.description)}</div>`
            : '';

          codeSnippetHtml = `
            <div class="code-dual-container" data-snippet-id="${sIdx}">
              <div class="code-dual-header">
                <div class="code-dual-title">
                  ${renderPixelIcon('document', 11, 'var(--primary-light, #14b8a6)')}
                  <span>${escapeHtml(snippet.language)}</span>
                </div>
                <div class="code-dual-tabs" role="tablist">
                  <button type="button" class="code-dual-tab-btn active" data-lang="c" aria-selected="true">
                    ${renderPixelIcon('check', 9, 'currentColor')} Bahasa C
                  </button>
                  <button type="button" class="code-dual-tab-btn" data-lang="pseudo" aria-selected="false">
                    Pseudokode
                  </button>
                </div>
              </div>
              <div class="code-dual-pane pane-c active">${safeC}</div>
              <div class="code-dual-pane pane-pseudo">${safePseudo}</div>
              ${descHtml}
            </div>
          `;
        } else {
          codeSnippetHtml = `
            <div class="code-single-container">
              <div class="code-dual-header">
                <div class="code-dual-title">
                  ${renderPixelIcon('document', 11, 'var(--primary-light, #14b8a6)')}
                  <span>${escapeHtml(snippet.language)}</span>
                </div>
              </div>
              ${formatCodeLines(snippet.code || '')}
              ${snippet.description ? `<div class="code-dual-desc">${escapeHtml(snippet.description)}</div>` : ''}
            </div>
          `;
        }
      }

      let tableHtml = '';
      if (sec.tableData) {
        const headerCols = sec.tableData.headers
          .map((h) => `<th>${escapeHtml(h)}</th>`)
          .join('');
        const rowRows = sec.tableData.rows
          .map((r) =>
            `<tr>
              ${r.map((cell, cIdx) =>
                `<td>${cIdx === 0 ? `<span class="table-op-badge"><code>${escapeHtml(cell)}</code></span>` : cell.replace(/\n/g, '<br />')}</td>`
              ).join('')}
            </tr>`
          )
          .join('');

        tableHtml = `
          <div class="materi-table-wrapper">
            <table class="materi-table">
              <thead><tr>${headerCols}</tr></thead>
              <tbody>${rowRows}</tbody>
            </table>
          </div>
        `;
      }

      sectionsHtml += `
        <div style="margin-bottom: 20px;">
          <h3 class="materi-heading-h3">
            ${renderPixelIcon('document', 13, 'var(--primary)')} <span>${escapeHtml(sec.heading)}</span>
          </h3>
          <div class="materi-prose">
            ${sec.content.replace(/\n/g, '<br />')}
          </div>
          ${codeSnippetHtml}
          ${tableHtml}
        </div>
      `;
    });

    // Diagram Alur Ilustrasi Grafis SVG
    let diagramHtml = '';
    if (currentTopic.diagramType === 'flowchart_symbols') {
      diagramHtml = `
        <div class="tactile-panel" style="padding: 14px; margin: 16px 0 20px; overflow-x: auto;">
          <div class="eyebrow-label" style="color: var(--text-secondary); margin-bottom: 8px; font-size: 10px;">
            Panduan Visual Simbol Resmi Flowchart (ANSI / ISO):
          </div>
          <svg viewBox="0 0 580 175" width="100%" height="auto" style="max-width: 580px; display: block; margin: 0 auto;">
            <defs>
              <marker id="arrow-sym" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="#78716C"/>
              </marker>
              <marker id="arrow-flow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M 0 0 L 7 3.5 L 0 7 Z" fill="#0F766E"/>
              </marker>
            </defs>
            <!-- 1. Terminator -->
            <g transform="translate(10, 15)">
              <rect x="0" y="0" width="100" height="38" rx="19" fill="#DCFCE7" stroke="#15803D" stroke-width="2"/>
              <text x="50" y="24" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" fill="#15803D">Terminator</text>
              <text x="50" y="55" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#4B5563">Mulai / Selesai</text>
            </g>
            <path d="M 115, 34 L 135, 34" stroke="#78716C" stroke-width="2" marker-end="url(#arrow-sym)"/>

            <!-- 2. Input/Output -->
            <g transform="translate(140, 15)">
              <polygon points="12,0 100,0 88,38 0,38" fill="rgba(15, 118, 110, 0.1)" stroke="#0F766E" stroke-width="2"/>
              <text x="50" y="24" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" fill="#0F766E">Input/Output</text>
              <text x="50" y="55" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#4B5563">Masukan/Keluaran</text>
            </g>
            <path d="M 245, 34 L 265, 34" stroke="#78716C" stroke-width="2" marker-end="url(#arrow-sym)"/>

            <!-- 3. Process -->
            <g transform="translate(270, 15)">
              <rect x="0" y="0" width="95" height="38" rx="4" fill="#F3F4F6" stroke="#4B5563" stroke-width="2"/>
              <text x="47" y="24" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" fill="#374151">Process</text>
              <text x="47" y="55" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" fill="#4B5563">Hitung / Nilai</text>
            </g>
            <path d="M 370, 34 L 390, 34" stroke="#78716C" stroke-width="2" marker-end="url(#arrow-sym)"/>

            <!-- 4. Decision (Belah Ketupat) -->
            <g transform="translate(395, 2)">
              <polygon points="50,0 100,32 50,64 0,32" fill="#FEF3C7" stroke="#D97706" stroke-width="2.2"/>
              <text x="50" y="36" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" fill="#B45309">Decision</text>
              <text x="50" y="80" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" font-weight="600" fill="#B45309">Uji Kondisi (Ya/Tidak)</text>
            </g>

            <!-- 5. Keterangan Panah Alir -->
            <g transform="translate(10, 115)">
              <rect x="0" y="0" width="560" height="42" rx="6" fill="#F7F5F0" stroke="#D0C7B8" stroke-width="1.5"/>
              <line x1="20" y1="21" x2="65" y2="21" stroke="#0F766E" stroke-width="2.5" marker-end="url(#arrow-flow)"/>
              <text x="80" y="25" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#1C1917">Flowline (Garis Alir):</text>
              <text x="210" y="25" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" fill="#4B5563">Menunjukkan urutan jalannya instruksi dari atas ke bawah.</text>
            </g>
          </svg>
        </div>
      `;
    } else if (currentTopic.diagramType === 'flowchart_single') {
      diagramHtml = `
        <div class="tactile-panel" style="padding: 16px; margin: 16px 0 20px;">
          <div class="eyebrow-label" style="color: var(--text-secondary); margin-bottom: 8px; font-size: 10px;">
            Diagram Alur Percabangan Tunggal (IF Satu Arah):
          </div>
          <svg viewBox="0 0 440 295" width="100%" height="auto" style="max-width: 440px; display: block; margin: 0 auto;">
            <defs>
              <marker id="arrow-green-s" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M 0 0 L 7 3.5 L 0 7 Z" fill="#15803D"/>
              </marker>
              <marker id="arrow-red-s" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M 0 0 L 7 3.5 L 0 7 Z" fill="#DC2626"/>
              </marker>
              <marker id="arrow-gray-s" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M 0 0 L 7 3.5 L 0 7 Z" fill="#78716C"/>
              </marker>
            </defs>

            <!-- 1. Terminator Mulai -->
            <rect x="170" y="10" width="100" height="26" rx="13" fill="#F7F5F0" stroke="#0F766E" stroke-width="1.8"/>
            <text x="220" y="27" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold" fill="#0F766E">Mulai</text>

            <!-- Garis Alir Mulai -> Kondisi -->
            <line x1="220" y1="36" x2="220" y2="58" stroke="#0F766E" stroke-width="2" marker-end="url(#arrow-green-s)"/>

            <!-- 2. Belah Ketupat Kondisi (Decision Diamond) -->
            <polygon points="220,60 295,95 220,130 145,95" fill="#FFFFFF" stroke="#D97706" stroke-width="2.2"/>
            <text x="220" y="92" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="bold" fill="#1C1917">suhu &gt; 30?</text>
            <text x="220" y="107" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="600" fill="#92400E">(Evaluasi Boolean)</text>

            <!-- 3. Cabang YA / TRUE (Mengalir ke Bawah) -->
            <path d="M 220,130 L 220,158" fill="none" stroke="#15803D" stroke-width="2.2" marker-end="url(#arrow-green-s)"/>
            <rect x="235" y="134" width="28" height="16" rx="3" fill="#DCFCE7" stroke="#15803D" stroke-width="1"/>
            <text x="250" y="146" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="bold" fill="#15803D">Ya</text>

            <!-- Kotak Aksi Sirine (Proses) -->
            <rect x="150" y="160" width="140" height="38" rx="6" fill="#FFFFFF" stroke="#15803D" stroke-width="2"/>
            <text x="210" y="176" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold" fill="#15803D">Bunyikan Sirine</text>
            <text x="220" y="190" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8.5" fill="#57534E">sirine = ON</text>

            <!-- Garis Alir dari Aksi ke Lanjut -->
            <path d="M 220,198 L 220,248" fill="none" stroke="#78716C" stroke-width="2" marker-end="url(#arrow-gray-s)"/>

            <!-- 4. Cabang TIDAK / FALSE (Bypass Kanan Menuju Selesai) -->
            <path d="M 295,95 L 365,95 L 365,263 L 305,263" fill="none" stroke="#DC2626" stroke-width="2" marker-end="url(#arrow-red-s)"/>
            <rect x="305" y="75" width="38" height="16" rx="3" fill="#FEE2E2" stroke="#DC2626" stroke-width="1"/>
            <text x="324" y="87" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="bold" fill="#DC2626">Tidak</text>
            
            <!-- 5. Titik Selesai / Langkah Berikutnya -->
            <rect x="140" y="250" width="160" height="26" rx="13" fill="#EFECE6" stroke="#A8A29E" stroke-width="1.8"/>
            <text x="220" y="267" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" font-weight="bold" fill="#1C1917">Lanjut Baris Berikutnya</text>
          </svg>
        </div>
      `;
    } else if (currentTopic.diagramType === 'flowchart_ifelse') {
      diagramHtml = `
        <div style="margin: 16px 0 20px;">
          <div class="eyebrow-label" style="color: var(--text-secondary); margin-bottom: 6px;">
            Diagram Alur Logika (Flowchart If-Else Dua Arah):
          </div>
          <div class="tactile-panel" style="padding: 12px; display: flex; justify-content: center; align-items: center;">
            <img src="/assets/images/flowchart_ifelse.svg" alt="Diagram Alur If-Else" style="
              width: 100%;
              max-width: 360px;
              height: auto;
              display: block;
            " />
          </div>
        </div>
      `;
    } else if (currentTopic.diagramType === 'flowchart_nested') {
      diagramHtml = `
        <div class="tactile-panel" style="padding: 14px; margin: 16px 0 20px;">
          <div class="eyebrow-label" style="color: var(--text-secondary); margin-bottom: 8px; font-size: 10px;">
            Diagram Alur Percabangan Bertingkat (If - Else If - Else):
          </div>
          <svg viewBox="0 0 420 260" width="100%" height="auto" style="max-width: 420px; display: block; margin: 0 auto;">
            <defs>
              <marker id="arrow-n-gr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="#15803D"/>
              </marker>
              <marker id="arrow-n-rd" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="#DC2626"/>
              </marker>
            </defs>
            <polygon points="120,15 190,45 120,75 50,45" fill="#FFFFFF" stroke="#D97706" stroke-width="2"/>
            <text x="120" y="48" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" fill="#1C1917">nilai &gt;= 90?</text>

            <path d="M 190,45 L 260,45" fill="none" stroke="#15803D" stroke-width="2" marker-end="url(#arrow-n-gr)"/>
            <text x="215" y="38" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="bold" fill="#15803D">Ya</text>
            <rect x="265" y="28" width="90" height="34" rx="5" fill="#DCFCE7" stroke="#15803D" stroke-width="1.5"/>
            <text x="310" y="49" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold" fill="#15803D">Grade A</text>

            <path d="M 120,75 L 120,110" fill="none" stroke="#DC2626" stroke-width="2" marker-end="url(#arrow-n-rd)"/>
            <text x="130" y="95" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="bold" fill="#DC2626">Tidak</text>

            <polygon points="120,115 190,145 120,175 50,145" fill="#FFFFFF" stroke="#D97706" stroke-width="2"/>
            <text x="120" y="148" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" fill="#1C1917">nilai &gt;= 75?</text>

            <path d="M 190,145 L 260,145" fill="none" stroke="#15803D" stroke-width="2" marker-end="url(#arrow-n-gr)"/>
            <text x="215" y="138" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="bold" fill="#15803D">Ya</text>
            <rect x="265" y="128" width="90" height="34" rx="5" fill="#DCFCE7" stroke="#15803D" stroke-width="1.5"/>
            <text x="310" y="149" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold" fill="#15803D">Grade B</text>

            <path d="M 120,175 L 120,210" fill="none" stroke="#DC2626" stroke-width="2" marker-end="url(#arrow-n-rd)"/>
            <text x="130" y="195" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="bold" fill="#DC2626">Tidak</text>
            <rect x="70" y="212" width="100" height="34" rx="5" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
            <text x="120" y="233" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold" fill="#DC2626">Grade C / D</text>
          </svg>
        </div>
      `;
    }

    // Analogi Callout Box
    let analogyHtml = '';
    if (currentTopic.analogies) {
      analogyHtml = `
        <div style="padding: 14px 16px; font-size: 12.5px; background: rgba(217, 119, 6, 0.05); border: 1px solid rgba(217, 119, 6, 0.22); border-radius: 10px; margin-bottom: 14px; line-height: 1.6;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: var(--warning-dark); margin-bottom: 4px;">
            ${renderPixelIcon('bulb', 13, 'var(--warning-dark)')} Analogi Kehidupan Sehari-Hari:
          </div>
          <p style="margin: 0; color: var(--text-primary);">
            ${currentTopic.analogies}
          </p>
        </div>
      `;
    }

    // Misconception Alert jika ada
    let misconceptionHtml = '';
    if (currentTopic.misconceptionWarning) {
      misconceptionHtml = `
        <div style="padding: 14px 16px; background: rgba(220, 38, 38, 0.04); border: 1px solid rgba(220, 38, 38, 0.2); border-radius: 10px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: var(--danger); font-size: 12px;">
            ${renderPixelIcon('shield', 13, 'var(--danger)')} Waspadai Miskonsepsi Murid:
          </div>
          <p style="margin-top: 4px; font-size: 12px; line-height: 1.5; color: var(--text-secondary);">
            ${currentTopic.misconceptionWarning}
          </p>
        </div>
      `;
    }

    // Interactive Simulator HTML
    let simulatorHtml = '';
    if (currentTopic.simulator) {
      const sim = currentTopic.simulator;
      simulatorHtml = `
        <div class="tactile-card" style="margin: 18px 0; padding: 16px 18px; background: #ffffff; border: 1px solid rgba(15, 118, 110, 0.25); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
            <span style="font-family: var(--font-pixel); font-size: 9.5px; color: var(--primary); display: inline-flex; align-items: center; gap: 6px;">
              ${renderPixelIcon('flask', 13, 'var(--primary)')} Simulator Uji Kondisi Interaktif
            </span>
            <span class="badge-pill" style="font-size: 8.5px; color: var(--primary); border-color: rgba(15, 118, 110, 0.25);">Coba Sendiri</span>
          </div>

          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
            <label style="font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              ${escapeHtml(sim.variableLabel)}:
            </label>
            <input id="input-sim-val" type="number" class="pixel-input" value="${sim.defaultValue}" style="width: 120px; min-height: 44px; font-family: var(--font-code); font-size: 13px; font-weight: bold;" />
            <button id="btn-run-sim" type="button" class="game-btn game-btn-primary" style="font-size: 12px; min-height: 44px; padding: 8px 16px; gap: 6px; border-radius: 8px; font-weight: 700;">
              ${renderPixelIcon('bolt', 12, '#ffffff')} <span>[ Cek Kondisi ]</span>
            </button>
          </div>

          <div id="sim-result-box" style="margin-top: 10px; border-radius: 10px; transition: all 0.2s ease;"></div>
        </div>
      `;
    }

    // Interactive Micro-Quiz HTML
    let quizHtml = '';
    if (currentTopic.interactiveCheck) {
      const q = currentTopic.interactiveCheck;
      quizHtml = `
        <div class="tactile-card" style="margin: 18px 0; padding: 16px 18px; background: #ffffff; border: 1px solid rgba(217, 119, 6, 0.25); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.03);">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            ${renderPixelIcon('help', 13, 'var(--warning-dark)')}
            <span style="font-family: var(--font-pixel); font-size: 9px; color: var(--warning-dark);">Uji Pemahaman Cepat</span>
          </div>
          <div style="font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 10px; line-height: 1.5;">
            ${q.question}
          </div>
          <div id="quiz-options-container" style="display: flex; flex-direction: column; gap: 6px;">
            ${q.options.map((opt, oIdx) => `
              <button type="button" class="game-btn game-btn-secondary btn-quiz-opt" data-idx="${oIdx}" style="justify-content: flex-start; text-align: left; font-size: 11.5px; padding: 8px 12px; line-height: 1.4; width: 100%; border-radius: 8px;">
                ${String.fromCharCode(65 + oIdx)}. ${opt.label}
              </button>
            `).join('')}
          </div>
          <div id="quiz-feedback-box" style="display: none; margin-top: 10px; padding: 10px 12px; border-radius: 8px; font-size: 12px; line-height: 1.5;"></div>
        </div>
      `;
    }

    const isPercabangan = currentTopic.category === 'PERCABANGAN';
    const badgeStyle = isPercabangan
      ? 'color: var(--primary); font-weight: bold; border-color: rgba(15, 118, 110, 0.4); background: rgba(15, 118, 110, 0.1);'
      : 'color: var(--warning-dark, #92400e); font-weight: bold; border-color: rgba(217, 119, 6, 0.4); background: rgba(217, 119, 6, 0.1);';

    const maxUnlocked = this.materiMaxUnlockedStackMap[topicId] || 1;
    const activeStack = this.materiActiveStackMap[topicId] || 1;
    const isTopicCompleted = isAlreadyRead || maxUnlocked === 3;
    const hasInteractive = !!(currentTopic.simulator || currentTopic.interactiveCheck);

    contentCard.innerHTML = `
      <!-- Konten Modul Materi (diblur saat Siklus 2 terkunci) -->
      <div style="${isCurrentTopicLocked ? 'filter: blur(4px); pointer-events: none; user-select: none; max-height: 520px; overflow: hidden;' : ''}">
        <!-- Header Modul -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; gap: 10px; flex-wrap: wrap;">
          <div>
            <div class="eyebrow-label" style="color: ${isPercabangan ? 'var(--primary)' : 'var(--warning-dark)'}; margin-bottom: 2px;">
              ${currentTopic.categoryLabel.toUpperCase()} • TOPIK ${currentTopic.order}
            </div>
            <h2 class="materi-title-h2">
              ${escapeHtml(currentTopic.title)}
            </h2>
            <div class="materi-prose" style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 2px;">
              ${escapeHtml(currentTopic.subtitle)}
            </div>
          </div>
          <span class="badge-pill" style="${badgeStyle}">
            ${currentTopic.badgeLabel}
          </span>
        </div>

        <!-- Bilah Stepper Progres Materi Bertahap -->
        <div class="materi-stepper-box" style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <span style="font-family: var(--font-code); font-size: 11px; font-weight: 700; color: var(--primary); display: inline-flex; align-items: center; gap: 6px;">
              ${renderPixelIcon('target', 12, 'var(--primary)')} Langkah Penelaahan Materi
            </span>
            <span id="materi-progress-text" style="font-family: var(--font-code); font-size: 10.5px; font-weight: 700; color: var(--text-secondary);">
              Tahap ${activeStack} dari 3 • ${isTopicCompleted ? '100% Tuntas' : `${Math.round((activeStack / 3) * 100)}% Dipelajari`}
            </span>
          </div>
          <div class="materi-progress-track">
            <div id="materi-progress-fill" class="materi-progress-fill" style="width: ${isTopicCompleted ? '100%' : `${(activeStack / 3) * 100}%`};"></div>
          </div>
          <div class="materi-stepper-pills">
            <button id="materi-stepper-pill-1" type="button" class="materi-stepper-pill ${activeStack === 1 ? 'active' : (maxUnlocked >= 2 ? 'completed' : '')}">
              ${renderPixelIcon('bulb', 12, 'currentColor')} <span>1. Konsep &amp; Alur</span>
            </button>
            <button id="materi-stepper-pill-2" type="button" class="materi-stepper-pill ${activeStack === 2 ? 'active' : (maxUnlocked >= 3 ? 'completed' : (maxUnlocked < 2 && !isAlreadyRead ? 'locked' : ''))}">
              ${renderPixelIcon(maxUnlocked >= 2 || isAlreadyRead ? 'document' : 'lock', 12, 'currentColor')} <span>2. Sintaks &amp; Kode</span>
            </button>
            <button id="materi-stepper-pill-3" type="button" class="materi-stepper-pill ${activeStack === 3 ? 'active' : (maxUnlocked >= 3 ? (isAlreadyRead ? 'completed' : '') : (isAlreadyRead ? '' : 'locked'))}">
              ${renderPixelIcon(maxUnlocked >= 3 || isAlreadyRead ? (hasInteractive ? 'flask' : 'check') : 'lock', 12, 'currentColor')} <span>3. ${hasInteractive ? 'Uji Interaktif' : 'Refleksi Topik'}</span>
            </button>
          </div>
        </div>

        <!-- STACK CONTAINER -->
        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 18px;">

          <!-- STACK 1: Konsep Dasar & Diagram Alur -->
          <article id="materi-stack-card-1" class="materi-stack-card ${activeStack === 1 ? 'active' : (isAlreadyRead ? 'completed' : '')}">
            <button id="materi-stack-header-1" type="button" class="materi-stack-header" aria-expanded="${activeStack === 1 ? 'true' : 'false'}">
              <div class="materi-stack-title-box">
                <div class="materi-stack-num-badge">01</div>
                <div>
                  <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary);">
                    Konsep Dasar &amp; Diagram Alur
                  </div>
                  <div style="font-size: 11px; color: var(--text-secondary); margin-top: 1px;">
                    Intisari teori, analogi kehidupan, dan visualisasi bagan alir (flowchart)
                  </div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span id="materi-stack-badge-1" class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); border: 1px solid rgba(15, 118, 110, 0.25); background: rgba(15, 118, 110, 0.08); display: inline-flex; align-items: center; gap: 4px;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background: var(--primary);"></span> Sedang Dibaca
                </span>
                <span id="materi-stack-chevron-1" class="materi-stack-chevron ${activeStack === 1 ? 'expanded' : ''}">
                  ${renderPixelIcon('arrow-down', 12, 'var(--text-secondary)')}
                </span>
              </div>
            </button>

            <div id="materi-stack-body-1" class="materi-stack-body" style="${activeStack === 1 ? 'display: block;' : 'display: none;'}">
              <!-- Analogi Kehidupan Sehari-hari jika ada -->
              ${analogyHtml}

              <!-- Ringkasan Intisari Teori -->
              <div style="padding: 14px 16px; margin-bottom: 14px; background: ${isPercabangan ? 'rgba(15, 118, 110, 0.04)' : 'rgba(217, 119, 6, 0.04)'}; border: 1px solid ${isPercabangan ? 'rgba(15, 118, 110, 0.2)' : 'rgba(217, 119, 6, 0.2)'}; border-radius: 10px;">
                <div class="materi-prose">
                  <strong style="color: ${isPercabangan ? 'var(--primary)' : 'var(--warning-dark)'};">Intisari Teori:</strong> ${escapeHtml(currentTopic.summary)}
                </div>
              </div>

              <!-- Diagram Flowchart jika ada -->
              ${diagramHtml}

              <div class="materi-advance-btn-box">
                <button id="btn-materi-advance-1" type="button" class="game-btn game-btn-primary" style="padding: 10px 18px; font-size: 12px; min-height: 48px; width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                  Paham Konsep, Lanjut ke Bedah Sintaks &amp; Kode ${renderPixelIcon('arrow-right', 12, '#ffffff')}
                </button>
              </div>
            </div>
          </article>

          <!-- STACK 2: Bedah Sintaks & Contoh Kode -->
          <article id="materi-stack-card-2" class="materi-stack-card ${activeStack === 2 ? 'active' : (maxUnlocked < 2 && !isAlreadyRead ? 'locked' : (isAlreadyRead ? 'completed' : ''))}">
            <button id="materi-stack-header-2" type="button" class="materi-stack-header" aria-expanded="${activeStack === 2 ? 'true' : 'false'}">
              <div class="materi-stack-title-box">
                <div class="materi-stack-num-badge">02</div>
                <div>
                  <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary);">
                    Bedah Sintaks, Aturan &amp; Kode Program
                  </div>
                  <div style="font-size: 11px; color: var(--text-secondary); margin-top: 1px;">
                    Struktur kode C &amp; Pseudokode, tabel logika, serta tips penting
                  </div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span id="materi-stack-badge-2" class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--text-muted); border: 1px solid rgba(28, 25, 23, 0.15); background: rgba(0, 0, 0, 0.04); display: inline-flex; align-items: center; gap: 4px;">
                  ${maxUnlocked >= 2 || isAlreadyRead ? `${renderPixelIcon('check', 10, 'var(--success)')} <span style="color: var(--success);">Terbuka</span>` : `${renderPixelIcon('lock', 10, 'var(--text-muted)')} Terkunci`}
                </span>
                <span id="materi-stack-chevron-2" class="materi-stack-chevron ${activeStack === 2 ? 'expanded' : ''}">
                  ${renderPixelIcon('arrow-down', 12, 'var(--text-secondary)')}
                </span>
              </div>
            </button>

            <div id="materi-stack-body-2" class="materi-stack-body" style="${activeStack === 2 ? 'display: block;' : 'display: none;'}">
              <!-- Bagian-Bagian Materi Pembelajaran -->
              ${sectionsHtml}

              <!-- Kotak Petunjuk / Tips Guru -->
              <aside class="tips-callout" style="margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 6px; font-weight: bold; color: var(--warning); font-size: 12px;">
                  ${renderPixelIcon('bulb', 14, 'var(--warning)')} Tips Logika Penting:
                </div>
                <p style="margin-top: 4px; font-size: 12.5px; line-height: 1.5; color: var(--text-secondary);">
                  ${currentTopic.proTips}
                </p>
              </aside>

              <!-- Kotak Peringatan Miskonsepsi jika ada -->
              ${misconceptionHtml}

              <!-- Kotak Panduan Catatan LKPD Murid (Hanya Siklus 1) -->
              ${!this.isCycle2Unlocked ? `
              <aside style="margin: 14px 0; padding: 12px 14px; background: rgba(15, 118, 110, 0.05); border: 1.5px dashed rgba(15, 118, 110, 0.35); border-radius: 10px; display: flex; align-items: flex-start; gap: 10px;">
                <span style="display: inline-flex; margin-top: 2px;">${renderPixelIcon('document', 14, 'var(--primary)')}</span>
                <div style="font-size: 12px; line-height: 1.5; color: var(--text-secondary);">
                  <strong style="color: var(--primary); display: block; margin-bottom: 2px;">Tugas Murid pada LKPD di Meja:</strong>
                  Sambil membaca materi ini, catat intisari konsep, tabel operator, pola kode, atau tips penting di atas ke <strong>Lembar Kerja Rangkuman (LKPD)</strong> fisikmu!
                </div>
              </aside>
              ` : ''}

              <div class="materi-advance-btn-box">
                <button id="btn-materi-advance-2" type="button" class="game-btn game-btn-primary" style="padding: 10px 18px; font-size: 12px; min-height: 48px; width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                  Paham Sintaks, Lanjut ke ${hasInteractive ? 'Uji Interaktif' : 'Refleksi Topik'} ${renderPixelIcon('arrow-right', 12, '#ffffff')}
                </button>
              </div>
            </div>
          </article>

          <!-- STACK 3: Eksplorasi Interaktif & Refleksi Mandiri -->
          <article id="materi-stack-card-3" class="materi-stack-card ${activeStack === 3 ? 'active' : (maxUnlocked < 3 && !isAlreadyRead ? 'locked' : (isAlreadyRead ? 'completed' : ''))}">
            <button id="materi-stack-header-3" type="button" class="materi-stack-header" aria-expanded="${activeStack === 3 ? 'true' : 'false'}">
              <div class="materi-stack-title-box">
                <div class="materi-stack-num-badge">03</div>
                <div>
                  <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary);">
                    ${hasInteractive ? 'Eksplorasi Interaktif &amp; Cek Pemahaman' : 'Refleksi Mandiri &amp; Konfirmasi Pemahaman'}
                  </div>
                  <div style="font-size: 11px; color: var(--text-secondary); margin-top: 1px;">
                    ${hasInteractive ? 'Simulasi nilai masukan dan kuis pemahaman cepat' : 'Rangkuman pemahaman konsep sebelum melanjutkan'}
                  </div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span id="materi-stack-badge-3" class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--text-muted); border: 1px solid rgba(28, 25, 23, 0.15); background: rgba(0, 0, 0, 0.04); display: inline-flex; align-items: center; gap: 4px;">
                  ${maxUnlocked >= 3 || isAlreadyRead ? `${renderPixelIcon('check', 10, 'var(--success)')} <span style="color: var(--success);">Terbuka</span>` : `${renderPixelIcon('lock', 10, 'var(--text-muted)')} Terkunci`}
                </span>
                <span id="materi-stack-chevron-3" class="materi-stack-chevron ${activeStack === 3 ? 'expanded' : ''}">
                  ${renderPixelIcon('arrow-down', 12, 'var(--text-secondary)')}
                </span>
              </div>
            </button>

            <div id="materi-stack-body-3" class="materi-stack-body" style="${activeStack === 3 ? 'display: block;' : 'display: none;'}">
              <!-- Simulator Interaktif jika ada -->
              ${simulatorHtml}

              <!-- Uji Pemahaman Cepat jika ada -->
              ${quizHtml}

              <!-- Jika tidak ada simulator dan kuis, tampilkan refleksi pemahaman -->
              ${!hasInteractive ? `
                <div style="border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px 18px; background: rgba(15, 118, 110, 0.04); margin-bottom: 14px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    ${renderPixelIcon('check', 14, 'var(--primary)')}
                    <span style="font-family: var(--font-pixel); font-size: 9.5px; color: var(--primary);">Refleksi Pemahaman Konsep</span>
                  </div>
                  <p style="font-size: 12.5px; color: var(--text-primary); line-height: 1.55; margin-bottom: 10px;">
                    Kamu telah menuntaskan penelusuran konsep dan aturan kode untuk topik <strong>${escapeHtml(currentTopic.title)}</strong>.
                  </p>
                  <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: var(--text-secondary);">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      ${renderPixelIcon('check', 11, 'var(--success)')} Memahami struktur dan alur logika konsep ini.
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      ${renderPixelIcon('check', 11, 'var(--success)')} Memahami representasi sintaks Bahasa C dan Pseudokode.
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- Banner Status Tuntas Topik -->
              <div style="background: rgba(21, 128, 61, 0.06); border: 1px solid rgba(21, 128, 61, 0.25); border-radius: 10px; padding: 12px 14px; margin-bottom: 14px; display: flex; align-items: center; gap: 10px;">
                ${renderPixelIcon('trophy', 16, 'var(--success)')}
                <div style="font-size: 12px; color: var(--text-primary); line-height: 1.45;">
                  <strong style="color: var(--success);">Topik Tuntas Dipelajari!</strong> Pemahaman topik ini telah tercatat pada portofolio belajar perangkat kamu.
                </div>
              </div>

              <!-- Tombol Aksi Akhir Topik -->
              <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
                ${isNextTopicCycle2Locked ? `
                  <!-- Panduan & Aksi Utama Lanjut ke Lab Telusur untuk Siklus 1 -->
                  <div style="display: flex; flex-direction: column; gap: 8px; background: rgba(15, 118, 110, 0.04); border: 1px solid rgba(15, 118, 110, 0.18); border-radius: 10px; padding: 14px 16px;">
                    <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                      Materi dasar Siklus 1 telah selesai dipelajari! Lanjutkan langkah ke <strong style="color: var(--primary);">Lab Telusur Kode</strong> untuk menguji alur cabang logika program.
                    </div>
                    <button id="btn-stack3-to-tracing" type="button" class="game-btn game-btn-primary" style="min-height: 48px; width: 100%; justify-content: center; gap: 8px; border-radius: 8px; font-weight: 700;">
                      ${renderPixelIcon('flask', 14, '#ffffff')} <span>Lanjut ke Meja Kerja Lab Telusur (Langkah 02)</span> ${renderPixelIcon('arrow-right', 12, '#ffffff')}
                    </button>
                  </div>

                  <!-- Tombol Lanjut ke Topik Berikutnya Dikunci untuk Siklus 2 -->
                  <button id="btn-stack3-next-topic" type="button" class="game-btn game-btn-secondary" disabled style="min-height: 48px; width: 100%; justify-content: center; gap: 8px; border-radius: 8px; opacity: 0.72; cursor: not-allowed; border: 1px dashed rgba(217, 119, 6, 0.35); color: var(--text-muted); background: var(--surface-panel-alt); font-size: 12px;" title="Materi Siklus 2 terkunci. Akan dibuka pada sesi Siklus 2.">
                    ${renderPixelIcon('lock', 12, 'var(--warning-dark)')} <span>Topik Berikutnya: ${escapeHtml(nextTopic!.title)} (Terkunci • Khusus Siklus 2)</span>
                  </button>
                ` : (!nextTopic ? `
                  <!-- Panduan & Aksi Utama Lanjut ke Lab Telusur untuk Siklus 2 (Akhir Seluruh Topik Materi) -->
                  <div style="display: flex; flex-direction: column; gap: 8px; background: rgba(15, 118, 110, 0.04); border: 1px solid rgba(15, 118, 110, 0.18); border-radius: 10px; padding: 14px 16px;">
                    <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                      Seluruh materi pembelajaran ${this.isCycle2Unlocked ? 'Siklus 1 &amp; 2' : 'Siklus 1'} telah selesai dipelajari! Lanjutkan langkah ke <strong style="color: var(--primary);">Lab Telusur Kode</strong> untuk menguji alur cabang logika program.
                    </div>
                    <button id="btn-stack3-to-tracing" type="button" class="game-btn game-btn-primary" style="min-height: 48px; width: 100%; justify-content: center; gap: 8px; border-radius: 8px; font-weight: 700;">
                      ${renderPixelIcon('flask', 14, '#ffffff')} <span>Lanjut ke Meja Kerja Lab Telusur (Langkah 02)</span> ${renderPixelIcon('arrow-right', 12, '#ffffff')}
                    </button>
                  </div>
                ` : `
                  <button id="btn-stack3-next-topic" type="button" class="game-btn game-btn-primary" style="min-height: 48px; width: 100%; justify-content: center; gap: 8px; border-radius: 8px;">
                    <span>Lanjut ke Topik Berikutnya (${escapeHtml(nextTopic.title)})</span> ${renderPixelIcon('arrow-right', 12, '#ffffff')}
                  </button>
                `)}
              </div>
            </div>
          </article>

        </div>
      </div>

      <!-- Overlay Kunci Siklus 2 (tampil saat modul Siklus 2 terkunci) -->
      ${isCurrentTopicLocked ? `
        <div style="position: absolute; inset: 0; background: rgba(245, 241, 232, 0.78); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 24px; border-radius: 12px; text-align: center; z-index: 10;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: rgba(217, 119, 6, 0.12); margin-bottom: 4px; border: 2px solid var(--warning);">
            ${renderPixelIcon('lock', 26, 'var(--warning)')}
          </div>
          <h2 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px;">
            ${currentTopic.title} (Gerbang Siklus 2 Terkunci)
          </h2>
          <p style="font-size: 12.5px; color: var(--text-secondary); max-width: 440px; margin: 0 auto 12px; line-height: 1.55;">
            Materi tingkat lanjut (Percabangan Bertingkat &amp; Majemuk) dibuka menggunakan <strong>Token Kelas</strong> yang diumumkan oleh Guru Informatika saat masuk ke pertemuan Siklus 2.
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
            <button id="btn-unlock-materi-cycle2" type="button" class="game-btn game-btn-gold" style="font-size: 11px; padding: 8px 16px; min-height: 44px; display: inline-flex; align-items: center; gap: 6px;">
              ${renderPixelIcon('unlock', 11, '#ffffff')} Masukkan Token Guru
            </button>
            <button id="btn-back-to-cycle1" type="button" class="game-btn game-btn-secondary" style="font-size: 11px; padding: 8px 14px; min-height: 44px; display: inline-flex; align-items: center; gap: 6px;">
              ${renderPixelIcon('arrow-left', 11, 'var(--text-secondary)')} Kembali ke Topik Sebelumnya
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Bilah Navigasi Bawah Terstruktur & Proporsional (UI/UX Principal Alignment) -->
      <nav class="materi-nav-bar" aria-label="Navigasi Materi & Langkah Penyelidikan">
        <div class="materi-nav-main-row">
          <div class="materi-nav-group-paging">
            <button id="btn-materi-prev" type="button" class="game-btn game-btn-secondary materi-nav-btn" ${currentIndex === 0 ? 'disabled' : ''}>
              ${renderPixelIcon('arrow-left', 12, 'currentColor')} <span>Sebelumnya</span>
            </button>
            <span class="materi-nav-page-indicator">
              Topik ${currentIndex + 1} / ${MATERI_BANK.length}
            </span>
            <button id="btn-materi-next" type="button" class="game-btn game-btn-secondary materi-nav-btn" ${currentIndex === MATERI_BANK.length - 1 || isNextTopicCycle2Locked || isNextTopicPrereqLocked ? 'disabled' : ''} style="${isNextTopicCycle2Locked || isNextTopicPrereqLocked ? 'opacity: 0.6; cursor: not-allowed;' : ''}" title="${isNextTopicCycle2Locked ? 'Materi berikutnya terkunci untuk Siklus 2' : (isNextTopicPrereqLocked ? 'Tuntaskan membaca Topik 9 terlebih dahulu untuk lanjut' : 'Topik selanjutnya')}">
              <span>Selanjutnya</span> ${renderPixelIcon(isNextTopicCycle2Locked || isNextTopicPrereqLocked ? 'lock' : 'arrow-right', 12, (isNextTopicCycle2Locked || isNextTopicPrereqLocked) ? 'var(--warning-dark)' : 'currentColor')}
            </button>
          </div>

          <div class="materi-nav-group-action">
            <button id="btn-to-tracing" type="button" class="game-btn ${isAllRequiredRead ? 'game-btn-success' : 'game-btn-secondary'} materi-nav-cta" ${!isAllRequiredRead ? 'disabled' : ''} style="${!isAllRequiredRead ? 'opacity: 0.75; cursor: not-allowed;' : ''}">
              ${renderPixelIcon(isAllRequiredRead ? 'flask' : 'lock', 14, isAllRequiredRead ? '#ffffff' : 'currentColor')}
              <span>${isAllRequiredRead ? 'Pahami Konsep &amp; Lanjut ke Lab Telusur' : `Pelajari Materi (${readRequiredCount}/${totalRequired}) untuk Lanjut`}</span>
              ${isAllRequiredRead ? renderPixelIcon('arrow-right', 12, '#ffffff') : ''}
            </button>
          </div>
        </div>

        <div class="materi-nav-status-row">
          <div class="materi-read-status-hint ${isAllRequiredRead ? 'is-complete' : 'is-pending'}">
            ${isAllRequiredRead
        ? `${renderPixelIcon('check', 12, 'var(--success)')} <span>Seluruh <strong>${totalRequired} materi ${this.isCycle2Unlocked ? 'Siklus 1 & 2' : 'Siklus 1'}</strong> telah dipelajari. Siap melanjutkan ke Lab Telusur!</span>`
        : `${renderPixelIcon('shield', 12, 'var(--warning-dark)')} <span>Buka dan pelajari seluruh <strong>${totalRequired} materi ${this.isCycle2Unlocked ? 'Siklus 1 & 2' : 'Siklus 1'}</strong> (${readRequiredCount}/${totalRequired} selesai) untuk membuka Lab Telusur.</span>`}
          </div>
        </div>
      </nav>
    `;

    // Pasang Referensi Elemen Tumpukan Kartu Materi
    const stackCards = [
      contentCard.querySelector<HTMLElement>('#materi-stack-card-1'),
      contentCard.querySelector<HTMLElement>('#materi-stack-card-2'),
      contentCard.querySelector<HTMLElement>('#materi-stack-card-3')
    ];
    const stackHeaders = [
      contentCard.querySelector<HTMLButtonElement>('#materi-stack-header-1'),
      contentCard.querySelector<HTMLButtonElement>('#materi-stack-header-2'),
      contentCard.querySelector<HTMLButtonElement>('#materi-stack-header-3')
    ];
    const stackBodies = [
      contentCard.querySelector<HTMLElement>('#materi-stack-body-1'),
      contentCard.querySelector<HTMLElement>('#materi-stack-body-2'),
      contentCard.querySelector<HTMLElement>('#materi-stack-body-3')
    ];
    const stackBadges = [
      contentCard.querySelector<HTMLElement>('#materi-stack-badge-1'),
      contentCard.querySelector<HTMLElement>('#materi-stack-badge-2'),
      contentCard.querySelector<HTMLElement>('#materi-stack-badge-3')
    ];
    const stackChevrons = [
      contentCard.querySelector<HTMLElement>('#materi-stack-chevron-1'),
      contentCard.querySelector<HTMLElement>('#materi-stack-chevron-2'),
      contentCard.querySelector<HTMLElement>('#materi-stack-chevron-3')
    ];
    const stepperPills = [
      contentCard.querySelector<HTMLButtonElement>('#materi-stepper-pill-1'),
      contentCard.querySelector<HTMLButtonElement>('#materi-stepper-pill-2'),
      contentCard.querySelector<HTMLButtonElement>('#materi-stepper-pill-3')
    ];
    const progressFill = contentCard.querySelector<HTMLElement>('#materi-progress-fill');
    const progressText = contentCard.querySelector<HTMLElement>('#materi-progress-text');

    const updateStackViews = (targetStack: 1 | 2 | 3, shouldScroll = false) => {
      this.materiActiveStackMap[topicId] = targetStack;
      const curMax = this.materiMaxUnlockedStackMap[topicId] || 1;
      const isComplete = curMax === 3 || isAlreadyRead;

      // Update Stepper Bar
      const percent = isComplete ? 100 : Math.round((targetStack / 3) * 100);
      if (progressFill) progressFill.style.width = `${percent}%`;
      if (progressText) {
        progressText.textContent = isComplete
          ? 'Materi Selesai (100% Tuntas)'
          : `Tahap ${targetStack} dari 3 • ${percent}% Dipelajari`;
      }

      // Jika mencapai stack 3, otomatis tandai materi sebagai dibaca jika belum
      if (targetStack === 3 && !isCurrentTopicLocked && !this.readMateriIds.includes(topicId)) {
        this.readMateriIds.push(topicId);
        void StorageService.markMateriAsRead(topicId);
        this.showRetroToast(`Topik "${currentTopic.title}" tuntas dipelajari!`, true);

        // Perbarui juga indikator centang pada tombol sidebar aktif jika belum ada
        const currentSidebarBtn = sidebar.querySelector<HTMLElement>(`[data-topic-id="${topicId}"]`);
        if (currentSidebarBtn && !currentSidebarBtn.querySelector('.icon-materi-checked')) {
          const checkSpan = document.createElement('span');
          checkSpan.className = 'icon-materi-checked';
          checkSpan.style.cssText = 'color: var(--success); display: inline-flex; align-items: center; margin-left: auto; padding-left: 4px; flex-shrink: 0;';
          checkSpan.title = 'Materi telah dipelajari';
          checkSpan.innerHTML = renderPixelIcon('check', 11, 'var(--success)');
          currentSidebarBtn.appendChild(checkSpan);
        }

        // Perbarui status tombol Lab Telusur di bilah bawah jika semua topik terpenuhi
        const { readCount: updatedReadCount, totalCount: updatedTotalCount, isAllRead: updatedAllRead } = this.getMateriReadProgress();
        const btnToTracing = contentCard.querySelector<HTMLButtonElement>('#btn-to-tracing');
        const readHint = contentCard.querySelector<HTMLElement>('.materi-read-status-hint');

        if (btnToTracing) {
          if (updatedAllRead) {
            btnToTracing.disabled = false;
            btnToTracing.className = 'game-btn game-btn-success materi-nav-cta';
            btnToTracing.style.opacity = '1';
            btnToTracing.style.cursor = 'pointer';
            btnToTracing.innerHTML = `${renderPixelIcon('flask', 14, '#ffffff')} <span>Pahami Konsep &amp; Lanjut ke Lab Telusur</span> ${renderPixelIcon('arrow-right', 12, '#ffffff')}`;
          } else {
            btnToTracing.disabled = true;
            btnToTracing.className = 'game-btn game-btn-secondary materi-nav-cta';
            btnToTracing.style.opacity = '0.75';
            btnToTracing.style.cursor = 'not-allowed';
            btnToTracing.innerHTML = `${renderPixelIcon('lock', 14, 'currentColor')} <span>Pelajari Materi (${updatedReadCount}/${updatedTotalCount}) untuk Lanjut</span>`;
          }
        }
        if (readHint) {
          if (updatedAllRead) {
            readHint.className = 'materi-read-status-hint is-complete';
            readHint.innerHTML = `${renderPixelIcon('check', 12, 'var(--success)')} <span>Seluruh <strong>${updatedTotalCount} materi ${this.isCycle2Unlocked ? 'Siklus 1 & 2' : 'Siklus 1'}</strong> telah dipelajari. Siap melanjutkan ke Lab Telusur!</span>`;
          } else {
            readHint.className = 'materi-read-status-hint is-pending';
            readHint.innerHTML = `${renderPixelIcon('shield', 12, 'var(--warning-dark)')} <span>Buka dan pelajari seluruh <strong>${updatedTotalCount} materi ${this.isCycle2Unlocked ? 'Siklus 1 & 2' : 'Siklus 1'}</strong> (${updatedReadCount}/${updatedTotalCount} selesai) untuk membuka Lab Telusur.</span>`;
          }
        }
      }

      for (let i = 1; i <= 3; i++) {
        const idx = i - 1;
        const c = stackCards[idx];
        const body = stackBodies[idx];
        const badge = stackBadges[idx];
        const chevron = stackChevrons[idx];
        const pill = stepperPills[idx];

        if (!c || !body || !badge || !chevron || !pill) continue;

        const isUnlocked = i <= (this.materiMaxUnlockedStackMap[topicId] || 1) || isAlreadyRead;
        const isOpen = i === targetStack;
        const isCompleted = (i < (this.materiMaxUnlockedStackMap[topicId] || 1)) || isAlreadyRead;

        c.classList.toggle('active', isOpen);
        c.classList.toggle('locked', !isUnlocked);
        c.classList.toggle('completed', isCompleted && !isOpen);

        body.style.display = isOpen ? 'block' : 'none';
        chevron.classList.toggle('expanded', isOpen);

        if (!isUnlocked) {
          badge.innerHTML = `${renderPixelIcon('lock', 10, 'var(--text-muted)')} <span style="font-size: 10px; color: var(--text-muted); font-weight: 700;">Terkunci</span>`;
          badge.style.borderColor = 'rgba(28, 25, 23, 0.15)';
          badge.style.background = 'rgba(0, 0, 0, 0.04)';
          badge.style.color = 'var(--text-muted)';
        } else if (isOpen) {
          badge.innerHTML = `<span style="width: 5px; height: 5px; border-radius: 50%; background: var(--primary);"></span> <span style="font-size: 10px; color: var(--primary); font-weight: 700;">Sedang Dibaca</span>`;
          badge.style.borderColor = 'rgba(15, 118, 110, 0.25)';
          badge.style.background = 'rgba(15, 118, 110, 0.08)';
          badge.style.color = 'var(--primary)';
        } else {
          badge.innerHTML = `${renderPixelIcon('check', 10, 'var(--success)')} <span style="font-size: 10px; color: var(--success); font-weight: 700;">Selesai Dibaca</span>`;
          badge.style.borderColor = 'rgba(21, 128, 61, 0.25)';
          badge.style.background = 'rgba(21, 128, 61, 0.08)';
          badge.style.color = 'var(--success)';
        }

        pill.className = `materi-stepper-pill ${isOpen ? 'active' : (isCompleted ? 'completed' : (isUnlocked ? '' : 'locked'))}`;
      }

      if (shouldScroll) {
        const targetEl = stackCards[targetStack - 1];
        if (targetEl) {
          setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 60);
        }
      }
    };

    // Event Listener Header Kartu
    stackHeaders.forEach((header, index) => {
      const stackNum = (index + 1) as 1 | 2 | 3;
      header?.addEventListener('click', () => {
        const isUnlocked = stackNum <= (this.materiMaxUnlockedStackMap[topicId] || 1) || isAlreadyRead;
        if (!isUnlocked) {
          soundFx.playLogicFalse();
          this.showRetroToast('Selesaikan dan pahami bagian materi sebelumnya terlebih dahulu.', false);
          const cardEl = stackCards[index];
          if (cardEl) {
            cardEl.style.transform = 'translateX(4px)';
            setTimeout(() => { cardEl.style.transform = 'translateX(-4px)'; }, 80);
            setTimeout(() => { cardEl.style.transform = 'none'; }, 160);
          }
          return;
        }

        soundFx.playButtonBlip();
        if (this.materiActiveStackMap[topicId] === stackNum) {
          const body = stackBodies[index];
          const chevron = stackChevrons[index];
          if (body && chevron) {
            const isCurrentlyOpen = body.style.display !== 'none';
            body.style.display = isCurrentlyOpen ? 'none' : 'block';
            chevron.classList.toggle('expanded', !isCurrentlyOpen);
          }
        } else {
          updateStackViews(stackNum, true);
        }
      });
    });

    // Event Listener Stepper Pills
    stepperPills.forEach((pill, index) => {
      const stackNum = (index + 1) as 1 | 2 | 3;
      pill?.addEventListener('click', () => {
        const isUnlocked = stackNum <= (this.materiMaxUnlockedStackMap[topicId] || 1) || isAlreadyRead;
        if (!isUnlocked) {
          soundFx.playLogicFalse();
          this.showRetroToast('Bagian materi ini masih terkunci. Pelajari bagian sebelumnya terlebih dahulu.', false);
          return;
        }
        soundFx.playButtonBlip();
        updateStackViews(stackNum, true);
      });
    });

    // Tombol Advance 1 -> 2
    contentCard.querySelector<HTMLButtonElement>('#btn-materi-advance-1')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      const curMax = this.materiMaxUnlockedStackMap[topicId] || 1;
      if (curMax < 2) {
        this.materiMaxUnlockedStackMap[topicId] = 2;
      }
      updateStackViews(2, true);
    });

    // Tombol Advance 2 -> 3
    contentCard.querySelector<HTMLButtonElement>('#btn-materi-advance-2')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.materiMaxUnlockedStackMap[topicId] = 3;
      updateStackViews(3, true);
    });

    // Tombol Lanjut ke Topik Berikutnya di Stack 3
    contentCard.querySelector<HTMLButtonElement>('#btn-stack3-next-topic')?.addEventListener('click', () => {
      if (currentIndex < MATERI_BANK.length - 1) {
        const nextTopic = MATERI_BANK[currentIndex + 1]!;
        if (nextTopic.cycleRequired === 2 && !this.isCycle2Unlocked) {
          soundFx.playLogicFalse();
          this.showRetroToast('Materi berikutnya dikhususkan untuk Siklus 2. Silakan lanjut ke Lab Telusur Kode!', false);
          return;
        }
        if (this.isCycle2Unlocked && nextTopic.id === 'ptk-05' && !this.readMateriIds.includes('ptk-04') && !this.progressionState?.teacherBypassMode) {
          soundFx.playLogicFalse();
          this.showRetroToast('Tuntaskan membaca materi Percabangan Bertingkat (Topik 9) terlebih dahulu sebelum beralih ke Topik 10!', false);
          return;
        }
        soundFx.playButtonBlip();
        this.activeMateriId = nextTopic.id;
        this.render();
        this.scrollToTop();
      }
    });

    // Tombol Lanjut ke Lab Telusur dari Stack 3
    contentCard.querySelector<HTMLButtonElement>('#btn-stack3-to-tracing')?.addEventListener('click', async () => {
      if (!this.readMateriIds.includes(topicId)) {
        this.readMateriIds.push(topicId);
        void StorageService.markMateriAsRead(topicId);
      }
      soundFx.playLogicTrue();
      await StorageService.saveProgressionState({ stepMaterialCompleted: true });
      this.progressionState = await StorageService.getProgressionState();
      this.renderGlobalHeader();
      this.showRetroToast('Pemahaman materi tercatat! Langkah 2: Meja Kerja Lab Telusur Kode telah terbuka.', true);
      this.setScreen('TRACING');
    });

    // Pasang Logika Simulator Interaktif (jika ada pada topik aktif)
    if (currentTopic.simulator) {
      const sim = currentTopic.simulator;
      const simInput = contentCard.querySelector<HTMLInputElement>('#input-sim-val');
      const simBtn = contentCard.querySelector<HTMLButtonElement>('#btn-run-sim');
      const simResultBox = contentCard.querySelector<HTMLElement>('#sim-result-box');

      const runSimulation = () => {
        const val = parseFloat(simInput?.value || '0');
        let isTrue = false;
        switch (sim.operator) {
          case '>=':
            isTrue = val >= sim.threshold;
            break;
          case '>':
            isTrue = val > sim.threshold;
            break;
          case '<=':
            isTrue = val <= sim.threshold;
            break;
          case '<':
            isTrue = val < sim.threshold;
            break;
          case '==':
            isTrue = val === sim.threshold;
            break;
          case '!=':
            isTrue = val !== sim.threshold;
            break;
        }

        if (isTrue) {
          soundFx.playLogicTrue();
        } else {
          soundFx.playLogicFalse();
        }

        if (simResultBox) {
          const bgTheme = isTrue ? 'rgba(15, 118, 110, 0.05)' : 'rgba(220, 38, 38, 0.05)';
          const borderTheme = isTrue ? 'rgba(15, 118, 110, 0.35)' : 'rgba(220, 38, 38, 0.35)';
          const statusColor = isTrue ? 'var(--primary)' : 'var(--danger)';
          const statusText = isTrue ? 'TRUE (BENAR)' : 'FALSE (SALAH)';
          const iconStatus = isTrue
            ? renderPixelIcon('check', 11, 'var(--success)')
            : renderPixelIcon('cross', 11, 'var(--danger)');

          simResultBox.style.background = bgTheme;
          simResultBox.style.border = `1.5px solid ${borderTheme}`;
          simResultBox.style.padding = '14px 16px';
          simResultBox.style.borderRadius = '10px';
          simResultBox.style.boxShadow = '0 1px 3px rgba(28, 25, 23, 0.03)';

          simResultBox.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; border-bottom: 1px dashed ${borderTheme}; padding-bottom: 8px;">
              <div style="font-size: 12.5px; color: var(--text-primary); display: inline-flex; align-items: center; gap: 6px;">
                <strong style="color: var(--text-primary);">Pengujian Ekspresi:</strong>
                <code style="font-family: var(--font-code); font-size: 13px; font-weight: 700; color: ${statusColor}; background: #ffffff; padding: 3px 8px; border-radius: 4px; border: 1px solid ${borderTheme};">
                  ${val} ${sim.operator} ${sim.threshold}
                </code>
              </div>
              <span class="badge-pill" style="font-family: var(--font-code); font-size: 10.5px; font-weight: 700; color: ${statusColor}; border-color: ${borderTheme}; background: #ffffff; display: inline-flex; align-items: center; gap: 5px;">
                ${iconStatus} HASIL EVALUASI: ${statusText}
              </span>
            </div>
            <div style="font-size: 13px; font-weight: 700; color: ${statusColor}; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              ${renderPixelIcon(isTrue ? 'check' : 'cross', 12, statusColor)} Jalur Cabang yang Dijalankan: <span style="color: var(--text-primary); font-weight: 700;">${isTrue ? sim.ifActionText : sim.elseActionText}</span>
            </div>
            <div style="color: var(--text-primary); font-size: 12px; line-height: 1.55; background: #ffffff; padding: 10px 14px; border-radius: 6px; border: 1px solid var(--border-subtle); margin-top: 6px;">
              ${isTrue ? sim.trueExplanation : sim.falseExplanation}
            </div>
          `;
        }
      };

      simBtn?.addEventListener('click', runSimulation);
      simInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runSimulation();
      });
      runSimulation();
    }

    // Pasang Logika Kuis Cek Pemahaman Cepat (jika ada pada topik aktif)
    if (currentTopic.interactiveCheck) {
      const q = currentTopic.interactiveCheck;
      const optButtons = contentCard.querySelectorAll<HTMLButtonElement>('.btn-quiz-opt');
      const feedbackBox = contentCard.querySelector<HTMLElement>('#quiz-feedback-box');

      optButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx') || '0', 10);
          const chosen = q.options[idx];
          if (!chosen) return;

          if (chosen.isCorrect) {
            soundFx.playLogicTrue();
          } else {
            soundFx.playLogicFalse();
          }

          optButtons.forEach((b, bIdx) => {
            b.classList.remove('game-btn-primary', 'game-btn-success', 'game-btn-danger');
            if (bIdx === idx) {
              b.style.borderColor = chosen.isCorrect ? 'var(--success)' : 'var(--danger)';
              b.style.background = chosen.isCorrect ? 'rgba(21, 128, 61, 0.12)' : 'rgba(220, 38, 38, 0.12)';
            }
          });

          if (feedbackBox) {
            feedbackBox.style.display = 'block';
            feedbackBox.style.border = `1.5px solid ${chosen.isCorrect ? 'var(--success)' : 'var(--danger)'}`;
            feedbackBox.style.background = chosen.isCorrect ? 'rgba(21, 128, 61, 0.08)' : 'rgba(220, 38, 38, 0.08)';
            feedbackBox.innerHTML = `
              <div style="font-weight: bold; color: ${chosen.isCorrect ? 'var(--success)' : 'var(--danger)'}; margin-bottom: 3px;">
                ${chosen.isCorrect ? 'Jawaban Kamu Tepat Sekali!' : 'Kurang Tepat, Cermati Lagi:'}
              </div>
              <div style="color: var(--text-primary); font-size: 11.5px;">
                ${chosen.explanation}
              </div>
            `;
          }
        });
      });
    }

    // Event Listener Navigasi Bawah
    contentCard.querySelector('#btn-materi-prev')?.addEventListener('click', () => {
      if (currentIndex > 0) {
        soundFx.playButtonBlip();
        this.activeMateriId = MATERI_BANK[currentIndex - 1]!.id;
        this.render();
        this.scrollToTop();
      }
    });

    contentCard.querySelector('#btn-materi-next')?.addEventListener('click', () => {
      if (currentIndex < MATERI_BANK.length - 1) {
        const nextTopic = MATERI_BANK[currentIndex + 1]!;
        if (nextTopic.cycleRequired === 2 && !this.isCycle2Unlocked) {
          soundFx.playLogicFalse();
          this.showRetroToast('Materi berikutnya dikhususkan untuk Siklus 2. Silakan lanjut ke Lab Telusur Kode!', false);
          return;
        }
        if (this.isCycle2Unlocked && nextTopic.id === 'ptk-05' && !this.readMateriIds.includes('ptk-04') && !this.progressionState?.teacherBypassMode) {
          soundFx.playLogicFalse();
          this.showRetroToast('Tuntaskan membaca materi Percabangan Bertingkat (Topik 9) terlebih dahulu sebelum beralih ke Topik 10!', false);
          return;
        }
        soundFx.playButtonBlip();
        this.activeMateriId = nextTopic.id;
        this.render();
        this.scrollToTop();
      }
    });

    contentCard.querySelector('#btn-to-tracing')?.addEventListener('click', async () => {
      // Pastikan topik aktif saat ini yang sedang berada pada stack 3 otomatis tercatat
      const curMax = this.materiMaxUnlockedStackMap[topicId] || 1;
      const curActive = this.materiActiveStackMap[topicId] || 1;
      if ((curMax >= 3 || curActive === 3) && !isCurrentTopicLocked && !this.readMateriIds.includes(topicId)) {
        this.readMateriIds.push(topicId);
        void StorageService.markMateriAsRead(topicId);
      }

      // Hitung ulang status keterbacaan materi secara realtime saat tombol ditekan
      const { readCount: currentReadCount, totalCount: currentTotalRequired, isAllRead: currentAllRead } = this.getMateriReadProgress();

      if (!currentAllRead) {
        soundFx.playLogicFalse();
        this.showRetroToast(
          `Pelajari seluruh ${currentTotalRequired} materi ${this.isCycle2Unlocked ? 'Siklus 1 & 2' : 'Siklus 1'} terlebih dahulu (${currentReadCount}/${currentTotalRequired} selesai)!`,
          false
        );
        return;
      }
      soundFx.playLogicTrue();
      await StorageService.saveProgressionState({ stepMaterialCompleted: true });
      this.progressionState = await StorageService.getProgressionState();
      this.renderGlobalHeader();
      this.showRetroToast('Pemahaman materi tercatat! Langkah 2: Meja Kerja Lab Telusur Kode telah terbuka.', true);
      this.setScreen('TRACING');
    });

    contentCard.querySelector('#btn-unlock-materi-cycle2')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.showStudentTokenModal();
    });

    contentCard.querySelector('#btn-back-to-cycle1')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.activeMateriId = 'ptk-03';
      this.render();
    });

    // Pasang Handler Tab Versi Ganda Kode (Bahasa C & Pseudokode)
    contentCard.querySelectorAll<HTMLElement>('.code-dual-container').forEach((dualCard) => {
      const tabBtns = dualCard.querySelectorAll<HTMLButtonElement>('.code-dual-tab-btn');
      const paneC = dualCard.querySelector<HTMLElement>('.pane-c');
      const panePseudo = dualCard.querySelector<HTMLElement>('.pane-pseudo');

      tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          soundFx.playButtonBlip();
          const targetLang = btn.getAttribute('data-lang');

          tabBtns.forEach((b) => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
            // Remove checkmark icon from non-active buttons
            const isTarget = b === btn;
            if (isTarget) {
              b.classList.add('active');
              b.setAttribute('aria-selected', 'true');
              b.innerHTML = `${renderPixelIcon('check', 9, 'currentColor')} ${targetLang === 'c' ? 'Bahasa C' : 'Pseudokode'}`;
            } else {
              b.innerHTML = b.getAttribute('data-lang') === 'c' ? 'Bahasa C' : 'Pseudokode';
            }
          });

          if (targetLang === 'c') {
            paneC?.classList.add('active');
            panePseudo?.classList.remove('active');
          } else {
            paneC?.classList.remove('active');
            panePseudo?.classList.add('active');
          }
        });
      });
    });

    container.appendChild(sidebar);
    container.appendChild(contentCard);
    return container;
  }

  /**
   * Menampilkan atau memperbarui panduan misi interaktif kontekstual untuk Lab Telusur (4 Langkah Linier)
   * Mengutamakan pembaharuan banner inline (tanpa menutupi soal). Floating toast hanya dimunculkan jika diminta secara eksplisit.
   */
  public showMissionGuidanceToast(step: TracingWizardStep, showFloatingToast = false): void {
    const guidanceMap: Record<TracingWizardStep, MissionGuidanceMeta & { icon: PixelIconType }> = {
      1: {
        step: 1,
        tag: 'MISI 1: ORIENTASI KASUS',
        title: 'Orientasi Kasus',
        instruction: 'Baca skenario masalah program dan cermati variabel kondisi sebelum melangkah!',
        icon: 'document'
      },
      2: {
        step: 2,
        tag: 'MISI 2: TENTUKAN DUGAAN',
        title: 'Tentukan Dugaan',
        instruction: 'Masukkan angka uji, lalu tentukan dugaanmu: apakah kondisi Benar atau Salah?',
        icon: 'target'
      },
      3: {
        step: 3,
        tag: 'MISI 3: MEJA KERJA TRACING',
        title: 'Meja Kerja Tracing',
        instruction: 'Gunakan navigasi langkah atau jalankan alur program untuk membuktikan alur baris demi baris di Meja Kerja!',
        icon: 'play'
      },
      4: {
        step: 4,
        tag: 'MISI 4: EVALUASI & CATATAN',
        title: 'Evaluasi & Catatan',
        instruction: 'Misi selesai! Bandingkan dugaan murid dengan hasil nyata eksekusi komputer untuk memverifikasi logikamu!',
        icon: 'check'
      }
    };

    const g = guidanceMap[step];
    if (!g) return;

    // 1. Perbarui Banner Panduan Misi Inline jika ada di DOM (Zero Screen Occlusion)
    const inlineBox = document.getElementById('tracing-workflow-mission-box');
    if (inlineBox) {
      inlineBox.innerHTML = `
        <div class="mission-inline-inner">
          <span class="mission-inline-icon-box">
            ${renderPixelIcon(g.icon, 14, 'var(--primary)')}
          </span>
          <div class="mission-inline-content">
            <div class="mission-inline-badge-row">
              <span class="mission-inline-step-badge">LANGKAH ${g.step} DARI 4</span>
              <span class="mission-inline-tag">${escapeHtml(g.tag)}</span>
            </div>
            <span class="mission-inline-text">${escapeHtml(g.instruction)}</span>
          </div>
        </div>
      `;
      inlineBox.classList.remove('mission-box-pulse');
      void inlineBox.offsetWidth; // trigger reflow
      inlineBox.classList.add('mission-box-pulse');
    }

    // Jika tidak diminta menampilkan floating toast (misal transisi wizard biasa), selesai di sini
    if (!showFloatingToast) return;

    // 2. Jika floating toast diminta secara eksplisit:
    const existingToast = document.querySelector<HTMLElement>('.mission-guidance-toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'mission-guidance-toast';
    toast.innerHTML = `
      <div class="mission-toast-inner">
        <span class="mission-toast-icon-box">
          ${renderPixelIcon(g.icon, 14, 'var(--primary)')}
        </span>
        <div class="mission-toast-content">
          <div class="mission-toast-badge-row">
            <span class="mission-toast-step-badge">LANGKAH ${g.step} DARI 4</span>
            <span class="mission-toast-tag">${escapeHtml(g.tag)}</span>
          </div>
          <span class="mission-toast-text">${escapeHtml(g.instruction)}</span>
        </div>
        <button type="button" class="mission-toast-close" aria-label="Tutup panduan">&times;</button>
      </div>
    `;

    toast.querySelector('.mission-toast-close')?.addEventListener('click', () => {
      toast.remove();
    });

    document.body.appendChild(toast);

    window.setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 15px)';
        window.setTimeout(() => toast.remove(), 260);
      }
    }, 2800);
  }

  /**
   * Memperbarui visualisasi langkah linier terpandu di Meja Kerja Tracing (1 s.d. 4)
   */
  public updateTracingStepUI(step: TracingWizardStep, parent?: HTMLElement): void {
    this.goToTracingStep(step, false, parent);
  }

  /**
   * Mengatur navigasi linier 4-Langkah Wizard di Lab Telusur
   */
  public goToTracingStep(step: TracingWizardStep, showToast = true, parent?: HTMLElement): void {
    const isCompletedRun = this.currentStepIndex >= (this.currentTraceResult?.steps.length || 1) - 1 && this.userPrediction !== null;

    if (step === 3 && (!this.isInputApplied || !this.userPrediction)) {
      this.showRetroToast('Selesaikan Langkah 2 terlebih dahulu: tentukan nilai masukan dan pilih dugaan cabang alur!', false);
      return;
    }
    if (step === 4 && (!isCompletedRun || !this.userPrediction)) {
      this.showRetroToast('Jalankan simulasi di Meja Kerja (Langkah 3) hingga baris selesai terlebih dahulu!', false);
      return;
    }

    this.tracingWizardStep = step;

    if (showToast) {
      this.showMissionGuidanceToast(step);
    }

    const root = parent || this.overlayContainer;

    // Sinkronisasi status Pita Alur Belajar
    const wfStep1 = root.querySelector<HTMLElement>('#wf-step-1');
    const wfStep2 = root.querySelector<HTMLElement>('#wf-step-2');
    const wfStep3 = root.querySelector<HTMLElement>('#wf-step-3');
    const wfStep4 = root.querySelector<HTMLElement>('#wf-step-4');

    const isStep1Done = this.isInputApplied || this.userPrediction !== null || step > 1;
    const isStep2Done = this.userPrediction !== null || step > 2;
    const isStep3Done = isCompletedRun || step > 3;

    const setStepBadge = (stepEl: HTMLElement | null, isDone: boolean, isActive: boolean, stepNum: number) => {
      if (!stepEl) return;
      stepEl.classList.toggle('completed', isDone && !isActive);
      stepEl.classList.toggle('active', isActive);
      const badge = stepEl.querySelector<HTMLElement>('.tracing-step-badge');
      if (badge) {
        if (isDone && !isActive) {
          badge.innerHTML = renderPixelIcon('check', 11, '#ffffff');
        } else {
          badge.textContent = String(stepNum);
        }
      }
    };

    setStepBadge(wfStep1, isStep1Done, step === 1, 1);
    setStepBadge(wfStep2, isStep2Done, step === 2, 2);
    setStepBadge(wfStep3, isStep3Done, step === 3, 3);
    setStepBadge(wfStep4, isCompletedRun && (this.progressionState?.stepTracingCompleted || false), step === 4, 4);

    // Navigasi & fokus sesuai langkah aktif
    const heroCard = root.querySelector<HTMLElement>('.tracing-hero-card');
    const collBody = heroCard?.querySelector<HTMLElement>('#hero-collapsible-body');
    const compactSum = heroCard?.querySelector<HTMLElement>('#hero-compact-summary');
    const toggleBtn = heroCard?.querySelector<HTMLButtonElement>('#btn-toggle-hero-card');

    if (step === 1) {
      this.isTracingHeroCollapsed = false;
      if (collBody) collBody.style.display = 'flex';
      if (compactSum) compactSum.style.display = 'none';
      if (toggleBtn) toggleBtn.innerHTML = `${renderPixelIcon('arrow-up', 10, 'currentColor')} Ciutkan Setup`;
      requestAnimationFrame(() => {
        const storyCallout = root.querySelector<HTMLElement>('.tracing-story-callout');
        storyCallout?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else if (step === 2) {
      this.isTracingHeroCollapsed = false;
      if (collBody) collBody.style.display = 'flex';
      if (compactSum) compactSum.style.display = 'none';
      if (toggleBtn) toggleBtn.innerHTML = `${renderPixelIcon('arrow-up', 10, 'currentColor')} Ciutkan Setup`;
      requestAnimationFrame(() => {
        const setupGrid = root.querySelector<HTMLElement>('.tracing-setup-grid');
        setupGrid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const inputEl = root.querySelector<HTMLInputElement>('#input-trace-val');
        if (inputEl && !this.isInputApplied) inputEl.focus();
      });
    } else if (step === 3) {
      // Lepaskan fokus dari tombol aksi di dalam hero card sebelum ciutkan setup
      if (document.activeElement && collBody?.contains(document.activeElement)) {
        (document.activeElement as HTMLElement).blur();
      }
      this.isTracingHeroCollapsed = true;
      if (collBody) collBody.style.display = 'none';
      if (compactSum) compactSum.style.display = 'flex';
      if (toggleBtn) toggleBtn.innerHTML = `${renderPixelIcon('arrow-down', 10, 'currentColor')} Buka Setup`;
      requestAnimationFrame(() => {
        const workbench = root.querySelector<HTMLElement>('#tracing-workbench-anchor');
        if (workbench) {
          workbench.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const btnRunSim = workbench.querySelector<HTMLButtonElement>('#btn-run-sim');
          btnRunSim?.focus({ preventScroll: true });
        }
      });
    } else if (step === 4) {
      requestAnimationFrame(() => {
        const nextStepCard = root.querySelector<HTMLElement>('.tracing-next-step-card');
        if (nextStepCard) {
          nextStepCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          const zoneEval = root.querySelector<HTMLElement>('.tracing-zone-evaluation');
          zoneEval?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  // =================================================================
  // Layar 05: Penelusur Kode Langkah-demi-Langkah (Code Tracing Arena)
  // =================================================================
  private renderScreenTracing(): HTMLElement {
    // Pastikan kasus aktif sesuai siklus saat halaman dibuka
    if (this.isCycle2Unlocked && this.activeModule.cycleRequired === 1) {
      const firstC2 = CASE_MODULES.find((m) => m.cycleRequired === 2);
      if (firstC2) {
        this.activeModule = firstC2;
        this.resetTracingToInitialState();
      }
    } else if (!this.isCycle2Unlocked && this.activeModule.cycleRequired === 2) {
      this.activeModule = CASE_MODULES[0]!;
      this.resetTracingToInitialState();
    }

    const container = document.createElement('div');
    container.className = 'tracing-screen-layout';

    // =========================================================================
    // 0.A. Papan Misi Kasus Wajib Lab Telusur (5 Kasus Dinamis Antar-Siklus)
    // =========================================================================
    const activeCycleModules = this.isCycle2Unlocked
      ? CASE_MODULES.filter((m) => m.cycleRequired === 2)
      : CASE_MODULES.filter((m) => m.cycleRequired === 1);
    const activeModuleCount = activeCycleModules.length;
    let completedModuleCount = 0;
    activeCycleModules.forEach((mod) => {
      const prog = this.allModuleProgress[mod.id];
      const branchDefs = MODULE_BRANCHES[mod.id] || [];
      const testedCount = prog?.testedBranches?.length || 0;
      if (testedCount >= branchDefs.length || !!prog?.isCompleted) {
        completedModuleCount++;
      }
    });

    const caseStepperContainer = document.createElement('section');
    caseStepperContainer.className = 'tracing-case-stepper';
    caseStepperContainer.id = 'tracing-case-stepper';
    caseStepperContainer.setAttribute('aria-label', 'Papan Misi Kasus Wajib Lab Telusur');

    const cycleTitle = this.isCycle2Unlocked ? 'Siklus 2' : 'Siklus 1';
    const totalPointsTarget = 100;
    const currentTracingScore = this.formativeScores?.tracingScore || 0;

    caseStepperContainer.innerHTML = `
      <div class="tracing-case-stepper-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 7px; background: rgba(15, 118, 110, 0.12); color: var(--primary);">
            ${renderPixelIcon('flask', 15, 'var(--primary)')}
          </span>
          <div>
            <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span>Target Misi Lab: ${activeModuleCount} Kasus Wajib (${cycleTitle})</span>
              <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(15, 118, 110, 0.1); border-color: rgba(15, 118, 110, 0.25);">
                Total 100 Poin
              </span>
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
              ${this.isCycle2Unlocked
                ? 'Kasus 1 s.d. 3 merupakan prasyarat tuntas. Selesaikan Kasus 4 dan Kasus 5 (masing-masing 50 Poin) untuk mengumpulkan total 100 Poin dan meraih 2 Bintang formatif.'
                : 'Selesaikan seluruh 3 kasus dasar di bawah ini untuk mengumpulkan total 100 Poin dan meraih 2 Bintang formatif.'
              }
            </div>
          </div>
        </div>
        <div class="tracing-case-stepper-summary">
          <div style="font-size: 11.5px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span>Tuntas: <strong style="color: ${completedModuleCount === activeModuleCount ? 'var(--success)' : 'var(--primary)'};">${completedModuleCount}/${activeModuleCount} Kasus</strong></span>
            <span style="color: var(--border-retro);">|</span>
            <span>Skor Telusur: <strong style="color: var(--primary);">${currentTracingScore}/${totalPointsTarget}</strong></span>
          </div>
        </div>
      </div>
      <div class="tracing-case-cards-grid">
        ${CASE_MODULES.map((mod, idx) => {
          const isCaseSiklus2 = mod.cycleRequired === 2;
          const isActive = mod.id === this.activeModule.id;
          const branchDefs = MODULE_BRANCHES[mod.id] || [];
          const prog = this.allModuleProgress[mod.id];
          const testedBranches = prog?.testedBranches || [];
          const testedCount = testedBranches.length;
          const totalBranches = branchDefs.length;
          const isDone = testedCount >= totalBranches || !!prog?.isCompleted;
          const isPartial = testedCount > 0 && !isDone;

          if (this.isCycle2Unlocked) {
            // KONDISI B: SIKLUS 2 AKTIF
            if (!isCaseSiklus2) {
              // Kasus 1, 2, 3: DISABLED / NON-AKTIF (Prasyarat Tuntas)
              return `
                <div class="tracing-case-card is-disabled" data-case-id="${mod.id}" data-cycle-req="1" style="opacity: 0.6; cursor: not-allowed; background: var(--surface-panel-alt); border: 1px dashed var(--border-subtle);" title="Materi Prasyarat Siklus 1 (Tuntas)">
                  <div class="case-card-header">
                    <span class="case-card-num" style="color: var(--text-muted);">KASUS ${idx + 1}</span>
                    <span class="case-card-weight" style="color: var(--text-muted); background: rgba(0,0,0,0.05);">PRASYARAT</span>
                  </div>
                  <div class="case-card-title" style="color: var(--text-secondary);">${escapeHtml(mod.title)}</div>
                  <div class="case-card-concept" style="color: var(--text-muted);">${escapeHtml(mod.concept)}</div>
                  <div class="case-card-status" style="color: var(--text-secondary); background: rgba(28, 25, 23, 0.06);">
                    ${renderPixelIcon('check', 11, 'var(--success)')}
                    <span>[ Prasyarat Tuntas ]</span>
                  </div>
                </div>
              `;
            } else {
              // Kasus 4, 5: AKTIF WAJIB SIKLUS 2 (50 Poin)
              const weight = 50;
              let statusClass = 'status-pending';
              let statusBadgeText = `0/${totalBranches} Cabang (${weight} Poin)`;
              let statusColor = '#57534E';
              let statusBg = '#E7E5DF';
              let statusIcon: PixelIconType = 'refresh';

              if (isDone) {
                statusClass = 'status-completed';
                statusBadgeText = `${testedCount}/${totalBranches} Cabang Selesai (${weight} Poin • 2 Bintang)`;
                statusColor = '#166534';
                statusBg = 'rgba(21, 128, 61, 0.10)';
                statusIcon = 'check';
              } else if (isPartial) {
                statusClass = 'status-partial';
                statusBadgeText = `${testedCount}/${totalBranches} Cabang (${weight} Poin • Uji Cabang Lain)`;
                statusColor = '#92400E';
                statusBg = 'rgba(217, 119, 6, 0.10)';
                statusIcon = 'target';
              }

              return `
                <div class="tracing-case-card ${isActive ? 'is-active' : ''} ${statusClass}" data-case-id="${mod.id}" data-cycle-req="2" title="Pilih Kasus ${idx + 1}: ${escapeHtml(mod.title)}">
                  <div class="case-card-header">
                    <span class="case-card-num">KASUS ${idx + 1}</span>
                    <span class="case-card-weight">+${weight} POIN</span>
                  </div>
                  <div class="case-card-title">${escapeHtml(mod.title)}</div>
                  <div class="case-card-concept">${escapeHtml(mod.concept)}</div>
                  <div class="case-card-status" style="color: ${statusColor}; background: ${statusBg};">
                    ${renderPixelIcon(statusIcon, 11, statusColor)}
                    <span>${statusBadgeText}</span>
                  </div>
                  ${isActive ? `
                    <div class="case-card-active-indicator">
                      <span class="pulse-dot"></span> Sedang Ditelusuri
                    </div>
                  ` : ''}
                </div>
              `;
            }
          } else {
            // KONDISI A: SIKLUS 1 AKTIF
            if (isCaseSiklus2) {
              // Kasus 4, 5: TERKUNCI (locked)
              return `
                <div class="tracing-case-card is-locked" data-case-id="${mod.id}" data-cycle-req="2" style="cursor: pointer;" title="Terkunci: Siklus 2">
                  <div class="case-card-header">
                    <span class="case-card-num" style="color: var(--text-muted);">KASUS ${idx + 1}</span>
                    <span class="case-card-weight" style="color: var(--warning-dark); background: rgba(217, 119, 6, 0.1);">KUNCI</span>
                  </div>
                  <div class="case-card-title" style="color: var(--text-secondary);">${escapeHtml(mod.title)}</div>
                  <div class="case-card-concept" style="color: var(--text-muted);">${escapeHtml(mod.concept)}</div>
                  <div class="case-card-status" style="color: var(--warning-dark); background: rgba(217, 119, 6, 0.1);">
                    ${renderPixelIcon('lock', 11, 'var(--warning-dark)')}
                    <span>[ Kunci: Siklus 2 ]</span>
                  </div>
                </div>
              `;
            } else {
              // Kasus 1, 2, 3: AKTIF INTERAKTIF SIKLUS 1
              const weight = idx < 2 ? 30 : 40;
              let statusClass = 'status-pending';
              let statusBadgeText = `0/${totalBranches} Cabang (${weight} Poin)`;
              let statusColor = '#57534E';
              let statusBg = '#E7E5DF';
              let statusIcon: PixelIconType = 'refresh';

              if (isDone) {
                statusClass = 'status-completed';
                statusBadgeText = `${testedCount}/${totalBranches} Cabang Selesai (${weight} Poin • 2 Bintang)`;
                statusColor = '#166534';
                statusBg = 'rgba(21, 128, 61, 0.10)';
                statusIcon = 'check';
              } else if (isPartial) {
                statusClass = 'status-partial';
                statusBadgeText = `${testedCount}/${totalBranches} Cabang (${weight} Poin • Uji Cabang Lain)`;
                statusColor = '#92400E';
                statusBg = 'rgba(217, 119, 6, 0.10)';
                statusIcon = 'target';
              }

              return `
                <div class="tracing-case-card ${isActive ? 'is-active' : ''} ${statusClass}" data-case-id="${mod.id}" data-cycle-req="1" title="Pilih Kasus ${idx + 1}: ${escapeHtml(mod.title)}">
                  <div class="case-card-header">
                    <span class="case-card-num">KASUS ${idx + 1}</span>
                    <span class="case-card-weight">+${weight} POIN</span>
                  </div>
                  <div class="case-card-title">${escapeHtml(mod.title)}</div>
                  <div class="case-card-concept">${escapeHtml(mod.concept)}</div>
                  <div class="case-card-status" style="color: ${statusColor}; background: ${statusBg};">
                    ${renderPixelIcon(statusIcon, 11, statusColor)}
                    <span>${statusBadgeText}</span>
                  </div>
                  ${isActive ? `
                    <div class="case-card-active-indicator">
                      <span class="pulse-dot"></span> Sedang Ditelusuri
                    </div>
                  ` : ''}
                </div>
              `;
            }
          }
        }).join('')}
      </div>
    `;

    caseStepperContainer.querySelectorAll<HTMLElement>('.tracing-case-card').forEach((card) => {
      card.addEventListener('click', async () => {
        const caseId = card.getAttribute('data-case-id');
        if (!caseId) return;
        const found = CASE_MODULES.find((m) => m.id === caseId);
        if (!found) return;

        // KONDISI B: Kasus 1-3 saat Siklus 2 Aktif
        if (this.isCycle2Unlocked && found.cycleRequired === 1) {
          soundFx.playLogicFalse();
          this.showRetroToast(
            'Kasus ini merupakan materi prasyarat Siklus 1. Fokuskan penyelidikanmu pada Kasus 4 dan Kasus 5!',
            false
          );
          return;
        }

        // KONDISI A: Kasus 4-5 saat Siklus 1 Aktif
        if (found.cycleRequired === 2 && !this.isCycle2Unlocked) {
          soundFx.playLogicFalse();
          this.showStudentTokenModal(found.id);
          return;
        }

        if (found.id === this.activeModule.id) {
          return;
        }

        const currentBranchDefs = MODULE_BRANCHES[this.activeModule.id] || [];
        const currentProg = this.allModuleProgress[this.activeModule.id];
        const currentTestedCount = (currentProg?.testedBranches || []).length;
        if (currentTestedCount < currentBranchDefs.length) {
          soundFx.playLogicFalse();
          this.showRetroToast(
            `Tuntaskan seluruh ${currentBranchDefs.length} cabang pada ${this.activeModule.title} (${currentTestedCount}/${currentBranchDefs.length} selesai) terlebih dahulu sebelum beralih ke kasus lain!`,
            false
          );
          return;
        }

        soundFx.playButtonBlip();
        this.activeModule = found;
        this.resetTracingToInitialState();
        const rawProg = await StorageService.getModuleProgress(found.id);
        const prog: ModuleProgress = rawProg || {
          testedBranches: [],
          stars: 0,
          isCompleted: false,
          xpEarned: 0,
          updatedAt: Date.now()
        };
        this.coverageView.update(prog, found.id, this.formativeScores?.tracingScore || 0, this.isCycle2Unlocked);
        this.render();
        this.scrollToTop();
        window.setTimeout(() => {
          this.showMissionGuidanceToast(1);
        }, 120);
      });
    });

    container.appendChild(caseStepperContainer);

    // =========================================================================
    // 0.B. Pita Panduan Alur Belajar Terstruktur (Pedagogical Stepper Ribbon)
    // =========================================================================
    const workflowRibbon = document.createElement('nav');
    workflowRibbon.className = 'tracing-workflow-ribbon';
    workflowRibbon.id = 'tracing-workflow-ribbon';
    workflowRibbon.setAttribute('aria-label', 'Pita Alur Penelusuran Logika');

    const isCompletedRun = this.currentStepIndex >= (this.currentTraceResult?.steps.length || 1) - 1 && this.userPrediction !== null;
    const step1Status = this.tracingWizardStep === 1 ? 'active' : (this.isInputApplied || this.userPrediction !== null ? 'completed' : '');
    const step2Status = this.tracingWizardStep === 2 ? 'active' : (this.userPrediction !== null ? 'completed' : '');
    const step3Status = this.tracingWizardStep === 3 ? 'active' : (isCompletedRun ? 'completed' : '');
    const step4Status = this.tracingWizardStep === 4 ? 'active' : (isCompletedRun && (this.progressionState?.stepTracingCompleted || false) ? 'completed' : '');

    const currentMissionStep = this.tracingWizardStep || 1;
    const missionMetaMap: Record<TracingWizardStep, MissionGuidanceMeta & { icon: PixelIconType }> = {
      1: {
        step: 1,
        tag: 'MISI 1: ORIENTASI KASUS',
        title: 'Orientasi Kasus',
        instruction: 'Baca skenario masalah program dan cermati variabel kondisi sebelum melangkah!',
        icon: 'document'
      },
      2: {
        step: 2,
        tag: 'MISI 2: TENTUKAN DUGAAN',
        title: 'Tentukan Dugaan',
        instruction: 'Masukkan angka uji, lalu tentukan dugaanmu: apakah kondisi Benar atau Salah?',
        icon: 'target'
      },
      3: {
        step: 3,
        tag: 'MISI 3: MEJA KERJA TRACING',
        title: 'Meja Kerja Tracing',
        instruction: 'Gunakan navigasi langkah atau jalankan alur program untuk membuktikan alur baris demi baris di Meja Kerja!',
        icon: 'play'
      },
      4: {
        step: 4,
        tag: 'MISI 4: EVALUASI & CATATAN',
        title: 'Evaluasi & Catatan',
        instruction: 'Misi selesai! Bandingkan dugaan murid dengan hasil nyata eksekusi komputer untuk memverifikasi logikamu!',
        icon: 'check'
      }
    };
    const currentGuidance = missionMetaMap[currentMissionStep];

    workflowRibbon.innerHTML = `
      <div class="tracing-workflow-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; background: rgba(15, 118, 110, 0.1);">
            ${renderPixelIcon('map', 13, 'var(--primary)')}
          </span>
          <span style="font-family: var(--font-ui); font-size: 13px; font-weight: 700; color: var(--text-primary);">
            Panduan Alur Belajar Penelusuran Logika
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-ui);">
            4 Langkah Berurutan Terpandu
          </span>
          <button id="btn-help-mission" type="button" class="game-btn game-btn-secondary" style="font-size: 11px; padding: 8px 12px; min-height: 44px; display: inline-flex; align-items: center; gap: 5px;" title="Tampilkan Panduan Misi Langkah Aktif">
            ${renderPixelIcon('bulb', 11, 'currentColor')} Panduan Misi
          </button>
        </div>
      </div>
      <div class="tracing-workflow-steps">
        <div class="tracing-step-item ${step1Status}" id="wf-step-1" title="Langkah 1: Orientasi Kasus">
          <div class="tracing-step-badge">${step1Status === 'completed' ? renderPixelIcon('check', 11, '#ffffff') : '1'}</div>
          <div class="tracing-step-info">
            <span class="tracing-step-title">1. Orientasi Kasus</span>
            <span class="tracing-step-desc">Pelajari skenario masalah program</span>
          </div>
        </div>
        <div class="tracing-step-item ${step2Status}" id="wf-step-2" title="Langkah 2: Tentukan Dugaan">
          <div class="tracing-step-badge">${step2Status === 'completed' ? renderPixelIcon('check', 11, '#ffffff') : '2'}</div>
          <div class="tracing-step-info">
            <span class="tracing-step-title">2. Tentukan Dugaan</span>
            <span class="tracing-step-desc">Tentukan masukan &amp; dugaan alur</span>
          </div>
        </div>
        <div class="tracing-step-item ${step3Status}" id="wf-step-3" title="Langkah 3: Meja Kerja Tracing">
          <div class="tracing-step-badge">${step3Status === 'completed' ? renderPixelIcon('check', 11, '#ffffff') : '3'}</div>
          <div class="tracing-step-info">
            <span class="tracing-step-title">3. Meja Kerja Tracing</span>
            <span class="tracing-step-desc">Buktikan baris demi baris di Meja Kerja</span>
          </div>
        </div>
        <div class="tracing-step-item ${step4Status}" id="wf-step-4" title="Langkah 4: Evaluasi &amp; Catatan">
          <div class="tracing-step-badge">${step4Status === 'completed' ? renderPixelIcon('check', 11, '#ffffff') : '4'}</div>
          <div class="tracing-step-info">
            <span class="tracing-step-title">4. Evaluasi &amp; Catatan</span>
            <span class="tracing-step-desc">Refleksi hasil &amp; pembuktian</span>
          </div>
        </div>
      </div>

      <!-- Banner Panduan Misi Terpadu (Inline Mission Guidance - Zero Content Occlusion) -->
      <div class="tracing-workflow-mission-box" id="tracing-workflow-mission-box">
        <div class="mission-inline-inner">
          <span class="mission-inline-icon-box">
            ${renderPixelIcon(currentGuidance.icon, 14, 'var(--primary)')}
          </span>
          <div class="mission-inline-content">
            <div class="mission-inline-badge-row">
              <span class="mission-inline-step-badge">LANGKAH ${currentGuidance.step} DARI 4</span>
              <span class="mission-inline-tag">${escapeHtml(currentGuidance.tag)}</span>
            </div>
            <span class="mission-inline-text">${escapeHtml(currentGuidance.instruction)}</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(workflowRibbon);

    // =========================================================================
    // ZONA 1: Orientasi & Dugaan Awal (Langkah 1 dan 2)
    // =========================================================================
    const zoneOrientation = document.createElement('section');
    zoneOrientation.className = 'tracing-zone-orientation';
    zoneOrientation.setAttribute('aria-label', 'Zona Orientasi & Prediksi Percabangan');

    // Kartu Hero Terpadu: Pemilih Kasus, Skenario Kontekstual, & Form Dugaan
    const heroCard = document.createElement('div');
    heroCard.className = 'tracing-hero-card';

    // 1.A. Bar Header: Langkah 1 - Kasus Aktif & Kontrol Setup
    const heroTop = document.createElement('div');
    heroTop.className = 'tracing-hero-top';

    const activeCaseIndex = CASE_MODULES.findIndex((m) => m.id === this.activeModule.id);
    const activeWeight = this.isCycle2Unlocked ? 50 : (this.activeModule.weightPoints || (activeCaseIndex < 2 ? 30 : 40));

    const selectEl = document.createElement('select');
    selectEl.id = 'select-module-trace';
    selectEl.className = 'tracing-select-input';

    CASE_MODULES.forEach((mod, idx) => {
      const isLocked = mod.cycleRequired === 2 && !this.isCycle2Unlocked;
      const isDisabledPrereq = mod.cycleRequired === 1 && this.isCycle2Unlocked;
      const opt = document.createElement('option');
      opt.value = mod.id;
      if (isDisabledPrereq) {
        opt.textContent = `[Prasyarat Tuntas] KASUS ${idx + 1}: ${mod.title}`;
      } else if (isLocked) {
        opt.textContent = `[KUNCI SIKLUS 2] KASUS ${idx + 1}: ${mod.title}`;
      } else {
        opt.textContent = `KASUS ${idx + 1}: ${mod.title}`;
      }
      if (mod.id === this.activeModule.id) {
        opt.selected = true;
      }
      selectEl.appendChild(opt);
    });

    selectEl.addEventListener('change', async () => {
      const targetId = selectEl.value;
      const found = CASE_MODULES.find((m) => m.id === targetId);
      if (found) {
        if (this.isCycle2Unlocked && found.cycleRequired === 1) {
          selectEl.value = this.activeModule.id;
          soundFx.playLogicFalse();
          this.showRetroToast(
            'Kasus ini merupakan materi prasyarat Siklus 1. Fokuskan penyelidikanmu pada Kasus 4 dan Kasus 5!',
            false
          );
          return;
        }
        if (found.cycleRequired === 2 && !this.isCycle2Unlocked) {
          selectEl.value = this.activeModule.id;
          soundFx.playLogicFalse();
          this.showStudentTokenModal(found.id);
          return;
        }

        if (found.id === this.activeModule.id) {
          return;
        }

        const currentBranchDefs = MODULE_BRANCHES[this.activeModule.id] || [];
        const currentProg = this.allModuleProgress[this.activeModule.id];
        const currentTestedCount = (currentProg?.testedBranches || []).length;
        if (currentTestedCount < currentBranchDefs.length) {
          selectEl.value = this.activeModule.id;
          soundFx.playLogicFalse();
          this.showRetroToast(
            `Tuntaskan seluruh ${currentBranchDefs.length} cabang pada ${this.activeModule.title} (${currentTestedCount}/${currentBranchDefs.length} selesai) terlebih dahulu sebelum beralih ke kasus lain!`,
            false
          );
          return;
        }

        this.activeModule = found;
        this.resetTracingToInitialState();
        const rawProg = await StorageService.getModuleProgress(found.id);
        const prog: ModuleProgress = rawProg || {
          testedBranches: [],
          stars: 0,
          isCompleted: false,
          xpEarned: 0,
          updatedAt: Date.now()
        };
        this.coverageView.update(prog, found.id, this.formativeScores?.tracingScore || 0, this.isCycle2Unlocked);
        this.render();
        this.scrollToTop();
        window.setTimeout(() => {
          this.showMissionGuidanceToast(1);
        }, 120);
      }
    });

    heroTop.innerHTML = `
      <div class="tracing-module-picker">
        <span class="eyebrow-label" style="color: var(--primary); flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('flask', 13, 'var(--primary)')} Langkah 1: Kasus ${activeCaseIndex + 1} (${this.activeModule.id.toUpperCase()})
        </span>
        <span class="badge-pill" style="color: ${this.isTracingPracticeMode ? 'var(--text-muted)' : 'var(--success)'}; font-weight: bold; font-size: 11px; border-color: ${this.isTracingPracticeMode ? 'var(--border-subtle)' : 'rgba(21, 128, 61, 0.4)'}; background: ${this.isTracingPracticeMode ? 'var(--surface-panel-alt)' : 'rgba(21, 128, 61, 0.1)'};">
          ${this.isTracingPracticeMode ? 'Mode Latihan' : 'Lab Formatif'}
        </span>
      </div>
      <button id="btn-toggle-hero-card" type="button" class="game-btn game-btn-secondary" style="font-size: 11px; padding: 6px 12px; min-height: 44px; display: inline-flex; align-items: center; gap: 6px;" title="${this.isTracingHeroCollapsed ? 'Buka detail setup studi kasus' : 'Ciutkan kartu setup untuk fokus ke Meja Kerja'}">
        ${this.isTracingHeroCollapsed ? renderPixelIcon('arrow-down', 10, 'currentColor') + ' Buka Setup' : renderPixelIcon('arrow-up', 10, 'currentColor') + ' Ciutkan Setup'}
      </button>
    `;

    heroCard.appendChild(heroTop);

    // 1.B. Strip Ringkas Hero Card (tampil saat kartu diciutkan agar murid tetap tahu konteks kasus aktif)
    const heroCompactSummary = document.createElement('div');
    heroCompactSummary.id = 'hero-compact-summary';
    heroCompactSummary.className = 'tracing-hero-compact-bar';
    heroCompactSummary.style.display = this.isTracingHeroCollapsed ? 'flex' : 'none';
    heroCompactSummary.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px;">
        <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(15, 118, 110, 0.1);">
          KASUS ${activeCaseIndex + 1} (${this.activeModule.id.toUpperCase()})
        </span>
        <span style="font-weight: 600; color: var(--text-primary);">
          ${this.activeModule.title}
        </span>
        <span style="color: var(--text-muted);">|</span>
        <span style="font-size: 11.5px; color: var(--text-secondary);">
          Masukan: <strong id="compact-summary-input" style="color: var(--text-primary);">${this.isInputApplied ? this.currentInputValue : '(belum diset)'}</strong>
        </span>
        <span style="color: var(--text-muted);">|</span>
        <span style="font-size: 11.5px; color: var(--text-secondary);">
          Dugaan: <strong id="compact-summary-pred" style="color: var(--warning-dark);">${this.userPrediction || '(belum memilih)'}</strong>
        </span>
      </div>
      <button id="btn-reopen-hero-card" type="button" class="game-btn game-btn-secondary" style="font-size: 11px; padding: 6px 12px; min-height: 44px; display: inline-flex; align-items: center; gap: 6px;">
        ${renderPixelIcon('arrow-down', 10, 'currentColor')} Buka Setup Kasus
      </button>
    `;
    heroCard.appendChild(heroCompactSummary);

    // Kontainer Isi yang Dapat Diciutkan / Diperluas
    const heroCollapsibleBody = document.createElement('div');
    heroCollapsibleBody.id = 'hero-collapsible-body';
    heroCollapsibleBody.style.display = this.isTracingHeroCollapsed ? 'none' : 'flex';
    heroCollapsibleBody.style.flexDirection = 'column';
    heroCollapsibleBody.style.gap = '14px';

    // 1.C. Skenario Kontekstual Masalah (Langkah 1) dengan Ilustrasi Pixel Art & Tabel Ambang Batas
    const storyCallout = document.createElement('div');
    storyCallout.className = 'tracing-story-callout wizard-step-panel';

    const paragraphs = this.activeModule.storyPrompt.split('\n\n');
    const narrativeParagraphs = paragraphs.filter((p) => !p.trim().startsWith('Tugas Penyelidikanmu'));
    const taskParagraph = paragraphs.find((p) => p.trim().startsWith('Tugas Penyelidikanmu'));

    const narrativeHtml = narrativeParagraphs.length > 0 ? `
      <div class="tracing-story-narrative-card tactile-card">
        ${narrativeParagraphs.map((p, idx) => `
          <p class="tracing-narrative-p"${idx === narrativeParagraphs.length - 1 ? ' style="margin-bottom: 0;"' : ''}>
            ${escapeHtml(p).replace(/\n/g, '<br/>')}
          </p>
        `).join('')}
      </div>
    ` : '';

    const taskHtml = taskParagraph ? `
      <div class="tracing-story-investigation-box">
        <div style="font-weight: 700; color: #b45309; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('target', 12, '#b45309')}
          <span>Tugas Penyelidikan Murid:</span>
        </div>
        <div style="color: var(--text-primary); font-size: 12.5px; line-height: 1.6; text-wrap: pretty;">
          ${escapeHtml(taskParagraph.replace(/^Tugas Penyelidikanmu:?\s*/i, '')).replace(/\n/g, '<br/>')}
        </div>
      </div>
    ` : '';

    // Tabel Ambang Batas Nilai (Boundary Table)
    let boundaryTableHtml = '';
    if (this.activeModule.testPresets && this.activeModule.testPresets.length > 0) {
      boundaryTableHtml = `
        <div style="margin-top: 12px; padding: 12px 14px; background: rgba(15, 118, 110, 0.04); border: 1px solid rgba(15, 118, 110, 0.2); border-radius: 8px;">
          <div style="font-size: 11.5px; font-weight: 700; color: var(--primary); margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              ${renderPixelIcon('document', 12, 'var(--primary)')} Tabel Ambang Batas Nilai (Boundary Table):
            </span>
            <span class="badge-pill" style="font-size: 9.5px; padding: 1px 6px; background: #ffffff; color: var(--primary); border: 1px solid rgba(15, 118, 110, 0.25);">
              Variabel: ${escapeHtml(this.activeModule.inputVariable)}
            </span>
          </div>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; text-align: left;">
              <thead>
                <tr style="background: rgba(15, 118, 110, 0.08); border-bottom: 1px solid var(--border-retro);">
                  <th style="padding: 6px 10px; font-weight: 700; color: var(--text-primary);">Nilai Uji</th>
                  <th style="padding: 6px 10px; font-weight: 700; color: var(--text-primary);">Kategori Uji</th>
                  <th style="padding: 6px 10px; font-weight: 700; color: var(--primary);">Cabang Target</th>
                  <th style="padding: 6px 10px; font-weight: 700; color: var(--text-secondary);">Ekspektasi Output</th>
                </tr>
              </thead>
              <tbody>
                ${this.activeModule.testPresets.map(preset => `
                  <tr style="border-bottom: 1px solid rgba(28, 25, 23, 0.06);">
                    <td style="padding: 6px 10px; font-weight: 700; font-family: var(--font-code); color: var(--primary);">${preset.value}</td>
                    <td style="padding: 6px 10px;">${escapeHtml(preset.badge)}</td>
                    <td style="padding: 6px 10px; font-weight: 700; font-family: var(--font-code);">${escapeHtml(preset.targetBranch)}</td>
                    <td style="padding: 6px 10px; color: var(--text-secondary);">${escapeHtml(preset.explanation)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    storyCallout.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
        <div class="tracing-story-header">
          ${renderPixelIcon('document', 12, '#b45309')} Skenario Masalah: Kasus ${activeCaseIndex + 1} - ${escapeHtml(this.activeModule.title)}
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: #b45309; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3);">
            Bobot: ${activeWeight} Poin
          </span>
          <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(15, 118, 110, 0.1);">
            Langkah 1: Orientasi Masalah
          </span>
        </div>
      </div>
      <div class="tracing-story-body">
        <div class="tracing-story-illustration-frame">
          ${renderCaseIllustrationPixelArt(this.activeModule.id, 160, 120)}
          <div class="tracing-story-illustration-caption">
            <span>SIMULASI ${this.activeModule.id.toUpperCase()}</span>
          </div>
        </div>
        <div class="tracing-story-content">
          <div class="tracing-story-text">
            ${narrativeHtml}
            ${taskHtml}
            ${boundaryTableHtml}
          </div>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; margin-top: 12px; border-top: 1px dashed rgba(245, 158, 11, 0.25); padding-top: 10px;">
        <button id="btn-step1-to-step2" type="button" class="game-btn game-btn-primary" style="font-size: 12px; min-height: 48px; padding: 0 16px; display: inline-flex; align-items: center; gap: 8px;" title="Lanjut ke langkah pengisian nilai masukan dan dugaan alur">
          <span>Lanjut: Prediksi Percabangan (Langkah 2)</span>
          ${renderPixelIcon('arrow-right', 12, '#ffffff')}
        </button>
      </div>
    `;
    heroCollapsibleBody.appendChild(storyCallout);

    // 1.D. Form Setup Masukan & Gerbang Dugaan Pause & Predict (Langkah 2)
    const branchDefs = MODULE_BRANCHES[this.activeModule.id] || MODULE_BRANCHES['m01']!;
    const setupGrid = document.createElement('div');
    setupGrid.className = 'tracing-setup-grid wizard-step-panel';
    setupGrid.innerHTML = `
      <!-- Langkah 2A: Input Nilai Uji & Preset Rekomendasi Cabang -->
      <div>
        <div class="eyebrow-label" style="color: var(--primary); margin-bottom: 6px; display: inline-flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('document', 12, 'var(--primary)')} Langkah 2A: Tentukan Nilai Masukan
        </div>
        <label style="display: block; font-size: 11.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
          ${this.activeModule.inputLabel}:
        </label>
        <div style="display: flex; gap: 10px;">
          <input id="input-trace-val" type="text" class="pixel-input" value="${this.isInputApplied ? this.currentInputValue : ''}" style="flex: 1; min-height: 44px;" placeholder="(Masukan nilai uji)" />
          <button id="btn-apply-input" type="button" class="game-btn ${this.isInputApplied ? 'game-btn-secondary' : 'game-btn-primary'}" style="min-height: 44px; padding: 0 16px; font-size: 12px;">
            Set Uji
          </button>
        </div>
        <div style="display: flex; align-items: center; justify-content: flex-end; margin-top: 6px; flex-wrap: wrap; gap: 6px;">
          <span id="input-applied-badge" style="font-size: 11px; font-weight: 600; color: var(--success); ${this.isInputApplied ? 'display: inline-flex; align-items: center; gap: 4px;' : 'display: none;'}">
            ${renderPixelIcon('check', 11, 'var(--success)')} Masukan siap diuji (${this.currentInputValue})
          </span>
        </div>
        <div id="input-error-msg" style="font-size: 11px; color: var(--danger); margin-top: 6px; display: none;"></div>

        ${(this.activeModule.testPresets && this.activeModule.testPresets.length > 0) ? `
          <div class="tracing-test-presets-box" style="margin-top: 10px;">
            <div style="font-size: 11px; font-weight: 700; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
              <span style="display: inline-flex; align-items: center; gap: 5px;">
                ${renderPixelIcon('target', 11, 'var(--primary)')} Rekomendasi Uji Cabang (1-Klik):
              </span>
              <span style="font-size: 10px; color: var(--text-muted); font-weight: normal;">Ketuk untuk isi</span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${this.activeModule.testPresets.map(preset => `
                <button type="button" class="game-btn game-btn-secondary btn-test-preset-chip" data-preset-val="${preset.value}" data-target-branch="${preset.targetBranch}" style="font-size: 11px; padding: 8px 12px; min-height: 44px; display: inline-flex; align-items: center; gap: 6px;" title="${escapeHtml(preset.explanation)}">
                  <span class="badge-pill" style="font-size: 9.5px; padding: 1px 5px; background: rgba(15, 118, 110, 0.15); color: var(--primary); font-weight: 700;">${escapeHtml(preset.badge)}</span>
                  <span>${escapeHtml(preset.label)}</span>
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Langkah 2B: Perkirakan Jalur Logika (Dugaan Awal Murid) -->
      <div>
        <div class="eyebrow-label" style="color: var(--primary); margin-bottom: 6px; display: inline-flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('target', 12, 'var(--primary)')} Langkah 2B: Perkirakan Cabang Logika (Dugaan Murid)
        </div>
        <p style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 10px; line-height: 1.5;">
          Sebelum menelusuri baris kode di Meja Kerja, tebak cabang logika mana yang akan ditembus oleh nilai masukan:
        </p>
        <div class="tracing-predict-group">
          ${branchDefs.map((b) => {
            const isSelected = this.userPrediction === b.id;
            const isBranchIf = b.id === 'IF';
            const isBranchElse = b.id === 'ELSE' || b.id === 'NORMAL';
            const badgeText = isBranchIf ? 'BENAR (IF)' : (isBranchElse ? 'SALAH (ELSE)' : b.id.replace('_', ' ').slice(0, 4).toUpperCase());
            const isDisabled = !this.isInputApplied;
            return `
              <button type="button" class="tracing-predict-chip btn-predict-branch ${isSelected ? 'selected' : ''}" data-branch-id="${b.id}" ${isDisabled ? 'disabled style="opacity: 0.55; cursor: not-allowed;"' : ''}>
                <span class="chip-key">${badgeText}</span>
                <span>${b.label}</span>
              </button>
            `;
          }).join('')}
        </div>
        <div id="predict-gate-hint" style="font-size: 11px; color: #b45309; font-weight: 600; margin-top: 8px; display: flex; align-items: center; gap: 6px;">
          ${!this.isInputApplied
            ? `${renderPixelIcon('shield', 11, '#b45309')} Langkah 2A belum selesai: Tentukan nilai masukan di samping terlebih dahulu.`
            : (this.userPrediction
              ? `${renderPixelIcon('check', 11, 'var(--success)')} Dugaan tercatat: Cabang <strong>${this.userPrediction}</strong>. Lanjutkan ke Meja Kerja!`
              : `${renderPixelIcon('target', 11, '#b45309')} Masukan siap (${this.currentInputValue}). Pilih salah satu dugaan cabang di atas untuk membuka Meja Kerja!`
            )
          }
        </div>
        <button id="btn-jump-to-workbench" type="button" class="game-btn game-btn-primary tracing-hypothesis-highlight-btn" style="width: 100%; min-height: 48px; margin-top: 10px; display: ${(this.userPrediction && this.isInputApplied) ? 'inline-flex' : 'none'}; align-items: center; justify-content: center; gap: 8px;">
          ${renderPixelIcon('flask', 13, '#ffffff')}
          <span>Buktikan di Meja Kerja: Cabang ${this.userPrediction || ''} (Langkah 3)</span>
          ${renderPixelIcon('arrow-right', 12, '#ffffff')}
        </button>
      </div>
    `;
    heroCollapsibleBody.appendChild(setupGrid);
    heroCard.appendChild(heroCollapsibleBody);
    zoneOrientation.appendChild(heroCard);
    container.appendChild(zoneOrientation);

    // =========================================================================
    // ZONA 2: Meja Kerja Penelusuran Logika (Langkah 3 - Workbench 2-Kolom)
    // =========================================================================
    const zoneWorkbench = document.createElement('section');
    zoneWorkbench.className = 'tracing-workbench-container wizard-step-panel';
    zoneWorkbench.id = 'tracing-workbench-anchor';
    zoneWorkbench.setAttribute('aria-label', 'Meja Kerja Tracing & Eksekusi');

    // 0. Banner Perbandingan Dugaan Real-Time (Dugaan Murid vs Keputusan Nyata Komputer)
    const hypothesisRibbon = document.createElement('div');
    hypothesisRibbon.id = 'hypothesis-status-ribbon';
    hypothesisRibbon.className = 'tracing-hypothesis-status-ribbon';
    hypothesisRibbon.style.display = 'none';
    zoneWorkbench.appendChild(hypothesisRibbon);

    const traceGrid = document.createElement('div');
    traceGrid.className = 'tracing-workbench-grid';

    // Kolom Kiri: Meja Kerja Visualisasi (Kode & Diagram Alir)
    const leftCol = document.createElement('div');
    leftCol.className = 'tracing-workbench-card';

    // Switcher Mode Tampilan: [Kode] [Diagram Alir] [Keduanya]
    const viewSwitcher = document.createElement('div');
    viewSwitcher.className = 'tracing-segmented-bar';
    viewSwitcher.innerHTML = `
      <div class="eyebrow-label" style="color: var(--primary); display: flex; align-items: center; gap: 6px;">
        ${renderPixelIcon('document', 12, 'var(--primary)')}
        <span>Langkah 3A: Visualisasi Kode &amp; Diagram Alir</span>
      </div>
      <div class="tracing-segmented-nav tracing-mobile-view-tabs">
        <button type="button" class="tracing-segmented-btn tab-btn-code ${this.tracingWorkbenchViewMode === 'CODE' ? 'active' : ''}">
          ${renderPixelIcon('document', 11, 'currentColor')} <span>Kode</span>
        </button>
        <button type="button" class="tracing-segmented-btn tab-btn-flow ${this.tracingWorkbenchViewMode === 'FLOW' ? 'active' : ''}">
          ${renderPixelIcon('chart', 11, 'currentColor')} <span>Diagram Alir</span>
        </button>
        <button type="button" class="tracing-segmented-btn tab-btn-both ${this.tracingWorkbenchViewMode === 'BOTH' ? 'active' : ''}">
          ${renderPixelIcon('flask', 11, 'currentColor')} <span>Keduanya</span>
        </button>
      </div>
    `;

    const codeWrapper = document.createElement('div');
    codeWrapper.id = 'tracing-code-wrapper';
    codeWrapper.style.display = (this.tracingWorkbenchViewMode === 'CODE' || this.tracingWorkbenchViewMode === 'BOTH') ? 'block' : 'none';
    codeWrapper.appendChild(this.syntaxRenderer.getElement());

    const flowWrapper = document.createElement('div');
    flowWrapper.id = 'tracing-flow-wrapper';
    flowWrapper.style.display = (this.tracingWorkbenchViewMode === 'FLOW' || this.tracingWorkbenchViewMode === 'BOTH') ? 'block' : 'none';
    flowWrapper.appendChild(this.flowgorithmView.getElement());

    const viewContainer = document.createElement('div');
    viewContainer.id = 'tracing-views-wrapper';
    viewContainer.className = `tracing-views-wrapper ${this.tracingWorkbenchViewMode === 'BOTH' ? 'mode-both' : ''}`;
    viewContainer.style.cssText = 'display: flex; flex-direction: column; gap: 16px; width: 100%;';
    viewContainer.appendChild(codeWrapper);
    viewContainer.appendChild(flowWrapper);

    const updateViewMode = (mode: 'CODE' | 'FLOW' | 'BOTH') => {
      this.tracingWorkbenchViewMode = mode;
      soundFx.playButtonBlip();
      codeWrapper.style.display = (mode === 'CODE' || mode === 'BOTH') ? 'block' : 'none';
      flowWrapper.style.display = (mode === 'FLOW' || mode === 'BOTH') ? 'block' : 'none';
      viewContainer.className = `tracing-views-wrapper ${mode === 'BOTH' ? 'mode-both' : ''}`;
      viewContainer.style.cssText = 'display: flex; flex-direction: column; gap: 16px; width: 100%;';

      const btnCode = viewSwitcher.querySelector<HTMLButtonElement>('.tab-btn-code');
      const btnFlow = viewSwitcher.querySelector<HTMLButtonElement>('.tab-btn-flow');
      const btnBoth = viewSwitcher.querySelector<HTMLButtonElement>('.tab-btn-both');

      btnCode?.classList.toggle('active', mode === 'CODE');
      btnFlow?.classList.toggle('active', mode === 'FLOW');
      btnBoth?.classList.toggle('active', mode === 'BOTH');
    };

    viewSwitcher.querySelector('.tab-btn-code')?.addEventListener('click', () => updateViewMode('CODE'));
    viewSwitcher.querySelector('.tab-btn-flow')?.addEventListener('click', () => updateViewMode('FLOW'));
    viewSwitcher.querySelector('.tab-btn-both')?.addEventListener('click', () => updateViewMode('BOTH'));

    leftCol.appendChild(viewSwitcher);
    leftCol.appendChild(viewContainer);
    traceGrid.appendChild(leftCol);

    // Kolom Kanan: Konsol Pengujian, Pemantau Nilai, & Terminal
    const rightCol = document.createElement('div');
    rightCol.className = 'tracing-console-card';

    rightCol.innerHTML = `
      <!-- Header Konsol -->
      <div class="eyebrow-label" style="color: var(--primary); display: flex; align-items: center; gap: 6px; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle);">
        ${renderPixelIcon('target', 12, 'var(--primary)')}
        <span>Langkah 3B: Meja Pengujian &amp; Pantauan Nilai Langsung</span>
      </div>

      <!-- Seksi 1: Kendali Eksekusi & Langkah -->
      <div class="tracing-console-section" id="section-tracing-controls">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px;">
          <span>Kendali Eksekusi Kode</span>
          <span id="sim-status-pill" class="badge-pill" style="font-size: 10px; background: rgba(15, 118, 110, 0.08); color: var(--primary); border: 1px solid rgba(15, 118, 110, 0.2);">Siap Diuji</span>
        </div>
        <button id="btn-run-sim" type="button" class="game-btn game-btn-gold" style="width: 100%; min-height: 50px; font-size: 13px; font-weight: 700; gap: 8px; justify-content: center;">
          ${renderPixelIcon('run', 15, '#ffffff')}
          <span id="btn-run-sim-text">Jalankan Alur Program</span>
        </button>
        <div class="tracing-stepper-grid" id="tracing-stepper-nav-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
          <button id="btn-step-prev" type="button" class="game-btn game-btn-secondary" style="min-height: 48px; font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" title="Mundur 1 langkah dalam penelusuran" disabled>
            ${renderPixelIcon('arrow-left', 12, 'currentColor')}
            <span>Mundur 1 Langkah</span>
          </button>
          <button id="btn-step-next" type="button" class="game-btn game-btn-primary" style="min-height: 48px; font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" title="Maju 1 langkah dalam penelusuran" disabled>
            <span>Maju 1 Langkah</span>
            ${renderPixelIcon('arrow-right', 12, 'currentColor')}
          </button>
        </div>
        <div id="sim-hint-text" style="font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 4px; line-height: 1.4;">
          Gunakan tombol langkah untuk observasi per baris atau jalankan alur program otomatis
        </div>
      </div>

      <!-- Seksi 2: Pemantau Status Langkah Aktif -->
      <div class="tracing-console-section">
        <div style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px;">
          Penjelasan Langkah Aktif
        </div>
        <div id="step-inspector" class="tracing-inspector-box">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; margin-bottom: 6px; border-bottom: 1px solid #27272a; padding-bottom: 6px;">
            <span id="step-num-text" style="font-family: var(--font-code); color: #fbbf24; font-weight: 700;">
              Langkah ${this.currentStepIndex + 1} dari ${this.currentTraceResult?.steps.length || 1}
            </span>
            <span id="step-branch-badge" style="font-family: var(--font-code); font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; border: 1px solid transparent;"></span>
          </div>
          <div id="step-desc-text" style="font-size: 12px; color: #f4f4f5; line-height: 1.5; font-family: var(--font-code);"></div>
          <div id="step-hypothesis-note" class="tracing-inspector-hypothesis-note" style="display: none;"></div>
        </div>
      </div>

      <!-- Seksi 3: Pantauan Nilai Langsung -->
      <div class="tracing-console-section">
        <div style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px;">
          Pantauan Nilai Langsung
        </div>
        <div class="tracing-telemetry-row">
          <div class="tracing-telemetry-chip">
            <span class="tracing-telemetry-label">Masukan Aktif</span>
            <span id="watch-val-input" class="tracing-telemetry-val">${this.isInputApplied ? this.currentInputValue : '-'}</span>
          </div>
          <div class="tracing-telemetry-chip">
            <span class="tracing-telemetry-label">Dugaan Murid</span>
            <span id="watch-val-pred" class="tracing-telemetry-val" style="color: var(--warning-dark);">${this.userPrediction || '-'}</span>
          </div>
          <div class="tracing-telemetry-chip">
            <span class="tracing-telemetry-label">Jalur Komputer</span>
            <span id="watch-val-branch" class="tracing-telemetry-val" style="color: var(--primary);">-</span>
          </div>
        </div>
      </div>

      <!-- Seksi 4: Layar Hasil Cetak -->
      <div class="tracing-console-section">
        <div style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px;">
          Layar Hasil Cetak
        </div>
        <div class="tracing-terminal-shell">
          <div class="tracing-terminal-header">
            <span>${renderPixelIcon('terminal', 12, '#a1a1aa')} Konsol Teks Retro</span>
            <span style="font-size: 9.5px; color: #71717a;">OUTPUT</span>
          </div>
          <div id="terminal-text" class="tracing-terminal-body">
            ${(this.isInputApplied && this.userPrediction) ? (this.currentTraceResult?.terminalOutput || '> (Menunggu eksekusi)') : '> (Menunggu masukan & dugaan alur)'}
          </div>
        </div>
      </div>

      <!-- Tombol Maju ke Langkah 4: Evaluasi & Catatan -->
      <div class="tracing-console-section" id="section-conclude-btn" style="margin-top: 8px;">
        <button id="btn-conclude-tracing" type="button" class="game-btn ${isCompletedRun ? 'game-btn-gold' : 'game-btn-secondary'}" style="width: 100%; min-height: 48px; font-size: 12px; font-weight: 700; gap: 8px; display: inline-flex; align-items: center; justify-content: center;" ${!isCompletedRun ? 'disabled title="Jalankan penelusuran hingga langkah selesai terlebih dahulu"' : ''}>
          ${renderPixelIcon('star', 13, isCompletedRun ? '#ffffff' : 'var(--text-muted)')}
          <span>Lanjut: Evaluasi &amp; Catatan (Langkah 4)</span>
          ${renderPixelIcon('arrow-right', 12, isCompletedRun ? '#ffffff' : 'var(--text-muted)')}
        </button>
      </div>
    `;
    traceGrid.appendChild(rightCol);
    zoneWorkbench.appendChild(traceGrid);
    container.appendChild(zoneWorkbench);

    // =========================================================================
    // ZONA 3: Hasil Pembuktian Dugaan & Capaian Belajar (Langkah 4)
    // =========================================================================
    const zoneEvaluation = document.createElement('section');
    zoneEvaluation.className = 'tracing-zone-evaluation wizard-step-panel';
    zoneEvaluation.setAttribute('aria-label', 'Zona Refleksi & Penarikan Kesimpulan');
    zoneEvaluation.style.cssText = `display: flex; flex-direction: column; gap: 14px;`;

    const evalHeader = document.createElement('div');
    evalHeader.className = 'eyebrow-label';
    evalHeader.style.cssText = `color: var(--primary); display: flex; align-items: center; gap: 6px;`;
    evalHeader.innerHTML = `
      ${renderPixelIcon('star', 12, 'var(--primary)')}
      <span>Langkah 4: Hasil Pembuktian Dugaan &amp; Capaian Belajar</span>
    `;
    zoneEvaluation.appendChild(evalHeader);

    // 4.A. Kartu Evaluasi Metakognisi (Tebakan Murid vs Realita Program & Tabel Ringkasan)
    const evalCard = document.createElement('div');
    evalCard.id = 'prediction-evaluation-card';
    evalCard.className = 'tactile-card';
    evalCard.style.cssText = `padding: 16px 20px; border: 1px solid var(--border-retro); border-radius: 12px; background: #ffffff; transition: all 0.2s ease;`;
    zoneEvaluation.appendChild(evalCard);

    // 4.B. CoverageView Pelacak 2 Bintang Capaian
    zoneEvaluation.appendChild(this.coverageView.getElement());

    // 4.C. Kartu Aksi Lanjut ke Kasus Berikutnya atau Arena Tantangan
    const nextStepCard = document.createElement('div');
    nextStepCard.className = 'tactile-card tracing-next-step-card';
    this.updateNextStepCardContent(nextStepCard, container);
    zoneEvaluation.appendChild(nextStepCard);
    container.appendChild(zoneEvaluation);

    // =========================================================================
    // Event Wiring & Interaksi Meja Kerja
    // =========================================================================
    const inputEl = heroCard.querySelector<HTMLInputElement>('#input-trace-val');
    const btnApply = heroCard.querySelector<HTMLButtonElement>('#btn-apply-input');
    const errEl = heroCard.querySelector<HTMLElement>('#input-error-msg');

    const btnRunSim = rightCol.querySelector<HTMLButtonElement>('#btn-run-sim');
    const btnConclude = rightCol.querySelector<HTMLButtonElement>('#btn-conclude-tracing');
    const predictHint = heroCard.querySelector<HTMLElement>('#predict-gate-hint');
    const branchPredictButtons = heroCard.querySelectorAll<HTMLButtonElement>('.btn-predict-branch');
    const btnStep1To2 = storyCallout.querySelector<HTMLButtonElement>('#btn-step1-to-step2');

    // Listener Pita Alur Belajar & Tombol Bantuan Misi
    workflowRibbon.querySelector('#btn-help-mission')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      const inlineBox = document.getElementById('tracing-workflow-mission-box');
      if (inlineBox) {
        inlineBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        inlineBox.classList.remove('mission-box-pulse');
        void inlineBox.offsetWidth;
        inlineBox.classList.add('mission-box-pulse');
      } else {
        this.showMissionGuidanceToast(this.tracingWizardStep, true);
      }
    });
    workflowRibbon.querySelector('#wf-step-1')?.addEventListener('click', () => {
      this.goToTracingStep(1, true, container);
    });
    workflowRibbon.querySelector('#wf-step-2')?.addEventListener('click', () => {
      this.goToTracingStep(2, true, container);
    });
    workflowRibbon.querySelector('#wf-step-3')?.addEventListener('click', () => {
      this.goToTracingStep(3, true, container);
    });
    workflowRibbon.querySelector('#wf-step-4')?.addEventListener('click', () => {
      this.goToTracingStep(4, true, container);
    });

    btnStep1To2?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.goToTracingStep(2, true, container);
    });

    const btnStepPrev = rightCol.querySelector<HTMLButtonElement>('#btn-step-prev');
    const btnStepNext = rightCol.querySelector<HTMLButtonElement>('#btn-step-next');

    const updateStepNavButtons = () => {
      const hasPrediction = this.userPrediction !== null && this.isInputApplied;
      const totalSteps = this.currentTraceResult?.steps.length || 1;
      if (btnStepPrev) {
        btnStepPrev.disabled = !hasPrediction || this.isSimRunning || this.currentStepIndex <= 0;
      }
      if (btnStepNext) {
        btnStepNext.disabled = !hasPrediction || this.isSimRunning || this.currentStepIndex >= totalSteps - 1;
      }
    };

    const updatePredictionGate = () => {
      const hasPrediction = this.userPrediction !== null && this.isInputApplied;
      const isCompleted = this.currentStepIndex >= (this.currentTraceResult?.steps.length || 1) - 1 && hasPrediction;

      if (btnRunSim) {
        btnRunSim.disabled = !hasPrediction || this.isSimRunning;
        const simText = rightCol.querySelector<HTMLElement>('#btn-run-sim-text');
        const simPill = rightCol.querySelector<HTMLElement>('#sim-status-pill');

        if (this.isSimRunning) {
          btnRunSim.className = 'game-btn game-btn-gold';
          if (simPill) {
            simPill.textContent = 'Sedang Berjalan';
            simPill.style.background = 'rgba(217, 119, 6, 0.12)';
            simPill.style.color = 'var(--warning-dark)';
            simPill.style.borderColor = 'rgba(217, 119, 6, 0.3)';
          }
        } else if (isCompleted) {
          btnRunSim.className = 'game-btn game-btn-secondary';
          if (simText) simText.textContent = 'Putar Ulang Alur Program';
          if (simPill) {
            simPill.textContent = 'Selesai Teruji';
            simPill.style.background = 'rgba(21, 128, 61, 0.1)';
            simPill.style.color = 'var(--success)';
            simPill.style.borderColor = 'rgba(34, 197, 94, 0.3)';
          }
        } else {
          btnRunSim.className = 'game-btn game-btn-gold';
          if (simText) simText.textContent = 'Jalankan Alur Program';
          if (simPill) {
            simPill.textContent = hasPrediction ? 'Siap Diuji' : 'Menunggu Dugaan';
            simPill.style.background = 'rgba(15, 118, 110, 0.08)';
            simPill.style.color = 'var(--primary)';
            simPill.style.borderColor = 'rgba(15, 118, 110, 0.2)';
          }
        }
      }

      updateStepNavButtons();

      if (btnConclude) {
        btnConclude.disabled = !isCompleted;
        btnConclude.className = `game-btn ${isCompleted ? 'game-btn-gold' : 'game-btn-secondary'}`;
        btnConclude.innerHTML = `
          ${renderPixelIcon('star', 13, isCompleted ? '#ffffff' : 'var(--text-muted)')}
          <span>Lanjut: Evaluasi &amp; Catatan (Langkah 4)</span>
          ${renderPixelIcon('arrow-right', 12, isCompleted ? '#ffffff' : 'var(--text-muted)')}
        `;
      }

      if (predictHint) {
        if (!this.isInputApplied) {
          predictHint.innerHTML = `${renderPixelIcon('shield', 11, '#b45309')} Langkah 2A belum selesai: Tentukan nilai masukan di samping terlebih dahulu.`;
          predictHint.style.display = 'flex';
        } else if (!hasPrediction) {
          predictHint.innerHTML = `${renderPixelIcon('target', 11, '#b45309')} Nilai masukan siap (${this.currentInputValue}). Pilih salah satu dugaan cabang di atas untuk membuka Meja Kerja!`;
          predictHint.style.display = 'flex';
        } else {
          predictHint.innerHTML = `${renderPixelIcon('check', 11, 'var(--success)')} Dugaan tercatat: Cabang <strong>${this.userPrediction}</strong>. Lanjutkan telusuri kode di Meja Kerja!`;
          predictHint.style.display = 'flex';
        }
      }

      branchPredictButtons.forEach((btn) => {
        const branchId = btn.getAttribute('data-branch-id');
        const isSelected = this.userPrediction === branchId;
        btn.classList.toggle('selected', isSelected);
        if (!this.isInputApplied) {
          btn.setAttribute('disabled', 'true');
          btn.style.opacity = '0.55';
          btn.style.cursor = 'not-allowed';
        } else {
          btn.removeAttribute('disabled');
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
        }
      });

      // Sinkronisasi status Pita Panduan Alur
      const wfStep1 = container.querySelector<HTMLElement>('#wf-step-1');
      const wfStep2 = container.querySelector<HTMLElement>('#wf-step-2');
      const wfStep3 = container.querySelector<HTMLElement>('#wf-step-3');
      const wfStep4 = container.querySelector<HTMLElement>('#wf-step-4');

      const isStep1Done = this.isInputApplied || this.userPrediction !== null || this.tracingWizardStep > 1;
      const isStep2Done = this.userPrediction !== null || this.tracingWizardStep > 2;
      const isStep3Done = isCompleted || this.tracingWizardStep > 3;

      const setBadgeState = (stepEl: HTMLElement | null, isDone: boolean, isActive: boolean, stepNum: number) => {
        if (!stepEl) return;
        stepEl.classList.toggle('completed', isDone && !isActive);
        stepEl.classList.toggle('active', isActive);
        const badge = stepEl.querySelector<HTMLElement>('.tracing-step-badge');
        if (badge) {
          if (isDone && !isActive) {
            badge.innerHTML = renderPixelIcon('check', 11, '#ffffff');
          } else {
            badge.textContent = String(stepNum);
          }
        }
      };

      setBadgeState(wfStep1, isStep1Done, this.tracingWizardStep === 1, 1);
      setBadgeState(wfStep2, isStep2Done, this.tracingWizardStep === 2, 2);
      setBadgeState(wfStep3, isStep3Done, this.tracingWizardStep === 3, 3);
      setBadgeState(wfStep4, isCompleted && (this.progressionState?.stepTracingCompleted || false), this.tracingWizardStep === 4, 4);

      const watchInput = container.querySelector<HTMLElement>('#watch-val-input');
      if (watchInput) watchInput.textContent = this.isInputApplied ? String(this.currentInputValue) : '-';
      const watchPred = container.querySelector<HTMLElement>('#watch-val-pred');
      if (watchPred) watchPred.textContent = this.userPrediction || '-';
      const isEvaluated = hasPrediction && this.currentStepIndex >= 1;
      const watchBranch = container.querySelector<HTMLElement>('#watch-val-branch');
      if (watchBranch) {
        watchBranch.textContent = isEvaluated
          ? (this.currentTraceResult?.executedBranch || '-')
          : (hasPrediction ? '(Menunggu langkah kondisi)' : '-');
      }


      const btnJump = heroCard.querySelector<HTMLButtonElement>('#btn-jump-to-workbench');
      if (btnJump) {
        if (this.userPrediction && this.isInputApplied) {
          btnJump.innerHTML = `${renderPixelIcon('flask', 13, '#ffffff')} <span>Buktikan di Meja Kerja: Cabang ${this.userPrediction} (Langkah 3)</span> ${renderPixelIcon('arrow-right', 12, '#ffffff')}`;
          btnJump.style.display = 'inline-flex';
        } else {
          btnJump.style.display = 'none';
        }
      }

      updateCompactSummary();
      this.updatePredictionEvaluationCard(container);
      this.updateHypothesisComparisonRibbon(container);
    };

    // Fungsi Pengendali Ciutkan / Buka Kartu Setup Kasus
    const toggleHeroCard = (forceState?: boolean) => {
      this.isTracingHeroCollapsed = forceState !== undefined ? forceState : !this.isTracingHeroCollapsed;
      const collBody = heroCard.querySelector<HTMLElement>('#hero-collapsible-body');
      const compactSum = heroCard.querySelector<HTMLElement>('#hero-compact-summary');
      const toggleBtn = heroCard.querySelector<HTMLButtonElement>('#btn-toggle-hero-card');

      if (collBody) collBody.style.display = this.isTracingHeroCollapsed ? 'none' : 'flex';
      if (compactSum) compactSum.style.display = this.isTracingHeroCollapsed ? 'flex' : 'none';
      if (toggleBtn) {
        toggleBtn.innerHTML = this.isTracingHeroCollapsed
          ? `${renderPixelIcon('arrow-down', 10, 'currentColor')} Buka Setup`
          : `${renderPixelIcon('arrow-up', 10, 'currentColor')} Ciutkan Setup`;
        toggleBtn.title = this.isTracingHeroCollapsed
          ? 'Buka detail setup studi kasus'
          : 'Ciutkan kartu setup untuk fokus ke Meja Kerja';
      }
      updateCompactSummary();
    };

    const updateCompactSummary = () => {
      const sumInput = heroCard.querySelector<HTMLElement>('#compact-summary-input');
      const sumPred = heroCard.querySelector<HTMLElement>('#compact-summary-pred');
      if (sumInput) sumInput.textContent = this.isInputApplied ? String(this.currentInputValue) : '(belum diset)';
      if (sumPred) sumPred.textContent = this.userPrediction || '(belum memilih)';
    };

    heroCard.querySelector<HTMLButtonElement>('#btn-toggle-hero-card')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      toggleHeroCard();
    });

    heroCard.querySelector<HTMLButtonElement>('#btn-reopen-hero-card')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      toggleHeroCard(false);
    });

    const btnJump = heroCard.querySelector<HTMLButtonElement>('#btn-jump-to-workbench');
    btnJump?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.goToTracingStep(3, true, container);
    });

    const handleApplyInput = () => {
      const raw = inputEl?.value || '';
      const validation = validateNumericInput(raw);
      if (!validation.isValid) {
        if (errEl) {
          errEl.textContent = validation.errorMessage || 'Input tidak valid.';
          errEl.style.display = 'block';
        }
        return;
      }
      if (errEl) errEl.style.display = 'none';

      this.currentInputValue = validation.value;
      this.isInputApplied = true;
      this.userPrediction = null;
      this.currentStepIndex = 0;

      this.syntaxRenderer.setInputValue(validation.value);
      this.recalculateTrace();
      this.flowgorithmView.setModule(this.activeModule.id, this.currentInputValue);

      const badge = heroCard.querySelector<HTMLElement>('#input-applied-badge');
      if (badge) {
        badge.innerHTML = `${renderPixelIcon('check', 11, 'var(--success)')} Masukan siap diuji (${this.currentInputValue})`;
        badge.style.display = 'inline-flex';
      }

      this.updateStepDisplay(container);
      updatePredictionGate();
      soundFx.playButtonBlip();
      this.showRetroToast(`Masukan ${this.currentInputValue} ditetapkan! Lanjutkan pilih dugaan cabang alur.`, true);
    };

    btnApply?.addEventListener('click', handleApplyInput);
    inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleApplyInput();
    });

    // Event Listener Rekomendasi Preset Nilai Uji Cabang (1-Tap Test Branch)
    heroCard.querySelectorAll<HTMLButtonElement>('.btn-test-preset-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const valStr = chip.getAttribute('data-preset-val');
        if (!valStr || !inputEl) return;
        inputEl.value = valStr;
        handleApplyInput();
        const targetBranch = chip.getAttribute('data-target-branch');
        if (targetBranch) {
          this.userPrediction = targetBranch;
          soundFx.playButtonBlip();
          updatePredictionGate();
        }
      });
    });

    inputEl?.addEventListener('focus', () => {
      if (!this.isInputApplied) {
        const wfStep1 = container.querySelector<HTMLElement>('#wf-step-1');
        const wfStep2 = container.querySelector<HTMLElement>('#wf-step-2');
        wfStep1?.classList.add('completed');
        wfStep1?.classList.remove('active');
        wfStep2?.classList.add('active');
      }
    });

    branchPredictButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!this.isInputApplied) return;
        const branchId = btn.getAttribute('data-branch-id');
        if (branchId) {
          this.userPrediction = branchId;
          soundFx.playButtonBlip();
          updatePredictionGate();
        }
      });
    });

    btnStepPrev?.addEventListener('click', () => {
      if (this.isSimRunning || !this.isInputApplied || !this.userPrediction) return;
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--;
        soundFx.playStepTick();
        this.updateStepDisplay(container);
        updateStepNavButtons();
      }
    });

    btnStepNext?.addEventListener('click', () => {
      if (this.isSimRunning || !this.isInputApplied || !this.userPrediction) return;
      const totalSteps = this.currentTraceResult?.steps.length || 1;
      if (this.currentStepIndex < totalSteps - 1) {
        this.currentStepIndex++;
        soundFx.playStepTick();
        this.updateStepDisplay(container);
        updateStepNavButtons();
        if (this.currentStepIndex >= totalSteps - 1) {
          updatePredictionGate();
        }
      }
    });

    rightCol.querySelector('#btn-run-sim')?.addEventListener('click', () => {
      this.runFullSimulationAnimation(container);
    });

    btnConclude?.addEventListener('click', async () => {
      soundFx.playButtonBlip();
      if (!this.progressionState?.stepTracingCompleted) {
        await this.finishTraceRun();
      }
      this.goToTracingStep(4, true, container);
    });

    updatePredictionGate();
    this.updateStepDisplay(container);
    return container;
  }

  /**
   * Memperbarui konten kartu aksi penutup (Langkah 4) dengan rekomendasi dinamis:
   * - Jika masih ada kasus yang belum tuntas: memprioritaskan tombol lanjut ke kasus berikutnya.
   * - Jika seluruh kasus telah selesai tuntas: mengaktifkan selebrasi ke Arena Tantangan Monster.
   */
  private updateNextStepCardContent(card: HTMLElement, container: HTMLElement | Document = document): void {
    const availableMods = this.isCycle2Unlocked
      ? CASE_MODULES.filter((m) => m.cycleRequired === 2)
      : CASE_MODULES.filter((m) => m.cycleRequired === 1);
    const allCompleted = availableMods.every((m) => {
      const p = this.allModuleProgress[m.id];
      const branches = MODULE_BRANCHES[m.id] || [];
      return (p?.testedBranches?.length || 0) >= branches.length || !!p?.isCompleted;
    });

    const isTracingDone = !!this.progressionState?.stepTracingCompleted;
    const nextCase = this.getNextUncompletedCase();
    const currentBranchDefs = MODULE_BRANCHES[this.activeModule.id] || [];
    const currentProg = this.allModuleProgress[this.activeModule.id];
    const currentTestedBranches = currentProg?.testedBranches || [];
    const isCurrentCaseComplete = currentTestedBranches.length >= currentBranchDefs.length;

    let nextStepContentHtml = '';
    if (allCompleted) {
      nextStepContentHtml = `
        <div style="flex: 1;">
          <div class="eyebrow-label" style="color: var(--success); margin-bottom: 2px;">
            ${renderPixelIcon('check', 12, 'var(--success)')} Seluruh ${availableMods.length} Kasus Berhasil Dituntaskan!
          </div>
          <div style="font-size: 12.5px; color: var(--text-primary); font-weight: 600; line-height: 1.5;">
            Luar biasa! Seluruh jalur kondisi telah berhasil kamu buktikan dengan skor sempurna 100/100 dan 2 Bintang. Arena Tantangan Monster kini siap dihadapi!
          </div>
        </div>
        <div class="tracing-next-step-actions">
          <button id="btn-retry-case" type="button" class="game-btn game-btn-secondary" style="min-height: 48px; padding: 0 14px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;" title="Uji nilai baru pada kasus ini">
            ${renderPixelIcon('refresh', 12, 'currentColor')}
            <span>Uji Nilai Lain</span>
          </button>
          <button id="btn-tracing-to-battle" type="button" class="game-btn game-btn-gold tracing-next-step-btn" style="min-height: 48px; font-size: 12px; font-weight: 700;">
            ${renderPixelIcon('swords', 13, '#ffffff')}
            <span>Lanjut ke Arena Tantangan Monster</span>
            ${renderPixelIcon('arrow-right', 12, '#ffffff')}
          </button>
        </div>
      `;
    } else if (!isCurrentCaseComplete) {
      const nextBranchNumber = currentTestedBranches.length + 1;
      const remainingBranches = currentBranchDefs.length - currentTestedBranches.length;
      nextStepContentHtml = `
        <div style="flex: 1;">
          <div class="eyebrow-label" style="color: var(--warning); margin-bottom: 2px;">
            ${renderPixelIcon('target', 12, 'var(--warning)')} Uji Cabang Logika Belum Tuntas (${currentTestedBranches.length}/${currentBranchDefs.length})
          </div>
          <div style="font-size: 12.5px; color: var(--text-primary); font-weight: 600; line-height: 1.5;">
            Kamu telah membuktikan ${currentTestedBranches.length} dari ${currentBranchDefs.length} cabang pada ${escapeHtml(this.activeModule.title)}. Uji cabang berikutnya (${remainingBranches} cabang tersisa) untuk menuntaskan kasus ini sebelum beralih ke kasus selanjutnya!
          </div>
        </div>
        <div class="tracing-next-step-actions">
          <button id="btn-retry-case" type="button" class="game-btn game-btn-primary" style="min-height: 48px; padding: 0 16px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px;" title="Uji cabang berikutnya untuk menuntaskan kasus ini">
            ${renderPixelIcon('target', 12, '#ffffff')}
            <span>Uji Cabang ${nextBranchNumber} (${nextBranchNumber} dari ${currentBranchDefs.length})</span>
          </button>
        </div>
      `;
    } else if (nextCase) {
      const nextCaseWeight = nextCase.weightPoints || 30;
      nextStepContentHtml = `
        <div style="flex: 1;">
          <div class="eyebrow-label" style="color: var(--success); margin-bottom: 2px;">
            ${renderPixelIcon('check', 12, 'var(--success)')} Kasus Selesai Tuntas (2 Bintang)!
          </div>
          <div style="font-size: 12.5px; color: var(--text-primary); font-weight: 600; line-height: 1.5;">
            Seluruh ${currentBranchDefs.length} cabang pada ${escapeHtml(this.activeModule.title)} berhasil dibuktikan secara tuntas! Segera lanjutkan ke kasus berikutnya untuk melengkapi nilai formatifmu.
          </div>
        </div>
        <div class="tracing-next-step-actions">
          <button id="btn-next-case" type="button" class="game-btn game-btn-primary" style="min-height: 48px; padding: 0 16px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px;" title="Buka kasus berikutnya">
            <span>Lanjut ke ${nextCase.id.toUpperCase()}: ${escapeHtml(nextCase.title)} (+${nextCaseWeight} Poin)</span>
            ${renderPixelIcon('arrow-right', 12, '#ffffff')}
          </button>
          <button id="btn-retry-case" type="button" class="game-btn game-btn-secondary" style="min-height: 48px; padding: 0 14px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;" title="Uji nilai baru pada kasus ini">
            ${renderPixelIcon('refresh', 12, 'currentColor')}
            <span>Uji Nilai Lain</span>
          </button>
        </div>
      `;
    } else {
      nextStepContentHtml = `
        <div style="flex: 1;">
          <div class="eyebrow-label" style="color: var(--success); margin-bottom: 2px;">
            ${renderPixelIcon('check', 12, 'var(--success)')} Kasus Selesai Tuntas (2 Bintang)!
          </div>
          <div style="font-size: 12.5px; color: var(--text-primary); font-weight: 600; line-height: 1.5;">
            Seluruh cabang pada ${escapeHtml(this.activeModule.title)} berhasil dibuktikan secara tuntas!
          </div>
        </div>
        <div class="tracing-next-step-actions">
          <button id="btn-retry-case" type="button" class="game-btn game-btn-secondary" style="min-height: 48px; padding: 0 14px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;">
            ${renderPixelIcon('refresh', 12, 'currentColor')}
            <span>Uji Nilai Lain</span>
          </button>
          <button id="btn-tracing-to-battle" type="button" class="game-btn game-btn-gold tracing-next-step-btn" style="min-height: 48px;" ${!isTracingDone ? 'disabled' : ''}>
            ${renderPixelIcon('swords', 13, '#ffffff')}
            <span>Lanjut ke Arena Tantangan Monster</span>
            ${renderPixelIcon('arrow-right', 12, '#ffffff')}
          </button>
        </div>
      `;
    }

    card.innerHTML = nextStepContentHtml;

    card.querySelector('#btn-next-case')?.addEventListener('click', async () => {
      if (!nextCase) return;
      soundFx.playButtonBlip();
      this.activeModule = nextCase;
      this.resetTracingToInitialState();
      const rawProg = await StorageService.getModuleProgress(nextCase.id);
      const prog: ModuleProgress = rawProg || {
        testedBranches: [],
        stars: 0,
        isCompleted: false,
        xpEarned: 0,
        updatedAt: Date.now()
      };
      this.coverageView.update(prog, nextCase.id, this.formativeScores?.tracingScore || 0, this.isCycle2Unlocked);
      this.render();
      this.scrollToTop();
      window.setTimeout(() => {
        this.showMissionGuidanceToast(1);
      }, 120);
    });

    card.querySelector('#btn-retry-case')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.userPrediction = null;
      this.goToTracingStep(2, true, container instanceof HTMLElement ? container : undefined);
    });

    card.querySelector('#btn-retest-input')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.userPrediction = null;
      this.goToTracingStep(2, true, container instanceof HTMLElement ? container : undefined);
    });

    card.querySelector('#btn-tracing-to-battle')?.addEventListener('click', () => {
      this.bypassTracingGuardOnce = true;
      this.setScreen('BATTLE');
    });
  }

  /**
   * Sinkronisasi visual pada bilah Multi-Case Stepper di bagian atas
   */
  private updateCaseStepper(container: HTMLElement | Document = document): void {
    const stepper = container.querySelector<HTMLElement>('#tracing-case-stepper');
    if (!stepper) return;

    const availableModules = this.isCycle2Unlocked
      ? CASE_MODULES.filter((m) => m.cycleRequired === 2)
      : CASE_MODULES.filter((m) => m.cycleRequired === 1);
    const activeModuleCount = availableModules.length;
    let completedModuleCount = 0;
    availableModules.forEach((mod) => {
      const prog = this.allModuleProgress[mod.id];
      const branchDefs = MODULE_BRANCHES[mod.id] || [];
      const testedCount = prog?.testedBranches?.length || 0;
      if (testedCount >= branchDefs.length) {
        completedModuleCount++;
      }
    });

    const summaryEl = stepper.querySelector<HTMLElement>('.tracing-case-stepper-summary strong');
    if (summaryEl) {
      summaryEl.textContent = `${completedModuleCount}/${activeModuleCount} Kasus`;
    }

    const cards = stepper.querySelectorAll<HTMLElement>('.tracing-case-card');
    cards.forEach((card) => {
      const caseId = card.getAttribute('data-case-id');
      if (!caseId) return;
      const mod = availableModules.find((m) => m.id === caseId);
      if (!mod) return;

      const isActive = mod.id === this.activeModule.id;
      const branchDefs = MODULE_BRANCHES[mod.id] || [];
      const prog = this.allModuleProgress[mod.id];
      const testedBranches = prog?.testedBranches || [];
      const testedCount = testedBranches.length;
      const totalBranches = branchDefs.length;
      const isDone = testedCount >= totalBranches;
      const isPartial = testedCount > 0 && !isDone;
      const defaultWeight = this.isCycle2Unlocked ? 50 : 30;
      const weight = mod.weightPoints || defaultWeight;

      card.classList.toggle('is-active', isActive);
      card.classList.toggle('status-completed', isDone);
      card.classList.toggle('status-partial', isPartial);
      card.classList.toggle('status-pending', !isDone && !isPartial);

      // Sinkronisasi indikator aktif dinamis
      let indicatorEl = card.querySelector<HTMLElement>('.case-card-active-indicator');
      if (isActive) {
        if (!indicatorEl) {
          indicatorEl = document.createElement('div');
          indicatorEl.className = 'case-card-active-indicator';
          indicatorEl.innerHTML = '<span class="pulse-dot"></span> Sedang Ditelusuri';
          card.appendChild(indicatorEl);
        }
      } else {
        if (indicatorEl) {
          indicatorEl.remove();
        }
      }

      const statusEl = card.querySelector<HTMLElement>('.case-card-status');
      if (statusEl) {
        if (isDone) {
          statusEl.style.color = '#166534';
          statusEl.style.background = 'rgba(21, 128, 61, 0.10)';
          statusEl.innerHTML = `${renderPixelIcon('check', 11, '#166534')} <span>${testedCount}/${totalBranches} Cabang Selesai (${weight} Poin • 2 Bintang)</span>`;
        } else if (isPartial) {
          statusEl.style.color = '#92400E';
          statusEl.style.background = 'rgba(217, 119, 6, 0.10)';
          statusEl.innerHTML = `${renderPixelIcon('target', 11, '#92400E')} <span>${testedCount}/${totalBranches} Cabang (${weight} Poin • Uji Cabang Lain)</span>`;
        } else {
          statusEl.style.color = '#57534E';
          statusEl.style.background = '#E7E5DF';
          statusEl.innerHTML = `${renderPixelIcon('refresh', 11, '#57534E')} <span>0/${totalBranches} Cabang (${weight} Poin)</span>`;
        }
      }
    });
  }

  private updatePredictionEvaluationCard(parent: HTMLElement | Document = document): void {
    const card = parent.querySelector<HTMLElement>('#prediction-evaluation-card');
    if (!card) return;

    const executedBranch = this.currentTraceResult?.executedBranch;
    const isRunCompleted = this.currentStepIndex >= (this.currentTraceResult?.steps.length || 1) - 1;

    if (!this.isInputApplied) {
      card.style.borderColor = 'var(--border-subtle)';
      card.style.background = '#ffffff';
      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="color: var(--text-muted); flex-shrink: 0;">
            ${renderPixelIcon('target', 16, 'var(--text-muted)')}
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
            <strong style="color: var(--text-primary);">Menunggu Penentuan Masukan:</strong> Isi nilai masukan pada Langkah 2 di atas lalu tentukan dugaan cabang alur untuk memulai penelusuran.
          </div>
        </div>
      `;
      return;
    }

    if (!this.userPrediction) {
      card.style.borderColor = 'var(--border-subtle)';
      card.style.background = '#ffffff';
      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="color: var(--text-muted); flex-shrink: 0;">
            ${renderPixelIcon('target', 16, 'var(--text-muted)')}
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
            <strong style="color: var(--text-primary);">Menunggu Dugaan Alur:</strong> Tentukan dugaan cabang logika kamu pada Langkah 3 di atas untuk mengaktifkan meja penelusuran.
          </div>
        </div>
      `;
      return;
    }

    if (!isRunCompleted) {
      card.style.borderColor = 'rgba(217, 119, 6, 0.35)';
      card.style.background = '#fffbeb';
      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="color: var(--warning-dark); flex-shrink: 0;">
            ${renderPixelIcon('target', 16, 'var(--warning-dark)')}
          </div>
          <div style="font-size: 12px; color: var(--text-primary); line-height: 1.5;">
            <strong>Dugaan Kamu:</strong> Cabang <strong>${this.userPrediction}</strong>. Tekan tombol <em>Maju</em> atau <em>Jalankan Simulasi Lengkap</em> hingga baris selesai untuk membuktikan kebenarannya.
          </div>
        </div>
      `;
      return;
    }

    const isMatch = this.userPrediction === executedBranch;
    const condBool = this.currentTraceResult?.conditionResult;
    const condText = condBool ? 'BENAR (TRUE)' : 'SALAH (FALSE)';

    const tableHtml = `
      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-retro);">
        <div style="font-size: 11px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('document', 11, 'var(--primary)')} Tabel Ringkasan Pembuktian Logika
        </div>
        <div class="tracing-eval-table-container">
          <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; text-align: left;">
            <thead>
              <tr style="background: rgba(15, 118, 110, 0.08); border-bottom: 1px solid var(--border-retro);">
                <th style="padding: 6px 10px; font-weight: 700; color: var(--primary);">Kasus</th>
                <th style="padding: 6px 10px; font-weight: 700; color: var(--text-primary);">Nilai Uji</th>
                <th style="padding: 6px 10px; font-weight: 700; color: var(--warning-dark);">Dugaan Murid</th>
                <th style="padding: 6px 10px; font-weight: 700; color: var(--text-primary);">Evaluasi Kondisi</th>
                <th style="padding: 6px 10px; font-weight: 700; color: var(--primary);">Jalur Nyata</th>
                <th style="padding: 6px 10px; font-weight: 700; color: ${isMatch ? 'var(--success)' : 'var(--warning-dark)'};">Hasil</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px 10px; font-weight: 700; font-family: var(--font-code);">${this.activeModule.id.toUpperCase()}</td>
                <td style="padding: 8px 10px; font-family: var(--font-code); font-weight: 700;">${this.currentInputValue}</td>
                <td style="padding: 8px 10px; font-family: var(--font-code); color: var(--warning-dark); font-weight: 700;">${this.userPrediction}</td>
                <td style="padding: 8px 10px; font-family: var(--font-code);">${condText}</td>
                <td style="padding: 8px 10px; font-family: var(--font-code); font-weight: 700; color: var(--primary);">${executedBranch}</td>
                <td style="padding: 8px 10px; font-weight: 700; color: ${isMatch ? 'var(--success)' : 'var(--warning-dark)'};">${isMatch ? 'SESUAI' : 'BERBEDA'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 6px; font-style: italic;">
          * Bandingkan hasil uji coba nyata komputer di atas dengan pemahaman aturan logika percabangan pada kasus ini!
        </div>
      </div>
    `;

    const scaffoldingHtml = !isMatch ? `
      <div style="margin-top: 10px; padding: 10px 12px; background: rgba(217, 119, 6, 0.08); border: 1px solid rgba(217, 119, 6, 0.3); border-radius: 8px; font-size: 11.5px; line-height: 1.5;">
        <div style="font-weight: 700; color: #b45309; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('bulb', 11, '#b45309')} Bantuan Refleksi Bertahap (Scaffolding):
        </div>
        <ul style="margin: 0; padding-left: 18px; color: var(--text-primary); display: flex; flex-direction: column; gap: 3px;">
          <li><strong>Level 1 (Variabel):</strong> Cermati kembali nilai masukan uji: <code>${this.currentInputValue}</code>.</li>
          <li><strong>Level 2 (Kondisi):</strong> Perhatikan aturan pembanding pada skenario modul <em>${escapeHtml(this.activeModule.title)}</em>.</li>
          <li><strong>Level 3 (Alur Eksekusi):</strong> Karena kondisi dievaluasi bernilai <strong>${condText}</strong>, komputer mengambil jalur <strong>Cabang ${executedBranch}</strong> dan melewati cabang yang kamu duga.</li>
        </ul>
      </div>
    ` : '';

    if (isMatch) {
      card.style.borderColor = 'rgba(15, 118, 110, 0.4)';
      card.style.background = '#f0fdf4';
      card.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="color: var(--success); flex-shrink: 0; margin-top: 2px;">
            ${renderPixelIcon('check', 16, 'var(--success)')}
          </div>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 700; color: var(--success); margin-bottom: 3px;">
              Dugaan Kamu Terbukti Tepat!
            </div>
            <div style="font-size: 12px; color: var(--text-primary); line-height: 1.5;">
              Program membuktikan bahwa masukan <strong>${this.currentInputValue}</strong> menghasilkan evaluasi kondisi <strong>${condText}</strong> dan menjalankan cabang <strong>${executedBranch}</strong>. Logika percabangan kamu sangat tajam!
            </div>
            ${tableHtml}
          </div>
        </div>
      `;
    } else {
      card.style.borderColor = 'rgba(217, 119, 6, 0.4)';
      card.style.background = '#fffbeb';
      card.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="color: var(--warning-dark); flex-shrink: 0; margin-top: 2px;">
            ${renderPixelIcon('target', 16, 'var(--warning-dark)')}
          </div>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 700; color: var(--warning-dark); margin-bottom: 3px;">
              Dugaan Belum Sesuai dengan Hasil Evaluasi
            </div>
            <div style="font-size: 12px; color: var(--text-primary); line-height: 1.5;">
              Kamu menduga program akan mengambil cabang <strong>${this.userPrediction}</strong>. Namun dengan nilai masukan <strong>${this.currentInputValue}</strong>, kondisi program dievaluasi bernilai <strong>${condText}</strong> sehingga alur eksekusi mengambil cabang <strong>${executedBranch}</strong>. Cermati kembali baris kondisi pada kode atau diagram alir di atas!
            </div>
            ${scaffoldingHtml}
            ${tableHtml}
          </div>
        </div>
      `;
    }
  }

  private recalculateTrace(): void {
    this.currentTraceResult = traceModuleExecution(this.activeModule, this.currentInputValue);
  }

  private updateStepDisplay(parent: HTMLElement): void {
    if (!this.currentTraceResult || this.currentTraceResult.steps.length === 0) return;

    const step = this.currentTraceResult.steps[this.currentStepIndex];
    if (!step) return;

    this.syntaxRenderer.setActiveLine(step.lineNumber);

    if (this.currentStepIndex >= 1) {
      this.syntaxRenderer.setSkippedLines(this.currentTraceResult.skippedLineNumbers);
    } else {
      this.syntaxRenderer.setSkippedLines([]);
    }

    const inspectorEl = parent.querySelector<HTMLElement>('#step-inspector');
    const descText = parent.querySelector<HTMLElement>('#step-desc-text');
    const branchBadge = parent.querySelector<HTMLElement>('#step-branch-badge');
    const stepNumText = parent.querySelector<HTMLElement>('#step-num-text') || inspectorEl?.querySelector<HTMLElement>('span');

    if (stepNumText) {
      stepNumText.textContent = `Langkah ${this.currentStepIndex + 1} dari ${this.currentTraceResult.steps.length}`;
    }
    if (descText) {
      descText.textContent = step.description;
    }
    if (branchBadge) {
      if (step.activeBranch === 'BRANCH_IF') {
        branchBadge.style.display = 'inline-block';
        branchBadge.textContent = 'Cabang: IF (True)';
        branchBadge.style.color = '#4ade80';
        branchBadge.style.backgroundColor = 'rgba(21, 128, 61, 0.25)';
        branchBadge.style.borderColor = 'rgba(74, 222, 128, 0.4)';
      } else if (step.activeBranch === 'BRANCH_ELSE') {
        branchBadge.style.display = 'inline-block';
        branchBadge.textContent = 'Cabang: ELSE (False)';
        branchBadge.style.color = '#f87171';
        branchBadge.style.backgroundColor = 'rgba(220, 38, 38, 0.25)';
        branchBadge.style.borderColor = 'rgba(248, 113, 113, 0.4)';
      } else {
        branchBadge.style.display = 'none';
      }
    }

    // Pemantau nilai update real-time
    const valInput = parent.querySelector<HTMLElement>('#watch-val-input');
    if (valInput) valInput.textContent = this.isInputApplied ? String(this.currentInputValue) : '-';

    const valPred = parent.querySelector<HTMLElement>('#watch-val-pred');
    if (valPred) valPred.textContent = this.userPrediction || '-';

    const isEvaluated = (this.isInputApplied && this.userPrediction !== null && this.currentStepIndex >= 1);
    const valBranch = parent.querySelector<HTMLElement>('#watch-val-branch');
    if (valBranch) {
      valBranch.textContent = isEvaluated
        ? (this.currentTraceResult.executedBranch || '-')
        : (this.userPrediction ? '(Menunggu langkah kondisi)' : '-');
    }

    const termText = parent.querySelector<HTMLElement>('#terminal-text');
    if (termText) {
      if (!this.isInputApplied || !this.userPrediction) {
        termText.textContent = '> (Menunggu masukan & dugaan alur)';
      } else {
        const isEnd = this.currentStepIndex >= this.currentTraceResult.steps.length - 1;
        termText.textContent = isEnd
          ? this.currentTraceResult.terminalOutput
          : `> Menunggu instruksi cetak... (Langkah ${this.currentStepIndex + 1}/${this.currentTraceResult.steps.length})`;
      }
    }


    // Update status pita panduan langkah
    const wfStep4 = parent.querySelector<HTMLElement>('#wf-step-4');
    if (wfStep4) {
      const isEnd = this.currentStepIndex >= this.currentTraceResult.steps.length - 1 && this.userPrediction !== null;
      wfStep4.classList.toggle('completed', isEnd);
      wfStep4.classList.toggle('active', this.userPrediction !== null && !isEnd);
      const badge = wfStep4.querySelector<HTMLElement>('.tracing-step-badge');
      if (badge) {
        if (isEnd) {
          badge.innerHTML = renderPixelIcon('check', 11, '#ffffff');
        } else {
          badge.textContent = '4';
        }
      }
    }

    const btnStepPrev = parent.querySelector<HTMLButtonElement>('#btn-step-prev');
    const btnStepNext = parent.querySelector<HTMLButtonElement>('#btn-step-next');
    if (btnStepPrev && !this.isSimRunning) {
      btnStepPrev.disabled = !this.isInputApplied || !this.userPrediction || this.currentStepIndex <= 0;
    }
    if (btnStepNext && !this.isSimRunning) {
      const totalSteps = this.currentTraceResult.steps.length;
      btnStepNext.disabled = !this.isInputApplied || !this.userPrediction || this.currentStepIndex >= totalSteps - 1;
    }

    this.updatePredictionEvaluationCard(parent);
    this.updateHypothesisComparisonRibbon(parent);

    const stepHypoNote = parent.querySelector<HTMLElement>('#step-hypothesis-note');
    if (stepHypoNote) {
      if (this.userPrediction !== null && this.currentStepIndex >= 1) {
        const isMatch = this.userPrediction === this.currentTraceResult.executedBranch;
        stepHypoNote.style.display = 'flex';
        if (isMatch) {
          stepHypoNote.className = 'tracing-inspector-hypothesis-note note-match';
          stepHypoNote.innerHTML = `
            ${renderPixelIcon('check', 11, '#4ade80')}
            <span><strong>Hasil Perbandingan:</strong> Keputusan komputer di baris ini selaras dengan dugaan murid (Cabang ${this.userPrediction}).</span>
          `;
        } else {
          stepHypoNote.className = 'tracing-inspector-hypothesis-note note-diff';
          stepHypoNote.innerHTML = `
            ${renderPixelIcon('bulb', 11, '#fbbf24')}
            <span><strong>Hasil Perbandingan:</strong> Kamu menduga Cabang <strong>${this.userPrediction}</strong>, namun komputer mengevaluasi masukan ${this.currentInputValue} bernilai <strong>${this.currentTraceResult.conditionResult ? 'BENAR (TRUE)' : 'SALAH (FALSE)'}</strong> sehingga komputer mengambil Cabang <strong>${this.currentTraceResult.executedBranch}</strong>. Cabang <strong>${this.userPrediction}</strong> dilewati oleh komputer.</span>
          `;
        }
      } else {
        stepHypoNote.style.display = 'none';
      }
    }

    // Kirim conditionResult ke diagram alir HANYA jika murid sudah memilih dugaan dan telah mencapai langkah evaluasi kondisi
    const conditionResultForView = (this.userPrediction !== null && this.currentStepIndex >= 1)
      ? this.currentTraceResult.conditionResult
      : null;

    this.flowgorithmView.update(
      this.currentStepIndex + 1,
      step.activeBranch,
      conditionResultForView,
      this.currentInputValue
    );
  }

  private updateHypothesisComparisonRibbon(parent: HTMLElement): void {
    const ribbon = parent.querySelector<HTMLElement>('#hypothesis-status-ribbon');
    if (!ribbon) return;

    if (!this.isInputApplied || !this.userPrediction) {
      ribbon.style.display = 'none';
      return;
    }

    ribbon.style.display = 'flex';
    const isEvaluated = this.currentStepIndex >= 1;
    const executed = this.currentTraceResult?.executedBranch || '-';
    const isMatch = this.userPrediction === executed;

    if (!isEvaluated) {
      ribbon.className = 'tracing-hypothesis-status-ribbon ribbon-pending';
      ribbon.innerHTML = `
        <div class="ribbon-chips-row">
          <span class="badge-pill" style="font-size: 11px; background: rgba(217, 119, 6, 0.12); color: var(--warning-dark); border: 1px solid rgba(217, 119, 6, 0.3);">
            Dugaan Murid: Cabang ${this.userPrediction}
          </span>
          <span style="font-size: 11px; color: var(--text-muted);">&harr;</span>
          <span class="badge-pill" style="font-size: 11px; background: rgba(100, 116, 139, 0.1); color: var(--text-secondary); border: 1px solid var(--border-subtle);">
            Jalur Komputer: (Menunggu Langkah Kondisi)
          </span>
        </div>
        <div style="font-size: 11.5px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('target', 11, 'var(--primary)')}
          <span>Dugaan tercatat. Tekan tombol <strong>Jalankan Alur Program</strong> atau navigasi langkah untuk membuktikan bagaimana komputer mengevaluasi masukan <strong>${this.currentInputValue}</strong>!</span>
        </div>
      `;
    } else if (isMatch) {
      ribbon.className = 'tracing-hypothesis-status-ribbon ribbon-match';
      ribbon.innerHTML = `
        <div class="ribbon-chips-row">
          <span class="badge-pill" style="font-size: 11px; background: rgba(15, 118, 110, 0.12); color: var(--primary); border: 1px solid rgba(15, 118, 110, 0.3);">
            Dugaan Murid: Cabang ${this.userPrediction}
          </span>
          <span style="font-size: 11px; color: var(--text-muted);">&harr;</span>
          <span class="badge-pill" style="font-size: 11px; background: rgba(21, 128, 61, 0.12); color: var(--success); border: 1px solid rgba(34, 197, 94, 0.3);">
            ${renderPixelIcon('check', 10, 'var(--success)')} Jalur Komputer: Cabang ${executed} (Sesuai)
          </span>
        </div>
        <div style="font-size: 11.5px; color: var(--success); display: flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('check', 11, 'var(--success)')}
          <span><strong>Dugaan Sesuai:</strong> Nilai masukan <strong>${this.currentInputValue}</strong> menghasilkan evaluasi kondisi yang selaras dengan dugaan murid.</span>
        </div>
      `;
    } else {
      ribbon.className = 'tracing-hypothesis-status-ribbon ribbon-diff';
      ribbon.innerHTML = `
        <div class="ribbon-chips-row">
          <span class="badge-pill" style="font-size: 11px; background: rgba(217, 119, 6, 0.12); color: var(--warning-dark); border: 1px solid rgba(217, 119, 6, 0.3);">
            Dugaan Murid: Cabang ${this.userPrediction}
          </span>
          <span style="font-size: 11px; color: var(--text-muted);">&harr;</span>
          <span class="badge-pill" style="font-size: 11px; background: rgba(220, 38, 38, 0.12); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3);">
            Jalur Nyata Komputer: Cabang ${executed} (Berbeda)
          </span>
        </div>
        <div style="font-size: 11.5px; color: #92400e; display: flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('bulb', 11, '#b45309')}
          <span><strong>Penjelasan Pembuktian:</strong> Kamu menduga <strong>${this.userPrediction}</strong>, namun komputer mengevaluasi masukan <strong>${this.currentInputValue}</strong> bernilai <strong>${this.currentTraceResult?.conditionResult ? 'BENAR' : 'SALAH'}</strong> sehingga komputer mengambil Cabang <strong>${executed}</strong>. Cabang <strong>${this.userPrediction}</strong> dilewati oleh komputer.</span>
        </div>
      `;
    }
  }

  private runFullSimulationAnimation(parent: HTMLElement): void {
    if (!this.currentTraceResult || this.currentTraceResult.steps.length === 0) return;

    const btnRun = parent.querySelector<HTMLButtonElement>('#btn-run-sim');
    const btnStepPrev = parent.querySelector<HTMLButtonElement>('#btn-step-prev');
    const btnStepNext = parent.querySelector<HTMLButtonElement>('#btn-step-next');
    const simText = parent.querySelector<HTMLElement>('#btn-run-sim-text');
    const simPill = parent.querySelector<HTMLElement>('#sim-status-pill');

    this.isSimRunning = true;
    if (btnRun) {
      btnRun.disabled = true;
      btnRun.style.opacity = '0.8';
    }
    if (btnStepPrev) btnStepPrev.disabled = true;
    if (btnStepNext) btnStepNext.disabled = true;
    if (simPill) {
      simPill.textContent = 'Sedang Berjalan';
      simPill.style.background = 'rgba(217, 119, 6, 0.12)';
      simPill.style.color = 'var(--warning-dark)';
      simPill.style.borderColor = 'rgba(217, 119, 6, 0.3)';
    }

    this.currentStepIndex = 0;
    this.updateStepDisplay(parent);
    if (simText) {
      simText.textContent = `Menjalankan Langkah 1 dari ${this.currentTraceResult.steps.length}...`;
    }

    if (this.autoPlayTimer !== null) {
      window.clearInterval(this.autoPlayTimer);
    }

    this.autoPlayTimer = window.setInterval(() => {
      if (!this.currentTraceResult) return;
      if (this.currentStepIndex < this.currentTraceResult.steps.length - 1) {
        this.currentStepIndex++;
        soundFx.playStepTick();
        this.updateStepDisplay(parent);
        if (simText) {
          simText.textContent = `Menjalankan Langkah ${this.currentStepIndex + 1} dari ${this.currentTraceResult.steps.length}...`;
        }
      } else {
        if (this.autoPlayTimer !== null) {
          window.clearInterval(this.autoPlayTimer);
          this.autoPlayTimer = null;
        }
        this.isSimRunning = false;
        if (btnRun) {
          btnRun.disabled = false;
          btnRun.style.opacity = '1';
          btnRun.className = 'game-btn game-btn-secondary';
        }
        if (btnStepPrev) btnStepPrev.disabled = this.currentStepIndex <= 0;
        if (btnStepNext) btnStepNext.disabled = true;
        if (simText) {
          simText.textContent = 'Putar Ulang Alur Program';
        }
        if (simPill) {
          simPill.textContent = 'Selesai Teruji';
          simPill.style.background = 'rgba(21, 128, 61, 0.1)';
          simPill.style.color = 'var(--success)';
          simPill.style.borderColor = 'rgba(34, 197, 94, 0.3)';
        }
        void this.finishTraceRun();
      }
    }, 700);
  }


  private async finishTraceRun(): Promise<void> {
    if (!this.currentTraceResult) return;
    const branch = this.currentTraceResult.executedBranch;
    const isMatch = this.userPrediction === branch;

    // Pembaruan kartu evaluasi metakognisi terlebih dahulu (selalu, match maupun tidak)
    this.updatePredictionEvaluationCard(this.overlayContainer);

    // Jika dugaan murid TIDAK sesuai, simpan explored (akses) tapi jangan catat nilai (stars)
    if (!isMatch) {
      soundFx.playLogicFalse();
      // Simpan sebagai exploredBranches agar murid tetap bisa lanjut setelah semua kasus dijelajahi
      const rawProgExplore = await StorageService.getModuleProgress(this.activeModule.id);
      const oldExplored = rawProgExplore?.exploredBranches || [];
      const newExplored = Array.from(new Set([...oldExplored, branch]));
      const updatedProg = await StorageService.saveModuleCoverage(
        this.activeModule.id,
        rawProgExplore?.testedBranches || [],
        0,
        newExplored
      );
      this.allModuleProgress[this.activeModule.id] = updatedProg;
      this.progressionState = await StorageService.getProgressionState();

      // Perbarui tombol Arena Tantangan jika semua kasus sudah dijelajahi
      const nextStepCardExplore = this.overlayContainer.querySelector<HTMLElement>('.tracing-next-step-card');
      if (nextStepCardExplore) {
        const isTracingDone = !!this.progressionState?.stepTracingCompleted && this.isTracingCycleCompleted();
        const btnBattleExplore = nextStepCardExplore.querySelector<HTMLButtonElement>('#btn-tracing-to-battle');
        const eyebrowExplore = nextStepCardExplore.querySelector<HTMLElement>('.eyebrow-label');
        const infoTextExplore = nextStepCardExplore.querySelector<HTMLElement>('div[style*="font-size: 12.5px"]');
        if (eyebrowExplore) {
          eyebrowExplore.style.color = isTracingDone ? 'var(--success)' : 'var(--warning)';
          eyebrowExplore.innerHTML = `${renderPixelIcon(isTracingDone ? 'check' : 'lock', 12, isTracingDone ? 'var(--success)' : 'var(--warning)')} ${isTracingDone ? 'Semua Kasus Sudah Dijelajahi' : 'Pembuktian Sedang Berjalan'}`;
        }
        if (infoTextExplore) {
          infoTextExplore.textContent = isTracingDone
            ? 'Seluruh kasus telah dijelajahi. Arena Tantangan Bug Monster kini dapat diakses!'
            : 'Selesaikan penelusuran di semua kasus siklus ini untuk membuka Arena Tantangan.';
        }
        if (btnBattleExplore && isTracingDone) {
          btnBattleExplore.removeAttribute('disabled');
          btnBattleExplore.className = 'game-btn game-btn-gold tracing-next-step-btn';
          btnBattleExplore.innerHTML = `
            ${renderPixelIcon('swords', 13, '#ffffff')}
            <span>Lanjut ke Arena Tantangan Monster</span>
            ${renderPixelIcon('arrow-right', 12, '#ffffff')}
          `;
        }
      }

      this.goToTracingStep(4, false);
      this.showRetroToast(
        `Dugaan belum tepat, tetapi penelusuran ini tetap tercatat. Cermati kembali kondisi pada kode, lalu coba lagi!`,
        false
      );
      this.showMissionGuidanceToast(4);
      return;
    }

    // Dugaan tepat: catat cabang yang berhasil dibuktikan
    soundFx.playStepTick();


    // Mode Latihan: nilai resmi tetap terlindungi (tidak berubah), namun cabang baru tetap dicatat
    // agar murid dapat melengkapi cakupan logika, mengumpulkan 2 Bintang modul, dan membuka Lencana.

    const rawOldProg = await StorageService.getModuleProgress(this.activeModule.id);
    const oldProg: ModuleProgress = rawOldProg || {
      testedBranches: [],
      stars: 0,
      isCompleted: false,
      xpEarned: 0,
      updatedAt: Date.now()
    };
    const tested = new Set(oldProg.testedBranches);
    tested.add(branch);

    const testedArray = Array.from(tested);
    const totalBranches = MODULE_BRANCHES[this.activeModule.id]?.length || 2;
    const isAllBranchesDone = testedArray.length >= totalBranches;
    let stars = 0;
    let addedXp = 0;

    if (isAllBranchesDone) {
      stars = 2;
      if (oldProg.stars < 2) addedXp += 100;
    } else if (testedArray.length >= 1) {
      stars = 1;
      if (oldProg.stars < 1) addedXp += 50;
    }

    const newProg = await StorageService.saveModuleCoverage(this.activeModule.id, testedArray, addedXp);
    this.session = await StorageService.getSession();
    this.progressionState = await StorageService.getProgressionState();
    this.allModuleProgress[this.activeModule.id] = newProg;
    this.formativeScores = await StorageService.getFormativeScores(this.isCycle2Unlocked ? 2 : 1);

    // Kunci nilai telusur resmi pada saat siklus pertama kali tuntas (semua kasus explored/tested)
    if (!this.formativeScores.isTracingLocked && this.isTracingCycleCompleted()) {
      this.formativeScores = await StorageService.recordFirstAttemptTracing(this.formativeScores.tracingScore, this.isCycle2Unlocked ? 2 : 1);
      this.isTracingPracticeMode = true; // Sesi berikutnya masuk sebagai latihan
    }

    this.coverageView.update(newProg, this.activeModule.id, this.formativeScores.tracingScore, this.isCycle2Unlocked);
    this.renderGlobalHeader();

    this.goToTracingStep(4, false);
    if (!(stars === 2 && oldProg.stars < 2)) {
      this.showMissionGuidanceToast(4);
    }

    // Pembaruan reaktif elemen DOM lokal tanpa render() penuh agar scroll murid tidak tereset
    const nextStepCard = this.overlayContainer.querySelector<HTMLElement>('.tracing-next-step-card');
    if (nextStepCard) {
      this.updateNextStepCardContent(nextStepCard, this.overlayContainer);
    }
    this.updateCaseStepper(this.overlayContainer);

    // Deteksi kasus berikutnya yang belum selesai di siklus aktif
    const nextCase = this.getNextUncompletedCase();

    if (stars === 2 && oldProg.stars < 2) {
      soundFx.playVictoryFanfare();
      const buttons: Array<{ label: string; isPrimary?: boolean; action: () => void }> = [];

      if (nextCase) {
        buttons.push({
          label: `Lanjut ke ${nextCase.id.toUpperCase()}: ${nextCase.title}`,
          isPrimary: true,
          action: () => {
            this.activeModule = nextCase;
            this.resetTracingToInitialState();
            this.render();
            this.scrollToTop();
          }
        });
      } else {
        buttons.push({
          label: 'Lanjut ke Arena Tantangan',
          isPrimary: true,
          action: () => this.setScreen('BATTLE')
        });
      }
      buttons.push({
        label: 'Tetap di Sini / Uji Nilai Lain',
        isPrimary: false,
        action: () => { }
      });

      this.showCelebrationModal(
        'Semua Jalur Kondisi Berhasil Dituntaskan!',
        nextCase
          ? `Seluruh ${totalBranches} jalur kondisi logika sudah kamu buktikan secara tuntas pada ${this.activeModule.title}. Kamu meraih 2 Bintang penuh! Lanjutkan ke kasus berikutnya: ${nextCase.title}.`
          : `Seluruh ${totalBranches} jalur kondisi logika sudah kamu buktikan secara tuntas pada ${this.activeModule.title}. Kamu berhasil meraih 2 Bintang sempurna! Arena Tantangan siap dihadapi.`,
        buttons
      );
    } else if (!isAllBranchesDone && testedArray.length > oldProg.testedBranches.length) {
      soundFx.playVictoryFanfare();
      const nextBranchNumber = testedArray.length + 1;
      const remainingBranches = totalBranches - testedArray.length;
      const buttons: Array<{ label: string; isPrimary?: boolean; action: () => void }> = [
        {
          label: `Uji Cabang ${nextBranchNumber} Sekarang (${nextBranchNumber} dari ${totalBranches})`,
          isPrimary: true,
          action: () => {
            this.userPrediction = null;
            this.goToTracingStep(2, true, this.overlayContainer);
            this.showRetroToast(`Tentukan nilai masukan baru untuk menguji cabang ke-${nextBranchNumber}!`, true);
          }
        }
      ];

      this.showCelebrationModal(
        `Cabang ${testedArray.length} dari ${totalBranches} Berhasil Dibuktikan!`,
        `Hebat! Kamu telah membuktikan ${testedArray.length} dari ${totalBranches} jalur kondisi pada ${this.activeModule.title} (1 Bintang). Selesaikan ${remainingBranches} cabang tersisa untuk menuntaskan kasus ini sebelum kamu dapat beralih ke kasus selanjutnya!`,
        buttons
      );
    } else if (stars > oldProg.stars) {
      const starToastMsg = this.isTracingPracticeMode
        ? 'Capaian bintang bertambah! Jalur cabang baru berhasil diuji (nilai resmi tetap aman).'
        : 'Capaian bintang bertambah! Nilai pemahaman formatifmu meningkat.';
      this.showRetroToast(starToastMsg, true);
    } else if (this.isTracingPracticeMode) {
      this.showRetroToast('Dugaan tepat! Jalur cabang ini sudah pernah diuji sebelumnya (nilai resmi tetap aman).', true);
    } else {
      this.showRetroToast('Dugaan tepat! Penelusuran logika berhasil dibuktikan.', true);
    }
  }


  /**
   * Mengembalikan kasus (modul) berikutnya yang belum selesai (seluruh cabang belum tuntas)
   * dalam siklus aktif, atau null jika semua sudah tuntas.
   */
  private getNextUncompletedCase(): CaseModule | null {
    if (this.isCycle2Unlocked) {
      const c2Modules = CASE_MODULES.filter((m) => m.cycleRequired === 2);
      const currentC2Idx = c2Modules.findIndex((m) => m.id === this.activeModule.id);
      for (let i = 0; i < c2Modules.length; i++) {
        const idx = (currentC2Idx + 1 + i) % c2Modules.length;
        const mod = c2Modules[idx]!;
        if (mod.id === this.activeModule.id) continue;
        const prog = this.allModuleProgress[mod.id];
        const branchCount = prog?.testedBranches?.length || 0;
        const totalBranches = MODULE_BRANCHES[mod.id]?.length || 2;
        if (branchCount < totalBranches) return mod;
      }
      return null;
    }

    const currentIndex = CASE_MODULES.findIndex((m) => m.id === this.activeModule.id);
    for (let i = 0; i < CASE_MODULES.length; i++) {
      const idx = (currentIndex + 1 + i) % CASE_MODULES.length;
      const mod = CASE_MODULES[idx]!;
      if (mod.cycleRequired > 1) continue;
      if (mod.id === this.activeModule.id) continue;
      const prog = this.allModuleProgress[mod.id];
      const branchCount = prog?.testedBranches?.length || 0;
      const totalBranches = MODULE_BRANCHES[mod.id]?.length || 2;
      if (branchCount < totalBranches) return mod;
    }
    return null;
  }

  // =================================================================
  // Layar 06: Pertarungan Logika (Branching Battle RPG Challenge)
  // =================================================================
  private renderScreenBattle(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'tactile-card';
    card.style.cssText = `padding: 22px;`;

    const cycle1BattleRounds = [
      {
        roundNumber: 1,
        conditionDisplay: 'saldo_kartu (5000) >= tarif_mrt (3500)',
        questionPrompt: 'Ronde 1: Gerbang MRT memeriksa apakah saldo kartu cukup untuk membayar tarif. Diketahui saldo kartu = 5000 dan tarif perjalanan = 3500. Apakah kondisi 5000 >= 3500 bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'TRUE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Tepat! 5000 >= 3500 bernilai BENAR (TRUE) karena 5000 lebih besar dari 3500. Cabang IF dijalankan: gerbang terbuka dan saldo dipotong otomatis. Serangan logika menghantam Bug Monster (-10 HP)!',
        explanationWrong: 'Kurang tepat! 5000 >= 3500 bernilai BENAR (TRUE) karena 5000 lebih besar dari 3500. Operator >= memeriksa apakah nilai kiri lebih besar atau sama dengan kanan. Cabang yang dijalankan adalah IF, bukan ELSE. Serangan terpantul (-5 HP Hero).'
      },
      {
        roundNumber: 2,
        conditionDisplay: 'kecepatan (45) > batas_maksimal (60)',
        questionPrompt: 'Ronde 2: Radar jalan raya mendeteksi kelajuan mobil. Tercatat kecepatan mobil = 45 km/jam, sedangkan batas maksimal jalan = 60 km/jam. Apakah kondisi 45 > 60 bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'FALSE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Tepat sekali! 45 > 60 bernilai SALAH (FALSE) karena 45 lebih kecil dari 60. Cabang ELSE dijalankan: laju kendaraan masih aman sehingga tidak ditilang. Serangan logika menghantam Bug Monster (-10 HP)!',
        explanationWrong: 'Kurang tepat! 45 > 60 bernilai SALAH (FALSE) karena 45 tidak lebih besar dari 60. Operator > hanya bernilai TRUE jika nilai kiri melampaui nilai kanan. Cabang yang dijalankan adalah ELSE, bukan IF. Serangan terpantul (-5 HP Hero).'
      },
      {
        roundNumber: 3,
        conditionDisplay: 'stok_barang (0) == 0',
        questionPrompt: 'Ronde 3: Toko online memeriksa ketersediaan barang saat flash sale. Jumlah stok tersisa saat ini = 0 unit. Apakah kondisi 0 == 0 bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'TRUE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Tepat! 0 == 0 bernilai BENAR (TRUE) karena kedua angka bernilai sama persis. Cabang IF dijalankan: tombol produk berubah menjadi Habis Terjual (Sold Out). Serangan logika menghantam Bug Monster (-10 HP)!',
        explanationWrong: 'Kurang tepat! 0 == 0 bernilai BENAR (TRUE) karena angka 0 sama persis dengan 0. Operator == memeriksa kesetaraan dua nilai. Cabang yang dijalankan adalah IF, bukan ELSE. Serangan terpantul (-5 HP Hero).'
      },
      {
        roundNumber: 4,
        conditionDisplay: 'jumlah_tarik (800000) < saldo (500000)',
        questionPrompt: 'Ronde 4: Mesin ATM memeriksa apakah saldo rekening mencukupi penarikan tunai. Murid ingin menarik uang Rp 800.000, sedangkan saldo di rekening Rp 500.000. Apakah kondisi 800000 < 500000 bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'FALSE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Tepat sekali! 800000 < 500000 bernilai SALAH (FALSE) karena 800 ribu lebih besar dari 500 ribu. Cabang ELSE dijalankan: mesin ATM menampilkan pesan Saldo Tidak Mencukupi. Serangan logika menghantam Bug Monster (-10 HP)!',
        explanationWrong: 'Kurang tepat! 800000 < 500000 bernilai SALAH (FALSE) karena 800.000 lebih besar dari 500.000. Operator < membutuhkan nilai kiri lebih kecil dari kanan agar bernilai TRUE. Cabang yang dijalankan adalah ELSE, bukan IF. Serangan terpantul (-5 HP Hero).'
      },
      {
        roundNumber: 5,
        conditionDisplay: 'status_absen ("Izin") != "Hadir"',
        questionPrompt: 'Ronde 5: Mesin presensi sekolah memeriksa status kehadiran murid. Status yang tercatat adalah "Izin". Operator != berarti TIDAK SAMA DENGAN. Apakah kondisi "Izin" != "Hadir" bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'TRUE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Sempurna! "Izin" != "Hadir" bernilai BENAR (TRUE) karena teks "Izin" memang tidak sama dengan "Hadir". Operator != menghasilkan TRUE jika nilai kiri berbeda dari nilai kanan. Bug Monster takluk (-10 HP)!',
        explanationWrong: 'Kurang tepat! "Izin" dan "Hadir" adalah dua teks yang berbeda, sehingga operator != bernilai BENAR (TRUE). Operator != memeriksa apakah kedua nilai tidak sama. Cabang IF yang dijalankan, bukan ELSE. Serangan terpantul (-5 HP Hero).'
      }
    ];

    const cycle2BattleRounds = [
      {
        roundNumber: 1,
        conditionDisplay: 'kartuValid (1) == 1 && pinBenar (1) == 1',
        questionPrompt: 'Ronde 1: Pintu lab sekolah terbuka jika kartu murid valid DAN PIN yang dimasukkan benar. Sensor mendeteksi kartu valid (kartuValid = 1) dan PIN tepat (pinBenar = 1). Apakah kondisi (1 == 1 && 1 == 1) bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'TRUE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Tepat sekali! Operator logika && (DAN) mewajibkan kedua syarat bernilai BENAR agar menghasilkan BENAR (TRUE). Karena kartu valid dan PIN benar, kunci pintu lab terbuka. Serangan logika menghantam Bug Monster (-10 HP)!',
        explanationWrong: 'Kurang tepat! Pada operator logika && (DAN), jika kedua syarat bernilai BENAR (1 == 1 bernilai TRUE dan 1 == 1 bernilai TRUE), maka hasil akhirnya adalah BENAR (TRUE). Serangan terpantul (-5 HP Hero).'
      },
      {
        roundNumber: 2,
        conditionDisplay: 'suhu (45) > 60 || adaAsap (1) == 1',
        questionPrompt: 'Ronde 2: Alarm bahaya berbunyi jika suhu ruangan > 60 ATAU terdeteksi ada asap (adaAsap == 1). Sensor membaca suhu 45°C (belum panas), tetapi sensor lain mendeteksi kepulan asap (adaAsap = 1). Apakah kondisi (45 > 60 || 1 == 1) bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'TRUE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Tepat sekali! Operator logika || (ATAU) hanya memerlukan minimal salah satu syarat bernilai BENAR agar menghasilkan BENAR (TRUE). Karena ada asap (1 == 1 bernilai TRUE), alarm berbunyi seketika untuk keselamatan. Serangan logika menghantam Bug Monster (-10 HP)!',
        explanationWrong: 'Kurang tepat! Operator || (ATAU) menghasilkan BENAR (TRUE) jika minimal salah satu syarat terpenuhi. Walaupun suhu belum mencapai 60, adanya asap (adaAsap == 1) sudah cukup untuk membunyikan alarm. Serangan terpantul (-5 HP Hero).'
      },
      {
        roundNumber: 3,
        conditionDisplay: 'kecepatan (35) >= 50',
        questionPrompt: 'Ronde 3: Pembagian prioritas internet menggunakan percabangan bertingkat: if (kecepatan >= 50) untuk Prioritas Tinggi; else if (kecepatan >= 20) untuk Prioritas Sedang; else untuk Prioritas Rendah. Program sedang menguji koneksi 35 Mbps pada syarat pertama. Apakah kondisi 35 >= 50 bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'FALSE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Tepat sekali! 35 >= 50 bernilai SALAH (FALSE) karena 35 lebih kecil dari 50. Pada alur percabangan bertingkat, program melewati cabang pertama dan lanjut memeriksa cabang berikutnya (kecepatan >= 20 untuk Prioritas Sedang). Serangan logika menghantam Bug Monster (-10 HP)!',
        explanationWrong: 'Kurang tepat! 35 >= 50 bernilai SALAH (FALSE) karena 35 tidak lebih besar atau sama dengan 50. Program tidak masuk ke blok Prioritas Tinggi, melainkan melanjutkan pengecekan ke syarat else if berikutnya. Serangan terpantul (-5 HP Hero).'
      },
      {
        roundNumber: 4,
        conditionDisplay: 'sisaKuota (0) > 0 && masaAktif (7) >= 1',
        questionPrompt: 'Ronde 4: Akses internet aktif jika kuota masih ada (sisaKuota > 0) DAN kartu masih aktif (masaAktif >= 1). Data perangkat murid menunjukkan sisa kuota = 0 GB, tetapi masa aktif kartu masih 7 hari. Apakah kondisi (0 > 0 && 7 >= 1) bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'FALSE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Tepat sekali! Karena sisa kuota 0, syarat 0 > 0 bernilai SALAH (FALSE). Pada operator logika && (DAN), jika salah satu syarat sudah SALAH, maka hasil akhirnya langsung SALAH (FALSE). Akses internet diputus. Serangan logika menghantam Bug Monster (-10 HP)!',
        explanationWrong: 'Kurang tepat! Kondisi 0 > 0 bernilai SALAH (FALSE) karena angka 0 tidak lebih besar dari 0. Operator && membutuhkan kedua syarat bernilai BENAR agar menghasilkan BENAR. Karena kuota habis, akses tidak diberikan. Serangan terpantul (-5 HP Hero).'
      },
      {
        roundNumber: 5,
        conditionDisplay: 'pilihan (2) == 2',
        questionPrompt: 'Ronde 5: Mesin minuman otomatis membaca tombol pilihan murid dengan switch-case: case 1 (Air Mineral), case 2 (Susu Cokelat Dingin), case 3 (Teh Hangat). Murid menekan tombol 2 (pilihan = 2). Apakah nilai pilihan cocok dengan label case 2 (2 == 2 bernilai BENAR) atau SALAH (FALSE)?',
        expectedBranch: 'TRUE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Sempurna! Pilihan bernilai 2 cocok persis dengan label case 2 (2 == 2 bernilai BENAR). Alur program langsung menuju blok case 2 untuk menuangkan Susu Cokelat Dingin dan perintah break mengakhiri pilihan. Bug Monster takluk (-10 HP)!',
        explanationWrong: 'Kurang tepat! Angka pilihan 2 cocok dengan label case 2, sehingga kondisi bernilai BENAR (TRUE). Program langsung menjalankan tindakan pada case 2. Serangan terpantul (-5 HP Hero).'
      }
    ];

    const battleRounds = this.isCycle2Unlocked ? cycle2BattleRounds : cycle1BattleRounds;

    const roundIndex = Math.min(Math.max(1, this.currentBattleRound), 5) - 1;
    const currentRound = battleRounds[roundIndex]!;

    card.innerHTML = `
      <!-- Header Arena & Pita Panduan Belajar -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 2px solid var(--border-retro); padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 6px; background: rgba(15, 118, 110, 0.1);">
            ${renderPixelIcon('swords', 14, 'var(--primary)')}
          </span>
          <div>
            <div style="font-family: var(--font-ui); font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
              Arena Tantangan: Pengujian Logika Percabangan
            </div>
            <div style="font-size: 10.5px; color: var(--text-muted); font-family: var(--font-ui);">
              Evaluasi kondisi percabangan di setiap ronde untuk meluncurkan aksi yang tepat!
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span class="badge-pill" style="color: var(--primary); font-weight: bold; font-size: 11px; border-color: rgba(15, 118, 110, 0.4); background: rgba(15, 118, 110, 0.1);">
            Ronde ${currentRound.roundNumber}/5
          </span>
          <span class="badge-pill" style="color: var(--warning-dark); font-weight: bold; font-size: 11px; border-color: rgba(217, 119, 6, 0.4); background: rgba(217, 119, 6, 0.1);">
            HP Pemain: <strong id="battle-player-hp">${this.playerHp}</strong>/${this.maxPlayerHp}
          </span>
          <span class="badge-pill" style="color: ${this.isBattlePracticeMode ? 'var(--text-muted)' : 'var(--success)'}; font-weight: bold; font-size: 11px; border-color: ${this.isBattlePracticeMode ? 'var(--border-subtle)' : 'rgba(21, 128, 61, 0.4)'}; background: ${this.isBattlePracticeMode ? 'var(--surface-panel-alt)' : 'rgba(21, 128, 61, 0.1)'};">
            ${this.isBattlePracticeMode ? 'Mode Latihan' : 'Tantangan Formatif'}
          </span>
        </div>
      </div>

      <!-- Kotak Pertanyaan & Kondisi Percabangan Ronde Aktif -->
      <div style="
        padding: 12px 14px;
        background: #ffffff;
        border: 1.5px solid var(--border-retro);
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(28, 25, 23, 0.03);
        margin-bottom: 12px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span class="eyebrow-label" style="color: var(--primary); display: flex; align-items: center; gap: 6px; font-size: 10px;">
            ${renderPixelIcon('target', 11, 'var(--primary)')} Misi Ronde ${currentRound.roundNumber}
          </span>
          <span style="font-family: var(--font-code); font-size: 11px; font-weight: 700; color: var(--warning-dark);">
            HP Monster: <strong id="battle-enemy-hp">${this.enemyHp}</strong> / ${this.maxEnemyHp}
          </span>
        </div>
        <div style="font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; line-height: 1.5;">
          ${currentRound.questionPrompt}
        </div>
        <div style="background: var(--surface-panel-alt); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 8px 12px; font-family: var(--font-code); font-size: 12px; color: var(--text-code-var); line-height: 1.4;">
          <span style="color: var(--text-muted);">// Evaluasi Ekspresi Kondisi</span><br />
          <strong style="color: var(--primary);">Kondisi:</strong> <span style="color: var(--warning-dark); font-weight: 700;">${currentRound.conditionDisplay}</span> ?
        </div>
      </div>

      <!-- Panel Catatan & Respon Pertarungan -->
      <div class="tactile-panel" style="margin-bottom: 10px; padding: 12px 14px;">
        <div id="battle-log-container" style="
          background-color: #09090b;
          border: 1.5px solid var(--border-retro);
          border-radius: 6px;
          padding: 10px 12px;
          min-height: 42px;
          font-size: 12px;
          color: #f8fafc;
          margin-bottom: 12px;
          line-height: 1.5;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-family: var(--font-ui);
          transition: background-color 0.2s ease, border-color 0.2s ease;
        ">
          <span style="flex-shrink: 0; margin-top: 2px;">
            ${renderPixelIcon('chat', 14, 'var(--primary)')}
          </span>
          <span id="battle-log-text">${this.battleLog}</span>
        </div>

        <div style="font-size: 10.5px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px;">
          Pilih Cabang Aksi Serangan Sesuai Evaluasi Kondisi:
        </div>

        <div class="battle-actions-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <button id="btn-attack-true" type="button" class="game-btn game-btn-primary" style="font-size: 12px; font-weight: 700; min-height: 40px; padding: 8px 12px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
            ${renderPixelIcon('check', 12, '#ffffff')}
            <span>${currentRound.optionTrue.label}</span>
          </button>
          <button id="btn-attack-false" type="button" class="game-btn game-btn-secondary" style="font-size: 12px; font-weight: 700; min-height: 40px; padding: 8px 12px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
            ${renderPixelIcon('shield', 12, 'var(--primary)')}
            <span>${currentRound.optionFalse.label}</span>
          </button>
        </div>
      </div>
    `;

    let isActionResolving = false;

    const updateBattleHud = (isCorrect?: boolean) => {
      const logEl = card.querySelector<HTMLElement>('#battle-log-text');
      if (logEl) logEl.textContent = this.battleLog;

      const logContainer = card.querySelector<HTMLElement>('#battle-log-container');
      if (logContainer && isCorrect !== undefined) {
        if (isCorrect) {
          logContainer.style.backgroundColor = 'rgba(15, 118, 110, 0.25)';
          logContainer.style.borderColor = 'var(--primary)';
        } else {
          logContainer.style.backgroundColor = 'rgba(220, 38, 38, 0.2)';
          logContainer.style.borderColor = 'var(--danger)';
        }
      }

      const enemyHpEl = card.querySelector<HTMLElement>('#battle-enemy-hp');
      if (enemyHpEl) enemyHpEl.textContent = String(this.enemyHp);

      const playerHpEl = card.querySelector<HTMLElement>('#battle-player-hp');
      if (playerHpEl) playerHpEl.textContent = String(this.playerHp);
    };

    const handleActionChoice = (chosenBranch: 'TRUE' | 'FALSE') => {
      if (isActionResolving) return;
      isActionResolving = true;

      const btnTrue = card.querySelector<HTMLButtonElement>('#btn-attack-true');
      const btnFalse = card.querySelector<HTMLButtonElement>('#btn-attack-false');
      if (btnTrue) btnTrue.disabled = true;
      if (btnFalse) btnFalse.disabled = true;

      const isCorrect = chosenBranch === currentRound.expectedBranch;

      if (isCorrect) {
        soundFx.playLogicTrue();
        // Kurangi HP monster sebesar 10 saat jawaban benar
        this.enemyHp = Math.max(0, this.enemyHp - 10);
        this.battleLog = currentRound.explanationCorrect;
      } else {
        soundFx.playLogicFalse();
        // Kurangi HP hero sebesar 5 saat serangan terpantul / jawaban salah
        this.playerHp = Math.max(0, this.playerHp - 5);
        this.battleLog = currentRound.explanationWrong;
      }

      // Perbarui log dan angka HP secara realtime seketika tombol diklik tanpa delay (Bug 1)
      updateBattleHud(isCorrect);

      // Kirim sinyal ke BattleScene untuk sinkronisasi animasi dan HP bar visual
      EventCenter.emit('EXECUTE_BATTLE_TURN', {
        action: chosenBranch === 'TRUE' ? 'A' : 'B',
        isCorrect,
        damage: isCorrect ? 10 : 5,
        enemyHp: this.enemyHp,
        heroHp: this.playerHp
      });

      if (isCorrect) {
        // Beri jeda 1.1s agar murid dapat menyimak penjelasan log realtime dan animasi serangan
        window.setTimeout(() => {
          if (this.currentBattleRound < 5 && this.enemyHp > 0) {
            this.currentBattleRound++;
            this.battleLog = 'Pilih aksi serangan yang sesuai dengan evaluasi kondisi.';
            this.showRetroToast(`Ronde ${this.currentBattleRound - 1} Berhasil! Masuk ke Ronde ${this.currentBattleRound}`, true);
            this.render();
          } else {
            this.checkBattleStatus();
          }
        }, 1100);
      } else {
        // Jika salah, tunggu efek hit hero selesai lalu periksa status atau aktifkan kembali tombol
        window.setTimeout(() => {
          if (this.playerHp <= 0) {
            this.checkBattleStatus();
          } else {
            isActionResolving = false;
            if (btnTrue) btnTrue.disabled = false;
            if (btnFalse) btnFalse.disabled = false;
          }
        }, 900);
      }
    };

    card.querySelector('#btn-attack-true')?.addEventListener('click', () => {
      handleActionChoice('TRUE');
    });

    card.querySelector('#btn-attack-false')?.addEventListener('click', () => {
      handleActionChoice('FALSE');
    });

    return card;
  }

  private checkBattleStatus(): void {
    if (this.enemyHp <= 0 || this.currentBattleRound > 5) {
      soundFx.playVictoryFanfare();

      // Sesi selesai, murid diizinkan keluar ke halaman lain (Requirement 3)
      this.isBattleSessionActive = false;

      const isFirstClear = !this.isBattlePracticeMode;

      // Rekam nilai tantangan resmi pada percobaan pertama (First-Attempt Lock)
      void StorageService.recordFirstAttemptBattle(100, this.isCycle2Unlocked ? 2 : 1).then((scores) => {
        this.formativeScores = scores;
      });

      // Tandai selesai secara sinkron pada state in-memory (termasuk step prasyarat)
      if (!this.progressionState) {
        this.progressionState = {
          stepGuideCompleted: true,
          stepRegistrationCompleted: true,
          stepDialogCompleted: true,
          stepMaterialCompleted: true,
          stepTracingCompleted: true,
          stepBattleCompleted: true,
          stepEvaluationCompleted: false,
          teacherBypassMode: false
        };
      } else {
        this.progressionState.stepRegistrationCompleted = true;
        this.progressionState.stepDialogCompleted = true;
        this.progressionState.stepMaterialCompleted = true;
        this.progressionState.stepTracingCompleted = true;
        this.progressionState.stepBattleCompleted = true;
      }

      // Picu animasi victory di game-container (BattleScene)
      EventCenter.emit('TRIGGER_BATTLE_VICTORY');
      this.currentBattleRound = 1;
      this.enemyHp = 50;
      this.playerHp = 45;

      // Simpan ke storage dan sinkronkan header
      void (async () => {
        await StorageService.saveProgressionState({
          stepRegistrationCompleted: true,
          stepDialogCompleted: true,
          stepMaterialCompleted: true,
          stepTracingCompleted: true,
          stepBattleCompleted: true
        });
        this.renderGlobalHeader();
      })();

      const victoryTitle = isFirstClear ? 'Kemenangan Tempur Tercapai!' : 'Latihan Mandiri Selesai!';
      const victoryMessage = isFirstClear
        ? (this.isCycle2Unlocked
          ? 'Luar biasa! Bug Monster berhasil dikalahkan melalui 5 ronde evaluasi kondisi percabangan majemuk Siklus 2. Langkah 5: Evaluasi Mandiri kini telah terbuka! Skor tantangan kamu tercatat 100.'
          : 'Luar biasa! Bug Monster berhasil dikalahkan melalui 5 ronde evaluasi kondisi percabangan. Langkah 5: Evaluasi Mandiri kini telah terbuka! Skor tantangan kamu tercatat 100.'
        )
        : 'Luar biasa! Bug Monster berhasil dikalahkan kembali dalam mode latihan. Pemahaman logika percabangan kamu semakin kokoh!';

      this.showCelebrationModal(
        victoryTitle,
        victoryMessage,
        [
          {
            label: 'Lanjut ke Langkah 5: Evaluasi Mandiri',
            isPrimary: true,
            action: async () => {
              if (this.progressionState) {
                this.progressionState.stepBattleCompleted = true;
              }
              await StorageService.saveProgressionState({
                stepRegistrationCompleted: true,
                stepDialogCompleted: true,
                stepMaterialCompleted: true,
                stepTracingCompleted: true,
                stepBattleCompleted: true
              });
              this.setScreen('EVALUASI');
            }
          },
          {
            label: 'Ulangi Latihan (Asah Pemahaman)',
            isPrimary: false,
            action: () => {
              this.isBattlePracticeMode = true;
              this.isBattleSessionActive = true;
              this.currentBattleRound = 1;
              this.enemyHp = 50;
              this.playerHp = 45;
              this.battleLog = 'Pilih aksi serangan yang sesuai dengan evaluasi kondisi.';
              EventCenter.emit('RESET_BATTLE');
              this.render();
            }
          }
        ]
      );
    } else if (this.playerHp <= 0) {
      // Pertahanan bobol / kalah: sesi diakhiri sementara agar murid bisa mengulang atau tinjau materi
      this.isBattleSessionActive = false;
      this.playerHp = 45;
      this.enemyHp = 50;
      this.currentBattleRound = 1;
      this.showCelebrationModal(
        'Pertahanan Terbobol',
        'Karakter pemain kelelahan akibat serangan terpantul. Cermati kembali operator pembanding (>=, >, ==, <, !=) dan coba lagi tantangan ronde demi ronde!',
        [
          {
            label: 'Coba Tantangan Lagi',
            isPrimary: true,
            action: () => {
              this.isBattleSessionActive = true;
              this.currentBattleRound = 1;
              this.enemyHp = 50;
              this.playerHp = 45;
              this.battleLog = 'Pilih aksi serangan yang sesuai dengan evaluasi kondisi.';
              EventCenter.emit('RESET_BATTLE');
              this.render();
            }
          },
          {
            label: 'Tinjau Konsep di Lab Telusur',
            isPrimary: false,
            action: () => this.setScreen('TRACING')
          }
        ]
      );
    }
  }

  private showCelebrationModal(
    title: string,
    message: string,
    buttons: Array<{ label: string; isPrimary?: boolean; action: () => void }>
  ): void {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(28, 25, 23, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    `;

    const card = document.createElement('div');
    card.className = 'tactile-card';
    card.style.cssText = `
      max-width: 440px;
      width: 100%;
      padding: 24px;
      text-align: center;
    `;

    card.innerHTML = `
      <div style="font-family: var(--font-pixel); font-size: 13px; color: var(--primary); margin-bottom: 12px; line-height: 1.5; letter-spacing: 0.5px;">
        ${title}
      </div>
      <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
        ${message}
      </p>
      <div id="modal-btn-group" style="display: flex; flex-direction: column; gap: 9px;"></div>
    `;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.removeEventListener('keydown', handleKeyDown);
        backdrop.remove();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const btnGroup = card.querySelector('#modal-btn-group')!;
    buttons.forEach((b) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = b.isPrimary ? 'game-btn game-btn-primary' : 'game-btn game-btn-secondary';
      btn.style.cssText = 'width: 100%; min-height: 44px; font-size: 12px;';
      btn.textContent = b.label;
      btn.addEventListener('click', () => {
        soundFx.playButtonBlip();
        window.removeEventListener('keydown', handleKeyDown);
        backdrop.remove();
        b.action();
      });
      btnGroup.appendChild(btn);
    });

    backdrop.appendChild(card);
    document.body.appendChild(backdrop);
  }

  // =================================================================
  // Layar 07 & 08: Latihan Soal Evaluasi & Umpan Balik Kognitif
  // =================================================================
  private renderScreenEvaluasi(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `display: flex; flex-direction: column; gap: 14px;`;

    const cycle1Questions = [
      {
        question: 'Sebuah sistem otomasi kipas pendingin rumah kaca membaca suhu ruangan. Berapakah nilai boolean dari variabel kipasMenyala pada program di bawah ini?',
        code: `int suhuRuang = 27;\nbool kipasMenyala = (suhuRuang >= 30);`,
        options: [
          'true karena suhuRuang mendekati batas target 30 derajat',
          'true karena variabel kipasMenyala bertipe boolean positif',
          'false karena kondisi 27 >= 30 bernilai salah (tidak terpenuhi)',
          'Error kompilasi karena perbandingan >= memerlukan tanda kurung siku'
        ],
        correctIndex: 2,
        explanation: 'Kondisi 27 >= 30 bernilai SALAH (false) karena angka 27 lebih kecil dari 30. Oleh karena itu, variabel kipasMenyala bernilai false dan kipas pendingin tetap padam.'
      },
      {
        question: 'Pada program kasir toko alat tulis berikut, berapakah nilai akhir dari variabel bayar setelah dijalankan?',
        code: `int totalBelanja = 45000;\nint potonganHarga = 0;\n\nif (totalBelanja >= 50000) {\n    potonganHarga = 10000;\n}\nint bayar = totalBelanja - potonganHarga;`,
        options: [
          '45000 rupiah karena blok percabangan IF dilewati saat kondisi bernilai salah',
          '35000 rupiah karena mendapat potongan harga otomatis 10000 rupiah',
          '0 rupiah karena total belanja belum mencapai batas minimum diskon',
          '55000 rupiah karena variabel potonganHarga ditambahkan ke belanja'
        ],
        correctIndex: 0,
        explanation: 'Karena totalBelanja (45.000) tidak memenuhi syarat (>= 50.000), kondisi bernilai false sehingga blok kurung kurawal IF dilewati (skipped). Nilai potonganHarga tetap 0, dan bayar = 45.000 - 0 = 45.000.'
      },
      {
        question: 'Pada sistem kunci gerbang perumahan, mengapa penulisan kondisi verifikasi wajib menggunakan operator "==" dan bukan "="?',
        code: `int kodeTersimpan = 8821;\nint kodeMasuk = 9999;\n\nif (kodeMasuk == kodeTersimpan) {\n    bukaPintu();\n}`,
        options: [
          'Operator = hanya boleh digunakan untuk operasi perkalian dan pembagian',
          'Operator == membandingkan kesamaan nilai, sedangkan = menugaskan (mengubah) nilai variabel',
          'Operator == mempercepat kecepatan proses pembacaan memori mikroprosesor',
          'Operator ganda == hanya khusus digunakan jika variabel bernilai teks atau string'
        ],
        correctIndex: 1,
        explanation: 'Operator "==" adalah relasional kesetaraan yang menguji apakah dua nilai sama tanpa memodifikasi isinya. Sedangkan operator "=" adalah operator penugasan (assignment) yang akan menimpa nilai variabel di sebelah kiri.'
      },
      {
        question: 'Pada flowchart klasifikasi tiket kereta cepat berikut, simbol grafis apa yang digunakan untuk mengevaluasi kondisi, dan cabang mana yang dilalui data tinggiBadan = 115?',
        code: `int tinggiBadan = 115;\nif (tinggiBadan > 120) {\n    statusTiket = "TIKET DEWASA";\n} else {\n    statusTiket = "TIKET ANAK";\n}`,
        options: [
          'Persegi Panjang (Proses), melalui jalur Benar (True)',
          'Jajaran Genjang (Input/Output), melalui jalur Benar (True)',
          'Oval (Terminator), melalui jalur Salah (False / ELSE)',
          'Belah Ketupat (Decision/Keputusan), melalui jalur Salah (False / ELSE)'
        ],
        correctIndex: 3,
        explanation: 'Dalam standar diagram alir (flowchart), pengecekan kondisi selalu digambarkan dengan Belah Ketupat (Decision Diamond). Karena 115 > 120 bernilai FALSE, eksekusi mengalir ke cabang ELSE ("TIKET ANAK").'
      },
      {
        question: 'Program isi saldo dompet digital di bawah ini baru diuji satu kali dengan masukan nominalIsi = 50000. Mengapa pengujian tersebut belum cukup untuk memastikan seluruh jalur percabangan bekerja dengan benar?',
        code: `if (nominalIsi >= 20000) {\n    statusTransaksi = "BERHASIL";\n} else {\n    statusTransaksi = "DITOLAK_MINIMUM_20RB";\n}`,
        options: [
          'Pengujian harus selalu menggunakan angka kelipatan sepuluh ribu',
          'Pengujian baru membuktikan jalur Benar (IF), sedangkan jalur Salah (ELSE) belum pernah diuji',
          'Nominal 50.000 terlalu besar untuk disimpan dalam variabel angka',
          'Pengujian seluruh jalur percabangan hanya perlu dilakukan jika program memiliki perulangan (looping)'
        ],
        correctIndex: 1,
        explanation: 'Untuk memastikan program benar-benar andal, seluruh kemungkinan jalur keputusan harus diuji. Nilai masukan 50.000 baru menguji jalur Benar (IF). Agar pengujian tuntas, kamu juga perlu menguji jalur Salah (ELSE) dengan masukan di bawah 20.000 (misalnya 10.000).'
      }
    ];

    const cycle2Questions = [
      {
        question: 'Pintu lab komputer otomatis terbuka jika: (kartu aktif DAN kuota jam masih ada) ATAU yang masuk adalah guru. Berdasarkan kode berikut, apakah variabel izinMasuk bernilai true (pintu terbuka) atau false (pintu terkunci)?',
        code: `int kartuAktif = 1; // Kartu aktif\nint kuotaJam = 0;   // Kuota habis\nint statusGuru = 0; // Bukan guru\n\nbool izinMasuk = (kartuAktif == 1 && kuotaJam > 0) || (statusGuru == 1);`,
        options: [
          'false, karena kuota jam sudah habis (kuotaJam > 0 bernilai false) dan murid bukan guru (statusGuru == 1 bernilai false)',
          'true, karena kartu berstatus aktif (kartuAktif == 1) sehingga pintu langsung otomatis terbuka',
          'true, karena jika ada operator || (ATAU) hasilnya selalu otomatis bernilai true',
          'Error kompilasi, karena operator && dan || tidak boleh digabungkan dalam satu baris kode'
        ],
        correctIndex: 0,
        explanation: 'Syarat di dalam kurung kiri (1 == 1 && 0 > 0) menghasilkan (true && false) yang bernilai FALSE karena kuota jam sudah habis (0). Syarat di kurung kanan (0 == 1) juga bernilai FALSE karena murid bukan guru. Karena kedua sisi operator ATAU (||) sama-sama bernilai FALSE, hasil akhirnya adalah false dan pintu lab tetap terkunci.'
      },
      {
        question: 'Sebuah router lab jaringan sekolah mengatur prioritas aliran data melalui percabangan bertingkat else-if berikut. Berapakah nilai akhir dari variabel prioritas jika masukan nilai kecepatan = 35 Mbps?',
        code: `int kecepatan = 35;\nstring prioritas;\n\nif (kecepatan >= 50) {\n    prioritas = "TINGGI";\n} else if (kecepatan >= 20) {\n    prioritas = "SEDANG";\n} else {\n    prioritas = "RENDAH";\n}`,
        options: [
          '"SEDANG" karena nilai 35 melewati syarat pertama (35 >= 50 = false), namun memenuhi syarat kedua (35 >= 20 = true)',
          '"TINGGI" karena angka 35 dibulatkan ke atas mendekati batas minimum 50',
          '"RENDAH" karena kondisi pertama salah sehingga alur eksekusi langsung melompat ke blok penutup else',
          '"TINGGI" dan "SEDANG" dijalankan bersamaan karena program mengecek setiap baris blok if'
        ],
        correctIndex: 0,
        explanation: 'Percabangan bertingkat dievaluasi dari atas ke bawah: kondisi pertama (35 >= 50) bernilai FALSE, sehingga komputer lanjut memeriksa kondisi kedua (35 >= 20) yang bernilai TRUE. Blok else if tersebut dijalankan, variabel prioritas terisi "SEDANG", dan sisa cabang di bawahnya dilewati.'
      },
      {
        question: 'Perhatikan kode penentuan predikat nilai murid berikut yang memiliki kelemahan urutan air terjun (waterfall flaw). Mengapa murid yang memperoleh nilaiAkhir = 95 justru mendapatkan predikat "LULUS_STANDAR" dan blok "PRESTASI_ISTIMEWA" tidak pernah dapat dijalankan?',
        code: `int nilaiAkhir = 95;\nstring predikat;\n\nif (nilaiAkhir >= 60) {\n    predikat = "LULUS_STANDAR";\n} else if (nilaiAkhir >= 90) {\n    predikat = "PRESTASI_ISTIMEWA"; // Bug: Unreachable Code\n} else {\n    predikat = "PERLU_REMIDIAL";\n}`,
        options: [
          'Karena syarat longgar (>= 60) diletakkan di atas syarat ketat (>= 90), sehingga angka 95 langsung tertangkap di cabang pertama dan cabang kedua menjadi kode mati (unreachable code)',
          'Karena variabel nilaiAkhir bertipe data integer sehingga tidak mampu menyimpan angka di atas 90',
          'Karena kompiler pemrograman secara otomatis membalik urutan pembacaan kondisi dari bawah ke atas',
          'Karena struktur kendali percabangan bertingkat mewajibkan penggunaan klausa switch sebelum blok if'
        ],
        correctIndex: 0,
        explanation: 'Pada struktur else-if bertingkat, eksekusi berhenti seketika saat kondisi pertama yang bernilai TRUE ditemukan. Karena semua nilai >= 90 sudah pasti memenuhi >= 60, masukan nilai 95 langsung dijalankan oleh cabang pertama. Cabang kedua menjadi kode mati (unreachable code). Urutan yang benar harus menguji syarat paling ketat (>= 90) terlebih dahulu.'
      },
      {
        question: 'Program tarif parkir berikut memiliki 3 cabang keputusan. Berapakah jumlah nilai uji minimal dan contoh nilai durasiJam yang harus dimasukkan murid agar SELURUH cabang logika (Cabang 1, 2, dan 3) dapat teruji dan terbukti berjalan dengan benar?',
        code: `void hitungTarif(int durasiJam) {\n    if (durasiJam > 5) {\n        tarif = 15000; // Cabang 1: Lebih dari 5 jam\n    } else if (durasiJam >= 2) {\n        tarif = 8000;  // Cabang 2: Antara 2 sampai 5 jam\n    } else {\n        tarif = 3000;  // Cabang 3: Kurang dari 2 jam\n    }\n}`,
        options: [
          'Minimal 3 nilai uji (misal: 6, 3, dan 1), karena setiap nilai mewakili satu cabang yang berbeda',
          'Cukup 1 nilai uji (misal: 5), karena sudah otomatis mewakili keseluruhan program',
          'Cukup 2 nilai uji (misal: 6 dan 1), karena hanya perlu menguji nilai tertinggi dan terendah',
          'Wajib 5 nilai uji (1, 2, 3, 4, 5), karena pengujian harus dicoba satu per satu secara berurutan'
        ],
        correctIndex: 0,
        explanation: 'Karena program memiliki 3 cabang alur yang berbeda, murid membutuhkan minimal 3 nilai masukan agar seluruh cabang dapat teruji: misalnya nilai 6 untuk menguji Cabang 1 (> 5), nilai 3 untuk menguji Cabang 2 (2 sampai 5), dan nilai 1 untuk menguji Cabang 3 (< 2). Menguji semua cabang memastikan tidak ada aturan logika yang terlewat.'
      },
      {
        question: 'Sebuah mesin penjual minuman otomatis (vending machine) memproses kode tombol pilihan murid menggunakan struktur kendali multi-kategori berikut. Jika murid menekan tombol angka 5 (kodeTombol = 5), apakah teks labelMinuman yang dihasilkan pada monitor perangkat?',
        code: `int kodeTombol = 5;\nstring labelMinuman;\n\nswitch (kodeTombol) {\n    case 1:\n        labelMinuman = "AIR_MINERAL";\n        break;\n    case 2:\n        labelMinuman = "SUSU_COKELAT";\n        break;\n    case 3:\n        labelMinuman = "TEH_HANGAT";\n        break;\n    default:\n        labelMinuman = "MENU_TIDAK_TERSEDIA";\n        break;\n}`,
        options: [
          '"MENU_TIDAK_TERSEDIA" karena angka 5 tidak cocok dengan case 1, 2, maupun 3 sehingga dialihkan ke penanganan klausa default',
          '"AIR_MINERAL" karena mesin otomatis memilih label case pertama jika nilai masukan melampaui rentang menu',
          'Teks kosong (null) karena tidak ada label case 5 yang terdaftar di dalam struktur seleksi switch',
          'Error saat program berjalan karena switch-case menolak masukan angka di luar nomor case yang terdaftar'
        ],
        correctIndex: 0,
        explanation: 'Struktur multi-cabang switch-case mencocokkan nilai variabel terhadap setiap konstanta label case. Karena nilai 5 tidak cocok dengan case 1, 2, maupun 3, komputer secara otomatis menjalankan blok klausa default sebagai penanganan jaring pengaman kondisi tak terduga, sehingga labelMinuman terisi "MENU_TIDAK_TERSEDIA".'
      }
    ];

    const questions = this.isCycle2Unlocked ? cycle2Questions : cycle1Questions;

    const currentQ = questions[this.currentQuestionIndex % questions.length]!;
    const isPractice = this.isEvaluasiPracticeMode;
    const officialScore = this.formativeScores?.evaluasiScore ?? 0;

    // Banner Sambutan Maskot Murid (Raka)
    const mascotBanner = document.createElement('div');
    mascotBanner.className = 'tactile-card';
    mascotBanner.style.cssText = `
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      border: 1px solid rgba(15, 118, 110, 0.25);
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(28, 25, 23, 0.03);
      margin-bottom: 14px;
    `;
    mascotBanner.innerHTML = `
      <img src="/assets/images/character_evaluation.webp" alt="Raka (Murid SMA)" style="
        width: 52px;
        height: 52px;
        border-radius: 8px;
        border: 1px solid rgba(15, 118, 110, 0.3);
        object-fit: cover;
        flex-shrink: 0;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      " />
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 3px;">
          <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(15, 118, 110, 0.08); padding: 2px 7px; border-radius: 4px;">
            Raka (Murid SMA Kota Harmoni)
          </span>
          <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${isPractice ? 'var(--primary)' : 'var(--warning)'}; border-color: ${isPractice ? 'rgba(15, 118, 110, 0.3)' : 'rgba(217, 119, 6, 0.4)'}; background: ${isPractice ? 'rgba(15, 118, 110, 0.08)' : 'rgba(217, 119, 6, 0.1)'};">
            ${isPractice ? `Mode Latihan (Nilai Resmi: ${officialScore}/100)` : 'Pengerjaan Pertama (Penilaian Resmi Formatif)'}
          </span>
        </div>
        <div style="font-size: 13px; color: var(--text-primary); line-height: 1.5;">
          ${isPractice
        ? '"Kamu sedang membuka evaluasi dalam mode latihan. Jawaban dapat dicoba kembali tanpa mengubah nilai formatif resmi."'
        : '"Ayo uji pemahaman alur percabangan dengan menjawab 5 butir soal evaluasi mandiri berikut secara teliti!"'}
        </div>
      </div>
    `;
    container.appendChild(mascotBanner);

    // Kartu Soal Bersih Terang (Tactile Assessment Card)
    const questionCard = document.createElement('div');
    questionCard.className = 'tactile-card';
    questionCard.style.cssText = `padding: 22px;`;

    questionCard.innerHTML = `
      <!-- Header Soal -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
        <span class="eyebrow-label" style="font-size: 11px; color: var(--primary);">
          Soal Evaluasi Formatif (${(this.currentQuestionIndex % questions.length) + 1} dari ${questions.length})
        </span>
        <span class="badge-pill" style="color: var(--primary); font-weight: bold; border-color: rgba(15, 118, 110, 0.3); background: rgba(15, 118, 110, 0.08);">
          Bobot: 20 Poin / Soal
        </span>
      </div>

      <!-- Teks Pertanyaan -->
      <div style="font-size: 14px; color: var(--text-primary); font-weight: 700; margin-bottom: 14px; line-height: 1.6;">
        ${currentQ.question}
      </div>

      <!-- Potongan Kode Algoritma -->
      <div class="tactile-inset" style="
        padding: 12px 14px;
        margin-bottom: 16px;
        font-family: var(--font-code);
        font-size: 13px;
        line-height: 1.6;
        white-space: pre-wrap;
        color: #4ade80;
      ">${currentQ.code}</div>

      <!-- Opsi Jawaban Radio (Arcade Choice Cards) -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
        ${currentQ.options
        .map((opt, idx) => {
          const isSelected = this.selectedAnswer === idx;
          const letter = String.fromCharCode(65 + idx);
          return `
              <div class="arcade-choice-card radio-option-card ${isSelected ? 'selected' : ''}" data-idx="${idx}">
                <span class="arcade-key-badge ${isSelected ? 'selected' : ''}">${letter}</span>
                <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">
                  ${opt}
                </span>
              </div>
            `;
        })
        .join('')}
      </div>

      <!-- Kotak Petunjuk / Clue Box -->
      <div class="tips-callout" style="margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 6px; font-weight: bold; color: var(--warning);">
          ${renderPixelIcon('bulb', 14, 'var(--warning)')} Petunjuk Analisis:
        </div>
        <p style="margin-top: 3px; line-height: 1.5; font-size: 12px;">
          Perhatikan operator relasional yang dipakai dan evaluasi nilai kebenaran kondisinya (TRUE / FALSE) secara bertahap.
        </p>
      </div>

      <!-- Panel Umpan Balik Jawaban -->
      ${this.answerSubmitted
        ? `
        <div class="tactile-panel" style="
          background-color: ${this.selectedAnswer === currentQ.correctIndex ? 'rgba(21, 128, 61, 0.12)' : 'rgba(220, 38, 38, 0.12)'};
          border: 2px solid ${this.selectedAnswer === currentQ.correctIndex ? 'var(--success)' : 'var(--danger)'};
          margin-bottom: 16px;
        ">
          <div style="font-family: var(--font-code); font-weight: bold; font-size: 12.5px; color: ${this.selectedAnswer === currentQ.correctIndex ? 'var(--success)' : 'var(--danger)'
        }; margin-bottom: 8px;">
            ${this.selectedAnswer === currentQ.correctIndex ? '[Jawaban Tepat! (+20 Poin)]' : '[Belum Tepat, Mari Cermati Pembahasan]'}
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
              ${renderPixelIcon('check', 13, 'var(--success)')}
              <span><strong>Langkah 1:</strong> Memeriksa nilai variabel masukan.</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
              ${renderPixelIcon(this.selectedAnswer === currentQ.correctIndex ? 'check' : 'cross', 13, this.selectedAnswer === currentQ.correctIndex ? 'var(--success)' : 'var(--danger)')}
              <span><strong>Langkah 2:</strong> Evaluasi relasional (${this.selectedAnswer === currentQ.correctIndex ? 'Evaluasi tepat' : 'Perlu diperhatikan tandanya'}).</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
              ${renderPixelIcon(this.selectedAnswer === currentQ.correctIndex ? 'check' : 'cross', 13, this.selectedAnswer === currentQ.correctIndex ? 'var(--success)' : 'var(--danger)')}
              <span><strong>Langkah 3:</strong> Menentukan cabang keluaran yang tereksekusi.</span>
            </div>
          </div>

          <div style="font-size: 12.5px; color: var(--text-primary); line-height: 1.5; border-top: 1px solid var(--border-retro); padding-top: 8px; font-weight: 500;">
            ${currentQ.explanation}
          </div>
        </div>
      `
        : ''
      }

      <!-- Tombol Aksi Pemeriksaan Jawaban -->
      <div>
        ${!this.answerSubmitted
        ? `<button id="btn-submit-answer" type="button" class="game-btn game-btn-primary" style="width: 100%; min-height: 48px; font-size: 13.5px;">
              Periksa Jawaban
            </button>`
        : `<button id="btn-next-question" type="button" class="game-btn game-btn-success" style="width: 100%; min-height: 48px; font-size: 13.5px; gap: 8px;">
              ${this.currentQuestionIndex + 1 >= questions.length ? 'Selesaikan & Lihat Rekap Nilai' : 'Lanjut ke Soal Berikutnya'} ${renderPixelIcon('arrow-right', 13, '#ffffff')}
            </button>`
      }
      </div>
    `;

    questionCard.querySelectorAll('.radio-option-card, .arcade-choice-card').forEach((el) => {
      el.addEventListener('click', () => {
        if (this.answerSubmitted) return;
        this.selectedAnswer = parseInt((el as HTMLElement).dataset.idx || '0', 10);
        soundFx.playButtonBlip();
        this.render();
      });
    });

    questionCard.querySelector('#btn-submit-answer')?.addEventListener('click', () => {
      if (this.selectedAnswer === null) {
        this.showRetroToast('Pilih salah satu pilihan jawaban terlebih dahulu!', false);
        return;
      }
      this.answerSubmitted = true;
      this.evaluasiAnswers[this.currentQuestionIndex] = this.selectedAnswer;

      if (this.selectedAnswer === currentQ.correctIndex) {
        this.evaluasiCorrectCount++;
        soundFx.playLogicTrue();
      } else {
        soundFx.playLogicFalse();
      }
      this.render();
    });

    const btnNextQ = questionCard.querySelector<HTMLButtonElement>('#btn-next-question');
    btnNextQ?.addEventListener('click', async () => {
      if (btnNextQ.disabled) return;
      btnNextQ.disabled = true;
      try {
        if (this.currentQuestionIndex + 1 >= questions.length) {
          // Sesi evaluasi selesai, lepaskan lock sesi aktif
          this.isEvaluasiSessionActive = false;

          // Catat hasil evaluasi resmi (First-Attempt Lock)
          const updatedScores = await StorageService.recordFirstAttemptEvaluasi(
            this.evaluasiCorrectCount,
            questions.length,
            this.evaluasiAnswers,
            this.isCycle2Unlocked ? 2 : 1
          );
          this.formativeScores = updatedScores;

          await StorageService.saveProgressionState({ stepEvaluationCompleted: true });
          this.progressionState = await StorageService.getProgressionState();
          this.renderGlobalHeader();
          soundFx.playVictoryFanfare();

          const currentScore = this.evaluasiCorrectCount * 20;
          const isFirst = updatedScores.evaluasiAttemptCount === 1;

          const studentDisplayName = this.session?.studentName || this.session?.student1Name || 'Kamu';
          const modalTitle = isFirst ? 'Evaluasi Formatif Selesai!' : 'Latihan Evaluasi Selesai!';
          const modalMessage = isFirst
            ? `Luar biasa! ${studentDisplayName} telah menyelesaikan 5 butir soal evaluasi pemahaman dengan skor ${currentScore} / 100. Nilai formatif resmi ini telah terkunci aman.<br /><br />Langkah selanjutnya: Buka <strong>Dasbor Capaian Belajar</strong> untuk mengamankan dan <strong>mengirimkan bukti laporan belajar ke Google Drive Guru</strong> sebelum melanjutkan ke Posttest Pembelajaran.`
            : `Latihan selesai! Skor perolehan pengerjaan kali ini adalah ${currentScore} / 100. Catatan: Nilai formatif resmimu (${updatedScores.evaluasiScore} / 100) dari percobaan pertama tetap tersimpan aman. Buka Dasbor Capaian Belajar untuk mengamankan dan memeriksa bukti laporan belajarmu.`;

          this.showCelebrationModal(
            modalTitle,
            modalMessage,
            [
              {
                label: 'Buka Dasbor Capaian & Kirim Bukti Belajar',
                isPrimary: true,
                action: () => {
                  this.maxUnlockedProgressStack = 3;
                  this.activeProgressStack = 3;
                  this.setScreen('PROGRES');
                }
              },
              {
                label: 'Kembali ke Peta Kota',
                isPrimary: false,
                action: () => this.setScreen('OVERWORLD')
              }
            ]
          );
          return;
        }

        this.currentQuestionIndex++;
        this.selectedAnswer = null;
        this.answerSubmitted = false;
        soundFx.playButtonBlip();
        this.render();
        this.scrollToTop();
      } finally {
        btnNextQ.disabled = false;
      }
    });

    container.appendChild(questionCard);
    return container;
  }

  // =================================================================
  // Layar 08: Dasbor Capaian Belajar, Lencana, & Pengiriman Hasil Progres
  // =================================================================
  private renderScreenProgres(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'progres-page-container';

    const formative = this.formativeScores || {
      tracingScore: 0,
      battleScore: 0,
      evaluasiScore: 0,
      finalScore: 0,
      evaluasiAttemptCount: 0,
      isTracingLocked: false,
      isEvaluasiLocked: false,
      isBattleLocked: false,
      updatedAt: Date.now()
    };
    const currentDriveUrl = StorageService.getDriveUrlSync(this.isCycle2Unlocked ? 2 : 1);
    const currentAbsenStr = this.session?.studentAbsen ? String(this.session.studentAbsen).padStart(2, '0') : 'XX';
    const currentCleanName = this.session?.studentName ? this.session.studentName.replace(/[^a-zA-Z0-9]/g, '') : 'NamaMurid';
    const expectedFilename = `iobranch_Siklus${this.isCycle2Unlocked ? '2' : '1'}_Absen${currentAbsenStr}_${currentCleanName}.txt`;

    const hasPriorWork = formative.finalScore > 0 || formative.isEvaluasiLocked || !!this.lastCloudUploadResult || !!this.progressionState?.teacherBypassMode;
    if (hasPriorWork) {
      this.maxUnlockedProgressStack = 3;
    }

    const activeModules = this.isCycle2Unlocked
      ? CASE_MODULES.filter(m => m.cycleRequired === 2)
      : CASE_MODULES.filter(m => m.cycleRequired === 1);
    const completedCasesCount = activeModules.filter(m => {
      const prog = this.allModuleProgress[m.id];
      return (prog?.testedBranches?.length || 0) >= 1 || !!prog?.isCompleted;
    }).length;

    container.innerHTML = `
      <!-- 1. Header & Dossier Profil Pembelajaran Murid -->
      <div class="tactile-card" style="padding: 18px 20px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          <div>
            <span class="eyebrow-label" style="color: var(--primary); margin-bottom: 3px; display: block;">
              Portofolio Belajar Murid • Informatika Kelas X-10
            </span>
            <h1 style="font-size: 16.5px; font-weight: 700; color: var(--text-primary); margin: 3px 0 2px; letter-spacing: 0.2px;">
              Dasbor Capaian Belajar &amp; Lencana Prestasi
            </h1>
            <p style="font-size: 12px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
              Rekapitulasi nilai formatif 3 pilar, portofolio kasus logika, dan evaluasi hasil belajar resmi.
            </p>
          </div>
          <span style="font-family: var(--font-code); font-size: 11px; color: var(--warning); font-weight: bold; padding: 4px 8px; background: rgba(217, 119, 6, 0.08); border-radius: 6px; border: 1px solid rgba(217, 119, 6, 0.2);">
            [${this.session ? (this.session.studentAbsen ? `Absen ${String(this.session.studentAbsen).padStart(2, '0')}` : this.session.pairId) : 'Profil Belum Terdaftar'}]
          </span>
        </div>

        <!-- Kartu Identitas & Status KKM -->
        <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
          <div style="
            width: 54px;
            height: 54px;
            border-radius: 10px;
            border: 1.5px solid var(--border-retro);
            background: rgba(15, 118, 110, 0.06);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          ">
            <span style="font-family: var(--font-pixel); font-size: 7px; color: var(--primary); margin-bottom: 2px;">ABSEN</span>
            <span style="font-family: var(--font-code); font-size: 19px; font-weight: 800; color: var(--primary); line-height: 1;">
              ${this.session?.studentAbsen !== undefined ? String(this.session.studentAbsen).padStart(2, '0') : '--'}
            </span>
          </div>
          <div style="flex: 1; min-width: min(100%, 220px);">
            <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
              ${this.session
        ? (this.session.studentName
          ? `Absen ${String(this.session.studentAbsen || 0).padStart(2, '0')} • ${escapeHtml(this.session.studentName)}`
          : `${escapeHtml(this.session.pairId)} (${escapeHtml(this.session.student1Name)} &amp; ${escapeHtml(this.session.student2Name)})`
        )
        : 'Profil Belajar Murid'
      }
            </div>
            <div style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span>Status: <strong style="color: ${formative.finalScore >= 75 ? 'var(--success)' : 'var(--warning-dark)'};">${formative.finalScore >= 75 ? 'Tuntas Memenuhi KKM (≥75)' : 'Sedang Berproses (KKM: 75)'}</strong></span>
              <span style="color: var(--border-retro);">|</span>
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                ${this.lastCloudUploadResult?.success
        ? `<span style="color: var(--success); font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">${renderPixelIcon('check', 11, 'var(--success)')} Laporan Terkirim</span>`
        : `<span style="color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px;">${renderPixelIcon('save', 11, 'var(--text-muted)')} Tersimpan Lokal</span>`
      }
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: var(--primary); font-family: var(--font-code);">
              <span style="font-weight: 700;">Nilai Formatif Akhir</span>
              <span style="font-weight: 800;">${formative.finalScore} / 100</span>
            </div>
            <div style="width: 100%; height: 8px; background-color: var(--surface-panel-alt); border-radius: 4px; overflow: hidden; border: 1px solid var(--border-retro);">
              <div style="width: ${Math.min(100, Math.max(0, formative.finalScore))}%; height: 100%; background: linear-gradient(90deg, var(--primary) 0%, #10B981 100%); transition: width 0.3s ease;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Bilah Stepper Progres Portofolio (Progressive Disclosure) -->
      <div class="progres-stepper-box">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <span style="font-family: var(--font-code); font-size: 11px; font-weight: 700; color: var(--primary); display: inline-flex; align-items: center; gap: 6px;">
            ${renderPixelIcon('target', 12, 'var(--primary)')} Tahapan Portofolio Belajar
          </span>
          <span id="progres-progress-text" style="font-family: var(--font-code); font-size: 10.5px; font-weight: 700; color: var(--text-secondary);">
            Tahap ${this.activeProgressStack} dari 3 • ${hasPriorWork || this.maxUnlockedProgressStack === 3 ? '100% Siap' : `${Math.round((this.activeProgressStack / 3) * 100)}% Ditinjau`}
          </span>
        </div>
        <div class="progres-progress-track">
          <div id="progres-progress-fill" class="progres-progress-fill" style="width: ${hasPriorWork || this.maxUnlockedProgressStack === 3 ? '100%' : `${(this.activeProgressStack / 3) * 100}%`};"></div>
        </div>
        <div class="progres-stepper-pills">
          <button id="progres-stepper-pill-1" type="button" class="progres-stepper-pill ${this.activeProgressStack === 1 ? 'active' : (this.maxUnlockedProgressStack >= 2 ? 'completed' : '')}">
            ${renderPixelIcon('chart', 12, 'currentColor')} <span>1. Nilai 3 Pilar</span>
          </button>
          <button id="progres-stepper-pill-2" type="button" class="progres-stepper-pill ${this.activeProgressStack === 2 ? 'active' : (this.maxUnlockedProgressStack >= 3 ? 'completed' : (this.maxUnlockedProgressStack < 2 && !hasPriorWork ? 'locked' : ''))}">
            ${renderPixelIcon(this.maxUnlockedProgressStack >= 2 || hasPriorWork ? 'trophy' : 'lock', 12, 'currentColor')} <span>2. Kasus &amp; Lencana</span>
          </button>
          <button id="progres-stepper-pill-3" type="button" class="progres-stepper-pill ${this.activeProgressStack === 3 ? 'active' : (this.maxUnlockedProgressStack >= 3 ? (hasPriorWork ? 'completed' : '') : (hasPriorWork ? '' : 'locked'))}">
            ${renderPixelIcon(this.maxUnlockedProgressStack >= 3 || hasPriorWork ? 'drive' : 'lock', 12, 'currentColor')} <span>3. Evaluasi &amp; Kirim</span>
          </button>
        </div>
      </div>

      <!-- 3. Tumpukan Kartu Progres (Progressive Disclosure Stacks) -->
      <div style="display: flex; flex-direction: column; gap: 14px;">

        <!-- STACK 1: Rekap Nilai Formatif 3 Pilar -->
        <div id="progres-stack-card-1" class="progres-stack-card ${this.activeProgressStack === 1 ? 'active' : ''}">
          <button id="progres-stack-header-1" type="button" class="progres-stack-header" aria-expanded="${this.activeProgressStack === 1}">
            <div class="progres-stack-title-box">
              <span id="progres-stack-badge-1" class="progres-stack-num-badge">1</span>
              <div>
                <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
                  Rekap Nilai Formatif 3 Pilar (Skala 1 s.d. 100)
                </div>
                <div style="font-size: 11px; color: var(--text-secondary);">
                  Capaian hasil belajar dari Lab Telusur, Tantangan Tempur, dan Evaluasi Mandiri.
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${formative.isEvaluasiLocked ? 'var(--success)' : 'var(--warning-dark)'}; background: ${formative.isEvaluasiLocked ? 'rgba(21, 128, 61, 0.08)' : 'rgba(217, 119, 6, 0.08)'}; border: 1px solid ${formative.isEvaluasiLocked ? 'rgba(21, 128, 61, 0.2)' : 'rgba(217, 119, 6, 0.2)'};">
                ${formative.isEvaluasiLocked ? 'Penilaian Resmi Terkunci' : 'Sesi Sedang Berjalan'}
              </span>
              <span id="progres-stack-chevron-1" class="progres-stack-chevron ${this.activeProgressStack === 1 ? 'expanded' : ''}">
                ${renderPixelIcon('arrow-down', 12, 'var(--text-secondary)')}
              </span>
            </div>
          </button>

          <div id="progres-stack-body-1" class="progres-stack-body" style="display: ${this.activeProgressStack === 1 ? 'block' : 'none'};">
            <!-- 3 Formative Pillars Scorecard Grid -->
            <div class="progres-scorecard-grid">
              <!-- Pilar 1: Nilai Telusur Logika -->
              <div class="progres-pillar-card tactile-card">
                <div>
                  <div class="progres-pillar-header">
                    <div class="progres-pillar-title">
                      ${renderPixelIcon('target', 13, 'var(--primary)')}
                      <span>1. Telusur Logika</span>
                    </div>
                    <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${formative.tracingScore >= 75 ? 'var(--success)' : 'var(--text-muted)'}; background: ${formative.tracingScore >= 75 ? 'rgba(21, 128, 61, 0.08)' : 'rgba(0,0,0,0.04)'}; border: 1px solid ${formative.tracingScore >= 75 ? 'rgba(21, 128, 61, 0.25)' : 'rgba(28, 25, 23, 0.1)'};">
                      ${formative.tracingScore >= 75 ? 'Tuntas (≥75)' : 'Perlu Penguatan'}
                    </span>
                  </div>
                  <div class="progres-pillar-score-row">
                    <span class="progres-pillar-score" style="color: var(--primary);">${formative.tracingScore}</span>
                    <span class="progres-pillar-denom">/ 100</span>
                  </div>
                </div>
                <div class="progres-pillar-meta">
                  ${StorageService.getTracingStars(formative.tracingScore, this.isCycle2Unlocked)} dari 2 Bintang • Meja Kerja Lab
                </div>
              </div>

              <!-- Pilar 2: Nilai Tantangan Tempur -->
              <div class="progres-pillar-card tactile-card">
                <div>
                  <div class="progres-pillar-header">
                    <div class="progres-pillar-title">
                      ${renderPixelIcon('swords', 13, 'var(--warning-dark)')}
                      <span>2. Tantangan Tempur</span>
                    </div>
                    <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${formative.battleScore >= 75 ? 'var(--success)' : 'var(--text-muted)'}; background: ${formative.battleScore >= 75 ? 'rgba(21, 128, 61, 0.08)' : 'rgba(0,0,0,0.04)'}; border: 1px solid ${formative.battleScore >= 75 ? 'rgba(21, 128, 61, 0.25)' : 'rgba(28, 25, 23, 0.1)'};">
                      ${formative.battleScore >= 75 ? 'Tuntas (≥75)' : 'Perlu Penguatan'}
                    </span>
                  </div>
                  <div class="progres-pillar-score-row">
                    <span class="progres-pillar-score" style="color: var(--warning-dark);">${formative.battleScore}</span>
                    <span class="progres-pillar-denom">/ 100</span>
                  </div>
                </div>
                <div class="progres-pillar-meta">
                  5 Ronde Simulasi Kota • Arena Boss Battle
                </div>
              </div>

              <!-- Pilar 3: Nilai Evaluasi Mandiri -->
              <div class="progres-pillar-card tactile-card">
                <div>
                  <div class="progres-pillar-header">
                    <div class="progres-pillar-title">
                      ${renderPixelIcon('document', 13, 'var(--accent)')}
                      <span>3. Evaluasi Mandiri</span>
                    </div>
                    <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${formative.evaluasiScore >= 75 ? 'var(--success)' : 'var(--text-muted)'}; background: ${formative.evaluasiScore >= 75 ? 'rgba(21, 128, 61, 0.08)' : 'rgba(0,0,0,0.04)'}; border: 1px solid ${formative.evaluasiScore >= 75 ? 'rgba(21, 128, 61, 0.25)' : 'rgba(28, 25, 23, 0.1)'};">
                      ${formative.evaluasiScore >= 75 ? 'Tuntas (≥75)' : 'Perlu Penguatan'}
                    </span>
                  </div>
                  <div class="progres-pillar-score-row">
                    <span class="progres-pillar-score" style="color: var(--accent);">${formative.evaluasiScore}</span>
                    <span class="progres-pillar-denom">/ 100</span>
                  </div>
                </div>
                <div class="progres-pillar-meta">
                  5 Soal Konseptual • Kuis Refleksi
                </div>
              </div>
            </div>

            <!-- Nilai Formatif Akhir & Analisis Diagnostik Pembelajaran -->
            <div class="progres-composite-card tactile-card">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                  <div style="font-family: var(--font-pixel); font-size: 10.5px; color: var(--primary); margin-bottom: 2px;">
                    NILAI FORMATIF AKHIR (TERBOBOT)
                  </div>
                  <div style="font-size: 11px; color: var(--text-secondary);">
                    Akumulasi terpadu 3 pilar instrumen pembelajaran
                  </div>
                </div>
                <div style="display: flex; align-items: baseline; gap: 6px;">
                  <span style="font-family: var(--font-code); font-size: 28px; font-weight: 900; color: var(--primary); font-variant-numeric: tabular-nums;">
                    ${formative.finalScore}
                  </span>
                  <span style="font-family: var(--font-code); font-size: 13px; color: var(--text-muted); font-weight: 700;">/ 100</span>
                  <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${formative.finalScore >= 75 ? 'var(--success)' : 'var(--text-secondary)'}; background: ${formative.finalScore >= 75 ? 'rgba(21, 128, 61, 0.08)' : 'var(--surface-panel-alt)'}; border: 1px solid ${formative.finalScore >= 75 ? 'rgba(21, 128, 61, 0.25)' : 'var(--border-subtle)'}; margin-left: 4px;">
                    KKTP: 75 • ${formative.finalScore >= 75 ? 'Tuntas' : 'Perlu Pendampingan'}
                  </span>
                </div>
              </div>
              <div style="height: 6px; background: rgba(28, 25, 23, 0.08); border-radius: 999px; overflow: hidden;">
                <div style="height: 100%; width: ${Math.min(100, formative.finalScore)}%; background: ${formative.finalScore >= 75 ? 'linear-gradient(90deg, var(--primary) 0%, #10B981 100%)' : 'var(--warning)'}; border-radius: 999px; transition: width 0.3s ease;"></div>
              </div>
              <div style="background: var(--surface-panel-alt); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 12px; margin-top: 2px;">
                <div style="font-size: 11px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                  ${renderPixelIcon('bulb', 13, 'var(--primary)')} Analisis Capaian Pembelajaran
                </div>
                <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.55; margin: 0;">
                  ${formative.finalScore >= 75
          ? 'Capaian formatif Anda telah melampaui Kriteria Ketercapaian Tujuan Pembelajaran (KKTP/KKM: 75). Pemahaman Anda dalam menelusuri logika kondisi percabangan dan menyelesaikan skenario kota telah terbukti solid.'
          : (formative.finalScore > 0
            ? `Nilai formatif Anda saat ini adalah ${formative.finalScore}/100. Anda masih dapat meningkatkan capaian dengan menyelesaikan kasus yang belum tuntas di Meja Kerja atau mengulang tantangan di Arena Tempur.`
            : 'Anda baru memulai sesi pembelajaran. Buka Meja Kerja Lab Telusur Kode untuk menelusuri kasus-kasus logika pertama Anda dan mengumpulkan poin formatif.'
          )
        }
                </p>
              </div>
            </div>

            <!-- Tombol Lanjut ke Stack 2 -->
            <div class="progres-advance-btn-box">
              <button id="btn-advance-progres-stack-1" type="button" class="game-btn game-btn-primary" style="font-size: 12px; min-height: 44px; padding: 0 18px; display: inline-flex; align-items: center; gap: 8px;">
                <span>Paham Capaian, Periksa Bukti Kasus &amp; Lencana</span>
                ${renderPixelIcon('arrow-right', 12, '#ffffff')}
              </button>
            </div>
          </div>
        </div>

        <!-- STACK 2: Portofolio Kasus & Lencana Prestasi -->
        <div id="progres-stack-card-2" class="progres-stack-card ${this.activeProgressStack === 2 ? 'active' : ''}">
          <button id="progres-stack-header-2" type="button" class="progres-stack-header" aria-expanded="${this.activeProgressStack === 2}">
            <div class="progres-stack-title-box">
              <span id="progres-stack-badge-2" class="progres-stack-num-badge">2</span>
              <div>
                <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
                  Portofolio Kasus &amp; Lencana Prestasi
                </div>
                <div style="font-size: 11px; color: var(--text-secondary);">
                  Rekam jejak 5 modul kasus malfungsi Kota Harmoni dan perolehan 3 lencana otentik.
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(15, 118, 110, 0.08); border: 1px solid rgba(15, 118, 110, 0.2);">
                ${completedCasesCount} dari ${activeModules.length} Kasus Tuntas
              </span>
              <span id="progres-stack-chevron-2" class="progres-stack-chevron ${this.activeProgressStack === 2 ? 'expanded' : ''}">
                ${renderPixelIcon('arrow-down', 12, 'var(--text-secondary)')}
              </span>
            </div>
          </button>

          <div id="progres-stack-body-2" class="progres-stack-body" style="display: ${this.activeProgressStack === 2 ? 'block' : 'none'};">
            <!-- Sub-toggle Tabs Navigasi Kasus vs Lencana -->
            <div class="progres-sub-toggle-tabs">
              <button id="btn-progres-sub-modules" type="button" class="game-btn ${this.progressPortfolioSubTab === 'MODULES' ? 'game-btn-primary' : 'game-btn-secondary'} progres-sub-toggle-btn">
                ${renderPixelIcon('book', 12, 'currentColor')}
                <span>Modul Kasus Logika (${CASE_MODULES.length})</span>
              </button>
              <button id="btn-progres-sub-badges" type="button" class="game-btn ${this.progressPortfolioSubTab === 'BADGES' ? 'game-btn-primary' : 'game-btn-secondary'} progres-sub-toggle-btn">
                ${renderPixelIcon('trophy', 12, 'currentColor')}
                <span>3 Lencana Prestasi Otentik</span>
              </button>
            </div>

            <!-- VIEW A: MODUL KASUS LOGIKA -->
            <div id="progres-sub-view-modules" style="display: ${this.progressPortfolioSubTab === 'MODULES' ? 'flex' : 'none'}; flex-direction: column; gap: 10px;">
              ${CASE_MODULES.map((m, idx) => {
        const isLocked = m.cycleRequired === 2 && !this.isCycle2Unlocked;
        const prog = this.allModuleProgress[m.id];
        const stars = prog?.stars || 0;
        const isCaseC1 = m.cycleRequired === 1;
        const isCaseC2 = m.cycleRequired === 2;
        const isDone = (prog?.testedBranches?.length || 0) >= 1 || !!prog?.isCompleted;

        let weightText = '';
        let statusSubText = '';

        if (this.isCycle2Unlocked) {
          // KONDISI B: SIKLUS 2 AKTIF
          if (isCaseC1) {
            weightText = 'Prasyarat Tuntas (0 Poin)';
            statusSubText = '<span style="color: var(--success); font-weight: 600;">Materi Prasyarat Siklus 1</span>';
          } else {
            weightText = 'Bobot: <strong>50 Poin</strong>';
            statusSubText = `Status: <span style="color: ${isDone ? 'var(--success)' : 'var(--text-muted)'}; font-weight: 600;">${isDone ? 'Tuntas Diuji' : 'Belum Diuji'}</span>`;
          }
        } else {
          // KONDISI A: SIKLUS 1 AKTIF
          if (isCaseC2) {
            weightText = 'Terkunci: Siklus 2';
            statusSubText = 'Memerlukan Token Kelas dari Guru';
          } else {
            const c1Weight = idx < 2 ? 30 : 40;
            weightText = `Bobot: <strong>${c1Weight} Poin</strong>`;
            statusSubText = `Status: <span style="color: ${isDone ? 'var(--success)' : 'var(--text-muted)'}; font-weight: 600;">${isDone ? 'Tuntas Diselesaikan' : 'Belum Diuji'}</span>`;
          }
        }

        return `
                  <div class="pixel-card-alt" style="padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; ${this.isCycle2Unlocked && isCaseC1 ? 'opacity: 0.75; background: var(--surface-panel-alt);' : ''}">
                    <div>
                      <div style="font-family: var(--font-pixel); font-size: 10px; color: ${isLocked ? 'var(--text-muted)' : (this.isCycle2Unlocked && isCaseC1 ? 'var(--text-secondary)' : 'var(--primary)')}; margin-bottom: 2px;">
                        ${isLocked ? '[TERKUNCI] ' : (this.isCycle2Unlocked && isCaseC1 ? '[PRASYARAT] ' : '')}KASUS ${idx + 1}: ${m.title}
                      </div>
                      <div style="font-size: 12px; color: var(--text-secondary);">
                        ${weightText} • ${statusSubText}
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      ${!isLocked ? `
                      <span style="display: inline-flex; align-items: center; gap: 3px;">
                        ${renderPixelIcon('star', 12, stars >= 1 ? 'var(--warning)' : 'var(--text-muted)')}
                        ${renderPixelIcon('star', 12, stars >= 2 ? 'var(--warning)' : 'var(--text-muted)')}
                      </span>
                      <button type="button" class="game-btn ${this.isCycle2Unlocked && isCaseC1 ? 'game-btn-secondary' : 'game-btn-primary'} btn-open-module-case" data-id="${m.id}" style="font-size: 11px; padding: 6px 12px; min-height: 40px;">
                        ${this.isCycle2Unlocked && isCaseC1 ? 'Tinjau Kasus' : 'Buka Kasus'}
                      </button>
                      ` : `
                      <button type="button" class="game-btn game-btn-gold btn-token-module-case" data-id="${m.id}" style="font-size: 11px; padding: 6px 12px; min-height: 40px; display: inline-flex; align-items: center; gap: 6px;">
                        ${renderPixelIcon('lock', 11, '#ffffff')} Masukkan Token
                      </button>
                      `}
                    </div>
                  </div>
                `;
      }).join('')}
            </div>

            <!-- VIEW B: 3 LENCANA PRESTASI OTENTIK -->
            <div id="progres-sub-view-badges" class="badge-showcase-grid" style="display: ${this.progressPortfolioSubTab === 'BADGES' ? 'grid' : 'none'};">
              ${(() => {
        const hasCompletedAny = Object.values(this.allModuleProgress).some((p) => p.isCompleted);
        const isLencana2Unlocked = (this.allModuleProgress['m01']?.stars || 0) >= 2;
        return `
                <!-- Lencana 1: Mengenal If-Else -->
                <div class="badge-showcase-tile tactile-card" title="${hasCompletedAny ? 'Lencana Terbuka: Selesai mempelajari konsep dasar percabangan logika' : 'Lencana Terkunci: Selesaikan minimal 1 modul kasus logika'}">
                  <div class="badge-tile-img-frame">
                    <img src="/assets/images/badge_gold.svg" alt="Lencana Emas" style="width: 60px; height: 60px; ${!hasCompletedAny ? 'opacity: 0.45; filter: grayscale(0.85);' : ''}" />
                  </div>
                  <div class="badge-tile-title">
                    Mengenal If-Else
                  </div>
                  <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${hasCompletedAny ? 'var(--success)' : 'var(--text-muted)'}; background: ${hasCompletedAny ? 'rgba(21, 128, 61, 0.08)' : 'rgba(0,0,0,0.04)'}; border: 1px solid ${hasCompletedAny ? 'rgba(21, 128, 61, 0.25)' : 'rgba(28, 25, 23, 0.1)'};">
                    ${hasCompletedAny ? 'Terbuka • Tuntas' : 'Terkunci • Modul 1'}
                  </span>
                  <p class="badge-tile-desc">
                    Tuntas mempelajari konsep dasar percabangan logika dan evaluasi kondisi boolean.
                  </p>
                </div>

                <!-- Lencana 2: Penjelajah Logika -->
                <div class="badge-showcase-tile tactile-card" title="${isLencana2Unlocked ? 'Lencana Terbuka: Berhasil menguji kedua cabang IF dan ELSE pada Kasus 1' : 'Lencana Terkunci: Tuntaskan Kasus 1 hingga mendapatkan Bintang 2'}">
                  <div class="badge-tile-img-frame">
                    <img src="/assets/images/badge_compass.svg" alt="Lencana Kompas" style="width: 60px; height: 60px; ${!isLencana2Unlocked ? 'opacity: 0.45; filter: grayscale(0.85);' : ''}" />
                  </div>
                  <div class="badge-tile-title">
                    Penjelajah Logika
                  </div>
                  <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${isLencana2Unlocked ? 'var(--primary)' : 'var(--text-muted)'}; background: ${isLencana2Unlocked ? 'rgba(15, 118, 110, 0.08)' : 'rgba(0,0,0,0.04)'}; border: 1px solid ${isLencana2Unlocked ? 'rgba(15, 118, 110, 0.25)' : 'rgba(28, 25, 23, 0.1)'};">
                    ${isLencana2Unlocked ? 'Terbuka • Bintang 2' : 'Terkunci • Bintang 2 Kasus 1'}
                  </span>
                  <p class="badge-tile-desc">
                    Berhasil menguji semua jalur kondisi kode (IF dan ELSE) secara komprehensif pada Kasus 1.
                  </p>
                </div>

                <!-- Lencana 3: Master Kondisi -->
                <div class="badge-showcase-tile tactile-card" style="${this.isCycle2Unlocked ? 'border-color: rgba(217, 119, 6, 0.3);' : ''}" title="${this.isCycle2Unlocked ? 'Lencana Terbuka: Menjelajahi tantangan percabangan bertingkat Siklus 2' : 'Lencana Terkunci: Masukkan Token Siklus 2 dari Guru'}">
                  <div class="badge-tile-img-frame">
                    <img src="/assets/images/badge_lock.svg" alt="Lencana Gembok" style="width: 60px; height: 60px; ${!this.isCycle2Unlocked ? 'opacity: 0.65;' : ''}" />
                  </div>
                  <div class="badge-tile-title">
                    Master Kondisi
                  </div>
                  <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${this.isCycle2Unlocked ? 'var(--warning-dark)' : 'var(--text-muted)'}; background: ${this.isCycle2Unlocked ? 'rgba(217, 119, 6, 0.08)' : 'rgba(0,0,0,0.04)'}; border: 1px solid ${this.isCycle2Unlocked ? 'rgba(217, 119, 6, 0.25)' : 'rgba(28, 25, 23, 0.1)'};">
                    ${this.isCycle2Unlocked ? 'Terbuka • Siklus 2' : 'Terkunci • Siklus 2'}
                  </span>
                  <p class="badge-tile-desc">
                    Selesaikan kasus percabangan bertingkat dan operator logika ganda di Siklus 2.
                  </p>
                  ${!this.isCycle2Unlocked ? `
                    <button id="btn-token-progress" type="button" class="game-btn game-btn-gold" style="font-size: 10.5px; padding: 6px 12px; min-height: 40px; display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; margin-top: auto;">
                      ${renderPixelIcon('lock', 11, '#ffffff')} Masukkan Token
                    </button>
                  ` : ''}
                </div>
              `;
      })()}
            </div>

            <!-- Tombol Lanjut ke Stack 3 -->
            <div class="progres-advance-btn-box">
              <button id="btn-advance-progres-stack-2" type="button" class="game-btn game-btn-primary" style="font-size: 12px; min-height: 44px; padding: 0 18px; display: inline-flex; align-items: center; gap: 8px;">
                <span>Lanjut ke Evaluasi Akhir &amp; Kirim Laporan</span>
                ${renderPixelIcon('arrow-right', 12, '#ffffff')}
              </button>
            </div>
          </div>
        </div>

        <!-- STACK 3: Evaluasi Akhir & Pengiriman Laporan ke Guru -->
        <div id="progres-stack-card-3" class="progres-stack-card ${this.activeProgressStack === 3 ? 'active' : ''}">
          <button id="progres-stack-header-3" type="button" class="progres-stack-header" aria-expanded="${this.activeProgressStack === 3}">
            <div class="progres-stack-title-box">
              <span id="progres-stack-badge-3" class="progres-stack-num-badge">3</span>
              <div>
                <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
                  Evaluasi Akhir &amp; Pengiriman Laporan ke Guru
                </div>
                <div style="font-size: 11px; color: var(--text-secondary);">
                  Instrumen evaluasi kognitif Posttest resmi dan pengiriman digital 1-klik ke Google Drive Guru.
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${this.lastCloudUploadResult?.success ? 'var(--success)' : 'var(--primary)'}; background: ${this.lastCloudUploadResult?.success ? 'rgba(21, 128, 61, 0.08)' : 'rgba(15, 118, 110, 0.08)'}; border: 1px solid ${this.lastCloudUploadResult?.success ? 'rgba(21, 128, 61, 0.2)' : 'rgba(15, 118, 110, 0.2)'};">
                ${this.lastCloudUploadResult?.success ? 'Laporan Terkirim' : '1-Klik Cloud Upload'}
              </span>
              <span id="progres-stack-chevron-3" class="progres-stack-chevron ${this.activeProgressStack === 3 ? 'expanded' : ''}">
                ${renderPixelIcon('arrow-down', 12, 'var(--text-secondary)')}
              </span>
            </div>
          </button>

          <div id="progres-stack-body-3" class="progres-stack-body" style="display: ${this.activeProgressStack === 3 ? 'block' : 'none'};">
            
            <!-- 3A: Pengiriman Hasil Progres ke Google Drive Guru (Langkah 1 • Wajib Dilakukan Terlebih Dahulu) -->
            <div class="tactile-card" style="padding: 18px 20px; background: #ffffff; border: 1.5px solid var(--primary); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04); margin-bottom: 16px;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                <div style="font-family: var(--font-pixel); font-size: 11px; color: var(--primary); display: flex; align-items: center; gap: 7px;">
                  ${renderPixelIcon('upload', 13, 'var(--primary)')} Langkah 1: Kirim Bukti Belajar ke Guru
                </div>
                <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(15, 118, 110, 0.08); border: 1px solid rgba(15, 118, 110, 0.2);">
                  Tujuan: Google Drive Siklus ${this.isCycle2Unlocked ? '2' : '1'} Sekolah Kota Harmoni
                </span>
              </div>
              
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.6;">
                Kirimkan laporan hasil belajar formatif kamu langsung ke folder Google Drive Guru hanya dengan <strong>1 kali sentuh</strong>. Seluruh rekaman nilai 3 pilar dan portofolio kasus akan diamankan di cloud dan dicadangkan ke perangkat murid sebelum mengerjakan Posttest.
              </p>

              ${this.lastCloudUploadResult ? (this.lastCloudUploadResult.success ? `
                <!-- Status Konfirmasi Mint Sage (Laporan Terkirim) -->
                <div class="cloud-upload-mint-banner">
                  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                    <span style="font-family: var(--font-code); font-size: 12px; font-weight: 700; color: var(--success); display: inline-flex; align-items: center; gap: 6px;">
                      ${renderPixelIcon('check', 14, 'var(--success)')}
                      ${this.lastCloudUploadResult.isUpdated ? 'Laporan Berhasil Diperbarui di Drive Guru' : 'Laporan Berhasil Terkirim ke Drive Guru'}
                    </span>
                    <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--success); background: #ffffff; border: 1px solid rgba(16, 185, 129, 0.4);">
                      Tersimpan di Cloud
                    </span>
                  </div>
                  <div style="font-size: 12px; color: var(--text-primary); line-height: 1.55;">
                    ${this.lastCloudUploadResult.message}
                  </div>
                  <div style="font-family: var(--font-code); font-size: 11px; color: var(--text-secondary); display: flex; flex-wrap: wrap; gap: 12px; padding: 6px 0; border-top: 1px dashed rgba(16, 185, 129, 0.25); border-bottom: 1px dashed rgba(16, 185, 129, 0.25);">
                    <span>Waktu Kirim: <strong style="color: var(--text-primary);">${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</strong></span>
                    <span>Berkas: <strong style="color: var(--primary);">${this.lastCloudUploadResult.filename}</strong></span>
                    ${this.lastCloudUploadResult.folderName ? `<span>Folder: <strong>${this.lastCloudUploadResult.folderName}</strong></span>` : ''}
                  </div>
                  ${this.lastCloudUploadResult.fileUrl ? `
                    <div style="margin-top: 4px;">
                      <a href="${this.lastCloudUploadResult.fileUrl}" target="_blank" rel="noopener noreferrer" class="game-btn game-btn-secondary" style="font-size: 11px; padding: 8px 14px; min-height: 44px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                        ${renderPixelIcon('drive', 12, 'currentColor')} <span>Buka Berkas di Google Drive Guru</span>
                      </a>
                    </div>
                  ` : ''}
                </div>
              ` : `
                <!-- Kartu Bantuan Darurat: Transmisi Cloud Terkendala -->
                <div class="tactile-card" style="padding: 14px 16px; margin-bottom: 14px; border-radius: 10px; background: rgba(217, 119, 6, 0.08); border: 1.5px solid var(--warning); display: flex; flex-direction: column; gap: 8px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                    <span style="font-family: var(--font-code); font-size: 11.5px; font-weight: 700; color: var(--warning-dark); display: inline-flex; align-items: center; gap: 6px;">
                      ${renderPixelIcon('target', 13, 'var(--warning-dark)')}
                      Bantuan Darurat: Transmisi Cloud Terkendala
                    </span>
                    <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--warning-dark); background: #ffffff; border: 1px solid var(--warning);">
                      Cadangan Lokal Tersimpan
                    </span>
                  </div>
                  <div style="font-size: 11.5px; color: var(--text-primary); line-height: 1.55;">
                    ${this.lastCloudUploadResult.message}
                  </div>
                  <div style="font-family: var(--font-code); font-size: 10.5px; color: var(--text-secondary); display: flex; flex-wrap: wrap; gap: 10px; margin-top: 2px;">
                    <span>Berkas: <strong style="color: var(--primary);">${this.lastCloudUploadResult.filename}</strong></span>
                    ${this.lastCloudUploadResult.folderName ? `<span>• Folder: <strong>${this.lastCloudUploadResult.folderName}</strong></span>` : ''}
                  </div>
                  <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgba(217, 119, 6, 0.3); display: flex; flex-wrap: wrap; gap: 8px;">
                    <a href="${escapeHtml(sanitizeWebUrl(currentDriveUrl))}" target="_blank" rel="noopener noreferrer" class="game-btn game-btn-gold" style="min-height: 44px; font-size: 11px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" title="Buka Halaman Folder Google Drive Guru & Unggah Manual">
                      ${renderPixelIcon('drive', 13, '#ffffff')} Buka Folder Drive Guru &amp; Unggah Manual
                    </a>
                    <button type="button" class="game-btn game-btn-secondary btn-copy-clip-action" style="min-height: 44px; font-size: 11px; font-weight: 600; gap: 6px;" title="Salin seluruh isi ringkasan laporan belajar ke papan klip">
                      ${renderPixelIcon('document', 13, 'currentColor')} Salin Ringkasan Laporan ke Papan Klip
                    </button>
                  </div>
                </div>
              `) : ''}

              <!-- Ringkasan Identitas Pengiriman Laporan -->
              <div style="background: var(--surface-panel-alt); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
                  <span style="font-size: 11px; font-weight: 700; color: var(--text-primary);">
                    Identitas Berkas Laporan (.txt):
                  </span>
                  <code style="font-family: var(--font-code); color: var(--primary); font-size: 11px; background: rgba(15, 118, 110, 0.08); padding: 2px 6px; border-radius: 4px;">
                    ${expectedFilename}
                  </code>
                </div>
                <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
                  Target: <strong>Folder Google Drive Siklus ${this.isCycle2Unlocked ? '2' : '1'} Sekolah Kota Harmoni</strong> • Memuat nilai akumulasi pilar telusur modul, tantangan battle, dan kuis evaluasi formatif.
                </p>
              </div>

              <!-- Tombol Aksi Pengiriman -->
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <button id="btn-direct-upload-drive" type="button" class="game-btn game-btn-primary" style="width: 100%; min-height: 50px; gap: 10px; font-size: 13px; font-weight: 700; background: var(--primary); border: 1.5px solid var(--primary-dark);" ${this.isCloudUploading ? 'disabled' : ''}>
                  ${this.isCloudUploading
        ? `${renderPixelIcon('refresh', 16, '#ffffff')} <span>Sedang Mengirim ke Google Drive Guru...</span>`
        : `${renderPixelIcon('upload', 16, '#ffffff')} <span>Kirim Laporan Langsung ke Drive Guru (1-Klik)</span>`
      }
                </button>
                <div style="font-size: 10.5px; color: var(--text-muted); text-align: center; margin-top: -4px;">
                  1-Klik otomatis: laporan terkirim ke Google Drive Guru &amp; salinan cadangan tersimpan di perangkat murid.
                </div>

                <!-- Pilihan Cadangan Darurat: Folder Drive, Salin Papan Klip, & Unduh Teks Manual -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 8px; margin-top: 4px;">
                  <a id="btn-open-drive-folder" href="${escapeHtml(sanitizeWebUrl(currentDriveUrl))}" target="_blank" rel="noopener noreferrer" class="game-btn game-btn-gold" style="min-height: 44px; font-size: 11px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" title="Buka Halaman Folder Google Drive Guru & Unggah Manual">
                    ${renderPixelIcon('drive', 13, '#ffffff')} Buka Folder Drive Guru &amp; Unggah Manual
                  </a>
                  <button id="btn-copy-report-clip" type="button" class="game-btn game-btn-secondary btn-copy-clip-action" style="min-height: 44px; font-size: 11px; gap: 6px;" title="Salin ringkasan laporan hasil belajar ke papan klip">
                    ${renderPixelIcon('document', 13, 'currentColor')} Salin Ringkasan Laporan ke Papan Klip
                  </button>
                  <button id="btn-download-txt" type="button" class="game-btn game-btn-secondary" style="min-height: 44px; font-size: 11px; gap: 6px;" title="Unduh berkas cadangan laporan teks formatif ke perangkat">
                    ${renderPixelIcon('save', 13, 'currentColor')} Unduh Berkas .txt Cadangan
                  </button>
                </div>
              </div>
            </div>

            <!-- 3B: Jembatan Evaluasi Resmi PTK (Posttest Pembelajaran Dinamis) -->
            <div class="tactile-card" style="padding: 16px 18px; margin-bottom: 16px; border: 1px solid var(--border-subtle); border-radius: 12px; background: linear-gradient(135deg, rgba(15, 118, 110, 0.04) 0%, rgba(21, 128, 61, 0.03) 100%);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: rgba(15, 118, 110, 0.12);">
                    ${renderPixelIcon('document', 14, 'var(--primary)')}
                  </span>
                  <div>
                    <div style="font-family: var(--font-ui); font-size: 13px; font-weight: 700; color: var(--text-primary);">
                      Langkah 2: Posttest Pembelajaran (${this.isCycle2Unlocked ? 'Form C' : 'Form B'})
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary);">
                      Instrumen evaluasi pemahaman konsep logika percabangan (${this.isCycle2Unlocked ? 'Instrumen Form C Siklus 2' : 'Instrumen Form B Siklus 1'})
                    </div>
                  </div>
                </div>
                <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); background: #ffffff; border: 1px solid var(--primary);">
                  ${this.isCycle2Unlocked ? 'Form C Siklus 2' : 'Form B Siklus 1'}
                </span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.55; margin-bottom: 12px;">
                Setelah bukti laporan formatif berhasil terkirim ke Google Drive Guru pada Langkah 1 di atas, silakan buka dan selesaikan lembar Posttest Pembelajaran secara mandiri pada perangkat kamu.
              </p>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a href="${escapeHtml(sanitizeWebUrl(StorageService.getPosttestUrlSync(this.isCycle2Unlocked ? 2 : 1)) || (this.isCycle2Unlocked ? POSTTEST_CYCLE_URLS[2]! : POSTTEST_CYCLE_URLS[1]!))}" target="_blank" rel="noopener noreferrer" class="game-btn game-btn-primary" style="font-size: 12px; min-height: 44px; padding: 0 16px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px;" title="Buka Lembar Posttest Pembelajaran (${this.isCycle2Unlocked ? 'Form C' : 'Form B'}) di Tab Baru">
                  ${renderPixelIcon('document', 13, '#ffffff')}
                  <span>Buka Lembar Posttest Pembelajaran (${this.isCycle2Unlocked ? 'Form C' : 'Form B'})</span>
                  ${renderPixelIcon('arrow-right', 11, '#ffffff')}
                </a>
              </div>

              ${this.isCycle2Unlocked ? `
                <div style="margin-top: 12px; padding: 12px 14px; background: rgba(15, 118, 110, 0.05); border: 1px dashed var(--primary); border-radius: 8px; display: flex; align-items: flex-start; gap: 10px;">
                  <span style="flex-shrink: 0; margin-top: 2px;">
                    ${renderPixelIcon('chat', 14, 'var(--primary)')}
                  </span>
                  <div style="font-size: 11.5px; color: var(--text-primary); line-height: 1.5;">
                    <strong style="color: var(--primary);">Pesan dari Guru Pak Budi:</strong> Setelah kamu menyelesaikan Posttest Pembelajaran (Form C) di atas, silakan temui guru untuk membuka aplikasi khusus pengisian angket persepsi media pembelajaran. Tetap semangat, petualang logika!
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- 3C: Penutup Pembelajaran & Navigasi Selesai -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding-top: 10px; border-top: 1px dashed var(--border-subtle);">
              <span style="font-size: 11px; color: var(--text-muted);">
                Semua tahapan evaluasi dan sinkronisasi laporan telah siap.
              </span>
              <button id="btn-progres-finish-overworld" type="button" class="game-btn game-btn-secondary" style="min-height: 44px; font-size: 11.5px; gap: 8px;">
                ${renderPixelIcon('map', 13, 'currentColor')} <span>Kembali ke Peta Kota Harmoni</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    `;

    // Event listeners & Progressive Disclosure Stepper Logic
    const progressFill = container.querySelector<HTMLElement>('#progres-progress-fill');
    const progressText = container.querySelector<HTMLElement>('#progres-progress-text');

    const stackCards = [
      container.querySelector<HTMLElement>('#progres-stack-card-1'),
      container.querySelector<HTMLElement>('#progres-stack-card-2'),
      container.querySelector<HTMLElement>('#progres-stack-card-3'),
    ];
    const stackBodies = [
      container.querySelector<HTMLElement>('#progres-stack-body-1'),
      container.querySelector<HTMLElement>('#progres-stack-body-2'),
      container.querySelector<HTMLElement>('#progres-stack-body-3'),
    ];
    const stackBadges = [
      container.querySelector<HTMLElement>('#progres-stack-badge-1'),
      container.querySelector<HTMLElement>('#progres-stack-badge-2'),
      container.querySelector<HTMLElement>('#progres-stack-badge-3'),
    ];
    const stackChevrons = [
      container.querySelector<HTMLElement>('#progres-stack-chevron-1'),
      container.querySelector<HTMLElement>('#progres-stack-chevron-2'),
      container.querySelector<HTMLElement>('#progres-stack-chevron-3'),
    ];
    const stepperPills = [
      container.querySelector<HTMLButtonElement>('#progres-stepper-pill-1'),
      container.querySelector<HTMLButtonElement>('#progres-stepper-pill-2'),
      container.querySelector<HTMLButtonElement>('#progres-stepper-pill-3'),
    ];

    const updateStackViews = (targetStack: 1 | 2 | 3, shouldScroll = false) => {
      this.activeProgressStack = targetStack;
      const isComplete = this.maxUnlockedProgressStack === 3 && hasPriorWork;

      // Update Stepper Bar
      const percent = isComplete ? 100 : Math.round((this.activeProgressStack / 3) * 100);
      if (progressFill) progressFill.style.width = `${percent}%`;
      if (progressText) {
        progressText.textContent = isComplete
          ? 'Portofolio Lengkap (100% Siap)'
          : `Tahap ${this.activeProgressStack} dari 3 • ${percent}% Ditinjau`;
      }

      for (let i = 1; i <= 3; i++) {
        const idx = i - 1;
        const c = stackCards[idx];
        const body = stackBodies[idx];
        const badge = stackBadges[idx];
        const chevron = stackChevrons[idx];
        const pill = stepperPills[idx];

        if (!c || !body || !badge || !chevron || !pill) continue;

        const isUnlocked = i <= this.maxUnlockedProgressStack || hasPriorWork;
        const isOpen = i === this.activeProgressStack;
        const isCompleted = (i < this.maxUnlockedProgressStack) || hasPriorWork;

        // Card classes
        c.classList.toggle('active', isOpen);
        c.classList.toggle('locked', !isUnlocked);
        c.classList.toggle('completed', isCompleted && !isOpen);

        // Body display
        body.style.display = isOpen ? 'block' : 'none';

        // Badge styling
        badge.style.backgroundColor = isOpen
          ? 'var(--primary)'
          : (isCompleted ? 'var(--success)' : 'var(--surface-panel-alt)');
        badge.style.color = (isOpen || isCompleted) ? '#ffffff' : 'var(--text-secondary)';
        badge.style.borderColor = isOpen
          ? 'var(--primary)'
          : (isCompleted ? 'var(--success)' : 'var(--border-subtle)');

        // Chevron
        chevron.classList.toggle('expanded', isOpen);

        // Stepper pill
        pill.classList.remove('active', 'completed', 'locked');
        if (isOpen) {
          pill.classList.add('active');
        } else if (isCompleted) {
          pill.classList.add('completed');
        } else if (!isUnlocked) {
          pill.classList.add('locked');
        }
      }

      if (shouldScroll) {
        const activeCard = stackCards[targetStack - 1];
        if (activeCard) {
          activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };

    // Accordion Header Click Handler
    [1, 2, 3].forEach((num) => {
      const stackNum = num as 1 | 2 | 3;
      const index = num - 1;
      const headerBtn = container.querySelector<HTMLButtonElement>(`#progres-stack-header-${num}`);

      headerBtn?.addEventListener('click', () => {
        const isUnlocked = stackNum <= this.maxUnlockedProgressStack || hasPriorWork;
        if (!isUnlocked) {
          soundFx.playLogicFalse();
          const cardEl = stackCards[index];
          if (cardEl) {
            cardEl.classList.add('shake-anim');
            setTimeout(() => cardEl.classList.remove('shake-anim'), 400);
          }
          this.showRetroToast('Selesaikan dan pahami tahapan progres sebelumnya terlebih dahulu.', false);
          return;
        }

        soundFx.playButtonBlip();
        if (this.activeProgressStack === stackNum) {
          const body = stackBodies[index];
          const chevron = stackChevrons[index];
          if (body && chevron) {
            const isCurrentlyOpen = body.style.display !== 'none';
            body.style.display = isCurrentlyOpen ? 'none' : 'block';
            chevron.classList.toggle('expanded', !isCurrentlyOpen);
          }
        } else {
          updateStackViews(stackNum, true);
        }
      });

      // Stepper Pill Click Handler
      const pillBtn = stepperPills[index];
      pillBtn?.addEventListener('click', () => {
        const isUnlocked = stackNum <= this.maxUnlockedProgressStack || hasPriorWork;
        if (!isUnlocked) {
          soundFx.playLogicFalse();
          const cardEl = stackCards[index];
          if (cardEl) {
            cardEl.classList.add('shake-anim');
            setTimeout(() => cardEl.classList.remove('shake-anim'), 400);
          }
          this.showRetroToast('Selesaikan dan pahami tahapan progres sebelumnya terlebih dahulu.', false);
          return;
        }

        soundFx.playButtonBlip();
        updateStackViews(stackNum, true);
      });
    });

    // Advance button dari Stack 1 ke Stack 2
    container.querySelector('#btn-advance-progres-stack-1')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      if (this.maxUnlockedProgressStack < 2) {
        this.maxUnlockedProgressStack = 2;
      }
      updateStackViews(2, true);
    });

    // Advance button dari Stack 2 ke Stack 3
    container.querySelector('#btn-advance-progres-stack-2')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      if (this.maxUnlockedProgressStack < 3) {
        this.maxUnlockedProgressStack = 3;
      }
      updateStackViews(3, true);
    });

    // Sub-toggle Navigation Kasus vs Lencana di Stack 2
    const btnSubModules = container.querySelector<HTMLButtonElement>('#btn-progres-sub-modules');
    const btnSubBadges = container.querySelector<HTMLButtonElement>('#btn-progres-sub-badges');
    const viewSubModules = container.querySelector<HTMLElement>('#progres-sub-view-modules');
    const viewSubBadges = container.querySelector<HTMLElement>('#progres-sub-view-badges');

    btnSubModules?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.progressPortfolioSubTab = 'MODULES';
      btnSubModules.classList.replace('game-btn-secondary', 'game-btn-primary');
      btnSubBadges?.classList.replace('game-btn-primary', 'game-btn-secondary');
      if (viewSubModules) viewSubModules.style.display = 'flex';
      if (viewSubBadges) viewSubBadges.style.display = 'none';
    });

    btnSubBadges?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.progressPortfolioSubTab = 'BADGES';
      btnSubBadges.classList.replace('game-btn-secondary', 'game-btn-primary');
      btnSubModules?.classList.replace('game-btn-primary', 'game-btn-secondary');
      if (viewSubModules) viewSubModules.style.display = 'none';
      if (viewSubBadges) viewSubBadges.style.display = 'grid';
    });

    // Token Modal di Badge / Modul
    container.querySelector('#btn-token-progress')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.showStudentTokenModal();
    });

    container.querySelectorAll<HTMLButtonElement>('.btn-open-module-case').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundFx.playButtonBlip();
        const modId = btn.dataset.id;
        if (!modId) return;
        const found = CASE_MODULES.find(m => m.id === modId);
        if (found && this.isCycle2Unlocked && found.cycleRequired === 1) {
          soundFx.playLogicFalse();
          this.showRetroToast(
            'Kasus ini merupakan materi prasyarat Siklus 1. Fokuskan penyelidikanmu pada Kasus 4 dan Kasus 5!',
            false
          );
          return;
        }
        this.selectModuleAndGoTracing(modId);
      });
    });

    container.querySelectorAll<HTMLButtonElement>('.btn-token-module-case').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundFx.playButtonBlip();
        const modId = btn.dataset.id;
        this.showStudentTokenModal(modId);
      });
    });

    // Handler 1-Klik Kirim Langsung ke Google Drive Guru
    const directUploadBtn = container.querySelector<HTMLButtonElement>('#btn-direct-upload-drive');
    directUploadBtn?.addEventListener('click', async () => {
      soundFx.playButtonBlip();
      this.isCloudUploading = true;
      this.render();

      try {
        const result = await AssessmentExportService.uploadDirectToDrive(
          undefined,
          undefined,
          (status, details) => {
            if (status === 'saving_local') {
              this.showRetroToast('Menyimpan cadangan ke perangkat...', true);
            } else if (status === 'retrying') {
              this.showRetroToast(details?.message || 'Mencoba kirim ulang...', false);
            }
          }
        );
        this.lastCloudUploadResult = result;
        if (result.success) {
          soundFx.playVictoryFanfare();
          this.showRetroToast(result.message, true);
        } else {
          soundFx.playLogicFalse();
          this.showRetroToast(result.message, false);
        }
      } catch {
        soundFx.playLogicFalse();
        this.showRetroToast('Terjadi kendala saat mengirim laporan ke Google Drive.', false);
      } finally {
        this.isCloudUploading = false;
        this.render();
      }
    });

    container.querySelector('#btn-open-drive-folder')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
    });

    container.querySelectorAll<HTMLButtonElement>('.btn-copy-clip-action').forEach((btn) => {
      btn.addEventListener('click', async () => {
        soundFx.playButtonBlip();
        try {
          const { content } = await AssessmentExportService.generateTextData();
          await navigator.clipboard.writeText(content);
          this.showRetroToast('Ringkasan laporan berhasil disalin ke papan klip!', true);
        } catch {
          this.showRetroToast('Gagal menyalin ke papan klip secara otomatis.', false);
        }
      });
    });

    container.querySelector('#btn-download-txt')?.addEventListener('click', async () => {
      soundFx.playButtonBlip();
      const { filename, content } = await AssessmentExportService.generateTextData();
      AssessmentExportService.triggerLocalDownload(filename, content);
      this.showRetroToast(`Berkas laporan ${filename} berhasil diunduh ke perangkat.`, true);
    });

    // Tombol Selesai & Kembali ke Overworld Peta Utama
    container.querySelector('#btn-progres-finish-overworld')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.setScreen('OVERWORLD');
    });

    return container;
  }

  // =================================================================
  // Layar 10: Pengaturan & Preferensi Sistem
  // =================================================================
  private renderScreenSettings(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'pixel-card';
    card.style.cssText = `padding: 16px;`;

    const isMuted = soundFx.getMuteState();
    const currentVol = Math.round(soundFx.getMasterVolume() * 500);

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <span style="font-family: var(--font-pixel); font-size: 11px; color: var(--brand-cyan);">
          Pengaturan &amp; Preferensi Sistem
        </span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Pengaturan Musik Latar (BGM) -->
        <div class="pixel-card-alt" style="padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-family: var(--font-code); font-size: 12px; font-weight: bold; display: flex; align-items: center; gap: 6px; color: var(--primary);">
              ${renderPixelIcon('music', 14, 'var(--primary)')} Musik Latar (Backsound)
            </div>
            <span class="badge-pill" style="font-size: 10px; padding: 2px 8px;">
              ${soundFx.isBgmActive() ? 'Sedang Diputar' : 'Nonaktif'}
            </span>
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
            Dengarkan musik petualangan retro santai saat belajar dan menelusuri alur kode program.
          </p>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="font-size: 11px; color: var(--text-muted); width: 60px;">Volume:</span>
            <input id="slider-bgm-volume" type="range" min="0" max="100" value="${soundFx.getBgmVolume()}" style="flex: 1;" />
            <span id="bgm-vol-label" style="font-family: var(--font-code); font-size: 12px; width: 40px;">${soundFx.getBgmVolume()}%</span>
          </div>
          <button id="btn-toggle-bgm-settings" type="button" class="game-btn ${soundFx.isBgmActive() ? 'game-btn-secondary' : 'game-btn-primary'}" style="min-height: 44px; width: 100%; gap: 8px;">
            ${renderPixelIcon(soundFx.isBgmActive() ? 'music-off' : 'music', 14, 'currentColor')}
            ${soundFx.isBgmActive() ? 'Matikan Musik Latar' : 'Nyalakan Musik Latar'}
          </button>
        </div>

        <div class="pixel-card-alt" style="padding: 12px;">
          <div style="font-family: var(--font-code); font-size: 12px; font-weight: bold; margin-bottom: 6px;">
            Audio Efek Suara (SFX)
          </div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <input id="slider-volume" type="range" min="0" max="100" value="${currentVol}" style="flex: 1;" />
            <span id="vol-label" style="font-family: var(--font-code); font-size: 12px; width: 40px;">${currentVol}%</span>
          </div>
          <button id="btn-toggle-mute" type="button" class="game-btn game-btn-secondary" style="min-height: 44px; width: 100%;">
            ${isMuted ? 'Aktifkan Suara' : 'Bisukan Suara (Mute)'}
          </button>
        </div>

        <div class="pixel-card-alt" style="padding: 12px;">
          <div style="font-family: var(--font-code); font-size: 12px; font-weight: bold; margin-bottom: 6px;">
            Tampilan Layar Penuh
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
            Aktifkan mode layar penuh untuk kenyamanan fokus belajar tanpa gangguan browser.
          </p>
          <button id="btn-fullscreen" type="button" class="game-btn game-btn-secondary" style="min-height: 44px; width: 100%;">
            Masuk Layar Penuh
          </button>
        </div>

        <!-- Manajemen Data & Progres Pembelajaran -->
        <div class="pixel-card-alt" style="padding: 12px; border: 1px solid rgba(220, 38, 38, 0.25);">
          <div style="font-family: var(--font-code); font-size: 12px; font-weight: bold; margin-bottom: 4px; color: var(--danger); display: flex; align-items: center; gap: 6px;">
            ${renderPixelIcon('refresh', 13, 'var(--danger)')} Manajemen Data &amp; Progres Pembelajaran
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; line-height: 1.45;">
            ${this.session
        ? `Saat ini terdaftar sebagai <strong>${this.session.studentName ? `Absen ${String(this.session.studentAbsen || 0).padStart(2, '0')} • ${escapeHtml(this.session.studentName)}` : escapeHtml(this.session.pairId)}</strong>.`
        : `Belum ada profil murid aktif yang terdaftar di perangkat ini.`
      }
            Gunakan opsi di bawah ini jika kamu ingin memulai sesi belajar baru dari awal atau membersihkan sisa data pengujian sebelumnya.
          </p>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button id="btn-settings-reset-all" type="button" class="game-btn" style="min-height: 42px; width: 100%; background: rgba(220, 38, 38, 0.08); border: 1.5px solid var(--danger); color: var(--danger); font-size: 12px; font-weight: 700; gap: 8px;">
              ${renderPixelIcon('refresh', 13, 'var(--danger)')} Reset Seluruh Progres Belajar
            </button>
            ${this.session ? `
              <button id="btn-settings-reset-profile" type="button" class="game-btn" style="min-height: 38px; width: 100%; background: transparent; border: 1px solid var(--border-subtle); color: var(--text-secondary); font-size: 11.5px;">
                Ganti Profil Murid Saja (Simpan Riwayat)
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Pasang listener BGM Settings
    const sliderBgm = card.querySelector<HTMLInputElement>('#slider-bgm-volume');
    const bgmVolLabel = card.querySelector<HTMLElement>('#bgm-vol-label');
    sliderBgm?.addEventListener('input', () => {
      const val = parseInt(sliderBgm.value, 10);
      if (bgmVolLabel) bgmVolLabel.textContent = `${val}%`;
      soundFx.setBgmVolume(val);
    });

    card.querySelector('#btn-toggle-bgm-settings')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      soundFx.toggleBgm();
      this.render();
    });

    const slider = card.querySelector<HTMLInputElement>('#slider-volume');
    const volLabel = card.querySelector<HTMLElement>('#vol-label');
    slider?.addEventListener('input', () => {
      const val = parseInt(slider.value, 10);
      if (volLabel) volLabel.textContent = `${val}%`;
      soundFx.setVolume(val);
    });

    card.querySelector('#btn-toggle-mute')?.addEventListener('click', () => {
      soundFx.toggleMute();
      this.render();
    });

    card.querySelector('#btn-fullscreen')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        void document.documentElement.requestFullscreen();
      } else {
        void document.exitFullscreen();
      }
    });

    card.querySelector('#btn-settings-reset-all')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.confirmResetAllProgress();
    });

    card.querySelector('#btn-settings-reset-profile')?.addEventListener('click', () => {
      this.showCelebrationModal(
        'Ganti Profil Murid',
        'Apakah kamu yakin ingin mengganti akun profil murid? Data progres yang telah dicapai tetap tersimpan di penyimpanan perangkat lokal.',
        [
          {
            label: 'Ganti Profil',
            isPrimary: true,
            action: async () => {
              await StorageService.clearSession();
              this.session = undefined;
              this.render();
              this.setScreen('MENU');
            }
          },
          {
            label: 'Batalkan',
            isPrimary: false,
            action: () => { }
          }
        ]
      );
    });

    return card;
  }

  /**
   * Menampilkan modal konfirmasi untuk mereset seluruh progres pembelajaran ke kondisi awal.
   */
  public confirmResetAllProgress(): void {
    soundFx.playLogicFalse();
    this.showCelebrationModal(
      'Reset Seluruh Progres Belajar',
      'Tindakan ini akan menghapus seluruh data yang tersimpan di perangkat ini, termasuk profil murid, riwayat modul lab telusur, status materi, skor pertempuran, dan nilai evaluasi formatif. Aplikasi akan kembali bersih seperti baru pertama kali dibuka (fresh state).\n\nApakah kamu yakin ingin mereset seluruh progres?',
      [
        {
          label: 'Ya, Reset Semua Progres',
          isPrimary: true,
          action: async () => {
            await this.executeResetAllProgress();
          }
        },
        {
          label: 'Batalkan',
          isPrimary: false,
          action: () => { }
        }
      ]
    );
  }

  /**
   * Eksekusi pembersihan total seluruh progres dan state UI ke kondisi awal (Fresh State).
   */
  public async executeResetAllProgress(): Promise<void> {
    await StorageService.resetAllProgress();

    // Reset seluruh state internal UIManager
    this.session = undefined;
    this.progressionState = await StorageService.getProgressionState();
    this.isCycle2Unlocked = false;
    this.allModuleProgress = {};
    this.formativeScores = await StorageService.getFormativeScores(1);
    this.readMateriIds = [];
    this.shownScreenGuidanceSet.clear();
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('iobranch_shown_screen_guidance');
      }
    } catch {
      // Abaikan jika sessionStorage tidak didukung
    }
    this.activeProgressStack = 1;
    this.maxUnlockedProgressStack = 1;
    this.activeGuideStack = 1;
    this.maxUnlockedGuideStack = 1;
    this.materiActiveStackMap = {};
    this.materiMaxUnlockedStackMap = {};
    this.activeModule = CASE_MODULES[0]!;
    this.activeMateriId = 'pra-01';

    // Reset state tracing & battle
    this.resetTracingToInitialState();
    this.isBattleSessionActive = false;
    this.isBattlePracticeMode = false;
    this.isTracingPracticeMode = false;
    this.isEvaluasiSessionActive = false;
    this.isEvaluasiPracticeMode = false;
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.evaluasiAnswers = [];

    // Perbarui coverage view & flowgorithm view jika ada
    if (this.coverageView) {
      const emptyProg: ModuleProgress = {
        testedBranches: [],
        stars: 0,
        isCompleted: false,
        xpEarned: 0,
        updatedAt: Date.now()
      };
      this.coverageView.update(emptyProg, this.activeModule.id, 0, false);
    }
    if (this.flowgorithmView) {
      this.flowgorithmView.setModule(this.activeModule.id, this.activeModule.defaultInput);
    }

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('iobranch_active_screen');
      }
    } catch {
      // Abaikan jika sessionStorage diblokir
    }

    EventCenter.emit('CYCLE_UNLOCKED', 1);
    EventCenter.emit('RESET_BATTLE');

    this.renderGlobalHeader();
    this.renderGlobalFooter();
    this.showRetroToast('Seluruh data progres belajar berhasil direset ke kondisi awal.', true);
    this.setScreen('MENU');
  }

  // =================================================================
  // Layar 11: Ketahanan Mode Luring (Offline Resilience Architecture)
  // =================================================================
  private renderScreenOffline(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'pixel-card';
    card.style.cssText = `padding: 16px;`;

    card.innerHTML = `
      <div style="font-family: var(--font-pixel); font-size: 11px; color: var(--state-true-text); margin-bottom: 12px;">
        STATUS MODE OFFLINE (BEBAS INTERNET)
      </div>

      <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px;">
        Semua materi, tantangan logika, dan soal latihan sudah tersimpan di perangkat ini. Kamu bisa belajar dan bermain kapan saja meski internet sekolah sedang mati atau tidak ada kuota.
      </p>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="padding: 12px; background-color: var(--surface-panel-alt); border: 1.5px solid var(--border-retro); border-radius: 6px; font-size: 12.5px; font-family: var(--font-ui); color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
          <span style="font-family: var(--font-pixel); font-size: 9px; color: var(--success); background: rgba(21, 128, 61, 0.1); border: 1px solid rgba(21, 128, 61, 0.3); padding: 3px 6px; border-radius: 4px; flex-shrink: 0;">AKTIF</span>
          <span>Gambar & Suara Game: Siap dimainkan tanpa kuota internet.</span>
        </div>
        <div style="padding: 12px; background-color: var(--surface-panel-alt); border: 1.5px solid var(--border-retro); border-radius: 6px; font-size: 12.5px; font-family: var(--font-ui); color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
          <span style="font-family: var(--font-pixel); font-size: 9px; color: var(--success); background: rgba(21, 128, 61, 0.1); border: 1px solid rgba(21, 128, 61, 0.3); padding: 3px 6px; border-radius: 4px; flex-shrink: 0;">AKTIF</span>
          <span>Materi & Kasus: Lengkap dan tersimpan di dalam aplikasi.</span>
        </div>
        <div style="padding: 12px; background-color: var(--surface-panel-alt); border: 1.5px solid var(--border-retro); border-radius: 6px; font-size: 12.5px; font-family: var(--font-ui); color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
          <span style="font-family: var(--font-pixel); font-size: 9px; color: var(--success); background: rgba(21, 128, 61, 0.1); border: 1px solid rgba(21, 128, 61, 0.3); padding: 3px 6px; border-radius: 4px; flex-shrink: 0;">AKTIF</span>
          <span>Progres Belajar: Tersimpan otomatis di perangkat ini.</span>
        </div>
      </div>
    `;

    return card;
  }

  // =================================================================
  // Modal Khusus Guru: Autentikasi PIN 'PTK' & Master Kunci Siklus 2
  // =================================================================
  private async showTeacherModal(): Promise<void> {
    const backdrop = document.createElement('div');
    backdrop.className = 'teacher-panel-backdrop';

    const initialCycle = this.isCycle2Unlocked ? 2 : 1;
    const currentDriveUrl = await StorageService.getDriveUrl(initialCycle);
    const currentPosttestC1 = await StorageService.getPosttestUrl(1);
    const currentPosttestC2 = await StorageService.getPosttestUrl(2);
    let cycle2Selected = this.isCycle2Unlocked;
    let bypassSelected = this.progressionState?.teacherBypassMode ?? false;

    const content = document.createElement('div');
    content.className = 'teacher-panel-modal tactile-card';
    content.setAttribute('role', 'dialog');
    content.setAttribute('aria-modal', 'true');
    content.setAttribute('aria-label', 'Panel Fasilitator Guru');

    content.innerHTML = `
      <!-- Header Dialog (Sticky di Atas) -->
      <div class="teacher-panel-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          ${renderPixelIcon('gear', 16, 'var(--primary)')}
          <span style="font-family: var(--font-pixel); font-size: 11px; color: var(--primary); letter-spacing: 0.5px;">
            Panel Fasilitator Guru
          </span>
        </div>
        <button type="button" class="btn-close-modal" aria-label="Tutup panel guru" style="background: none; border: 1.5px solid var(--border-retro); border-radius: 4px; color: var(--text-muted); font-family: var(--font-code); font-size: 13px; font-weight: bold; cursor: pointer; padding: 6px 10px; min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center;" title="Tutup">[X]</button>
      </div>

      <!-- Body Dialog (Scrollable secara Mandiri) -->
      <div class="teacher-panel-body">
        <!-- Bagian 1: Verifikasi PIN Rahasia Guru -->
        <div id="pin-verification-section">
          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
            Masukkan PIN Fasilitator Guru untuk membuka kendali materi Siklus 2, mode demonstrasi, dan konfigurasi pengumpulan tugas.
          </p>

          <div style="margin-bottom: 12px;">
            <label for="input-teacher-pin" style="display: block; font-size: 11.5px; font-weight: 700; margin-bottom: 6px; color: var(--text-primary);">
              PIN Fasilitator Guru:
            </label>
            <input id="input-teacher-pin" type="password" maxlength="10" class="pixel-input" placeholder="Ketik PIN guru..." style="width: 100%; min-height: 44px; font-size: 14px; letter-spacing: 3px;" autofocus />
            <div id="pin-err-msg" style="font-size: 11.5px; color: var(--danger); font-weight: 600; margin-top: 6px; display: none; align-items: center; gap: 6px;">
              ${renderPixelIcon('target', 11, 'var(--danger)')} PIN salah. Akses ditolak.
            </div>
          </div>

          <button id="btn-verify-pin" type="button" class="game-btn game-btn-gold" style="width: 100%; min-height: 44px; font-size: 12px; font-family: var(--font-pixel);">
            ${renderPixelIcon('play', 12, '#ffffff')} Verifikasi Akses Guru
          </button>
        </div>

        <!-- Bagian 2: Kontrol Interaktif Guru (Aktif setelah PIN Terverifikasi) -->
        <div id="teacher-controls" style="display: none; flex-direction: column; gap: 12px;">
          
          <!-- Grup 1: Kontrol Pembelajaran & Siklus -->
          <div class="teacher-group-card">
            <div style="font-size: 11px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              ${renderPixelIcon('target', 12, 'var(--primary)')} Kontrol Pembelajaran &amp; Siklus
            </div>

            <!-- Item 1: Master Switch Siklus 2 -->
            <div id="switch-trigger-row" class="teacher-toggle-item" role="button" tabindex="0" title="Klik untuk mengubah akses materi Siklus 2">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <strong id="switch-title" style="font-size: 12.5px; color: var(--text-primary);">
                    ${cycle2Selected ? 'Materi Siklus 2 Terbuka' : 'Materi Siklus 2 Terkunci'}
                  </strong>
                  <span id="cycle-badge-status" class="badge-pill" style="font-size: 9.5px; padding: 1px 6px; color: ${cycle2Selected ? 'var(--success)' : 'var(--warning-dark)'}; border-color: ${cycle2Selected ? 'var(--success)' : 'var(--warning)'}; background: ${cycle2Selected ? 'rgba(21, 128, 61, 0.1)' : 'rgba(217, 119, 6, 0.1)'};">
                    ${cycle2Selected ? 'Siklus 2' : 'Siklus 1 Saja'}
                  </span>
                </div>
                <p id="switch-subtitle" style="font-size: 11px; color: var(--text-secondary); margin: 2px 0 0; line-height: 1.35;">
                  ${cycle2Selected ? 'Modul 4 & 5 dapat langsung diakses oleh seluruh murid.' : 'Modul 4 & 5 terkunci agar murid fokus di materi dasar.'}
                </p>
              </div>
              <div id="tactile-switch" class="tactile-switch-track ${cycle2Selected ? 'active' : ''}" role="switch" aria-checked="${cycle2Selected}">
                <div class="tactile-switch-knob"></div>
              </div>
            </div>

            <div style="height: 1px; background: var(--border-subtle); margin: 6px 0;"></div>

            <!-- Item 2: Mode Demo Guru (Bypass) -->
            <div id="bypass-trigger-row" class="teacher-toggle-item" role="button" tabindex="0" title="Klik untuk mengaktifkan/menonaktifkan bypass guru">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <strong id="bypass-title" style="font-size: 12.5px; color: var(--text-primary);">
                    ${bypassSelected ? 'Bypass Kunci Aktif' : 'Alur Bertahap Standar'}
                  </strong>
                  <span id="bypass-badge-status" class="badge-pill" style="font-size: 9.5px; padding: 1px 6px; color: ${bypassSelected ? 'var(--success)' : 'var(--text-muted)'}; border-color: ${bypassSelected ? 'var(--success)' : 'var(--border-retro)'}; background: ${bypassSelected ? 'rgba(21, 128, 61, 0.1)' : 'rgba(0, 0, 0, 0.05)'};">
                    ${bypassSelected ? 'Bypass Aktif' : 'Normal'}
                  </span>
                </div>
                <p id="bypass-subtitle" style="font-size: 11px; color: var(--text-secondary); margin: 2px 0 0; line-height: 1.35;">
                  ${bypassSelected ? 'Semua menu dan gerbang terbuka bebas untuk demo guru.' : 'Murid menuntaskan langkah bertahap sesuai aturan.'}
                </p>
              </div>
              <div id="tactile-bypass-switch" class="tactile-switch-track ${bypassSelected ? 'active' : ''}" role="switch" aria-checked="${bypassSelected}">
                <div class="tactile-switch-knob"></div>
              </div>
            </div>

            <div style="height: 1px; background: var(--border-subtle); margin: 6px 0;"></div>

            <!-- Item 3: Reset Progres Murid di Perangkat Ini (Fresh State) -->
            <div style="padding-top: 4px;">
              <button id="btn-teacher-reset-progress" type="button" class="game-btn" style="width: 100%; min-height: 38px; background: rgba(220, 38, 38, 0.06); border: 1px solid rgba(220, 38, 38, 0.35); color: var(--danger); font-size: 11.5px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                ${renderPixelIcon('refresh', 12, 'var(--danger)')} <span>Reset Progres Perangkat (Kondisi Bersih Awal)</span>
              </button>
            </div>
          </div>

          <!-- Grup 2: Integrasi Google & Penilaian -->
          <div class="teacher-group-card">
            <div style="font-size: 11px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              ${renderPixelIcon('drive', 12, 'var(--primary)')} Integrasi Google &amp; Asesmen
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Field 1: Google Drive -->
              <div class="teacher-field-row">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 2px;">
                  <label for="input-drive-url" style="font-size: 11px; font-weight: 600; color: var(--text-primary);">
                    Folder Google Drive (Laporan Murid):
                  </label>
                  <span id="drive-cycle-indicator" class="badge-pill" style="font-size: 9px; padding: 1px 6px; color: var(--primary); border-color: var(--border-subtle); background: var(--surface-panel-alt);">
                    ${StorageService.isDefaultDriveUrl(currentDriveUrl) ? (cycle2Selected ? 'Otomatis: Siklus 2' : 'Otomatis: Siklus 1') : 'Kustom Guru'}
                  </span>
                </div>
                <div class="teacher-field-input-group">
                  <input id="input-drive-url" type="text" class="pixel-input" value="${escapeHtml(sanitizeWebUrl(currentDriveUrl))}" placeholder="https://drive.google.com/..." style="flex: 1; min-height: 38px; font-size: 11.5px; padding: 6px 10px;" />
                  <a id="btn-test-drive" href="${escapeHtml(sanitizeWebUrl(currentDriveUrl))}" target="_blank" rel="noopener noreferrer" class="game-btn game-btn-secondary" style="font-size: 10.5px; padding: 0 10px; min-height: 38px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;" title="Buka tautan folder Drive di tab baru">
                    ${renderPixelIcon('drive', 12, 'currentColor')} <span>Tes</span>
                  </a>
                  <button id="btn-reset-drive" type="button" class="game-btn game-btn-secondary" style="font-size: 10.5px; padding: 0 8px; min-height: 38px; display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;" title="Kembalikan ke folder resmi bawaan siklus yang aktif">
                    ${renderPixelIcon('refresh', 11, 'currentColor')} <span>Bawaan</span>
                  </button>
                </div>
                <div id="drive-sync-hint" style="font-size: 10px; color: var(--text-secondary); margin-top: 2px; line-height: 1.35;">
                  Tautan otomatis menyesuaikan saat saklar siklus diganti (tanpa perlu input manual).
                </div>
              </div>

              <!-- Field 2: Web App GAS -->
              <div class="teacher-field-row">
                <label for="input-teacher-gas-url" style="font-size: 11px; font-weight: 600; color: var(--text-primary);">
                  Endpoint Google Apps Script (1-Klik Upload):
                </label>
                <div class="teacher-field-input-group">
                  <input id="input-teacher-gas-url" type="url" class="pixel-input" value="${escapeHtml(StorageService.getGasApiUrlSync())}" placeholder="https://script.google.com/macros/s/.../exec" style="flex: 1; min-height: 38px; font-size: 11px; font-family: var(--font-code); padding: 6px 10px;" />
                  <button id="btn-test-teacher-gas" type="button" class="game-btn game-btn-secondary" style="font-size: 10.5px; padding: 0 10px; min-height: 38px; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;" title="Uji ketersediaan endpoint Web App">
                    ${renderPixelIcon('refresh', 11, 'currentColor')} <span>Uji</span>
                  </button>
                </div>
              </div>

              <!-- Field 3: Google Form Posttest Pembelajaran Per Siklus -->
              <div class="teacher-field-row" style="border-top: 1px solid var(--border-subtle); padding-top: 10px; margin-top: 6px;">
                <div style="font-size: 11px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
                  <span>Tautan Google Form Posttest (Per Siklus):</span>
                  <span style="font-size: 9px; font-weight: 600; color: var(--text-muted);">Dikelola Mandiri Per Siklus</span>
                </div>

                <!-- Siklus 1 (Form B) -->
                <div style="margin-bottom: 8px; padding: 8px 10px; background: var(--surface-panel-alt); border: 1px solid var(--border-subtle); border-radius: 6px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
                    <label for="input-teacher-posttest-c1" style="font-size: 10.5px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 5px;">
                      <span class="badge-pill" style="font-size: 9px; padding: 1px 5px; color: var(--text-primary); background: #e2e8f0;">Siklus 1</span>
                      <span>Posttest Form B (Dasar):</span>
                    </label>
                    <span id="posttest-c1-indicator" class="badge-pill" style="font-size: 9px; padding: 1px 6px; color: ${StorageService.isDefaultPosttestUrl(currentPosttestC1, 1) ? 'var(--primary)' : 'var(--warning-dark)'}; border-color: var(--border-subtle); background: #ffffff;">
                      ${StorageService.isDefaultPosttestUrl(currentPosttestC1, 1) ? 'Bawaan Form B' : 'Kustom Guru'}
                    </span>
                  </div>
                  <div class="teacher-field-input-group">
                    <input id="input-teacher-posttest-c1" type="url" class="pixel-input" value="${escapeHtml(currentPosttestC1)}" placeholder="https://forms.gle/..." style="flex: 1; min-height: 36px; font-size: 11px; padding: 6px 8px;" />
                    <a id="btn-test-posttest-c1" href="${escapeHtml(currentPosttestC1)}" target="_blank" rel="noopener noreferrer" class="game-btn game-btn-secondary" style="font-size: 10px; padding: 0 8px; min-height: 36px; text-decoration: none; display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;" title="Buka Form B di tab baru">
                      ${renderPixelIcon('document', 11, 'currentColor')} <span>Tes</span>
                    </a>
                    <button id="btn-reset-posttest-c1" type="button" class="game-btn game-btn-secondary" style="font-size: 10px; padding: 0 8px; min-height: 36px; display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;" title="Kembalikan ke Form B resmi bawaan">
                      ${renderPixelIcon('refresh', 10, 'currentColor')} <span>Bawaan</span>
                    </button>
                  </div>
                </div>

                <!-- Siklus 2 (Form C) -->
                <div style="padding: 8px 10px; background: var(--surface-panel-alt); border: 1px solid var(--border-subtle); border-radius: 6px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
                    <label for="input-teacher-posttest-c2" style="font-size: 10.5px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 5px;">
                      <span class="badge-pill" style="font-size: 9px; padding: 1px 5px; color: var(--primary); background: rgba(15, 118, 110, 0.1);">Siklus 2</span>
                      <span>Posttest Form C (Lanjutan):</span>
                    </label>
                    <span id="posttest-c2-indicator" class="badge-pill" style="font-size: 9px; padding: 1px 6px; color: ${StorageService.isDefaultPosttestUrl(currentPosttestC2, 2) ? 'var(--primary)' : 'var(--warning-dark)'}; border-color: var(--border-subtle); background: #ffffff;">
                      ${StorageService.isDefaultPosttestUrl(currentPosttestC2, 2) ? 'Bawaan Form C' : 'Kustom Guru'}
                    </span>
                  </div>
                  <div class="teacher-field-input-group">
                    <input id="input-teacher-posttest-c2" type="url" class="pixel-input" value="${escapeHtml(currentPosttestC2)}" placeholder="https://forms.gle/..." style="flex: 1; min-height: 36px; font-size: 11px; padding: 6px 8px;" />
                    <a id="btn-test-posttest-c2" href="${escapeHtml(currentPosttestC2)}" target="_blank" rel="noopener noreferrer" class="game-btn game-btn-secondary" style="font-size: 10px; padding: 0 8px; min-height: 36px; text-decoration: none; display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;" title="Buka Form C di tab baru">
                      ${renderPixelIcon('document', 11, 'currentColor')} <span>Tes</span>
                    </a>
                    <button id="btn-reset-posttest-c2" type="button" class="game-btn game-btn-secondary" style="font-size: 10px; padding: 0 8px; min-height: 36px; display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;" title="Kembalikan ke Form C resmi bawaan">
                      ${renderPixelIcon('refresh', 10, 'currentColor')} <span>Bawaan</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Footer Dialog (Sticky di Bawah) -->
      <div id="teacher-panel-footer-actions" class="teacher-panel-footer" style="display: none;">
        <button id="btn-save-teacher" type="button" class="game-btn game-btn-primary" style="width: 100%; min-height: 44px; font-size: 12.5px; font-weight: 700; gap: 8px;">
          ${renderPixelIcon('check', 13, '#ffffff')} Simpan Pengaturan Guru
        </button>
      </div>
    `;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const closeModal = () => {
      window.removeEventListener('keydown', handleKeyDown);
      backdrop.remove();
    };

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    });

    const closeBtn = content.querySelector('.btn-close-modal');
    closeBtn?.addEventListener('click', closeModal);

    const pinSection = content.querySelector<HTMLElement>('#pin-verification-section');
    const pinInput = content.querySelector<HTMLInputElement>('#input-teacher-pin');
    const pinErr = content.querySelector<HTMLElement>('#pin-err-msg');
    const btnVerify = content.querySelector<HTMLButtonElement>('#btn-verify-pin');
    const controls = content.querySelector<HTMLElement>('#teacher-controls');
    const footerActions = content.querySelector<HTMLElement>('#teacher-panel-footer-actions');

    const handleVerify = async () => {
      if (btnVerify && btnVerify.disabled) return;
      if (btnVerify) btnVerify.disabled = true;
      try {
        const pin = pinInput?.value.trim() || '';
        const isValid = await CycleGuard.verifyTeacherPin(pin);
        if (isValid) {
          if (pinErr) pinErr.style.display = 'none';
          if (pinSection) pinSection.style.display = 'none';
          if (controls) controls.style.display = 'flex';
          if (footerActions) footerActions.style.display = 'flex';
          soundFx.playLogicTrue();
        } else {
          if (pinErr) {
            pinErr.style.display = 'flex';
            pinErr.classList.add('shake');
            setTimeout(() => pinErr.classList.remove('shake'), 400);
          }
          soundFx.playLogicFalse();
        }
      } finally {
        if (btnVerify) btnVerify.disabled = false;
      }
    };

    btnVerify?.addEventListener('click', handleVerify);
    pinInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        void handleVerify();
      }
    });

    // Handler Interaksi Saklar Utama Siklus 2
    const switchTrack = content.querySelector<HTMLElement>('#tactile-switch');
    const triggerRow = content.querySelector<HTMLElement>('#switch-trigger-row');
    const badgeStatus = content.querySelector<HTMLElement>('#cycle-badge-status');
    const switchTitle = content.querySelector<HTMLElement>('#switch-title');
    const switchSubtitle = content.querySelector<HTMLElement>('#switch-subtitle');

    const toggleCycleSwitch = () => {
      cycle2Selected = !cycle2Selected;
      const targetCycle = cycle2Selected ? 2 : 1;
      const targetDriveUrl = DRIVE_CYCLE_URLS[targetCycle] || DEFAULT_DRIVE_URL;

      // Update Switch Lever Visual
      switchTrack?.classList.toggle('active', cycle2Selected);
      switchTrack?.setAttribute('aria-checked', String(cycle2Selected));

      // Update Badge Status
      if (badgeStatus) {
        badgeStatus.innerHTML = cycle2Selected ? 'Siklus 2' : 'Siklus 1 Saja';
        badgeStatus.style.color = cycle2Selected ? 'var(--success)' : 'var(--warning-dark)';
        badgeStatus.style.borderColor = cycle2Selected ? 'var(--success)' : 'var(--warning)';
        badgeStatus.style.background = cycle2Selected ? 'rgba(21, 128, 61, 0.1)' : 'rgba(217, 119, 6, 0.1)';
      }

      // Update Label Teks
      if (switchTitle) {
        switchTitle.textContent = cycle2Selected ? 'Materi Siklus 2 Terbuka' : 'Materi Siklus 2 Terkunci';
      }
      if (switchSubtitle) {
        switchSubtitle.textContent = cycle2Selected
          ? 'Modul 4 & 5 dapat langsung diakses oleh seluruh murid.'
          : 'Modul 4 & 5 terkunci agar murid fokus di materi dasar.';
      }

      // Update otomatis URL Drive jika pengguna memakai URL bawaan (atau input kosong/sesuai default siklus 1/2)
      const currentVal = driveInput?.value.trim() || '';
      const isUsingDefault = StorageService.isDefaultDriveUrl(currentVal);

      if (isUsingDefault && driveInput) {
        driveInput.value = targetDriveUrl;
        if (driveTestBtn) driveTestBtn.href = targetDriveUrl;
      }

      const driveIndicator = content.querySelector<HTMLElement>('#drive-cycle-indicator');
      if (driveIndicator) {
        const isStillDefault = StorageService.isDefaultDriveUrl(driveInput?.value.trim());
        driveIndicator.textContent = isStillDefault ? (cycle2Selected ? 'Otomatis: Siklus 2' : 'Otomatis: Siklus 1') : 'Kustom Guru';
        driveIndicator.style.color = isStillDefault ? 'var(--primary)' : 'var(--warning-dark)';
      }

      // Suara Feedback Haptik
      if (cycle2Selected) {
        soundFx.playBranchSuccessChime();
      } else {
        soundFx.playLogicFalse();
      }
    };

    triggerRow?.addEventListener('click', toggleCycleSwitch);
    triggerRow?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCycleSwitch();
      }
    });

    // Handler Interaksi Saklar Bypass Guru
    const bypassTrack = content.querySelector<HTMLElement>('#tactile-bypass-switch');
    const bypassTriggerRow = content.querySelector<HTMLElement>('#bypass-trigger-row');
    const bypassBadge = content.querySelector<HTMLElement>('#bypass-badge-status');
    const bypassTitle = content.querySelector<HTMLElement>('#bypass-title');
    const bypassSubtitle = content.querySelector<HTMLElement>('#bypass-subtitle');

    const toggleBypassSwitch = () => {
      bypassSelected = !bypassSelected;

      bypassTrack?.classList.toggle('active', bypassSelected);
      bypassTrack?.setAttribute('aria-checked', String(bypassSelected));

      if (bypassBadge) {
        bypassBadge.innerHTML = bypassSelected ? 'Bypass Aktif' : 'Normal';
        bypassBadge.style.color = bypassSelected ? 'var(--success)' : 'var(--text-muted)';
        bypassBadge.style.borderColor = bypassSelected ? 'var(--success)' : 'var(--border-retro)';
        bypassBadge.style.background = bypassSelected ? 'rgba(21, 128, 61, 0.1)' : 'rgba(0, 0, 0, 0.05)';
      }

      if (bypassTitle) {
        bypassTitle.textContent = bypassSelected ? 'Bypass Kunci Aktif' : 'Alur Bertahap Standar';
      }
      if (bypassSubtitle) {
        bypassSubtitle.textContent = bypassSelected
          ? 'Semua menu dan gerbang terbuka bebas untuk demo guru.'
          : 'Murid menuntaskan langkah bertahap sesuai aturan.';
      }

      if (bypassSelected) {
        soundFx.playBranchSuccessChime();
      } else {
        soundFx.playLogicFalse();
      }
    };

    bypassTriggerRow?.addEventListener('click', toggleBypassSwitch);
    bypassTriggerRow?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleBypassSwitch();
      }
    });

    content.querySelector('#btn-teacher-reset-progress')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      closeModal();
      this.confirmResetAllProgress();
    });

    // Sinkronisasi Live URL Google Drive
    const driveInput = content.querySelector<HTMLInputElement>('#input-drive-url');
    const driveTestBtn = content.querySelector<HTMLAnchorElement>('#btn-test-drive');
    const driveIndicator = content.querySelector<HTMLElement>('#drive-cycle-indicator');
    const btnResetDrive = content.querySelector<HTMLButtonElement>('#btn-reset-drive');

    driveInput?.addEventListener('input', () => {
      const val = driveInput.value.trim();
      if (driveTestBtn) {
        driveTestBtn.href = val || '#';
      }
      if (driveIndicator) {
        const isStillDefault = StorageService.isDefaultDriveUrl(val);
        driveIndicator.textContent = isStillDefault ? (cycle2Selected ? 'Otomatis: Siklus 2' : 'Otomatis: Siklus 1') : 'Kustom Guru';
        driveIndicator.style.color = isStillDefault ? 'var(--primary)' : 'var(--warning-dark)';
      }
    });

    btnResetDrive?.addEventListener('click', () => {
      const targetCycle = cycle2Selected ? 2 : 1;
      const targetDriveUrl = DRIVE_CYCLE_URLS[targetCycle] || DEFAULT_DRIVE_URL;
      if (driveInput) driveInput.value = targetDriveUrl;
      if (driveTestBtn) driveTestBtn.href = targetDriveUrl;
      if (driveIndicator) {
        driveIndicator.textContent = cycle2Selected ? 'Otomatis: Siklus 2' : 'Otomatis: Siklus 1';
        driveIndicator.style.color = 'var(--primary)';
      }
      soundFx.playButtonBlip();
      this.showRetroToast(`Folder Drive dikembalikan ke bawaan Siklus ${targetCycle}.`, true);
    });

    // Sinkronisasi Live URL Google Form Posttest Pembelajaran Per Siklus
    const posttestC1Input = content.querySelector<HTMLInputElement>('#input-teacher-posttest-c1');
    const posttestC1TestBtn = content.querySelector<HTMLAnchorElement>('#btn-test-posttest-c1');
    const posttestC1ResetBtn = content.querySelector<HTMLButtonElement>('#btn-reset-posttest-c1');
    const posttestC1Indicator = content.querySelector<HTMLElement>('#posttest-c1-indicator');

    posttestC1Input?.addEventListener('input', () => {
      const val = posttestC1Input.value.trim();
      if (posttestC1TestBtn) {
        posttestC1TestBtn.href = val || '#';
      }
      if (posttestC1Indicator) {
        const isDef = StorageService.isDefaultPosttestUrl(val, 1);
        posttestC1Indicator.textContent = isDef ? 'Bawaan Form B' : 'Kustom Guru';
        posttestC1Indicator.style.color = isDef ? 'var(--primary)' : 'var(--warning-dark)';
      }
    });

    posttestC1ResetBtn?.addEventListener('click', () => {
      if (posttestC1Input) {
        posttestC1Input.value = POSTTEST_CYCLE_URLS[1]!;
      }
      if (posttestC1TestBtn) {
        posttestC1TestBtn.href = POSTTEST_CYCLE_URLS[1]!;
      }
      if (posttestC1Indicator) {
        posttestC1Indicator.textContent = 'Bawaan Form B';
        posttestC1Indicator.style.color = 'var(--primary)';
      }
      soundFx.playButtonBlip();
      this.showRetroToast('Tautan Posttest Siklus 1 dikembalikan ke Form B bawaan.', true);
    });

    const posttestC2Input = content.querySelector<HTMLInputElement>('#input-teacher-posttest-c2');
    const posttestC2TestBtn = content.querySelector<HTMLAnchorElement>('#btn-test-posttest-c2');
    const posttestC2ResetBtn = content.querySelector<HTMLButtonElement>('#btn-reset-posttest-c2');
    const posttestC2Indicator = content.querySelector<HTMLElement>('#posttest-c2-indicator');

    posttestC2Input?.addEventListener('input', () => {
      const val = posttestC2Input.value.trim();
      if (posttestC2TestBtn) {
        posttestC2TestBtn.href = val || '#';
      }
      if (posttestC2Indicator) {
        const isDef = StorageService.isDefaultPosttestUrl(val, 2);
        posttestC2Indicator.textContent = isDef ? 'Bawaan Form C' : 'Kustom Guru';
        posttestC2Indicator.style.color = isDef ? 'var(--primary)' : 'var(--warning-dark)';
      }
    });

    posttestC2ResetBtn?.addEventListener('click', () => {
      if (posttestC2Input) {
        posttestC2Input.value = POSTTEST_CYCLE_URLS[2]!;
      }
      if (posttestC2TestBtn) {
        posttestC2TestBtn.href = POSTTEST_CYCLE_URLS[2]!;
      }
      if (posttestC2Indicator) {
        posttestC2Indicator.textContent = 'Bawaan Form C';
        posttestC2Indicator.style.color = 'var(--primary)';
      }
      soundFx.playButtonBlip();
      this.showRetroToast('Tautan Posttest Siklus 2 dikembalikan ke Form C bawaan.', true);
    });

    // Uji Status Endpoint Web App Google Apps Script
    const btnTestTeacherGas = content.querySelector<HTMLButtonElement>('#btn-test-teacher-gas');
    btnTestTeacherGas?.addEventListener('click', async () => {
      soundFx.playButtonBlip();
      const teacherGasInput = content.querySelector<HTMLInputElement>('#input-teacher-gas-url');
      const val = teacherGasInput?.value.trim() || StorageService.getGasApiUrlSync();
      if (!val) {
        this.showRetroToast('Masukkan URL Google Apps Script terlebih dahulu.', false);
        return;
      }
      this.showRetroToast('Memeriksa status endpoint Web App...', true);
      try {
        const res = await fetch(val, { method: 'GET' });
        const data = await res.json();
        if (data && data.status === 'active') {
          soundFx.playVictoryFanfare();
          this.showRetroToast(`Layanan aktif: ${data.service}`, true);
        } else {
          this.showRetroToast('Endpoint merespons, namun format tidak sesuai.', false);
        }
      } catch {
        soundFx.playLogicFalse();
        this.showRetroToast('Tidak dapat menghubungi endpoint Web App.', false);
      }
    });

    // Simpan Pengaturan Guru
    const btnSave = content.querySelector<HTMLButtonElement>('#btn-save-teacher');
    btnSave?.addEventListener('click', async () => {
      const targetCycle = cycle2Selected ? 2 : 1;
      const defaultUrlForTarget = DRIVE_CYCLE_URLS[targetCycle] || DEFAULT_DRIVE_URL;
      const rawDrive = driveInput?.value.trim() || defaultUrlForTarget;
      const isDefault = StorageService.isDefaultDriveUrl(rawDrive);
      const sanitized = sanitizeWebUrl(rawDrive);
      const driveUrl = isDefault ? defaultUrlForTarget : (sanitized || defaultUrlForTarget);
      const isNewlyUnlocked = cycle2Selected && !this.isCycle2Unlocked;

      const teacherGasInput = content.querySelector<HTMLInputElement>('#input-teacher-gas-url');
      const teacherGasUrl = teacherGasInput?.value.trim() || '';
      await StorageService.setGasApiUrl(teacherGasUrl);

      const teacherPosttestC1Input = content.querySelector<HTMLInputElement>('#input-teacher-posttest-c1');
      const teacherPosttestC1Url = teacherPosttestC1Input?.value.trim() || '';
      if (teacherPosttestC1Url) {
        await StorageService.setPosttestUrl(teacherPosttestC1Url, 1);
      }

      const teacherPosttestC2Input = content.querySelector<HTMLInputElement>('#input-teacher-posttest-c2');
      const teacherPosttestC2Url = teacherPosttestC2Input?.value.trim() || '';
      if (teacherPosttestC2Url) {
        await StorageService.setPosttestUrl(teacherPosttestC2Url, 2);
      }

      await StorageService.setCycleState(targetCycle as 1 | 2);
      await StorageService.setDriveUrl(driveUrl);
      this.isCycle2Unlocked = cycle2Selected;
      this.readMateriIds = await StorageService.getReadMateriIds();
      this.formativeScores = await StorageService.getFormativeScores(targetCycle);

      // Simpan status bypass guru
      const updatedProgression = await StorageService.setTeacherBypassMode(bypassSelected);
      this.progressionState = updatedProgression;

      closeModal();
      this.renderGlobalHeader();
      this.render();

      if (isNewlyUnlocked) {
        this.showCelebrationUnlockModal();
      } else {
        soundFx.playLogicTrue();
        this.showRetroToast(
          bypassSelected
            ? 'Pengaturan tersimpan: Mode Demo Guru (Bypass) AKTIF.'
            : cycle2Selected
              ? 'Pengaturan tersimpan: Siklus 2 aktif & Prosedur Normal.'
              : 'Pengaturan tersimpan: Siklus 1 aktif.'
        );
      }
    });

    backdrop.appendChild(content);
    document.body.appendChild(backdrop);
  }

  /**
   * Membuka kasus modul tertentu lalu berpindah ke layar penelusuran alur kode
   */
  public selectModuleAndGoTracing(moduleId: string): void {
    const found = CASE_MODULES.find((m) => m.id === moduleId);
    if (found) {
      if (found.cycleRequired === 2 && !this.isCycle2Unlocked) {
        this.showStudentTokenModal(found.id);
        return;
      }
      this.activeModule = found;
      this.currentInputValue = found.defaultInput;
      this.userPrediction = null;
      this.currentStepIndex = 0;
      this.syntaxRenderer.setLines(found.lines, this.currentInputValue);
      void StorageService.getModuleProgress(found.id).then((rawProg) => {
        const prog: ModuleProgress = rawProg || {
          testedBranches: [],
          stars: 0,
          isCompleted: false,
          xpEarned: 0,
          updatedAt: Date.now()
        };
        this.coverageView.update(prog, found.id, this.formativeScores?.tracingScore || 0, this.isCycle2Unlocked);
        this.recalculateTrace();
        this.flowgorithmView.setModule(found.id, this.currentInputValue);
        this.setScreen('TRACING');
      });
      return;
    }
    this.setScreen('TRACING');
  }

  /**
   * Modal Akses Murid: Input Token Kelas untuk Membuka Gerbang Siklus 2
   */
  public showStudentTokenModal(targetModuleId?: string): void {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(28, 25, 23, 0.75);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2050;
      padding: 16px;
    `;

    const content = document.createElement('div');
    content.className = 'tactile-card';
    content.setAttribute('role', 'dialog');
    content.setAttribute('aria-modal', 'true');
    content.setAttribute('aria-label', 'Akses Gerbang Siklus 2');
    content.style.cssText = `
      max-width: 440px;
      width: 100%;
      padding: 22px;
      background: #FFFFFF;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
      border: 2px solid var(--border-retro);
      border-radius: 12px;
      animation: celebrateScaleIn 0.22s ease-out;
    `;

    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 2px solid var(--border-retro); padding-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          ${renderPixelIcon('lock', 16, 'var(--warning)')}
          <span style="font-family: var(--font-pixel); font-size: 11px; color: var(--warning); letter-spacing: 0.5px;">
            Akses Gerbang Siklus 2
          </span>
        </div>
        <button type="button" class="btn-close-modal" aria-label="Tutup modal token" style="background: none; border: 1.5px solid var(--border-retro); border-radius: 4px; color: var(--text-muted); font-family: var(--font-code); font-size: 13px; font-weight: bold; cursor: pointer; padding: 8px 12px; min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center;" title="Tutup">[X]</button>
      </div>

      <div style="text-align: center; margin-bottom: 16px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 50%; background: rgba(217, 119, 6, 0.12); margin-bottom: 10px; border: 2px solid var(--warning);">
          ${renderPixelIcon('unlock', 26, 'var(--warning)')}
        </div>
        <h3 style="font-family: var(--font-pixel); font-size: 13px; color: var(--text-primary); margin: 0 0 6px;">
          Buka Kunci Siklus 2
        </h3>
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
          Materi tingkat lanjut (Percabangan Bertingkat &amp; Majemuk) dibuka dengan <strong>Token Kelas</strong> yang diumumkan oleh Guru Informatika.
        </p>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 11.5px; font-weight: 700; margin-bottom: 6px; color: var(--text-primary);">
          Kode Token dari Guru:
        </label>
        <input id="input-student-token" type="text" maxlength="20" class="pixel-input" placeholder="Ketik kode token di sini..." style="width: 100%; min-height: 46px; font-size: 14px; font-family: var(--font-code); font-weight: 700; letter-spacing: 2px; text-transform: uppercase;" autofocus />
        <div id="token-err-msg" style="font-size: 11px; color: var(--danger); font-weight: 600; margin-top: 6px; display: none; align-items: center; gap: 6px;">
          ${renderPixelIcon('target', 11, 'var(--danger)')} Token tidak sesuai. Silakan periksa kembali kode dari Guru Informatika.
        </div>
      </div>

      <div style="display: flex; gap: 8px; flex-direction: column;">
        <button id="btn-submit-token" type="button" class="game-btn game-btn-gold" style="width: 100%; min-height: 46px; font-size: 12px; font-family: var(--font-pixel); gap: 8px;">
          ${renderPixelIcon('check', 13, '#ffffff')} Buka Gerbang Siklus 2
        </button>
        <button id="btn-cancel-token" type="button" class="game-btn game-btn-secondary" style="width: 100%; min-height: 44px; font-size: 11.5px;">
          Kembali
        </button>
      </div>
    `;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleClose = () => {
      window.removeEventListener('keydown', handleKeyDown);
      backdrop.remove();
    };

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        handleClose();
      }
    });

    const closeBtn = content.querySelector('.btn-close-modal');
    const cancelBtn = content.querySelector('#btn-cancel-token');
    closeBtn?.addEventListener('click', handleClose);
    cancelBtn?.addEventListener('click', handleClose);

    const tokenInput = content.querySelector<HTMLInputElement>('#input-student-token');
    const tokenErr = content.querySelector<HTMLElement>('#token-err-msg');
    const btnSubmit = content.querySelector<HTMLButtonElement>('#btn-submit-token');

    const handleSubmit = async () => {
      if (btnSubmit && btnSubmit.disabled) return;
      if (btnSubmit) btnSubmit.disabled = true;
      try {
        const val = tokenInput?.value || '';
        const isValid = await CycleGuard.verifyStudentToken(val);
        if (isValid) {
          this.isCycle2Unlocked = true;
          this.readMateriIds = await StorageService.getReadMateriIds();
          this.formativeScores = await StorageService.getFormativeScores(2);
          handleClose();

          if (targetModuleId) {
            const target = CASE_MODULES.find((m) => m.id === targetModuleId);
            if (target) {
              this.activeModule = target;
              this.currentInputValue = target.defaultInput;
              this.userPrediction = null;
              this.currentStepIndex = 0;
              this.syntaxRenderer.setLines(target.lines, this.currentInputValue);
              const rawProg = await StorageService.getModuleProgress(target.id);
              const prog: ModuleProgress = rawProg || {
                testedBranches: [],
                stars: 0,
                isCompleted: false,
                xpEarned: 0,
                updatedAt: Date.now()
              };
              this.coverageView.update(prog, target.id, this.formativeScores?.tracingScore || 0, this.isCycle2Unlocked);
              this.recalculateTrace();
              this.flowgorithmView.setModule(target.id, this.currentInputValue);
            }
          }

          this.renderGlobalHeader();
          this.render();
          this.showCelebrationUnlockModal(true);
        } else {
          if (tokenErr) {
            tokenErr.style.display = 'flex';
            tokenErr.classList.add('shake');
            setTimeout(() => tokenErr.classList.remove('shake'), 400);
          }
          soundFx.playLogicFalse();
        }
      } finally {
        if (btnSubmit) btnSubmit.disabled = false;
      }
    };

    btnSubmit?.addEventListener('click', handleSubmit);
    tokenInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        void handleSubmit();
      }
    });

    backdrop.appendChild(content);
    document.body.appendChild(backdrop);
    tokenInput?.focus();
  }

  /**
   * Menampilkan kartu modal perayaan saat gerbang Siklus 2 berhasil dibuka
   */
  private showCelebrationUnlockModal(isStudent = false): void {
    soundFx.playVictoryFanfare();

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(5, 8, 14, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2100;
      padding: 16px;
    `;

    overlay.innerHTML = `
      <div class="celebrate-modal-card tactile-card" role="dialog" aria-modal="true" aria-label="Gerbang Siklus 2 Terbuka" style="
        max-width: 440px;
        width: 100%;
        text-align: center;
        padding: 24px;
        background: #FFFFFF;
        border: 2.5px solid var(--primary);
        border-radius: 12px;
        box-shadow: 0 12px 36px rgba(15, 118, 110, 0.3);
      ">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: rgba(15, 118, 110, 0.12); margin-bottom: 12px; border: 2px solid var(--primary);">
          ${renderPixelIcon('star', 28, 'var(--primary)')}
        </div>

        <h2 style="font-family: var(--font-pixel); font-size: 15px; color: var(--primary); margin: 0 0 10px; letter-spacing: 0.5px;">
          Gerbang Siklus 2 Terbuka!
        </h2>
        <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
          ${isStudent
        ? 'Selamat! Perangkat kamu kini berhasil membuka materi tingkat lanjut: <strong>Modul 4 (Percabangan Bertingkat)</strong> dan <strong>Modul 5 (Switch-Case)</strong>.'
        : 'Seluruh perangkat murid kini dapat mengakses materi tingkat lanjut: <strong>Modul 4 (Percabangan Bertingkat)</strong> dan <strong>Modul 5 (Switch-Case)</strong>.'
      }
        </p>

        <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 18px; flex-wrap: wrap;">
          <span class="badge-pill" style="font-size: 11px; font-weight: 700; color: var(--success); border-color: var(--success); background: rgba(21, 128, 61, 0.1);">
            Modul 4 Aktif
          </span>
          <span class="badge-pill" style="font-size: 11px; font-weight: 700; color: var(--success); border-color: var(--success); background: rgba(21, 128, 61, 0.1);">
            Modul 5 Aktif
          </span>
        </div>

        <button id="btn-close-celebrate" type="button" class="game-btn game-btn-primary" style="width: 100%; min-height: 46px; font-size: 12.5px; font-weight: 700; gap: 8px;">
          ${renderPixelIcon('check', 13, '#ffffff')} ${isStudent ? 'Mulai Tantangan Siklus 2' : 'Siap Digunakan di Kelas'}
        </button>
      </div>
    `;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOverlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const closeOverlay = () => {
      window.removeEventListener('keydown', handleKeyDown);
      overlay.remove();
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeOverlay();
      }
    });

    overlay.querySelector('#btn-close-celebrate')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      closeOverlay();
    });

    document.body.appendChild(overlay);
  }

  /**
   * Menghasilkan konfigurasi konten petunjuk kontekstual berdasarkan layar aktif dan siklus belajar
   */
  private getScreenGuidanceConfig(screen: ScreenId): ScreenGuidanceConfig {
    switch (screen) {
      case 'PANDUAN':
        return {
          tag: 'Panduan Penyelidikan',
          title: 'Alur Investigasi & Persiapan Murid',
          icon: 'help',
          purpose: 'Mempersiapkan pemahaman komputasional murid mengenai alur investigasi 8 langkah, penggunaan lab telusur, dan tata cara evaluasi sebelum menganalisis kode.',
          steps: [
            {
              number: 1,
              title: 'Pelajari 3 Tumpukan Kartu',
              desc: 'Buka dan cermati ketiga tumpukan kartu: Alur 8 Langkah, Lab Telusur & Flowchart, serta Evaluasi Logika.'
            },
            {
              number: 2,
              title: 'Pahami Prediksi Kondisi',
              desc: 'Pahami bagaimana ekspresi relasional pada diagram alir menentukan percabangan jalur eksekusi TRUE atau FALSE.'
            },
            {
              number: 3,
              title: 'Daftarkan Identitas Murid',
              desc: 'Isi nama murid dan tentukan lambang tim detektif pada kartu formulir di bawah untuk membuka akses investigasi.'
            }
          ],
          cycleNote: 'Membaca panduan secara menyeluruh akan membantu murid menyelesaikan misi penelusuran kode dengan lancar.',
          primaryActionLabel: 'Saya Paham, Mulai Baca Panduan'
        };

      case 'OVERWORLD':
        return {
          tag: this.isCycle2Unlocked ? 'Peta Kasus Siklus 2' : 'Peta Kasus Siklus 1',
          title: this.isCycle2Unlocked ? 'Pusat Investigasi Kasus Lanjutan' : 'Pusat Investigasi Kota Harmoni',
          icon: 'map',
          purpose: this.isCycle2Unlocked
            ? 'Pusat pemilihan distrik Kota Harmoni yang mengalami kendala percabangan bertingkat (else-if) dan multi-kategori (switch-case).'
            : 'Pusat pemilihan lokasi sektor Kota Harmoni yang mengalami malfungsi otomasi algoritma percabangan dasar.',
          steps: this.isCycle2Unlocked
            ? [
              {
                number: 1,
                title: 'Fokus Kasus 4 & 5',
                desc: 'Pilih Kasus 4 (Filter Kualitas Air) atau Kasus 5 (Distribusi Daya Listrik) sebagai target utama penyelidikan Siklus 2.'
              },
              {
                number: 2,
                title: 'Kasus 1 s/d 3 Sebagai Prasyarat',
                desc: 'Kasus 1 s/d 3 telah tuntas dan tetap bebas diakses kapan saja untuk mengulas kembali logika percabangan dasar.'
              },
              {
                number: 3,
                title: 'Masuki Lab Telusur atau Tantangan',
                desc: 'Klik pin lokasi pada peta atau tombol modul di bawah kanvas untuk memulai pengujian kode.'
              }
            ]
            : [
              {
                number: 1,
                title: 'Pilih Pin Lokasi Kasus',
                desc: 'Klik salah satu pin lokasi: Kasus 1 (Lampu Lalu Lintas), Kasus 2 (Gerbang Sekolah), atau Kasus 3 (Kantin Pintar).'
              },
              {
                number: 2,
                title: 'Pelajari Misi Kasus',
                desc: 'Baca narasi masalah otomasi kota dan target output percabangan yang harus diselesaikan murid.'
              },
              {
                number: 3,
                title: 'Masuki Lab Telusur',
                desc: 'Gunakan tombol Lab Telusur pada modul aktif untuk menguji kebenaran algoritma.'
              }
            ],
          cycleNote: this.isCycle2Unlocked
            ? 'Fokus utama penyelidikan hari ini adalah menuntaskan Kasus 4 dan Kasus 5 hingga 100% Branch Coverage.'
            : 'Mulailah penyelidikan dari Kasus 1 sebelum berpindah ke tingkat kerumitan kasus berikutnya.',
          primaryActionLabel: 'Buka Peta Penyelidikan'
        };

      case 'MATERI':
        return {
          tag: this.isCycle2Unlocked ? 'Laboratorium Teori Siklus 2' : 'Laboratorium Teori Siklus 1',
          title: this.isCycle2Unlocked ? 'Fokus Materi Percabangan Lanjutan' : 'Laboratorium Konsep Percabangan',
          icon: 'book',
          purpose: this.isCycle2Unlocked
            ? 'Ruang pendalaman konsep percabangan bertingkat (else-if), operator logika relasional, dan struktur multi-kategori switch-case.'
            : 'Ruang pembelajaran terstruktur mengenai konsep percabangan logika, diagram alir (flowchart), dan aturan sintaks kode Java.',
          steps: this.isCycle2Unlocked
            ? [
              {
                number: 1,
                title: 'Materi 1 s/d 8 Bercentang Hijau',
                desc: 'Materi 1 s/d 8 telah kamu pelajari pada pertemuan sebelumnya. Seluruh materi ini tetap bebas kamu akses dan baca kembali kapan saja untuk mengingat konsep logika dasar.'
              },
              {
                number: 2,
                title: 'Pelajari Topik 9 & 10',
                desc: 'Misi utama penyelidikan kamu hari ini adalah mempelajari materi tingkat lanjut: Topik 9 (else-if & Logika) dan Topik 10 (switch-case).'
              },
              {
                number: 3,
                title: 'Selesaikan Cek Pemahaman',
                desc: 'Jawab kuis cek pemahaman pada tumpukan ketiga kartu materi hingga seluruh topik Siklus 2 tercentang hijau.'
              }
            ]
            : [
              {
                number: 1,
                title: 'Pilih Topik Secara Berurutan',
                desc: 'Buka materi dari daftar topik di sebelah kiri, mulai dari konsep dasar hingga percabangan IF.'
              },
              {
                number: 2,
                title: 'Pelajari 3 Tumpukan Kartu',
                desc: 'Cermati Tumpukan 1 (Konsep), Tumpukan 2 (Contoh Kode & Flowchart), dan Tumpukan 3 (Cek Pemahaman).'
              },
              {
                number: 3,
                title: 'Raih Centang Hijau',
                desc: 'Jawab kuis pemahaman di kartu ketiga untuk mencatat ketuntasan membaca materi murid.'
              }
            ],
          cycleNote: this.isCycle2Unlocked
            ? 'Target minimal Siklus 2: Pelajari Topik 9 dan Topik 10 secara cermat sebelum melakukan dry-run di Lab Telusur.'
            : 'Materi bercentang hijau menandakan murid telah siap mempraktikkan analisis kode pada kasus nyata.',
          primaryActionLabel: this.isCycle2Unlocked ? 'Pelajari Materi Siklus 2 Sekarang' : 'Mulai Belajar Materi',
          secondaryAction: this.isCycle2Unlocked
            ? {
              label: 'Tinjau Materi Sebelumnya',
              action: () => {
                this.activeMateriId = 'ptk-01';
                this.render();
                this.scrollToTop();
              }
            }
            : undefined
        };

      case 'TRACING':
        return {
          tag: 'Lab Uji Eksekusi Kode',
          title: 'Laboratorium Eksekusi Kode (Dry-Run Tracing)',
          icon: 'flask',
          purpose: 'Melatih penalaran komputasional dengan menelusuri jalannya eksekusi program baris demi baris secara interaktif.',
          steps: [
            {
              number: 1,
              title: 'Amati Kode & Flowchart',
              desc: 'Periksa kode algoritma Java pada panel kode dan alur diagram alir di panel visualisasi.'
            },
            {
              number: 2,
              title: 'Tentukan Nilai Input Uji',
              desc: 'Ketik nilai input pada kotak kontrol atau gunakan tombol pintas kasus uji yang disediakan.'
            },
            {
              number: 3,
              title: 'Lakukan Prediksi Logika',
              desc: 'Sebelum simulasi berjalan, tentukan apakah kondisi percabangan akan bernilai TRUE atau FALSE.'
            },
            {
              number: 4,
              title: 'Jalankan Eksekusi & Cek Memori',
              desc: 'Tekan tombol Jalankan Simulasi untuk melihat pergerakan baris aktif dan pembaruan nilai variabel di tabel memori.'
            },
            {
              number: 5,
              title: 'Raih 100% Branch Coverage',
              desc: 'Uji variasi nilai input lain hingga seluruh cabang percabangan berhasil dijelajahi tuntas.'
            }
          ],
          cycleNote: 'Alur telusur tersistematis: selesaikan prediksi dan simulasi cabang pertama agar tombol uji nilai lain terbuka.',
          primaryActionLabel: 'Mulai Menelusuri Kode'
        };

      case 'BATTLE':
        return {
          tag: 'Arena Tantangan Logika',
          title: 'Arena Pembasmi Bug Logika',
          icon: 'swords',
          purpose: 'Menguji ketangkasan dan akurasi evaluasi ekspresi kondisi boolean murid dalam suasana pertarungan logika interaktif.',
          steps: [
            {
              number: 1,
              title: 'Perhatikan Data Monster Bug',
              desc: 'Cermati nilai variabel dan ekspresi boolean yang muncul pada tubuh lawan atau papan arena.'
            },
            {
              number: 2,
              title: 'Evaluasi Kebenaran Kondisi',
              desc: 'Analisis apakah ekspresi relasional pada kondisi percabangan bernilai TRUE atau FALSE.'
            },
            {
              number: 3,
              title: 'Pilih Aksi Serangan Yang Benar',
              desc: 'Tekan tombol respon logika sebelum batas waktu berpikir habis untuk melancarkan serangan pembersih bug.'
            }
          ],
          cycleNote: 'Jawaban benar berturut-turut akan mengaktifkan multiplier combo yang melipatgandakan perolehan poin!',
          primaryActionLabel: 'Masuki Arena Tantangan'
        };

      case 'EVALUASI':
        return {
          tag: this.isCycle2Unlocked ? 'Asesmen Formatif Siklus 2' : 'Asesmen Formatif Siklus 1',
          title: this.isCycle2Unlocked ? 'Asesmen Pemahaman Logika Lanjut' : 'Asesmen Pemahaman Logika Dasar',
          icon: 'document',
          purpose: 'Murni sebagai asesmen penilaian formatif mandiri di dalam aplikasi untuk mengukur penguasaan murid terhadap penalaran alur percabangan dan analisis kode Java.',
          steps: this.isCycle2Unlocked
            ? [
              {
                number: 1,
                title: 'Materi Uji Logika Lanjut',
                desc: 'Soal mencakup analisis percabangan bertingkat else-if, operator logika relasional, dan struktur multi-kategori switch-case.'
              },
              {
                number: 2,
                title: 'Telusuri Alur Eksekusi Kode',
                desc: 'Cermati cuplikan kode program pada setiap butir soal dan telusuri nilai variabel outputnya secara mandiri.'
              },
              {
                number: 3,
                title: 'Tuntaskan Asesmen Penilaian',
                desc: 'Jawab 5 butir soal pilihan ganda secara cermat untuk memperoleh skor asesmen formatif resmi di aplikasi.'
              }
            ]
            : [
              {
                number: 1,
                title: 'Materi Uji Logika Dasar',
                desc: 'Soal mencakup analisis kondisi percabangan IF tunggal, IF-ELSE, dan IF bersarang.'
              },
              {
                number: 2,
                title: 'Analisis Alur Kode Program',
                desc: 'Perhatikan ekspresi boolean pada setiap butir soal untuk menentukan cabang logika yang dijalankan.'
              },
              {
                number: 3,
                title: 'Tuntaskan Asesmen Penilaian',
                desc: 'Jawab 5 butir soal pilihan ganda secara cermat untuk memperoleh skor asesmen formatif resmi di aplikasi.'
              }
            ],
          cycleNote: 'Halaman ini murni sebagai asesmen penilaian pemahaman logika di dalam game. Lembar Google Form Posttest baru dikerjakan nanti secara terpisah pada halaman Progres.',
          primaryActionLabel: 'Mulai Kerjakan Asesmen'
        };

      case 'PROGRES':
        return {
          tag: 'Portofolio & Laporan',
          title: 'Rekapitulasi Capaian & Pengiriman Bukti',
          icon: 'trophy',
          purpose: 'Melihat rekapitulasi 3 pilar hasil belajar murid dan menyinkronkan bukti portofolio ke server Google Drive Guru.',
          steps: [
            {
              number: 1,
              title: 'Periksa 3 Pilar Capaian',
              desc: 'Tinjau persentase Pembacaan Materi, Cakupan Telusur (Branch Coverage), dan Skor Evaluasi/Arena.'
            },
            {
              number: 2,
              title: 'Langkah 1: Kirim ke Drive Guru',
              desc: 'Tekan tombol "Kirim Data ke Google Drive Guru" agar berkas nilai dan log aktivitas murid tersimpan di spreadsheet kelas.'
            },
            {
              number: 3,
              title: 'Langkah 2: Kerjakan Posttest',
              desc: 'Klik tombol "Buka Posttest" untuk mengisi instrumen kuesioner evaluasi akhir siklus.'
            }
          ],
          cycleNote: 'Pastikan tombol Langkah 1 berhasil mengirimkan data (status sukses) sebelum sesi pembelajaran di kelas berakhir.',
          primaryActionLabel: 'Tinjau Progres Belajar'
        };

      case 'MENU':
        return {
          tag: 'Pusat Komando',
          title: 'Beranda Investigasi iobranch',
          icon: 'gamepad',
          purpose: 'Pusat komando detektif kode untuk menguasai materi algoritma percabangan di Kota Harmoni.',
          steps: [
            {
              number: 1,
              title: 'Mulai dari Panduan',
              desc: 'Bagi murid yang baru pertama kali bergabung, pelajari panduan alur 8 langkah terlebih dahulu.'
            },
            {
              number: 2,
              title: 'Buka Peta Investigasi',
              desc: 'Akses peta kota untuk memilih kasus masalah dan mulai menelusuri kode di Lab Telusur.'
            },
            {
              number: 3,
              title: 'Pantau Nilai Portofolio',
              desc: 'Periksa ketercapaian 3 pilar nilai pada halaman Progres secara berkala.'
            }
          ],
          cycleNote: 'Gunakan bilah tab navigasi di bagian atas layar untuk berpindah antar ruangan belajar dengan cepat.',
          primaryActionLabel: 'Lanjutkan Belajar'
        };

      case 'DIALOG':
        return {
          tag: 'Pengantar Cerita',
          title: 'Pengarahan Misi Bersama Pak Budi',
          icon: 'chat',
          purpose: 'Mendengarkan arahan naratif dari mentor Pak Budi mengenai krisis algoritma otomasi di Kota Harmoni.',
          steps: [
            {
              number: 1,
              title: 'Pahami Narasi Kasus',
              desc: 'Baca konteks masalah algoritma yang mengganggu sistem operasional kota.'
            },
            {
              number: 2,
              title: 'Pilih Respon Percakapan',
              desc: 'Gunakan tombol opsi respons untuk berinteraksi dengan mentor.'
            },
            {
              number: 3,
              title: 'Menuju Peta Kasus',
              desc: 'Setelah briefing selesai, buka peta kota untuk memilih modul kasus yang ingin diselesaikan.'
            }
          ],
          cycleNote: 'Pemahaman cerita kasus membantu murid mengaitkan algoritma dengan pemecahan masalah di dunia nyata.',
          primaryActionLabel: 'Lanjutkan Dialog'
        };

      default:
        return {
          tag: 'Panduan Pembelajaran',
          title: `Petunjuk Layar ${screen}`,
          icon: 'bulb',
          purpose: 'Memandu langkah belajar murid pada aktivitas pembelajaran ini.',
          steps: [
            {
              number: 1,
              title: 'Ikuti Alur Belajar',
              desc: 'Pelajari petunjuk yang tersedia dan selesaikan misi yang ditugaskan.'
            }
          ],
          primaryActionLabel: 'Saya Paham'
        };
    }
  }

  /**
   * Menampilkan Pop-up Modal kontekstual yang menginformasikan tujuan dan langkah misi murid di setiap halaman
   */
  public showScreenContextGuidanceModal(screen: ScreenId, _isManualTrigger = false): void {
    // Cegah penumpukan jika modal panduan sedang terbuka
    const existingModal = document.querySelector('.screen-guide-modal-backdrop');
    if (existingModal) {
      existingModal.remove();
    }

    soundFx.playButtonBlip();

    const config = this.getScreenGuidanceConfig(screen);

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop screen-guide-modal-backdrop';
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(28, 25, 23, 0.78);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2250;
      padding: 16px;
      box-sizing: border-box;
    `;

    const stepsHtml = config.steps
      .map(
        (step) => `
      <div class="screen-guide-step-card" style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; background: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 8px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.03);">
        <div class="screen-guide-step-badge" style="width: 22px; height: 22px; border-radius: 6px; background: var(--primary); color: #FFFFFF; font-family: var(--font-pixel); font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;">
          ${step.number}
        </div>
        <div style="flex: 1; font-size: 11.5px; line-height: 1.45;">
          <strong style="color: var(--text-primary); font-size: 12px; display: block; margin-bottom: 2px;">${step.title}</strong>
          <span style="color: var(--text-secondary);">${step.desc}</span>
        </div>
      </div>
    `
      )
      .join('');

    const cycleNoteHtml = config.cycleNote
      ? `
      <div style="padding: 10px 12px; background: rgba(217, 119, 6, 0.08); border: 1px solid rgba(217, 119, 6, 0.28); border-radius: 8px; display: flex; align-items: flex-start; gap: 8px;">
        <span style="color: var(--warning-dark); flex-shrink: 0; margin-top: 2px;">
          ${renderPixelIcon('bulb', 13, 'var(--warning-dark)')}
        </span>
        <div style="font-size: 11.5px; color: var(--text-primary); line-height: 1.45;">
          <strong style="color: var(--warning-dark);">Tips Investigasi:</strong> ${config.cycleNote}
        </div>
      </div>
    `
      : '';

    const secondaryBtnHtml = config.secondaryAction
      ? `
      <button id="btn-secondary-screen-guide" type="button" class="game-btn game-btn-secondary" style="width: 100%; min-height: 40px; font-size: 11.5px;">
        ${config.secondaryAction.label}
      </button>
    `
      : '';

    overlay.innerHTML = `
      <div class="tactile-card screen-guide-modal-card" role="dialog" aria-modal="true" aria-label="Petunjuk Halaman ${config.title}" style="
        max-width: 520px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        padding: 22px 20px;
        background: #FFFFFF;
        border: 2px solid var(--primary);
        border-radius: 12px;
        box-shadow: 0 16px 40px rgba(15, 118, 110, 0.25);
        text-align: left;
        box-sizing: border-box;
        overflow: hidden;
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1.5px solid var(--border-retro); padding-bottom: 10px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(15, 118, 110, 0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${renderPixelIcon(config.icon, 20, 'var(--primary)')}
            </div>
            <div>
              <span class="eyebrow-label" style="font-size: 8.5px; color: var(--primary); margin: 0; letter-spacing: 0.5px;">
                ${config.tag}
              </span>
              <h2 style="font-family: var(--font-pixel); font-size: 13px; color: var(--text-primary); margin: 2px 0 0; letter-spacing: 0.3px; line-height: 1.3;">
                ${config.title}
              </h2>
            </div>
          </div>
          <button id="btn-close-screen-guide" type="button" class="btn-close-modal" aria-label="Tutup Petunjuk" style="background: none; border: none; font-size: 16px; color: var(--text-muted); cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
            ✕
          </button>
        </div>

        <div class="screen-guide-body-scroll" style="overflow-y: auto; padding-right: 4px; margin: 4px 0 16px; display: flex; flex-direction: column; gap: 11px; flex: 1;">
          <div style="padding: 10px 12px; background: var(--surface-panel-alt); border: 1px solid var(--border-retro); border-radius: 8px; display: flex; align-items: flex-start; gap: 8px;">
            <span style="color: var(--primary); flex-shrink: 0; margin-top: 1px;">
              ${renderPixelIcon('target', 13, 'var(--primary)')}
            </span>
            <div style="font-size: 11.5px; color: var(--text-primary); line-height: 1.45;">
              <strong>Tujuan Halaman Ini:</strong> ${config.purpose}
            </div>
          </div>

          <div>
            <div style="font-size: 11.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 7px; display: flex; align-items: center; gap: 6px;">
              ${renderPixelIcon('check', 11, 'var(--primary)')}
              <span>Apa Yang Harus Dilakukan Murid:</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 7px;">
              ${stepsHtml}
            </div>
          </div>

          ${cycleNoteHtml}
        </div>

        <div style="display: flex; gap: 8px; flex-direction: column; flex-shrink: 0; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
          <button id="btn-confirm-screen-guide" type="button" class="game-btn game-btn-primary" style="width: 100%; min-height: 44px; font-size: 12px; font-weight: 700; gap: 8px;">
            ${renderPixelIcon('check', 13, '#ffffff')} ${config.primaryActionLabel}
          </button>
          ${secondaryBtnHtml}
        </div>
      </div>
    `;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundFx.playButtonBlip();
        closeOverlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const closeOverlay = () => {
      window.removeEventListener('keydown', handleKeyDown);
      overlay.remove();
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        soundFx.playButtonBlip();
        closeOverlay();
      }
    });

    overlay.querySelector('#btn-close-screen-guide')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      closeOverlay();
    });

    overlay.querySelector('#btn-confirm-screen-guide')?.addEventListener('click', () => {
      soundFx.playLogicTrue();
      closeOverlay();
      if (screen === 'MATERI' && this.isCycle2Unlocked) {
        const unreadC2 = MATERI_BANK.find((t) => t.cycleRequired === 2 && !this.readMateriIds.includes(t.id));
        this.activeMateriId = unreadC2 ? unreadC2.id : 'ptk-04';
        this.render();
        this.scrollToTop();
      } else if (screen === 'TRACING') {
        window.setTimeout(() => {
          if (this.currentScreen === 'TRACING') {
            this.showMissionGuidanceToast(1);
          }
        }, 150);
      }
    });

    overlay.querySelector('#btn-secondary-screen-guide')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      closeOverlay();
      if (config.secondaryAction) {
        config.secondaryAction.action();
      }
    });

    document.body.appendChild(overlay);
  }

  /**
   * Memeriksa dan memicu Pop-Up Modal petunjuk kontekstual ketika pertama kali murid masuk ke suatu layar
   */
  public checkAndTriggerScreenGuidanceModal(screen: ScreenId): void {
    // Layar yang mendukung panduan kontekstual otomatis
    const autoScreens: ScreenId[] = ['PANDUAN', 'OVERWORLD', 'MATERI', 'TRACING', 'BATTLE', 'EVALUASI', 'PROGRES'];
    if (!autoScreens.includes(screen)) return;

    const visitKey = `${screen}_c${this.isCycle2Unlocked ? '2' : '1'}`;
    if (this.shownScreenGuidanceSet.has(visitKey)) {
      return;
    }

    // Tandai sudah pernah ditampilkan
    this.shownScreenGuidanceSet.add(visitKey);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('iobranch_shown_screen_guidance', JSON.stringify(Array.from(this.shownScreenGuidanceSet)));
      }
    } catch {
      // Abaikan
    }

    // Tampilkan modal setelah sedikit jeda agar DOM layar stabil
    window.setTimeout(() => {
      if (this.currentScreen === screen) {
        this.showScreenContextGuidanceModal(screen, false);
      }
    }, 220);
  }

  /**
   * Menampilkan Pop-up Modal pengingat fokus materi saat Siklus 2 aktif (alias terpadu ke panduan MATERI)
   */
  public showCycle2MateriReminderModal(): void {
    this.showScreenContextGuidanceModal('MATERI', true);
  }

  /**
   * Menampilkan pesan notifikasi pop retro elegan pengganti window.alert
   */
  public showRetroToast(message: string, isSuccess = true): void {
    let container = document.querySelector<HTMLElement>('.retro-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'retro-toast-container';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }

    // Bersihkan toast lama agar tidak terjadi penumpukan
    container.innerHTML = '';

    // Tutup toast panduan misi jika sedang aktif agar tidak terjadi tabrakan visual (split-attention)
    const existingMissionToast = document.querySelector<HTMLElement>('.mission-guidance-toast');
    if (existingMissionToast) {
      existingMissionToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `retro-toast-pill ${isSuccess ? 'retro-toast-success' : 'retro-toast-warning'}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <span class="retro-toast-icon">
        ${renderPixelIcon(isSuccess ? 'check' : 'bulb', 13, isSuccess ? '#0F766E' : '#D97706')}
      </span>
      <span class="retro-toast-text">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    window.setTimeout(() => {
      toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      window.setTimeout(() => toast.remove(), 260);
    }, 2800);
  }

  /**
   * Menyinkronkan status visual tombol saklar BGM (Footer dan Settings)
   */
  private updateAllBgmButtons(isPlaying: boolean): void {
    // 1. Sinkronisasi Tombol di Footer Universal Bawah
    const footerBgm = document.getElementById('btn-footer-bgm');
    if (footerBgm) {
      const icon = footerBgm.querySelector('.footer-bgm-icon');
      const label = footerBgm.querySelector('.footer-bgm-label');
      if (icon) icon.innerHTML = renderPixelIcon(isPlaying ? 'music' : 'music-off', 12, 'currentColor');
      if (label) label.textContent = isPlaying ? 'Musik ON' : 'Musik OFF';
    }

    // 2. Sinkronisasi Tombol di Layar Pengaturan (Settings)
    const settingsBgm = document.getElementById('btn-toggle-bgm-settings');
    if (settingsBgm) {
      settingsBgm.className = `game-btn ${isPlaying ? 'game-btn-secondary' : 'game-btn-primary'}`;
      settingsBgm.innerHTML = `
        ${renderPixelIcon(isPlaying ? 'music-off' : 'music', 14, 'currentColor')}
        ${isPlaying ? 'Matikan Musik Latar' : 'Nyalakan Musik Latar'}
      `;
    }
  }
}
