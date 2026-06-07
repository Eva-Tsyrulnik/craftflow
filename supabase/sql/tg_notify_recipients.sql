-- RPC: кому слать Telegram-уведомление по заказу (другая сторона, не инициатор).
-- Выполнить в SQL Editor или: npm run db:tg-notify

create or replace function public.tg_notify_recipients(
  p_order_id uuid,
  p_actor_id uuid
)
returns table (telegram_id bigint)
language sql
security definer
set search_path = public
as $$
  select u.telegram_id
  from orders o
  join masters m on m.id = o.master_id
  join users u on u.id = case
    when p_actor_id = o.client_id then m.user_id
    when p_actor_id = m.user_id then o.client_id
    else null
  end
  where o.id = p_order_id
    and (p_actor_id = o.client_id or p_actor_id = m.user_id)
    and u.telegram_id is not null;
$$;

revoke all on function public.tg_notify_recipients(uuid, uuid) from public;
grant execute on function public.tg_notify_recipients(uuid, uuid) to authenticated;
