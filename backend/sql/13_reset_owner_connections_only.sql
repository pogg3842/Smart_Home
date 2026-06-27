-- Gỡ toàn bộ chủ/thành viên, giữ lại nhà, gateway, phòng, thiết bị.
-- Dùng khi muốn học lại luồng: ai nhập mã trước thì làm chủ.

delete from public.home_members;
update public.homes set owner_id = null, updated_at = now();
