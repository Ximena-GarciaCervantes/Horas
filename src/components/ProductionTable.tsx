'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { HourlyProduction, Problem } from '@/types';
import { calculateLostMinutes, formatPercentage } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';

interface ProductionTableProps {
  hourlyData: HourlyProduction[];
  problems?: Problem[];
  model?: string;
  onUpdateHour: (
    hour: number,
    plan: number,
    actual: number,
    accumulatedPlan: number,
    accumulatedActual: number,
    yieldPercent: number
  ) => Promise<boolean>;
  onAddProblem: (problem: Omit<Problem, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onDeleteProblem?: (id: string) => void;
  metaFpy?: number;
  metaProductivity?: number;
  readOnly?: boolean;
  startHour?: number;
  endHour?: number;
}

type EditableProductionField = 'plan' | 'actual' | 'yield_percent';

interface ProductionDraft {
  plan: string;
  actual: string;
  yield_percent: string;
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

function inputValueFromNumber(value: number | undefined): string {
  return value && value > 0 ? String(value) : '';
}

function parseInputNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeIntegerInput(value: string): string {
  return value.replace(/\D/g, '');
}

function sanitizeDecimalInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole, ...decimalParts] = cleaned.split('.');

  if (decimalParts.length === 0) {
    return whole;
  }

  return `${whole}.${decimalParts.join('')}`;
}

interface ProblemCellProps {
  hour: number;
  hourProblems: Problem[];
  calculatedLostMinutes: number;
  onAddProblem: (problem: Omit<Problem, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onDeleteProblem?: (id: string) => void;
  readOnly?: boolean;
}

function ProblemCell({
  hour,
  hourProblems,
  calculatedLostMinutes,
  onAddProblem,
  onDeleteProblem,
  readOnly = false,
}: ProblemCellProps) {
  const assignedMinutes = hourProblems.reduce(
    (sum, problem) => sum + (problem.minutes_lost || 0),
    0
  );
  const suggestedMinutes = Math.max(Math.round(calculatedLostMinutes - assignedMinutes), 0);
  const fallbackMinutes = Math.max(Math.round(calculatedLostMinutes), 0);
  const [description, setDescription] = useState('');
  const [minutesLost, setMinutesLost] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'error'>('idle');

  const handleAddProblem = async () => {
    const trimmedDescription = description.trim();
    if (!trimmedDescription) return;

    const parsedMinutes = Number(minutesLost);
    const nextMinutes = Number.isFinite(parsedMinutes) && parsedMinutes > 0
      ? Math.round(parsedMinutes)
      : suggestedMinutes || fallbackMinutes;

    setSaveState('saving');
    const saved = await onAddProblem({
      hour,
      description: trimmedDescription,
      minutes_lost: nextMinutes,
      responsible: '',
      corrective_action: '',
      board_id: '',
    });

    if (saved) {
      setDescription('');
      setMinutesLost('');
      setSaveState('idle');
      return;
    }

    setSaveState('error');
  };

  return (
    <div className="problem-cell">
      {hourProblems.length > 0 && (
        <ul className="problem-list">
          {hourProblems.map((problem) => (
            <li key={problem.id} className="problem-list-item">
              <div>
                <span className="problem-description">{problem.description}</span>
                <span className="problem-minutes"> {problem.minutes_lost} min</span>
              </div>
              {!readOnly && onDeleteProblem && (
                <button
                  type="button"
                  onClick={() => onDeleteProblem(problem.id)}
                  className="problem-delete"
                  title="Eliminar problema"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!readOnly && (
        <>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="problem-input"
            placeholder="Escribe el problema"
            rows={2}
          />

          <div className="problem-actions">
            <label className="problem-minutes-field">
              Min.
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={minutesLost}
                onChange={(e) => setMinutesLost(sanitizeIntegerInput(e.target.value))}
                placeholder={String(suggestedMinutes || fallbackMinutes || 0)}
              />
            </label>
            <button
              type="button"
              onClick={handleAddProblem}
              disabled={!description.trim() || saveState === 'saving'}
              className="problem-add"
              title="Agregar problema"
            >
              <Plus size={15} />
            </button>
          </div>

          {saveState === 'saving' && (
            <div className="problem-save-state">Guardando problema...</div>
          )}
          {saveState === 'error' && (
            <div className="problem-save-state problem-save-error">
              No se pudo guardar. Revisa permisos o conexion.
            </div>
          )}
        </>
      )}

      <div className="problem-summary">
        Calculado: {calculatedLostMinutes.toFixed(1)} min | Asignado: {assignedMinutes} min
      </div>
    </div>
  );
}

export default function ProductionTable({
  hourlyData,
  problems = [],
  model = '13576-Z',
  onUpdateHour,
  onAddProblem,
  onDeleteProblem,
  metaFpy = 0,
  metaProductivity = 0,
  readOnly = false,
  startHour = 18,
  endHour = 6,
}: ProductionTableProps) {
  const [draftRows, setDraftRows] = useState<Record<number, ProductionDraft>>({});
  const [pendingHours, setPendingHours] = useState<Record<number, true>>({});

  const sequentialHours = useMemo(
    () => getSequentialHours(startHour, endHour),
    [startHour, endHour]
  );

  const getRowDraft = useCallback(
    (hour: number): ProductionDraft => {
      const data = hourlyData.find((h) => h.hour === hour);
      return draftRows[hour] || {
        plan: inputValueFromNumber(data?.plan),
        actual: inputValueFromNumber(data?.actual),
        yield_percent: inputValueFromNumber(data?.yield_percent),
      };
    },
    [draftRows, hourlyData]
  );

  const getRowValues = useCallback(
    (hour: number) => {
      const draft = getRowDraft(hour);

      return {
        plan: parseInputNumber(draft.plan),
        actual: parseInputNumber(draft.actual),
        yield_percent: parseInputNumber(draft.yield_percent),
      };
    },
    [getRowDraft]
  );

  const calculateAccumulatedValues = useCallback(
    (hour: number, nextValues = getRowValues(hour)) => {
      let accumulatedPlan = 0;
      let accumulatedActual = 0;

      const hourIndex = sequentialHours.indexOf(hour);

      if (hourIndex !== -1) {
        for (let i = 0; i <= hourIndex; i++) {
          const currentHour = sequentialHours[i];
          const values = currentHour === hour ? nextValues : getRowValues(currentHour);
          accumulatedPlan += values.plan;
          accumulatedActual += values.actual;
        }
      }

      return { accumulatedPlan, accumulatedActual };
    },
    [getRowValues, sequentialHours]
  );

  const commitHour = useCallback(
    async (hour: number): Promise<boolean> => {
      const values = getRowValues(hour);
      const { accumulatedPlan, accumulatedActual } = calculateAccumulatedValues(hour, values);

      return onUpdateHour(
        hour,
        values.plan,
        values.actual,
        accumulatedPlan,
        accumulatedActual,
        values.yield_percent
      );
    },
    [calculateAccumulatedValues, getRowValues, onUpdateHour]
  );

  useEffect(() => {
    if (readOnly || Object.keys(pendingHours).length === 0) return;
    let isActive = true;

    const timeout = setTimeout(() => {
      const hoursToSave = Object.keys(pendingHours).map(Number);

      Promise.all(hoursToSave.map((hour) => commitHour(hour))).then(() => {
        if (!isActive) return;
        setPendingHours({});
      });
    }, 500);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [commitHour, pendingHours, readOnly]);

  const handleInputChange = (
    hour: number,
    field: EditableProductionField,
    rawValue: string
  ) => {
    if (readOnly) return;

    const value =
      field === 'yield_percent'
        ? sanitizeDecimalInput(rawValue)
        : sanitizeIntegerInput(rawValue);

    const currentDraft = getRowDraft(hour);
    const nextDraft = {
      ...currentDraft,
      [field]: value,
    };

    setDraftRows((prev) => ({
      ...prev,
      [hour]: nextDraft,
    }));
    setPendingHours((prev) => ({
      ...prev,
      [hour]: true,
    }));
  };

  const handleInputBlur = async (hour: number) => {
    if (readOnly || !pendingHours[hour]) return;

    await commitHour(hour);
    setPendingHours((prev) => {
      const next = { ...prev };
      delete next[hour];
      return next;
    });
  };

  const getTimeSlots = () => {
    return sequentialHours;
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
            const hourProblems = problems.filter((problem) => problem.hour === hour);
            const draft = getRowDraft(hour);
            const { plan, actual, yield_percent: yieldPercent } = getRowValues(hour);
            const { accumulatedPlan: accPlan, accumulatedActual: accActual } =
              calculateAccumulatedValues(hour);
            const effHour = plan > 0 ? parseFloat(((actual / plan) * 100).toFixed(2)) : 0;
            const effAccum =
              accPlan > 0 ? parseFloat(((accActual / accPlan) * 100).toFixed(2)) : 0;
            const lostMinutes = calculateLostMinutes(plan, actual);
            const accumulatedLostMinutes = sequentialHours
              .slice(0, index + 1)
              .reduce((sum, currentHour) => {
                const currentValues = getRowValues(currentHour);
                return sum + calculateLostMinutes(currentValues.plan, currentValues.actual);
              }, 0);

            const productivityTarget = metaProductivity > 0 ? metaProductivity : 95;
            const fpyTarget = metaFpy > 0 ? metaFpy : 95;
            const effHourClass = effHour >= productivityTarget ? 'val-good' : effHour > 0 ? 'val-bad' : 'val-neutral';
            const yieldClass = yieldPercent >= fpyTarget ? 'val-good' : yieldPercent > 0 ? 'val-bad' : 'val-neutral';

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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={draft.plan}
                      onChange={(e) => handleInputChange(hour, 'plan', e.target.value)}
                      onBlur={() => handleInputBlur(hour)}
                      placeholder="NSR"
                      style={{ marginBottom: '4px' }}
                      readOnly={readOnly}
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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={draft.actual}
                      onChange={(e) => handleInputChange(hour, 'actual', e.target.value)}
                      onBlur={() => handleInputBlur(hour)}
                      placeholder="NSR"
                      style={{ marginBottom: '4px' }}
                      readOnly={readOnly}
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
                    inputMode="decimal"
                    value={draft.yield_percent}
                    onChange={(e) => handleInputChange(hour, 'yield_percent', e.target.value)}
                    onBlur={() => handleInputBlur(hour)}
                    placeholder="NSR"
                    className={yieldClass}
                    style={{ border: 'none', background: 'transparent', textAlign: 'center' }}
                    readOnly={readOnly}
                  />
                </td>

                {/* Celda Minutos Perdidos */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <span className="lost-minutes">{lostMinutes.toFixed(1)}</span>
                    <span className="lost-minutes-accum">{accumulatedLostMinutes.toFixed(1)}</span>
                  </div>
                </td>

                {/* Celda Problemas */}
                <td style={{ textAlign: 'left', verticalAlign: 'top', padding: '4px' }}>
                  <ProblemCell
                    hour={hour}
                    hourProblems={hourProblems}
                    calculatedLostMinutes={lostMinutes}
                    onAddProblem={onAddProblem}
                    onDeleteProblem={onDeleteProblem}
                    readOnly={readOnly}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
