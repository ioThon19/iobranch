// src/logic/TracerEngine.ts - Mesin Penelusuran Kode & Evaluator Logika Aman (SSOT: SDD.md Section 3.2)
import { RelationalOperator, CaseModule } from '../types/module.types';

export interface TraceStep {
  stepNumber: number;
  lineNumber: number;
  lineTextPseudo: string;
  lineTextC: string;
  description: string;
  evaluatedExpression?: string;
  conditionResult?: boolean;
  activeBranch: 'INIT' | 'CONDITION' | 'BRANCH_IF' | 'BRANCH_ELSE' | 'OUTPUT';
  terminalOutput?: string;
}

export interface TraceExecutionResult {
  steps: TraceStep[];
  conditionResult: boolean;
  executedBranch: string;
  terminalOutput: string;
  skippedLineNumbers: number[];
}

export interface InputValidationResult {
  isValid: boolean;
  value: number;
  errorMessage?: string;
}

/**
 * Evaluator relasional deterministik aman tanpa eval() atau Function()
 */
export function evaluateCondition(leftValue: number, op: RelationalOperator, rightValue: number): boolean {
  switch (op) {
    case '==': return leftValue === rightValue;
    case '!=': return leftValue !== rightValue;
    case '>':  return leftValue > rightValue;
    case '<':  return leftValue < rightValue;
    case '>=': return leftValue >= rightValue;
    case '<=': return leftValue <= rightValue;
    default:   return false;
  }
}

/**
 * Validasi ketat masukan numerik murid di kelas (penanganan input batas & ekstrem)
 */
export function validateNumericInput(valueStr: string, min = -1000000, max = 1000000): InputValidationResult {
  const trimmed = valueStr.trim();
  if (trimmed === '') {
    return { isValid: false, value: 0, errorMessage: 'Nilai masukan tidak boleh kosong.' };
  }

  // Tolak teks non-numerik (hanya izinkan digit dan tanda minus di awal)
  if (!/^-?\d+$/.test(trimmed)) {
    return { isValid: false, value: 0, errorMessage: 'Harap masukkan bilangan bulat yang valid.' };
  }

  const parsed = parseInt(trimmed, 10);
  if (!Number.isFinite(parsed)) {
    return { isValid: false, value: 0, errorMessage: 'Nilai angka di luar batas yang dapat diproses.' };
  }

  if (parsed < min) {
    return { isValid: false, value: parsed, errorMessage: `Nilai minimal yang diizinkan adalah ${min}.` };
  }

  if (parsed > max) {
    return { isValid: false, value: parsed, errorMessage: `Nilai maksimal yang diizinkan adalah ${max}.` };
  }

  return { isValid: true, value: parsed };
}

/**
 * Mensimulasikan eksekusi kode baris per baris dan menghasilkan urutan langkah penelusuran (stepper)
 */
export function traceModuleExecution(moduleData: CaseModule, inputVal: number): TraceExecutionResult {
  // -----------------------------------------------------------------
  // Penanganan Khusus Modul Siklus 2: Percabangan Bertingkat (m04)
  // -----------------------------------------------------------------
  if (moduleData.id === 'm04') {
    const isCond1True = inputVal >= 50;
    const isCond2True = !isCond1True && inputVal >= 20;
    const isElse = !isCond1True && !isCond2True;
    const conditionResult = isCond1True || isCond2True;
    const executedBranch: string = isCond1True ? 'IF' : (isCond2True ? 'ELSE_IF' : 'ELSE');

    const steps: TraceStep[] = [];
    const skippedLineNumbers: number[] = [];
    let terminalOutput = '';
    let stepIndex = 1;

    for (const line of moduleData.lines) {
      const formattedPseudo = line.pseudoText.replace('[INPUT]', String(inputVal));
      const formattedC = line.cText.replace('[INPUT]', String(inputVal));

      if (line.lineNumber === 1) {
        steps.push({
          stepNumber: stepIndex++,
          lineNumber: line.lineNumber,
          lineTextPseudo: formattedPseudo,
          lineTextC: formattedC,
          description: `Inisialisasi variabel: kecepatan = ${inputVal} Mbps`,
          activeBranch: 'INIT'
        });
      } else if (line.lineNumber === 2) {
        const evalText = `${inputVal} >= 50 : bernilai ${isCond1True ? 'BENAR (TRUE)' : 'SALAH (FALSE)'}`;
        steps.push({
          stepNumber: stepIndex++,
          lineNumber: line.lineNumber,
          lineTextPseudo: formattedPseudo,
          lineTextC: formattedC,
          description: `Evaluasi kondisi tingkat 1: ${evalText}`,
          evaluatedExpression: `${inputVal} >= 50`,
          conditionResult: isCond1True,
          activeBranch: 'CONDITION'
        });
      } else if (line.lineNumber === 3) {
        if (isCond1True) {
          terminalOutput = 'Koneksi Cepat';
          steps.push({
            stepNumber: stepIndex++,
            lineNumber: line.lineNumber,
            lineTextPseudo: formattedPseudo,
            lineTextC: formattedC,
            description: `Kondisi 1 terpenuhi: menjalankan blok "Koneksi Cepat"`,
            activeBranch: 'BRANCH_IF',
            terminalOutput
          });
        } else {
          skippedLineNumbers.push(line.lineNumber);
        }
      } else if (line.lineNumber === 4) {
        if (isCond1True) {
          skippedLineNumbers.push(line.lineNumber);
        } else {
          const evalText = `${inputVal} >= 20 : bernilai ${isCond2True ? 'BENAR (TRUE)' : 'SALAH (FALSE)'}`;
          steps.push({
            stepNumber: stepIndex++,
            lineNumber: line.lineNumber,
            lineTextPseudo: formattedPseudo,
            lineTextC: formattedC,
            description: `Evaluasi kondisi tingkat 2: ${evalText}`,
            evaluatedExpression: `${inputVal} >= 20`,
            conditionResult: isCond2True,
            activeBranch: 'CONDITION'
          });
        }
      } else if (line.lineNumber === 5) {
        if (isCond2True) {
          terminalOutput = 'Koneksi Sedang';
          steps.push({
            stepNumber: stepIndex++,
            lineNumber: line.lineNumber,
            lineTextPseudo: formattedPseudo,
            lineTextC: formattedC,
            description: `Kondisi 2 terpenuhi: menjalankan blok "Koneksi Sedang"`,
            activeBranch: 'BRANCH_IF',
            terminalOutput
          });
        } else {
          skippedLineNumbers.push(line.lineNumber);
        }
      } else if (line.lineNumber === 6) {
        if (isElse) {
          steps.push({
            stepNumber: stepIndex++,
            lineNumber: line.lineNumber,
            lineTextPseudo: formattedPseudo,
            lineTextC: formattedC,
            description: `Semua kondisi bernilai FALSE: melompat ke blok penampung LAINNYA`,
            activeBranch: 'CONDITION'
          });
        } else {
          skippedLineNumbers.push(line.lineNumber);
        }
      } else if (line.lineNumber === 7) {
        if (isElse) {
          terminalOutput = 'Koneksi Lambat';
          steps.push({
            stepNumber: stepIndex++,
            lineNumber: line.lineNumber,
            lineTextPseudo: formattedPseudo,
            lineTextC: formattedC,
            description: `Menjalankan blok alternatif terakhir: "Koneksi Lambat"`,
            activeBranch: 'BRANCH_ELSE',
            terminalOutput
          });
        } else {
          skippedLineNumbers.push(line.lineNumber);
        }
      } else if (line.lineNumber === 8) {
        steps.push({
          stepNumber: stepIndex++,
          lineNumber: line.lineNumber,
          lineTextPseudo: formattedPseudo,
          lineTextC: formattedC,
          description: `Penelusuran percabangan bertingkat selesai. Keluaran: "${terminalOutput}".`,
          activeBranch: 'OUTPUT',
          terminalOutput
        });
      }
    }

    return {
      steps,
      conditionResult,
      executedBranch,
      terminalOutput,
      skippedLineNumbers
    };
  }

  // -----------------------------------------------------------------
  // Penanganan Khusus Modul Siklus 2: Multi-Kategori SWITCH - CASE (m05)
  // -----------------------------------------------------------------
  if (moduleData.id === 'm05') {
    const isCase1 = inputVal === 1;
    const isCase2 = inputVal === 2;
    const isCase3 = inputVal === 3;
    const isDefault = !isCase1 && !isCase2 && !isCase3;
    const conditionResult = !isDefault;
    const executedBranch: string = isCase1 ? 'CASE_1' : (isCase2 ? 'CASE_2' : (isCase3 ? 'CASE_3' : 'DEFAULT'));

    const steps: TraceStep[] = [];
    const skippedLineNumbers: number[] = [];
    let terminalOutput = '';
    let stepIndex = 1;

    for (const line of moduleData.lines) {
      const formattedPseudo = line.pseudoText.replace('[INPUT]', String(inputVal));
      const formattedC = line.cText.replace('[INPUT]', String(inputVal));

      if (line.lineNumber === 1) {
        steps.push({
          stepNumber: stepIndex++,
          lineNumber: line.lineNumber,
          lineTextPseudo: formattedPseudo,
          lineTextC: formattedC,
          description: `Inisialisasi nomor pilihan: pilihan = ${inputVal}`,
          activeBranch: 'INIT'
        });
      } else if (line.lineNumber === 2) {
        steps.push({
          stepNumber: stepIndex++,
          lineNumber: line.lineNumber,
          lineTextPseudo: formattedPseudo,
          lineTextC: formattedC,
          description: `Mengevaluasi ekspresi pemilih: switch(${inputVal})`,
          evaluatedExpression: `switch(${inputVal})`,
          conditionResult,
          activeBranch: 'CONDITION'
        });
      } else if (line.lineNumber === 3) {
        if (isCase1) {
          terminalOutput = 'Menu Kopi Hangat';
          steps.push({
            stepNumber: stepIndex++,
            lineNumber: line.lineNumber,
            lineTextPseudo: formattedPseudo,
            lineTextC: formattedC,
            description: `Cocok dengan KASUS 1: menjalankan "Menu Kopi Hangat"`,
            activeBranch: 'BRANCH_IF',
            terminalOutput
          });
        } else {
          skippedLineNumbers.push(line.lineNumber);
        }
      } else if (line.lineNumber === 4) {
        if (isCase2) {
          terminalOutput = 'Menu Teh Manis';
          steps.push({
            stepNumber: stepIndex++,
            lineNumber: line.lineNumber,
            lineTextPseudo: formattedPseudo,
            lineTextC: formattedC,
            description: `Cocok dengan KASUS 2: menjalankan "Menu Teh Manis"`,
            activeBranch: 'BRANCH_IF',
            terminalOutput
          });
        } else {
          skippedLineNumbers.push(line.lineNumber);
        }
      } else if (line.lineNumber === 5) {
        if (isCase3) {
          terminalOutput = 'Menu Susu Segar';
          steps.push({
            stepNumber: stepIndex++,
            lineNumber: line.lineNumber,
            lineTextPseudo: formattedPseudo,
            lineTextC: formattedC,
            description: `Cocok dengan KASUS 3: menjalankan "Menu Susu Segar"`,
            activeBranch: 'BRANCH_IF',
            terminalOutput
          });
        } else {
          skippedLineNumbers.push(line.lineNumber);
        }
      } else if (line.lineNumber === 6) {
        if (isDefault) {
          terminalOutput = 'Pilihan Menu Tidak Tersedia';
          steps.push({
            stepNumber: stepIndex++,
            lineNumber: line.lineNumber,
            lineTextPseudo: formattedPseudo,
            lineTextC: formattedC,
            description: `Nomor ${inputVal} tidak ada di menu: melompat ke blok STANDAR (default)`,
            activeBranch: 'BRANCH_ELSE',
            terminalOutput
          });
        } else {
          skippedLineNumbers.push(line.lineNumber);
        }
      } else if (line.lineNumber === 7) {
        steps.push({
          stepNumber: stepIndex++,
          lineNumber: line.lineNumber,
          lineTextPseudo: formattedPseudo,
          lineTextC: formattedC,
          description: `Eksekusi switch-case selesai. Keluaran: "${terminalOutput}".`,
          activeBranch: 'OUTPUT',
          terminalOutput
        });
      }
    }

    return {
      steps,
      conditionResult,
      executedBranch,
      terminalOutput,
      skippedLineNumbers
    };
  }

  // -----------------------------------------------------------------
  // Penanganan Standar Modul Siklus 1 (m01, m02, m03): Percabangan Biner
  // -----------------------------------------------------------------
  const { op, boundaryValue } = moduleData.targetComparison;
  const conditionResult = evaluateCondition(inputVal, op, boundaryValue);
  const executedBranch: string = moduleData.id === 'm02'
    ? (conditionResult ? 'IF' : 'NORMAL')
    : (conditionResult ? 'IF' : 'ELSE');

  const steps: TraceStep[] = [];
  const skippedLineNumbers: number[] = [];
  let terminalOutput = '';
  let stepIndex = 1;

  for (const line of moduleData.lines) {
    const formattedPseudo = line.pseudoText.replace('[INPUT]', String(inputVal));
    const formattedC = line.cText.replace('[INPUT]', String(inputVal));

    if (line.branchType === 'INIT') {
      steps.push({
        stepNumber: stepIndex++,
        lineNumber: line.lineNumber,
        lineTextPseudo: formattedPseudo,
        lineTextC: formattedC,
        description: `Inisialisasi variabel: ${moduleData.inputVariable} = ${inputVal}`,
        activeBranch: 'INIT'
      });
    } else if (line.branchType === 'CONDITION') {
      const evalText = `${inputVal} ${op} ${boundaryValue} : bernilai ${conditionResult ? 'BENAR (TRUE)' : 'SALAH (FALSE)'}`;
      steps.push({
        stepNumber: stepIndex++,
        lineNumber: line.lineNumber,
        lineTextPseudo: formattedPseudo,
        lineTextC: formattedC,
        description: `Evaluasi kondisi: ${evalText}`,
        evaluatedExpression: `${inputVal} ${op} ${boundaryValue}`,
        conditionResult,
        activeBranch: 'CONDITION'
      });
    } else if (line.branchType === 'BRANCH_IF') {
      if (conditionResult) {
        // Eksekusi cabang IF
        const outputMatch = line.pseudoText.match(/TAMPILKAN\("([^"]+)"\)/);
        const outputText = outputMatch?.[1] || '';
        terminalOutput = outputText;

        steps.push({
          stepNumber: stepIndex++,
          lineNumber: line.lineNumber,
          lineTextPseudo: formattedPseudo,
          lineTextC: formattedC,
          description: `Kondisi bernilai BENAR (TRUE): menjalankan instruksi cabang IF: "${outputText}"`,
          activeBranch: 'BRANCH_IF',
          terminalOutput: outputText
        });
      } else {
        // Cabang IF dilompati
        skippedLineNumbers.push(line.lineNumber);
      }
    } else if (line.branchType === 'BRANCH_ELSE') {
      if (!conditionResult) {
        // Eksekusi cabang ELSE
        const outputMatch = line.pseudoText.match(/TAMPILKAN\("([^"]+)"\)/);
        const outputText = outputMatch?.[1] || '';
        if (outputText) {
          terminalOutput = outputText;
        }

        const isElseKeyword = !line.pseudoText.includes('TAMPILKAN');
        const description = isElseKeyword
          ? 'Kondisi bernilai SALAH (FALSE): alur eksekusi melompat ke blok alternatif LAINNYA'
          : `Menjalankan instruksi cabang LAINNYA: "${outputText}"`;

        steps.push({
          stepNumber: stepIndex++,
          lineNumber: line.lineNumber,
          lineTextPseudo: formattedPseudo,
          lineTextC: formattedC,
          description,
          activeBranch: 'BRANCH_ELSE',
          terminalOutput
        });
      } else {
        // Cabang ELSE dilompati
        skippedLineNumbers.push(line.lineNumber);
      }
    } else if (line.branchType === 'OUTPUT') {
      const outputMatch = line.pseudoText.match(/TAMPILKAN\("([^"]+)"\)/);
      const outputText = outputMatch?.[1] || '';
      if (outputText) {
        terminalOutput = outputText;
      }
      const desc = outputText
        ? `Menjalankan instruksi: "${outputText}"`
        : `Penelusuran percabangan selesai. Jalur kondisi berhasil dibuktikan dan tercatat pada sistem.`;

      steps.push({
        stepNumber: stepIndex++,
        lineNumber: line.lineNumber,
        lineTextPseudo: formattedPseudo,
        lineTextC: formattedC,
        description: desc,
        activeBranch: 'OUTPUT',
        terminalOutput
      });
    }
  }

  return {
    steps,
    conditionResult,
    executedBranch,
    terminalOutput,
    skippedLineNumbers
  };
}

/**
 * Membandingkan tebakan metakognisi murid (Pause & Predict) dengan hasil aktual program
 */
export function evaluateStudentPrediction(
  predictedCondition: boolean,
  predictedBranch: 'IF' | 'ELSE',
  actualResult: TraceExecutionResult
): { isAccurate: boolean; feedbackMessage: string } {
  const isConditionCorrect = predictedCondition === actualResult.conditionResult;
  const isBranchCorrect = predictedBranch === actualResult.executedBranch;

  if (isConditionCorrect && isBranchCorrect) {
    return {
      isAccurate: true,
      feedbackMessage: 'Prediksimu tepat! Analisis nilai variabel dan alur cabangmu terbukti benar.'
    };
  }

  if (!isConditionCorrect && !isBranchCorrect) {
    return {
      isAccurate: false,
      feedbackMessage: `Prediksi nilai kondisi dan cabang meleset. Evaluasi menghasilkan ${actualResult.conditionResult ? 'BENAR' : 'SALAH'}, sehingga cabang ${actualResult.executedBranch} yang dijalankan.`
    };
  }

  return {
    isAccurate: false,
    feedbackMessage: `Analisis sebagian tepat, namun perhatikan arah lompatan cabang: eksekusi berpindah ke cabang ${actualResult.executedBranch}.`
  };
}
