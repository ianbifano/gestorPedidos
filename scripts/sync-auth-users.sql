-- Primero ver qué hay en auth.users
SELECT id, email, raw_user_meta_data, created_at
FROM auth.users;

-- Ver qué hay en public.users
SELECT * FROM public.users;

-- Sincronizar: insertar usuarios de auth.users que no existan en public.users
INSERT INTO public.users (username, email, password, "createdAt", "updatedAt")
SELECT
  COALESCE(
    NULLIF(u.raw_user_meta_data ->> 'username', ''),
    NULLIF(u.email, ''),
    'usuario'
  ),
  COALESCE(u.email, ''),
  'managed_by_supabase_auth',
  COALESCE(u.created_at, now()),
  COALESCE(u.updated_at, now())
FROM auth.users u
WHERE u.email IS NOT NULL
  AND u.email != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.email = u.email
  );
