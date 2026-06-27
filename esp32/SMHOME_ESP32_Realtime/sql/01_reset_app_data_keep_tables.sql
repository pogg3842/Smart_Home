-- =====================================================
-- RESET DỮ LIỆU APP - GIỮ NGUYÊN CẤU TRÚC BẢNG
-- Chạy trong Supabase SQL Editor.
-- File này xóa dữ liệu nhà, gateway, thiết bị, log, phòng...
-- KHÔNG xóa tài khoản trong Authentication > Users.
-- =====================================================

do $$
declare
  table_list text;
begin
  select string_agg(format('%I.%I', schemaname, tablename), ', ')
  into table_list
  from pg_tables
  where schemaname = 'public'
    and tablename in (
      'device_logs',
      'smart_devices',
      'rooms',
      'esp32_devices',
      'home_members',
      'homes',
      'install_codes',
      'contracts',
      'customers',
      'admin_audit_logs'
    );

  if table_list is not null then
    execute 'truncate table ' || table_list || ' restart identity cascade';
  end if;
end $$;
