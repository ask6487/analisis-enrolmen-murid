import React, { useState } from "react";
import { Sparkles, Loader2, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { OverallSummary } from "../types";

interface ExecutiveSummaryProps {
  summary: OverallSummary;
}

export default function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Rule-Based summary calculations
  const totalStudents = summary.totalOverall;
  const avgClassSize = (summary.totalOverall / (summary.classCount || 1)).toFixed(2);
  
  // Find largest and smallest form
  const sortedForms = [...summary.formDetails].sort((a, b) => b.studentCount - a.studentCount);
  const largestForm = sortedForms[0]?.name || "-";
  const largestFormCount = sortedForms[0]?.studentCount || 0;
  const smallestForm = sortedForms[sortedForms.length - 1]?.name || "-";
  const smallestFormCount = sortedForms[sortedForms.length - 1]?.studentCount || 0;

  // Majorities
  const sortedRaces = Object.entries(summary.raceStats).sort((a, b) => b[1].Total - a[1].Total);
  const majorityRace = sortedRaces[0]?.[0] || "-";
  const majorityRacePct = sortedRaces[0]?.[1].Pct || 0;
  const minorityRace = sortedRaces[sortedRaces.length - 1]?.[0] || "-";

  const sortedReligions = Object.entries(summary.religionStats).sort((a, b) => b[1].Total - a[1].Total);
  const majorityReligion = sortedReligions[0]?.[0] || "-";
  const majorityReligionPct = sortedReligions[0]?.[1].Pct || 0;

  // Detect imbalances
  const imbalances: string[] = [];
  const boyPct = summary.genderStats.boyPct;
  const girlPct = summary.genderStats.girlPct;
  if (Math.abs(boyPct - girlPct) > 10) {
    imbalances.push(
      `Terdapat perbezaan ketara dalam taburan jantina murid keseluruhan, di mana murid ${
        boyPct > girlPct ? "Lelaki" : "Perempuan"
      } merangkumi ${Math.max(boyPct, girlPct)}% manakala murid ${
        boyPct > girlPct ? "Perempuan" : "Lelaki"
      } hanya merangkumi ${Math.min(boyPct, girlPct)}%.`
    );
  }

  // Check for any highly congested classes (>35 pupils) or micro-classes (<15 pupils)
  let congestedCount = 0;
  let microCount = 0;
  summary.formDetails.forEach(f => {
    if (f.maxClass.count > 34) congestedCount++;
    if (f.minClass.count < 15) microCount++;
  });

  if (congestedCount > 0) {
    imbalances.push(
      `Dikesan beberapa bilik darjah yang mempunyai kepadatan tinggi melebihi 34 orang murid, yang memerlukan pemantauan dari segi ruang fizikal dan pengurusan kelas.`
    );
  }
  if (microCount > 0) {
    imbalances.push(
      `Dikesan kelas mikro dengan bilangan kurang daripada 15 murid. Keadaan ini memberikan nisbah guru-murid yang sangat kondusif namun mencabar agihan sumber guru secara optimum.`
    );
  }

  if (imbalances.length === 0) {
    imbalances.push(
      "Agihan murid secara amnya adalah seimbang merentasi jantina dan tiada bilik darjah dikesan mengalami kepadatan yang kritikal (antara 15 hingga 33 murid per kelas)."
    );
  }

  // Local rule-based summary builder
  const ruleBasedText = `Laporan enrolmen murid ini membentangkan data komprehensif bagi sekolah dengan jumlah keseluruhan seramai **${totalStudents}** murid yang berdaftar secara sah merentasi **${summary.formCount}** peringkat tingkatan dan **${summary.classCount}** bilik darjah secara fizikal. Purata kepadatan murid adalah sebanyak **${avgClassSize}** murid bagi setiap kelas, yang membuktikan struktur pengurusan kelas berada dalam lingkungan nisbah standard Guru-Murid Kementerian Pendidikan Malaysia.

Analisis taburan tingkatan menunjukkan bahawa kumpulan murid terbesar berdaftar di peringkat **Tingkatan ${largestForm}** dengan kekuatan seramai **${largestFormCount}** murid. Sebaliknya, enrolmen terkecil dikesan pada peringkat **Tingkatan ${smallestForm}** yang mencatatkan seramai **${smallestFormCount}** murid. Dari aspek taburan jantina, murid lelaki merangkumi **${boyPct}%** (${summary.totalBoys} orang) manakala murid perempuan adalah sebanyak **${girlPct}%** (${summary.totalGirls} orang), menghasilkan nisbah jantina sekolah pada kadar **${summary.genderStats.ratio}**.

**Analisis Keseimbangan & Implikasi Bilik Darjah:**
${imbalances.map(i => `* ${i}`).join("\n")}`;

  // Call server to trigger server-side Gemini processing
  const handleGenerateAiReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalOverall: summary.totalOverall,
          totalBoys: summary.totalBoys,
          totalGirls: summary.totalGirls,
          raceStats: summary.raceStats,
          religionStats: summary.religionStats,
          genderStats: summary.genderStats,
          formDetails: summary.formDetails
        })
      });

      const data = await response.json();
      if (response.ok) {
        if (data.success && data.analysis) {
          setAiReport(data.analysis);
        } else {
          // Key mapping not found or server handled custom warning
          setError(data.message || "Ralat pelayan Gemini.");
        }
      } else {
        setError("Gagal menghubungi pelayan analisis. Sila pastikan pelayan berjalan lancar.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Ralat sambungan rangkaian atau pelayan gagal bertindak balas.");
    } finally {
      setIsLoading(false);
    }
  };

  // Small helper to parse simple markdown bold and bullet lines to styled HTML elements
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2 print:h-1" />;

      // Headers like ### or ##
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-slate-800 mt-4 mb-2 print:text-[10px] print:mt-1.5 print:mb-0.5">
            {trimmed.replace(/^###\s*/, "")}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="text-md font-semibold text-teal-800 mt-4 mb-2 border-b pb-1 print:text-[10px] print:mt-1.5 print:mb-0.5 print:pb-0.5">
            {trimmed.replace(/^##\s*/, "")}
          </h3>
        );
      }
      if (trimmed.startsWith("#")) {
        return (
          <h2 key={idx} className="text-lg font-bold text-slate-900 mt-5 mb-3 print:text-[11px] print:mt-2 print:mb-1">
            {trimmed.replace(/^#\s*/, "")}
          </h2>
        );
      }

      // Bullet points
      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        const content = trimmed.replace(/^[\*\-]\s*/, "");
        return (
          <li key={idx} className="ml-5 list-disc text-slate-650 text-sm leading-relaxed mb-1.5 print:text-[9.5px] print:leading-normal print:mb-0.5 print:ml-4">
            {parseBoldText(content)}
          </li>
        );
      }

      // Standard paragraphs
      return (
        <p key={idx} className="text-slate-650 text-sm leading-relaxed mb-3 print:text-[9.5px] print:leading-normal print:mb-1">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="mt-8 space-y-6 print:mt-2 print:space-y-2">
      {/* Rumusan Manual Rule-Based */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm print:bg-transparent print:p-0 print:border-none print:shadow-none print:mt-2">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 print:mb-2 print:pb-1">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-slate-100 rounded-lg text-slate-700 print:hidden">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-md font-semibold text-slate-800 print:text-[11px] print:font-bold">
                Bahagian 6: Rumusan Eksekutif Sekolah (Laporan Rasmi)
              </h3>
              <p className="text-xs text-slate-500 print:hidden">
                Rumusan standard berpandukan data enrolmen murid yang dijana mengikut Pekeliling KPM
              </p>
            </div>
          </div>
        </div>

        <div className="prose max-w-none text-slate-700 space-y-1">
          {renderMarkdown(ruleBasedText)}
        </div>
      </div>

      {/* AI Intelligence Assistant */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-indigo-100 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-50/50 pb-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-indigo-100 rounded-lg text-indigo-700 mt-1">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            </span>
            <div>
              <h3 className="text-md font-semibold text-indigo-900 flex items-center gap-2">
                Analisis Pintar AI & Cadangan Intervensi
              </h3>
              <p className="text-xs text-indigo-700 max-w-xl mt-0.5">
                Gunakan kecerdasan buatan Gemini server-side untuk menulis laporan berasaskan dasar pendidikan, mengira beban tugas guru kelas, serta merancang skim agihan bantuan (SPBT/RMT) bersasar.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateAiReport}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm hover:shadow transition disabled:bg-indigo-300 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap self-start md:self-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menganalisis...
              </>
            ) : aiReport ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Jana Semula Analisis AI
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Kognitif AI: Jana Laporan
              </>
            )}
          </button>
        </div>

        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-medium text-indigo-900">Konsultasi AI Sedang Berjalan</p>
              <p className="text-xs text-indigo-505 max-w-xs mt-1 animate-pulse">
                Meneliti nisbah kelas, taburan silang kaum, jantina, serta merumus implikasi kebajikan...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Sistem Mengesan Isu:</p>
              <p className="mt-0.5">{error}</p>
              <p className="mt-1 text-rose-504">
                Sila pastikan fail .env telah mempunyai nilai kunci rahsia <strong>GEMINI_API_KEY</strong> atau tambahkannya di bahagian tab Secrets UI kepingan sampingan AI Studio.
              </p>
            </div>
          </div>
        )}

        {aiReport && !isLoading && (
          <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-inner mt-2 max-h-[500px] overflow-y-auto scrollbar-thin">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                DIKASILKAN OLEH GEMINI AI (SERVER-SIDE PROXY)
              </span>
            </div>
            <div className="prose max-w-none text-slate-700 text-sm">
              {renderMarkdown(aiReport)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
