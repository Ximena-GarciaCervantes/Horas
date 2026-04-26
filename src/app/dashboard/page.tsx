'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  getLatestBoardByLeaderAndMachine,
  getLatestBoardByMachine,
  createBoard,
  updateBoard,
  getHourlyData,
  upsertHourlyData,
  getProblems,
  createProblem,
  deleteProblem,
  calculateKPIs,
} from '@/lib/database';
import { debounce, formatDate } from '@/lib/utils';
import MachineTabs from '@/components/MachineTabs';
import HeaderBoard from '@/components/HeaderBoard';
import ProductionTable from '@/components/ProductionTable';
import ProblemsSection from '@/components/ProblemsSection';
import KPISection from '@/components/KPISection';
import ExportSection from '@/components/ExportSection';
import { LogOut } from 'lucide-react';
import type {
  User,
  ProductionBoard,
  HourlyProduction,
  Problem,
  BoardFormState,
  SaveState,
} from '@/types';

const DEFAULT_MODEL = '13576-Z';

function parseNumericField(value: string): number {
  const trimmed = value.trim();
  return trimmed === '' ? 0 : Number(trimmed);
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<'RK1' | 'RK2' | 'RK3' | 'RK4'>('RK1');
  const [board, setBoard] = useState<ProductionBoard | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyProduction[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<BoardFormState>({
    leader_name: '',
    supervisor_name: '',
    shift: '1',
    model: DEFAULT_MODEL,
    daily_goal: 0,
    meta_fpy: '',
    meta_productivity: '',
    engineer: '',
    line: '',
    process_type: '',
    operator: '',
  });

  const today = formatDate(new Date());

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userProfile) {
        setUser(userProfile);
        if (
          userProfile.assigned_rks &&
          userProfile.assigned_rks.length > 0
        ) {
          setSelectedMachine(userProfile.assigned_rks[0]);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Load board data
  useEffect(() => {
    if (!user || !selectedMachine) return;

    const loadBoardData = async () => {
      try {
        // Get the latest board for this machine, regardless of day
        let boardData = await getLatestBoardByMachine(selectedMachine);

        if (!boardData) {
          boardData = await createBoard({
            machine_code: selectedMachine,
            date: today,
            leader_id: user.id,
            leader_name: user.name,
            supervisor_name: '',
            shift: formState.shift || '1',
            model: DEFAULT_MODEL,
            daily_goal: 0,
            meta_fpy: 0,
            meta_productivity: 0,
            engineer: '',
            line: selectedMachine,
            process_type: '',
            operator: '',
            created_by: user.id,
          });
        }

        if (boardData) {
          setBoard(boardData);
          setFormState({
            leader_name: boardData.leader_name || user.name,
            supervisor_name: boardData.supervisor_name || '',
            shift: boardData.shift || '1',
            model: boardData.model || DEFAULT_MODEL,
            daily_goal: boardData.daily_goal || 0,
            meta_fpy: String(boardData.meta_fpy ?? ''),
            meta_productivity: String(boardData.meta_productivity ?? ''),
            engineer: boardData.engineer || '',
            line: boardData.line || '',
            process_type: boardData.process_type || '',
            operator: boardData.operator || '',
          });

          // Load hourly data
          const hourData = await getHourlyData(boardData.id);
          setHourlyData(hourData);

          // Load problems
          const problemsData = await getProblems(boardData.id);
          setProblems(problemsData);
        } else {
          setBoard(null);
        }
      } catch (error) {
        console.error('Error loading board data:', error);
        setBoard(null);
      }
    };

    loadBoardData();
  }, [user, selectedMachine, today]);

  // Auto-save with debounce
  const autoSave = useCallback(
    debounce(async () => {
      if (!board) return;

      setSaveState('saving');
      try {
        const success = await updateBoard(board.id, {
          ...formState,
          shift: formState.shift || '1',
          meta_fpy: parseNumericField(formState.meta_fpy),
          meta_productivity: parseNumericField(formState.meta_productivity),
        });
        setSaveState(success ? 'saved' : 'error');

        setTimeout(() => setSaveState('idle'), 3000);
      } catch (error) {
        console.error('Error saving:', error);
        setSaveState('error');
      }
    }, 700),
    [board, formState]
  );

  useEffect(() => {
    autoSave();
  }, [formState, autoSave]);

  const handleFormChange = (field: keyof BoardFormState, value: string | number) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateHour = async (
    hour: number,
    plan: number,
    actual: number,
    accumulatedPlan: number,
    accumulatedActual: number
  ) => {
    let activeBoard = board;

    if (!activeBoard) {
      activeBoard = await createBoard({
        machine_code: selectedMachine,
        date: today,
        leader_id: user?.id || '',
        leader_name: user?.name || '',
        supervisor_name: '',
        shift: formState.shift || '1',
        model: formState.model || DEFAULT_MODEL,
        daily_goal: formState.daily_goal || 0,
        meta_fpy: 0,
        meta_productivity: 0,
        engineer: formState.engineer || '',
        line: formState.line || selectedMachine,
        process_type: formState.process_type || '',
        operator: formState.operator || '',
        created_by: user?.id || '',
      });

      if (activeBoard) {
        setBoard(activeBoard);
      }
    }

    if (!activeBoard) return;

    const result = await upsertHourlyData(
      activeBoard.id,
      hour,
      plan,
      actual,
      accumulatedPlan,
      accumulatedActual
    );

    if (result) {
      setHourlyData((prev) => {
        const updated = prev.filter((h) => h.hour !== hour);
        return [...updated, result].sort((a, b) => a.hour - b.hour);
      });
    }
  };

  const handleAddProblem = async (
    problem: Omit<Problem, 'id' | 'created_at' | 'updated_at'>
  ) => {
    let activeBoard = board;

    if (!activeBoard) {
      activeBoard = await createBoard({
        machine_code: selectedMachine,
        date: today,
        leader_id: user?.id || '',
        leader_name: user?.name || '',
        supervisor_name: '',
        shift: formState.shift || '1',
        model: formState.model || DEFAULT_MODEL,
        daily_goal: formState.daily_goal || 0,
        meta_fpy: 0,
        meta_productivity: 0,
        engineer: formState.engineer || '',
        line: formState.line || selectedMachine,
        process_type: formState.process_type || '',
        operator: formState.operator || '',
        created_by: user?.id || '',
      });

      if (activeBoard) {
        setBoard(activeBoard);
      }
    }

    if (!activeBoard) return;

    const result = await createProblem({
      ...problem,
      board_id: activeBoard.id,
    });

    if (result) {
      setProblems((prev) => [
        ...prev,
        result,
      ].sort((a, b) => a.hour - b.hour));
    }
  };

  const handleDeleteProblem = async (id: string) => {
    const success = await deleteProblem(id);
    if (success) {
      setProblems((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rk-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rk-green mx-auto mb-4"></div>
          <p className="text-rk-dark font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const kpis = calculateKPIs(hourlyData, problems, formState.daily_goal);
  const availableMachines = (user.assigned_rks || ['RK1']) as (
    | 'RK1'
    | 'RK2'
    | 'RK3'
    | 'RK4'
  )[];

  return (
    <div className="min-h-screen">
      <div className="bg-[#244f75] text-white p-4 shadow-lg">
        <div className="board-container !my-0 !py-0 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">HORAS</h1>
            <p className="text-sm text-slate-200">Sistema de Produccion RK</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs uppercase tracking-wide text-slate-200">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="primary flex items-center gap-2">
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="board-container">
        <MachineTabs
          machines={availableMachines}
          selectedMachine={selectedMachine}
          onSelectMachine={setSelectedMachine}
        />

        <div className="space-y-4">
          {!board && (
            <div className="card-shell border border-amber-300 bg-amber-50 text-amber-900">
              No se encontró el pizarrón de hoy. Se mostrará el tablero y se creará al guardar cambios.
            </div>
          )}

          <div id="board-content">
            <HeaderBoard
              date={today}
              machineCode={selectedMachine}
              formState={formState}
              onFormChange={handleFormChange}
              saveState={saveState}
            />
            <ProductionTable
              hourlyData={hourlyData}
              problems={problems}
              model={formState.model}
              onUpdateHour={handleUpdateHour}
            />
          </div>

          <KPISection kpis={kpis} dailyGoal={formState.daily_goal} />

          <ProblemsSection
            problems={problems}
            onAddProblem={handleAddProblem}
            onDeleteProblem={handleDeleteProblem}
          />

          <ExportSection
            machineCode={selectedMachine}
            date={today}
            leaderName={formState.leader_name}
            supervisorName={formState.supervisor_name}
            shift={formState.shift}
            model={formState.model}
            dailyGoal={formState.daily_goal}
            hourlyData={hourlyData}
            problems={problems}
            kpis={kpis}
          />
        </div>
      </div>
    </div>
  );
}
