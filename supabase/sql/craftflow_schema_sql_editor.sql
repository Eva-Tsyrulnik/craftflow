-- =============================================================================
-- CraftFlow — схема БД для Supabase SQL Editor
-- Источник: Product Book §10 «Модель данных» (в шаблоне часто «§8»)
-- Без RLS — политики добавляются отдельным шагом
-- =============================================================================

-- ── 0. Расширение UUID ───────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. Пересоздание (раскомментируйте, если таблицы уже есть) ───────────────
/*
DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
DROP TRIGGER IF EXISTS trg_messages_updated_at ON public.messages;
DROP TRIGGER IF EXISTS trg_order_stages_updated_at ON public.order_stages;
DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS trg_masters_updated_at ON public.masters;
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;

DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.order_stages CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.masters CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

DROP TYPE IF EXISTS public.stage_status CASCADE;
DROP TYPE IF EXISTS public.escrow_status CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

DROP FUNCTION IF EXISTS public.set_updated_at();
*/

-- ── 2. ENUM-типы ─────────────────────────────────────────────────────────────
CREATE TYPE public.user_role AS ENUM ('master', 'client', 'both');

CREATE TYPE public.order_status AS ENUM (
  'pending',
  'active',
  'in_progress',
  'review',
  'completed',
  'cancelled'
);

CREATE TYPE public.escrow_status AS ENUM ('held', 'released', 'refunded');

CREATE TYPE public.stage_status AS ENUM (
  'pending',
  'in_progress',
  'submitted',
  'approved',
  'revision'
);

-- ── 3. Функция и триггеры updated_at ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── 4. Таблицы ───────────────────────────────────────────────────────────────

-- users (1 : 1 masters; 1 : N orders как заказчик)
CREATE TABLE public.users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           VARCHAR(255),
  telegram_id     BIGINT,
  name            VARCHAR(255) NOT NULL,
  avatar_url      TEXT,
  role            public.user_role NOT NULL DEFAULT 'client',
  platform_origin VARCHAR(64) NOT NULL DEFAULT 'web',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- masters (профиль мастера; FK → users)
CREATE TABLE public.masters (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  categories      TEXT[] NOT NULL DEFAULT '{}',
  bio             TEXT NOT NULL,
  portfolio_urls  TEXT[],
  price_from      INTEGER NOT NULL,
  rating          NUMERIC(3, 2),
  reviews_count   INTEGER NOT NULL DEFAULT 0,
  is_pro          BOOLEAN NOT NULL DEFAULT false,
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  promoted_until  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT masters_user_id_unique UNIQUE (user_id)
);

-- orders (FK → users client, masters)
CREATE TABLE public.orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id        UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  master_id        UUID NOT NULL REFERENCES public.masters (id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  description      TEXT NOT NULL,
  reference_urls   TEXT[],
  budget           INTEGER NOT NULL,
  deadline         DATE NOT NULL,
  status           public.order_status NOT NULL DEFAULT 'pending',
  escrow_id        VARCHAR(255),
  escrow_status    public.escrow_status,
  platform_origin  VARCHAR(64) NOT NULL DEFAULT 'web',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- order_stages (FK → orders)
CREATE TABLE public.order_stages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  status      public.stage_status NOT NULL DEFAULT 'pending',
  files_urls  TEXT[],
  comment     TEXT,
  sort_order  INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- messages (FK → orders, users)
CREATE TABLE public.messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  body        TEXT,
  file_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- reviews (1 : 1 с order; FK → orders, users, masters)
CREATE TABLE public.reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  reviewer_id  UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  master_id    UUID NOT NULL REFERENCES public.masters (id) ON DELETE CASCADE,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reviews_order_id_unique UNIQUE (order_id)
);

-- ── 5. Триггеры updated_at ───────────────────────────────────────────────────
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_masters_updated_at
  BEFORE UPDATE ON public.masters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_order_stages_updated_at
  BEFORE UPDATE ON public.order_stages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 6. Индексы на FK ─────────────────────────────────────────────────────────
CREATE INDEX idx_masters_user_id ON public.masters (user_id);

CREATE INDEX idx_orders_client_id ON public.orders (client_id);
CREATE INDEX idx_orders_master_id ON public.orders (master_id);
CREATE INDEX idx_orders_status ON public.orders (status);

CREATE INDEX idx_order_stages_order_id ON public.order_stages (order_id);

CREATE INDEX idx_messages_order_id ON public.messages (order_id);
CREATE INDEX idx_messages_sender_id ON public.messages (sender_id);

CREATE INDEX idx_reviews_order_id ON public.reviews (order_id);
CREATE INDEX idx_reviews_reviewer_id ON public.reviews (reviewer_id);
CREATE INDEX idx_reviews_master_id ON public.reviews (master_id);

-- =============================================================================
-- Тестовая запись (пример — выполните после создания таблиц)
-- =============================================================================
/*
INSERT INTO public.users (name, email, role, platform_origin)
VALUES ('Тест Заказчик', 'test@example.com', 'client', 'web')
RETURNING id;

-- подставьте user_id мастера:
INSERT INTO public.masters (user_id, categories, bio, price_from)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  ARRAY['art', 'merch'],
  'Тестовый мастер CraftFlow',
  5000
);
*/
