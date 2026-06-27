import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabaseAuth } from "./supabaseAuthClient.js";
import { layHomesCuaToi, taoHomeMoi, nhanQuyenNhaBangMa, goKetNoiChuNha } from "../js/apiServer.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [homes, setHomes] = useState([]);
  const [activeHome, setActiveHome] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  async function taiHomes(sessionMoi) {
    const token = sessionMoi?.access_token;
    if (!token) {
      setHomes([]);
      setActiveHome(null);
      return [];
    }

    const ketQua = await layHomesCuaToi(token);
    if (ketQua.error) {
      setAuthError(ketQua.error.message || "Không tải được danh sách nhà");
      setHomes([]);
      setActiveHome(null);
      return [];
    }

    const danhSachHomes = ketQua.homes || [];
    setHomes(danhSachHomes);

    const homeDaLuu = localStorage.getItem("smhome_active_home_id");
    const homePhuHop =
      danhSachHomes.find((home) => home.id === homeDaLuu) || danhSachHomes[0] || null;

    setActiveHome(homePhuHop);
    if (homePhuHop?.id) {
      localStorage.setItem("smhome_active_home_id", homePhuHop.id);
    }

    return danhSachHomes;
  }

  useEffect(() => {
    let daHuy = false;

    async function khoiTao() {
      const { data } = await supabaseAuth.auth.getSession();
      if (daHuy) return;

      const sessionKhoiTao = data.session || null;
      setSession(sessionKhoiTao);
      setUser(sessionKhoiTao?.user || null);
      await taiHomes(sessionKhoiTao);
      if (!daHuy) setDangTai(false);
    }

    khoiTao();

    const { data: listener } = supabaseAuth.auth.onAuthStateChange(async (_event, sessionMoi) => {
      setSession(sessionMoi);
      setUser(sessionMoi?.user || null);
      setAuthError("");
      setAuthMessage("");
      await taiHomes(sessionMoi);
      setDangTai(false);
    });

    return () => {
      daHuy = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  function chonHome(home) {
    setActiveHome(home);
    if (home?.id) {
      localStorage.setItem("smhome_active_home_id", home.id);
    }
  }

  async function dangNhap(email, password) {
    setAuthError("");
    setAuthMessage("");

    const { error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message || "Không đăng nhập được");
      return { error };
    }

    return { error: null };
  }

  async function dangKy(email, password) {
    setAuthError("");
    setAuthMessage("");

    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message || "Không đăng ký được");
      return { error };
    }

    if (!data.session) {
      setAuthMessage(
        "Đăng ký thành công. Nếu Supabase yêu cầu xác nhận email, hãy xác nhận rồi đăng nhập.",
      );
    } else {
      setAuthMessage("Đăng ký thành công.");
    }

    return { error: null, data };
  }


  async function taoNha(name) {
    setAuthError("");
    setAuthMessage("");

    const token = session?.access_token;
    if (!token) {
      const error = new Error("Bạn cần đăng nhập trước khi tạo nhà");
      setAuthError(error.message);
      return { error };
    }

    const { home, error } = await taoHomeMoi(name, token);
    if (error) {
      setAuthError(error.message || "Không tạo được nhà");
      return { error };
    }

    localStorage.setItem("smhome_active_home_id", home.id);
    await taiHomes(session);
    setAuthMessage("Tạo nhà thành công.");
    return { home, error: null };
  }


  async function nhanNhaBangMa(homeCode) {
    setAuthError("");
    setAuthMessage("");

    const token = session?.access_token;
    if (!token) {
      const error = new Error("Bạn cần đăng nhập trước khi nhập mã thiết bị");
      setAuthError(error.message);
      return { error };
    }

    const { home, error } = await nhanQuyenNhaBangMa(homeCode, token);
    if (error) {
      setAuthError(error.message || "Không kết nối được mã thiết bị");
      return { error };
    }

    localStorage.setItem("smhome_active_home_id", home.id);
    await taiHomes(session);
    setAuthMessage("Kết nối nhà thành công. Tài khoản này hiện là chủ nhà.");
    return { home, error: null };
  }

  async function goChuNha(homeId) {
    setAuthError("");
    setAuthMessage("");

    const token = session?.access_token;
    if (!token) {
      const error = new Error("Bạn cần đăng nhập trước");
      setAuthError(error.message);
      return { error };
    }

    const { error, message } = await goKetNoiChuNha(homeId, token);
    if (error) {
      setAuthError(error.message || "Không gỡ được chủ nhà");
      return { error };
    }

    localStorage.removeItem("smhome_active_home_id");
    await taiHomes(session);
    setAuthMessage(message || "Đã gỡ kết nối chủ nhà.");
    return { error: null };
  }

  async function dangXuat() {
    await supabaseAuth.auth.signOut();
    localStorage.removeItem("smhome_active_home_id");
    setSession(null);
    setUser(null);
    setHomes([]);
    setActiveHome(null);
    setAuthError("");
    setAuthMessage("");
  }

  const value = useMemo(
    () => ({
      session,
      user,
      homes,
      activeHome,
      setActiveHome: chonHome,
      dangTai,
      authError,
      authMessage,
      dangNhap,
      dangKy,
      taoNha,
      nhanNhaBangMa,
      goChuNha,
      dangXuat,
    }),
    [session, user, homes, activeHome, dangTai, authError, authMessage],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải nằm trong AuthProvider");
  return context;
}
