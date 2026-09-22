// src/ui/UIManager.ts - Pengendali 12 Layar Antarmuka Retro GBA DOM (SSOT: DESIGN.md & antislop-ui)
import { CASE_MODULES } from '../logic/modules.data';
import { MATERI_BANK, getMateriTopicById } from '../logic/materi.data';
import { CaseModule } from '../types/module.types';
import { StudentSession, ModuleProgress, TeamSymbol, ProgressionState, FormativeScores } from '../types/session.types';
import { StorageService } from '../services/StorageService';
import { soundFx } from '../services/AudioService';
import { AssessmentExportService } from '../services/AssessmentExportService';
import { CycleGuard } from '../logic/CycleGuard';
import { traceModuleExecution, TraceExecutionResult, validateNumericInput } from '../logic/TracerEngine';
import { EventCenter } from '../game/EventCenter';
import { SyntaxRenderer } from './SyntaxRenderer';
import { CoverageView, MODULE_BRANCHES } from './CoverageView';
import { FlowgorithmView } from './FlowgorithmView';
import { renderTeamSymbolPixelArt, TEAM_SYMBOLS_DATA } from './TeamSymbolRenderer';
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
  | 'cross';

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

  // State Tracing
  private isInputApplied: boolean = false;
  private currentInputValue: number = CASE_MODULES[0]!.defaultInput;
  private currentTraceResult: TraceExecutionResult | null = null;
  private currentStepIndex = 0;
  private userPrediction: string | null = null;
  private autoPlayTimer: number | null = null;
  private isTracingHeroCollapsed: boolean = false;
  private bypassTracingGuardOnce: boolean = false;

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

  // State Tab Dasbor Progres (Layar 08)
  private activeProgressTab: 'BADGES' | 'MODULES' | 'EXPORT' = 'BADGES';

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
    this.formativeScores = await StorageService.getFormativeScores();

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
    EventCenter.on('CYCLE_UNLOCKED', (cycle: number) => {
      this.isCycle2Unlocked = cycle >= 2;
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
    const hasSession = !!(this.progressionState?.stepRegistrationCompleted || (this.session && this.session.student1Name && this.session.student2Name));
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
          title: 'Daftarkan Tim Terlebih Dahulu',
          desc: 'Kalian harus mendaftarkan Nomor Absen serta Nama Lengkap kedua murid pada menu Beranda sebelum dapat menjelajah kota dan membaca materi.',
          redirectScreen: 'MENU'
        };
      case 'MATERI':
        if (!this.progressionState?.stepDialogCompleted) {
          return {
            stepNum: 'Langkah 01',
            title: 'Temui Guru Pak Budi Terlebih Dahulu',
            desc: 'Kalian harus menemui dan berbicara terlebih dahulu dengan Guru Pak Budi di ujung kiri jalan (di antara pohon) untuk orientasi masalah sebelum ruang kelas materi dibuka.',
            redirectScreen: 'DIALOG'
          };
        }
        return {
          stepNum: 'Langkah 01',
          title: 'Daftarkan Tim Terlebih Dahulu',
          desc: 'Kalian harus mendaftarkan Nomor Absen serta Nama Lengkap kedua murid pada menu Beranda sebelum dapat menjelajah kota dan membaca materi.',
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
          desc: 'Jawab semua butir soal evaluasi pemahaman di tab EVALUASI untuk membuka rekap nilai, lencana prestasi, dan sertifikat tim.',
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
      ? ['m01', 'm02', 'm03', 'm04', 'm05']
      : ['m01', 'm02', 'm03'];
    // Akses terbuka jika semua kasus sudah dijelajahi (explored) ATAU terbukti benar (tested)
    return requiredModuleIds.every((id) => {
      const prog = this.allModuleProgress[id];
      return (prog?.testedBranches?.length || 0) >= 1 || (prog?.exploredBranches?.length || 0) >= 1;
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
          const requiredCount = this.isCycle2Unlocked ? 5 : 3;
          this.showCelebrationModal(
            'Sesi Lab Telusur Sedang Berjalan',
            `Kalian belum menuntaskan pengujian cabang kondisi (Target Bintang 2 per kasus) pada ${requiredCount} kasus ${currentCycleText}. Apakah kalian yakin ingin meninggalkan meja kerja telusur?`,
            [
              {
                label: 'Lanjutkan Pengujian Cabang',
                isPrimary: true,
                action: () => {}
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
        'Selesaikan seluruh 5 ronde evaluasi kondisi pada pertarungan ini terlebih dahulu agar capaian belajar tercatat dengan akurat. Apakah kalian yakin ingin keluar?',
        [
          {
            label: 'Lanjutkan Pertarungan',
            isPrimary: true,
            action: () => {}
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
        'Kalian sedang mengerjakan soal evaluasi pemahaman konsep logika percabangan. Selesaikan seluruh butir soal terlebih dahulu sebelum berpindah ke halaman lain. Apakah kalian yakin ingin keluar?',
        [
          {
            label: 'Lanjutkan Pengerjaan Soal',
            isPrimary: true,
            action: () => {}
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
      const isAlreadyCompleted = Boolean(this.progressionState?.stepBattleCompleted);
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
            'Kalian telah menyelesaikan misi Tantangan ini sebelumnya. Tim kalian dipersilakan berlatih kembali untuk mengasah pemahaman evaluasi kondisi percabangan, namun sesi latihan ini tidak mengubah nilai formatif resmi kalian.',
            [
              {
                label: 'Mulai Latihan Mandiri',
                isPrimary: true,
                action: () => {}
              }
            ]
          );
        }, 120);
      }
    }

    // Inisialisasi status sesi saat memasuki layar EVALUASI
    if (screen === 'EVALUASI') {
      const isAlreadyCompleted = Boolean(this.progressionState?.stepEvaluationCompleted);
      this.isEvaluasiPracticeMode = isAlreadyCompleted;
      this.isEvaluasiSessionActive = true;
      this.currentQuestionIndex = 0;
      this.selectedAnswer = null;
      this.answerSubmitted = false;
      this.evaluasiAnswers = [];
      this.evaluasiCorrectCount = 0;

      if (isAlreadyCompleted) {
        window.setTimeout(() => {
          this.showCelebrationModal(
            'Mode Latihan Evaluasi',
            'Tim kalian telah menyelesaikan evaluasi resmi Siklus 1 sebelumnya. Kalian dipersilakan mengerjakan ulang untuk memperdalam pemahaman konsep logika percabangan, namun nilai formatif resmi tetap menggunakan hasil pengerjaan pertama.',
            [
              {
                label: 'Mulai Latihan Mandiri',
                isPrimary: true,
                action: () => {}
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

      void StorageService.getFormativeScores().then((scores) => {
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
            'Tim kalian telah menyelesaikan misi Lab Telusur ini sebelumnya. Tim kalian dipersilakan berlatih kembali untuk mengasah pemahaman penelusuran kondisi percabangan, namun sesi latihan ini tidak mengubah nilai formatif resmi kalian.',
            [
              {
                label: 'Mulai Latihan Mandiri',
                isPrimary: true,
                action: () => {}
              }
            ]
          );
        }, 120);
      }
    }

    // Sinkronisasi realtime nilai formatif saat membuka layar PROGRES
    if (screen === 'PROGRES') {
      void StorageService.getFormativeScores().then((scores) => {
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
    }

    this.renderGlobalHeader();
    this.renderGlobalFooter();
    this.render();
    this.scrollToTop();
    requestAnimationFrame(() => {
      this.scrollToTop();
    });
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
    const screenWrapper = document.createElement('div');
    screenWrapper.className = 'screen-content-wrapper';
    screenWrapper.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      padding: ${this.currentScreen === 'MENU' ? '0' : '14px 16px'};
      max-width: ${this.currentScreen === 'MENU' || isGameVisible ? '100%' : '1060px'};
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      overflow-x: hidden;
    `;

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
        screenWrapper.appendChild(this.renderScreenDialog());
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

    // Logo Resmi & Ketuk 3x untuk Akses Guru
    const logoWrapper = document.createElement('div');
    logoWrapper.className = 'navbar-brand-wrapper';
    logoWrapper.innerHTML = `
      <div class="navbar-brand-plate">
        <img src="/assets/logo.webp" alt="iobranch Logo" class="navbar-brand-logo" />
        <div class="navbar-brand-meta">
          <span class="navbar-brand-title">IOBRANCH</span>
          <span class="navbar-brand-subtitle eyebrow-label">
            SIKLUS ${this.isCycle2Unlocked ? '2 (MAJU)' : '1 (DASAR)'}
          </span>
        </div>
        ${this.session
        ? `<span class="badge-pill navbar-team-badge" style="font-family: var(--font-code); font-size: 10px; font-weight: 700; color: var(--warning); border-color: rgba(217, 119, 6, 0.4); background: rgba(217, 119, 6, 0.1); display: inline-flex; align-items: center; gap: 5px;">
                ${renderTeamSymbolPixelArt(this.session.teamSymbol, 15)}
                <span>[${this.session.pairId}]</span>
              </span>`
        : ''
      }
      </div>
    `;

    logoWrapper.addEventListener('click', () => {
      this.handleLogoClick();
    });

    // Container Navigasi Tab dengan Tombol Bantuan Scroll
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'gba-tab-nav-container';

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

    nav.appendChild(logoWrapper);
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
        <span class="footer-brand-name">IOBRANCH</span>
      </div>

      <div class="footer-controls-minimal">
        <button id="btn-footer-bgm" class="footer-btn-minimal" type="button" aria-label="Toggle Musik Latar" title="Nyalakan atau Matikan Musik Latar">
          <span class="footer-bgm-icon">${renderPixelIcon(isBgmActive ? 'music' : 'music-off', 13, 'currentColor')}</span>
          <span class="footer-bgm-label">${isBgmActive ? 'Musik ON' : 'Musik OFF'}</span>
        </button>
        <button id="btn-footer-audio" class="footer-btn-minimal" type="button" aria-label="Toggle Audio" title="Bisu / Aktifkan Suara Efek">
          <span class="footer-audio-icon">${renderPixelIcon(isMuted ? 'speaker-off' : 'speaker', 13, 'currentColor')}</span>
          <span class="footer-audio-label">${isMuted ? 'Bisu' : 'Suara'}</span>
        </button>
        <span class="footer-version-minimal">v1.0</span>
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
          iconSpan.innerHTML = renderPixelIcon(muted ? 'speaker-off' : 'speaker', 13, 'currentColor');
        }
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
  private renderScreenMenu(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'hero-landing-wrapper';

    const hasSession = !!this.session;
    const hasReadGuide = !!(this.progressionState?.stepGuideCompleted || this.progressionState?.teacherBypassMode || hasSession);

    wrapper.innerHTML = `
      <div class="hero-landing-overlay"></div>

      <!-- Kartu Menu Interaktif (Tactile Parchment Dossier) -->
      <div class="hero-menu-card tactile-card">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
            <img id="hero-menu-logo" src="/assets/logo.webp" alt="iobranch Logo" style="height: 52px; width: auto; object-fit: contain; cursor: pointer; user-select: none;" title="iobranch" />
          </div>
          <h1 style="font-family: var(--font-pixel); font-size: 15px; color: var(--primary); margin: 0 0 6px; letter-spacing: 0.5px;">
            IOBRANCH: LOGIC BRANCHING
          </h1>
          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
            Media Pembelajaran Interaktif Penelusuran Alur Kode (Tracing) dan Percabangan Logika
          </p>
        </div>

        <!-- Info Sesi Pasangan Aktif (Jika Terdaftar) atau Banner Langkah 1 (Jika Belum) -->
        ${this.session
        ? `
          <div class="tactile-panel" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding: 12px 14px; background: #ffffff; border: 1px solid rgba(15, 118, 110, 0.25); border-radius: 10px; gap: 10px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.03);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 38px; height: 38px; border-radius: 8px; background: var(--surface-panel-alt); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${renderTeamSymbolPixelArt(this.session.teamSymbol, 28)}
              </div>
              <div>
                <span class="eyebrow-label" style="color: var(--primary); font-size: 9px;">TIM ${escapeHtml(this.session.teamSymbol.toUpperCase())}</span>
                <div style="font-size: 12.5px; font-weight: 700; color: var(--text-primary);">${escapeHtml(this.session.pairId)} (${escapeHtml(this.session.student1Name)} &amp; ${escapeHtml(this.session.student2Name)})</div>
              </div>
            </div>
            <span class="badge-pill" style="color: var(--primary); background: rgba(15, 118, 110, 0.08); border-color: rgba(15, 118, 110, 0.25); font-weight: 700; flex-shrink: 0;">
              Nilai Formatif: ${this.formativeScores?.finalScore ?? 0} / 100
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 8px 12px; background: var(--surface-panel-alt); border-radius: 8px; border: 1px solid var(--border-subtle);">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="eyebrow-label" style="font-size: 9.5px; color: var(--text-secondary);">TAHAP BELAJAR:</span>
              <span style="font-size: 11.5px; font-weight: 700; color: ${this.isCycle2Unlocked ? 'var(--warning)' : 'var(--primary)'};">
                ${this.isCycle2Unlocked ? 'Siklus 2 (Maju)' : 'Siklus 1 (Dasar)'}
              </span>
            </div>
            ${!this.isCycle2Unlocked
          ? `<button id="btn-menu-token" type="button" class="game-btn game-btn-gold" style="font-size: 11px; padding: 6px 12px; min-height: 40px; display: inline-flex; align-items: center; gap: 6px;" title="Masukkan Token Kelas dari Guru">
                  ${renderPixelIcon('lock', 11, '#ffffff')} Buka Siklus 2
                </button>`
          : `<span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--success); border-color: var(--success); background: rgba(21, 128, 61, 0.1);">
                  ${renderPixelIcon('check', 10, 'var(--success)')} TERBUKA
                </span>`
        }
          </div>
        `
        : `
          <!-- Indikator Alur Pembuka Pendaftaran -->
          <div class="tactile-panel" style="margin-bottom: 12px; padding: 10px 14px; background: var(--surface-panel-alt); border-radius: 8px; border: 1.5px solid ${hasReadGuide ? 'var(--success)' : 'var(--warning)'}; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: ${hasReadGuide ? 'rgba(21, 128, 61, 0.15)' : 'rgba(217, 119, 6, 0.15)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${renderPixelIcon(hasReadGuide ? 'check' : 'book', 15, hasReadGuide ? 'var(--success)' : 'var(--warning)')}
              </div>
              <div>
                <div style="font-family: var(--font-pixel); font-size: 10px; color: ${hasReadGuide ? 'var(--success)' : 'var(--warning)'}; letter-spacing: 0.3px;">
                  ${hasReadGuide ? 'Langkah 1 Selesai' : 'Langkah 1: Baca Panduan'}
                </div>
                <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
                  ${hasReadGuide ? 'Panduan telah dipahami. Silakan lakukan pendaftaran tim.' : 'Wajib membaca panduan sebelum mendaftar.'}
                </div>
              </div>
            </div>
            ${hasReadGuide ? `
              <span class="badge-pill" style="font-size: 9.5px; color: var(--success); border-color: var(--success); font-weight: bold; flex-shrink: 0;">
                Siap Daftar
              </span>
            ` : ''}
          </div>
        `
      }

        <div style="display: flex; flex-direction: column; gap: 9px;">
          ${!hasSession && !hasReadGuide ? `
            <button id="btn-menu-panduan" type="button" class="game-btn game-btn-gold" style="width: 100%; min-height: 48px; font-size: 12px; letter-spacing: 0.3px; font-family: var(--font-pixel); gap: 8px;">
              ${renderPixelIcon('book', 13, '#ffffff')} 1. Baca Panduan (Wajib)
            </button>
            <button id="btn-start-game" type="button" class="game-btn" style="width: 100%; min-height: 46px; font-size: 11.5px; background: var(--surface-panel-alt); border: 1px solid var(--border-subtle); color: var(--text-muted); gap: 8px; cursor: pointer;" title="Baca panduan petualangan terlebih dahulu">
              ${renderPixelIcon('lock', 12, 'var(--text-muted)')} 2. Mulai Pendaftaran (Terkunci)
            </button>
            <button id="btn-menu-settings" type="button" class="game-btn game-btn-secondary" style="width: 100%; min-height: 44px; font-size: 12.5px;">
              ${renderPixelIcon('gear', 14, 'var(--primary)')} Pengaturan Sistem
            </button>
          ` : `
            <button id="btn-start-game" type="button" class="game-btn game-btn-gold" style="width: 100%; min-height: 48px; font-size: 12.5px; letter-spacing: 0.3px; font-family: var(--font-pixel);">
              ${renderPixelIcon('play', 12, '#ffffff')} ${this.session ? 'Lanjutkan Misi' : 'Mulai Pendaftaran'}
            </button>
            <button id="btn-menu-overworld" type="button" class="game-btn game-btn-secondary" style="width: 100%; min-height: 44px; font-size: 12.5px;">
              ${renderPixelIcon('map', 14, 'var(--primary)')} Peta Kota Harmoni
            </button>
            <button id="btn-menu-panduan" type="button" class="game-btn game-btn-secondary" style="width: 100%; min-height: 44px; font-size: 12.5px;">
              ${renderPixelIcon('help', 14, 'var(--primary)')} Panduan Petualangan ${hasReadGuide ? renderPixelIcon('check', 11, 'var(--success)') : ''}
            </button>
            <button id="btn-menu-settings" type="button" class="game-btn game-btn-secondary" style="width: 100%; min-height: 44px; font-size: 12.5px;">
              ${renderPixelIcon('gear', 14, 'var(--primary)')} Pengaturan Sistem
            </button>
            ${this.session
        ? `<button id="btn-menu-reset" type="button" class="game-btn" style="width: 100%; min-height: 38px; background: transparent; border: 1.5px solid rgba(220, 38, 38, 0.4); color: var(--danger); font-size: 11.5px;">
                      ${renderPixelIcon('refresh', 13, 'var(--danger)')} Ganti Identitas Tim
                    </button>`
        : ''
      }
          `}
        </div>

        <div style="margin-top: 16px; padding-top: 10px; border-top: 1px solid var(--border-retro); font-family: var(--font-code); font-size: 10px; color: var(--text-muted); text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--success);"></span>
          Mode Offline Aktif • Data tersimpan di perangkat
        </div>
      </div>
    `;

    wrapper.querySelector('#hero-menu-logo')?.addEventListener('click', () => {
      this.handleLogoClick();
    });

    wrapper.querySelector('#btn-menu-token')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.showStudentTokenModal();
    });

    wrapper.querySelector<HTMLButtonElement>('#btn-start-game')?.addEventListener('click', () => {
      if (!this.session) {
        if (!hasReadGuide) {
          soundFx.playLogicFalse();
          this.showRetroToast('Kalian wajib membaca Panduan Petualangan terlebih dahulu sebelum mendaftar!', false);
          setTimeout(() => {
            this.setScreen('PANDUAN');
          }, 500);
          return;
        }
        soundFx.playButtonBlip();
        this.showOnboardingModal();
      } else {
        soundFx.playButtonBlip();
        this.setScreen('OVERWORLD');
      }
    });

    wrapper.querySelector<HTMLButtonElement>('#btn-menu-overworld')?.addEventListener('click', () => {
      this.setScreen('OVERWORLD');
    });

    wrapper.querySelector<HTMLButtonElement>('#btn-menu-panduan')?.addEventListener('click', () => {
      this.setScreen('PANDUAN');
    });

    wrapper.querySelector<HTMLButtonElement>('#btn-menu-settings')?.addEventListener('click', () => {
      this.setScreen('SETTINGS');
    });

    wrapper.querySelector<HTMLButtonElement>('#btn-menu-reset')?.addEventListener('click', () => {
      this.showCelebrationModal(
        'Ganti Pasangan Belajar',
        'Apakah kalian yakin ingin mengganti akun tim belajar? Data progres yang telah dicapai tetap tersimpan di penyimpanan perangkat lokal.',
        [
          {
            label: 'Ganti Tim',
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
  // Layar: Panduan Permainan & Alur Aksi Peserta (Pair Programming)
  // =================================================================
  private renderScreenPanduan(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'guide-page-container';

    const hasSession = !!this.session;
    const hasReadGuide = !!(this.progressionState?.stepGuideCompleted || this.progressionState?.teacherBypassMode || hasSession);

    container.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      max-width: 960px;
      margin: 0 auto;
      padding-bottom: 24px;
    `;

    container.innerHTML = `
      <!-- 1. Header Panduan Dossier -->
      <div class="tactile-card" style="padding: 22px 24px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
          <div>
            <span class="eyebrow-label" style="color: var(--primary); margin-bottom: 4px; display: block;">
              Panduan Belajar Murid • Informatika
            </span>
            <h1 style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin: 4px 0 2px; letter-spacing: 0.2px;">
              Petunjuk Petualangan &amp; Alur Misi Logika
            </h1>
            <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
              Panduan terstruktur untuk menelusuri logika percabangan <em>if-else</em> secara berpasangan.
            </p>
          </div>
          <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; color: var(--warning-dark); background: rgba(217, 119, 6, 0.08); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(217, 119, 6, 0.2); letter-spacing: 0.3px;">
            <span style="width: 5px; height: 5px; border-radius: 50%; background-color: var(--warning-dark);"></span>
            1 Gawai • 2 Murid
          </span>
        </div>

        <!-- Kartu Kolaborasi Berpasangan (Pair Programming) -->
        <div style="padding: 16px 18px; border: 1px solid rgba(15, 118, 110, 0.18); background: rgba(15, 118, 110, 0.02); border-radius: 10px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px; border-radius: 6px; background: rgba(15, 118, 110, 0.08); font-size: 11px; font-weight: 700; color: var(--primary);">
              ${renderPixelIcon('gamepad', 13, 'var(--primary)')} Pola Belajar Berpasangan (Pair Programming)
            </span>
          </div>
          <p style="font-size: 12.5px; color: var(--text-primary); line-height: 1.6; margin-bottom: 10px;">
            Kalian belajar dalam tim beranggotakan <strong>2 orang murid dengan 1 smartphone/komputer bersama</strong>:
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; font-size: 12px; color: var(--text-secondary);">
            <div style="padding: 12px 14px; background: #ffffff; border: 1px solid rgba(28, 25, 23, 0.07); border-radius: 8px; box-shadow: 0 1px 2px rgba(28, 25, 23, 0.02);">
              <strong style="color: var(--primary); display: block; margin-bottom: 2px;">Pengendali Layar (Gawai):</strong>
              Memasukkan angka uji coba, menentukan tebakan alur, dan menekan tombol telusur.
            </div>
            <div style="padding: 12px 14px; background: #ffffff; border: 1px solid rgba(28, 25, 23, 0.07); border-radius: 8px; box-shadow: 0 1px 2px rgba(28, 25, 23, 0.02);">
              <strong style="color: var(--primary); display: block; margin-bottom: 2px;">Pencatat Lembar Kerja (LKPD Fisik):</strong>
              Menuliskan hasil pembuktian baris kode dan simpulan pada lembar kertas kelompok.
            </div>
          </div
        </div>
      </div>

      <!-- 2. Peta Tahapan 2 Siklus Belajar (Siklus 1 Dasar vs Siklus 2 Maju) -->
      <div class="tactile-card" style="padding: 22px 24px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          <div>
            <span class="eyebrow-label" style="color: var(--primary);">Struktur Tahapan Belajar</span>
            <h2 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">
              Pembagian 2 Siklus Perjalanan Logika
            </h2>
          </div>
          <span style="display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-code); font-size: 10.5px; font-weight: 700; color: ${this.isCycle2Unlocked ? 'var(--warning-dark)' : 'var(--primary)'}; border: 1px solid ${this.isCycle2Unlocked ? 'rgba(217, 119, 6, 0.25)' : 'rgba(15, 118, 110, 0.25)'}; background: ${this.isCycle2Unlocked ? 'rgba(217, 119, 6, 0.08)' : 'rgba(15, 118, 110, 0.08)'}; padding: 3px 8px; border-radius: 6px;">
            <span style="width: 5px; height: 5px; border-radius: 50%; background-color: currentColor;"></span>
            Status: ${this.isCycle2Unlocked ? 'Siklus 2 (Maju)' : 'Siklus 1 (Dasar)'}
          </span>
        </div>

        <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.55; margin-bottom: 14px;">
          Pembelajaran dibagi menjadi dua tahapan bertingkat. Kalian akan menguasai logika percabangan dasar terlebih dahulu sebelum melangkah ke percabangan majemuk yang lebih menantang:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 12px;">
          <!-- Kartu Siklus 1 -->
          <div style="padding: 16px 18px; border: 1px solid ${!this.isCycle2Unlocked ? 'rgba(15, 118, 110, 0.3)' : 'rgba(28, 25, 23, 0.08)'}; background-color: ${!this.isCycle2Unlocked ? 'var(--surface-panel)' : 'var(--surface-panel-alt)'}; border-radius: 10px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.03); position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-family: var(--font-ui); font-size: 11px; font-weight: 700; color: var(--primary); letter-spacing: 0.3px;">
                Siklus 1 (Dasar)
              </span>
              <span style="font-size: 10px; font-weight: 700; color: var(--success); border: 1px solid rgba(21, 128, 61, 0.25); background: rgba(21, 128, 61, 0.08); padding: 2px 7px; border-radius: 5px;">
                Terbuka Langsung
              </span>
            </div>
            <h3 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px;">
              Fondasi Percabangan IF &amp; IF-ELSE
            </h3>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px;">
              Memahami logika pengambilan keputusan satu arah dan dua arah berdasarkan kondisi nilai numerik:
            </p>
            <ul style="margin: 0; padding-left: 18px; font-size: 11.5px; color: var(--text-primary); line-height: 1.6;">
              <li><strong>Modul 1:</strong> Gerbang Tiket Stasiun MRT &ndash; Operator Relasional &amp; Evaluasi Boolean (<code>==</code>, <code>&gt;=</code>, <code>&lt;=</code>)</li>
              <li><strong>Modul 2:</strong> Sistem Alarm Suhu Server &ndash; Percabangan Tunggal (IF)</li>
              <li><strong>Modul 3:</strong> Kasir Kantin Cerdas (Kupon Diskon) &ndash; Percabangan Ganda (IF - ELSE)</li>
            </ul>
            <div style="margin-top: 12px; padding: 9px 12px; background: var(--surface-panel-alt); border-radius: 6px; border: 1px solid rgba(28, 25, 23, 0.06); font-size: 11px; color: var(--text-secondary);">
              <strong style="color: var(--text-primary);">Target Keberhasilan:</strong> Membuka 2 Bintang (uji semua jalur kondisi: IF dan ELSE) pada setiap kasus.
            </div>
          </div>

          <!-- Kartu Siklus 2 -->
          <div style="position: relative; overflow: hidden; border: 1px ${this.isCycle2Unlocked ? 'solid rgba(217, 119, 6, 0.3)' : 'dashed rgba(217, 119, 6, 0.40)'}; background-color: ${this.isCycle2Unlocked ? 'var(--surface-panel)' : 'rgba(217, 119, 6, 0.04)'}; border-radius: 10px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.03);">
            <!-- Konten kartu (selalu dirender, diblur saat terkunci) -->
            <div style="padding: 16px 18px; ${this.isCycle2Unlocked ? '' : 'filter: blur(4px); pointer-events: none; user-select: none;'}">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-family: var(--font-ui); font-size: 11px; font-weight: 700; color: ${this.isCycle2Unlocked ? 'var(--warning-dark)' : 'var(--text-muted)'}; letter-spacing: 0.3px;">
                  Siklus 2 (Lanjutan)
                </span>
                <span style="font-size: 10px; font-weight: 700; color: ${this.isCycle2Unlocked ? 'var(--warning-dark)' : 'var(--text-muted)'}; border: 1px solid ${this.isCycle2Unlocked ? 'rgba(217, 119, 6, 0.25)' : 'rgba(28, 25, 23, 0.1)'}; background: ${this.isCycle2Unlocked ? 'rgba(217, 119, 6, 0.08)' : 'rgba(0,0,0,0.03)'}; padding: 2px 7px; border-radius: 5px;">
                  ${this.isCycle2Unlocked ? 'Aktif di Gawai' : 'Terkunci Saat Ini'}
                </span>
              </div>
              <h3 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px;">
                Percabangan Bertingkat &amp; Majemuk
              </h3>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px;">
                Menyelesaikan masalah dengan kondisi berantai dan banyak pilihan aksi yang saling bertingkat:
              </p>
              <ul style="margin: 0; padding-left: 18px; font-size: 11.5px; color: var(--text-primary); line-height: 1.6;">
                <li><strong>Modul 4:</strong> Klasifikasi Kecepatan Paket Data &ndash; Percabangan Bertingkat (ELSE - IF)</li>
                <li><strong>Modul 5:</strong> Pemilih Menu Minuman Otomatis &ndash; Percabangan Multi-Kategori (SWITCH - CASE)</li>
              </ul>
              <div style="margin-top: 12px; padding: 9px 12px; background: var(--surface-panel-alt); border-radius: 6px; border: 1px solid rgba(28, 25, 23, 0.06); font-size: 11px; color: var(--text-secondary);">
                <strong style="color: var(--text-primary);">Keterangan:</strong> ${this.isCycle2Unlocked ? 'Modul Siklus 2 telah dibuka dan siap dimainkan.' : 'Akan dibuka pada pertemuan kelas Siklus 2 oleh Guru Informatika.'}
              </div>
            </div>

            <!-- Overlay kunci (hanya tampil saat terkunci) -->
            ${this.isCycle2Unlocked ? '' : `
              <div style="position: absolute; inset: 0; background: rgba(245, 241, 232, 0.72); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 14px; border-radius: 10px;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                  ${renderPixelIcon('lock', 20, 'var(--warning-dark)')}
                  <span style="font-family: var(--font-pixel); font-size: 8.5px; color: var(--warning-dark); letter-spacing: 0.5px; text-align: center;">SIKLUS 2 TERKUNCI</span>
                </div>
                <button id="btn-unlock-cycle2-materi" type="button" class="game-btn game-btn-gold" style="font-size: 11px; padding: 6px 14px; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                  ${renderPixelIcon('unlock', 10, '#ffffff')} Buka Siklus 2
                </button>
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- 3. Urutan Kegiatan Kelas (6 Langkah Misi) -->
      <div class="tactile-card" style="padding: 22px 24px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);">
        <div style="margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          <span class="eyebrow-label" style="color: var(--primary);">Urutan Kegiatan Kelas</span>
          <h2 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">
            6 Langkah Misi yang Harus Dilakukan
          </h2>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Langkah 1 -->
          <div class="guide-step-row" style="display: flex; gap: 14px; align-items: flex-start; padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
            <div class="guide-step-badge" style="width: 32px; height: 32px; border-radius: 6px; background-color: var(--primary); color: #ffffff; display: flex; align-items: center; justify-content: center; font-family: var(--font-code); font-size: 12px; font-weight: 700; flex-shrink: 0;">
              01
            </div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                <h3 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin: 0;">
                  Pahami Panduan &amp; Daftarkan Tim Belajar
                </h3>
                <span style="font-size: 9.5px; font-weight: 600; color: var(--text-muted); background: rgba(0,0,0,0.04); padding: 2px 6px; border-radius: 4px;">Menu Beranda</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 4px 0 0;">
                Pahami panduan petualangan di halaman ini, lalu klik tombol pendaftaran di menu <strong>Beranda</strong>. Masukkan Nomor Absen serta Nama Lengkap kedua murid untuk mengaktifkan identitas tim berpasangan (<em>Pair Programming</em>).
              </p>
            </div>
          </div>

          <!-- Langkah 2 -->
          <div class="guide-step-row" style="display: flex; gap: 14px; align-items: flex-start; padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
            <div class="guide-step-badge" style="width: 32px; height: 32px; border-radius: 6px; background-color: var(--primary); color: #ffffff; display: flex; align-items: center; justify-content: center; font-family: var(--font-code); font-size: 12px; font-weight: 700; flex-shrink: 0;">
              02
            </div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                <h3 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin: 0;">
                  Orientasi Masalah bersama Guru Pak Budi
                </h3>
                <span style="font-size: 9.5px; font-weight: 600; color: var(--primary); background: rgba(15, 118, 110, 0.08); border: 1px solid rgba(15, 118, 110, 0.2); padding: 2px 6px; border-radius: 4px;">Tab Dialog / Peta</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 4px 0 0;">
                Masuki <strong>Peta Kota</strong> dan temui Guru Pak Budi di ujung kiri jalan untuk mendengarkan kronologi gangguan otomasi Kota Harmoni serta menyelesaikan tantangan nalar awal sebagai syarat pembuka ruang kelas materi.
              </p>
            </div>
          </div>

          <!-- Langkah 3 -->
          <div class="guide-step-row" style="display: flex; gap: 14px; align-items: flex-start; padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
            <div class="guide-step-badge" style="width: 32px; height: 32px; border-radius: 6px; background-color: var(--primary); color: #ffffff; display: flex; align-items: center; justify-content: center; font-family: var(--font-code); font-size: 12px; font-weight: 700; flex-shrink: 0;">
              03
            </div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                <h3 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin: 0;">
                  Bedah Konsep &amp; Uji Simulator di Ruang Kelas
                </h3>
                <span style="font-size: 9.5px; font-weight: 600; color: var(--primary); background: rgba(15, 118, 110, 0.08); border: 1px solid rgba(15, 118, 110, 0.2); padding: 2px 6px; border-radius: 4px;">Tab Materi</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 4px 0 0;">
                Pelajari aturan percabangan logika di tab <strong>Materi</strong>, amati bagan alur (<em>flowchart</em>), dan buktikan kondisi pada simulator interaktif hingga menekan tombol konfirmasi lanjut ke lab komputer.
              </p>
            </div>
          </div>

          <!-- Langkah 4 -->
          <div class="guide-step-row" style="display: flex; gap: 14px; align-items: flex-start; padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
            <div class="guide-step-badge" style="width: 32px; height: 32px; border-radius: 6px; background-color: var(--warning-dark); color: #ffffff; display: flex; align-items: center; justify-content: center; font-family: var(--font-code); font-size: 12px; font-weight: 700; flex-shrink: 0;">
              04
            </div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                <h3 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin: 0;">
                  Tebak Alur &amp; Raih 2 Bintang di Lab Telusur
                </h3>
                <span style="font-size: 9.5px; font-weight: 600; color: var(--warning-dark); background: rgba(217, 119, 6, 0.08); border: 1px solid rgba(217, 119, 6, 0.2); padding: 2px 6px; border-radius: 4px;">Tab Telusur</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 4px 0 0;">
                Tentukan tebakan alur (<em>Benar</em> atau <em>Salah</em>) sebelum menjalankan simulasi baris demi baris di tab <strong>Telusur</strong>. Uji seluruh cabang kondisi (IF dan ELSE) hingga meraih <strong>Bintang 2 (100% Teruji)</strong> untuk membuka arena tantangan.
              </p>
            </div>
          </div>

          <!-- Langkah 5 -->
          <div class="guide-step-row" style="display: flex; gap: 14px; align-items: flex-start; padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
            <div class="guide-step-badge" style="width: 32px; height: 32px; border-radius: 6px; background-color: var(--danger); color: #ffffff; display: flex; align-items: center; justify-content: center; font-family: var(--font-code); font-size: 12px; font-weight: 700; flex-shrink: 0;">
              05
            </div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                <h3 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin: 0;">
                  Taklukkan Bug Monster di Arena Tantangan
                </h3>
                <span style="font-size: 9.5px; font-weight: 600; color: var(--danger); background: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.2); padding: 2px 6px; border-radius: 4px;">Tab Tantangan</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 4px 0 0;">
                Hadapi Bug Monster yang menginfeksi sistem di tab <strong>Tantangan</strong> (Taman Kota). Analisis nilai variabel saat giliran bertarung dan luncurkan serangan logika yang tepat untuk mengeliminasi bug.
              </p>
            </div>
          </div>

          <!-- Langkah 6 -->
          <div class="guide-step-row" style="display: flex; gap: 14px; align-items: flex-start; padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
            <div class="guide-step-badge" style="width: 32px; height: 32px; border-radius: 6px; background-color: var(--success); color: #ffffff; display: flex; align-items: center; justify-content: center; font-family: var(--font-code); font-size: 12px; font-weight: 700; flex-shrink: 0;">
              06
            </div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                <h3 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin: 0;">
                  Evaluasi Reflektif &amp; Kirim Rekap ke Guru
                </h3>
                <span style="font-size: 9.5px; font-weight: 600; color: var(--success); background: rgba(21, 128, 61, 0.08); border: 1px solid rgba(21, 128, 61, 0.2); padding: 2px 6px; border-radius: 4px;">Tab Evaluasi &amp; Progres</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 4px 0 0;">
                Jawab butir evaluasi formatif mandiri di tab <strong>Evaluasi</strong>, periksa perolehan lencana di tab <strong>Progres</strong>, kirimkan rekap capaian tim ke <strong>Google Drive Guru</strong> (atau simpan CSV), serta salin simpulan ke LKPD kertas fisik.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Tombol Aksi Cepat / Konfirmasi Panduan -->
      <div class="tactile-card" style="padding: 24px 22px; text-align: center; border: 1px solid ${!hasReadGuide ? 'rgba(15, 118, 110, 0.3)' : 'var(--border-subtle)'}; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px -2px rgba(15, 118, 110, 0.06), 0 1px 3px rgba(28, 25, 23, 0.03);">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: rgba(15, 118, 110, 0.08); margin-bottom: 10px; border: 1px solid rgba(15, 118, 110, 0.25);">
          ${renderPixelIcon(hasReadGuide ? 'check' : 'book', 22, 'var(--primary)')}
        </div>
        <h2 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
          ${!hasReadGuide ? 'Sudah Memahami Cara Bermain?' : 'Siap Memulai Penelusuran Logika?'}
        </h2>
        <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 16px; max-width: 520px; margin-left: auto; margin-right: auto; line-height: 1.55;">
          ${!hasReadGuide
        ? 'Setelah membaca seluruh panduan dan memahami aturan kolaborasi berpasangan di atas, klik tombol di bawah untuk membuka formulir pendaftaran tim.'
        : 'Kalian telah menuntaskan panduan! Pilihlah salah satu menu di bawah untuk melanjutkan petualangan bersama rekan belajar tim.'
      }
        </p>

        <div class="guide-nav-bar">
          ${!hasReadGuide ? `
            <button id="btn-complete-guide" type="button" class="game-btn game-btn-gold" style="min-height: 46px; font-size: 12px; font-family: var(--font-pixel); width: 100%; max-width: 440px; gap: 8px;">
              ${renderPixelIcon('check', 13, '#ffffff')} Saya Paham Panduan, Daftarkan Tim ${renderPixelIcon('arrow-right', 12, '#ffffff')}
            </button>
          ` : `
            <button id="btn-guide-start" type="button" class="game-btn game-btn-gold" style="min-height: 42px; font-size: 11.5px; font-family: var(--font-pixel); padding: 8px 16px;">
              ${renderPixelIcon('play', 12, '#ffffff')} ${this.session ? 'Lanjutkan ke Peta' : 'Mulai Pendaftaran'}
            </button>
            <div class="guide-nav-group-secondary">
              <button id="btn-guide-materi" type="button" class="game-btn game-btn-primary" style="min-height: 42px; font-size: 12px;">
                ${renderPixelIcon('book', 13, '#ffffff')} Pelajari Materi
              </button>
              <button id="btn-guide-tracing" type="button" class="game-btn game-btn-secondary" style="min-height: 42px; font-size: 12px;">
                ${renderPixelIcon('flask', 13, 'var(--primary)')} Buka Lab Telusur
              </button>
            </div>
          `}
        </div>
      </div>
    `;

    // Event Listeners Tombol Aksi
    container.querySelector<HTMLButtonElement>('#btn-complete-guide')?.addEventListener('click', async () => {
      soundFx.playLogicTrue();
      this.progressionState = await StorageService.saveProgressionState({ stepGuideCompleted: true });
      this.showRetroToast('Panduan berhasil dipahami! Langkah pendaftaran tim kini dibuka.', true);
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

  // Modal Registrasi Pasangan Pair Programming
  private showOnboardingModal(): void {
    const hasReadGuide = !!(this.progressionState?.stepGuideCompleted || this.progressionState?.teacherBypassMode || this.session);
    if (!hasReadGuide) {
      soundFx.playLogicFalse();
      this.showRetroToast('Kalian wajib membaca Panduan Petualangan terlebih dahulu sebelum mendaftar!', false);
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
    modalContent.style.cssText = `
      max-width: 500px;
      width: 100%;
      padding: 22px;
      max-height: 90vh;
      overflow-y: auto;
    `;

    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 2px solid var(--border-retro); padding-bottom: 8px;">
        <span class="eyebrow-label" style="font-size: 11px; color: var(--primary);">
          ${renderPixelIcon('shield', 13, 'var(--primary)')} Registrasi Tim Belajar
        </span>
        <button type="button" class="btn-close-modal" style="background: none; border: 1.5px solid var(--border-retro); border-radius: 4px; padding: 2px 8px; color: var(--text-muted); font-family: var(--font-code); font-size: 12px; cursor: pointer;">Tutup [X]</button>
      </div>

      <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5;">
        Masukkan nama lengkap dan nomor absen kedua anggota tim untuk merekam portofolio pembelajaran di LKPD.
      </p>

      <form id="form-onboarding" style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: grid; grid-template-columns: 1fr 80px; gap: 8px;">
          <div>
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">
              Nama Lengkap Murid 1:
            </label>
            <input id="input-s1-name" type="text" maxlength="50" class="pixel-input" placeholder="Nama Lengkap Murid 1" required style="width: 100%; min-height: 44px;" />
          </div>
          <div>
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">
              Absen:
            </label>
            <input id="input-s1-absen" type="number" min="1" max="46" class="pixel-input" placeholder="No" required style="width: 100%; min-height: 44px;" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 80px; gap: 8px;">
          <div>
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">
              Nama Lengkap Murid 2:
            </label>
            <input id="input-s2-name" type="text" maxlength="50" class="pixel-input" placeholder="Nama Lengkap Murid 2" required style="width: 100%; min-height: 44px;" />
          </div>
          <div>
            <label style="display: block; font-size: 11px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">
              Absen:
            </label>
            <input id="input-s2-absen" type="number" min="1" max="46" class="pixel-input" placeholder="No" required style="width: 100%; min-height: 44px;" />
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label style="font-size: 11px; font-weight: 600; color: var(--text-primary); margin: 0;">
              Pilih Lambang Tim (16-Bit Pixel Art):
            </label>
            <span id="selected-team-concept" style="font-size: 10px; font-weight: 600; color: var(--primary);">
              Logika Percabangan
            </span>
          </div>
          <div class="onboarding-team-grid">
            ${(['algoritma', 'biner', 'matriks', 'vektor'] as TeamSymbol[]).map((sym, idx) => {
      const meta = TEAM_SYMBOLS_DATA[sym];
      const isSelected = idx === 0;
      return `
                <label class="arcade-choice-card ${isSelected ? 'selected' : ''}" style="padding: 10px 4px 8px; flex-direction: column; justify-content: center; align-items: center; min-height: 84px; cursor: pointer; border: 1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}; background: ${isSelected ? 'rgba(15, 118, 110, 0.06)' : '#ffffff'}; border-radius: 10px; transition: all 0.15s ease; box-sizing: border-box; box-shadow: ${isSelected ? '0 0 0 1px var(--primary)' : '0 1px 2px rgba(28, 25, 23, 0.03)'};">
                  <input type="radio" name="symbol" value="${sym}" ${isSelected ? 'checked' : ''} style="display: none;" />
                  <div class="team-symbol-preview" style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: ${isSelected ? 'rgba(15, 118, 110, 0.12)' : 'var(--surface-panel-alt)'}; border: 1px solid ${isSelected ? 'var(--primary)' : 'rgba(28, 25, 23, 0.08)'}; border-radius: 8px; margin-bottom: 6px; transition: all 0.15s ease;">
                    ${renderTeamSymbolPixelArt(sym, 26)}
                  </div>
                  <div style="font-family: var(--font-pixel); font-size: 8.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; text-align: center;">
                    ${meta.name}
                  </div>
                  <div style="font-size: 8px; color: var(--text-muted); text-align: center; line-height: 1.1;">
                    ${meta.tagline}
                  </div>
                </label>
              `;
    }).join('')}
          </div>
        </div>

        <button type="submit" class="game-btn game-btn-gold" style="width: 100%; margin-top: 8px; min-height: 48px;">
          Simpan &amp; Mulai Petualangan
        </button>
      </form>
    `;

    const radioInputs = modalContent.querySelectorAll<HTMLInputElement>('input[name="symbol"]');
    const conceptLabel = modalContent.querySelector<HTMLElement>('#selected-team-concept');
    radioInputs.forEach((radio) => {
      radio.addEventListener('change', () => {
        radioInputs.forEach((r) => {
          const parent = r.closest('label');
          const previewBox = parent?.querySelector<HTMLElement>('.team-symbol-preview');
          if (parent) {
            parent.classList.toggle('selected', r.checked);
            parent.style.borderColor = r.checked ? 'var(--primary)' : 'var(--border-subtle)';
            parent.style.boxShadow = r.checked ? '0 0 0 1px var(--primary)' : '0 1px 2px rgba(28, 25, 23, 0.03)';
            parent.style.backgroundColor = r.checked ? 'rgba(15, 118, 110, 0.06)' : '#ffffff';
          }
          if (previewBox) {
            previewBox.style.borderColor = r.checked ? 'var(--primary)' : 'rgba(28, 25, 23, 0.08)';
            previewBox.style.backgroundColor = r.checked ? 'rgba(15, 118, 110, 0.12)' : 'var(--surface-panel-alt)';
          }
          if (r.checked && conceptLabel) {
            const sym = r.value as TeamSymbol;
            conceptLabel.textContent = TEAM_SYMBOLS_DATA[sym]?.tagline || '';
          }
        });
        soundFx.playButtonBlip();
      });
    });

    const closeModal = () => {
      modalBackdrop.remove();
    };

    modalContent.querySelector('.btn-close-modal')?.addEventListener('click', closeModal);

    const form = modalContent.querySelector<HTMLFormElement>('#form-onboarding');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const s1Name = (modalContent.querySelector('#input-s1-name') as HTMLInputElement).value.trim();
      const s1Absen = parseInt((modalContent.querySelector('#input-s1-absen') as HTMLInputElement).value, 10) || 1;
      const s2Name = (modalContent.querySelector('#input-s2-name') as HTMLInputElement).value.trim();
      const s2Absen = parseInt((modalContent.querySelector('#input-s2-absen') as HTMLInputElement).value, 10) || 2;

      if (s1Name.length < 2 || s2Name.length < 2) {
        soundFx.playLogicFalse();
        this.showRetroToast('Nama lengkap kedua murid minimal 2 karakter!', false);
        return;
      }
      if (s1Name.length > 50 || s2Name.length > 50) {
        soundFx.playLogicFalse();
        this.showRetroToast('Nama murid maksimal 50 karakter!', false);
        return;
      }
      if (!isValidSafeName(s1Name) || !isValidSafeName(s2Name)) {
        soundFx.playLogicFalse();
        this.showRetroToast('Nama murid mengandung karakter tidak diizinkan!', false);
        return;
      }
      if (s1Absen < 1 || s1Absen > 46 || s2Absen < 1 || s2Absen > 46 || Number.isNaN(s1Absen) || Number.isNaN(s2Absen)) {
        soundFx.playLogicFalse();
        this.showRetroToast('Nomor absen harus berada dalam rentang 1 sampai 46!', false);
        return;
      }
      if (s1Absen === s2Absen) {
        soundFx.playLogicFalse();
        this.showRetroToast('Nomor absen Murid 1 dan Murid 2 tidak boleh sama!', false);
        return;
      }

      const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const symbol = ((modalContent.querySelector('input[name="symbol"]:checked') as HTMLInputElement)?.value || 'algoritma') as TeamSymbol;

      const autoPairId = `Tim Absen ${String(s1Absen).padStart(2, '0')}-${String(s2Absen).padStart(2, '0')}`;

      const newSession: StudentSession = {
        pairId: autoPairId,
        student1Name: s1Name,
        student1Absen: s1Absen,
        student2Name: s2Name,
        student2Absen: s2Absen,
        teamSymbol: symbol,
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
        this.showRetroToast(`Pendaftaran berhasil! Selamat bergabung di Kota Harmoni, ${autoPairId}. Temui Pak Budi di SMA Harmoni!`, true);
        this.setScreen('OVERWORLD');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);
  }

  // =================================================================
  // Layar 02: Eksplorasi Peta Dunia (Overworld Map HUD & Location Pins)
  // =================================================================
  // =================================================================
  // Layar 02: Eksplorasi Peta Dunia (Overworld Map HUD & Active Quest Radar)
  // =================================================================
  private renderScreenOverworld(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `display: flex; flex-direction: column; gap: 14px;`;

    // Evaluasi Status Keterbukaan Landmark (Sinkron dengan Strict Progression Gating)
    const isMateriUnlocked = this.isScreenUnlocked('MATERI');
    const isTracingUnlocked = this.isScreenUnlocked('TRACING');
    const isBattleUnlocked = this.isScreenUnlocked('BATTLE');
    const isEvaluasiUnlocked = this.isScreenUnlocked('EVALUASI');

    // Tentukan Misi Utama Aktif Tim Berdasarkan Kemajuan Nyata
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
      activeDesc = 'Kalian telah memahami materi percabangan! Sekarang masuki Lab Telusur Kode, uji nilai variabel, dan buktikan semua jalur kondisi (cabang IF dan ELSE) untuk membuka arena tantangan.';
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
      activeMissionTitle = 'Selesaikan Evaluasi & Refleksi LKPD';
      activeLocation = 'Gedung Perpustakaan Kota';
      activeDesc = 'Bug Monster berhasil dikalahkan! Masuki Perpustakaan untuk menuntaskan evaluasi mandiri dan refleksi belajar tim.';
      primaryBtnLabel = 'Buka Ruang Evaluasi LKPD';
      primaryBtnIcon = 'document';
      primaryBtnScreen = 'EVALUASI';
      secondaryBtnLabel = '';
      secondaryBtnScreen = 'EVALUASI';
    } else {
      activeStepNum = '05';
      activeMissionTitle = 'Misi Kota Harmoni Selesai dengan Gemilang!';
      activeLocation = 'Balai Kota & Arsip Capaian';
      activeDesc = 'Seluruh langkah pembelajaran telah kalian tuntaskan bersama pasangan tim! Buka menu Progres untuk melihat nilai formatif, lencana tim, dan mengekspor bukti laporan belajar.';
      primaryBtnLabel = 'Lihat Rekap Capaian Tim';
      primaryBtnIcon = 'trophy';
      primaryBtnScreen = 'PROGRES';
      secondaryBtnLabel = '';
      secondaryBtnScreen = 'PROGRES';
    }

    // 1. PANDUAN KENDALI EKSPLORASI DI PALING ATAS (Tactile Console Control Strip)
    const controlHud = document.createElement('div');
    controlHud.className = 'tactile-card';
    controlHud.style.cssText = `padding: 16px 18px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);`;
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
        <!-- Kontrol Laptop / PC -->
        <div style="padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
          <div style="font-size: 10.5px; font-weight: 700; letter-spacing: 0.4px; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            ${renderPixelIcon('drive', 11, 'var(--primary)')} LAPTOP / KOMPUTER
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.55; margin: 0;">
            Gunakan tombol <kbd style="display: inline-block; padding: 1px 5px; font-family: var(--font-code); font-size: 10.5px; font-weight: 600; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 4px; box-shadow: 0 1px 1px rgba(0,0,0,0.05);">Panah</kbd> atau <kbd style="display: inline-block; padding: 1px 5px; font-family: var(--font-code); font-size: 10.5px; font-weight: 600; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 4px; box-shadow: 0 1px 1px rgba(0,0,0,0.05);">WASD</kbd> untuk berjalan, dan <kbd style="display: inline-block; padding: 1px 5px; font-family: var(--font-code); font-size: 10.5px; font-weight: 600; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 4px; box-shadow: 0 1px 1px rgba(0,0,0,0.05);">Spasi</kbd> di depan gedung untuk interaksi.
          </p>
        </div>

        <!-- Kontrol HP / Tablet -->
        <div style="padding: 12px 14px; background: var(--surface-panel-alt); border: 1px solid rgba(28, 25, 23, 0.06); border-radius: 8px;">
          <div style="font-size: 10.5px; font-weight: 700; letter-spacing: 0.4px; color: var(--warning-dark); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            ${renderPixelIcon('target', 11, 'var(--warning-dark)')} HP &amp; TABLET
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
            Kalian juga bisa <strong style="color: var(--text-primary); font-weight: 600;">mengetuk pin gedung</strong> pada kanvas peta atau menekan tombol aksi pada papan misi di bawah.
          </p>
        </div>
      </div>
    `;
    container.appendChild(controlHud);

    // 2. KARTU PAPAN MISI UTAMA AKTIF (Primary Active Quest Focus)
    const questCard = document.createElement('div');
    questCard.className = 'tactile-card';
    questCard.style.cssText = `padding: 18px 20px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);`;
    questCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
        <span class="badge-pill" style="font-size: 11px; color: var(--primary); font-weight: 700; letter-spacing: 0.3px;">
          ${renderPixelIcon('target', 12, 'var(--primary)')} MISI AKTIF TIM • LANGKAH ${activeStepNum}
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

    // 3. RADAR STATUS KETERBUKAAN GEDUNG KOTA (Landmark Status Overview)
    const radarSection = document.createElement('div');
    radarSection.className = 'tactile-card';
    radarSection.style.cssText = `padding: 20px 22px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);`;
    radarSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
        <div>
          <div style="font-family: var(--font-ui); font-size: 14.5px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            ${renderPixelIcon('map', 15, 'var(--primary)')} Radar Status Kota Harmoni
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); margin: 3px 0 0; line-height: 1.45;">
            Pantau status keterbukaan 4 lokasi belajar. Jalankan instruksi pada kartu misi di atas untuk membuka akses bertahap.
          </p>
        </div>
        <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; color: var(--primary); background: rgba(15, 118, 110, 0.06); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(15, 118, 110, 0.18);">
          <span style="width: 5px; height: 5px; border-radius: 50%; background-color: var(--primary);"></span>
          Status 4 Lokasi
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 10px;">
        <!-- Gedung 1: Sekolah (Materi) -->
        <div id="radar-card-materi" class="radar-status-item" style="padding: 14px 15px; display: flex; flex-direction: column; justify-content: space-between; background: ${isMateriUnlocked ? '#ffffff' : 'var(--surface-panel-alt)'}; border: 1px solid ${isMateriUnlocked ? 'rgba(15, 118, 110, 0.25)' : 'rgba(28, 25, 23, 0.07)'}; border-radius: 10px; transition: all 0.15s ease; ${isMateriUnlocked ? 'cursor: pointer;' : 'opacity: 0.85;'}">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="eyebrow-label" style="color: var(--primary); font-size: 9.5px;">Pin Sekolah</span>
              ${renderPixelIcon('school', 14, isMateriUnlocked ? 'var(--primary)' : 'var(--text-muted)')}
            </div>
            <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
              Gedung Sekolah (Materi)
            </div>
            <div style="margin-bottom: 8px;">
              ${isMateriUnlocked ? `
                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 9.5px; font-weight: 600; color: var(--primary); border: 1px solid rgba(15, 118, 110, 0.2); background: rgba(15, 118, 110, 0.08); padding: 2px 7px; border-radius: 5px;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background-color: var(--primary);"></span>
                  Terbuka • Siap Dipelajari
                </span>
              ` : `
                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 9.5px; font-weight: 600; color: var(--warning-dark); border: 1px solid rgba(180, 83, 9, 0.2); background: rgba(180, 83, 9, 0.08); padding: 2px 7px; border-radius: 5px;">
                  ${renderPixelIcon('lock', 9, 'var(--warning-dark)')} Terkunci (Temui Pak Budi Dulu)
                </span>
              `}
            </div>
            <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 10px;">
              ${isMateriUnlocked
        ? 'Konsep percabangan tunggal, if-else, operator logika, dan simulator boolean interaktif.'
        : 'Bicaralah terlebih dahulu dengan Guru Pak Budi di tepi jalan barat antara pepohonan.'
      }
            </p>
          </div>
          <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid rgba(28, 25, 23, 0.05); padding-top: 8px;">
            ${isMateriUnlocked
        ? `<span style="font-size: 11px; font-weight: 600; color: var(--primary); display: inline-flex; align-items: center; gap: 4px;">Buka Ruang Kelas &rsaquo;</span>`
        : `<span style="font-size: 10px; color: var(--text-muted);">Akses Terkunci</span>`
      }
          </div>
        </div>

        <!-- Gedung 2: Lab Telusur Kode -->
        <div id="radar-card-tracing" class="radar-status-item" style="padding: 14px 15px; display: flex; flex-direction: column; justify-content: space-between; background: ${isTracingUnlocked ? 'var(--surface-panel)' : 'var(--surface-panel-alt)'}; border: 1px solid ${isTracingUnlocked ? 'rgba(15, 118, 110, 0.25)' : 'rgba(28, 25, 23, 0.07)'}; border-radius: 10px; transition: all 0.15s ease; ${isTracingUnlocked ? 'cursor: pointer;' : 'opacity: 0.85;'}">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="eyebrow-label" style="color: ${isTracingUnlocked ? 'var(--primary)' : 'var(--text-muted)'}; font-size: 9.5px;">Pin Lab Telusur</span>
              ${renderPixelIcon('flask', 14, isTracingUnlocked ? 'var(--primary)' : 'var(--text-muted)')}
            </div>
            <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
              Lab Telusur Kode
            </div>
            <div style="margin-bottom: 8px;">
              ${isTracingUnlocked ? `
                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 9.5px; font-weight: 600; color: var(--primary); border: 1px solid rgba(15, 118, 110, 0.2); background: rgba(15, 118, 110, 0.08); padding: 2px 7px; border-radius: 5px;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background-color: var(--primary);"></span>
                  Terbuka • Siap Uji
                </span>
              ` : `
                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 9.5px; font-weight: 600; color: var(--warning-dark); border: 1px solid rgba(180, 83, 9, 0.2); background: rgba(180, 83, 9, 0.08); padding: 2px 7px; border-radius: 5px;">
                  ${renderPixelIcon('lock', 9, 'var(--warning-dark)')} Terkunci (Langkah 02)
                </span>
              `}
            </div>
            <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 10px;">
              ${isTracingUnlocked
        ? 'Uji variabel masukan dan telusuri alur kode baris per baris hingga semua jalur kondisi (IF dan ELSE) terbukti.'
        : 'Pahami materi di Sekolah terlebih dahulu untuk mendapatkan kunci izin akses Laboratorium.'
      }
            </p>
          </div>
          <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid rgba(28, 25, 23, 0.05); padding-top: 8px;">
            ${isTracingUnlocked
        ? `<span style="font-size: 11px; font-weight: 600; color: var(--primary); display: inline-flex; align-items: center; gap: 4px;">Masuk Lab Telusur &rsaquo;</span>`
        : `<span style="font-size: 10px; color: var(--text-muted);">Akses Terkunci</span>`
      }
          </div>
        </div>

        <!-- Gedung 3: Arena Bug Logika (Taman Kota) -->
        <div id="radar-card-battle" class="radar-status-item" style="padding: 14px 15px; display: flex; flex-direction: column; justify-content: space-between; background: ${isBattleUnlocked ? 'var(--surface-panel)' : 'var(--surface-panel-alt)'}; border: 1px solid ${isBattleUnlocked ? 'rgba(15, 118, 110, 0.25)' : 'rgba(28, 25, 23, 0.07)'}; border-radius: 10px; transition: all 0.15s ease; ${isBattleUnlocked ? 'cursor: pointer;' : 'opacity: 0.85;'}">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="eyebrow-label" style="color: ${isBattleUnlocked ? 'var(--primary)' : 'var(--text-muted)'}; font-size: 9.5px;">Pin Arena Tantangan</span>
              ${renderPixelIcon('swords', 14, isBattleUnlocked ? 'var(--primary)' : 'var(--text-muted)')}
            </div>
            <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
              Arena Bug Logika
            </div>
            <div style="margin-bottom: 8px;">
              ${isBattleUnlocked ? `
                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 9.5px; font-weight: 600; color: var(--primary); border: 1px solid rgba(15, 118, 110, 0.2); background: rgba(15, 118, 110, 0.08); padding: 2px 7px; border-radius: 5px;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background-color: var(--primary);"></span>
                  Terbuka • Siap Tempur
                </span>
              ` : `
                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 9.5px; font-weight: 600; color: var(--warning-dark); border: 1px solid rgba(180, 83, 9, 0.2); background: rgba(180, 83, 9, 0.08); padding: 2px 7px; border-radius: 5px;">
                  ${renderPixelIcon('lock', 9, 'var(--warning-dark)')} Terkunci (Langkah 03)
                </span>
              `}
            </div>
            <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 10px;">
              ${isBattleUnlocked
        ? 'Tantang Bug Monster dengan keputusan logika yang tepat untuk meningkatkan skor tantangan tim.'
        : 'Buktikan minimal satu cabang kondisi di Lab Telusur untuk membuka gerbang pertempuran.'
      }
            </p>
          </div>
          <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid rgba(28, 25, 23, 0.05); padding-top: 8px;">
            ${isBattleUnlocked
        ? `<span style="font-size: 11px; font-weight: 600; color: var(--primary); display: inline-flex; align-items: center; gap: 4px;">Masuk Arena &rsaquo;</span>`
        : `<span style="font-size: 10px; color: var(--text-muted);">Akses Terkunci</span>`
      }
          </div>
        </div>

        <!-- Gedung 4: Ruang Evaluasi LKPD (Perpustakaan) -->
        <div id="radar-card-evaluasi" class="radar-status-item" style="padding: 14px 15px; display: flex; flex-direction: column; justify-content: space-between; background: ${isEvaluasiUnlocked ? 'var(--surface-panel)' : 'var(--surface-panel-alt)'}; border: 1px solid ${isEvaluasiUnlocked ? 'rgba(15, 118, 110, 0.25)' : 'rgba(28, 25, 23, 0.07)'}; border-radius: 10px; transition: all 0.15s ease; ${isEvaluasiUnlocked ? 'cursor: pointer;' : 'opacity: 0.85;'}">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="eyebrow-label" style="color: ${isEvaluasiUnlocked ? 'var(--primary)' : 'var(--text-muted)'}; font-size: 9.5px;">Pin Ruang Evaluasi</span>
              ${renderPixelIcon('document', 14, isEvaluasiUnlocked ? 'var(--primary)' : 'var(--text-muted)')}
            </div>
            <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
              Ruang Evaluasi LKPD
            </div>
            <div style="margin-bottom: 8px;">
              ${isEvaluasiUnlocked ? `
                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 9.5px; font-weight: 600; color: var(--primary); border: 1px solid rgba(15, 118, 110, 0.2); background: rgba(15, 118, 110, 0.08); padding: 2px 7px; border-radius: 5px;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background-color: var(--primary);"></span>
                  Terbuka • Siap Diisi
                </span>
              ` : `
                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 9.5px; font-weight: 600; color: var(--warning-dark); border: 1px solid rgba(180, 83, 9, 0.2); background: rgba(180, 83, 9, 0.08); padding: 2px 7px; border-radius: 5px;">
                  ${renderPixelIcon('lock', 9, 'var(--warning-dark)')} Terkunci (Langkah 04)
                </span>
              `}
            </div>
            <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 10px;">
              ${isEvaluasiUnlocked
        ? 'Selesaikan soal formatif mandiri dan lengkapi refleksi kelompok pada LKPD kertas.'
        : 'Kalahkan Bug Monster di Arena terlebih dahulu sebelum mengisi evaluasi reflektif.'
      }
            </p>
          </div>
          <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid rgba(28, 25, 23, 0.05); padding-top: 8px;">
            ${isEvaluasiUnlocked
        ? `<span style="font-size: 11px; font-weight: 600; color: var(--primary); display: inline-flex; align-items: center; gap: 4px;">Buka Evaluasi &rsaquo;</span>`
        : `<span style="font-size: 10px; color: var(--text-muted);">Akses Terkunci</span>`
      }
          </div>
        </div>
      </div>
    `;
    container.appendChild(radarSection);

    // Event listener jika kartu yang terbuka diklik
    if (isMateriUnlocked) {
      radarSection.querySelector('#radar-card-materi')?.addEventListener('click', () => {
        this.setScreen('MATERI');
      });
    }
    if (isTracingUnlocked) {
      radarSection.querySelector('#radar-card-tracing')?.addEventListener('click', () => {
        this.setScreen('TRACING');
      });
    }
    if (isBattleUnlocked) {
      radarSection.querySelector('#radar-card-battle')?.addEventListener('click', () => {
        this.setScreen('BATTLE');
      });
    }
    if (isEvaluasiUnlocked) {
      radarSection.querySelector('#radar-card-evaluasi')?.addEventListener('click', () => {
        this.setScreen('EVALUASI');
      });
    }

    return container;
  }

  // =================================================================
  // Layar 03: Dialog Penuh Karakter Pak Budi (Scenic Character Dialogue & Problem Orientation)
  // =================================================================
  private renderScreenDialog(): HTMLElement {
    // Tandai dialog dengan Pak Budi telah diselesaikan / dibuka
    if (this.progressionState && !this.progressionState.stepDialogCompleted) {
      this.progressionState.stepDialogCompleted = true;
      StorageService.saveProgressionState({ stepDialogCompleted: true });
    }

    const isTracingUnlocked = this.isScreenUnlocked('TRACING');
    const pairName = this.session?.pairId || 'Penyelidik Logika';
    const student1Name = this.session?.student1Name || 'Murid 1';
    const student2Name = this.session?.student2Name || 'Murid 2';

    const card = document.createElement('div');
    card.className = 'tactile-card';
    card.style.cssText = `padding: 22px 24px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 14px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);`;

    card.innerHTML = `
      <!-- Breadcrumb Navigasi Lokasi -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 6px; font-family: var(--font-ui); font-size: 11.5px; color: var(--text-muted);">
          <span>Kota Harmoni</span>
          <span style="opacity: 0.5;">/</span>
          <span>Tepi Jalan Barat</span>
          <span style="opacity: 0.5;">/</span>
          <span style="color: var(--primary); font-weight: 600;">Pertemuan Guru Pak Budi</span>
        </div>
        <span class="badge-pill" style="font-size: 10px; color: var(--primary); font-weight: 700; letter-spacing: 0.3px; border-color: rgba(15, 118, 110, 0.25);">
          ${renderPixelIcon('target', 11, 'var(--primary)')} LANGKAH 01: ORIENTASI MASALAH
        </span>
      </div>

      <!-- Banner Sambutan Tim Penyelidik Berpasangan -->
      <div style="background: rgba(15, 118, 110, 0.04); border: 1px solid rgba(15, 118, 110, 0.16); border-radius: 10px; padding: 12px 16px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: #ffffff; border: 1px solid rgba(15, 118, 110, 0.2); display: flex; align-items: center; justify-content: center;">
            ${renderPixelIcon('chat', 16, 'var(--primary)')}
          </div>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">
              Sesi Pembimbingan: ${escapeHtml(pairName)}
            </div>
            <div style="font-size: 11.5px; color: var(--text-secondary);">
              Kolaborasi Penyelidik: <strong style="color: var(--primary); font-weight: 600;">${escapeHtml(student1Name)}</strong> &amp; <strong style="color: var(--primary); font-weight: 600;">${escapeHtml(student2Name)}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Panggung Dialog & Berkas Investigasi Karakter -->
      <div style="display: flex; gap: 22px; align-items: flex-start; flex-wrap: wrap;">
        <!-- Kolom Kiri: Potret & Profil Guru Pak Budi -->
        <div style="text-align: center; width: 170px; flex-shrink: 0; margin: 0 auto;">
          <img src="/assets/images/pak_budi_portrait.jpg" alt="Pak Budi" style="
            width: 140px;
            height: 140px;
            border-radius: 12px;
            border: 1px solid var(--border-subtle);
            box-shadow: 0 4px 12px rgba(28, 25, 23, 0.08);
            object-fit: cover;
            display: block;
            margin: 0 auto;
          " />
          <h3 style="font-family: var(--font-pixel); font-size: 12px; color: var(--primary); margin-top: 12px; margin-bottom: 3px;">
            Pak Budi
          </h3>
          <p style="font-size: 11px; color: var(--text-secondary); margin-bottom: 0;">
            Guru Informatika SMA
          </p>
        </div>

        <!-- Kolom Kanan: Narasi Krisis Kasus & Interaktivitas Nalar -->
        <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column; gap: 14px;">
          <!-- Kotak Dialog Utama Pak Budi -->
          <div style="
            background-color: var(--surface-panel-alt);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 16px 18px;
            position: relative;
          ">
            <div style="font-family: var(--font-pixel); font-size: 9.5px; color: var(--primary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              ${renderPixelIcon('chat', 11, 'var(--primary)')} Arahan Orientasi Masalah:
            </div>
            <p style="font-size: 13.5px; line-height: 1.65; color: var(--text-primary); margin-bottom: 8px;">
              "Selamat datang di Kota Harmoni, rekan-rekan ${pairName}! Kota kita sedang menghadapi kendala otomasi. Sejumlah fasilitas cerdas mengalami gangguan fungsi karena program komputernya salah mengambil keputusan logika."
            </p>
            <p style="font-size: 12.5px; line-height: 1.6; color: var(--text-secondary); margin: 0;">
              "Dalam komputer, keputusan diambil dari evaluasi ekspresi kondisi: bernilai <strong>BENAR (TRUE)</strong> atau <strong>SALAH (FALSE)</strong>. Mari cermati 5 masalah di lapangan berikut ini sebelum memulai penyelidikan!"
            </p>
          </div>

          <!-- Ringkasan Kontekstual 5 Masalah Otomasi Kota Harmoni -->
          <div style="border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px; background: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 6px;">
              <span style="font-family: var(--font-ui); font-size: 12.5px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                ${renderPixelIcon('document', 13, 'var(--primary)')} Ringkasan Masalah Otomasi Kota
              </span>
            </div>

            <p style="font-size: 12.5px; line-height: 1.6; color: var(--text-primary); margin-bottom: 14px;">
              Di Kota Harmoni, fasilitas umum mengandalkan <strong>percabangan logika</strong> untuk melayani warga secara otomatis. Terdapat 5 masalah otomasi yang diselesaikan bertahap: Masalah 1 sampai 3 pada <strong>Siklus 1 (Dasar)</strong> dan Masalah 4 sampai 5 pada <strong>Siklus 2 (Lanjutan)</strong>:
            </p>

            <!-- Bagian 1: Masalah Siklus 1 (Fasilitas Dasar - Terbuka Penuh) -->
            <div style="margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                <span style="font-family: var(--font-pixel); font-size: 9px; color: var(--primary); letter-spacing: 0.3px;">
                  Masalah Siklus 1 (Dasar)
                </span>
                <span style="height: 1px; flex: 1; background: var(--border-subtle);"></span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px;">
                <!-- Masalah 1 -->
                <div style="background: var(--surface-panel-alt); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 6px; margin-bottom: 6px;">
                      <div style="font-size: 11.5px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 5px;">
                        ${renderPixelIcon('target', 12, 'var(--primary)')} 1. Gerbang Stasiun MRT
                      </div>
                      <span class="badge-pill" style="font-size: 8.5px; padding: 1px 5px; color: var(--primary); background: var(--surface-panel);">Relasional</span>
                    </div>
                    <div style="font-size: 11px; line-height: 1.5; color: var(--text-secondary); margin-bottom: 8px;">
                      Penumpang bersaldo Rp15.000 tertolak di luar, sedangkan saldo Rp0 palang pintu malah terbuka.
                    </div>
                  </div>
                  <div style="font-size: 10px; color: var(--text-muted); border-top: 1px dashed var(--border-subtle); padding-top: 6px;">
                    Syarat batas saldo minimum (<code style="font-family: var(--font-code); color: var(--primary);">&gt;= 4000</code>).
                  </div>
                </div>

                <!-- Masalah 2 -->
                <div style="background: var(--surface-panel-alt); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 6px; margin-bottom: 6px;">
                      <div style="font-size: 11.5px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 5px;">
                        ${renderPixelIcon('help', 12, 'var(--primary)')} 2. Alarm Suhu Server
                      </div>
                      <span class="badge-pill" style="font-size: 8.5px; padding: 1px 5px; color: var(--primary); background: var(--surface-panel);">Cabang IF</span>
                    </div>
                    <div style="font-size: 11px; line-height: 1.5; color: var(--text-secondary); margin-bottom: 8px;">
                      Sensor mencatat suhu 42°C (panas berlebih), namun sirine darurat dan kipas pendingin ruang server tidak menyala.
                    </div>
                  </div>
                  <div style="font-size: 10px; color: var(--text-muted); border-top: 1px dashed var(--border-subtle); padding-top: 6px;">
                    Pengecekan kondisi batas suhu tunggal (<code style="font-family: var(--font-code); color: var(--primary);">IF</code>).
                  </div>
                </div>

                <!-- Masalah 3 -->
                <div style="background: var(--surface-panel-alt); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 6px; margin-bottom: 6px;">
                      <div style="font-size: 11.5px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 5px;">
                        ${renderPixelIcon('school', 12, 'var(--primary)')} 3. Kasir Diskon Belanja
                      </div>
                      <span class="badge-pill" style="font-size: 8.5px; padding: 1px 5px; color: var(--primary); background: var(--surface-panel);">IF-ELSE</span>
                    </div>
                    <div style="font-size: 11px; line-height: 1.5; color: var(--text-secondary); margin-bottom: 8px;">
                      Belanja Rp350.000 tidak mendapat potongan harga, sedangkan belanja Rp20.000 justru terpotong diskon.
                    </div>
                  </div>
                  <div style="font-size: 10px; color: var(--text-muted); border-top: 1px dashed var(--border-subtle); padding-top: 6px;">
                    Pemisahan dua aksi alternatif (<code style="font-family: var(--font-code); color: var(--primary);">IF - ELSE</code>).
                  </div>
                </div>
              </div>
            </div>

            <!-- Bagian 2: Masalah Siklus 2 (Fasilitas Lanjutan - Terkunci / Terbuka Sesuai Status) -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                <span style="font-family: var(--font-pixel); font-size: 9px; color: ${this.isCycle2Unlocked ? 'var(--primary)' : 'var(--warning-dark)'}; letter-spacing: 0.3px;">
                  Masalah Siklus 2 (Lanjutan) ${this.isCycle2Unlocked ? '• Terbuka' : '• Terkunci'}
                </span>
                <span style="height: 1px; flex: 1; background: var(--border-subtle);"></span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px;">
                <!-- Masalah 4 -->
                <div style="position: relative; background: ${this.isCycle2Unlocked ? 'var(--surface-panel-alt)' : 'rgba(217, 119, 6, 0.04)'}; border: 1px ${this.isCycle2Unlocked ? 'solid var(--border-subtle)' : 'dashed rgba(217, 119, 6, 0.40)'}; border-radius: 8px; overflow: hidden;">
                  <!-- Konten kartu (selalu dirender, diblur saat terkunci) -->
                  <div style="padding: 12px; display: flex; flex-direction: column; gap: 6px; ${this.isCycle2Unlocked ? '' : 'filter: blur(4px); pointer-events: none; user-select: none;'}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 6px;">
                      <div style="font-size: 11.5px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 5px;">
                        ${renderPixelIcon('bolt', 12, 'var(--primary)')} 4. Kuota Paket Data
                      </div>
                      <span class="badge-pill" style="font-size: 8.5px; padding: 1px 5px; color: var(--primary); background: var(--surface-panel);">ELSE-IF</span>
                    </div>
                    <div style="font-size: 11px; line-height: 1.5; color: var(--text-secondary);">
                      Router internet perkotaan keliru membagi kuota: pelanggan 55 Mbps tidak terdeteksi cepat, sedangkan 10 Mbps diprioritaskan.
                    </div>
                    <div style="font-size: 10px; color: var(--text-muted); border-top: 1px dashed var(--border-subtle); padding-top: 6px;">
                      Urutan bertingkat batas tinggi (<code style="font-family: var(--font-code); color: var(--primary);">&gt;= 50</code>) sebelum batas sedang (<code style="font-family: var(--font-code); color: var(--primary);">&gt;= 20</code>).
                    </div>
                  </div>
                  <!-- Overlay kunci (hanya tampil saat terkunci) -->
                  ${this.isCycle2Unlocked ? '' : `
                    <div style="position: absolute; inset: 0; background: rgba(245, 241, 232, 0.72); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 8px;">
                      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                        ${renderPixelIcon('lock', 20, 'var(--warning-dark)')}
                        <span style="font-family: var(--font-pixel); font-size: 8.5px; color: var(--warning-dark); letter-spacing: 0.5px; text-align: center;">SIKLUS 2 TERKUNCI</span>
                      </div>
                      <button type="button" class="btn-unlock-cycle2-dialog game-btn game-btn-gold" style="font-size: 11px; padding: 6px 14px; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                        ${renderPixelIcon('unlock', 10, '#ffffff')} Buka Siklus 2
                      </button>
                    </div>
                  `}
                </div>

                <!-- Masalah 5 -->
                <div style="position: relative; background: ${this.isCycle2Unlocked ? 'var(--surface-panel-alt)' : 'rgba(217, 119, 6, 0.04)'}; border: 1px ${this.isCycle2Unlocked ? 'solid var(--border-subtle)' : 'dashed rgba(217, 119, 6, 0.40)'}; border-radius: 8px; overflow: hidden;">
                  <!-- Konten kartu (selalu dirender, diblur saat terkunci) -->
                  <div style="padding: 12px; display: flex; flex-direction: column; gap: 6px; ${this.isCycle2Unlocked ? '' : 'filter: blur(4px); pointer-events: none; user-select: none;'}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 6px;">
                      <div style="font-size: 11.5px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 5px;">
                        ${renderPixelIcon('flask', 12, 'var(--primary)')} 5. Mesin Minuman Otomatis
                      </div>
                      <span class="badge-pill" style="font-size: 8.5px; padding: 1px 5px; color: var(--primary); background: var(--surface-panel);">SWITCH-CASE</span>
                    </div>
                    <div style="font-size: 11px; line-height: 1.5; color: var(--text-secondary);">
                      Mesin penjual mengeluarkan teh saat tombol kopi ditekan, dan macet total jika pelanggan menekan nomor menu tak terdaftar.
                    </div>
                    <div style="font-size: 10px; color: var(--text-muted); border-top: 1px dashed var(--border-subtle); padding-top: 6px;">
                      Pencocokan nilai diskrit tombol dan blok penampung standar (<code style="font-family: var(--font-code); color: var(--primary);">default</code>).
                    </div>
                  </div>
                  <!-- Overlay kunci (hanya tampil saat terkunci) -->
                  ${this.isCycle2Unlocked ? '' : `
                    <div style="position: absolute; inset: 0; background: rgba(245, 241, 232, 0.72); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 8px;">
                      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                        ${renderPixelIcon('lock', 20, 'var(--warning-dark)')}
                        <span style="font-family: var(--font-pixel); font-size: 8.5px; color: var(--warning-dark); letter-spacing: 0.5px; text-align: center;">SIKLUS 2 TERKUNCI</span>
                      </div>
                      <button type="button" class="btn-unlock-cycle2-dialog game-btn game-btn-gold" style="font-size: 11px; padding: 6px 14px; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                        ${renderPixelIcon('unlock', 10, '#ffffff')} Buka Siklus 2
                      </button>
                    </div>
                  `}
                </div>
              </div>
            </div>

            <!-- Catatan Fokus Misi Investigasi Tim -->
            <div style="font-size: 11.5px; color: var(--text-secondary); background: rgba(15, 118, 110, 0.04); border: 1px solid rgba(15, 118, 110, 0.16); border-radius: 6px; padding: 8px 12px; line-height: 1.5;">
              <strong style="color: var(--primary);">Misi Investigasi Tim:</strong> Tugas kalian adalah menelusuri bagaimana kode program mengevaluasi setiap kondisi, menemukan letak kekeliruan alur cabang, dan memastikan seluruh kemungkinan skenario teruji hingga tuntas.
            </div>
          </div>

          <!-- Uji Nalar Metakognitif Interaktif bersama Pak Budi -->
          <div style="border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px; background: #ffffff;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
              ${renderPixelIcon('flask', 13, 'var(--primary)')}
              <span style="font-family: var(--font-pixel); font-size: 9.5px; color: var(--primary);">Tantangan Nalar Awal Tim</span>
            </div>
            <p style="font-size: 12.5px; color: var(--text-primary); margin-bottom: 10px; line-height: 1.55;">
              Mari mulai penyelidikan dari aturan Palang Gerbang Stasiun MRT (Masalah 1): <code style="font-family: var(--font-code); background: var(--surface-panel-alt); padding: 2px 6px; border-radius: 4px; color: var(--primary); font-weight: 600;">JIKA (saldo &gt;= 4000) MAKA Buka Pintu</code>. Jika seorang penumpang menempelkan kartu dengan <strong>saldo Rp2.500</strong>:
            </p>

            <!-- Opsi Jawaban Uji Hipotesis -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
              <button id="btn-hipotesis-benar" type="button" class="game-btn game-btn-secondary" style="font-size: 11px; padding: 8px 12px; min-height: 42px; text-align: center; justify-content: center; border-radius: 8px;">
                ${renderPixelIcon('lock', 12, 'var(--text-secondary)')} Pintu Tetap Tertutup (FALSE)
              </button>
              <button id="btn-hipotesis-salah" type="button" class="game-btn game-btn-secondary" style="font-size: 11px; padding: 8px 12px; min-height: 42px; text-align: center; justify-content: center; border-radius: 8px;">
                ${renderPixelIcon('play', 12, 'var(--text-secondary)')} Pintu Terbuka (TRUE)
              </button>
            </div>

            <!-- Respon Validasi Interaktif Pak Budi -->
            <div id="kotak-respon-hipotesis" style="display: none; border-radius: 8px; padding: 10px 12px; font-size: 12px; line-height: 1.55; transition: all 0.2s ease;"></div>
          </div>

          <!-- Peta Langkah Penyelidikan (Roadmap) -->
          <div style="border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px 16px; background: var(--surface-panel-alt);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              ${renderPixelIcon('map', 13, 'var(--primary)')} Agenda Penyelidikan: ${pairName}
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 11.5px;">
              <div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary);">
                <span style="width: 18px; height: 18px; border-radius: 50%; background: rgba(15, 118, 110, 0.12); color: var(--primary); font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center;">1</span>
                <span><strong>Ruang Kelas:</strong> Bedah Konsep &amp; Alur IF</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary);">
                <span style="width: 18px; height: 18px; border-radius: 50%; background: rgba(15, 118, 110, 0.12); color: var(--primary); font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center;">2</span>
                <span><strong>Lab Telusur:</strong> Uji Semua Jalur Kondisi</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary);">
                <span style="width: 18px; height: 18px; border-radius: 50%; background: rgba(15, 118, 110, 0.12); color: var(--primary); font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center;">3</span>
                <span><strong>Arena Bug:</strong> Tuntaskan Tantangan Logika</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary);">
                <span style="width: 18px; height: 18px; border-radius: 50%; background: rgba(15, 118, 110, 0.12); color: var(--primary); font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center;">4</span>
                <span><strong>LKPD Fisik:</strong> Catat Hasil &amp; Refleksi Tim</span>
              </div>
            </div>
          </div>

          <!-- Opsi Tombol Aksi Navigasi Utama -->
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 4px;">
            <button id="btn-dialog-to-materi" type="button" class="game-btn game-btn-primary" style="width: 100%; min-height: 46px; text-align: left; justify-content: flex-start; gap: 10px; border-radius: 8px;">
              ${renderPixelIcon('book', 15, '#ffffff')} Masuk ke Gedung Sekolah (Buka Materi Percabangan)
            </button>
            ${isTracingUnlocked ? `
            <button id="btn-dialog-to-tracing" type="button" class="game-btn game-btn-secondary" style="width: 100%; min-height: 44px; text-align: left; justify-content: flex-start; gap: 10px; border-radius: 8px;">
              ${renderPixelIcon('flask', 13, 'var(--primary)')} Lanjutkan ke Lab Telusur Kode
            </button>
            ` : ''}
            <button id="btn-dialog-to-overworld" type="button" class="game-btn game-btn-secondary" style="width: 100%; min-height: 44px; text-align: left; justify-content: flex-start; gap: 10px; border-radius: 8px;">
              ${renderPixelIcon('arrow-left', 14, 'var(--text-secondary)')} Kembali ke Peta
            </button>
          </div>
        </div>
      </div>
    `;

    // Interaktivitas Uji Hipotesis Bersama Pak Budi
    const btnBenar = card.querySelector<HTMLButtonElement>('#btn-hipotesis-benar');
    const btnSalah = card.querySelector<HTMLButtonElement>('#btn-hipotesis-salah');
    const kotakRespon = card.querySelector<HTMLElement>('#kotak-respon-hipotesis');

    btnBenar?.addEventListener('click', () => {
      soundFx.playLogicTrue();
      if (btnBenar) {
        btnBenar.style.borderColor = 'var(--primary)';
        btnBenar.style.background = 'rgba(15, 118, 110, 0.08)';
        btnBenar.style.color = 'var(--primary)';
        btnBenar.style.fontWeight = '700';
      }
      if (btnSalah) {
        btnSalah.style.borderColor = 'var(--border-subtle)';
        btnSalah.style.background = '#ffffff';
        btnSalah.style.color = 'var(--text-secondary)';
        btnSalah.style.fontWeight = 'normal';
      }
      if (kotakRespon) {
        kotakRespon.style.display = 'block';
        kotakRespon.style.background = 'rgba(15, 118, 110, 0.08)';
        kotakRespon.style.border = '1px solid rgba(15, 118, 110, 0.25)';
        kotakRespon.style.color = 'var(--text-primary)';
        kotakRespon.innerHTML = `
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <div style="margin-top: 1px;">${renderPixelIcon('check', 14, 'var(--primary)')}</div>
            <div>
              <strong style="color: var(--primary);">Analisis Logika Kalian Tepat Sekali!</strong>
              <div style="margin-top: 3px; color: var(--text-secondary); line-height: 1.5;">
                Karena saldo Rp2.500 lebih kecil dari batas Rp4.000, ekspresi kondisi <code style="font-family: var(--font-code); color: var(--primary);">(2500 &gt;= 4000)</code> menghasilkan nilai <strong>SALAH (FALSE)</strong>. Komputer melompati instruksi pembuka gerbang dan pintu tetap tertutup aman. Kalian memiliki modal nalar yang sangat baik untuk memulai penyelidikan di ruang kelas!
              </div>
            </div>
          </div>
        `;
      }
    });

    btnSalah?.addEventListener('click', () => {
      soundFx.playLogicFalse();
      if (btnSalah) {
        btnSalah.style.borderColor = 'var(--warning-dark)';
        btnSalah.style.background = 'rgba(217, 119, 6, 0.08)';
        btnSalah.style.color = 'var(--warning-dark)';
        btnSalah.style.fontWeight = '700';
      }
      if (btnBenar) {
        btnBenar.style.borderColor = 'var(--border-subtle)';
        btnBenar.style.background = '#ffffff';
        btnBenar.style.color = 'var(--text-secondary)';
        btnBenar.style.fontWeight = 'normal';
      }
      if (kotakRespon) {
        kotakRespon.style.display = 'block';
        kotakRespon.style.background = 'rgba(217, 119, 6, 0.08)';
        kotakRespon.style.border = '1px solid rgba(217, 119, 6, 0.25)';
        kotakRespon.style.color = 'var(--text-primary)';
        kotakRespon.innerHTML = `
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <div style="margin-top: 1px;">${renderPixelIcon('help', 14, 'var(--warning-dark)')}</div>
            <div>
              <strong style="color: var(--warning-dark);">Mari Teliti Bersama Pasanganmu:</strong>
              <div style="margin-top: 3px; color: var(--text-secondary); line-height: 1.5;">
                Perhatikan angka saldonya: Rp2.500 belum memenuhi syarat minimal Rp4.000, sehingga ekspresi kondisi menghasilkan nilai <strong>SALAH (FALSE)</strong>. Jika pintu terbuka, penumpang tanpa saldo cukup bisa lolos masuk. Komputer harus menahan gerbang tetap tertutup!
              </div>
            </div>
          </div>
        `;
      }
    });

    // Tombol Buka Kunci Siklus 2 pada Ringkasan Masalah
    card.querySelectorAll<HTMLButtonElement>('.btn-unlock-cycle2-dialog').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundFx.playButtonBlip();
        this.showStudentTokenModal();
      });
    });

    // Navigasi Layar
    card.querySelector('#btn-dialog-to-materi')?.addEventListener('click', () => {
      this.setScreen('MATERI');
    });

    card.querySelector('#btn-dialog-to-tracing')?.addEventListener('click', () => {
      this.setScreen('TRACING');
    });

    card.querySelector('#btn-dialog-to-overworld')?.addEventListener('click', () => {
      this.setScreen('OVERWORLD');
    });

    return card;
  }

  // =================================================================
  // Layar 04: Materi Pembelajaran (Modular Concept Reader 2-Column)
  // =================================================================
  // =================================================================
  // Layar 04: Materi Pembelajaran (Modular Concept Reader 2-Column)
  // =================================================================
  private renderScreenMateri(): HTMLElement {
    const currentTopic = getMateriTopicById(this.activeMateriId);
    const currentIndex = MATERI_BANK.findIndex((t) => t.id === currentTopic.id);
    const isCurrentTopicLocked = currentTopic.cycleRequired === 2 && !this.isCycle2Unlocked;

    // Catat topik materi saat ini sebagai telah dibaca jika tidak terkunci
    if (!isCurrentTopicLocked && !this.readMateriIds.includes(this.activeMateriId)) {
      this.readMateriIds.push(this.activeMateriId);
      void StorageService.markMateriAsRead(this.activeMateriId);
    }

    // Hitung materi wajib dibaca sesuai status siklus:
    // Siklus 1: 8 materi (cycleRequired: 1). Siklus 2: 10 materi (seluruh materi).
    const requiredTopics = MATERI_BANK.filter((t) =>
      this.isCycle2Unlocked ? true : t.cycleRequired === 1
    );
    const totalRequired = requiredTopics.length;
    const readRequiredCount = requiredTopics.filter((t) =>
      this.readMateriIds.includes(t.id)
    ).length;
    const isAllRequiredRead =
      readRequiredCount >= totalRequired || !!this.progressionState?.teacherBypassMode;

    const container = document.createElement('div');
    container.className = 'materi-layout';

    // -------------------------------------------------------------
    // Kolom Kiri: Navigasi Sidebar Modul Pembelajaran (Responsif Mobile)
    // -------------------------------------------------------------
    const sidebar = document.createElement('div');
    sidebar.className = 'tactile-card materi-sidebar';

    const prasyaratTopics = MATERI_BANK.filter((t) => t.category === 'PRASYARAT');
    const percabanganTopics = MATERI_BANK.filter((t) => t.category === 'PERCABANGAN');

    sidebar.innerHTML = `
      <!-- Header Sidebar dengan Tombol Buka/Tutup di Mobile -->
      <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid var(--border-retro); padding-bottom: 8px;">
        <div class="eyebrow-label" style="color: var(--primary); display: flex; align-items: center; gap: 6px; margin: 0;">
          ${renderPixelIcon('book', 13, 'var(--primary)')}
          <span>Daftar Modul</span>
          <span class="badge-pill" style="font-size: 8.5px; padding: 1px 6px;">${MATERI_BANK.length} TOPIK</span>
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

    // Populate Tombol Prasyarat
    const listPrasyarat = sidebar.querySelector('#materi-list-prasyarat');
    prasyaratTopics.forEach((topic) => {
      const isActive = topic.id === currentTopic.id;
      const isRead = this.readMateriIds.includes(topic.id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `game-btn ${isActive ? 'game-btn-primary' : 'game-btn-secondary'}`;
      btn.style.cssText = `display: flex; align-items: center; justify-content: flex-start; text-align: left; font-size: 11px; min-height: 40px; width: 100%; padding: 6px 10px; gap: 6px; line-height: 1.35; box-sizing: border-box; ${isActive ? 'border-left: 3px solid var(--warning);' : ''}`;

      const checkIcon = isRead
        ? `<span style="color: var(--success); display: inline-flex; align-items: center; margin-left: auto; padding-left: 4px; flex-shrink: 0;" title="Materi telah dipelajari">${renderPixelIcon('check', 11, 'var(--success)')}</span>`
        : '';

      btn.innerHTML = `<span style="font-family: var(--font-pixel, monospace); font-size: 8.5px; opacity: 0.85; flex-shrink: 0;">${topic.order}.</span> <span style="flex: 1; min-width: 0;">${topic.title}</span>${checkIcon}`;
      btn.addEventListener('click', () => {
        soundFx.playButtonBlip();
        this.activeMateriId = topic.id;
        this.render();
        this.scrollToTop();
      });
      listPrasyarat?.appendChild(btn);
    });

    // Populate Tombol Percabangan
    const listPercabangan = sidebar.querySelector('#materi-list-percabangan');
    percabanganTopics.forEach((topic) => {
      const isActive = topic.id === currentTopic.id;
      const isLocked = topic.cycleRequired === 2 && !this.isCycle2Unlocked;
      const isRead = this.readMateriIds.includes(topic.id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `game-btn ${isActive ? 'game-btn-primary' : 'game-btn-secondary'} ${isLocked ? 'is-locked' : ''}`;
      btn.style.cssText = `display: flex; align-items: center; justify-content: flex-start; text-align: left; font-size: 11px; min-height: 40px; width: 100%; padding: 6px 10px; gap: 6px; line-height: 1.35; box-sizing: border-box; ${isActive ? 'border-left: 3px solid var(--primary-light, #14b8a6);' : ''}`;

      const statusBadge = isLocked
        ? `<span class="badge-pill" style="font-size: 7.5px; padding: 1px 4px; color: var(--warning-dark); border-color: rgba(217, 119, 6, 0.4); background: rgba(217, 119, 6, 0.1); margin-left: auto; flex-shrink: 0;">${renderPixelIcon('lock', 9, 'currentColor')} SIKLUS 2</span>`
        : (isRead
          ? `<span style="color: var(--success); display: inline-flex; align-items: center; margin-left: auto; padding-left: 4px; flex-shrink: 0;" title="Materi telah dipelajari">${renderPixelIcon('check', 11, 'var(--success)')}</span>`
          : '');

      btn.innerHTML = `<span style="font-family: var(--font-pixel, monospace); font-size: 8.5px; opacity: 0.85; flex-shrink: 0;">${topic.order}.</span> <span style="flex: 1; min-width: 0;">${topic.title}</span>${statusBadge}`;

      btn.addEventListener('click', () => {
        if (isLocked) {
          soundFx.playLogicFalse();
        } else {
          soundFx.playButtonBlip();
        }
        this.activeMateriId = topic.id;
        this.render();
        this.scrollToTop();
      });
      listPercabangan?.appendChild(btn);
    });

    // -------------------------------------------------------------
    // Kolom Kanan: Kartu Baca Materi
    // -------------------------------------------------------------
    const contentCard = document.createElement('div');
    contentCard.className = 'tactile-card materi-content-card';

    // Render HTML Sections
    let sectionsHtml = '';
    currentTopic.sections.forEach((sec, sIdx) => {
      let codeSnippetHtml = '';
      if (sec.codeSnippet) {
        const snippet = sec.codeSnippet;
        const hasDualVersion = !!(snippet.codeC && snippet.codePseudo);

        if (hasDualVersion) {
          const escapeHtml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const safeC = escapeHtml(snippet.codeC || '');
          const safePseudo = escapeHtml(snippet.codePseudo || '');
          const descHtml = snippet.description
            ? `<div style="padding: 8px 12px; background: rgba(0, 0, 0, 0.25); border-top: 1px solid #27272a; font-size: 11px; color: #a1a1aa; line-height: 1.45;">${snippet.description}</div>`
            : '';

          codeSnippetHtml = `
            <div class="code-dual-container" data-snippet-id="${sIdx}">
              <div class="code-dual-header">
                <div class="code-dual-title">
                  ${renderPixelIcon('document', 11, 'var(--primary-light, #14b8a6)')}
                  <span>${snippet.language}</span>
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
            <div style="margin: 12px 0 16px;">
              <div class="eyebrow-label" style="color: var(--text-secondary); margin-bottom: 4px; font-size: 10px;">
                ${snippet.language}:
              </div>
              <div class="tactile-inset" style="padding: 12px 14px; font-family: var(--font-code); font-size: 12px; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">${snippet.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
          `;
        }
      }

      let tableHtml = '';
      if (sec.tableData) {
        const headerCols = sec.tableData.headers
          .map(
            (h) =>
              `<th style="padding: 8px 10px; font-weight: bold; border-bottom: 1.5px solid var(--border-retro); font-size: 11.5px; color: var(--text-primary); text-align: left;">${h}</th>`
          )
          .join('');
        const rowRows = sec.tableData.rows
          .map(
            (r, rIdx) =>
              `<tr style="background: ${rIdx % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.02)'}; border-bottom: 1px solid var(--border-retro);">
                ${r
                .map(
                  (cell, cIdx) =>
                    `<td style="padding: 8px 10px; vertical-align: top; font-size: 11.5px; ${cIdx === 0 ? 'font-weight: 600; font-family: var(--font-code);' : ''}">${cell.replace(/\n/g, '<br />')}</td>`
                )
                .join('')}
              </tr>`
          )
          .join('');

        tableHtml = `
          <div class="tactile-panel" style="padding: 4px; overflow-x: auto; margin: 12px 0 16px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
              <thead style="background: var(--surface-panel-alt);"><tr>${headerCols}</tr></thead>
              <tbody>${rowRows}</tbody>
            </table>
          </div>
        `;
      }

      sectionsHtml += `
        <div style="margin-bottom: 18px;">
          <h3 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin: 14px 0 6px; display: flex; align-items: center; gap: 6px;">
            ${renderPixelIcon('document', 11, 'var(--primary)')} ${sec.heading}
          </h3>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.65;">
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
              <text x="50" y="24" text-anchor="middle" font-family="'Inter', sans-serif" font-size="11" font-weight="bold" fill="#15803D">Terminator</text>
              <text x="50" y="55" text-anchor="middle" font-family="'Inter', sans-serif" font-size="9.5" fill="#4B5563">Mulai / Selesai</text>
            </g>
            <path d="M 115, 34 L 135, 34" stroke="#78716C" stroke-width="2" marker-end="url(#arrow-sym)"/>

            <!-- 2. Input/Output -->
            <g transform="translate(140, 15)">
              <polygon points="12,0 100,0 88,38 0,38" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
              <text x="50" y="24" text-anchor="middle" font-family="'Inter', sans-serif" font-size="11" font-weight="bold" fill="#0284C7">Input/Output</text>
              <text x="50" y="55" text-anchor="middle" font-family="'Inter', sans-serif" font-size="9.5" fill="#4B5563">Masukan/Keluaran</text>
            </g>
            <path d="M 245, 34 L 265, 34" stroke="#78716C" stroke-width="2" marker-end="url(#arrow-sym)"/>

            <!-- 3. Process -->
            <g transform="translate(270, 15)">
              <rect x="0" y="0" width="95" height="38" rx="4" fill="#F3F4F6" stroke="#4B5563" stroke-width="2"/>
              <text x="47" y="24" text-anchor="middle" font-family="'Inter', sans-serif" font-size="11" font-weight="bold" fill="#374151">Process</text>
              <text x="47" y="55" text-anchor="middle" font-family="'Inter', sans-serif" font-size="9.5" fill="#4B5563">Hitung / Nilai</text>
            </g>
            <path d="M 370, 34 L 390, 34" stroke="#78716C" stroke-width="2" marker-end="url(#arrow-sym)"/>

            <!-- 4. Decision (Belah Ketupat) -->
            <g transform="translate(395, 2)">
              <polygon points="50,0 100,32 50,64 0,32" fill="#FEF3C7" stroke="#D97706" stroke-width="2.2"/>
              <text x="50" y="36" text-anchor="middle" font-family="'Inter', sans-serif" font-size="11" font-weight="bold" fill="#B45309">Decision</text>
              <text x="50" y="80" text-anchor="middle" font-family="'Inter', sans-serif" font-size="9.5" font-weight="600" fill="#B45309">Uji Kondisi (Ya/Tidak)</text>
            </g>

            <!-- 5. Keterangan Panah Alir -->
            <g transform="translate(10, 115)">
              <rect x="0" y="0" width="560" height="42" rx="6" fill="#F7F5F0" stroke="#D0C7B8" stroke-width="1.5"/>
              <line x1="20" y1="21" x2="65" y2="21" stroke="#0F766E" stroke-width="2.5" marker-end="url(#arrow-flow)"/>
              <text x="80" y="25" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#1C1917">Flowline (Garis Alir):</text>
              <text x="210" y="25" font-family="'Inter', sans-serif" font-size="10.5" fill="#4B5563">Menunjukkan urutan jalannya instruksi dari atas ke bawah.</text>
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
            <text x="220" y="27" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="bold" fill="#0F766E">Mulai</text>

            <!-- Garis Alir Mulai -> Kondisi -->
            <line x1="220" y1="36" x2="220" y2="58" stroke="#0F766E" stroke-width="2" marker-end="url(#arrow-green-s)"/>

            <!-- 2. Belah Ketupat Kondisi (Decision Diamond) -->
            <polygon points="220,60 295,95 220,130 145,95" fill="#FFFFFF" stroke="#D97706" stroke-width="2.2"/>
            <text x="220" y="92" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="bold" fill="#1C1917">suhu &gt; 30?</text>
            <text x="220" y="107" text-anchor="middle" font-family="'Inter', sans-serif" font-size="8.5" font-weight="600" fill="#92400E">(Evaluasi Boolean)</text>

            <!-- 3. Cabang YA / TRUE (Mengalir ke Bawah) -->
            <path d="M 220,130 L 220,158" fill="none" stroke="#15803D" stroke-width="2.2" marker-end="url(#arrow-green-s)"/>
            <rect x="235" y="134" width="28" height="16" rx="3" fill="#DCFCE7" stroke="#15803D" stroke-width="1"/>
            <text x="250" y="146" text-anchor="middle" font-family="'Inter', sans-serif" font-size="9" font-weight="bold" fill="#15803D">Ya</text>

            <!-- Kotak Aksi Sirine (Proses) -->
            <rect x="150" y="160" width="140" height="38" rx="6" fill="#FFFFFF" stroke="#15803D" stroke-width="2"/>
            <text x="210" y="176" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="bold" fill="#15803D">Bunyikan Sirine</text>
            <text x="220" y="190" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8.5" fill="#57534E">sirine = ON</text>

            <!-- Garis Alir dari Aksi ke Lanjut -->
            <path d="M 220,198 L 220,248" fill="none" stroke="#78716C" stroke-width="2" marker-end="url(#arrow-gray-s)"/>

            <!-- 4. Cabang TIDAK / FALSE (Bypass Kanan Menuju Selesai) -->
            <path d="M 295,95 L 365,95 L 365,263 L 305,263" fill="none" stroke="#DC2626" stroke-width="2" marker-end="url(#arrow-red-s)"/>
            <rect x="305" y="75" width="38" height="16" rx="3" fill="#FEE2E2" stroke="#DC2626" stroke-width="1"/>
            <text x="324" y="87" text-anchor="middle" font-family="'Inter', sans-serif" font-size="9" font-weight="bold" fill="#DC2626">Tidak</text>
            
            <!-- 5. Titik Selesai / Langkah Berikutnya -->
            <rect x="140" y="250" width="160" height="26" rx="13" fill="#EFECE6" stroke="#A8A29E" stroke-width="1.8"/>
            <text x="220" y="267" text-anchor="middle" font-family="'Inter', sans-serif" font-size="9.5" font-weight="bold" fill="#1C1917">Lanjut Baris Berikutnya</text>
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
            <text x="215" y="38" font-family="'Inter', sans-serif" font-size="9" font-weight="bold" fill="#15803D">Ya</text>
            <rect x="265" y="28" width="90" height="34" rx="5" fill="#DCFCE7" stroke="#15803D" stroke-width="1.5"/>
            <text x="310" y="49" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="bold" fill="#15803D">Grade A</text>

            <path d="M 120,75 L 120,110" fill="none" stroke="#DC2626" stroke-width="2" marker-end="url(#arrow-n-rd)"/>
            <text x="130" y="95" font-family="'Inter', sans-serif" font-size="9" font-weight="bold" fill="#DC2626">Tidak</text>

            <polygon points="120,115 190,145 120,175 50,145" fill="#FFFFFF" stroke="#D97706" stroke-width="2"/>
            <text x="120" y="148" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" fill="#1C1917">nilai &gt;= 75?</text>

            <path d="M 190,145 L 260,145" fill="none" stroke="#15803D" stroke-width="2" marker-end="url(#arrow-n-gr)"/>
            <text x="215" y="138" font-family="'Inter', sans-serif" font-size="9" font-weight="bold" fill="#15803D">Ya</text>
            <rect x="265" y="128" width="90" height="34" rx="5" fill="#DCFCE7" stroke="#15803D" stroke-width="1.5"/>
            <text x="310" y="149" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="bold" fill="#15803D">Grade B</text>

            <path d="M 120,175 L 120,210" fill="none" stroke="#DC2626" stroke-width="2" marker-end="url(#arrow-n-rd)"/>
            <text x="130" y="195" font-family="'Inter', sans-serif" font-size="9" font-weight="bold" fill="#DC2626">Tidak</text>
            <rect x="70" y="212" width="100" height="34" rx="5" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
            <text x="120" y="233" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="bold" fill="#DC2626">Grade C / D</text>
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
              ${sim.variableLabel}:
            </label>
            <input id="input-sim-val" type="number" class="pixel-input" value="${sim.defaultValue}" style="width: 120px; min-height: 38px; font-family: var(--font-code); font-size: 13px; font-weight: bold;" />
            <button id="btn-run-sim" type="button" class="game-btn game-btn-primary" style="font-size: 11.5px; min-height: 38px; padding: 6px 14px; gap: 6px; border-radius: 8px;">
              ${renderPixelIcon('bolt', 12, '#ffffff')} Uji Kondisi
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

    contentCard.innerHTML = `
      <!-- Konten Modul Materi (diblur saat Siklus 2 terkunci) -->
      <div style="${isCurrentTopicLocked ? 'filter: blur(4px); pointer-events: none; user-select: none; max-height: 520px; overflow: hidden;' : ''}">
        <!-- Header Modul -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; gap: 10px; flex-wrap: wrap;">
          <div>
            <div class="eyebrow-label" style="color: ${isPercabangan ? 'var(--primary)' : 'var(--warning-dark)'}; margin-bottom: 2px;">
              ${currentTopic.categoryLabel.toUpperCase()} • TOPIK ${currentTopic.order}
            </div>
            <h2 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 2px 0 3px;">
              ${currentTopic.title}
            </h2>
            <div style="font-size: 12px; color: var(--text-secondary);">
              ${currentTopic.subtitle}
            </div>
          </div>
          <span class="badge-pill" style="${badgeStyle}">
            ${currentTopic.badgeLabel}
          </span>
        </div>

        <!-- Analogi Kehidupan Sehari-hari jika ada -->
        ${analogyHtml}

        <!-- Ringkasan Intisari Teori -->
        <div style="padding: 14px 16px; font-size: 13px; color: var(--text-primary); line-height: 1.6; margin-bottom: 16px; background: ${isPercabangan ? 'rgba(15, 118, 110, 0.04)' : 'rgba(217, 119, 6, 0.04)'}; border: 1px solid ${isPercabangan ? 'rgba(15, 118, 110, 0.2)' : 'rgba(217, 119, 6, 0.2)'}; border-radius: 10px;">
          <strong style="color: ${isPercabangan ? 'var(--primary)' : 'var(--warning-dark)'};">Intisari Teori:</strong> ${currentTopic.summary}
        </div>

        <!-- Diagram Flowchart jika ada -->
        ${diagramHtml}

        <!-- Simulator Interaktif jika ada -->
        ${simulatorHtml}

        <!-- Bagian-Bagian Materi Pembelajaran -->
        ${sectionsHtml}

        <!-- Uji Pemahaman Cepat jika ada -->
        ${quizHtml}

        <!-- Kotak Petunjuk / Tips Guru -->
        <div class="tips-callout" style="margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: bold; color: var(--warning); font-size: 12px;">
            ${renderPixelIcon('bulb', 14, 'var(--warning)')} Tips Logika Penting:
          </div>
          <p style="margin-top: 4px; font-size: 12.5px; line-height: 1.5; color: var(--text-secondary);">
            ${currentTopic.proTips}
          </p>
        </div>

        <!-- Kotak Peringatan Miskonsepsi jika ada -->
        ${misconceptionHtml}
      </div>

      <!-- Overlay Kunci Siklus 2 (tampil saat modul Siklus 2 terkunci) -->
      ${isCurrentTopicLocked ? `
        <div style="position: absolute; inset: 0; background: rgba(245, 241, 232, 0.78); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 24px; border-radius: 12px; text-align: center; z-index: 10;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: rgba(217, 119, 6, 0.12); margin-bottom: 4px; border: 2px solid var(--warning);">
            ${renderPixelIcon('lock', 26, 'var(--warning)')}
          </div>
          <div class="eyebrow-label" style="color: var(--warning-dark); margin-bottom: 2px;">Gerbang Siklus 2 Terkunci</div>
          <h2 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px;">
            ${currentTopic.title}
          </h2>
          <p style="font-size: 12.5px; color: var(--text-secondary); max-width: 440px; margin: 0 auto 12px; line-height: 1.55;">
            Materi tingkat lanjut (Percabangan Bertingkat &amp; Majemuk) dibuka menggunakan <strong>Token Kelas</strong> yang diumumkan oleh Guru Informatika saat masuk ke pertemuan Siklus 2.
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
            <button id="btn-unlock-materi-cycle2" type="button" class="game-btn game-btn-gold" style="font-size: 11px; padding: 8px 16px; min-height: 40px; display: inline-flex; align-items: center; gap: 6px;">
              ${renderPixelIcon('unlock', 11, '#ffffff')} Masukkan Token Guru
            </button>
            <button id="btn-back-to-cycle1" type="button" class="game-btn game-btn-secondary" style="font-size: 11px; padding: 8px 14px; min-height: 40px; display: inline-flex; align-items: center; gap: 6px;">
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
            <button id="btn-materi-next" type="button" class="game-btn game-btn-secondary materi-nav-btn" ${currentIndex === MATERI_BANK.length - 1 ? 'disabled' : ''}>
              <span>Selanjutnya</span> ${renderPixelIcon('arrow-right', 12, 'currentColor')}
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
          this.activeMateriId = nextTopic.id;
          this.render();
          this.scrollToTop();
        } else {
          soundFx.playButtonBlip();
          this.activeMateriId = nextTopic.id;
          this.render();
          this.scrollToTop();
        }
      }
    });

    contentCard.querySelector('#btn-to-tracing')?.addEventListener('click', async () => {
      if (!isAllRequiredRead) {
        soundFx.playLogicFalse();
        this.showRetroToast(`Pelajari seluruh ${totalRequired} materi ${this.isCycle2Unlocked ? 'Siklus 1 & 2' : 'Siklus 1'} terlebih dahulu (${readRequiredCount}/${totalRequired} selesai)!`, false);
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

  // =================================================================
  // Layar 05: Penelusur Kode Langkah-demi-Langkah (Code Tracing Arena)
  // =================================================================
  private renderScreenTracing(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'tracing-screen-layout';

    // =========================================================================
    // 0. Pita Panduan Alur Belajar Terstruktur (Pedagogical Stepper Ribbon)
    // =========================================================================
    const workflowRibbon = document.createElement('div');
    workflowRibbon.className = 'tracing-workflow-ribbon';
    workflowRibbon.id = 'tracing-workflow-ribbon';

    const step1Status = !this.isInputApplied && this.userPrediction === null ? 'active' : 'completed';
    const step2Status = this.isInputApplied ? 'completed' : '';
    const step3Status = this.userPrediction !== null ? 'completed' : (this.isInputApplied ? 'active' : '');
    const isCompletedRun = this.currentStepIndex >= (this.currentTraceResult?.steps.length || 1) - 1 && this.userPrediction !== null;
    const step4Status = isCompletedRun ? 'completed' : (this.userPrediction !== null ? 'active' : '');

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
        <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-ui);">
          Selesaikan langkah 1 sampai 4 secara berurutan
        </div>
      </div>
      <div class="tracing-workflow-steps">
        <div class="tracing-step-item ${step1Status}" id="wf-step-1">
          <div class="tracing-step-badge">1</div>
          <div class="tracing-step-info">
            <span class="tracing-step-title">Pilih Kasus</span>
            <span class="tracing-step-desc">Pelajari skenario masalah program</span>
          </div>
        </div>
        <div class="tracing-step-item ${step2Status}" id="wf-step-2">
          <div class="tracing-step-badge">2</div>
          <div class="tracing-step-info">
            <span class="tracing-step-title">Tentukan Masukan</span>
            <span class="tracing-step-desc">Isi nilai masukan yang ingin diuji</span>
          </div>
        </div>
        <div class="tracing-step-item ${step3Status}" id="wf-step-3">
          <div class="tracing-step-badge">3</div>
          <div class="tracing-step-info">
            <span class="tracing-step-title">Perkirakan Jalur</span>
            <span class="tracing-step-desc">Pilih dugaan cabang: Benar atau Salah</span>
          </div>
        </div>
        <div class="tracing-step-item ${step4Status}" id="wf-step-4">
          <div class="tracing-step-badge">4</div>
          <div class="tracing-step-info">
            <span class="tracing-step-title">Buktikan di Meja Kerja</span>
            <span class="tracing-step-desc">Jalankan baris kode & buktikan dugaan</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(workflowRibbon);

    // =========================================================================
    // ZONA 1: Orientasi & Hipotesis Awal (Langkah 1, 2, dan 3)
    // =========================================================================
    const zoneOrientation = document.createElement('div');
    zoneOrientation.className = 'tracing-zone-orientation';

    // Kartu Hero Terpadu: Pemilih Kasus, Skenario Kontekstual, & Form Hipotesis
    const heroCard = document.createElement('div');
    heroCard.className = 'tracing-hero-card';

    // 1.A. Bar Header: Langkah 1 - Pemilih Kasus & Token Siklus 2
    const heroTop = document.createElement('div');
    heroTop.className = 'tracing-hero-top';

    const selectEl = document.createElement('select');
    selectEl.id = 'select-module-trace';
    selectEl.className = 'tracing-select-input';

    CASE_MODULES.forEach((mod) => {
      const isLocked = mod.cycleRequired === 2 && !this.isCycle2Unlocked;
      const opt = document.createElement('option');
      opt.value = mod.id;
      opt.textContent = `${isLocked ? '[KUNCI SIKLUS 2] ' : ''}${mod.id.toUpperCase()}: ${mod.title}`;
      if (mod.id === this.activeModule.id) {
        opt.selected = true;
      }
      selectEl.appendChild(opt);
    });

    selectEl.addEventListener('change', async () => {
      const targetId = selectEl.value;
      const found = CASE_MODULES.find((m) => m.id === targetId);
      if (found) {
        if (found.cycleRequired === 2 && !this.isCycle2Unlocked) {
          selectEl.value = this.activeModule.id;
          soundFx.playLogicFalse();
          this.showStudentTokenModal(found.id);
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
      }
    });

    heroTop.innerHTML = `
      <div class="tracing-module-picker">
        <span class="eyebrow-label" style="color: var(--primary); flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('flask', 13, 'var(--primary)')} Langkah 1: Pilih Kasus
        </span>
        <span class="badge-pill" style="color: ${this.isTracingPracticeMode ? 'var(--text-muted)' : 'var(--success)'}; font-weight: bold; font-size: 11px; border-color: ${this.isTracingPracticeMode ? 'var(--border-subtle)' : 'rgba(21, 128, 61, 0.4)'}; background: ${this.isTracingPracticeMode ? 'var(--surface-panel-alt)' : 'rgba(21, 128, 61, 0.1)'};">
          ${this.isTracingPracticeMode ? 'Mode Latihan' : 'Lab Formatif'}
        </span>
      </div>
      <button id="btn-toggle-hero-card" type="button" class="game-btn game-btn-secondary" style="font-size: 10.5px; padding: 4px 10px; min-height: 32px; display: inline-flex; align-items: center; gap: 6px;" title="${this.isTracingHeroCollapsed ? 'Buka detail setup studi kasus' : 'Ciutkan kartu setup untuk fokus ke Meja Kerja'}">
        ${this.isTracingHeroCollapsed ? renderPixelIcon('arrow-down', 10, 'currentColor') + ' Buka Setup' : renderPixelIcon('arrow-up', 10, 'currentColor') + ' Ciutkan Setup'}
      </button>
    `;
    heroTop.firstElementChild?.appendChild(selectEl);
    heroCard.appendChild(heroTop);

    // 1.B. Strip Ringkas Hero Card (tampil saat kartu diciutkan agar murid tetap tahu konteks kasus aktif)
    const heroCompactSummary = document.createElement('div');
    heroCompactSummary.id = 'hero-compact-summary';
    heroCompactSummary.className = 'tracing-hero-compact-bar';
    heroCompactSummary.style.display = this.isTracingHeroCollapsed ? 'flex' : 'none';
    heroCompactSummary.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px;">
        <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: var(--primary); background: rgba(15, 118, 110, 0.1);">
          ${this.activeModule.id.toUpperCase()}
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
      <button id="btn-reopen-hero-card" type="button" class="game-btn game-btn-secondary" style="font-size: 10.5px; padding: 4px 8px; min-height: 28px;">
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

    // 1.C. Skenario Kontekstual Masalah
    const storyCallout = document.createElement('div');
    storyCallout.className = 'tracing-story-callout';
    storyCallout.innerHTML = `
      <div class="tracing-story-header">
        ${renderPixelIcon('document', 12, '#b45309')} Skenario Masalah: ${this.activeModule.title}
      </div>
      <div class="tracing-story-text">
        ${this.activeModule.storyPrompt}
      </div>
    `;
    heroCollapsibleBody.appendChild(storyCallout);

    // 1.D. Form Setup Masukan (Langkah 2) & Gerbang Hipotesis Pause & Predict (Langkah 3)
    const branchDefs = MODULE_BRANCHES[this.activeModule.id] || MODULE_BRANCHES['m01']!;
    const setupGrid = document.createElement('div');
    setupGrid.className = 'tracing-setup-grid';
    setupGrid.innerHTML = `
      <!-- Langkah 2: Input Nilai Uji -->
      <div>
        <div class="eyebrow-label" style="color: var(--primary); margin-bottom: 6px; display: inline-flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('document', 12, 'var(--primary)')} Langkah 2: Tentukan Masukan
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
      </div>

      <!-- Langkah 3: Perkirakan Jalur Logika (Hipotesis Murid) -->
      <div>
        <div class="eyebrow-label" style="color: var(--primary); margin-bottom: 6px; display: inline-flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('target', 12, 'var(--primary)')} Langkah 3: Perkirakan Jalur Logika (Hipotesis Murid)
        </div>
        <p style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 10px; line-height: 1.5;">
          Sebelum menelusuri baris kode di bawah, perkirakan cabang logika mana yang akan ditembus oleh nilai masukan:
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
            ? `${renderPixelIcon('shield', 11, '#b45309')} Langkah 2 belum selesai: Tentukan nilai masukan di samping terlebih dahulu.`
            : (this.userPrediction
                ? `${renderPixelIcon('check', 11, 'var(--success)')} Dugaan tercatat: Cabang <strong>${this.userPrediction}</strong>. Lanjutkan telusuri kode di Meja Kerja!`
                : `${renderPixelIcon('target', 11, '#b45309')} Nilai masukan siap (${this.currentInputValue}). Pilih salah satu dugaan cabang di atas untuk membuka Meja Kerja!`
              )
          }
        </div>
        <button id="btn-jump-to-workbench" type="button" class="game-btn game-btn-primary tracing-hypothesis-highlight-btn" style="${(this.userPrediction && this.isInputApplied) ? 'display: inline-flex;' : 'display: none;'}">
          ${renderPixelIcon('flask', 13, '#ffffff')}
          <span>Uji Dugaan: Cabang ${this.userPrediction || ''} di Meja Kerja</span>
          ${renderPixelIcon('arrow-right', 12, '#ffffff')}
        </button>
      </div>
    `;
    heroCollapsibleBody.appendChild(setupGrid);
    heroCard.appendChild(heroCollapsibleBody);
    zoneOrientation.appendChild(heroCard);
    container.appendChild(zoneOrientation);

    // =========================================================================
    // ZONA 2: Meja Kerja Penelusuran Logika (Langkah 4 - Workbench 2-Kolom)
    // =========================================================================
    const zoneWorkbench = document.createElement('div');
    zoneWorkbench.className = 'tracing-workbench-container';
    zoneWorkbench.id = 'tracing-workbench-anchor';

    // 0. Banner Komparasi Hipotesis Real-Time (Dugaan Murid vs Keputusan Nyata Komputer)
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
        <span>Langkah 4A: Visualisasi Kode & Diagram Alir</span>
      </div>
      <div class="tracing-segmented-nav">
        <button type="button" class="tracing-segmented-btn tab-btn-code ${this.tracingWorkbenchViewMode === 'CODE' ? 'active' : ''}">
          Kode
        </button>
        <button type="button" class="tracing-segmented-btn tab-btn-flow ${this.tracingWorkbenchViewMode === 'FLOW' ? 'active' : ''}">
          Diagram Alir
        </button>
        <button type="button" class="tracing-segmented-btn tab-btn-both ${this.tracingWorkbenchViewMode === 'BOTH' ? 'active' : ''}">
          Keduanya
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

    const updateViewMode = (mode: 'CODE' | 'FLOW' | 'BOTH') => {
      this.tracingWorkbenchViewMode = mode;
      soundFx.playButtonBlip();
      codeWrapper.style.display = (mode === 'CODE' || mode === 'BOTH') ? 'block' : 'none';
      flowWrapper.style.display = (mode === 'FLOW' || mode === 'BOTH') ? 'block' : 'none';

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
    leftCol.appendChild(codeWrapper);
    leftCol.appendChild(flowWrapper);
    traceGrid.appendChild(leftCol);

    // Kolom Kanan: Konsol Eksekusi, Telemetri, & Terminal
    const rightCol = document.createElement('div');
    rightCol.className = 'tracing-console-card';

    rightCol.innerHTML = `
      <!-- Header Konsol -->
      <div class="eyebrow-label" style="color: var(--primary); display: flex; align-items: center; gap: 6px; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle);">
        ${renderPixelIcon('target', 12, 'var(--primary)')}
        <span>Langkah 4B: Konsol Eksekusi & Telemetri Real-Time</span>
      </div>

      <!-- Seksi 1: Kendali Baris Eksekusi -->
      <div class="tracing-console-section">
        <div style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px;">
          Kendali Baris Eksekusi
        </div>
        <div class="tracing-stepper-grid">
          <button id="btn-step-prev" type="button" class="game-btn game-btn-secondary" style="min-height: 44px; font-size: 12px; gap: 6px;">
            ${renderPixelIcon('arrow-left', 12, 'currentColor')} Mundur
          </button>
          <button id="btn-step-next" type="button" class="game-btn game-btn-primary" style="min-height: 44px; font-size: 12px; gap: 6px;">
            Maju ${renderPixelIcon('arrow-right', 12, '#ffffff')}
          </button>
        </div>
        <button id="btn-run-full-sim" type="button" class="game-btn game-btn-warning" style="width: 100%; min-height: 44px; font-size: 12px; gap: 8px;">
          ${renderPixelIcon('run', 14, '#ffffff')} Jalankan Simulasi Lengkap
        </button>
      </div>

      <!-- Seksi 2: State Inspector Langkah Aktif (Langsung di bawah tombol agar terlihat jelas di mobile) -->
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

      <!-- Seksi 3: Terminal Keluaran Program (Langsung di bawah penjelasan baris) -->
      <div class="tracing-console-section">
        <div style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px;">
          Terminal Keluaran Program
        </div>
        <div class="tracing-terminal-shell">
          <div class="tracing-terminal-header">
            <span>${renderPixelIcon('terminal', 12, '#a1a1aa')} Konsol Teks Retro</span>
            <span style="font-size: 9.5px; color: #71717a;">STDOUT</span>
          </div>
          <div id="terminal-text" class="tracing-terminal-body">
            ${(this.isInputApplied && this.userPrediction) ? (this.currentTraceResult?.terminalOutput || '> (Menunggu eksekusi)') : '> (Menunggu masukan & dugaan alur)'}
          </div>
        </div>
      </div>

      <!-- Seksi 4: Telemetri Pemantau Nilai & Status Cabang -->
      <div class="tracing-console-section">
        <div style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px;">
          Telemetri Variabel & Logika
        </div>
        <div class="tracing-telemetry-row">
          <div class="tracing-telemetry-chip">
            <span class="tracing-telemetry-label">Masukan Aktif</span>
            <span id="watch-val-input" class="tracing-telemetry-val">${this.isInputApplied ? this.currentInputValue : '-'}</span>
          </div>
          <div class="tracing-telemetry-chip">
            <span class="tracing-telemetry-label">Dugaan Kamu</span>
            <span id="watch-val-pred" class="tracing-telemetry-val" style="color: var(--warning-dark);">${this.userPrediction || '-'}</span>
          </div>
          <div class="tracing-telemetry-chip">
            <span class="tracing-telemetry-label">Jalur Nyata Program</span>
            <span id="watch-val-branch" class="tracing-telemetry-val" style="color: var(--primary);">-</span>
          </div>
        </div>
      </div>

      <!-- Seksi 5: Ringkasan Pengujian Kasus -->
      <div class="tracing-console-section">
        <div class="tips-callout" style="padding: 12px 14px; font-size: 11.5px; border-radius: 8px; line-height: 1.5;">
          Ringkasan Pengujian: Masukan = <strong id="lkpd-note-input">${this.isInputApplied ? this.currentInputValue : '-'}</strong>, Dugaan = <strong id="lkpd-note-pred">${this.userPrediction || '-'}</strong>, Jalur Nyata = <strong id="lkpd-note-branch">-</strong>.
        </div>
      </div>
    `;
    traceGrid.appendChild(rightCol);
    zoneWorkbench.appendChild(traceGrid);
    container.appendChild(zoneWorkbench);

    // =========================================================================
    // ZONA 3: Hasil Pembuktian Hipotesis & Capaian Belajar
    // =========================================================================
    const zoneEvaluation = document.createElement('div');
    zoneEvaluation.className = 'tracing-zone-evaluation';
    zoneEvaluation.style.cssText = `display: flex; flex-direction: column; gap: 14px;`;

    const evalHeader = document.createElement('div');
    evalHeader.className = 'eyebrow-label';
    evalHeader.style.cssText = `color: var(--primary); display: flex; align-items: center; gap: 6px;`;
    evalHeader.innerHTML = `
      ${renderPixelIcon('star', 12, 'var(--primary)')}
      <span>Hasil Pembuktian Hipotesis & Capaian Belajar</span>
    `;
    zoneEvaluation.appendChild(evalHeader);

    // 3.A. Kartu Evaluasi Metakognisi (Tebakan Murid vs Realita Program)
    const evalCard = document.createElement('div');
    evalCard.id = 'prediction-evaluation-card';
    evalCard.className = 'tactile-card';
    evalCard.style.cssText = `padding: 16px 20px; border: 1px solid var(--border-retro); border-radius: 12px; background: #ffffff; transition: all 0.2s ease;`;
    zoneEvaluation.appendChild(evalCard);

    // 3.B. CoverageView Pelacak 2 Bintang Capaian
    zoneEvaluation.appendChild(this.coverageView.getElement());

    // 3.C. Kartu Aksi Lanjut ke Arena Tantangan Monster
    const nextStepCard = document.createElement('div');
    nextStepCard.className = 'tactile-card tracing-next-step-card';

    const isTracingDone = !!this.progressionState?.stepTracingCompleted;
    nextStepCard.innerHTML = `
      <div style="flex: 1;">
        <div class="eyebrow-label" style="color: ${isTracingDone ? 'var(--success)' : 'var(--warning)'}; margin-bottom: 2px;">
          ${renderPixelIcon(isTracingDone ? 'check' : 'lock', 12, isTracingDone ? 'var(--success)' : 'var(--warning)')} ${isTracingDone ? 'Misi Lab Telusur Terbukti' : 'Pembuktian Sedang Berjalan'}
        </div>
        <div style="font-size: 12.5px; color: var(--text-primary); font-weight: 600; line-height: 1.5;">
          ${isTracingDone ? 'Alur percabangan berhasil dibuktikan di Meja Kerja. Arena Tantangan Bug Monster kini siap dihadapi!' : 'Buktikan minimal 1 cabang logika (IF / ELSE) hingga baris selesai untuk membuka Arena Tantangan.'}
        </div>
      </div>
      <button id="btn-tracing-to-battle" type="button" class="game-btn ${isTracingDone ? 'game-btn-gold' : 'game-btn-secondary'} tracing-next-step-btn" ${!isTracingDone ? 'disabled' : ''}>
        ${renderPixelIcon('swords', 13, isTracingDone ? '#ffffff' : 'var(--text-muted)')}
        <span>Lanjut ke Arena Tantangan Monster</span>
        ${renderPixelIcon('arrow-right', 12, isTracingDone ? '#ffffff' : 'var(--text-muted)')}
      </button>
    `;
    nextStepCard.querySelector('#btn-tracing-to-battle')?.addEventListener('click', () => {
      this.bypassTracingGuardOnce = true;
      this.setScreen('BATTLE');
    });
    zoneEvaluation.appendChild(nextStepCard);
    container.appendChild(zoneEvaluation);

    // =========================================================================
    // Event Wiring & Interaksi Meja Kerja
    // =========================================================================
    const inputEl = heroCard.querySelector<HTMLInputElement>('#input-trace-val');
    const btnApply = heroCard.querySelector<HTMLButtonElement>('#btn-apply-input');
    const errEl = heroCard.querySelector<HTMLElement>('#input-error-msg');

    const btnStepPrev = rightCol.querySelector<HTMLButtonElement>('#btn-step-prev');
    const btnStepNext = rightCol.querySelector<HTMLButtonElement>('#btn-step-next');
    const btnRunSim = rightCol.querySelector<HTMLButtonElement>('#btn-run-full-sim');
    const predictHint = heroCard.querySelector<HTMLElement>('#predict-gate-hint');
    const branchPredictButtons = heroCard.querySelectorAll<HTMLButtonElement>('.btn-predict-branch');

    const updatePredictionGate = () => {
      const hasPrediction = this.userPrediction !== null && this.isInputApplied;
      if (btnStepPrev) btnStepPrev.disabled = !hasPrediction || this.currentStepIndex === 0;
      if (btnStepNext) btnStepNext.disabled = !hasPrediction || (this.currentStepIndex >= (this.currentTraceResult?.steps.length || 1) - 1);
      if (btnRunSim) btnRunSim.disabled = !hasPrediction;

      if (predictHint) {
        if (!this.isInputApplied) {
          predictHint.innerHTML = `${renderPixelIcon('shield', 11, '#b45309')} Langkah 2 belum selesai: Tentukan nilai masukan di samping terlebih dahulu.`;
          predictHint.style.display = 'flex';
        } else if (!hasPrediction) {
          predictHint.innerHTML = `${renderPixelIcon('target', 11, '#b45309')} Nilai masukan siap (${this.currentInputValue}). Pilih salah satu dugaan cabang di atas untuk membuka Meja Kerja!`;
          predictHint.style.display = 'flex';
        } else {
          predictHint.innerHTML = `${renderPixelIcon('check', 11, 'var(--success)')} Tebakan tercatat: Cabang <strong>${this.userPrediction}</strong>. Lanjutkan telusuri kode di Meja Kerja!`;
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

      if (wfStep1) {
        const isStep1Done = this.isInputApplied || this.userPrediction !== null;
        wfStep1.classList.toggle('completed', isStep1Done);
        wfStep1.classList.toggle('active', !isStep1Done);
      }
      if (wfStep2) {
        wfStep2.classList.toggle('completed', this.isInputApplied);
        wfStep2.classList.toggle('active', !this.isInputApplied && document.activeElement === inputEl);
      }
      if (wfStep3) {
        wfStep3.classList.toggle('completed', this.userPrediction !== null);
        wfStep3.classList.toggle('active', this.isInputApplied && this.userPrediction === null);
      }
      if (wfStep4) {
        const isFinished = this.currentStepIndex >= (this.currentTraceResult?.steps.length || 1) - 1 && hasPrediction;
        wfStep4.classList.toggle('completed', isFinished);
        wfStep4.classList.toggle('active', hasPrediction && !isFinished);
      }

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
      const lkpdInput = container.querySelector<HTMLElement>('#lkpd-note-input');
      if (lkpdInput) lkpdInput.textContent = this.isInputApplied ? String(this.currentInputValue) : '-';
      const lkpdPred = container.querySelector<HTMLElement>('#lkpd-note-pred');
      if (lkpdPred) lkpdPred.textContent = this.userPrediction || '-';
      const lkpdBranch = container.querySelector<HTMLElement>('#lkpd-note-branch');
      if (lkpdBranch) {
        lkpdBranch.textContent = isEvaluated
          ? (this.currentTraceResult?.executedBranch || '-')
          : (hasPrediction ? '(Menunggu langkah kondisi)' : '-');
      }

      const btnJump = heroCard.querySelector<HTMLButtonElement>('#btn-jump-to-workbench');
      if (btnJump) {
        if (this.userPrediction && this.isInputApplied) {
          btnJump.innerHTML = `${renderPixelIcon('flask', 13, '#ffffff')} <span>Uji Dugaan: Cabang ${this.userPrediction} di Meja Kerja</span> ${renderPixelIcon('arrow-right', 12, '#ffffff')}`;
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
      toggleHeroCard(true);
      zoneWorkbench.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      this.showRetroToast(`Masukan ${this.currentInputValue} ditetapkan! Lanjutkan ke Langkah 3: Tebak Alur.`, true);
    };

    btnApply?.addEventListener('click', handleApplyInput);
    inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleApplyInput();
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

    rightCol.querySelector('#btn-step-prev')?.addEventListener('click', () => {
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--;
        soundFx.playStepTick();
        this.updateStepDisplay(container);
        updatePredictionGate();
      }
    });

    rightCol.querySelector('#btn-step-next')?.addEventListener('click', () => {
      if (this.currentTraceResult && this.currentStepIndex < this.currentTraceResult.steps.length - 1) {
        this.currentStepIndex++;
        soundFx.playStepTick();
        this.updateStepDisplay(container);
        updatePredictionGate();
      } else {
        this.finishTraceRun();
      }
    });

    rightCol.querySelector('#btn-run-full-sim')?.addEventListener('click', () => {
      this.runFullSimulationAnimation(container);
    });

    updatePredictionGate();
    this.updateStepDisplay(container);
    return container;
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
    if (isMatch) {
      card.style.borderColor = 'rgba(15, 118, 110, 0.4)';
      card.style.background = '#f0fdf4';
      card.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="color: var(--success); flex-shrink: 0; margin-top: 2px;">
            ${renderPixelIcon('check', 16, 'var(--success)')}
          </div>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--success); margin-bottom: 3px;">
              Dugaan Kamu Terbukti Tepat!
            </div>
            <div style="font-size: 12px; color: var(--text-primary); line-height: 1.5;">
              Program membuktikan bahwa masukan <strong>${this.currentInputValue}</strong> menghasilkan evaluasi kondisi <strong>${this.currentTraceResult?.conditionResult ? 'BENAR (TRUE)' : 'SALAH (FALSE)'}</strong> dan mengeksekusi cabang <strong>${executedBranch}</strong>. Logika percabangan kamu sangat tajam!
            </div>
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
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--warning-dark); margin-bottom: 3px;">
              Dugaan Belum Sesuai dengan Hasil Evaluasi
            </div>
            <div style="font-size: 12px; color: var(--text-primary); line-height: 1.5;">
              Kamu menduga program akan mengambil cabang <strong>${this.userPrediction}</strong>. Namun dengan nilai masukan <strong>${this.currentInputValue}</strong>, kondisi program dievaluasi bernilai <strong>${this.currentTraceResult?.conditionResult ? 'BENAR (TRUE)' : 'SALAH (FALSE)'}</strong> sehingga alur eksekusi mengambil cabang <strong>${executedBranch}</strong>. Cermati kembali baris kondisi pada kode atau diagram alir di atas!
            </div>
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

    // Telemetri update real-time
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

    const noteInput = parent.querySelector<HTMLElement>('#lkpd-note-input');
    if (noteInput) noteInput.textContent = this.isInputApplied ? String(this.currentInputValue) : '-';
    const notePred = parent.querySelector<HTMLElement>('#lkpd-note-pred');
    if (notePred) notePred.textContent = this.userPrediction || '-';
    const noteBranch = parent.querySelector<HTMLElement>('#lkpd-note-branch');
    if (noteBranch) {
      noteBranch.textContent = isEvaluated
        ? (this.currentTraceResult.executedBranch || '-')
        : (this.userPrediction ? '(Menunggu langkah kondisi)' : '-');
    }

    // Update status pita panduan langkah
    const wfStep4 = parent.querySelector<HTMLElement>('#wf-step-4');
    if (wfStep4) {
      const isEnd = this.currentStepIndex >= this.currentTraceResult.steps.length - 1 && this.userPrediction !== null;
      wfStep4.classList.toggle('completed', isEnd);
      wfStep4.classList.toggle('active', this.userPrediction !== null && !isEnd);
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
            <span><strong>Catatan Komparasi:</strong> Keputusan komputer di baris ini selaras dengan dugaanmu (Cabang ${this.userPrediction}).</span>
          `;
        } else {
          stepHypoNote.className = 'tracing-inspector-hypothesis-note note-diff';
          stepHypoNote.innerHTML = `
            ${renderPixelIcon('bulb', 11, '#fbbf24')}
            <span><strong>Catatan Komparasi:</strong> Kamu menduga Cabang <strong>${this.userPrediction}</strong>, namun komputer mengevaluasi masukan ${this.currentInputValue} bernilai <strong>${this.currentTraceResult.conditionResult ? 'BENAR (TRUE)' : 'SALAH (FALSE)'}</strong> sehingga komputer mengambil Cabang <strong>${this.currentTraceResult.executedBranch}</strong>. Cabang <strong>${this.userPrediction}</strong> dilewati oleh komputer.</span>
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
            Dugaan Kamu: Cabang ${this.userPrediction}
          </span>
          <span style="font-size: 11px; color: var(--text-muted);">&harr;</span>
          <span class="badge-pill" style="font-size: 11px; background: rgba(100, 116, 139, 0.1); color: var(--text-secondary); border: 1px solid var(--border-subtle);">
            Jalur Komputer: (Menunggu Langkah Kondisi)
          </span>
        </div>
        <div style="font-size: 11.5px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('target', 11, 'var(--primary)')}
          <span>Dugaan tercatat. Jalankan tombol <strong>Maju</strong> untuk menelusuri bagaimana komputer mengevaluasi masukan <strong>${this.currentInputValue}</strong>!</span>
        </div>
      `;
    } else if (isMatch) {
      ribbon.className = 'tracing-hypothesis-status-ribbon ribbon-match';
      ribbon.innerHTML = `
        <div class="ribbon-chips-row">
          <span class="badge-pill" style="font-size: 11px; background: rgba(15, 118, 110, 0.12); color: var(--primary); border: 1px solid rgba(15, 118, 110, 0.3);">
            Dugaan Kamu: Cabang ${this.userPrediction}
          </span>
          <span style="font-size: 11px; color: var(--text-muted);">&harr;</span>
          <span class="badge-pill" style="font-size: 11px; background: rgba(21, 128, 61, 0.12); color: var(--success); border: 1px solid rgba(34, 197, 94, 0.3);">
            ${renderPixelIcon('check', 10, 'var(--success)')} Jalur Komputer: Cabang ${executed} (Sesuai)
          </span>
        </div>
        <div style="font-size: 11.5px; color: var(--success); display: flex; align-items: center; gap: 6px;">
          ${renderPixelIcon('check', 11, 'var(--success)')}
          <span><strong>Dugaan Sesuai:</strong> Nilai masukan <strong>${this.currentInputValue}</strong> menghasilkan evaluasi kondisi yang selaras dengan dugaanmu.</span>
        </div>
      `;
    } else {
      ribbon.className = 'tracing-hypothesis-status-ribbon ribbon-diff';
      ribbon.innerHTML = `
        <div class="ribbon-chips-row">
          <span class="badge-pill" style="font-size: 11px; background: rgba(217, 119, 6, 0.12); color: var(--warning-dark); border: 1px solid rgba(217, 119, 6, 0.3);">
            Dugaan Kamu: Cabang ${this.userPrediction}
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

    const btnRun = parent.querySelector<HTMLButtonElement>('#btn-run-full-sim');
    if (btnRun) btnRun.disabled = true;

    this.currentStepIndex = 0;
    this.updateStepDisplay(parent);

    if (this.autoPlayTimer !== null) {
      window.clearInterval(this.autoPlayTimer);
    }

    this.autoPlayTimer = window.setInterval(() => {
      if (!this.currentTraceResult) return;
      if (this.currentStepIndex < this.currentTraceResult.steps.length - 1) {
        this.currentStepIndex++;
        soundFx.playStepTick();
        this.updateStepDisplay(parent);
      } else {
        if (this.autoPlayTimer !== null) {
          window.clearInterval(this.autoPlayTimer);
          this.autoPlayTimer = null;
        }
        if (btnRun) btnRun.disabled = false;
        this.finishTraceRun();
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

      this.showRetroToast(
        `Dugaan belum tepat, tetapi penelusuran ini tetap tercatat. Cermati kembali kondisi pada kode, lalu coba lagi!`,
        false
      );
      return;
    }

    // Dugaan tepat: catat cabang yang berhasil dibuktikan
    soundFx.playStepTick();

    // Mode Latihan: nilai resmi sudah dikunci, jangan tulis ke storage
    if (this.isTracingPracticeMode) {
      this.showRetroToast(
        'Dugaan tepat! Namun sesi ini adalah Mode Latihan -- nilai formatif resmi kalian tidak berubah.',
        true
      );
      return;
    }

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
    let stars = 0;
    let addedXp = 0;

    if (testedArray.length >= 1) {
      stars = 1;
      if (oldProg.stars < 1) addedXp += 50;
    }
    if (testedArray.length >= 2) {
      stars = 2;
      if (oldProg.stars < 2) addedXp += 100;
    }

    const newProg = await StorageService.saveModuleCoverage(this.activeModule.id, testedArray, addedXp);
    this.session = await StorageService.getSession();
    this.progressionState = await StorageService.getProgressionState();
    this.allModuleProgress[this.activeModule.id] = newProg;
    this.formativeScores = await StorageService.getFormativeScores();

    // Kunci nilai telusur resmi pada saat siklus pertama kali tuntas (semua kasus explored/tested)
    if (!this.formativeScores.isTracingLocked && this.isTracingCycleCompleted()) {
      this.formativeScores = await StorageService.recordFirstAttemptTracing(this.formativeScores.tracingScore);
      this.isTracingPracticeMode = true; // Sesi berikutnya masuk sebagai latihan
    }

    this.coverageView.update(newProg, this.activeModule.id, this.formativeScores.tracingScore, this.isCycle2Unlocked);
    this.renderGlobalHeader();

    // Pembaruan reaktif elemen DOM lokal tanpa render() penuh agar scroll murid tidak tereset
    const nextStepCard = this.overlayContainer.querySelector<HTMLElement>('.tracing-next-step-card');
    if (nextStepCard) {
      const isTracingDone = !!this.progressionState?.stepTracingCompleted;
      const btnBattle = nextStepCard.querySelector<HTMLButtonElement>('#btn-tracing-to-battle');
      const eyebrow = nextStepCard.querySelector<HTMLElement>('.eyebrow-label');
      const infoText = nextStepCard.querySelector<HTMLElement>('div[style*="font-size: 12.5px"]');

      if (eyebrow) {
        eyebrow.style.color = isTracingDone ? 'var(--success)' : 'var(--warning)';
        eyebrow.innerHTML = `${renderPixelIcon(isTracingDone ? 'check' : 'lock', 12, isTracingDone ? 'var(--success)' : 'var(--warning)')} ${isTracingDone ? 'Misi Lab Telusur Terbukti' : 'Pembuktian Sedang Berjalan'}`;
      }
      if (infoText) {
        infoText.textContent = isTracingDone
          ? 'Alur percabangan berhasil dibuktikan di Meja Kerja. Arena Tantangan Bug Monster kini siap dihadapi!'
          : 'Buktikan minimal 1 cabang logika (IF / ELSE) hingga baris selesai untuk membuka Arena Tantangan.';
      }
      if (btnBattle && isTracingDone) {
        btnBattle.removeAttribute('disabled');
        btnBattle.className = 'game-btn game-btn-gold tracing-next-step-btn';
        btnBattle.innerHTML = `
          ${renderPixelIcon('swords', 13, '#ffffff')}
          <span>Lanjut ke Arena Tantangan Monster</span>
          ${renderPixelIcon('arrow-right', 12, '#ffffff')}
        `;
      }
    }

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
        buttons.push({
          label: 'Lanjut ke Arena Tantangan',
          isPrimary: false,
          action: () => this.setScreen('BATTLE')
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
        'Semua Jalur Kondisi Berhasil Diuji!',
        nextCase
          ? `Seluruh jalur kondisi logika sudah kalian uji secara tuntas pada ${this.activeModule.title}. Tim kalian meraih 2 Bintang! Lanjutkan ke kasus berikutnya: ${nextCase.title}.`
          : `Seluruh jalur kondisi logika sudah kalian uji secara tuntas pada ${this.activeModule.title}. Tim kalian berhasil meraih 2 Bintang sempurna!`,
        buttons
      );
    } else if (stars >= 1 && oldProg.stars < 1) {
      const toastMsg = nextCase
        ? `Pengujian cabang berhasil dicatat! Bintang 1 diraih. Uji cabang lainnya untuk meraih Bintang 2, atau lanjut ke kasus berikutnya (${nextCase.id.toUpperCase()}).`
        : 'Pengujian cabang berhasil dicatat! Bintang 1 berhasil diraih. Arena Tantangan kini telah terbuka.';
      this.showRetroToast(toastMsg, true);
    } else if (stars > oldProg.stars) {
      this.showRetroToast('Capaian bintang bertambah! Nilai pemahaman formatif kalian meningkat.', true);
    }
  }


  /**
   * Mengembalikan kasus (modul) berikutnya yang belum selesai (kurang dari 1 cabang teruji)
   * dalam siklus aktif, atau null jika semua sudah tuntas.
   */
  private getNextUncompletedCase(): CaseModule | null {
    const currentIndex = CASE_MODULES.findIndex(m => m.id === this.activeModule.id);
    const cycleCap = this.isCycle2Unlocked ? 2 : 1;

    for (let i = 0; i < CASE_MODULES.length; i++) {
      const idx = (currentIndex + 1 + i) % CASE_MODULES.length;
      const mod = CASE_MODULES[idx]!;
      if (mod.cycleRequired > cycleCap) continue;
      if (mod.id === this.activeModule.id) continue;
      const prog = this.allModuleProgress[mod.id];
      const branchCount = prog?.testedBranches?.length || 0;
      if (branchCount < 1) return mod;
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

    const battleRounds = [
      {
        roundNumber: 1,
        conditionDisplay: 'saldo_kartu (5000) >= tarif_mrt (3500)',
        questionPrompt: 'Ronde 1: Sistem Gerbang MRT memeriksa saldo kartu penumpang. Saldo kartu adalah 5000 dan tarif perjalanan adalah 3500. Apakah kondisi saldo_kartu (5000) >= tarif_mrt (3500) bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'TRUE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Tepat! 5000 >= 3500 bernilai BENAR (TRUE) karena 5000 lebih besar dari 3500. Cabang IF dieksekusi: gerbang terbuka dan saldo dipotong otomatis. Serangan logika menghantam Bug Monster (-10 HP)!',
        explanationWrong: 'Kurang tepat! 5000 >= 3500 seharusnya bernilai BENAR (TRUE) karena 5000 lebih besar dari 3500. Operator >= memeriksa apakah nilai kiri lebih besar atau sama dengan kanan. Cabang yang dieksekusi adalah IF, bukan ELSE. Serangan terpantul (-5 HP Hero).'
      },
      {
        roundNumber: 2,
        conditionDisplay: 'kecepatan (45) > batas_maksimal (60)',
        questionPrompt: 'Ronde 2: Sistem Radar Jalan Raya memeriksa kecepatan kendaraan. Kecepatan tercatat 45 km/jam dan batas maksimum adalah 60 km/jam. Apakah kondisi kecepatan (45) > batas_maksimal (60) bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'FALSE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Tepat sekali! 45 > 60 bernilai SALAH (FALSE) karena 45 lebih kecil dari 60. Cabang ELSE dieksekusi: laju kendaraan masih aman sehingga tidak ditilang. Serangan logika menghantam Bug Monster (-10 HP)!',
        explanationWrong: 'Kurang tepat! 45 > 60 seharusnya bernilai SALAH (FALSE) karena 45 tidak lebih besar dari 60. Operator > hanya bernilai TRUE jika nilai kiri melampaui batas kanan. Cabang yang dieksekusi adalah ELSE, bukan IF. Serangan terpantul (-5 HP Hero).'
      },
      {
        roundNumber: 3,
        conditionDisplay: 'stok_barang (0) == 0',
        questionPrompt: 'Ronde 3: Sistem Toko Online memeriksa stok barang saat flash sale. Jumlah stok tersisa adalah 0 unit. Apakah kondisi stok_barang (0) == 0 bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'TRUE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Tepat! 0 == 0 bernilai BENAR (TRUE) karena kedua nilai bernilai sama persis. Cabang IF dieksekusi: tombol produk berubah menjadi Habis Terjual (Sold Out). Serangan logika menghantam Bug Monster (-10 HP)!',
        explanationWrong: 'Kurang tepat! 0 == 0 seharusnya bernilai BENAR (TRUE) karena angka 0 sama persis dengan 0. Operator == memeriksa kesetaraan nilai numerik. Cabang yang seharusnya dieksekusi adalah IF, bukan ELSE. Serangan terpantul (-5 HP Hero).'
      },
      {
        roundNumber: 4,
        conditionDisplay: 'jumlah_tarik (800000) < saldo (500000)',
        questionPrompt: 'Ronde 4: Mesin ATM memeriksa penarikan tunai. Nasabah ingin menarik Rp 800.000, namun saldo rekening hanya Rp 500.000. Apakah kondisi jumlah_tarik (800000) < saldo (500000) bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'FALSE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Tepat sekali! 800000 < 500000 bernilai SALAH (FALSE) karena 800 ribu lebih besar dari 500 ribu. Cabang ELSE dieksekusi: ATM menampilkan pesan Saldo Tidak Mencukupi. Serangan logika menghantam Bug Monster (-10 HP)!',
        explanationWrong: 'Kurang tepat! 800000 < 500000 seharusnya bernilai SALAH (FALSE) karena 800.000 lebih besar dari 500.000, bukan lebih kecil. Operator < membutuhkan nilai kiri lebih kecil dari kanan agar bernilai TRUE. Cabang yang dieksekusi adalah ELSE, bukan IF. Serangan terpantul (-5 HP Hero).'
      },
      {
        roundNumber: 5,
        conditionDisplay: 'status_absen ("Izin") != "Hadir"',
        questionPrompt: 'Ronde 5 - Serangan Pemungkas: Sistem Presensi Digital memeriksa status kehadiran murid. Status yang tercatat adalah "Izin". Apakah kondisi status_absen ("Izin") != "Hadir" bernilai BENAR (TRUE) atau SALAH (FALSE)?',
        expectedBranch: 'TRUE' as const,
        damageToDeal: 10,
        optionTrue: {
          label: 'Cabang TRUE (Benar)'
        },
        optionFalse: {
          label: 'Cabang FALSE (Salah)'
        },
        explanationCorrect: 'Sempurna! "Izin" != "Hadir" bernilai BENAR (TRUE) karena kedua teks tidak sama. Operator != menghasilkan TRUE jika nilai kiri dan kanan berbeda. Sistem mengirim laporan presensi. Bug Monster takluk (-10 HP)!',
        explanationWrong: 'Kurang tepat! "Izin" dan "Hadir" adalah dua teks yang berbeda, sehingga operator != bernilai BENAR (TRUE). Operator != memeriksa ketidaksamaan dua nilai. Cabang IF yang seharusnya dieksekusi, bukan ELSE. Serangan terpantul (-5 HP Hero).'
      }
    ];

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
      void StorageService.recordFirstAttemptBattle(100).then((scores) => {
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
        ? 'Luar biasa! Bug Monster berhasil dikalahkan melalui 5 ronde evaluasi kondisi percabangan. Langkah 5: Evaluasi Mandiri kini telah terbuka! Skor tantangan tim tercatat 100.'
        : 'Luar biasa! Bug Monster berhasil dikalahkan kembali dalam mode latihan. Pemahaman logika percabangan kalian semakin kokoh!';

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

    const questions = [
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
        question: 'Pada program kasir toko alat tulis berikut, berapakah nilai akhir dari variabel bayar setelah dieksekusi?',
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
        explanation: 'Untuk memastikan program benar-benar andal, seluruh kemungkinan jalur keputusan harus diuji. Nilai masukan 50.000 baru menguji jalur Benar (IF). Agar pengujian tuntas, tim kalian juga perlu menguji jalur Salah (ELSE) dengan masukan di bawah 20.000 (misalnya 10.000).'
      }
    ];

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
            ? '"Kalian sedang membuka evaluasi dalam mode latihan. Jawaban dapat dicoba kembali tanpa mengubah nilai formatif resmi."'
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
          <div style="font-family: var(--font-code); font-weight: bold; font-size: 12.5px; color: ${
            this.selectedAnswer === currentQ.correctIndex ? 'var(--success)' : 'var(--danger)'
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
            this.evaluasiAnswers
          );
          this.formativeScores = updatedScores;

          await StorageService.saveProgressionState({ stepEvaluationCompleted: true });
          this.progressionState = await StorageService.getProgressionState();
          this.renderGlobalHeader();
          soundFx.playVictoryFanfare();

          const currentScore = this.evaluasiCorrectCount * 20;
          const isFirst = updatedScores.evaluasiAttemptCount === 1;

          const modalTitle = isFirst ? 'Evaluasi Formatif Selesai!' : 'Latihan Evaluasi Selesai!';
          const modalMessage = isFirst
            ? `Luar biasa! ${this.session?.pairId || 'Tim belajar kalian'} telah menyelesaikan 5 butir soal evaluasi pemahaman dengan skor ${currentScore} / 100. Nilai resmi formatif ini telah terkunci. Dasbor Capaian Belajar kini telah terbuka penuh!`
            : `Latihan selesai! Skor perolehan pengerjaan kali ini adalah ${currentScore} / 100. Catatan: Nilai formatif resmi tim kalian (${updatedScores.evaluasiScore} / 100) dari percobaan pertama tetap tersimpan aman.`;

          this.showCelebrationModal(
            modalTitle,
            modalMessage,
            [
              {
                label: 'Buka Dasbor Capaian & Rekap Nilai',
                isPrimary: true,
                action: () => this.setScreen('PROGRES')
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
  // Layar 08: Dasbor Capaian Belajar, Lencana, & Rekap LKPD
  // =================================================================
  private renderScreenProgres(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'pixel-card';
    card.style.cssText = `padding: 20px;`;

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

    card.innerHTML = `
      <!-- Header Dasbor Progres -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--border-retro); padding-bottom: 10px;">
        <span style="font-family: var(--font-pixel); font-size: 11px; color: var(--primary);">
          Dasbor Capaian Belajar &amp; Lencana Prestasi
        </span>
        <span style="font-family: var(--font-code); font-size: 11px; color: var(--warning); font-weight: bold;">
          [${this.session ? this.session.pairId : 'TIM BELUM TERDAFTAR'}]
        </span>
      </div>

      <!-- Kartu Profil Pasangan Belajar dengan Lambang Tim Pixel Art Resmi -->
      <div class="pixel-card-alt" style="padding: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
        <div class="profile-team-badge-wrapper" style="
          width: 72px;
          height: 72px;
          border-radius: 12px;
          border: 2px solid var(--border-retro);
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(28, 25, 23, 0.08);
          flex-shrink: 0;
        ">
          ${renderTeamSymbolPixelArt(this.session ? this.session.teamSymbol : 'algoritma', 42)}
          <span style="font-family: var(--font-pixel); font-size: 7.5px; color: var(--primary); margin-top: 3px;">
            ${(this.session?.teamSymbol || 'TIM').toUpperCase()}
          </span>
        </div>
        <div style="flex: 1; min-width: min(100%, 220px);">
          <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
            ${this.session ? `${escapeHtml(this.session.pairId)} (${escapeHtml(this.session.student1Name)} &amp; ${escapeHtml(this.session.student2Name)})` : 'Tim Belajar Murid'}
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span>Status: <strong style="color: ${formative.finalScore >= 75 ? 'var(--success)' : 'var(--warning-dark)'};">${formative.finalScore >= 75 ? 'Tuntas Memenuhi KKM' : 'Sedang Berproses'}</strong></span>
            <span style="color: var(--border-retro);">|</span>
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              Lambang Tim:
              <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; background: #ffffff; border: 1.5px solid var(--border-retro); border-radius: 5px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);">
                ${renderTeamSymbolPixelArt(this.session ? this.session.teamSymbol : 'algoritma', 18)}
                <strong style="font-family: var(--font-pixel); font-size: 9px; color: var(--primary);">${this.session ? this.session.teamSymbol : 'Algoritma'}</strong>
              </span>
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: var(--primary); font-family: var(--font-code);">
            <span style="font-weight: 700;">Nilai Formatif Akhir</span>
            <span style="font-weight: 800;">${formative.finalScore} / 100</span>
          </div>
          <div style="width: 100%; height: 10px; background-color: var(--surface-panel-alt); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-retro);">
            <div style="width: ${formative.finalScore}%; height: 100%; background-color: var(--primary); transition: width 0.3s ease;"></div>
          </div>
        </div>
      </div>

      <!-- Kartu Rekapitulasi Nilai Formatif 3 Pilar (Skala 1–100) -->
      <div class="pixel-card-alt" style="padding: 14px 16px; margin-bottom: 18px; border: 1px solid var(--border-retro);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
          <span style="font-family: var(--font-pixel); font-size: 10px; color: var(--primary);">
            Rekap Nilai Formatif Pembelajaran (Skala 1–100)
          </span>
          <span class="badge-pill" style="font-size: 10px; font-weight: 700; color: ${formative.isEvaluasiLocked ? 'var(--success)' : 'var(--warning)'}; background: ${formative.isEvaluasiLocked ? 'rgba(21, 128, 61, 0.08)' : 'rgba(217, 119, 6, 0.08)'}; border: 1px solid ${formative.isEvaluasiLocked ? 'rgba(21, 128, 61, 0.2)' : 'rgba(217, 119, 6, 0.2)'};">
            ${formative.isEvaluasiLocked ? 'Penilaian Resmi Terkunci' : 'Sesi Sedang Berjalan'}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 4px;">
          <!-- Pilar 1: Telusur -->
          <div class="tactile-card" style="padding: 12px 10px; text-align: center; border: 1px solid var(--border-subtle); border-radius: 10px; background: #ffffff;">
            <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-bottom: 4px;">1. Lab Telusur</div>
            <div style="font-family: var(--font-code); font-size: 20px; font-weight: 800; color: var(--primary);">${formative.tracingScore} <span style="font-size: 11px; color: var(--text-muted);">/ 100</span></div>
            <div style="font-size: 9.5px; color: var(--text-muted); margin-top: 2px;">${StorageService.getTracingStars(formative.tracingScore, this.isCycle2Unlocked)} dari 2 Bintang</div>
          </div>

          <!-- Pilar 2: Tantangan -->
          <div class="tactile-card" style="padding: 12px 10px; text-align: center; border: 1px solid var(--border-subtle); border-radius: 10px; background: #ffffff;">
            <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-bottom: 4px;">2. Tantangan Tempur</div>
            <div style="font-family: var(--font-code); font-size: 20px; font-weight: 800; color: var(--warning);">${formative.battleScore} <span style="font-size: 11px; color: var(--text-muted);">/ 100</span></div>
            <div style="font-size: 9.5px; color: var(--text-muted); margin-top: 2px;">5 Ronde Pertarungan</div>
          </div>

          <!-- Pilar 3: Evaluasi -->
          <div class="tactile-card" style="padding: 12px 10px; text-align: center; border: 1px solid var(--border-subtle); border-radius: 10px; background: #ffffff;">
            <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-bottom: 4px;">3. Evaluasi Mandiri</div>
            <div style="font-family: var(--font-code); font-size: 20px; font-weight: 800; color: var(--accent);">${formative.evaluasiScore} <span style="font-size: 11px; color: var(--text-muted);">/ 100</span></div>
            <div style="font-size: 9.5px; color: var(--text-muted); margin-top: 2px;">5 Soal Konseptual</div>
          </div>

          <!-- Rata-rata Nilai Formatif Akhir -->
          <div class="tactile-card" style="padding: 12px 10px; text-align: center; border: 1.5px solid var(--primary); border-radius: 10px; background: rgba(15, 118, 110, 0.04);">
            <div style="font-size: 11px; color: var(--primary); font-weight: 700; margin-bottom: 4px;">Nilai Formatif Akhir</div>
            <div style="font-family: var(--font-code); font-size: 22px; font-weight: 900; color: var(--primary);">${formative.finalScore} <span style="font-size: 11px; color: var(--text-muted);">/ 100</span></div>
            <div style="font-size: 9.5px; color: var(--text-secondary); margin-top: 2px;">Rata-rata 3 Pilar</div>
          </div>
        </div>
      </div>

      <!-- Bilah Tab Navigasi Dasbor Progres -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--border-retro); padding: 8px 4px 10px 4px; overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; scrollbar-width: none;">
        <button id="tab-btn-badges" type="button" class="game-btn ${this.activeProgressTab === 'BADGES' ? 'game-btn-primary' : 'game-btn-secondary'}" style="font-size: 12px; min-height: 38px; padding: 6px 14px; gap: 6px; flex-shrink: 0; white-space: nowrap;">
          ${renderPixelIcon('trophy', 13, 'currentColor')} Lencana Pencapaian
        </button>
        <button id="tab-btn-modules" type="button" class="game-btn ${this.activeProgressTab === 'MODULES' ? 'game-btn-primary' : 'game-btn-secondary'}" style="font-size: 12px; min-height: 38px; padding: 6px 14px; gap: 6px; flex-shrink: 0; white-space: nowrap;">
          ${renderPixelIcon('book', 13, 'currentColor')} Materi &amp; Kasus
        </button>
        <button id="tab-btn-export" type="button" class="game-btn ${this.activeProgressTab === 'EXPORT' ? 'game-btn-primary' : 'game-btn-secondary'}" style="font-size: 12px; min-height: 38px; padding: 6px 14px; gap: 6px; flex-shrink: 0; white-space: nowrap;">
          ${renderPixelIcon('drive', 13, 'currentColor')} Pengumpulan LKPD
        </button>
      </div>

      <!-- Konten Tab Aktif -->
      <div id="tab-content-area">
        ${this.activeProgressTab === 'BADGES'
        ? (() => {
          const hasCompletedAny = Object.values(this.allModuleProgress).some((p) => p.isCompleted);
          const isLencana2Unlocked = (this.allModuleProgress['m01']?.stars || 0) >= 2;
          return `
          <!-- Tampilan 3 Lencana Prestasi Berdampingan Sesuai Screen 08 -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px;">
            <!-- Lencana 1: Mengenal If-Else -->
            <div style="padding: 20px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);">
              <img src="/assets/images/badge_gold.svg" alt="Lencana Emas" style="width: 68px; height: 68px; margin-bottom: 12px; ${!hasCompletedAny ? 'opacity: 0.5; filter: grayscale(0.8);' : ''}" />
              <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                Mengenal If-Else
              </div>
              <div style="margin-bottom: 8px;">
                <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; color: ${hasCompletedAny ? 'var(--success)' : 'var(--text-muted)'}; background: ${hasCompletedAny ? 'rgba(21, 128, 61, 0.08)' : 'rgba(0,0,0,0.04)'}; border: 1px solid ${hasCompletedAny ? 'rgba(21, 128, 61, 0.2)' : 'rgba(28, 25, 23, 0.1)'}; padding: 3px 8px; border-radius: 6px;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background-color: currentColor;"></span>
                  ${hasCompletedAny ? 'TERBUKA • Tuntas' : 'TERKUNCI • Selesaikan 1 Modul'}
                </span>
              </div>
              <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
                Tuntas mempelajari konsep dasar percabangan logika dan evaluasi kondisi boolean.
              </p>
            </div>

            <!-- Lencana 2: Penjelajah Logika -->
            <div style="padding: 20px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);">
              <img src="/assets/images/badge_compass.svg" alt="Lencana Kompas" style="width: 68px; height: 68px; margin-bottom: 12px; ${!isLencana2Unlocked ? 'opacity: 0.5; filter: grayscale(0.8);' : ''}" />
              <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                Penjelajah Logika
              </div>
              <div style="margin-bottom: 8px;">
                <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; color: ${isLencana2Unlocked ? 'var(--primary)' : 'var(--text-muted)'}; background: ${isLencana2Unlocked ? 'rgba(15, 118, 110, 0.08)' : 'rgba(0,0,0,0.04)'}; border: 1px solid ${isLencana2Unlocked ? 'rgba(15, 118, 110, 0.2)' : 'rgba(28, 25, 23, 0.1)'}; padding: 3px 8px; border-radius: 6px;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background-color: currentColor;"></span>
                  ${isLencana2Unlocked ? 'TERBUKA • Kasus 1 Tuntas Bintang 2' : 'TERKUNCI • Tuntaskan Kasus 1 (Bintang 2)'}
                </span>
              </div>
              <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
                Berhasil menguji semua jalur kondisi kode (IF dan ELSE) pada Kasus 1.
              </p>
            </div>

            <!-- Lencana 3: Master Kondisi -->
            <div style="padding: 20px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; background: #ffffff; border: 1px solid ${this.isCycle2Unlocked ? 'rgba(217, 119, 6, 0.3)' : 'var(--border-subtle)'}; border-radius: 12px; box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04);">
              <img src="/assets/images/badge_lock.svg" alt="Lencana Gembok" style="width: 68px; height: 68px; margin-bottom: 12px; ${!this.isCycle2Unlocked ? 'opacity: 0.7;' : ''}" />
              <div style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                Master Kondisi
              </div>
              <div style="margin-bottom: 8px;">
                <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; color: ${this.isCycle2Unlocked ? 'var(--warning-dark)' : 'var(--text-muted)'}; background: ${this.isCycle2Unlocked ? 'rgba(217, 119, 6, 0.08)' : 'rgba(0,0,0,0.04)'}; border: 1px solid ${this.isCycle2Unlocked ? 'rgba(217, 119, 6, 0.25)' : 'rgba(28, 25, 23, 0.1)'}; padding: 3px 8px; border-radius: 6px;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background-color: currentColor;"></span>
                  ${this.isCycle2Unlocked ? 'TERBUKA • Siklus 2' : 'TERKUNCI • Modul Siklus 2'}
                </span>
              </div>
              <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px;">
                Selesaikan kasus percabangan bertingkat dan operator logika ganda di Siklus 2.
              </p>
              ${!this.isCycle2Unlocked ? `
                <button id="btn-token-progress" type="button" class="game-btn game-btn-gold" style="font-size: 10.5px; padding: 6px 12px; min-height: 40px; display: inline-flex; align-items: center; gap: 6px; border-radius: 8px;">
                  ${renderPixelIcon('lock', 11, '#ffffff')} Masukkan Token
                </button>
              ` : ''}
            </div>
          </div>
        `;
        })()
        : this.activeProgressTab === 'MODULES'
          ? `
          <!-- Tampilan Modul Kasus & Status Bintang -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${CASE_MODULES.map((m, idx) => {
            const isLocked = m.cycleRequired === 2 && !this.isCycle2Unlocked;
            const prog = this.allModuleProgress[m.id];
            const stars = prog?.stars || 0;
            let weight = 0;
            if (this.isCycle2Unlocked) {
              weight = idx === 0 ? 15 : (idx === 1 ? 15 : (idx === 2 ? 20 : 25));
            } else {
              weight = idx === 0 ? 30 : (idx === 1 ? 30 : (idx === 2 ? 40 : 0));
            }
            const isDone = (prog?.testedBranches?.length || 0) >= 1 || !!prog?.isCompleted;
            return `
              <div class="pixel-card-alt" style="padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                  <div style="font-family: var(--font-pixel); font-size: 10px; color: ${isLocked ? 'var(--text-muted)' : 'var(--primary)'}; margin-bottom: 2px;">
                    ${isLocked ? '[TERKUNCI] ' : ''}MODUL ${idx + 1}: ${m.title}
                  </div>
                  <div style="font-size: 12px; color: var(--text-secondary);">
                    ${isLocked ? 'Siklus 2: Memerlukan Token Kelas dari Guru' : `Bobot: <strong>${weight} Poin</strong> • Status: <span style="color: ${isDone ? 'var(--success)' : 'var(--text-muted)'}; font-weight: 600;">${isDone ? 'Tuntas Diselesaikan' : 'Belum Diuji'}</span>`}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${!isLocked ? `
                  <span style="display: inline-flex; align-items: center; gap: 3px;">
                    ${renderPixelIcon('star', 12, stars >= 1 ? 'var(--warning)' : 'var(--text-muted)')}
                    ${renderPixelIcon('star', 12, stars >= 2 ? 'var(--warning)' : 'var(--text-muted)')}
                  </span>
                  <button type="button" class="game-btn game-btn-secondary btn-open-module-case" data-id="${m.id}" style="font-size: 11px; padding: 6px 12px; min-height: 40px;">
                    Buka Kasus
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
        `
          : `
          <!-- Tampilan Pengumpulan LKPD & Google Drive Guru -->
          <div class="pixel-card" style="padding: 16px; border: 2px solid var(--warning);">
            <div style="font-family: var(--font-pixel); font-size: 10.5px; color: var(--warning); margin-bottom: 8px;">
              Pengumpulan Rekap Formatif LKPD
            </div>
            <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.6;">
              Kirimkan laporan kemajuan belajar tim kalian ke Google Drive Guru untuk penilaian formatif kelas.
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button id="btn-export-drive" type="button" class="game-btn game-btn-primary" style="width: 100%; min-height: 48px; gap: 8px;">
                ${renderPixelIcon('drive', 15, 'currentColor')} Kirim Rekap ke Google Drive Guru
              </button>
              <button id="btn-download-txt" type="button" class="game-btn game-btn-secondary" style="width: 100%; min-height: 48px; gap: 8px;">
                ${renderPixelIcon('document', 15, 'currentColor')} Unduh Berkas Laporan Teks (.txt)
              </button>
            </div>
          </div>
        `
      }
      </div>
    `;

    card.querySelector('#tab-btn-badges')?.addEventListener('click', () => {
      this.activeProgressTab = 'BADGES';
      this.render();
    });

    card.querySelector('#tab-btn-modules')?.addEventListener('click', () => {
      this.activeProgressTab = 'MODULES';
      this.render();
    });

    card.querySelector('#tab-btn-export')?.addEventListener('click', () => {
      this.activeProgressTab = 'EXPORT';
      this.render();
    });

    card.querySelector('#btn-token-progress')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      this.showStudentTokenModal();
    });

    card.querySelectorAll<HTMLButtonElement>('.btn-open-module-case').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundFx.playButtonBlip();
        const modId = btn.dataset.id;
        if (modId) this.selectModuleAndGoTracing(modId);
      });
    });

    card.querySelectorAll<HTMLButtonElement>('.btn-token-module-case').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundFx.playButtonBlip();
        const modId = btn.dataset.id;
        this.showStudentTokenModal(modId);
      });
    });

    const exportDriveBtn = card.querySelector<HTMLButtonElement>('#btn-export-drive');
    exportDriveBtn?.addEventListener('click', async () => {
      soundFx.playButtonBlip();
      const originalHtml = exportDriveBtn.innerHTML;
      exportDriveBtn.disabled = true;
      exportDriveBtn.innerHTML = `${renderPixelIcon('drive', 13, '#ffffff')} Menyiapkan Berkas...`;
      try {
        const res = await AssessmentExportService.exportToDrive();
        this.showRetroToast(res.message, res.success !== false);
      } finally {
        exportDriveBtn.disabled = false;
        exportDriveBtn.innerHTML = originalHtml;
      }
    });

    card.querySelector('#btn-download-txt')?.addEventListener('click', async () => {
      soundFx.playButtonBlip();
      const { filename, content } = await AssessmentExportService.generateTextData();
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showRetroToast(`Berkas laporan ${filename} berhasil diunduh ke gawai.`, true);
    });

    return card;
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

    return card;
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
        Semua materi, tantangan logika, dan soal latihan sudah tersimpan di HP/laptop ini. Kalian bisa belajar dan bermain kapan saja meski internet sekolah sedang mati atau tidak ada kuota.
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
      z-index: 2000;
      padding: 16px;
    `;

    const currentDriveUrl = await StorageService.getDriveUrl();
    let cycle2Selected = this.isCycle2Unlocked;
    let bypassSelected = this.progressionState?.teacherBypassMode ?? false;

    const content = document.createElement('div');
    content.className = 'tactile-card';
    content.style.cssText = `
      max-width: 480px;
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
          ${renderPixelIcon('gear', 16, 'var(--primary)')}
          <span style="font-family: var(--font-pixel); font-size: 11.5px; color: var(--primary); letter-spacing: 0.5px;">
            PANEL FASILITATOR GURU
          </span>
        </div>
        <button type="button" class="btn-close-modal" style="background: none; border: none; color: var(--text-muted); font-family: monospace; font-size: 14px; font-weight: bold; cursor: pointer; padding: 4px 8px;" title="Tutup">[X]</button>
      </div>

      <!-- Bagian 1: Verifikasi PIN Rahasia Guru -->
      <div id="pin-verification-section">
        <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
          Masukkan PIN Fasilitator Guru untuk membuka kendali materi Siklus 2, mode demonstrasi, dan konfigurasi pengumpulan tugas.
        </p>

        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 11.5px; font-weight: 700; margin-bottom: 6px; color: var(--text-primary);">
            PIN Fasilitator Guru:
          </label>
          <input id="input-teacher-pin" type="password" maxlength="10" class="pixel-input" placeholder="Ketik PIN guru..." style="width: 100%; min-height: 46px; font-size: 14px; letter-spacing: 3px;" autofocus />
          <div id="pin-err-msg" style="font-size: 11.5px; color: var(--danger); font-weight: 600; margin-top: 6px; display: none; align-items: center; gap: 6px;">
            ${renderPixelIcon('target', 11, 'var(--danger)')} PIN salah. Akses ditolak.
          </div>
        </div>

        <button id="btn-verify-pin" type="button" class="game-btn game-btn-gold" style="width: 100%; min-height: 46px; font-size: 12px; font-family: var(--font-pixel);">
          ${renderPixelIcon('play', 12, '#ffffff')} Verifikasi Akses Guru
        </button>
      </div>

      <!-- Bagian 2: Kontrol Interaktif Guru (Aktif setelah PIN Terverifikasi) -->
      <div id="teacher-controls" style="display: none; flex-direction: column; gap: 14px;">
        <!-- Kartu Master Switch Siklus 2 -->
        <div id="cycle-master-card" class="tactile-panel" style="padding: 14px 16px; border: 2px solid ${cycle2Selected ? 'var(--primary)' : 'var(--warning)'}; background: ${cycle2Selected ? 'rgba(15, 118, 110, 0.06)' : 'var(--surface-panel-alt)'}; transition: all 0.2s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 6px;">
            <span class="eyebrow-label" style="color: ${cycle2Selected ? 'var(--primary)' : 'var(--warning)'};">
              Master Switch Materi Siklus 2
            </span>
            <span id="cycle-badge-status" class="badge-pill" style="font-family: var(--font-code); font-size: 10px; font-weight: 700; color: ${cycle2Selected ? 'var(--success)' : 'var(--warning)'}; border-color: ${cycle2Selected ? 'var(--success)' : 'var(--warning)'}; background: ${cycle2Selected ? 'rgba(21, 128, 61, 0.1)' : 'rgba(217, 119, 6, 0.1)'}; display: inline-flex; align-items: center; gap: 4px;">
              ${cycle2Selected ? `${renderPixelIcon('unlock', 11, 'var(--success)')} Siklus 2 Terbuka` : `${renderPixelIcon('lock', 11, 'var(--warning)')} Siklus 1 Saja`}
            </span>
          </div>

          <!-- Tuas Saklar Interaktif Siklus 2 -->
          <div id="switch-trigger-row" style="display: flex; align-items: center; justify-content: space-between; gap: 14px; cursor: pointer; padding: 6px 0;">
            <div style="flex: 1;">
              <div id="switch-title" style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px;">
                ${cycle2Selected ? 'Buka Kunci Materi Siklus 2' : 'Materi Siklus 2 Terkunci'}
              </div>
              <p id="switch-subtitle" style="font-size: 11.5px; color: var(--text-secondary); margin: 0; line-height: 1.4;">
                ${cycle2Selected ? 'Modul 4 & 5 dapat diakses langsung oleh seluruh murid.' : 'Modul 4 & 5 disembunyikan agar murid fokus di materi dasar.'}
              </p>
            </div>

            <div id="tactile-switch" class="tactile-switch-track ${cycle2Selected ? 'active' : ''}" role="switch" aria-checked="${cycle2Selected}" title="Klik untuk mengganti status siklus">
              <div class="tactile-switch-knob"></div>
            </div>
          </div>

          <!-- Live Preview Status Modul yang Terdampak -->
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 12px; padding-top: 10px; border-top: 1px dashed var(--border-retro);">
            <div class="cycle-module-pill ${cycle2Selected ? 'unlocked' : ''}">
              <span style="font-family: var(--font-code); font-size: 11px; font-weight: 600;">Modul 4: Klasifikasi Paket Data (Else-If)</span>
              <span class="mod-status-text" style="font-family: var(--font-pixel); font-size: 9px; color: ${cycle2Selected ? 'var(--success)' : 'var(--text-muted)'}; font-weight: bold;">
                ${cycle2Selected ? 'Terbuka' : 'Terkunci'}
              </span>
            </div>
            <div class="cycle-module-pill ${cycle2Selected ? 'unlocked' : ''}">
              <span style="font-family: var(--font-code); font-size: 11px; font-weight: 600;">Modul 5: Pemilih Menu Minuman (Switch-Case)</span>
              <span class="mod-status-text" style="font-family: var(--font-pixel); font-size: 9px; color: ${cycle2Selected ? 'var(--success)' : 'var(--text-muted)'}; font-weight: bold;">
                ${cycle2Selected ? 'Terbuka' : 'Terkunci'}
              </span>
            </div>
          </div>
        </div>

        <!-- Kartu Mode Bebas Guru (Bypass Prosedur) -->
        <div id="bypass-master-card" class="tactile-panel" style="padding: 14px 16px; border: 2px solid ${bypassSelected ? 'var(--primary)' : 'var(--border-retro)'}; background: ${bypassSelected ? 'rgba(15, 118, 110, 0.06)' : 'var(--surface-panel-alt)'}; transition: all 0.2s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
            <span class="eyebrow-label" style="color: ${bypassSelected ? 'var(--primary)' : 'var(--text-secondary)'};">
              Mode Demo Guru (Bypass Prosedur)
            </span>
            <span id="bypass-badge-status" class="badge-pill" style="font-family: var(--font-code); font-size: 10px; font-weight: 700; color: ${bypassSelected ? 'var(--success)' : 'var(--text-muted)'}; border-color: ${bypassSelected ? 'var(--success)' : 'var(--border-retro)'}; background: ${bypassSelected ? 'rgba(21, 128, 61, 0.1)' : 'rgba(0, 0, 0, 0.05)'}; display: inline-flex; align-items: center; gap: 4px;">
              ${bypassSelected ? `${renderPixelIcon('unlock', 11, 'var(--success)')} Bypass Aktif` : `${renderPixelIcon('lock', 11, 'var(--text-muted)')} Terkunci Normal`}
            </span>
          </div>

          <div id="bypass-trigger-row" style="display: flex; align-items: center; justify-content: space-between; gap: 14px; cursor: pointer; padding: 4px 0;">
            <div style="flex: 1;">
              <div id="bypass-title" style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px;">
                ${bypassSelected ? 'Bypass Kunci Aktif (Bebas Akses)' : 'Alur Bertahap Standar Murid'}
              </div>
              <p id="bypass-subtitle" style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.4;">
                ${bypassSelected ? 'Semua menu dan gerbang dapat diakses langsung untuk demo pembelajaran guru.' : 'Murid wajib menyelesaikan langkah secara bertahap sesuai prosedur.'}
              </p>
            </div>

            <div id="tactile-bypass-switch" class="tactile-switch-track ${bypassSelected ? 'active' : ''}" role="switch" aria-checked="${bypassSelected}" title="Klik untuk mengaktifkan/menonaktifkan bypass guru">
              <div class="tactile-switch-knob"></div>
            </div>
          </div>
        </div>

        <!-- Pengaturan Google Drive Guru -->
        <div>
          <label style="display: block; font-size: 11.5px; font-weight: 700; margin-bottom: 6px; color: var(--text-primary);">
            Tautan Google Drive Pengumpulan Tugas:
          </label>
          <div style="display: flex; gap: 8px;">
            <input id="input-drive-url" type="text" class="pixel-input" value="${escapeHtml(sanitizeWebUrl(currentDriveUrl))}" style="flex: 1; min-height: 42px; font-size: 12px;" />
            <a id="btn-test-drive" href="${escapeHtml(sanitizeWebUrl(currentDriveUrl))}" target="_blank" rel="noopener noreferrer" class="game-btn game-btn-secondary" style="font-size: 11px; padding: 0 12px; min-height: 42px; text-decoration: none; display: flex; align-items: center;" title="Uji tautan di tab baru">
              ${renderPixelIcon('drive', 13, 'currentColor')} Tes Tautan
            </a>
          </div>
        </div>

        <!-- Tombol Aksi Simpan -->
        <button id="btn-save-teacher" type="button" class="game-btn game-btn-primary" style="width: 100%; min-height: 48px; font-size: 13px; font-weight: 700; gap: 8px; margin-top: 4px;">
          ${renderPixelIcon('check', 13, '#ffffff')} Simpan Pengaturan Guru
        </button>
      </div>
    `;

    const closeBtn = content.querySelector('.btn-close-modal');
    closeBtn?.addEventListener('click', () => backdrop.remove());

    const pinSection = content.querySelector<HTMLElement>('#pin-verification-section');
    const pinInput = content.querySelector<HTMLInputElement>('#input-teacher-pin');
    const pinErr = content.querySelector<HTMLElement>('#pin-err-msg');
    const btnVerify = content.querySelector<HTMLButtonElement>('#btn-verify-pin');
    const controls = content.querySelector<HTMLElement>('#teacher-controls');

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
    const masterCard = content.querySelector<HTMLElement>('#cycle-master-card');
    const badgeStatus = content.querySelector<HTMLElement>('#cycle-badge-status');
    const switchTitle = content.querySelector<HTMLElement>('#switch-title');
    const switchSubtitle = content.querySelector<HTMLElement>('#switch-subtitle');
    const modulePills = content.querySelectorAll<HTMLElement>('.cycle-module-pill');
    const statusTexts = content.querySelectorAll<HTMLElement>('.mod-status-text');

    const toggleCycleSwitch = () => {
      cycle2Selected = !cycle2Selected;

      // Update Switch Lever Visual
      switchTrack?.classList.toggle('active', cycle2Selected);
      switchTrack?.setAttribute('aria-checked', String(cycle2Selected));

      // Update Card Visual
      if (masterCard) {
        masterCard.style.borderColor = cycle2Selected ? 'var(--primary)' : 'var(--warning)';
        masterCard.style.background = cycle2Selected ? 'rgba(15, 118, 110, 0.06)' : 'var(--surface-panel-alt)';
      }

      // Update Badge Status
      if (badgeStatus) {
        badgeStatus.innerHTML = cycle2Selected
          ? `${renderPixelIcon('unlock', 11, 'var(--success)')} SIKLUS 2 TERBUKA`
          : `${renderPixelIcon('lock', 11, 'var(--warning)')} SIKLUS 1 SAJA`;
        badgeStatus.style.color = cycle2Selected ? 'var(--success)' : 'var(--warning)';
        badgeStatus.style.borderColor = cycle2Selected ? 'var(--success)' : 'var(--warning)';
        badgeStatus.style.background = cycle2Selected ? 'rgba(21, 128, 61, 0.1)' : 'rgba(217, 119, 6, 0.1)';
      }

      // Update Label Teks
      if (switchTitle) {
        switchTitle.textContent = cycle2Selected ? 'Buka Kunci Materi Siklus 2' : 'Materi Siklus 2 Terkunci';
      }
      if (switchSubtitle) {
        switchSubtitle.textContent = cycle2Selected
          ? 'Modul 4 & 5 dapat diakses langsung oleh seluruh murid.'
          : 'Modul 4 & 5 disembunyikan agar murid fokus di materi dasar.';
      }

      // Update Modul Preview Pills
      modulePills.forEach((p) => p.classList.toggle('unlocked', cycle2Selected));
      statusTexts.forEach((st) => {
        st.textContent = cycle2Selected ? 'TERBUKA' : 'TERKUNCI';
        st.style.color = cycle2Selected ? 'var(--success)' : 'var(--text-muted)';
      });

      // Suara Feedback Haptik
      if (cycle2Selected) {
        soundFx.playBranchSuccessChime();
      } else {
        soundFx.playLogicFalse();
      }
    };

    triggerRow?.addEventListener('click', toggleCycleSwitch);

    // Handler Interaksi Saklar Bypass Guru
    const bypassTrack = content.querySelector<HTMLElement>('#tactile-bypass-switch');
    const bypassTriggerRow = content.querySelector<HTMLElement>('#bypass-trigger-row');
    const bypassCard = content.querySelector<HTMLElement>('#bypass-master-card');
    const bypassBadge = content.querySelector<HTMLElement>('#bypass-badge-status');
    const bypassTitle = content.querySelector<HTMLElement>('#bypass-title');
    const bypassSubtitle = content.querySelector<HTMLElement>('#bypass-subtitle');

    const toggleBypassSwitch = () => {
      bypassSelected = !bypassSelected;

      bypassTrack?.classList.toggle('active', bypassSelected);
      bypassTrack?.setAttribute('aria-checked', String(bypassSelected));

      if (bypassCard) {
        bypassCard.style.borderColor = bypassSelected ? 'var(--primary)' : 'var(--border-retro)';
        bypassCard.style.background = bypassSelected ? 'rgba(15, 118, 110, 0.06)' : 'var(--surface-panel-alt)';
      }

      if (bypassBadge) {
        bypassBadge.innerHTML = bypassSelected
          ? `${renderPixelIcon('unlock', 11, 'var(--success)')} BYPASS AKTIF`
          : `${renderPixelIcon('lock', 11, 'var(--text-muted)')} TERKUNCI NORMAL`;
        bypassBadge.style.color = bypassSelected ? 'var(--success)' : 'var(--text-muted)';
        bypassBadge.style.borderColor = bypassSelected ? 'var(--success)' : 'var(--border-retro)';
        bypassBadge.style.background = bypassSelected ? 'rgba(21, 128, 61, 0.1)' : 'rgba(0, 0, 0, 0.05)';
      }

      if (bypassTitle) {
        bypassTitle.textContent = bypassSelected ? 'Bypass Kunci Aktif (Bebas Akses)' : 'Alur Bertahap Standar Murid';
      }
      if (bypassSubtitle) {
        bypassSubtitle.textContent = bypassSelected
          ? 'Semua menu dan gerbang dapat diakses langsung untuk demo pembelajaran guru.'
          : 'Murid wajib menyelesaikan langkah secara bertahap sesuai prosedur.';
      }

      if (bypassSelected) {
        soundFx.playBranchSuccessChime();
      } else {
        soundFx.playLogicFalse();
      }
    };

    bypassTriggerRow?.addEventListener('click', toggleBypassSwitch);

    // Sinkronisasi Live URL Google Drive
    const driveInput = content.querySelector<HTMLInputElement>('#input-drive-url');
    const driveTestBtn = content.querySelector<HTMLAnchorElement>('#btn-test-drive');
    driveInput?.addEventListener('input', () => {
      const val = driveInput.value.trim();
      if (driveTestBtn) {
        driveTestBtn.href = val || '#';
      }
    });

    // Simpan Pengaturan Guru
    const btnSave = content.querySelector<HTMLButtonElement>('#btn-save-teacher');
    btnSave?.addEventListener('click', async () => {
      const rawDrive = driveInput?.value.trim() || currentDriveUrl;
      const driveUrl = sanitizeWebUrl(rawDrive);
      const isNewlyUnlocked = cycle2Selected && !this.isCycle2Unlocked;

      await StorageService.setCycleState(cycle2Selected ? 2 : 1);
      await StorageService.setDriveUrl(driveUrl);
      this.isCycle2Unlocked = cycle2Selected;

      // Simpan status bypass guru
      const updatedProgression = await StorageService.setTeacherBypassMode(bypassSelected);
      this.progressionState = updatedProgression;

      backdrop.remove();
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
        <button type="button" class="btn-close-modal" style="background: none; border: none; color: var(--text-muted); font-family: monospace; font-size: 14px; font-weight: bold; cursor: pointer; padding: 4px 8px;" title="Tutup">[X]</button>
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
        <button id="btn-cancel-token" type="button" class="game-btn game-btn-secondary" style="width: 100%; min-height: 40px; font-size: 11.5px;">
          Kembali
        </button>
      </div>
    `;

    const closeBtn = content.querySelector('.btn-close-modal');
    const cancelBtn = content.querySelector('#btn-cancel-token');
    const handleClose = () => backdrop.remove();
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
          this.formativeScores = await StorageService.getFormativeScores();
          backdrop.remove();

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
      <div class="celebrate-modal-card tactile-card" style="
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

        <div class="eyebrow-label" style="color: var(--primary); margin-bottom: 4px;">
          ${isStudent ? 'Token Kelas Terverifikasi' : 'Pengaturan Guru Diterapkan'}
        </div>
        <h2 style="font-family: var(--font-pixel); font-size: 15px; color: var(--primary); margin: 0 0 10px; letter-spacing: 0.5px;">
          Gerbang Siklus 2 Terbuka!
        </h2>
        <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
          ${isStudent
        ? 'Selamat! Gawai tim kalian kini berhasil membuka materi tingkat lanjut: <strong>Modul 4 (Percabangan Bertingkat)</strong> dan <strong>Modul 5 (Switch-Case)</strong>.'
        : 'Seluruh gawai murid kini dapat mengakses materi tingkat lanjut: <strong>Modul 4 (Percabangan Bertingkat)</strong> dan <strong>Modul 5 (Switch-Case)</strong>.'
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

    overlay.querySelector('#btn-close-celebrate')?.addEventListener('click', () => {
      soundFx.playButtonBlip();
      overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  /**
   * Menampilkan pesan notifikasi pop retro elegan pengganti window.alert
   */
  public showRetroToast(message: string, isSuccess = true): void {
    let container = document.querySelector<HTMLElement>('.retro-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'retro-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'retro-toast-pill';
    toast.style.borderColor = isSuccess ? 'var(--primary)' : 'var(--danger)';
    toast.innerHTML = `
      ${renderPixelIcon(isSuccess ? 'check' : 'target', 14, isSuccess ? 'var(--success)' : 'var(--danger)')}
      <span>${message}</span>
    `;

    container.appendChild(toast);

    window.setTimeout(() => {
      toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      window.setTimeout(() => toast.remove(), 260);
    }, 2500);
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
      if (icon) icon.innerHTML = renderPixelIcon(isPlaying ? 'music' : 'music-off', 13, 'currentColor');
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
