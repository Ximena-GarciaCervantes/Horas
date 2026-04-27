'use client';

import React from 'react';
import { BoardFormState } from '@/types';

const LINE_OPTIONS = ['315', '314', '313', '312'];
const ENGINEER_NAME = 'Sergio B.';

function sanitizeDecimalInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole, ...decimalParts] = cleaned.split('.');

  if (decimalParts.length === 0) {
    return whole;
  }

  return `${whole}.${decimalParts.join('')}`;
}

interface HeaderBoardProps {
  date: string;
  machineCode: string;
  formState: BoardFormState;
  onFormChange: (field: keyof BoardFormState, value: string | number) => void;
  saveState: 'idle' | 'saving' | 'saved' | 'error';
  readOnly?: boolean;
}

export default function HeaderBoard({
  date,
  machineCode,
  formState,
  onFormChange,
  saveState,
  readOnly = false,
}: HeaderBoardProps) {
  const saveText =
    saveState === 'saved'
      ? 'Guardado'
      : saveState === 'saving'
      ? 'Guardando...'
      : saveState === 'error'
      ? 'Error al guardar'
      : 'Sin cambios';

  return (
    <div className="report-header">
      {/* TITULO + METAS */}
      <div className="report-header-title">
        <span>Reporte de Produccion Hora por Hora - {machineCode}</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div className="header-field">
            Meta FPY:
            <input
              style={{ width: '60px' }}
              type="text"
              inputMode="decimal"
              value={formState.meta_fpy}
              onChange={(e) => onFormChange('meta_fpy', sanitizeDecimalInput(e.target.value))}
              readOnly={readOnly}
            />
          </div>
          <div className="header-field">
            Meta productividad:
            <input
              style={{ width: '60px' }}
              type="text"
              inputMode="decimal"
              value={formState.meta_productivity}
              onChange={(e) =>
                onFormChange('meta_productivity', sanitizeDecimalInput(e.target.value))
              }
              readOnly={readOnly}
            />
          </div>
        </div>
        <span className="header-status">{saveText}</span>
      </div>

      {/* CAMPOS DE INFORMACIÓN - GRID */}
      <div className="report-header-inputs">
        <div className="header-field">
          Fecha:
          <input type="date" value={date} disabled />
        </div>

        <div className="header-field">
          Turno:
          <input
            type="text"
            value={formState.shift}
            readOnly
          />
        </div>

        <div className="header-field">
          Ingeniero:
          <input
            type="text"
            value={ENGINEER_NAME}
            readOnly
          />
        </div>

        <div className="header-field">
          Línea:
          <select
            value={LINE_OPTIONS.includes(formState.line) ? formState.line : '315'}
            onChange={(e) => onFormChange('line', e.target.value)}
            disabled={readOnly}
          >
            {LINE_OPTIONS.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
        </div>

        <div className="header-field">
          Proceso:
          <input
            type="text"
            value={formState.process_type}
            onChange={(e) => onFormChange('process_type', e.target.value)}
            placeholder="Proceso"
            readOnly={readOnly}
          />
        </div>

        <div className="header-field">
          Operador:
          <input
            type="text"
            value={formState.operator}
            onChange={(e) => onFormChange('operator', e.target.value)}
            placeholder="Nombre del operador"
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  );
}
