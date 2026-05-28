-- CraftFlow: полное применение схемы §10 (пересоздание + Auth-совместимость)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Снять старую схему (миграция + RLS + Auth-триггер)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
DROP TRIGGER IF EXISTS trg_messages_updated_at ON public.messages;
DROP TRIGGER IF EXISTS trg_order_stages_updated_at ON public.order_stages;
DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS trg_masters_updated_at ON public.masters;
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS masters_updated_at ON public.masters;
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS order_stages_updated_at ON public.order_stages;

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

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

-- ENUM
CREATE TYPE public.user_role AS ENUM ('master', 'client', 'both');
CREATE TYPE public.order_status AS ENUM (
  'pending', 'active', 'in_progress', 'review', 'completed', 'cancelled'
);
CREATE TYPE public.escrow_status AS ENUM ('held', 'released', 'refunded');
CREATE TYPE public.stage_status AS ENUM (
  'pending', 'in_progress', 'submitted', 'approved', 'revision'
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- users: id = auth.users.id (для Supabase Auth в приложении)
CREATE TABLE public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email           VARCHAR(255),
  telegram_id     BIGINT,
  name            VARCHAR(255) NOT NULL,
  avatar_url      TEXT,
  role            public.user_role NOT NULL DEFAULT 'client',
  platform_origin VARCHAR(64) NOT NULL DEFAULT 'web',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE public.messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  body        TEXT,
  file_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_masters_updated_at
  BEFORE UPDATE ON public.masters FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_order_stages_updated_at
  BEFORE UPDATE ON public.order_stages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, platform_origin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(COALESCE(NEW.email, 'user'), '@', 1)),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'client'),
    COALESCE(NEW.raw_user_meta_data ->> 'platform_origin', 'web')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
