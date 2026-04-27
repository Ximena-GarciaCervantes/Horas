'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  getBoardByMachineAndDate,
  createBoard,
  updateBoard,
  getHourlyData,
  upsertHourlyData,
  getProblems,
  createProblem,
  deleteProblem,
  calculateKPIs,
} from '@/lib/database';
import { formatDate } from '@/lib/utils';
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
const DEFAULT_ENGINEER = 'Sergio B.';
const DEFAULT_LINE = '315';
const DEFAULT_SHIFT = '423';
const LINE_OPTIONS = ['315', '314', '313', '312'];

function parseNumericField(value: string): number {
  const trimmed = value.trim();
  return trimmed === '' ? 0 : Number(trimmed);
}

function normalizeShift(): ProductionBoard['shift'] {
  return DEFAULT_SHIFT;
}

function normalizeLine(value: string): string {
  return LINE_OPTIONS.includes(value) ? value : DEFAULT_LINE;
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
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [formState, setFormState] = useState<BoardFormState>({
    leader_name: '',
    supervisor_name: '',
    shift: DEFAULT_SHIFT,
    model: DEFAULT_MODEL,
    daily_goal: 0,
    meta_fpy: '',
    meta_productivity: '',
    engineer: DEFAULT_ENGINEER,
    line: DEFAULT_LINE,
    process_type: '',
    operator: '',
  });

  const today = formatDate(new Date());
  const canEdit = user ? user.role !== 'supervisor' : false;

  const buildBoardPayload = useCallback(
    (): Partial<ProductionBoard> => ({
      machine_code: selectedMachine,
      date: today,
      leader_id: user?.id || '',
      leader_name: formState.leader_name || user?.name || '',
      supervisor_name: formState.supervisor_name || '',
      shift: normalizeShift(),
      model: formState.model || DEFAULT_MODEL,
      daily_goal: formState.daily_goal || 0,
      meta_fpy: parseNumericField(formState.meta_fpy),
      meta_productivity: parseNumericField(formState.meta_productivity),
      engineer: DEFAULT_ENGINEER,
      line: normalizeLine(formState.line),
      process_type: formState.process_type || '',
      operator: formState.operator || '',
      created_by: user?.id || '',
    }),
    [formState, selectedMachine, today, user]
  );

  const ensureBoard = useCallback(async (): Promise<ProductionBoard | null> => {
    if (board && board.machine_code === selectedMachine && board.date === today) {
      return board;
    }

    if (!user || !canEdit) return null;

    const createdBoard = await createBoard(buildBoardPayload());
    if (createdBoard) {
      setBoard(createdBoard);
    }

    return createdBoard;
  }, [board, buildBoardPayload, canEdit, selectedMachine, today, user]);

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
      setLoadingBoard(true);
      try {
        const boardData = await getBoardByMachineAndDate(selectedMachine, today);

        if (boardData) {
          setBoard(boardData);
          setFormState({
            leader_name: boardData.leader_name || user.name,
            supervisor_name: boardData.supervisor_name || '',
            shift: normalizeShift(),
            model: boardData.model || DEFAULT_MODEL,
            daily_goal: boardData.daily_goal || 0,
            meta_fpy: String(boardData.meta_fpy ?? ''),
            meta_productivity: String(boardData.meta_productivity ?? ''),
            engineer: DEFAULT_ENGINEER,
            line: normalizeLine(boardData.line || ''),
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
          setHourlyData([]);
          setProblems([]);
          setFormState((prev) => ({
            ...prev,
            leader_name: user.name,
            supervisor_name: '',
            shift: normalizeShift(),
            model: DEFAULT_MODEL,
            daily_goal: 0,
            meta_fpy: '',
            meta_productivity: '',
            engineer: DEFAULT_ENGINEER,
            line: DEFAULT_LINE,
            process_type: '',
            operator: '',
          }));
        }
      } catch (error) {
        console.error('Error loading board data:', error);
        setBoard(null);
      } finally {
        setLoadingBoard(false);
      }
    };

    loadBoardData();
  }, [user, selectedMachine, today]);

  useEffect(() => {
    if (!user || loading || loadingBoard || !canEdit) return;

    const timeout = setTimeout(async () => {
      setSaveState('saving');
      try {
        const activeBoard = await ensureBoard();
        if (!activeBoard) {
          setSaveState('error');
          return;
        }

        const success = await updateBoard(activeBoard.id, {
          ...formState,
          shift: normalizeShift(),
          meta_fpy: parseNumericField(formState.meta_fpy),
          meta_productivity: parseNumericField(formState.meta_productivity),
          engineer: DEFAULT_ENGINEER,
          line: normalizeLine(formState.line),
        });
        setSaveState(success ? 'saved' : 'error');

        setTimeout(() => setSaveState('idle'), 3000);
      } catch (error) {
        console.error('Error saving:', error);
        setSaveState('error');
      }
    }, 700);

    return () => clearTimeout(timeout);
  }, [canEdit, ensureBoard, formState, loading, loadingBoard, user]);

  const handleFormChange = (field: keyof BoardFormState, value: string | number) => {
    if (!canEdit) return;

    setFormState((prev) => ({
      ...prev,
      [field]: field === 'shift' && typeof value === 'string'
        ? normalizeShift()
        : value,
    }));
  };

  const handleSelectMachine = (machine: 'RK1' | 'RK2' | 'RK3' | 'RK4') => {
    setLoadingBoard(true);
    setBoard(null);
    setHourlyData([]);
    setProblems([]);
    setSaveState('idle');
    setSelectedMachine(machine);
  };

  const handleUpdateHour = async (
    hour: number,
    plan: number,
    actual: number,
    accumulatedPlan: number,
    accumulatedActual: number,
    yieldPercent: number
  ) => {
    if (!canEdit) return;

    const activeBoard = await ensureBoard();

    if (!activeBoard) return;

    const result = await upsertHourlyData(
      activeBoard.id,
      hour,
      plan,
      actual,
      accumulatedPlan,
      accumulatedActual,
      yieldPercent
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
  ): Promise<boolean> => {
    if (!canEdit) return false;

    const activeBoard = await ensureBoard();

    if (!activeBoard) return false;

    const result = await createProblem({
      ...problem,
      board_id: activeBoard.id,
    });

    if (result) {
      setProblems((prev) => [
        ...prev,
        result,
      ].sort((a, b) => a.hour - b.hour));
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 3000);
      return true;
    }

    setSaveState('error');
    return false;
  };

  const handleDeleteProblem = async (id: string) => {
    if (!canEdit) return;

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
          onSelectMachine={handleSelectMachine}
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
              readOnly={!canEdit}
            />
            <ProductionTable
              hourlyData={hourlyData}
              problems={problems}
              model={formState.model}
              onUpdateHour={handleUpdateHour}
              onAddProblem={handleAddProblem}
              onDeleteProblem={handleDeleteProblem}
              metaFpy={parseNumericField(formState.meta_fpy)}
              metaProductivity={parseNumericField(formState.meta_productivity)}
              readOnly={!canEdit}
            />
          </div>

          <KPISection kpis={kpis} dailyGoal={formState.daily_goal} />

          <ProblemsSection
            problems={problems}
            onAddProblem={handleAddProblem}
            onDeleteProblem={handleDeleteProblem}
            readOnly={!canEdit}
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
