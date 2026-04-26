'use client';

import React from 'react';
import { HourlyProduction, Problem } from '@/types';
import { calculateLostMinutes, formatPercentage } from '@/lib/utils';

interface ProductionTableProps {
  hourlyData: HourlyProduction[];
  problems?: Problem[];
  model?: string;
  onUpdateHour: (
    hour: number,
    plan: number,
    actual: number,
    accumulatedPlan: number,
    accumulatedActual: number
  ) => void;
  startHour?: number;
  endHour?: number;
}

// Helper function to format hour range (e.g., 1800-1900)
function formatHourRange(hour: number): string {
  const nextHour = hour === 23 ? 0 : hour + 1;
  return `${String(hour).padStart(2, '0')}:00 - ${String(nextHour).padStart(2, '0')}:00`;
}

// Helper function to get sequential hours including overnight wrap
function getSequentialHours(startHour: number, endHour: number): number[] {
  const hours: number[] = [];
  if (startHour <= endHour) {
    // Normal range; endHour is exclusive so 6-7 is not shown when the shift ends at 6.
    for (let i = startHour; i < endHour; i++) {
      hours.push(i);
    }
  } else {
    // Overnight wrap (e.g., 18 to 6 next day)
    for (let i = startHour; i <= 23; i++) {
      hours.push(i);
    }
    for (let i = 0; i < endHour; i++) {
      hours.push(i);
    }
  }
  return hours;
}

export default function ProductionTable({
  hourlyData,
  problems = [],
  model = '13576-Z',
  onUpdateHour,
  startHour = 18,
  endHour = 6,
}: ProductionTableProps) {
  const handleInputChange = (
    hour: number,
    field: 'plan' | 'actual',
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    const hourData = hourlyData.find((h) => h.hour === hour) || {
      hour,
      plan: 0,
      actual: 0,
      accumulated_plan: 0,
      accumulated_actual: 0,
      efficiency_hour: 0,
      efficiency_accumulated: 0,
    };

    const updatedPlan = field === 'plan' ? numValue : hourData.plan;
    const updatedActual = field === 'actual' ? numValue : hourData.actual;

    // Calculate accumulateds
    let accumulatedPlan = 0;
    let accumulatedActual = 0;

    const sequentialHours = getSequentialHours(startHour, endHour);
    const hourIndex = sequentialHours.indexOf(hour);
    
    if (hourIndex !== -1) {
      // Include all hours from start up to and including current hour
      for (let i = 0; i <= hourIndex; i++) {
        const h = sequentialHours[i];
        const data = hourlyData.find((hd) => hd.hour === h);
        if (h === hour) {
          accumulatedPlan += updatedPlan;
          accumulatedActual += updatedActual;
        } else {
          accumulatedPlan += data?.plan || 0;
          accumulatedActual += data?.actual || 0;
        }
      }
    }

    onUpdateHour(hour, updatedPlan, updatedActual, accumulatedPlan, accumulatedActual);
  };

  const getTimeSlots = () => {
    return getSequentialHours(startHour, endHour);
  };

  return (
    <div className="table-shell">
      <table className="production-table">
        <thead>
          <tr>
            <th style={{ width: '10%' }}>Hora</th>
            <th style={{ width: '10%' }}>Modelo</th>
            <th style={{ width: '10%' }}>
              Plan <br /> <span style={{ fontSize: '0.85rem' }}>Hr. Acum</span>
            </th>
            <th style={{ width: '10%' }}>
              Actual <br /> <span style={{ fontSize: '0.85rem' }}>Hr. Acum</span>
            </th>
            <th style={{ width: '10%' }}>
              % <br /> Productividad
            </th>
            <th style={{ width: '10%' }}>
              % <br /> Yield
            </th>
            <th style={{ width: '10%' }}>
              Min. <br /> Perdidos
            </th>
            <th style={{ width: '30%' }}>Problemas</th>
          </tr>
        </thead>
        <tbody>
          {getTimeSlots().map((hour, index) => {
            const data = hourlyData.find((h) => h.hour === hour);
            const hourProblems = problems.filter((problem) => problem.hour === hour);
            const plan = data?.plan || 0;
            const actual = data?.actual || 0;
            const accPlan = data?.accumulated_plan || 0;
            const accActual = data?.accumulated_actual || 0;
            const effHour = data?.efficiency_hour || 0;
            const effAccum = data?.efficiency_accumulated || 0;
            const lostMinutes = calculateLostMinutes(plan, actual);
            const accumulatedLostMinutes = getSequentialHours(startHour, endHour)
              .slice(0, index + 1)
              .reduce((sum, currentHour) => {
                const currentData = hourlyData.find((hd) => hd.hour === currentHour);
                const currentPlan = currentData?.plan || 0;
                const currentActual = currentData?.actual || 0;
                return sum + calculateLostMinutes(currentPlan, currentActual);
              }, 0);

            const effHourClass = effHour >= 95 ? 'val-good' : effHour > 0 ? 'val-bad' : 'val-neutral';

            return (
              <tr key={hour} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                {/* Celda Hora */}
                <td style={{ fontWeight: 'bold' }} className="font-mono">
                  {formatHourRange(hour)}
                </td>

                {/* Celda Modelo */}
                <td style={{ textAlign: 'center' }}>
                  <input value={model} readOnly style={{ border: 'none', background: 'transparent', textAlign: 'center' }} />
                </td>

                {/* Celda Plan + Acumulado */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <input
                      type="number"
                      value={plan || ''}
                      onChange={(e) => handleInputChange(hour, 'plan', e.target.value)}
                      placeholder="NSR"
                      style={{ marginBottom: '4px' }}
                    />
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'center' }}>
                      {accPlan > 0 ? accPlan : ''}
                    </div>
                  </div>
                </td>

                {/* Celda Actual + Acumulado */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <input
                      type="number"
                      value={actual || ''}
                      onChange={(e) => handleInputChange(hour, 'actual', e.target.value)}
                      placeholder="NSR"
                      style={{ marginBottom: '4px' }}
                    />
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'center' }}>
                      {accActual > 0 ? accActual : ''}
                    </div>
                  </div>
                </td>

                {/* Celda Productividad */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <span className={effHourClass} style={{ fontWeight: 'bold' }}>
                      {effHour > 0 ? formatPercentage(effHour) : 'NSR'}
                    </span>
                    {effAccum > 0 && (
                      <span style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        {formatPercentage(effAccum)}
                      </span>
                    )}
                  </div>
                </td>

                {/* Celda Yield */}
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="text"
                    placeholder="NSR"
                    style={{ border: 'none', background: 'transparent', textAlign: 'center' }}
                  />
                </td>

                {/* Celda Minutos Perdidos */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>{lostMinutes.toFixed(1)}</span>
                    <span style={{ fontSize: '0.85rem', marginTop: '4px' }}>{accumulatedLostMinutes.toFixed(1)}</span>
                  </div>
                </td>

                {/* Celda Problemas */}
                <td style={{ textAlign: 'left', verticalAlign: 'top', padding: '4px' }}>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {hourProblems.length === 0 ? (
                      <span style={{ color: '#999' }}>Sin problemas</span>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: '18px', listStyleType: 'disc' }}>
                        {hourProblems.map((problem) => (
                          <li key={problem.id} style={{ marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700 }}>{problem.description}</span>
                            <span style={{ color: '#666' }}> - {problem.minutes_lost} min</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
