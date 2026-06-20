export interface StudentRecord {
  id: string;
  bil?: number;
  tingkatan: string;
  kelas: string;
  guruKelas: string;
  nama: string;
  jantina: "L" | "P";
  kaum: "Melayu" | "Cina" | "India" | "Lain-lain" | string;
  agama: "Islam" | "Bukan Islam" | string;
  warganegara?: "Warganegara" | "Bukan Warganegara" | string;
  kategoriEkonomi?: string; // e.g. B40, M40, T20
}

export interface ClassStats {
  kelas: string;
  guruKelas: string;
  melayuL: number;
  melayuP: number;
  cinaL: number;
  cinaP: number;
  indiaL: number;
  indiaP: number;
  lainL: number;
  lainP: number;
  islam: number;
  bIslam: number;
  jantinaL: number;
  jantinaP: number;
  jumlah: number;
}

export interface FormStats {
  tingkatan: string;
  classes: ClassStats[];
  subtotals: {
    melayuL: number;
    melayuP: number;
    cinaL: number;
    cinaP: number;
    indiaL: number;
    indiaP: number;
    lainL: number;
    lainP: number;
    islam: number;
    bIslam: number;
    jantinaL: number;
    jantinaP: number;
    jumlah: number;
  };
}

export interface OverallSummary {
  totalOverall: number;
  totalBoys: number;
  totalGirls: number;
  classCount: number;
  formCount: number;
  
  // Demographics
  raceStats: {
    [key: string]: { L: number; P: number; Total: number; Pct: number };
  };
  religionStats: {
    [key: string]: { Total: number; Pct: number };
  };
  economyStats?: {
    [key: string]: { Total: number; Pct: number };
  };
  genderStats: {
    boyCount: number;
    girlCount: number;
    boyPct: number;
    girlPct: number;
    ratio: string;
  };
  
  formDetails: {
    name: string;
    classCount: number;
    studentCount: number;
    avgPerClass: number;
    maxClass: { name: string; count: number };
    minClass: { name: string; count: number };
  }[];
}

export type ColumnMapping = {
  tingkatan: string;
  kelas: string;
  guruKelas: string;
  nama?: string;
  jantina: string;
  kaum: string;
  agama: string;
  warganegara?: string;
  kategoriEkonomi?: string;
};
