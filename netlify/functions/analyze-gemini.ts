import { Handler } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

export const handler: Handler = async (event, context) => {
  // CORS parameters
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: "GEMINI_API_KEY belum dikonfigurasi atau tidak sah dalam Secrets/Environment Netlify. Sila konfigurasikan untuk mengaktifkan Rumusan Intelektual AI.",
          analysis: null
        }),
      };
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const dataSummary = JSON.parse(event.body || "{}");
    const {
      totalOverall,
      totalBoys,
      totalGirls,
      formDetails,
      raceStats,
      religionStats,
      genderStats
    } = dataSummary;

    const formattedRace = Object.entries(raceStats || {})
      .map(([k, v]: any) => `* ${k}: Lelaki: ${v.L}, Perempuan: ${v.P}, Jumlah: ${v.Total} (${v.Pct}%)`)
      .join("\n");

    const formattedReligion = Object.entries(religionStats || {})
      .map(([k, v]: any) => `* ${k}: Jumlah: ${v.Total} (${v.Pct}%)`)
      .join("\n");

    const formattedForms = Array.isArray(formDetails) 
      ? formDetails.map((f: any) => `* Tingkatan ${f.name}: ${f.classCount} Kelas, Jumlah Murid: ${f.studentCount} (Purata ${f.avgPerClass} murid/kelas). Kelas Terbesar: ${f.maxClass.name} (${f.maxClass.count} orang), Kelas Terkecil: ${f.minClass.name} (${f.minClass.count} orang).`).join("\n")
      : JSON.stringify(formDetails);

    const prompt = `Anda bertindak sebagai Pegawai Data Pendidikan (Education Data Officer) yang berpengalaman luas di Kementerian Pendidikan Malaysia (KPM).
Sila analisis ringkasan data murid sekolah berikut dan hasilkan sebuah Laporan Rumusan Eksekutif & Cadangan Intervensi dalam Bahasa Melayu rasmi yang sangat profesional.

RINGKASAN DATA ENROLMEN SEKOLAH:
- Jumlah Enrolmen Keseluruhan: ${totalOverall} orang murid
- Taburan Jantina:
  * Murid Lelaki: ${totalBoys} orang (${genderStats?.boyPct || 0}%)
  * Murid Perempuan: ${totalGirls} orang (${genderStats?.girlPct || 0}%)
- Demografi Kaum:
${formattedRace}
- Demografi Agama:
${formattedReligion}
- Taburan Mengikut Tingkatan:
${formattedForms}

TUGASAN PENULISAN (SILA JANA FORMAT MARKDOWN YANG SUSUN RAPI):
1. **RUMUSAN IMPLIKASI DATA**: Berikan analisis mendalam mengenai keseimbangan jantina (nisbah lelaki-perempuan ${genderStats?.ratio || "N/A"}), corak majoriti kaum/agama, dan taburan purata kelas. Nyatakan sebarang ketidakseimbangan atau penumpuan yang dikesan (contohnya, jika ada kelas yang terlalu padat atau terlalu kecil).
2. **IMPLIKASI TERHADAP SUMBER SEKOLAH & GURU**: Jelaskan bagaimanakah data ini memberi kesan kepada pengurusan bilik darjah, agihan beban mengajar guru-guru kelas, serta pengurusan kebajikan (e.g. skim bantuan buku teks SPBT, kad kantin, bantuan awal persekolahan, guru kaunseling).
3. **3 INTERVENSI STRATEGIK PENDIDIKAN**: Berikan tiga (3) rangka tindakan/intervensi konkrit yang boleh diambil oleh Unit Hal Ehwal Murid (HEM) sekolah untuk memanfaatkan atau mengurus dinamika populasi murid ini.

Gunakan reka bentuk bahasa Melayu korporat, penuh hormat, objektif, berwibawa, dan sedia untuk diserahkan kepada pihak pentadbiran kanan sekolah atau Pejabat Pendidikan Daerah (PPD). Elakkan penggunaan jargon bahasa Inggeris melainkan istilah teknikal yang lazim. `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        analysis: response.text
      }),
    };
  } catch (error: any) {
    console.error("Gemini serverless function error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || "Ralat berlaku semasa pemprosesan fail oleh Gemini."
      }),
    };
  }
};
