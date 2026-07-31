-- Limpiar duplicados en users y agregar UNIQUE en email
-- Ejecutar UNA SOLA VEZ en SQL Editor de Supabase Dashboard

BEGIN;

-- Tabla TEMP: solo vive durante esta transacción, nadie más la ve.
-- La advertencia "creates a table without RLS" de Supabase no aplica a temp tables.
CREATE TEMP TABLE keep_users AS
SELECT DISTINCT ON (u.email) u.user_id, u.email
FROM users u
LEFT JOIN users_x_comercios uxc ON uxc.user_id = u.user_id
ORDER BY u.email,
  CASE WHEN uxc.comercio_id IS NOT NULL THEN 0 ELSE 1 END,
  u.user_id ASC;

-- Borrar vínculos duplicados (keeper ya tiene ese comercio)
DELETE FROM users_x_comercios uxc
USING keep_users ku, users u
WHERE uxc.user_id = u.user_id
  AND u.email = ku.email
  AND u.user_id != ku.user_id
  AND EXISTS (
    SELECT 1 FROM users_x_comercios uxc2
    WHERE uxc2.user_id = ku.user_id
      AND uxc2.comercio_id = uxc.comercio_id
  );

-- Apuntar vínculos restantes al keeper
UPDATE users_x_comercios uxc
SET user_id = ku.user_id
FROM keep_users ku, users u
WHERE uxc.user_id = u.user_id
  AND u.email = ku.email
  AND u.user_id != ku.user_id;

-- Borrar duplicados de users
DELETE FROM users u
WHERE u.user_id NOT IN (SELECT user_id FROM keep_users);

-- UNIQUE constraint para siempre
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

DROP TABLE keep_users;

COMMIT;

-- Verificación: debería devolver 0 filas
SELECT email, COUNT(*) as count FROM users GROUP BY email HAVING COUNT(*) > 1;
