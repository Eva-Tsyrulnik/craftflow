# Миграции Supabase (CLI)

Проект: **uaheyneplvflwsyyfwhe**  
Dashboard: https://supabase.com/dashboard/project/uaheyneplvflwsyyfwhe

## Какие ключи для чего

| Ключ | Где взять | Зачем |
|------|-----------|--------|
| **anon** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) | Project Settings → API | Уже есть. Только браузер/Next.js, **не для миграций**. |
| **Пароль БД** (`SUPABASE_DB_PASSWORD`) | Project Settings → **Database** → Database password (или Reset) | `npm run db:push` — применить SQL-миграции |
| **Access Token** (`SUPABASE_ACCESS_TOKEN`) | [Account → Access Tokens](https://supabase.com/dashboard/account/tokens) → Generate | CLI: логин и `link` без браузера |
| **service_role** | Project Settings → API → `service_role` **secret** | Сервер/Edge Functions. Для миграций **не обязателен**. |

## Настройка `.env.local` (добавьте две строки)

```env
SUPABASE_ACCESS_TOKEN=sbp_...
SUPABASE_DB_PASSWORD=ваш_пароль_от_postgres
```

Пароль — тот, что задавали при создании проекта (не anon JWT).

## Команды

```bash
npm run db:link    # один раз: привязка проекта (спросит пароль, если нет в env)
npm run db:push    # применить supabase/migrations/*.sql
npm run db:status  # что применено
```

Применить полную схему §10 (пересоздание таблиц, без RLS):

```bash
npx supabase db query --file supabase/sql/apply_schema.sql --linked
```

Схема для SQL Editor вручную: `supabase/sql/craftflow_schema_sql_editor.sql`

После применения каталог читает `masters` из БД.

## Демо-данные (seed из Auth)

1. Зарегистрируйте **двух** пользователей в приложении (`/signup`) — заказчик и мастер.
2. Посмотрите email / UUID:

```bash
npm run db:auth-users
```

3. Откройте `supabase/sql/seed_from_auth.sql` и замените `v_client_email` / `v_master_email`.
4. Примените seed:

```bash
npm run db:seed
```

После seed:

| URL | Что |
|-----|-----|
| `/catalog` | профиль мастера |
| `/order/b2222222-2222-4222-8222-222222222222` | заказ с этапами и чатом |
| `/showcase/c3333333-3333-4333-8333-333333333333` | завершённая витрина |
| `/dashboard` | войти как мастер — заявка «Вышивка на кепках» |
| `/orders` | войти как заказчик — список заказов |

Чат: войдите под заказчиком или мастером и откройте активный заказ — сообщения пишутся в `messages`.
