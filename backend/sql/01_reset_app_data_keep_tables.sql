-- Xóa sạch dữ liệu app để học lại từ đầu, nhưng GIỮ cấu trúc bảng.
-- Không xóa tài khoản ở Authentication > Users.
-- Chạy trong Supabase SQL Editor.

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
