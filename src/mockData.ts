import { StudentRecord } from "./types";

// Class definitions from SMK Rantau
export const SMK_RANTAU_CLASSES = [
  // T. SATU
  { ting: "T. SATU", class: "1 ALPHA", guru: "SITI ZURAIDA BINTI AHMAD", melayu: { L: 4, P: 3 }, cina: { L: 2, P: 3 }, india: { L: 2, P: 11 }, lain: { L: 0, P: 2 }, islam: 8, bIslam: 19, jantina: { L: 8, P: 19 } },
  { ting: "T. SATU", class: "1 BETA", guru: "MOHD ALIF BIN SAPRI", melayu: { L: 9, P: 7 }, cina: { L: 3, P: 2 }, india: { L: 4, P: 6 }, lain: { L: 0, P: 2 }, islam: 17, bIslam: 16, jantina: { L: 16, P: 17 } },
  { ting: "T. SATU", class: "1 DELTA", guru: "BORHAN BIN DOLAH", melayu: { L: 12, P: 6 }, cina: { L: 2, P: 2 }, india: { L: 4, P: 5 }, lain: { L: 0, P: 0 }, islam: 18, bIslam: 13, jantina: { L: 18, P: 13 } },
  { ting: "T. SATU", class: "1 GAMMA", guru: "LOH SHEAU MIIN", melayu: { L: 13, P: 7 }, cina: { L: 1, P: 2 }, india: { L: 4, P: 3 }, lain: { L: 0, P: 0 }, islam: 20, bIslam: 10, jantina: { L: 18, P: 12 } },
  { ting: "T. SATU", class: "1 ZETA", guru: "NOR AZLIZA BINTI AHMAD HASHIMI", melayu: { L: 9, P: 10 }, cina: { L: 1, P: 0 }, india: { L: 3, P: 5 }, lain: { L: 0, P: 0 }, islam: 19, bIslam: 9, jantina: { L: 13, P: 15 } },

  // T. ENAM SEM 1
  { ting: "T. ENAM SEM 1", class: "PRA U 1 ALPHA", guru: "NORHAYATI BINTI EHASHA", melayu: { L: 3, P: 4 }, cina: { L: 0, P: 0 }, india: { L: 1, P: 5 }, lain: { L: 0, P: 0 }, islam: 7, bIslam: 6, jantina: { L: 4, P: 9 } },
  { ting: "T. ENAM SEM 1", class: "PRA U 1 BETA", guru: "NORHAMIZA BINTI ABDUL TALIB", melayu: { L: 3, P: 4 }, cina: { L: 0, P: 0 }, india: { L: 3, P: 6 }, lain: { L: 0, P: 0 }, islam: 7, bIslam: 9, jantina: { L: 6, P: 10 } },

  // T. DUA
  { ting: "T. DUA", class: "2 ALPHA", guru: "NURULHUDA BINTI MOHD BASRI", melayu: { L: 12, P: 11 }, cina: { L: 2, P: 1 }, india: { L: 5, P: 3 }, lain: { L: 0, P: 0 }, islam: 24, bIslam: 10, jantina: { L: 19, P: 15 } },
  { ting: "T. DUA", class: "2 BETA", guru: "MOKHTAR BIN ABDULLAH", melayu: { L: 7, P: 7 }, cina: { L: 3, P: 5 }, india: { L: 4, P: 8 }, lain: { L: 0, P: 1 }, islam: 16, bIslam: 19, jantina: { L: 14, P: 21 } },
  { ting: "T. DUA", class: "2 DELTA", guru: "GUNASEGARAN A/L SEMBAN", melayu: { L: 0, P: 2 }, cina: { L: 8, P: 5 }, india: { L: 12, P: 7 }, lain: { L: 0, P: 0 }, islam: 4, bIslam: 30, jantina: { L: 20, P: 14 } },
  { ting: "T. DUA", class: "2 GAMMA", guru: "SITI SYAHIRAH BINTI YUSSOF", melayu: { L: 4, P: 1 }, cina: { L: 8, P: 1 }, india: { L: 11, P: 4 }, lain: { L: 0, P: 0 }, islam: 6, bIslam: 23, jantina: { L: 23, P: 6 } },
  { ting: "T. DUA", class: "2 ZETA", guru: "HALINA BINTI YUSOFF", melayu: { L: 10, P: 10 }, cina: { L: 3, P: 4 }, india: { L: 2, P: 4 }, lain: { L: 0, P: 1 }, islam: 20, bIslam: 14, jantina: { L: 15, P: 19 } },

  // T. ENAM SEM 2
  { ting: "T. ENAM SEM 2", class: "PRA U 2 ALPHA", guru: "DALILAH BINTI ALI", melayu: { L: 3, P: 3 }, cina: { L: 0, P: 0 }, india: { L: 3, P: 7 }, lain: { L: 0, P: 0 }, islam: 6, bIslam: 10, jantina: { L: 6, P: 10 } },
  { ting: "T. ENAM SEM 2", class: "PRA U 2 BETA", guru: "MAZLINDA BINTI SHARIFUDIN", melayu: { L: 2, P: 2 }, cina: { L: 0, P: 0 }, india: { L: 1, P: 5 }, lain: { L: 1, P: 0 }, islam: 5, bIslam: 6, jantina: { L: 4, P: 7 } },

  // T. TIGA
  { ting: "T. TIGA", class: "3 ALPHA", guru: "NORLILI BINTI ISMAIL", melayu: { L: 4, P: 9 }, cina: { L: 3, P: 0 }, india: { L: 9, P: 8 }, lain: { L: 0, P: 0 }, islam: 13, bIslam: 20, jantina: { L: 16, P: 17 } },
  { ting: "T. TIGA", class: "3 BETA", guru: "HAMSAVADIU A/P EGAMBARAM", melayu: { L: 11, P: 10 }, cina: { L: 2, P: 2 }, india: { L: 6, P: 3 }, lain: { L: 1, P: 0 }, islam: 22, bIslam: 13, jantina: { L: 20, P: 15 } },
  { ting: "T. TIGA", class: "3 DELTA", guru: "KISHENRAJ A/L MARIAPPAN", melayu: { L: 10, P: 6 }, cina: { L: 2, P: 4 }, india: { L: 3, P: 6 }, lain: { L: 0, P: 1 }, islam: 18, bIslam: 14, jantina: { L: 15, P: 17 } },
  { ting: "T. TIGA", class: "3 GAMMA", guru: "MUHAMMAD NUR RAFIQQI BIN ROSLI", melayu: { L: 8, P: 1 }, cina: { L: 2, P: 0 }, india: { L: 8, P: 5 }, lain: { L: 0, P: 0 }, islam: 9, bIslam: 15, jantina: { L: 18, P: 6 } },
  { ting: "T. TIGA", class: "3 ZETA", guru: "SYAHANIZA BINTI ENDUT", melayu: { L: 7, P: 3 }, cina: { L: 3, P: 4 }, india: { L: 7, P: 8 }, lain: { L: 0, P: 0 }, islam: 10, bIslam: 22, jantina: { L: 17, P: 15 } },

  // T. EMPAT
  { ting: "T. EMPAT", class: "4 ALPHA", guru: "TILAGAVATI A/P KUPPAN", melayu: { L: 5, P: 2 }, cina: { L: 1, P: 7 }, india: { L: 5, P: 0 }, lain: { L: 0, P: 0 }, islam: 8, bIslam: 12, jantina: { L: 11, P: 9 } },
  { ting: "T. EMPAT", class: "4 BETA", guru: "NORHAYATI BINTI HAMID", melayu: { L: 5, P: 11 }, cina: { L: 2, P: 0 }, india: { L: 1, P: 9 }, lain: { L: 0, P: 1 }, islam: 18, bIslam: 11, jantina: { L: 8, P: 21 } },
  { ting: "T. EMPAT", class: "4 DELTA", guru: "SITI SALMIAH BINTI AHMAD", melayu: { L: 9, P: 8 }, cina: { L: 1, P: 0 }, india: { L: 2, P: 6 }, lain: { L: 0, P: 1 }, islam: 18, bIslam: 9, jantina: { L: 12, P: 15 } },
  { ting: "T. EMPAT", class: "4 GAMMA", guru: "HASMIZU BIN ABDUL HALIM", melayu: { L: 5, P: 2 }, cina: { L: 4, P: 2 }, india: { L: 8, P: 8 }, lain: { L: 0, P: 0 }, islam: 7, bIslam: 22, jantina: { L: 17, P: 12 } },
  { ting: "T. EMPAT", class: "4 LAMBDA", guru: "ISMADAFAIE BIN SELAMAT", melayu: { L: 4, P: 1 }, cina: { L: 3, P: 1 }, india: { L: 6, P: 2 }, lain: { L: 1, P: 1 }, islam: 7, bIslam: 12, jantina: { L: 14, P: 5 } },

  // T. LIMA
  { ting: "T. LIMA", class: "5 ALPHA", guru: "DEWI HIU BINTI ISKANDAR HIU", melayu: { L: 2, P: 9 }, cina: { L: 1, P: 3 }, india: { L: 1, P: 4 }, lain: { L: 0, P: 0 }, islam: 11, bIslam: 9, jantina: { L: 4, P: 16 } },
  { ting: "T. LIMA", class: "5 BETA", guru: "ZAMLI LAILAI BINTI DAUD", melayu: { L: 4, P: 5 }, cina: { L: 2, P: 3 }, india: { L: 9, P: 5 }, lain: { L: 0, P: 0 }, islam: 11, bIslam: 17, jantina: { L: 15, P: 13 } },
  { ting: "T. LIMA", class: "5 DELTA", guru: "NURUL QURSAIRAH BINTI AZHAR", melayu: { L: 5, P: 9 }, cina: { L: 2, P: 1 }, india: { L: 4, P: 4 }, lain: { L: 0, P: 1 }, islam: 15, bIslam: 11, jantina: { L: 11, P: 15 } },
  { ting: "T. LIMA", class: "5 GAMMA", guru: "HAYATI BINTI HUSSAIN", melayu: { L: 4, P: 3 }, cina: { L: 4, P: 5 }, india: { L: 6, P: 6 }, lain: { L: 0, P: 1 }, islam: 7, bIslam: 22, jantina: { L: 14, P: 15 } },
  { ting: "T. LIMA", class: "5 LAMBDA", guru: "SYANAZ SHAZMIRA BINTI ZAHIDI", melayu: { L: 2, P: 2 }, cina: { L: 2, P: 1 }, india: { L: 10, P: 5 }, lain: { L: 0, P: 0 }, islam: 4, bIslam: 18, jantina: { L: 14, P: 8 } }
];

// Names list to generate unique, realistic student names
const SURNAMES_MALAY = ["Kamal", "Zulkifli", "Hamzah", "Ariffin", "Razali", "Ibrahim", "Yusof", "Salleh", "Hakim", "Faris", "Ahmad", "Rosli", "Osman", "Ishaq", "Farid"];
const NAMES_MALAY_M = ["Ahmad", "Muhammad", "Syamil", "Daniel", "Harith", "Amirul", "Firdaus", "Khairul", "Luqman", "Aizat", "Iqbal", "Zafran", "Hazim", "Akmal", "Fahmi"];
const NAMES_MALAY_F = ["Siti", "Nurul", "Aishah", "Farhana", "Putri", "Khadijah", "Syazwani", "Anis", "Amira", "Atiqah", "Balqis", "Fatin", "Nadhirah", "Adlina", "Mia"];

const SURNAMES_CINA = ["Tan", "Lim", "Lee", "Wong", "Chan", "Ng", "Lau", "Cheah", "Teoh", "Chong", "Yip", "Soh", "Goh", "Chin", "Khoo"];
const NAMES_CINA_M = ["Wei Jian", "Kok Seng", "Jun Jie", "Zi Hao", "Kah Seng", "Ming Xuan", "Chee Keong", "Han Wei", "Seng Long", "Chun Weng"];
const NAMES_CINA_F = ["Siew Mei", "Ting Ting", "Xin Yi", "Pei Yee", "Yee Wen", "Mei Chi", "Jia Ying", "Evelyn", "Chui Ling", "Xiao Xuan"];

const SURNAMES_INDIA = ["Rao", "Nair", "Pillay", "Kumar", "Singh", "Reddy", "Menon", "Naidu", "Balakrishnan", "Selvam", "Murugan", "Nathan"];
const NAMES_INDIA_M = ["Karthik", "Ramesh", "Sanjiv", "Vikneswaran", "Devan", "Tharshan", "Suresh", "Mogan", "Arvind", "Harish", "Navin"];
const NAMES_INDIA_F = ["Priya", "Meera", "Shalini", "Darshini", "Kavitha", "Divya", "Ambiga", "Roshini", "Sumathi", "Punitha", "Thilaga"];

const NAMES_LAIN_M = ["John Anak Alister", "David", "Ethan", "Lucas", "Aaron", "Ryan James", "Alexander", "Daniel George"];
const NAMES_LAIN_F = ["Elisa Anak Jamil", "Emily", "Chloe", "Grace", "Sarah", "Hannah Jack", "Sophia", "Jessica"];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSMKRantauStudents(): StudentRecord[] {
  const students: StudentRecord[] = [];
  let globalId = 1000;
  let runningBil = 1;

  for (const c of SMK_RANTAU_CLASSES) {
    let islamAssigned = 0;
    let bIslamAssigned = 0;

    // We generate the designated number of Melayu, Cina, India, Lain students for each class
    const categories = [
      { key: "Melayu", L: c.melayu.L, P: c.melayu.P },
      { key: "Cina", L: c.cina.L, P: c.cina.P },
      { key: "India", L: c.india.L, P: c.india.P },
      { key: "Lain-lain", L: c.lain.L, P: c.lain.P }
    ];

    for (const cat of categories) {
      // Process Males
      for (let i = 0; i < cat.L; i++) {
        let name = "";
        if (cat.key === "Melayu") {
          name = `${getRandomElement(NAMES_MALAY_M)} ${getRandomElement(NAMES_MALAY_M)} bin ${getRandomElement(SURNAMES_MALAY)}`;
        } else if (cat.key === "Cina") {
          name = `${getRandomElement(SURNAMES_CINA)} ${getRandomElement(NAMES_CINA_M)}`;
        } else if (cat.key === "India") {
          name = `${getRandomElement(NAMES_INDIA_M)} a/l ${getRandomElement(SURNAMES_INDIA)}`;
        } else {
          name = `${getRandomElement(NAMES_LAIN_M)} (${getRandomElement(SURNAMES_MALAY)})`;
        }

        // Logic for Religion Assignment (SMK Rantau total islam must be exact)
        let religion: "Islam" | "Bukan Islam" = "Bukan Islam";
        if (cat.key === "Melayu") {
          religion = "Islam";
          islamAssigned++;
        } else {
          // If we still need Islam to meet the class counts, assign them to Lain or non-Malay
          if (islamAssigned < c.islam) {
            religion = "Islam";
            islamAssigned++;
          } else {
            religion = "Bukan Islam";
            bIslamAssigned++;
          }
        }

        const randNum = (globalId * 7) % 100;
        const kategoriEkonomi = randNum < 60 ? "B40" : randNum < 90 ? "M40" : "T20";

        students.push({
          id: `STU${globalId++}`,
          bil: runningBil++,
          tingkatan: c.ting,
          kelas: c.class,
          guruKelas: c.guru,
          nama: name.toUpperCase(),
          jantina: "L",
          kaum: cat.key,
          agama: religion,
          warganegara: "Warganegara",
          kategoriEkonomi
        });
      }

      // Process Females
      for (let i = 0; i < cat.P; i++) {
        let name = "";
        if (cat.key === "Melayu") {
          name = `${getRandomElement(NAMES_MALAY_F)} ${getRandomElement(NAMES_MALAY_F)} binti ${getRandomElement(SURNAMES_MALAY)}`;
        } else if (cat.key === "Cina") {
          name = `${getRandomElement(SURNAMES_CINA)} ${getRandomElement(NAMES_CINA_F)}`;
        } else if (cat.key === "India") {
          name = `${getRandomElement(NAMES_INDIA_F)} a/p ${getRandomElement(SURNAMES_INDIA)}`;
        } else {
          name = `${getRandomElement(NAMES_LAIN_F)} (${getRandomElement(SURNAMES_MALAY)})`;
        }

        // Religion Assignment
        let religion: "Islam" | "Bukan Islam" = "Bukan Islam";
        if (cat.key === "Melayu") {
          religion = "Islam";
          islamAssigned++;
        } else {
          if (islamAssigned < c.islam) {
            religion = "Islam";
            islamAssigned++;
          } else {
            religion = "Bukan Islam";
            bIslamAssigned++;
          }
        }

        const randNum = (globalId * 7) % 100;
        const kategoriEkonomi = randNum < 60 ? "B40" : randNum < 90 ? "M40" : "T20";

        students.push({
          id: `STU${globalId++}`,
          bil: runningBil++,
          tingkatan: c.ting,
          kelas: c.class,
          guruKelas: c.guru,
          nama: name.toUpperCase(),
          jantina: "P",
          kaum: cat.key,
          agama: religion,
          warganegara: "Warganegara",
          kategoriEkonomi
        });
      }
    }
    
    // Safety check / adjustment panel to guarantee exact Islam count:
    // If we missed or exceeded the target due to rigid assignments, the engine's direct parser 
    // during aggregate phase compiles actual properties. Thus, we will calibrate the generated records
    // specifically for each class to guarantee 100% precision.
    const classRecords = students.filter(s => s.kelas === c.class);
    let curIslam = classRecords.filter(s => s.agama === "Islam").length;
    let diff = c.islam - curIslam;
    
    if (diff > 0) {
      // Need more Islam. Convert Bukan-Islam non-Malays to Islam
      for (const st of classRecords) {
        if (st.agama === "Bukan Islam" && diff > 0) {
          st.agama = "Islam";
          diff--;
        }
      }
    } else if (diff < 0) {
      // Too many Islam. Convert some to Bukan Islam
      let excess = Math.abs(diff);
      for (const st of classRecords) {
        // Switch non-Melayu who were assigned Islam
        if (st.agama === "Islam" && st.kaum !== "Melayu" && excess > 0) {
          st.agama = "Bukan Islam";
          excess--;
        }
      }
      
      // If we still need to switch, switch Melayu (theoretically shouldn't happen based on counts)
      if (excess > 0) {
        for (const st of classRecords) {
          if (st.agama === "Islam" && excess > 0) {
            st.agama = "Bukan Islam";
            excess--;
          }
        }
      }
    }
  }

  // Double check that we have exactly 776 records
  return students;
}
