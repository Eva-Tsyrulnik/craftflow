-- CraftFlow: демо-данные по пользователям из Supabase Auth
--
-- 1) Зарегистрируйте двух пользователей в приложении (/signup) или в Dashboard → Authentication
-- 2) Узнайте email (или UUID — см. supabase/sql/list_auth_users.sql)
-- 3) Замените email ниже и выполните:
--    npx supabase db query --file supabase/sql/seed_from_auth.sql --linked
--
-- Стабильные id заказов (для ссылок в README):
--   активный:  b2222222-2222-4222-8222-222222222222  → /order/b2222222-...
--   витрина:   c3333333-3333-4333-8333-333333333333  → /showcase/c3333333-...

DO $$
DECLARE
  -- ▼▼▼ Замените на ваши email из Authentication ▼▼▼
  v_client_email  text := 'client@craftflow.test';
  v_master_email  text := 'master@craftflow.test';
  -- ▲▲▲ или задайте UUID напрямую (оставьте email пустым '') ▲▲▲
  v_client_id     uuid;
  v_master_user_id uuid;
  v_master_id     uuid;
  v_order_active  uuid := 'b2222222-2222-4222-8222-222222222222';
  v_order_done    uuid := 'c3333333-3333-4333-8333-333333333333';
BEGIN
  -- Разрешить UUID напрямую (если email пустой — задайте id здесь)
  -- v_client_id := 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'::uuid;
  -- v_master_user_id := 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'::uuid;

  IF v_client_email <> '' THEN
    SELECT id INTO v_client_id FROM auth.users WHERE email = v_client_email;
  END IF;
  IF v_master_email <> '' THEN
    SELECT id INTO v_master_user_id FROM auth.users WHERE email = v_master_email;
  END IF;

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Клиент не найден в auth.users. Email: %. Создайте пользователя или укажите v_client_id в скрипте.', v_client_email;
  END IF;
  IF v_master_user_id IS NULL THEN
    RAISE EXCEPTION 'Мастер не найден в auth.users. Email: %. Создайте пользователя или укажите v_master_user_id в скрипте.', v_master_email;
  END IF;

  -- Профили public.users (на случай если триггер on_auth_user_created не сработал)
  INSERT INTO public.users (id, email, name, role, platform_origin)
  SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data ->> 'name', split_part(COALESCE(u.email, 'user'), '@', 1)),
    'client'::public.user_role,
    'web'
  FROM auth.users u
  WHERE u.id = v_client_id
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = 'client';

  INSERT INTO public.users (id, email, name, role, platform_origin)
  SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data ->> 'name', split_part(COALESCE(u.email, 'user'), '@', 1)),
    'master'::public.user_role,
    'web'
  FROM auth.users u
  WHERE u.id = v_master_user_id
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = 'master';

  -- Мастер в каталоге
  INSERT INTO public.masters (
    user_id, categories, bio, portfolio_urls, price_from,
    rating, reviews_count, is_pro, is_verified
  )
  VALUES (
    v_master_user_id,
    ARRAY['sewing', 'merch'],
    'Шью корпоративный мерч и худи под ключ. Согласование по этапам, доставка по РФ.',
    ARRAY[
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600'
    ],
    3500,
    4.85,
    12,
    true,
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    categories = EXCLUDED.categories,
    bio = EXCLUDED.bio,
    portfolio_urls = EXCLUDED.portfolio_urls,
    price_from = EXCLUDED.price_from,
    rating = EXCLUDED.rating,
    reviews_count = EXCLUDED.reviews_count,
    is_pro = EXCLUDED.is_pro,
    is_verified = EXCLUDED.is_verified
  RETURNING id INTO v_master_id;

  IF v_master_id IS NULL THEN
    SELECT id INTO v_master_id FROM public.masters WHERE user_id = v_master_user_id;
  END IF;

  -- Заказ в работе (чат + этапы)
  INSERT INTO public.orders (
    id, client_id, master_id, title, description, reference_urls,
    budget, deadline, status
  )
  VALUES (
    v_order_active,
    v_client_id,
    v_master_id,
    'Корпоративные худи с логотипом',
    '50 худи, вышивка на груди, цвет тёмно-синий. Нужны макеты до пятницы.',
    ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    45000,
    (CURRENT_DATE + INTERVAL '14 days')::date,
    'in_progress'
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    budget = EXCLUDED.budget,
    deadline = EXCLUDED.deadline;

  DELETE FROM public.order_stages WHERE order_id = v_order_active;
  INSERT INTO public.order_stages (order_id, name, status, sort_order) VALUES
    (v_order_active, 'ТЗ', 'approved', 1),
    (v_order_active, 'Эскиз', 'submitted', 2),
    (v_order_active, 'Производство', 'in_progress', 3),
    (v_order_active, 'Финал', 'pending', 4);

  DELETE FROM public.messages WHERE order_id = v_order_active;
  INSERT INTO public.messages (order_id, sender_id, body, created_at) VALUES
    (v_order_active, v_client_id, 'Добрый день! Прикрепила референс по цвету.', now() - INTERVAL '2 hours'),
    (v_order_active, v_master_user_id, 'Принял. Завтра пришлю эскиз на согласование.', now() - INTERVAL '1 hour');

  -- Завершённый заказ для витрины
  INSERT INTO public.orders (
    id, client_id, master_id, title, description, reference_urls,
    budget, deadline, status
  )
  VALUES (
    v_order_done,
    v_client_id,
    v_master_id,
    'Фестивальные худи — 50 шт.',
    'Корпоративные худи с вышивкой логотипа для летнего фестиваля. Согласование по этапам, доставка в срок.',
    ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'],
    52000,
    (CURRENT_DATE - INTERVAL '7 days')::date,
    'completed'
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = 'completed',
    reference_urls = EXCLUDED.reference_urls;

  -- Заявка «ожидает» для дашборда мастера
  INSERT INTO public.orders (
    client_id, master_id, title, description, budget, deadline, status
  )
  SELECT
    v_client_id,
    v_master_id,
    'Вышивка на кепках (тестовая заявка)',
    '20 кепок, логотип 5×5 см',
    12000,
    (CURRENT_DATE + INTERVAL '21 days')::date,
    'pending'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.orders
    WHERE client_id = v_client_id
      AND master_id = v_master_id
      AND title = 'Вышивка на кепках (тестовая заявка)'
  );

  -- Отзыв на завершённый заказ
  INSERT INTO public.reviews (order_id, reviewer_id, master_id, rating, text)
  VALUES (
    v_order_done,
    v_client_id,
    v_master_id,
    5,
    'Всё в срок, качество отличное. Рекомендую!'
  )
  ON CONFLICT (order_id) DO UPDATE SET
    rating = EXCLUDED.rating,
    text = EXCLUDED.text;

  RAISE NOTICE 'Seed OK. client_id=%, master_user_id=%, master_id=%', v_client_id, v_master_user_id, v_master_id;
  RAISE NOTICE 'Активный заказ: /order/%', v_order_active;
  RAISE NOTICE 'Витрина: /showcase/%', v_order_done;
END;
$$;
