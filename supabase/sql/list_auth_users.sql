-- Список пользователей Auth → скопируйте id в seed_from_auth.sql
SELECT
  id,
  email,
  created_at,
  COALESCE(raw_user_meta_data ->> 'name', split_part(COALESCE(email, ''), '@', 1)) AS name
FROM auth.users
ORDER BY created_at;
