'use client';

import React from 'react';
import { BoardFormState } from '@/types';

interface HeaderBoardProps {
  date: string;
  machineCode: string;
  formState: BoardFormState;
  onFormChange: (field: keyof BoardFormState, value: string | number) => void;
  saveState: 'idle' | 'saving' | 'saved' | 'error';
}

export default function HeaderBoard({
  date,
  machineCode,
  formState,
  onFormChange,
  saveState,
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
              type="number"
              value={formState.meta_fpy}
              onChange={(e) => onFormChange('meta_fpy', e.target.value)}
            />
          </div>
          <div className="header-field">
            Meta productividad:
            <input
              style={{ width: '60px' }}
              type="number"
              value={formState.meta_productivity}
              onChange={(e) => onFormChange('meta_productivity', e.target.value)}
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
            type="number"
            value={formState.shift}
            onChange={(e) => onFormChange('shift', e.target.value)}
            min="1"
            max="3"
          />
        </div>

        <div className="header-field">
          Ingeniero:
          <input
            type="text"
            value={formState.engineer}
            onChange={(e) => onFormChange('engineer', e.target.value)}
            placeholder="Nombre"
          />
        </div>

        <div className="header-field">
          Línea:
          <input
            type="text"
            value={formState.line}
            onChange={(e) => onFormChange('line', e.target.value)}
            placeholder="RK1, RK2, etc."
          />
        </div>

        <div className="header-field">
          Proceso:
          <input
            type="text"
            value={formState.process_type}
            onChange={(e) => onFormChange('process_type', e.target.value)}
            placeholder="Proceso"
          />
        </div>

        <div className="header-field">
          Operador:
          <input
            type="text"
            value={formState.operator}
            onChange={(e) => onFormChange('operator', e.target.value)}
            placeholder="Nombre del operador"
          />
        </div>
      </div>
    </div>
  );
}
