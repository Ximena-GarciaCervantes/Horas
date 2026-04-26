'use client';

import React from 'react';
import { KPISummary } from '@/types';

interface KPISectionProps {
  kpis: KPISummary;
  dailyGoal: number;
}

export default function KPISection({ kpis, dailyGoal }: KPISectionProps) {
  const getKPIColor = (value: number, threshold: number = 95): string => {
    if (value >= threshold) return 'bg-rk-green';
    if (value >= 80) return 'bg-yellow-400';
    return 'bg-rk-red';
  };

  const kpiItems = [
    {
      label: 'Total Plan',
      value: kpis.total_plan,
      unit: 'pcs',
      color: 'bg-blue-500',
    },
    {
      label: 'Total Real',
      value: kpis.total_actual,
      unit: 'pcs',
      color: getKPIColor(kpis.goal_achievement),
    },
    {
      label: 'Cumplimiento Total',
      value: kpis.goal_achievement,
      unit: '%',
      color: getKPIColor(kpis.goal_achievement),
    },
    {
      label: 'Eficiencia',
      value: kpis.total_efficiency,
      unit: '%',
      color: getKPIColor(kpis.total_efficiency),
    },
    {
      label: 'Minutos Perdidos',
      value: kpis.total_minutes_lost,
      unit: 'min',
      color: 'bg-rk-gray',
    },
    {
      label: 'Diferencia Meta',
      value: kpis.goal_difference,
      unit: 'pcs',
      color: kpis.goal_difference >= 0 ? 'bg-rk-green' : 'bg-rk-red',
    },
  ];

  return (
    <div className="card-shell mt-4">
      <h3 className="section-heading">Indicadores del Turno</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiItems.map((item) => (
          <div
            key={item.label}
            className={`${item.color} text-white p-4 rounded-md shadow-sm`}
          >
            <p className="text-xs font-semibold opacity-90 mb-1">{item.label}</p>
            <p className="text-2xl font-bold leading-none">
              {item.value}
              <span className="text-sm ml-1">{item.unit}</span>
            </p>
            {item.label === 'Diferencia Meta' && (
              <p className="text-[11px] opacity-80 mt-2">Meta: {dailyGoal} pcs</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
