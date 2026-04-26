'use client';

import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileText, Download } from 'lucide-react';
import { HourlyProduction, Problem, KPISummary } from '@/types';

const DEFAULT_MODEL = '13576-Z';

interface ExportSectionProps {
  machineCode: string;
  date: string;
  leaderName: string;
  supervisorName: string;
  shift: string;
  model: string;
  dailyGoal: number;
  hourlyData: HourlyProduction[];
  problems: Problem[];
  kpis: KPISummary;
}

export default function ExportSection({
  machineCode,
  date,
  leaderName,
  supervisorName,
  shift,
  model = DEFAULT_MODEL,
  dailyGoal,
  hourlyData,
  problems,
  kpis,
}: ExportSectionProps) {
  const exportToPDF = async () => {
    const element = document.getElementById('board-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Tablero_${machineCode}_${date}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error al exportar PDF');
    }
  };

  const exportToWord = () => {
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Tablero ${machineCode} - ${date}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #1f2937; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
            th { background-color: #1f2937; color: white; }
            .section { margin: 20px 0; }
            .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            .kpi-item { border: 1px solid #d1d5db; padding: 10px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Tablero de Producción ${machineCode}</h1>
          <div class="section">
            <h2>Información del Turno</h2>
            <p><strong>Fecha:</strong> ${date}</p>
            <p><strong>Líder:</strong> ${leaderName}</p>
            <p><strong>Supervisor:</strong> ${supervisorName}</p>
            <p><strong>Turno:</strong> ${shift}</p>
            <p><strong>Modelo:</strong> ${model}</p>
            <p><strong>Meta del Día:</strong> ${dailyGoal}</p>
          </div>
          
          <div class="section">
            <h2>Datos de Producción por Hora</h2>
            <table>
              <tr>
                <th>Hora</th>
                <th>Plan</th>
                <th>Real</th>
                <th>Acum. Plan</th>
                <th>Acum. Real</th>
                <th>Efic. Hora</th>
                <th>Efic. Acum</th>
              </tr>
              ${hourlyData
                .map(
                  (h) => `
                <tr>
                  <td>${h.hour}:00</td>
                  <td>${h.plan}</td>
                  <td>${h.actual}</td>
                  <td>${h.accumulated_plan}</td>
                  <td>${h.accumulated_actual}</td>
                  <td>${h.efficiency_hour.toFixed(2)}%</td>
                  <td>${h.efficiency_accumulated.toFixed(2)}%</td>
                </tr>
              `
                )
                .join('')}
            </table>
          </div>

          <div class="section">
            <h2>KPIs Principales</h2>
            <div class="kpi-grid">
              <div class="kpi-item">
                <strong>Total Plan</strong><br>${kpis.total_plan}
              </div>
              <div class="kpi-item">
                <strong>Total Real</strong><br>${kpis.total_actual}
              </div>
              <div class="kpi-item">
                <strong>Cumplimiento</strong><br>${kpis.goal_achievement.toFixed(2)}%
              </div>
              <div class="kpi-item">
                <strong>Eficiencia</strong><br>${kpis.total_efficiency.toFixed(2)}%
              </div>
              <div class="kpi-item">
                <strong>Minutos Perdidos</strong><br>${kpis.total_minutes_lost}
              </div>
              <div class="kpi-item">
                <strong>Diferencia Meta</strong><br>${kpis.goal_difference}
              </div>
            </div>
          </div>

          ${
            problems.length > 0
              ? `
            <div class="section">
              <h2>Incidencias Reportadas</h2>
              <table>
                <tr>
                  <th>Hora</th>
                  <th>Descripción</th>
                  <th>Responsable</th>
                  <th>Minutos Perdidos</th>
                  <th>Acción Correctiva</th>
                </tr>
                ${problems
                  .map(
                    (p) => `
                  <tr>
                    <td>${p.hour}:00</td>
                    <td>${p.description}</td>
                    <td>${p.responsible}</td>
                    <td>${p.minutes_lost}</td>
                    <td>${p.corrective_action}</td>
                  </tr>
                `
                  )
                  .join('')}
              </table>
            </div>
          `
              : ''
          }
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tablero_${machineCode}_${date}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="button-group">
      <button onClick={exportToPDF} className="primary flex items-center gap-2">
        <FileText size={18} />
        Exportar PDF
      </button>
      <button onClick={exportToWord} className="secondary flex items-center gap-2">
        <Download size={18} />
        Exportar Word
      </button>
    </div>
  );
}
