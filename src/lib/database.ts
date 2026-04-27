import { supabase } from './supabase';
import type {
  User,
  ProductionBoard,
  HourlyProduction,
  Problem,
  KPISummary,
} from '@/types';

// ============ USERS ============
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  return data;
}

export async function createUser(userData: {
  id: string;
  email: string;
  name: string;
  role: string;
  assigned_rks: string[];
}): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }
  return data;
}

export async function updateUserRKs(
  userId: string,
  rks: string[]
): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update({ assigned_rks: rks })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user RKs:', error);
    return false;
  }
  return true;
}

// ============ PRODUCTION BOARDS ============
export async function createBoard(
  boardData: Partial<ProductionBoard>
): Promise<ProductionBoard | null> {
  const {
    id: _id,
    machine_code,
    date,
    leader_id,
    leader_name,
    supervisor_name,
    shift,
    model,
    daily_goal,
    meta_fpy,
    meta_productivity,
    engineer,
    line,
    process_type,
    operator,
    created_at: _created_at,
    updated_at: _updated_at,
    created_by,
  } = boardData;

  const { data, error } = await supabase
    .from('production_boards')
    .upsert(
      {
        machine_code,
        date,
        leader_id,
        leader_name,
        supervisor_name,
        shift,
        model,
        daily_goal,
        meta_fpy,
        meta_productivity,
        engineer,
        line,
        process_type,
        operator,
        created_by,
      },
      {
        onConflict: 'machine_code,date',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error creating board:', error);
    return null;
  }
  return data;
}

export async function getBoardByMachineAndDate(
  machineCode: string,
  date: string
): Promise<ProductionBoard | null> {
  const { data, error } = await supabase
    .from('production_boards')
    .select('*')
    .eq('machine_code', machineCode)
    .eq('date', date)
    .limit(1);

  if (error) {
    console.error('Error fetching board:', error);
    return null;
  }
  return data?.[0] || null;
}

export async function getLatestBoardByMachine(
  machineCode: string
): Promise<ProductionBoard | null> {
  const { data, error } = await supabase
    .from('production_boards')
    .select('*')
    .eq('machine_code', machineCode)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching latest board by machine:', error);
    return null;
  }

  return data?.[0] || null;
}

export async function getLatestBoardByLeaderAndMachine(
  leaderId: string,
  machineCode: string
): Promise<ProductionBoard | null> {
  const { data, error } = await supabase
    .from('production_boards')
    .select('*')
    .eq('leader_id', leaderId)
    .eq('machine_code', machineCode)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching fallback board:', error);
    return null;
  }

  return data?.[0] || null;
}

export async function updateBoard(
  boardId: string,
  updates: Partial<ProductionBoard>
): Promise<boolean> {
  const {
    id: _id,
    machine_code: _machine_code,
    date: _date,
    leader_id: _leader_id,
    created_at: _created_at,
    updated_at: _updated_at,
    created_by: _created_by,
    ...allowedUpdates
  } = updates;

  const { error } = await supabase
    .from('production_boards')
    .update({ ...allowedUpdates, updated_at: new Date().toISOString() })
    .eq('id', boardId);

  if (error) {
    console.error('Error updating board:', error);
    return false;
  }
  return true;
}

// ============ HOURLY PRODUCTION ============
export async function getHourlyData(
  boardId: string
): Promise<HourlyProduction[]> {
  const { data, error } = await supabase
    .from('hourly_production')
    .select('*')
    .eq('board_id', boardId)
    .order('hour', { ascending: true });

  if (error) {
    console.error('Error fetching hourly data:', error);
    return [];
  }
  return data || [];
}

export async function upsertHourlyData(
  boardId: string,
  hour: number,
  plan: number,
  actual: number,
  accumulatedPlan: number,
  accumulatedActual: number,
  yieldPercent: number = 0
): Promise<HourlyProduction | null> {
  const efficiencyHour =
    plan > 0 ? parseFloat(((actual / plan) * 100).toFixed(2)) : 0;
  const efficiencyAccumulated =
    accumulatedPlan > 0
      ? parseFloat(((accumulatedActual / accumulatedPlan) * 100).toFixed(2))
      : 0;

  const { data, error } = await supabase
    .from('hourly_production')
    .upsert(
      {
        board_id: boardId,
        hour,
        plan,
        actual,
        accumulated_plan: accumulatedPlan,
        accumulated_actual: accumulatedActual,
        efficiency_hour: efficiencyHour,
        efficiency_accumulated: efficiencyAccumulated,
        yield_percent: yieldPercent,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'board_id,hour',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting hourly data:', error);
    return null;
  }
  return data;
}

// ============ PROBLEMS ============
export async function getProblems(boardId: string): Promise<Problem[]> {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .eq('board_id', boardId)
    .order('hour', { ascending: true });

  if (error) {
    console.error('Error fetching problems:', error);
    return [];
  }
  return data || [];
}

export async function createProblem(
  problemData: Partial<Problem>
): Promise<Problem | null> {
  const { data, error } = await supabase
    .from('problems')
    .insert([problemData])
    .select()
    .single();

  if (error) {
    console.error('Error creating problem:', error);
    return null;
  }
  return data;
}

export async function updateProblem(
  problemId: string,
  updates: Partial<Problem>
): Promise<boolean> {
  const { error } = await supabase
    .from('problems')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', problemId);

  if (error) {
    console.error('Error updating problem:', error);
    return false;
  }
  return true;
}

export async function deleteProblem(problemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('problems')
    .delete()
    .eq('id', problemId);

  if (error) {
    console.error('Error deleting problem:', error);
    return false;
  }
  return true;
}

// ============ KPI CALCULATIONS ============
export function calculateKPIs(
  hourlyData: HourlyProduction[],
  problems: Problem[],
  dailyGoal: number
): KPISummary {
  const totalPlan = hourlyData.reduce((sum, h) => sum + (h.plan || 0), 0);
  const totalActual = hourlyData.reduce((sum, h) => sum + (h.actual || 0), 0);
  const totalMinutesLost = problems.reduce(
    (sum, p) => sum + (p.minutes_lost || 0),
    0
  );

  const totalEfficiency =
    totalPlan > 0
      ? parseFloat(((totalActual / totalPlan) * 100).toFixed(2))
      : 0;
  const goalDifference = totalActual - dailyGoal;
  const goalAchievement =
    dailyGoal > 0
      ? parseFloat(((totalActual / dailyGoal) * 100).toFixed(2))
      : 0;

  return {
    total_plan: totalPlan,
    total_actual: totalActual,
    total_efficiency: totalEfficiency,
    total_minutes_lost: totalMinutesLost,
    goal_difference: goalDifference,
    goal_achievement: goalAchievement,
  };
}
