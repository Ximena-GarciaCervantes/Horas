-- Run this in Supabase SQL Editor for an existing HORAS database.
-- It adds the editable header fields and lets leaders edit hourly data/problems
-- for the RKs assigned to their user profile.

ALTER TABLE production_boards
  ADD COLUMN IF NOT EXISTS meta_fpy NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meta_productivity NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engineer VARCHAR(255),
  ADD COLUMN IF NOT EXISTS line VARCHAR(255),
  ADD COLUMN IF NOT EXISTS process_type VARCHAR(255),
  ADD COLUMN IF NOT EXISTS operator VARCHAR(255);

ALTER TABLE production_boards
  DROP CONSTRAINT IF EXISTS production_boards_shift_check;

UPDATE production_boards
SET shift = '423'
WHERE shift IS DISTINCT FROM '423';

ALTER TABLE production_boards
  ALTER COLUMN shift SET DEFAULT '423',
  ADD CONSTRAINT production_boards_shift_check CHECK (shift = '423');

ALTER TABLE hourly_production
  ADD COLUMN IF NOT EXISTS yield_percent NUMERIC(5, 2) DEFAULT 0;

DROP POLICY IF EXISTS "Leaders can view their boards" ON production_boards;
DROP POLICY IF EXISTS "Leaders can create boards" ON production_boards;
DROP POLICY IF EXISTS "Leaders can update their boards" ON production_boards;

CREATE POLICY "Leaders can view their boards"
  ON production_boards FOR SELECT
  USING (
    auth.uid() = leader_id
    OR machine_code IN (
      SELECT unnest(assigned_rks)
      FROM users
      WHERE id = auth.uid() AND role = 'leader'
    )
    OR auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Leaders can create boards"
  ON production_boards FOR INSERT
  WITH CHECK (
    auth.uid() = leader_id
    AND (
      machine_code IN (
        SELECT unnest(assigned_rks)
        FROM users
        WHERE id = auth.uid() AND role = 'leader'
      )
      OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    )
  );

CREATE POLICY "Leaders can update their boards"
  ON production_boards FOR UPDATE
  USING (
    auth.uid() = leader_id
    OR machine_code IN (
      SELECT unnest(assigned_rks)
      FROM users
      WHERE id = auth.uid() AND role = 'leader'
    )
    OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() = leader_id
    OR machine_code IN (
      SELECT unnest(assigned_rks)
      FROM users
      WHERE id = auth.uid() AND role = 'leader'
    )
    OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

DROP POLICY IF EXISTS "Users can view hourly data of accessible boards" ON hourly_production;
DROP POLICY IF EXISTS "Users can insert hourly data" ON hourly_production;
DROP POLICY IF EXISTS "Users can update hourly data" ON hourly_production;

CREATE POLICY "Users can view hourly data of accessible boards"
  ON hourly_production FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM production_boards
      WHERE
        leader_id = auth.uid()
        OR machine_code IN (
          SELECT unnest(assigned_rks)
          FROM users
          WHERE id = auth.uid() AND role = 'leader'
        )
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'supervisor'))
    )
  );

CREATE POLICY "Users can insert hourly data"
  ON hourly_production FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT id FROM production_boards
      WHERE
        leader_id = auth.uid()
        OR machine_code IN (
          SELECT unnest(assigned_rks)
          FROM users
          WHERE id = auth.uid() AND role = 'leader'
        )
        OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    )
  );

CREATE POLICY "Users can update hourly data"
  ON hourly_production FOR UPDATE
  USING (
    board_id IN (
      SELECT id FROM production_boards
      WHERE
        leader_id = auth.uid()
        OR machine_code IN (
          SELECT unnest(assigned_rks)
          FROM users
          WHERE id = auth.uid() AND role = 'leader'
        )
        OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can view problems" ON problems;
DROP POLICY IF EXISTS "Users can insert problems" ON problems;
DROP POLICY IF EXISTS "Users can delete problems" ON problems;

CREATE POLICY "Users can view problems"
  ON problems FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM production_boards
      WHERE
        leader_id = auth.uid()
        OR machine_code IN (
          SELECT unnest(assigned_rks)
          FROM users
          WHERE id = auth.uid() AND role = 'leader'
        )
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'supervisor'))
    )
  );

CREATE POLICY "Users can insert problems"
  ON problems FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT id FROM production_boards
      WHERE
        leader_id = auth.uid()
        OR machine_code IN (
          SELECT unnest(assigned_rks)
          FROM users
          WHERE id = auth.uid() AND role = 'leader'
        )
        OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    )
  );

CREATE POLICY "Users can delete problems"
  ON problems FOR DELETE
  USING (
    board_id IN (
      SELECT id FROM production_boards
      WHERE
        leader_id = auth.uid()
        OR machine_code IN (
          SELECT unnest(assigned_rks)
          FROM users
          WHERE id = auth.uid() AND role = 'leader'
        )
        OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    )
  );
