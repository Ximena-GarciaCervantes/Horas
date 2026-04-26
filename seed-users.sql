-- Insert or update users from auth.users by email.
-- Requirement: these emails must already exist in Supabase Authentication -> Users.

WITH wanted_users AS (
	SELECT
		'alejandra@rk.com'::text AS email,
		'Alejandra'::text AS name,
		'leader'::text AS role,
		ARRAY['RK1']::text[] AS assigned_rks
	UNION ALL
	SELECT
		'antonio@rk.com'::text,
		'Antonio'::text,
		'leader'::text,
		ARRAY['RK3', 'RK4']::text[]
	UNION ALL
	SELECT
		'alberto@rk.com'::text,
		'Alberto'::text,
		'leader'::text,
		ARRAY['RK3', 'RK4']::text[]
	UNION ALL
	SELECT
		'margarita@rk.com'::text,
		'Margarita'::text,
		'leader'::text,
		ARRAY['RK2']::text[]
	UNION ALL
	SELECT
		'sergio@rk.com'::text,
		'Sergio'::text,
		'supervisor'::text,
		ARRAY['RK1', 'RK2', 'RK3', 'RK4']::text[]
)
INSERT INTO users (id, email, name, role, assigned_rks)
SELECT
	au.id,
	wu.email,
	wu.name,
	wu.role,
	wu.assigned_rks
FROM wanted_users wu
JOIN auth.users au ON lower(au.email) = wu.email
ON CONFLICT (email)
DO UPDATE SET
	name = EXCLUDED.name,
	role = EXCLUDED.role,
	assigned_rks = EXCLUDED.assigned_rks,
	updated_at = CURRENT_TIMESTAMP;

-- Optional check: which configured emails are missing in auth.users
WITH wanted_emails AS (
	SELECT 'alejandra@rk.com'::text AS email
	UNION ALL SELECT 'antonio@rk.com'::text
	UNION ALL SELECT 'alberto@rk.com'::text
	UNION ALL SELECT 'margarita@rk.com'::text
	UNION ALL SELECT 'sergio@rk.com'::text
)
SELECT we.email AS missing_in_auth_users
FROM wanted_emails we
LEFT JOIN auth.users au ON lower(au.email) = we.email
WHERE au.id IS NULL;
