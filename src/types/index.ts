// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'leader';
  assigned_rks: string[];
  created_at: string;
}

// Production Board Types
export interface ProductionBoard {
  id: string;
  machine_code: 'RK1' | 'RK2' | 'RK3' | 'RK4';
  date: string;
  leader_id: string;
  leader_name: string;
  supervisor_name: string;
  shift: '1' | '2' | '3';
  model: string;
  daily_goal: number;
  meta_fpy: number;
  meta_productivity: number;
  engineer: string;
  line: string;
  process_type: string;
  operator: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Hourly Production Data
export interface HourlyProduction {
  id: string;
  board_id: string;
  hour: number; // 6 to 19
  plan: number;
  actual: number;
  accumulated_plan: number;
  accumulated_actual: number;
  efficiency_hour: number;
  efficiency_accumulated: number;
  created_at: string;
  updated_at: string;
}

// Problems/Incidents
export interface Problem {
  id: string;
  board_id: string;
  hour: number;
  description: string;
  minutes_lost: number;
  responsible: string;
  corrective_action: string;
  created_at: string;
  updated_at: string;
}

// KPI Summary
export interface KPISummary {
  total_plan: number;
  total_actual: number;
  total_efficiency: number;
  total_minutes_lost: number;
  goal_difference: number;
  goal_achievement: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message: string;
}

// Form State
export interface BoardFormState {
  leader_name: string;
  supervisor_name: string;
  shift: string;
  model: string;
  daily_goal: number;
  meta_fpy: string;
  meta_productivity: string;
  engineer: string;
  line: string;
  process_type: string;
  operator: string;
}

// Saving State
export type SaveState = 'idle' | 'saving' | 'saved' | 'error';
