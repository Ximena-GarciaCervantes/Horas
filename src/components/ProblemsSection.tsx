'use client';

import React, { useState } from 'react';
import { Problem } from '@/types';
import { formatHour } from '@/lib/utils';
import { Trash2, Plus } from 'lucide-react';

interface ProblemsSectionProps {
  problems: Problem[];
  onAddProblem: (problem: Omit<Problem, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onDeleteProblem: (id: string) => void;
  readOnly?: boolean;
}

export default function ProblemsSection({
  problems,
  onAddProblem,
  onDeleteProblem,
  readOnly = false,
}: ProblemsSectionProps) {
  const [newProblem, setNewProblem] = useState({
    hour: 6,
    description: '',
    minutes_lost: 0,
    responsible: '',
    corrective_action: '',
  });

  const handleAddProblem = async () => {
    if (newProblem.description.trim() === '') return;

    const saved = await onAddProblem({
      hour: newProblem.hour,
      description: newProblem.description,
      minutes_lost: newProblem.minutes_lost,
      responsible: newProblem.responsible,
      corrective_action: newProblem.corrective_action,
      board_id: '', // Will be set by parent component
    });

    if (!saved) return;

    setNewProblem({
      hour: 6,
      description: '',
      minutes_lost: 0,
      responsible: '',
      corrective_action: '',
    });
  };

  return (
    <div className="card-shell mt-4">
      <h3 className="section-heading">Problemas / Incidencias</h3>

      {/* Add New Problem */}
      {!readOnly && (
      <div className="mb-6 p-4 bg-rk-light rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-rk-gray mb-1">
              Hora
            </label>
            <select
              value={newProblem.hour}
              onChange={(e) =>
                setNewProblem({
                  ...newProblem,
                  hour: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-rk-light rounded focus:outline-none focus:ring-2 focus:ring-rk-green bg-white text-rk-dark text-sm"
            >
              {Array.from({ length: 14 }, (_, i) => i + 6).map((hour) => (
                <option key={hour} value={hour}>
                  {formatHour(hour)}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-rk-gray mb-1">
              Descripción del Problema
            </label>
            <input
              type="text"
              value={newProblem.description}
              onChange={(e) =>
                setNewProblem({
                  ...newProblem,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-rk-light rounded focus:outline-none focus:ring-2 focus:ring-rk-green bg-white text-rk-dark text-sm"
              placeholder="Descripción del problema"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-rk-gray mb-1">
              Minutos Perdidos
            </label>
            <input
              type="number"
              value={newProblem.minutes_lost}
              onChange={(e) =>
                setNewProblem({
                  ...newProblem,
                  minutes_lost: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-rk-light rounded focus:outline-none focus:ring-2 focus:ring-rk-green bg-white text-rk-dark text-sm"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-rk-gray mb-1">
              Responsable
            </label>
            <input
              type="text"
              value={newProblem.responsible}
              onChange={(e) =>
                setNewProblem({
                  ...newProblem,
                  responsible: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-rk-light rounded focus:outline-none focus:ring-2 focus:ring-rk-green bg-white text-rk-dark text-sm"
              placeholder="Nombre del responsable"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-rk-gray mb-1">
              Acción Correctiva
            </label>
            <input
              type="text"
              value={newProblem.corrective_action}
              onChange={(e) =>
                setNewProblem({
                  ...newProblem,
                  corrective_action: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-rk-light rounded focus:outline-none focus:ring-2 focus:ring-rk-green bg-white text-rk-dark text-sm"
              placeholder="Acción correctiva"
            />
          </div>
        </div>

        <button
          onClick={handleAddProblem}
          disabled={newProblem.description.trim() === ''}
          className="flex items-center gap-2 bg-rk-green hover:bg-green-700 disabled:bg-rk-gray text-white px-4 py-2 rounded font-semibold transition duration-200"
        >
          <Plus size={18} />
          Añadir Incidencia
        </button>
      </div>
      )}

      {/* Problems List */}
      <div className="space-y-3">
        {problems.length === 0 ? (
          <p className="text-rk-gray text-center py-4">
            No hay incidencias registradas
          </p>
        ) : (
          <ul className="list-disc pl-5 space-y-3">
            {problems.map((problem) => (
              <li key={problem.id} className="border border-rk-light rounded-lg bg-rk-light bg-opacity-50 p-4 list-item">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold text-rk-dark">
                      {formatHour(problem.hour)} - {problem.description}
                    </p>
                    <p className="text-sm text-rk-gray mt-1">
                      Responsable: {problem.responsible} | Minutos perdidos: {problem.minutes_lost}
                    </p>
                    <p className="text-sm text-rk-dark mt-1">
                      <strong>Acción:</strong> {problem.corrective_action}
                    </p>
                  </div>
                  {!readOnly && (
                    <button
                      onClick={() => onDeleteProblem(problem.id)}
                      className="text-rk-red hover:bg-rk-red hover:bg-opacity-10 p-2 rounded transition"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
