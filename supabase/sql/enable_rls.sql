-- CraftFlow: RLS по Product Book §10 «Правила доступа (RLS)»
-- Применение: npx supabase db query --file supabase/sql/enable_rls.sql --linked

-- ── Вспомогательные функции ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_order_participant(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    LEFT JOIN public.masters m ON m.id = o.master_id
    WHERE o.id = p_order_id
      AND (
        o.client_id = auth.uid()
        OR m.user_id = auth.uid()
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_order_master(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.masters m ON m.id = o.master_id
    WHERE o.id = p_order_id
      AND m.user_id = auth.uid()
  );
$$;

-- ── Сброс старых политик (идемпотентно) ───────────────────────────────────

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'users', 'masters', 'orders', 'order_stages', 'messages', 'reviews'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname,
      r.schemaname,
      r.tablename
    );
  END LOOP;
END;
$$;

-- ── ENABLE RLS ────────────────────────────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ── users: только свои; INSERT при регистрации; UPDATE только свои ─────────

CREATE POLICY users_select_own ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY users_select_master_public ON public.users
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.masters m WHERE m.user_id = users.id)
  );

CREATE POLICY users_insert_own ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── masters: публичные профили; INSERT/UPDATE/DELETE владелец ───────────────

CREATE POLICY masters_select_public ON public.masters
  FOR SELECT
  USING (true);

CREATE POLICY masters_insert_own ON public.masters
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
  );

CREATE POLICY masters_update_own ON public.masters
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY masters_delete_own ON public.masters
  FOR DELETE
  USING (auth.uid() = user_id);

-- ── orders: участники; INSERT заказчик; UPDATE участники; DELETE — ────────
-- Витрина §9.1: публичное чтение завершённых заказов

CREATE POLICY orders_select_participant ON public.orders
  FOR SELECT
  USING (
    auth.uid() = client_id
    OR auth.uid() = (
      SELECT m.user_id FROM public.masters m WHERE m.id = master_id
    )
  );

CREATE POLICY orders_select_completed_public ON public.orders
  FOR SELECT
  USING (status = 'completed');

CREATE POLICY orders_insert_client ON public.orders
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = client_id
  );

CREATE POLICY orders_update_participant ON public.orders
  FOR UPDATE
  USING (
    auth.uid() = client_id
    OR auth.uid() = (
      SELECT m.user_id FROM public.masters m WHERE m.id = master_id
    )
  )
  WITH CHECK (
    auth.uid() = client_id
    OR auth.uid() = (
      SELECT m.user_id FROM public.masters m WHERE m.id = master_id
    )
  );

-- ── order_stages: участники SELECT; INSERT/UPDATE только мастер ───────────

CREATE POLICY order_stages_select_participant ON public.order_stages
  FOR SELECT
  USING (public.is_order_participant(order_id));

CREATE POLICY order_stages_insert_master ON public.order_stages
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.is_order_master(order_id)
  );

CREATE POLICY order_stages_update_master ON public.order_stages
  FOR UPDATE
  USING (public.is_order_master(order_id))
  WITH CHECK (public.is_order_master(order_id));

-- ── messages: участники SELECT/INSERT ─────────────────────────────────────

CREATE POLICY messages_select_participant ON public.messages
  FOR SELECT
  USING (public.is_order_participant(order_id));

CREATE POLICY messages_insert_participant ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = sender_id
    AND public.is_order_participant(order_id)
  );

-- ── reviews: публичное чтение; INSERT заказчик после завершения ───────────

CREATE POLICY reviews_select_public ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY reviews_insert_client_completed ON public.reviews
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_id
        AND o.client_id = auth.uid()
        AND o.status = 'completed'
    )
  );

-- ── GRANT: после apply_schema.sql таблицы без прав для API-ролей ───────────
-- Без этого PostgREST отдаёт «permission denied for table …», даже при RLS.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
  TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public
  TO anon, authenticated, service_role;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;
