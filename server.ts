import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json({ limit: "15mb" }));

const PORT = 3000;

// Lazy initialize Gemini client to avoid crashes if API key is not present initially
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// API endpoint to analyze student demographics
app.post("/api/analyze-gemini", async (req: express.Request, res: express.Response) => {
  try {
    const client = getGeminiClient();
    const dataSummary = req.body;

    if (!client) {
      return res.status(200).json({
        success: false,
        message: "GEMINI_API_KEY belum dikonfigurasi atau tidak sah dalam Secrets. Sila konfigurasikan untuk mengaktifkan Rumusan Intektual AI.",
        analysis: null
      });
    }

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

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      }
    });

    res.json({
      success: true,
      analysis: response.text
    });
  } catch (error: any) {
    console.error("Gemini server error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Ralat berlaku semasa pemprosesan fail oleh Gemini."
    });
  }
});

// Setup server with Vite or static assets depending on environment
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running in ${process.env.NODE_ENV || "development"} mode on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
