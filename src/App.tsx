import React, { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  Upload, 
  FileSpreadsheet, 
  Printer, 
  FileText, 
  User, 
  Users, 
  Languages, 
  Compass, 
  Calendar, 
  BookOpen, 
  Sparkles,
  CheckCircle2, 
  AlertCircle, 
  Settings2, 
  ArrowRight,
  School,
  Database,
  Search,
  Filter,
  Check,
  ChevronDown
} from "lucide-react";
import { StudentRecord, ColumnMapping } from "./types";
import { generateSMKRantauStudents } from "./mockData";
import { 
  aggregateToClassStats, 
  calculateOverallSummary, 
  autoDetectColumns, 
  parseRowsToStudents 
} from "./utils/parser";
import SchoolCharts from "./components/SchoolCharts";
import ExecutiveSummary from "./components/ExecutiveSummary";

export default function App() {
  // Primary Student Database State (defaults to SMK Rantau Dataset of 776 students)
  const [students, setStudents] = useState<StudentRecord[]>(() => generateSMKRantauStudents());
  const [fileName, setFileName] = useState("NEE4099 Keseluruhan Murid as of 2026-06-12.csv");
  const [fileDate, setFileDate] = useState("12/06/2026");
  const [schoolName, setSchoolName] = useState("SMK Rantau");
  const [schoolCode, setSchoolCode] = useState("NEE4099");

  // School Profile & Logo Upload States
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [logoDragActive, setLogoDragActive] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Spreadsheet Upload & Custom Mapping States
  const [uploadedRows, setUploadedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    tingkatan: "",
    kelas: "",
    guruKelas: "",
    nama: "",
    jantina: "",
    kaum: "",
    agama: "",
    warganegara: ""
  });
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // UI States
  const [activeTab, setActiveTab] = useState<"summary" | "forms" | "kaum" | "agama" | "jantina" | "mRoster" | "visuals">("summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [formFilter, setFormFilter] = useState("SEMUA");
  const [dragActive, setDragActive] = useState(false);
  const [sortField, setSortField] = useState<string>("nama");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computations based on current student data
  const formStats = useMemo(() => aggregateToClassStats(students), [students]);
  const summary = useMemo(() => calculateOverallSummary(formStats, students), [formStats, students]);

  // Handle Drag & Drop Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Trigger File Input Click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Logo Drag & Drop and Upload Event Handlers
  const handleLogoDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setLogoDragActive(true);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setLogoDragActive(false);
    }
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLogoDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processLogoFile(e.dataTransfer.files[0]);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processLogoFile(e.target.files[0]);
    }
  };

  const processLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Sila muat naik fail imej sahaja (JPEG/PNG/SVG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSchoolLogo(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSchoolLogo(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  // Parse Excel / CSV Spreadsheet
  const processFile = (file: File) => {
    setUploadError(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Output raw 2D array of rows to read school info at Row 3 (A3) and Row 4 (A4)
        const sheetData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        let detectedSchoolName = "SMK Rantau";
        let detectedSchoolCode = "NEE4099";

        let foundSchoolName = "";
        let foundSchoolCode = "";

        // Standard Malaysian school code of 3 letters followed by 4 digits (e.g., NEE4099)
        const schoolCodeRegex = /\b([A-Z]{3}\d{4})\b/i;

        // Iterate through all cells of the first 30 rows of sheetData to search for school info
        for (let r = 0; r < Math.min(sheetData.length, 30); r++) {
          const row = sheetData[r];
          if (!row) continue;
          for (let c = 0; c < row.length; c++) {
            const val = row[c];
            if (!val) continue;
            const strVal = String(val).trim();

            // 1. Check for School Code
            const codeMatch = strVal.match(schoolCodeRegex);
            if (codeMatch && !foundSchoolCode) {
              foundSchoolCode = codeMatch[1].toUpperCase();
            }

            // 2. Check for School Name
            const lowerVal = strVal.toLowerCase();
            if (lowerVal.includes("nama sekolah") || lowerVal.includes("sekolah :") || lowerVal.includes("sekolah:")) {
              const parts = strVal.split(":");
              if (parts.length > 1 && parts[1].trim()) {
                const candidate = parts[1].replace(/kementerian pendidikan Malaysia/i, "").trim();
                if (candidate && candidate.length > 3) {
                  foundSchoolName = candidate;
                }
              }
            } else if (
              !foundSchoolName &&
              (strVal.startsWith("SMK ") || 
               strVal.startsWith("SK ") || 
               strVal.startsWith("SJK") || 
               strVal.startsWith("SM ") || 
               strVal.startsWith("SRK ") ||
               strVal.startsWith("SMJK ") ||
               strVal.startsWith("Kolej Vokasional ") ||
               strVal.startsWith("SABK ") ||
               strVal.startsWith("MRSM "))
            ) {
              foundSchoolName = strVal;
            }
          }
        }

        if (foundSchoolName) {
          detectedSchoolName = foundSchoolName;
        } else {
          // Fallback to filename
          const fileBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const cleanFileName = fileBaseName.replace(/[^a-zA-Z0-9\s()]/g, " ");
          const schoolMatch = cleanFileName.match(/\b(SMK|SK|SJK|SMJK|SRK|MRSM)\s+[A-Za-z0-9\s]+/i);
          if (schoolMatch) {
            detectedSchoolName = schoolMatch[0].trim();
          } else if (fileBaseName && fileBaseName.length > 5) {
            detectedSchoolName = fileBaseName.replace(/[\-_]/g, " ").trim();
          }
        }

        if (foundSchoolCode) {
          detectedSchoolCode = foundSchoolCode;
        } else {
          const fileCodeMatch = file.name.match(schoolCodeRegex);
          if (fileCodeMatch) {
            detectedSchoolCode = fileCodeMatch[1].toUpperCase();
          }
        }

        // Read Student data starting from Row 6 (range: 5 skips first 5 rows, making row 6 the header)
        if (sheetData.length < 6) {
          setUploadError("Fail terpilih tidak mempunyai data yang cukup (perlu sekurang-kurangnya 6 baris).");
          return;
        }

        const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { range: 5, defval: "" });
        
        if (rawRows.length === 0) {
          setUploadError("Fail terpilih kosong atau tidak mempunyai data murid sah bermula di Baris 6.");
          return;
        }

        // Get actual spreadsheet headers from Row 6
        const sheetHeaders = Object.keys(rawRows[0] || {});
        if (sheetHeaders.length === 0) {
          setUploadError("Gagal mengesan lajur tajuk di Baris 6.");
          return;
        }

        setHeaders(sheetHeaders);
        setUploadedRows(rawRows);
        setFileName(file.name);
        setSchoolName(detectedSchoolName);
        setSchoolCode(detectedSchoolCode);
        
        // Format today's date for display
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        setFileDate(formattedDate);

        // Run heuristic column autodetect
        const detectedMapping = autoDetectColumns(rawRows[0]);
        setColumnMapping(detectedMapping);
        
        // Open Mapping Board Modal
        setIsMappingModalOpen(true);
      } catch (err) {
        console.error(err);
        setUploadError("Gagal merumus fail ini. Sila pastikan ia fail Excel (.xlsx) atau CSV (.csv) berformat jadual yang biasa.");
      }
    };

    reader.onerror = () => {
      setUploadError("Ralat semasa membaca fail.");
    };

    reader.readAsBinaryString(file);
  };

  // Apply custom mapped columns to generate students
  const handleApplyMapping = () => {
    if (!columnMapping.tingkatan || !columnMapping.kelas || !columnMapping.jantina) {
      alert("Sila tetapkan sekurang-kurangnya lajur Tingkatan, Kelas, dan Jantina.");
      return;
    }

    const compiledStudents = parseRowsToStudents(uploadedRows, columnMapping);
    if (compiledStudents.length === 0) {
      alert("Tiada murid sah yang dapat dijana dari pemetaan ini. Periksa lajur.");
      return;
    }

    setStudents(compiledStudents);
    setIsMappingModalOpen(false);
    setActiveTab("summary");
  };

  // Restore the canonical SMK Rantau sample database
  const handleLoadSMKRantauSample = () => {
    setStudents(generateSMKRantauStudents());
    setFileName("NEE4099 Keseluruhan Murid as of 2026-06-12.csv");
    setFileDate("12/06/2026");
    setSchoolName("SMK Rantau");
    setSchoolCode("NEE4099");
    setSchoolLogo(null);
    setUploadError(null);
    alert("Data SMK Rantau (776 Murid) telah berjaya dimuatkan!");
  };

  // Standard Print Trigger
  const handlePrint = () => {
    window.print();
  };

  // Handle column sorting on master roster
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and Sort Master Roster list
  const filteredStudents = useMemo(() => {
    const list = students.filter(s => {
      const matchesSearch = 
        s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.guruKelas && s.guruKelas.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesForm = formFilter === "SEMUA" || s.tingkatan === formFilter;
      
      return matchesSearch && matchesForm;
    });

    list.sort((a: any, b: any) => {
      const valA = (a[sortField] || "").toString().toLowerCase();
      const valB = (b[sortField] || "").toString().toLowerCase();
      
      const comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return list;
  }, [students, searchQuery, formFilter, sortField, sortDirection]);

  // Unique list of Forms for filtering
  const availableForms = useMemo(() => {
    const set = new Set(students.map(s => s.tingkatan));
    return ["SEMUA", ...Array.from(set).sort((a: any, b: any) => a.localeCompare(b))];
  }, [students]);

  // Compute race majorities/minorities for demographics card
  const { majorityRace, majorityRacePct, minorityRace } = useMemo(() => {
    const sortedRaces = (Object.entries(summary.raceStats) as [string, any][]).sort((a, b) => b[1].Total - a[1].Total);
    const majorityRace = sortedRaces[0]?.[0] || "-";
    const majorityRacePct = sortedRaces[0]?.[1].Pct || 0;
    const minorityRace = sortedRaces[sortedRaces.length - 1]?.[0] || "-";
    return { majorityRace, majorityRacePct, minorityRace };
  }, [summary]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans print:bg-white print:text-black">
      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {schoolLogo ? (
              <div className="relative group">
                <img 
                  id="school-header-logo"
                  src={schoolLogo} 
                  alt="Logo Sekolah" 
                  className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-slate-50 p-1 shadow-xs transition-transform duration-200 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="p-2.5 bg-teal-600 rounded-xl text-white shadow-md shadow-teal-600/10">
                <School className="w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                Sistem Analisis Enrolmen Murid
              </h1>
              <p className="text-xs text-slate-505 font-medium mt-0.5">
                {schoolName} {schoolCode ? `(${schoolCode})` : ""} • Kementerian Pendidikan Malaysia
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handleLoadSMKRantauSample}
              className="px-3.5 py-2 text-xs font-semibold text-slate-705 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Database className="w-3.5 h-3.5 text-teal-600" />
              Muat Data SMK Rantau
            </button>
            
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-705 rounded-xl shadow-md shadow-teal-605/10 transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Cetak PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 print:py-0 print:px-0">
        
        {/* Dataset Metadata Ribbon */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-650">
              <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Fail Sekolah Aktif
              </p>
              <h2 className="text-sm font-semibold text-slate-800 break-all">{fileName}</h2>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500 self-end sm:self-auto">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Kemas kini: <strong className="text-slate-700 font-semibold">{fileDate}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Status: <strong className="text-emerald-700 font-semibold">Ready</strong></span>
            </div>
          </div>
        </div>

        {/* Drag & Drop Upload Zone (Hidden on print) */}
        <div className="print:hidden print:h-0 print:p-0 print:m-0 print:border-none">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative p-8 rounded-2xl border-2 border-dashed text-center transition print:hidden print:h-0 print:p-0 print:m-0 print:border-none ${
              dragActive 
                ? "border-teal-500 bg-teal-50/50" 
                : "border-slate-300 bg-white hover:border-teal-400 hover:bg-slate-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="max-w-md mx-auto space-y-3">
              <div className="mx-auto w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  Muat naik data murid baharu (.xlsx, .csv)
                </p>
                <p className="text-xs text-slate-400">
                  Seret dan lepas fail anda di sini, atau <button onClick={handleUploadClick} className="text-teal-600 font-semibold hover:underline cursor-pointer">pilih fail dari komputer</button>
                </p>
              </div>
              <p className="text-[10px] text-slate-450">
                Sistem akan membaca senarai daftar flat murid, mengesan demografi, menghimpun subtotal bertingkat dan mengukur metrik secara dinamik.
              </p>
            </div>
          </div>
          
          {uploadError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Tab Selection Row (Hidden on print) */}
        <div className="flex items-center overflow-x-auto pb-2 border-b border-slate-205 gap-2 scrollbar-none print:hidden">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === "summary"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-655 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Bahagian 1: Ringkasan
          </button>
          
          <button
            onClick={() => setActiveTab("forms")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === "forms"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-655 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Bahagian 2: Jadual Tingkatan
          </button>
          
          <button
            onClick={() => setActiveTab("kaum")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === "kaum"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-655 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Bahagian 3: Analisis Kaum
          </button>
          
          <button
            onClick={() => setActiveTab("jantina")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === "jantina"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-655 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Bahagian 4: Jantina & Rumusan
          </button>

          <button
            onClick={() => setActiveTab("visuals")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === "visuals"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-655 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Bahagian 5: Visualisasi Carta
          </button>

          <button
            onClick={() => setActiveTab("mRoster")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === "mRoster"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-655 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Pangkalan Roster Murid ({students.length})
            </span>
          </button>
        </div>

        {/* PRINT BRANDING BANNER (Only visible in print media) */}
        <div className="hidden print:block border-b border-slate-500 pb-2 mb-4">
          <div className="flex flex-row items-center gap-4">
            {schoolLogo && (
              <img 
                id="school-print-logo"
                src={schoolLogo} 
                alt="Logo Sekolah" 
                className="w-11 h-11 object-contain flex-shrink-0"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="flex-1 text-center">
              <h1 className="text-sm font-black tracking-wide text-black uppercase">
                LAPORAN ANALISIS ENROLMEN DAN STATISTIK DEMOGRAFI MURID
              </h1>
              <p className="text-[9px] text-slate-800 font-bold uppercase mt-0.5">
                SEKOLAH: {schoolName} • KOD SEKOLAH: {schoolCode} • KEMENTERIAN PENDIDIKAN MALAYSIA
              </p>
            </div>
            {schoolLogo && <div className="w-11" /> /* balances the logo offset to keep title perfectly centered */}
          </div>
          
          <div className="flex justify-between items-center text-[8px] text-slate-600 mt-2 border-t border-slate-200/60 pt-1.5 px-0.5">
            <span>Fail Data Rujukan: <strong className="text-slate-800">{fileName}</strong></span>
            <span>Tarikh Ekstraksi: <strong className="text-slate-800">{fileDate}</strong></span>
          </div>
        </div>

        {/* TAB 1: SUMMARY / MAKLUMAT RINGKAS */}
        {(activeTab === "summary" || window.matchMedia("print").matches) && (
          <section className="space-y-6">
            <h3 className="text-md font-bold text-slate-800 border-l-4 border-teal-600 pl-3 uppercase print:text-lg">
              Bahagian 1: Maklumat Ringkas Enrolmen
            </h3>
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition print:border-slate-300">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Enrolmen</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">{summary.totalOverall}</p>
                <p className="text-[10px] text-slate-505 mt-1">Murid Berdaftar</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition print:border-slate-300">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Murid Lelaki</p>
                <p className="text-2xl font-extrabold text-slate-950 mt-2 font-mono text-sky-652">{summary.totalBoys}</p>
                <p className="text-[10px] text-slate-505 mt-1">{summary.genderStats.boyPct}% dari sekolah</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition print:border-slate-300">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Murid Perempuan</p>
                <p className="text-2xl font-extrabold text-slate-950 mt-2 font-mono text-pink-652">{summary.totalGirls}</p>
                <p className="text-[10px] text-slate-505 mt-1">{summary.genderStats.girlPct}% dari sekolah</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition print:border-slate-300">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bilangan Kelas</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">{summary.classCount}</p>
                <p className="text-[10px] text-slate-505 mt-1">Kelas Aktif</p>
              </div>
            </div>

            {/* Subtotal table as requested inside Section 1 */}
            <div className="bg-white rounded-2xl border border-slate-210 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50/50 border-b border-slate-105 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">JADUAL PENYATA ENROLMEN RINGKAS</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-101 border-b border-slate-200 text-slate-505 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Item Enrolmen</th>
                      <th className="py-3 px-4 text-right">Bilangan Murid (Kekuatan)</th>
                      <th className="py-3 px-4 text-right">Peratus Keseluruhan (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-800">Jumlah Murid Keseluruhan</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{summary.totalOverall} orang</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">100.00 %</td>
                    </tr>
                    <tr className="bg-sky-50/20">
                      <td className="py-3 px-4 font-medium text-slate-800">Murid Lelaki</td>
                      <td className="py-3 px-4 text-right font-mono text-sky-700">{summary.totalBoys} orang</td>
                      <td className="py-3 px-4 text-right font-mono text-sky-700">{summary.genderStats.boyPct} %</td>
                    </tr>
                    <tr className="bg-pink-50/20">
                      <td className="py-3 px-4 font-medium text-slate-800">Murid Perempuan</td>
                      <td className="py-3 px-4 text-right font-mono text-pink-700">{summary.totalGirls} orang</td>
                      <td className="py-3 px-4 text-right font-mono text-pink-700">{summary.genderStats.girlPct} %</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-800">Bilangan Bilik Darjah (Kelas Aktif)</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800">{summary.classCount} kelas</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">N/A</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-800">Peringkat Block Pengajian (Tingkatan)</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800">{summary.formCount} peringkat</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: CLASSES TABLE BY FORM (SMK RANTAU DETAILED LAYOUT) */}
        {(activeTab === "forms" || window.matchMedia("print").matches) && (
          <section className="space-y-6">
            <h3 className="text-md font-bold text-slate-800 border-l-4 border-teal-600 pl-3 uppercase print:text-lg">
              Bahagian 2: Analisis Enrolmen Mengikut Kelas & Tingkatan
            </h3>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs text-slate-800 print:text-[8px]">
                  <thead>
                    {/* Double Tier Header */}
                    <tr className="bg-slate-800 text-white font-bold border-b border-slate-700">
                      <th rowSpan={2} className="py-3 px-2 border-r border-slate-700 text-center w-10">Bil</th>
                      <th rowSpan={2} className="py-3 px-2 border-r border-slate-700 text-center">Ting.</th>
                      <th rowSpan={2} className="py-3 px-2 border-r border-slate-700 text-center">Kelas</th>
                      <th rowSpan={2} className="py-3 px-2 border-r border-slate-700 text-left">Nama Guru Kelas</th>
                      <th colSpan={2} className="py-1 px-1 border-r border-slate-700 text-center bg-teal-800">Melayu</th>
                      <th colSpan={2} className="py-1 px-1 border-r border-slate-700 text-center bg-rose-800">Cina</th>
                      <th colSpan={2} className="py-1 px-1 border-r border-slate-700 text-center bg-amber-800">India</th>
                      <th colSpan={2} className="py-1 px-1 border-r border-slate-700 text-center bg-indigo-800">Lain</th>
                      <th colSpan={2} className="py-1 px-1 border-r border-slate-700 text-center bg-emerald-800">Agama</th>
                      <th colSpan={2} className="py-1 px-1 border-r border-slate-700 text-center bg-sky-800">Jantina</th>
                      <th rowSpan={2} className="py-3 px-2 text-center w-14 bg-slate-900 text-white">Jumlah</th>
                    </tr>
                    <tr className="bg-slate-700 text-white font-bold border-b border-slate-650">
                      {/* Sub columns */}
                      <th className="py-1 px-1 border-r border-slate-600 w-8 bg-teal-900/60 text-teal-200">L</th>
                      <th className="py-1 px-1 border-r border-slate-600 w-8 bg-teal-900/60 text-teal-200">P</th>
                      
                      <th className="py-1 px-1 border-r border-slate-600 w-8 bg-rose-900/60 text-rose-200">L</th>
                      <th className="py-1 px-1 border-r border-slate-600 w-8 bg-rose-900/60 text-rose-200">P</th>
                      
                      <th className="py-1 px-1 border-r border-slate-600 w-8 bg-amber-900/60 text-amber-200">L</th>
                      <th className="py-1 px-1 border-r border-slate-600 w-8 bg-amber-900/60 text-amber-200">P</th>
                      
                      <th className="py-1 px-1 border-r border-slate-600 w-8 bg-indigo-900/60 text-indigo-200">L</th>
                      <th className="py-1 px-1 border-r border-slate-600 w-8 bg-indigo-900/60 text-indigo-200">P</th>
                      
                      <th className="py-1 px-1 border-r border-slate-600 bg-emerald-900/60 text-emerald-200 w-12">Islam</th>
                      <th className="py-1 px-1 border-r border-slate-600 bg-emerald-950/60 text-emerald-300 w-12">B. Islam</th>
                      
                      <th className="py-1 px-1 border-r border-slate-600 bg-sky-900/60 text-sky-200 w-10">L</th>
                      <th className="py-1 px-1 border-r border-slate-600 bg-sky-950/60 text-sky-300 w-10">P</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let overallIndex = 1;
                      const rowsToRender: React.ReactNode[] = [];

                      formStats.forEach((form, formIdx) => {
                        // Populate each class rows inside this Form
                        form.classes.forEach((c) => {
                          rowsToRender.push(
                            <tr key={`${form.tingkatan}-${c.kelas}`} className="hover:bg-slate-50 border-b border-slate-100 transition">
                              <td className="py-2 px-1 border-r border-slate-100 font-mono text-slate-500">{overallIndex++}</td>
                              <td className="py-2 px-1 border-r border-slate-100 font-medium text-slate-900">{form.tingkatan}</td>
                              <td className="py-2 px-1 border-r border-slate-100 font-semibold text-slate-800 text-left pl-2">{c.kelas}</td>
                              <td className="py-2 px-2 border-r border-slate-105 text-left text-slate-600 uppercase font-mono max-w-[200px] truncate" title={c.guruKelas}>
                                {c.guruKelas}
                              </td>
                              {/* Melayu */}
                              <td className="py-2 px-1 border-r border-slate-100 font-mono bg-teal-50/20">{c.melayuL}</td>
                              <td className="py-2 px-1 border-r border-slate-100 font-mono bg-teal-50/20">{c.melayuP}</td>
                              {/* Cina */}
                              <td className="py-2 px-1 border-r border-slate-100 font-mono bg-rose-50/10">{c.cinaL}</td>
                              <td className="py-2 px-1 border-r border-slate-100 font-mono bg-rose-50/10">{c.cinaP}</td>
                              {/* India */}
                              <td className="py-2 px-1 border-r border-slate-100 font-mono bg-amber-50/10">{c.indiaL}</td>
                              <td className="py-2 px-1 border-r border-slate-100 font-mono bg-amber-50/10">{c.indiaP}</td>
                              {/* Lain */}
                              <td className="py-2 px-1 border-r border-slate-100 font-mono bg-indigo-50/10">{c.lainL}</td>
                              <td className="py-2 px-1 border-r border-slate-105 font-mono bg-indigo-50/10">{c.lainP}</td>
                              {/* Agama */}
                              <td className="py-2 px-1 border-r border-slate-100 font-mono font-medium bg-emerald-50/30 text-emerald-800">{c.islam}</td>
                              <td className="py-2 px-1 border-r border-slate-105 font-mono font-medium bg-purple-50/20 text-purple-850">{c.bIslam}</td>
                              {/* Jantina */}
                              <td className="py-2 px-1 border-r border-slate-100 font-mono font-medium bg-sky-50/20 text-sky-800">{c.jantinaL}</td>
                              <td className="py-2 px-1 border-r border-slate-105 font-mono font-medium bg-pink-50/10 text-pink-805">{c.jantinaP}</td>
                              {/* Jumlah Class */}
                              <td className="py-2 px-1 font-mono font-bold bg-slate-100 text-slate-900">{c.jumlah}</td>
                            </tr>
                          );
                        });

                        // Append the Subtotal block for this Tingkatan
                        rowsToRender.push(
                          <tr key={`SUBTOTAL-${form.tingkatan}`} className="bg-slate-150 font-bold border-b-2 border-slate-205 text-slate-800">
                            <td colSpan={4} className="py-2.5 px-3 border-r border-slate-200 text-left bg-slate-200/80 tracking-wider">
                              JUMLAH TINGKATAN {form.tingkatan.toUpperCase()}
                            </td>
                            {/* Melayu */}
                            <td className="py-2.5 px-1 border-r border-slate-200 bg-teal-100/30">{form.subtotals.melayuL}</td>
                            <td className="py-2.5 px-1 border-r border-slate-200 bg-teal-100/30">{form.subtotals.melayuP}</td>
                            {/* Cina */}
                            <td className="py-2.5 px-1 border-r border-slate-200 bg-rose-100/20">{form.subtotals.cinaL}</td>
                            <td className="py-2.5 px-1 border-r border-slate-200 bg-rose-100/20">{form.subtotals.cinaP}</td>
                            {/* India */}
                            <td className="py-2.5 px-1 border-r border-slate-200 bg-amber-100/20">{form.subtotals.indiaL}</td>
                            <td className="py-2.5 px-1 border-r border-slate-200 bg-amber-100/20">{form.subtotals.indiaP}</td>
                            {/* Lain */}
                            <td className="py-2.5 px-1 border-r border-slate-200 bg-indigo-100/20">{form.subtotals.lainL}</td>
                            <td className="py-2.5 px-1 border-r border-slate-205 bg-indigo-100/20">{form.subtotals.lainP}</td>
                            {/* Agama */}
                            <td className="py-2.5 px-1 border-r border-slate-200 bg-emerald-100/40 text-emerald-900">{form.subtotals.islam}</td>
                            <td className="py-2.5 px-1 border-r border-slate-205 bg-purple-100/20 text-purple-900">{form.subtotals.bIslam}</td>
                            {/* Jantina */}
                            <td className="py-2.5 px-1 border-r border-slate-200 bg-sky-100/40 text-sky-900">{form.subtotals.jantinaL}</td>
                            <td className="py-2.5 px-1 border-r border-slate-205 bg-pink-100/30 text-pink-900">{form.subtotals.jantinaP}</td>
                            {/* Subtotal value */}
                            <td className="py-2.5 px-1 bg-slate-300 text-slate-950 font-extrabold">{form.subtotals.jumlah}</td>
                          </tr>
                        );
                      });

                      // Finally the grand total block
                      rowsToRender.push(
                        <tr key="GRAND-TOTAL" className="bg-slate-900 text-white font-extrabold text-xs">
                          <td colSpan={4} className="py-3 px-3 uppercase text-left tracking-widest pl-4">
                            Jumlah Keseluruhan Sekolah
                          </td>
                          {/* Melayu */}
                          <td className="py-3 px-1">{summary.raceStats.Melayu.L}</td>
                          <td className="py-3 px-1">{summary.raceStats.Melayu.P}</td>
                          {/* Cina */}
                          <td className="py-3 px-1">{summary.raceStats.Cina.L}</td>
                          <td className="py-3 px-1">{summary.raceStats.Cina.P}</td>
                          {/* India */}
                          <td className="py-3 px-1">{summary.raceStats.India.L}</td>
                          <td className="py-3 px-1">{summary.raceStats.India.P}</td>
                          {/* Lain */}
                          <td className="py-3 px-1">{summary.raceStats["Lain-lain"].L}</td>
                          <td className="py-3 px-1">{summary.raceStats["Lain-lain"].P}</td>
                          {/* Agama */}
                          <td className="py-3 px-1 bg-emerald-900">{summary.religionStats.Islam.Total}</td>
                          <td className="py-3 px-1 bg-purple-950">{summary.religionStats["Bukan Islam"].Total}</td>
                          {/* Jantina */}
                          <td className="py-3 px-1 bg-sky-900">{summary.totalBoys}</td>
                          <td className="py-3 px-1 bg-pink-900">{summary.totalGirls}</td>
                          {/* Cum Total */}
                          <td className="py-3 px-1 bg-slate-950 text-emerald-400 font-mono font-black text-sm">{summary.totalOverall}</td>
                        </tr>
                      );

                      return rowsToRender;
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form Descriptions (Average size, Largest and Smallest classes) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
              {summary.formDetails.map(f => (
                <div key={f.name} className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between print:border-slate-300 print:break-inside-avoid">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 border-l-3 border-teal-500 pl-2 uppercase">
                      Statistik Tingkatan {f.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Bilangan Kelas</span>
                        <strong className="text-slate-805">{f.classCount} kelas</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Kekuatan Aliran</span>
                        <strong className="text-slate-805">{f.studentCount} murid</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Purata Kelas</span>
                        <strong className="text-slate-805">{f.avgPerClass} murid / kelas</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Kompasi Gender</span>
                        <strong className="text-slate-700 capitalize">
                          {summary.genderStats.ratio} 
                        </strong>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3.5 border-t border-slate-103 grid grid-cols-2 gap-2 text-[11px] text-slate-505">
                    <div>
                      <span className="block font-medium">Kelas Terbesar:</span>
                      <span className="font-semibold text-rose-700 break-all">{f.maxClass.name} ({f.maxClass.count} orang)</span>
                    </div>
                    <div>
                      <span className="block font-medium">Kelas Terkecil:</span>
                      <span className="font-semibold text-emerald-700 break-all">{f.minClass.name} ({f.minClass.count} orang)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: RACE / KAUM ANALYSIS */}
        {(activeTab === "kaum" || window.matchMedia("print").matches) && (
          <section className="space-y-6 print:break-before-page">
            <h3 className="text-md font-bold text-slate-800 border-l-4 border-teal-600 pl-3 uppercase print:text-lg">
              Bahagian 3: Analisis Demografi Kaum
            </h3>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs text-slate-800 print:text-[10px]">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold text-center border-b border-slate-705">
                      <th className="py-3 px-4 text-left border-r border-slate-705">Klasifikasi Kaum (Etnik)</th>
                      <th className="py-3 px-4 border-r border-slate-705">Lelaki (L)</th>
                      <th className="py-3 px-4 border-r border-slate-705">Perempuan (P)</th>
                      <th className="py-3 px-4 border-r border-slate-705">Jumlah Murid</th>
                      <th className="py-3 px-4">Nisbah & Peratusan (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary.raceStats).map(([race, stat]: any) => (
                      <tr key={race} className="hover:bg-slate-50 border-b border-slate-100 transition">
                        <td className="py-3 px-4 border-r border-slate-100 font-semibold text-slate-805 flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${
                            race === "Melayu" ? "bg-teal-600" : 
                            race === "Cina" ? "bg-rose-500" : 
                            race === "India" ? "bg-amber-500" : "bg-indigo-505"
                          }`} />
                          {race}
                        </td>
                        <td className="py-3 px-4 border-r border-slate-100 text-center font-mono font-medium text-slate-700">{stat.L} orang</td>
                        <td className="py-3 px-4 border-r border-slate-100 text-center font-mono font-medium text-slate-700">{stat.P} orang</td>
                        <td className="py-3 px-4 border-r border-slate-100 text-center font-mono font-bold text-slate-900">{stat.Total} orang</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-teal-700 bg-teal-50/10">
                          {stat.Pct}% dari sekolah
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900 text-white font-extrabold text-center">
                      <td className="py-3 px-4 text-left font-bold border-r border-slate-800">JUMLAH KESELURUHAN SEKOLAH</td>
                      <td className="py-3 px-4 border-r border-slate-800 font-mono">{summary.totalBoys} L</td>
                      <td className="py-3 px-4 border-r border-slate-800 font-mono">{summary.totalGirls} P</td>
                      <td className="py-3 px-4 border-r border-slate-800 font-mono text-emerald-400">{summary.totalOverall} orang</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400">100.00%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>


          </section>
        )}

        {/* TAB 5: GENDER / JANTINA & EXECUTIVE REPORT */}
        {(activeTab === "jantina" || window.matchMedia("print").matches) && (
          <section className="space-y-6 print:break-before-page">
            <h3 className="text-md font-bold text-slate-800 border-l-4 border-teal-600 pl-3 uppercase print:text-lg">
              Bahagian 4: Keseimbangan Jantina & Rumusan Eksekutif
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-4 bg-slate-50/50 border-b border-slate-105 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-805">BAHAGIAN 4: ANALISIS JANTINA</span>
                </div>
                <div className="p-5 flex-1 select-none">
                  <table className="w-full text-left text-xs text-slate-800">
                    <thead>
                      <tr className="border-b border-slate-202 text-slate-500 font-semibold uppercase">
                        <th className="py-2">Jantina</th>
                        <th className="py-2 text-center">Bilangan Murid</th>
                        <th className="py-2 text-right">Peratusan (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-103 font-medium">
                      <tr>
                        <td className="py-3 text-sky-800 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-502" />
                          Lelaki
                        </td>
                        <td className="py-3 text-center font-mono text-slate-755">{summary.totalBoys} orang</td>
                        <td className="py-3 text-right font-mono text-sky-652">{summary.genderStats.boyPct} %</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-pink-805 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                          Perempuan
                        </td>
                        <td className="py-3 text-center font-mono text-slate-755">{summary.totalGirls} orang</td>
                        <td className="py-3 text-right font-mono text-pink-652">{summary.genderStats.girlPct} %</td>
                      </tr>
                      <tr className="font-bold border-t-2 border-slate-900 bg-slate-55/35">
                        <td className="py-2.5 text-slate-900">JUMLAH KESELURUHAN</td>
                        <td className="py-2.5 text-center font-mono text-slate-900">{summary.totalOverall} orang</td>
                        <td className="py-2.5 text-right font-mono text-slate-900">100.00 %</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-150 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">Nisbah Jantina</span>
                      <strong className="text-base font-bold text-slate-800 mt-0.5 block font-mono">{summary.genderStats.ratio}</strong>
                      <span className="text-[10px] text-slate-505 block leading-normal mt-1">Lelaki berbanding Perempuan sekolah</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">Status Imbangan</span>
                      <strong className={`text-sm font-bold mt-1 block uppercase ${
                        Math.abs(summary.genderStats.boyPct - summary.genderStats.girlPct) <= 5
                          ? "text-emerald-700" 
                          : "text-amber-700"
                      }`}>
                        {Math.abs(summary.genderStats.boyPct - summary.genderStats.girlPct) <= 5 
                          ? "Sangat Seimbang" 
                          : "Sederhana Tempang"}
                      </strong>
                      <span className="text-[10px] text-slate-505 block leading-normal mt-0.5">Selisih jantina: {Math.abs(summary.genderStats.boyPct - summary.genderStats.girlPct).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF/Print Note */}
              <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl flex flex-col justify-between border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-emerald-450 uppercase tracking-widest">
                    PANDUAN PDF & CETAKAN SPBT
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                    Laporan ini telah direka khas untuk dimampatkan terus ke dalam kertas bersaiz <strong>A4</strong> atau dokumen PDF rasmi sekolah dengan navigasi yang kemas.
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-2.5">
                    Sebarang butang kawalan, bar muat naik fail, serta panel sisi kognitif akan tersembunyi secara automatik dalam susun cetak. Hanya laporan rasmi berasaskan jadual dan ulasan sahaja yang akan dipaparkan.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-[10px] text-slate-404">
                  <Check className="w-3.5 h-3.5 text-emerald-450" />
                  <span>Sesuai diserahkan kepada Pihak Pentadbir & PPD</span>
                </div>
              </div>
            </div>

            {/* Embedded Exec Summary (Bahagian 5) */}
            <ExecutiveSummary summary={summary} />
          </section>
        )}

        {/* TAB 5: CHARTS / VISUALISASI */}
        {(activeTab === "visuals" || window.matchMedia("print").matches) && (
          <section className="space-y-6 print:break-before-page print:pt-6">
            <h3 className="text-md font-bold text-slate-805 border-l-4 border-teal-600 pl-3 uppercase print:text-lg">
              Bahagian 5: Visualisasi Demografi & Kapasiti Bilik Darjah
            </h3>
            
            <SchoolCharts summary={summary} formStats={formStats} />
          </section>
        )}

        {/* TAB 7: MASTER ROSTER VISUAL DATABASE */}
        {(activeTab === "mRoster") && (
          <section className="space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <h3 className="text-md font-bold text-slate-800 border-l-4 border-teal-600 pl-3 uppercase">
                Pangkalan Roster Murid ({filteredStudents.length} rekod dijumpai)
              </h3>
              
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari murid mengikut nama, kelas, guru..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs py-2 pl-9.5 pr-4 bg-white border border-slate-300 rounded-xl focus:border-teal-505 focus:outline-none"
                  />
                </div>
                
                {/* School grade filter */}
                <select
                  value={formFilter}
                  onChange={(e) => setFormFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-300 py-2 px-3 rounded-xl focus:outline-none cursor-pointer"
                >
                  {availableForms.map(f => (
                    <option key={f} value={f}>
                      {f === "SEMUA" ? "Semua Aliran" : `Aliran: ${f}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Flat Roster Grid table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs text-slate-800">
                  <thead className="sticky top-0 bg-slate-900 text-white font-bold h-10 shadow-sm">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center select-none">Bil</th>
                      <th 
                        onClick={() => handleSort("tingkatan")} 
                        className="py-2.5 px-4 cursor-pointer hover:bg-slate-800 select-none transition"
                        title="Klik untuk susun mengikut Tingkatan"
                      >
                        <div className="flex items-center gap-1">
                          Tingkatan
                          <span className="text-[10px] text-teal-400">
                            {sortField === "tingkatan" ? (sortDirection === "asc" ? " ▲" : " ▼") : " ↕"}
                          </span>
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort("kelas")} 
                        className="py-2.5 px-4 cursor-pointer hover:bg-slate-800 select-none transition"
                        title="Klik untuk susun mengikut Kelas"
                      >
                        <div className="flex items-center gap-1">
                          Kelas
                          <span className="text-[10px] text-teal-400">
                            {sortField === "kelas" ? (sortDirection === "asc" ? " ▲" : " ▼") : " ↕"}
                          </span>
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort("nama")} 
                        className="py-2.5 px-4 cursor-pointer hover:bg-slate-800 select-none transition"
                        title="Klik untuk susun mengikut Nama"
                      >
                        <div className="flex items-center gap-1">
                          Nama Pelajar
                          <span className="text-[10px] text-teal-400">
                            {sortField === "nama" ? (sortDirection === "asc" ? " ▲" : " ▼") : " ↕"}
                          </span>
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort("jantina")} 
                        className="py-2.5 px-4 text-center cursor-pointer hover:bg-slate-800 select-none transition"
                        title="Klik untuk susun mengikut Jantina"
                      >
                        <div className="flex items-center justify-center gap-1">
                          Jantina
                          <span className="text-[10px] text-teal-400">
                            {sortField === "jantina" ? (sortDirection === "asc" ? " ▲" : " ▼") : " ↕"}
                          </span>
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort("kaum")} 
                        className="py-2.5 px-4 text-center cursor-pointer hover:bg-slate-800 select-none transition"
                        title="Klik untuk susun mengikut Kaum"
                      >
                        <div className="flex items-center justify-center gap-1">
                          Kaum
                          <span className="text-[10px] text-teal-400">
                            {sortField === "kaum" ? (sortDirection === "asc" ? " ▲" : " ▼") : " ↕"}
                          </span>
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort("agama")} 
                        className="py-2.5 px-4 text-center cursor-pointer hover:bg-slate-800 select-none transition"
                        title="Klik untuk susun mengikut Agama"
                      >
                        <div className="flex items-center justify-center gap-1">
                          Agama
                          <span className="text-[10px] text-teal-400">
                            {sortField === "agama" ? (sortDirection === "asc" ? " ▲" : " ▼") : " ↕"}
                          </span>
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort("warganegara")} 
                        className="py-2.5 px-4 cursor-pointer hover:bg-slate-800 select-none transition"
                        title="Klik untuk susun mengikut Warganegara"
                      >
                        <div className="flex items-center gap-1">
                          Warganegara
                          <span className="text-[10px] text-teal-400">
                            {sortField === "warganegara" ? (sortDirection === "asc" ? " ▲" : " ▼") : " ↕"}
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((st, i) => (
                        <tr key={st.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-2 px-4 text-center text-slate-500 font-mono">{i + 1}</td>
                          <td className="py-2 px-4 font-semibold text-slate-800">{st.tingkatan}</td>
                          <td className="py-2 px-4 text-slate-700">{st.kelas}</td>
                          <td className="py-2 px-4 font-medium text-slate-900 font-mono tracking-tight">{st.nama}</td>
                          <td className="py-2 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              st.jantina === "L" ? "bg-sky-50 text-sky-802" : "bg-pink-50 text-pink-802"
                            }`}>
                              {st.jantina}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-center text-slate-655 font-medium">{st.kaum}</td>
                          <td className="py-2 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              st.agama === "Islam" ? "bg-emerald-50 text-emerald-802" : "bg-slate-100 text-slate-652"
                            }`}>
                              {st.agama}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-slate-500 font-mono">{st.warganegara || "Warganegara"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                          Tiada rekod mendaftar memenuhi penapis carian semasa anda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 print:hidden select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[11px] text-slate-450 space-y-1">
          <p className="font-semibold">Sistem Portal Analisis Enrolmen Sekolah Menengah Kebangsaan (KPM)</p>
          <p>Laporan dihasilkan dalam Bahasa Melayu Rasmi. Penyelarasan mematuhi piawaian JPN & PPD.</p>
        </div>
      </footer>

      {/* CUSTOM COLUMN MAPPER MODAL (FOR EXCEL UPLOADS) */}
      {isMappingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in print:hidden select-none">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 max-w-xl w-full shadow-2xl flex flex-col space-y-4 max-h-[90vh]">
            <div className="flex items-center gap-3 border-b border-slate-102 pb-3 flex-shrink-0">
              <div className="p-2.5 bg-indigo-50 text-indigo-650 rounded-xl">
                <Settings2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-md font-bold text-slate-900">Pemeta Lajur Fail Sekolah</h3>
                <p className="text-xs text-slate-504 mt-0.5">
                  Padankan lajur fail Excel/CSV anda dengan medan data pangkalan rasmi sekolah.
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1 text-xs">
              {/* KAD INTERAKTIF: PROFIL & LOGO SEKOLAH (HASIL IMBASAN) */}
              <div id="school-interactive-profile-card" className="p-4 bg-slate-50 border border-slate-205 rounded-xl space-y-4 shadow-sm relative overflow-hidden transition-all duration-200 hover:border-slate-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-12 -mt-12 opacity-40 pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-[10px] text-indigo-700 tracking-wider">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>PROFIL & LOGO SEKOLAH (MAKLUMAT IMBASAN)</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[9px] uppercase tracking-wide flex items-center gap-1 select-none">
                    <Check className="w-2.5 h-2.5" /> Auto-Detected
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch select-none">
                  {/* Left Column: School Logo Upload Drag-Drop box */}
                  <div className="flex flex-col items-center justify-center w-full sm:w-1/3 min-h-[120px] bg-white border border-slate-200 hover:border-slate-350 rounded-xl p-3 relative cursor-pointer text-center group transition"
                       onClick={() => logoInputRef.current?.click()}
                       onDragEnter={handleLogoDrag}
                       onDragOver={handleLogoDrag}
                       onDragLeave={handleLogoDrag}
                       onDrop={handleLogoDrop}
                  >
                    <input 
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    
                    {schoolLogo ? (
                      <div className="flex flex-col items-center justify-center h-full w-full relative">
                        <img 
                          id="school-modal-logo-preview"
                          src={schoolLogo} 
                          alt="Logo Preview" 
                          className="w-16 h-16 object-contain rounded-lg p-1 bg-slate-50 border border-slate-200"
                        />
                        <button 
                          id="btn-remove-logo"
                          onClick={(e) => removeLogo(e)}
                          className="absolute -top-1 -right-1 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 p-1 rounded-full shadow-md transition"
                          title="Hapus Logo"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[9px] text-slate-400 font-medium mt-1.5 block group-hover:text-indigo-600 transition">Klik untuk tukar</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-1">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-semibold text-slate-600 mt-2">Muat Naik Logo</p>
                        <p className="text-[8px] text-slate-400 mt-0.5">Seret & lepas imej di sini</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Editable School Metadata Input fields */}
                  <div className="flex-1 grid grid-cols-1 gap-3.5 select-text text-left">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-600 text-[11px] flex items-center gap-1 mb-0.5">
                          <School className="w-3.5 h-3.5 text-slate-450" /> Nama Sekolah <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[9px] text-slate-400 italic">Dikesan dari baris atas fail</span>
                      </div>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="text-xs bg-white border border-slate-300 p-2.5 rounded-xl hover:border-slate-450 focus:border-indigo-505 focus:ring-1 focus:ring-indigo-505 focus:outline-none transition font-semibold text-slate-800 shadow-3xs"
                        placeholder="Contoh: SMK Rantau"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-600 text-[11px] flex items-center gap-1 mb-0.5">
                          <Database className="w-3.5 h-3.5 text-slate-450" /> Kod Sekolah (e.g. Kod SPBT) <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[9px] text-slate-400 italic">Dikesan automatik</span>
                      </div>
                      <input
                        type="text"
                        value={schoolCode}
                        onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                        className="text-xs bg-white border border-slate-300 p-2.5 rounded-xl hover:border-slate-450 focus:border-indigo-505 focus:ring-1 focus:ring-indigo-505 focus:outline-none transition font-semibold text-slate-800 uppercase tracking-widest shadow-3xs"
                        placeholder="Contoh: NEE4099"
                      />
                    </div>
                  </div>
                </div>

                {/* Info status feedback block */}
                <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-lg text-[10px] text-indigo-805 leading-relaxed flex items-start gap-2 select-text text-left">
                  <Check className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold font-sans">Analisis Imbasan:</span> Nama sekolah dikesan sebagai <strong className="text-indigo-900">"{schoolName}"</strong> dengan kod <strong className="text-indigo-900">"{schoolCode}"</strong> dari fail <strong className="text-slate-700">"{fileName}"</strong>. Sila semak profil di atas sebelum bersetuju dengan pemetaan lajur.
                  </div>
                </div>
              </div>

              {/* Mapper Fields */}
              <div className="grid grid-cols-1 gap-3">
                {/* 1. Tingkatan */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition">
                  <label className="font-bold text-slate-805 sm:w-1/3">Tingkatan / Form <span className="text-rose-502">*</span></label>
                  <select
                    value={columnMapping.tingkatan}
                    onChange={(e) => setColumnMapping({ ...columnMapping, tingkatan: e.target.value })}
                    className="flex-1 text-xs bg-white border border-slate-350 p-2.5 rounded-xl max-w-xs focus:outline-none focus:border-indigo-505 cursor-pointer"
                  >
                    <option value="">-- PILIH LAJUR SILA --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* 2. Kelas */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition">
                  <label className="font-bold text-slate-805 sm:w-1/3">Kelas / Class <span className="text-rose-502">*</span></label>
                  <select
                    value={columnMapping.kelas}
                    onChange={(e) => setColumnMapping({ ...columnMapping, kelas: e.target.value })}
                    className="flex-1 text-xs bg-white border border-slate-350 p-2.5 rounded-xl max-w-xs focus:outline-none focus:border-indigo-505 cursor-pointer"
                  >
                    <option value="">-- PILIH LAJUR SILA --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* 3. Jantina */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition">
                  <label className="font-bold text-slate-805 sm:w-1/3">Jantina / Sex <span className="text-rose-502">*</span></label>
                  <select
                    value={columnMapping.jantina}
                    onChange={(e) => setColumnMapping({ ...columnMapping, jantina: e.target.value })}
                    className="flex-1 text-xs bg-white border border-slate-350 p-2.5 rounded-xl max-w-xs focus:outline-none focus:border-indigo-505 cursor-pointer"
                  >
                    <option value="">-- PILIH LAJUR SILA --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* 4. Guru Kelas */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition">
                  <label className="font-bold text-slate-705 sm:w-1/3">Nama Guru Kelas <span className="text-slate-401 text-[10px] font-normal">(Opsional)</span></label>
                  <select
                    value={columnMapping.guruKelas}
                    onChange={(e) => setColumnMapping({ ...columnMapping, guruKelas: e.target.value })}
                    className="flex-1 text-xs bg-white border border-slate-355 p-2.5 rounded-xl max-w-xs focus:outline-none cursor-pointer"
                  >
                    <option value="">-- TIADA / PENJANAAN AUTOMATIK --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* 5. Nama Murid */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition">
                  <label className="font-bold text-slate-705 sm:w-1/3">Nama Murid / Name <span className="text-slate-401 text-[10px] font-normal">(Opsional)</span></label>
                  <select
                    value={columnMapping.nama}
                    onChange={(e) => setColumnMapping({ ...columnMapping, nama: e.target.value })}
                    className="flex-1 text-xs bg-white border border-slate-355 p-2.5 rounded-xl max-w-xs focus:outline-none cursor-pointer"
                  >
                    <option value="">-- TIADA / NOMBOR URUT --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* 6. Kaum */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition">
                  <label className="font-bold text-slate-805 sm:w-1/3">Kaum / Race</label>
                  <select
                    value={columnMapping.kaum}
                    onChange={(e) => setColumnMapping({ ...columnMapping, kaum: e.target.value })}
                    className="flex-1 text-xs bg-white border border-slate-350 p-2.5 rounded-xl max-w-xs focus:outline-none focus:border-indigo-505 cursor-pointer"
                  >
                    <option value="">-- TIADA LAJUR --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* 7. Agama */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition">
                  <label className="font-bold text-slate-805 sm:w-1/3">Agama / Religion</label>
                  <select
                    value={columnMapping.agama}
                    onChange={(e) => setColumnMapping({ ...columnMapping, agama: e.target.value })}
                    className="flex-1 text-xs bg-white border border-slate-350 p-2.5 rounded-xl max-w-xs focus:outline-none focus:border-indigo-505 cursor-pointer"
                  >
                    <option value="">-- TIADA LAJUR --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* 8. Warganegara */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition">
                  <label className="font-bold text-slate-705 sm:w-1/3">Warganegara</label>
                  <select
                    value={columnMapping.warganegara || ""}
                    onChange={(e) => setColumnMapping({ ...columnMapping, warganegara: e.target.value })}
                    className="flex-1 text-xs bg-white border border-slate-355 p-2.5 rounded-xl max-w-xs focus:outline-none cursor-pointer"
                  >
                    <option value="">-- AUTO-WARGANEGARA --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Controller */}
            <div className="pt-4 border-t border-slate-102 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setIsMappingModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleApplyMapping}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow shadow-xs transition rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                Jana Analisis Roster
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
