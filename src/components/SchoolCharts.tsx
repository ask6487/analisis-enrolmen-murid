import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { OverallSummary, FormStats } from "../types";

interface SchoolChartsProps {
  summary: OverallSummary;
  formStats: FormStats[];
}

export default function SchoolCharts({ summary, formStats }: SchoolChartsProps) {
  // 1. Race/Kaum Data
  const raceData = Object.entries(summary.raceStats).map(([key, value]) => ({
    name: key,
    value: value.Total,
    percentage: value.Pct
  }));

  const RACE_COLORS: { [key: string]: string } = {
    "Melayu": "#0d9488", // Teal
    "Cina": "#e11d48",   // Rose / Coral Red
    "India": "#f97316",  // Amber / Saffron
    "Lain-lain": "#6366f1" // Indigo / Lavender-blue
  };

  // 2. Gender Data
  const genderData = [
    { name: "Lelaki", value: summary.totalBoys, color: "#0ea5e9" }, // Sky Blue
    { name: "Perempuan", value: summary.totalGirls, color: "#ec4899" } // Hot Pink
  ];

  // 3. Religion Data
  const religionData = Object.entries(summary.religionStats).map(([key, value]) => ({
    name: key,
    value: value.Total,
    percentage: value.Pct
  }));

  const RELIGION_COLORS: { [key: string]: string } = {
    "Islam": "#059669",      // Emerald Green
    "Bukan Islam": "#8b5cf6" // Amethyst Purple
  };

  // 4. Enrollment by Form
  const formEnrollmentData = summary.formDetails.map(f => ({
    name: f.name,
    "Jumlah Murid": f.studentCount,
    "Rerata Bilangan": f.avgPerClass
  }));

  // 5. Enrollment by Class
  const classEnrollmentData: { name: string; "Jumlah Murid": number; form: string }[] = [];
  formStats.forEach(form => {
    form.classes.forEach(c => {
      classEnrollmentData.push({
        name: c.kelas,
        "Jumlah Murid": c.jumlah,
        form: form.tingkatan
      });
    });
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10 print:grid-cols-2 print:gap-3.5 print:mt-1.5">
      {/* Carta Pai Kaum */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex flex-col h-[400px] print:h-[185px] print:p-2.5 print:rounded-xl print:border-slate-300">
        <h3 className="text-md font-semibold text-slate-800 mb-4 border-l-4 border-teal-500 pl-3 print:text-[10px] print:mb-1 print:pl-1.5 print:border-l-2">
          1. Carta Pai Komposisi Kaum
        </h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={raceData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percentage }) => `${name} (${percentage}%)`}
              >
                {raceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={RACE_COLORS[entry.name] || "#64748b"} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any, props: any) => [
                  `${value} Murid (${props.payload.percentage}%)`, 
                  name
                ]} 
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Carta Pai Jantina */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex flex-col h-[400px] print:h-[185px] print:p-2.5 print:rounded-xl print:border-slate-300">
        <h3 className="text-md font-semibold text-slate-800 mb-4 border-l-4 border-sky-500 pl-3 print:text-[10px] print:mb-1 print:pl-1.5 print:border-l-2">
          2. Carta Pai Pembahagian Jantina
        </h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="45%"
                innerRadius={0}
                outerRadius={90}
                dataKey="value"
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
              >
                {genderData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} Murid`} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Carta Pai Agama */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex flex-col h-[400px] print:h-[185px] print:p-2.5 print:rounded-xl print:border-slate-300">
        <h3 className="text-md font-semibold text-slate-800 mb-4 border-l-4 border-emerald-600 pl-3 print:text-[10px] print:mb-1 print:pl-1.5 print:border-l-2">
          3. Carta Pai Kategori Agama
        </h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={religionData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percentage }) => `${name} (${percentage}%)`}
              >
                {religionData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={RELIGION_COLORS[entry.name] || "#475569"} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any, props: any) => [
                  `${value} Murid (${props.payload.percentage}%)`, 
                  name
                ]} 
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Carta Bar Enrolmen Mengikut Tingkatan */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex flex-col h-[400px] print:h-[185px] print:p-2.5 print:rounded-xl print:border-slate-300">
        <h3 className="text-md font-semibold text-slate-800 mb-4 border-l-4 border-indigo-500 pl-3 print:text-[10px] print:mb-1 print:pl-1.5 print:border-l-2">
          4. Carta Bar Enrolmen Mengikut Tingkatan
        </h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={formEnrollmentData}
              margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Jumlah Murid" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
