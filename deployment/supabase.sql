create table if not exists public.portfolio_records (id text primary key, kind text not null, data jsonb not null);
alter table public.portfolio_records enable row level security;
-- No anonymous or authenticated policies. Only the server service role accesses records.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio-media','portfolio-media',false,4194304,array['image/png','image/jpeg','image/webp','application/pdf'])
on conflict (id) do nothing;
create or replace function public.portfolio_rate_limit(record_id text,max_attempts int,now_ms bigint)
returns boolean language plpgsql security definer set search_path=public as $$
declare accepted text;
begin
 insert into portfolio_records(id,kind,data)
 values(record_id,'rate',jsonb_build_object('count',1,'until',now_ms+600000))
 on conflict(id) do update set data=jsonb_build_object(
 'count',case when (portfolio_records.data->>'until')::bigint<now_ms then 1 else (portfolio_records.data->>'count')::int+1 end,
 'until',case when (portfolio_records.data->>'until')::bigint<now_ms then now_ms+600000 else (portfolio_records.data->>'until')::bigint end)
 where (portfolio_records.data->>'until')::bigint<now_ms or (portfolio_records.data->>'count')::int<max_attempts
 returning id into accepted;
 return accepted is not null;
end; $$;
revoke all on function public.portfolio_rate_limit(text,int,bigint) from public,anon,authenticated;
grant execute on function public.portfolio_rate_limit(text,int,bigint) to service_role;
