import { StudentRecord, ClassStats, FormStats, OverallSummary, ColumnMapping } from "../types";

/**
 * Normalizes values to key categories
 */
export function normalizeJantina(val: any): "L" | "P" {
  const str = String(val || "").trim().toUpperCase();
  if (["L", "LELAKI", "M", "MALE", "BOY"].includes(str)) return "L";
  if (["P", "PEREMPUAN", "F", "FEMALE", "GIRL", "W", "WANITA"].includes(str)) return "P";
  // Default fallback
  return "L";
}

export function normalizeKaum(val: any): "Melayu" | "Cina" | "India" | "Lain-lain" {
  const str = String(val || "").trim().toUpperCase();
  if (str.includes("MELAYU") || str.includes("MALAY")) return "Melayu";
  if (str.includes("CINA") || str.includes("CHINESE")) return "Cina";
  if (str.includes("INDIA") || str.includes("INDIAN")) return "India";
  return "Lain-lain";
}

export function normalizeKategoriEkonomi(val: any): "B40" | "M40" | "T20" | "Tiada Maklumat" {
  const str = String(val || "").trim().toUpperCase();
  if (str.includes("B40")) return "B40";
  if (str.includes("M40")) return "M40";
  if (str.includes("T20")) return "T20";
  if (str.includes("PPRT") || str.includes("MISKIN") || str.includes("SARA DIRI") || str.includes("RENDAH") || str.includes("BANTUAN")) return "B40";
  if (str.includes("SEDERHANA") || str.includes("MENENGAH")) return "M40";
  if (str.includes("TINGGI") || str.includes("KAYA")) return "T20";
  if (!str || str === "TIADA" || str === "NULL" || str === "-") return "Tiada Maklumat";
  return str as any;
}

export function normalizeAgama(val: any, kaum?: string): "Islam" | "Bukan Islam" {
  const str = String(val || "").trim().toUpperCase();
  if (str.includes("ISLAM") || str.includes("MUSLIM")) return "Islam";
  if (str.includes("BUKAN ISLAM") || str.includes("NON-ISLAM") || str.includes("NON ISLAM")) return "Bukan Islam";
  
  // Culturally typical fallback if missing
  if (kaum === "Melayu") return "Islam";
  return "Bukan Islam";
}

/**
 * Auto-detect columns from a single spreadsheet row
 */
export function autoDetectColumns(sampleRow: any): ColumnMapping {
  const mapping: ColumnMapping = {
    tingkatan: "",
    kelas: "",
    guruKelas: "",
    nama: "",
    jantina: "",
    kaum: "",
    agama: "",
    warganegara: "",
    kategoriEkonomi: ""
  };

  const keys = Object.keys(sampleRow);
  
  for (const key of keys) {
    const k = key.trim().toLowerCase();
    
    if (k.includes("tingkatan") || k.includes("form") || k.includes("gred") || k.includes("ting")) {
      if (!mapping.tingkatan) mapping.tingkatan = key;
    } else if (k.includes("kelas") || k.includes("class")) {
      if (!mapping.kelas) mapping.kelas = key;
    } else if (k.includes("guru") || k.includes("tutor") || k.includes("teacher")) {
      if (!mapping.guruKelas) mapping.guruKelas = key;
    } else if (k.includes("jantina") || k.includes("gender") || k.includes("sex") || k === "j") {
      if (!mapping.jantina) mapping.jantina = key;
    } else if (k.includes("bangsa") || k.includes("kaum") || k.includes("race") || k.includes("eth")) {
      if (!mapping.kaum) mapping.kaum = key;
    } else if (k.includes("agama") || k.includes("religion") || k === "a") {
      if (!mapping.agama) mapping.agama = key;
    } else if (k.includes("warganegara") || k.includes("citizen") || k.includes("negara")) {
      if (!mapping.warganegara) mapping.warganegara = key;
    } else if (k.includes("nama") || k.includes("name") || k.includes("murid") || k.includes("pelajar")) {
      if (!mapping.nama) mapping.nama = key;
    } else if (k.includes("ekonomi") || k.includes("income") || k.includes("pendapatan") || k.includes("gaji") || k.includes("sosio") || k.includes("b40") || k.includes("m40") || k.includes("t20")) {
      if (!mapping.kategoriEkonomi) mapping.kategoriEkonomi = key;
    }
  }

  // Fallbacks if not auto-detected
  if (!mapping.tingkatan) mapping.tingkatan = keys.find(k => k.toLowerCase().includes("ting")) || keys[0] || "";
  if (!mapping.kelas) mapping.kelas = keys.find(k => k.toLowerCase().includes("kel")) || keys[1] || "";
  if (!mapping.guruKelas) mapping.guruKelas = keys.find(k => k.toLowerCase().includes("gur")) || "";
  if (!mapping.jantina) mapping.jantina = keys.find(k => k.toLowerCase().includes("jan")) || keys[2] || "";
  if (!mapping.kaum) mapping.kaum = keys.find(k => k.toLowerCase().includes("kau") || k.toLowerCase().includes("ban")) || keys[3] || "";
  if (!mapping.agama) mapping.agama = keys.find(k => k.toLowerCase().includes("aga")) || keys[4] || "";
  if (!mapping.nama) mapping.nama = keys.find(k => k.toLowerCase().includes("nam")) || keys[5] || "";
  if (!mapping.kategoriEkonomi) mapping.kategoriEkonomi = keys.find(k => k.toLowerCase().includes("ekonomi") || k.toLowerCase().includes("pendapatan") || k.toLowerCase().includes("income") || k.toLowerCase().includes("gaji") || k.toLowerCase().includes("b40") || k.toLowerCase().includes("t20")) || "";

  return mapping;
}

/**
 * Transforms generic sheet JSON rows into our formal StudentRecord model
 */
export function parseRowsToStudents(rows: any[], mapping: ColumnMapping): StudentRecord[] {
  let bil = 1;
  return rows.map((row, idx) => {
    const tingRaw = mapping.tingkatan ? String(row[mapping.tingkatan] || "").trim() : "";
    const kelasRaw = mapping.kelas ? String(row[mapping.kelas] || "").trim() : "";
    const guruRaw = mapping.guruKelas ? String(row[mapping.guruKelas] || "").trim() : "-";
    const namaRaw = mapping.nama ? String(row[mapping.nama] || "").trim() : `Murid ${idx + 1}`;
    const jantinaRaw = mapping.jantina ? String(row[mapping.jantina] || "").trim() : "";
    const kaumRaw = mapping.kaum ? String(row[mapping.kaum] || "").trim() : "";
    const agamaRaw = mapping.agama ? String(row[mapping.agama] || "").trim() : "";
    const wargaRaw = mapping.warganegara ? String(row[mapping.warganegara] || "").trim() : "Warganegara";
    const ekonomiRaw = mapping.kategoriEkonomi ? String(row[mapping.kategoriEkonomi] || "").trim() : "";

    const kaum = normalizeKaum(kaumRaw);
    const jantina = normalizeJantina(jantinaRaw);
    const agama = normalizeAgama(agamaRaw, kaum);
    const kategoriEkonomi = ekonomiRaw ? normalizeKategoriEkonomi(ekonomiRaw) : "Tiada Maklumat";

    return {
      id: `STU_${idx}_${Date.now()}`,
      bil: bil++,
      tingkatan: tingRaw || "TIADA TINGKATAN",
      kelas: kelasRaw || "TIADA KELAS",
      guruKelas: guruRaw || "-",
      nama: namaRaw.toUpperCase(),
      jantina,
      kaum,
      agama,
      warganegara: wargaRaw,
      kategoriEkonomi
    };
  }).filter(s => s.tingkatan !== "TIADA TINGKATAN" && s.kelas !== "TIADA KELAS");
}

/**
 * Formats Form names to standard priorities:
 * (T. SATU, T. DUA, etc., preceding others)
 */
export function getFormWeight(formName: string): number {
  const normalized = formName.trim().toUpperCase();
  if (normalized.includes("SATU") || normalized === "1") return 1;
  if (normalized.includes("DUA") || normalized === "2") return 2;
  if (normalized.includes("TIGA") || normalized === "3") return 3;
  if (normalized.includes("EMPAT") || normalized === "4") return 4;
  if (normalized.includes("LIMA") || normalized === "5") return 5;
  if (normalized.includes("ENAM SEM 1") || normalized.includes("6 SEM 1") || normalized.includes("PRA U 1")) return 6;
  if (normalized.includes("ENAM SEM 2") || normalized.includes("6 SEM 2") || normalized.includes("PRA U 2")) return 7;
  if (normalized.includes("ENAM") || normalized === "6") return 8;
  return 99; // custom secondary items
}

/**
 * Compiles a list of flat students into SMK Rantau-styled hierarchical stats
 */
export function aggregateToClassStats(students: StudentRecord[]): FormStats[] {
  const formGroups: { [form: string]: { [kelas: string]: ClassStats } } = {};

  students.forEach(s => {
    const ting = s.tingkatan;
    const kel = s.kelas;

    if (!formGroups[ting]) {
      formGroups[ting] = {};
    }

    if (!formGroups[ting][kel]) {
      formGroups[ting][kel] = {
        kelas: kel,
        guruKelas: s.guruKelas || "-",
        melayuL: 0,
        melayuP: 0,
        cinaL: 0,
        cinaP: 0,
        indiaL: 0,
        indiaP: 0,
        lainL: 0,
        lainP: 0,
        islam: 0,
        bIslam: 0,
        jantinaL: 0,
        jantinaP: 0,
        jumlah: 0
      };
    }

    const classStat = formGroups[ting][kel];
    
    // Update Guru if a student has one and the class has "-"
    if (s.guruKelas && s.guruKelas !== "-" && classStat.guruKelas === "-") {
      classStat.guruKelas = s.guruKelas;
    }

    // Gender
    if (s.jantina === "L") {
      classStat.jantinaL++;
      // Kaum + Gender
      if (s.kaum === "Melayu") classStat.melayuL++;
      else if (s.kaum === "Cina") classStat.cinaL++;
      else if (s.kaum === "India") classStat.indiaL++;
      else classStat.lainL++;
    } else {
      classStat.jantinaP++;
      // Kaum + Gender
      if (s.kaum === "Melayu") classStat.melayuP++;
      else if (s.kaum === "Cina") classStat.cinaP++;
      else if (s.kaum === "India") classStat.indiaP++;
      else classStat.lainP++;
    }

    // Religion
    if (s.agama === "Islam") {
      classStat.islam++;
    } else {
      classStat.bIslam++;
    }

    // Sum
    classStat.jumlah++;
  });

  // Now bundle and compute subtotals
  const formStatsList: FormStats[] = Object.keys(formGroups).map(ting => {
    const classesMap = formGroups[ting];
    const classes = Object.values(classesMap).sort((a, b) => a.kelas.localeCompare(b.kelas));
    
    const subtotals = {
      melayuL: 0,
      melayuP: 0,
      cinaL: 0,
      cinaP: 0,
      indiaL: 0,
      indiaP: 0,
      lainL: 0,
      lainP: 0,
      islam: 0,
      bIslam: 0,
      jantinaL: 0,
      jantinaP: 0,
      jumlah: 0
    };

    classes.forEach(c => {
      subtotals.melayuL += c.melayuL;
      subtotals.melayuP += c.melayuP;
      subtotals.cinaL += c.cinaL;
      subtotals.cinaP += c.cinaP;
      subtotals.indiaL += c.indiaL;
      subtotals.indiaP += c.indiaP;
      subtotals.lainL += c.lainL;
      subtotals.lainP += c.lainP;
      subtotals.islam += c.islam;
      subtotals.bIslam += c.bIslam;
      subtotals.jantinaL += c.jantinaL;
      subtotals.jantinaP += c.jantinaP;
      subtotals.jumlah += c.jumlah;
    });

    return {
      tingkatan: ting,
      classes,
      subtotals
    };
  });

  // Sort Forms by canonical weighting
  return formStatsList.sort((a, b) => getFormWeight(a.tingkatan) - getFormWeight(b.tingkatan));
}

/**
 * Calculates overall high-level summary and percentages for sections 1-5
 */
export function calculateOverallSummary(formStats: FormStats[], students: StudentRecord[] = []): OverallSummary {
  let totalOverall = 0;
  let totalBoys = 0;
  let totalGirls = 0;
  let classCount = 0;
  
  const raceTotals = {
    "Melayu": { L: 0, P: 0, Total: 0 },
    "Cina": { L: 0, P: 0, Total: 0 },
    "India": { L: 0, P: 0, Total: 0 },
    "Lain-lain": { L: 0, P: 0, Total: 0 }
  };

  const religionTotals = {
    "Islam": 0,
    "Bukan Islam": 0
  };

  formStats.forEach(form => {
    classCount += form.classes.length;
    totalOverall += form.subtotals.jumlah;
    totalBoys += form.subtotals.jantinaL;
    totalGirls += form.subtotals.jantinaP;

    // Race
    raceTotals.Melayu.L += form.subtotals.melayuL;
    raceTotals.Melayu.P += form.subtotals.melayuP;
    raceTotals.Cina.L += form.subtotals.cinaL;
    raceTotals.Cina.P += form.subtotals.cinaP;
    raceTotals.India.L += form.subtotals.indiaL;
    raceTotals.India.P += form.subtotals.indiaP;
    raceTotals["Lain-lain"].L += form.subtotals.lainL;
    raceTotals["Lain-lain"].P += form.subtotals.lainP;

    // Religion
    religionTotals.Islam += form.subtotals.islam;
    religionTotals["Bukan Islam"] += form.subtotals.bIslam;
  });

  // Calculate percentages
  const raceStats: any = {};
  Object.entries(raceTotals).forEach(([k, v]) => {
    const tot = v.L + v.P;
    raceStats[k] = {
      L: v.L,
      P: v.P,
      Total: tot,
      Pct: totalOverall > 0 ? Number(((tot / totalOverall) * 100).toFixed(2)) : 0
    };
  });

  const religionStats: any = {};
  Object.entries(religionTotals).forEach(([k, tot]) => {
    religionStats[k] = {
      Total: tot,
      Pct: totalOverall > 0 ? Number(((tot / totalOverall) * 100).toFixed(2)) : 0
    };
  });

  // Economy stats
  const economyTotals: { [key: string]: number } = {};
  if (students && students.length > 0) {
    students.forEach(s => {
      const key = s.kategoriEkonomi || "Tiada Maklumat";
      economyTotals[key] = (economyTotals[key] || 0) + 1;
    });
  } else {
    economyTotals["Tiada Maklumat"] = totalOverall;
  }

  const economyStats: { [key: string]: { Total: number; Pct: number } } = {};
  Object.entries(economyTotals).forEach(([k, tot]) => {
    economyStats[k] = {
      Total: tot,
      Pct: totalOverall > 0 ? Number(((tot / totalOverall) * 100).toFixed(2)) : 0
    };
  });

  const boyPct = totalOverall > 0 ? Number(((totalBoys / totalOverall) * 100).toFixed(2)) : 0;
  const girlPct = totalOverall > 0 ? Number(((totalGirls / totalOverall) * 100).toFixed(2)) : 0;
  
  // Calculate boys to girls ratio: e.g. 1.01 : 1
  let ratio = "N/A";
  if (totalGirls > 0) {
    ratio = `${(totalBoys / totalGirls).toFixed(2)} : 1.00`;
  } else if (totalBoys > 0) {
    ratio = "1.00 : 0.00";
  }

  const formDetails = formStats.map(form => {
    const classLoads = form.classes.map(c => ({ name: c.kelas, count: c.jumlah }));
    // Safety check if no classes
    const maxClass = classLoads.length > 0 
      ? classLoads.reduce((max, c) => c.count > max.count ? c : max, classLoads[0])
      : { name: "Tiada Laporan", count: 0 };
    
    const minClass = classLoads.length > 0
      ? classLoads.reduce((min, c) => c.count < min.count ? c : min, classLoads[0])
      : { name: "Tiada Laporan", count: 0 };

    return {
      name: form.tingkatan,
      classCount: form.classes.length,
      studentCount: form.subtotals.jumlah,
      avgPerClass: form.classes.length > 0 ? Number((form.subtotals.jumlah / form.classes.length).toFixed(2)) : 0,
      maxClass,
      minClass
    };
  });

  return {
    totalOverall,
    totalBoys,
    totalGirls,
    classCount,
    formCount: formStats.length,
    raceStats,
    religionStats,
    economyStats,
    genderStats: {
      boyCount: totalBoys,
      girlCount: totalGirls,
      boyPct,
      girlPct,
      ratio
    },
    formDetails
  };
}
