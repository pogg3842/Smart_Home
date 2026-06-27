import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[Auth] Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY");
}

// Frontend chỉ dùng anon key để đăng nhập. Không bao giờ dùng service_role key ở đây.
export const supabaseAuth = createClient(supabaseUrl || "https://example.supabase.co", supabaseAnonKey || "missing-anon-key");

export async function layAccessTokenHienTai() {
  const { data } = await supabaseAuth.auth.getSession();
  return data.session?.access_token || "";
}
