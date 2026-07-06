-- Migracion: modelo de roles (cliente/vendedor).
-- Ejecutar en el SQL Editor de Supabase.

BEGIN;

CREATE TABLE IF NOT EXISTS perfiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'vendedor')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own perfil" ON perfiles;
CREATE POLICY "Users can view own perfil" ON perfiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- El rol se fija en el registro (user_metadata) y se copia acá via trigger,
-- corre con privilegios del owner asi funciona aunque el signup quede
-- pendiente de confirmacion de email (sin sesion todavia).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (user_id, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'cliente'))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill de usuarios existentes sin perfil (quedan como 'vendedor' porque
-- la app nacio pensada solo para vendedores).
INSERT INTO public.perfiles (user_id, role)
SELECT id, 'vendedor' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
