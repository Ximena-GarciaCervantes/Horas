-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'supervisor', 'leader')),
  assigned_rks TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Production boards table
CREATE TABLE production_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_code VARCHAR(10) NOT NULL CHECK (machine_code IN ('RK1', 'RK2', 'RK3', 'RK4')),
  date DATE NOT NULL,
  leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leader_name VARCHAR(255),
  supervisor_name VARCHAR(255),
  shift VARCHAR(10) CHECK (shift IN ('1', '2', '3')),
  model VARCHAR(255),
  daily_goal INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(machine_code, date)
);

-- Hourly production data
CREATE TABLE hourly_production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES production_boards(id) ON DELETE CASCADE,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  plan INTEGER DEFAULT 0,
  actual INTEGER DEFAULT 0,
  accumulated_plan INTEGER DEFAULT 0,
  accumulated_actual INTEGER DEFAULT 0,
  efficiency_hour NUMERIC(5, 2) DEFAULT 0,
  efficiency_accumulated NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(board_id, hour)
);

-- Problems/Incidents table
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES production_boards(id) ON DELETE CASCADE,
  hour INTEGER NOT NULL,
  description TEXT NOT NULL,
  minutes_lost INTEGER DEFAULT 0,
  responsible VARCHAR(255),
  corrective_action TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_production_boards_machine_date ON production_boards(machine_code, date);
CREATE INDEX idx_production_boards_leader_id ON production_boards(leader_id);
CREATE INDEX idx_hourly_production_board_id ON hourly_production(board_id);
CREATE INDEX idx_problems_board_id ON problems(board_id);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE hourly_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for production_boards
CREATE POLICY "Leaders can view their boards"
  ON production_boards FOR SELECT
  USING (
    auth.uid() = leader_id OR
    machine_code IN (
      SELECT unnest(assigned_rks)
      FROM users
      WHERE id = auth.uid() AND role = 'leader'
    ) OR
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Leaders can create boards"
  ON production_boards FOR INSERT
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Leaders can update their boards"
  ON production_boards FOR UPDATE
  USING (
    auth.uid() = leader_id OR
    machine_code IN (
      SELECT unnest(assigned_rks)
      FROM users
      WHERE id = auth.uid() AND role = 'leader'
    ) OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for hourly_production
CREATE POLICY "Users can view hourly data of accessible boards"
  ON hourly_production FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM production_boards 
      WHERE leader_id = auth.uid() OR auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'supervisor'))
    )
  );

CREATE POLICY "Users can insert hourly data"
  ON hourly_production FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT id FROM production_boards WHERE leader_id = auth.uid()
    )
  );

CREATE POLICY "Users can update hourly data"
  ON hourly_production FOR UPDATE
  USING (
    board_id IN (
      SELECT id FROM production_boards WHERE leader_id = auth.uid()
    )
  );

-- RLS Policies for problems
CREATE POLICY "Users can view problems"
  ON problems FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM production_boards WHERE leader_id = auth.uid() OR auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'supervisor'))
    )
  );

CREATE POLICY "Users can insert problems"
  ON problems FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT id FROM production_boards WHERE leader_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete problems"
  ON problems FOR DELETE
  USING (
    board_id IN (
      SELECT id FROM production_boards WHERE leader_id = auth.uid()
    )
  );
