import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider.jsx";

export default function DangNhap() {
  const { dangNhap, dangKy, authError, authMessage, dangTai } = useAuth();
  const [cheDo, setCheDo] = useState("dang-nhap");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const [loiNoiBo, setLoiNoiBo] = useState("");
  const [dangGui, setDangGui] = useState(false);

  const laDangKy = cheDo === "dang-ky";

  function doiCheDo(cheDoMoi) {
    setCheDo(cheDoMoi);
    setLoiNoiBo("");
    setXacNhanMatKhau("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoiNoiBo("");

    const emailDaNhap = email.trim();
    if (!emailDaNhap || !password) {
      setLoiNoiBo("Vui lòng nhập email và mật khẩu.");
      return;
    }

    if (laDangKy && password.length < 6) {
      setLoiNoiBo("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }

    if (laDangKy && password !== xacNhanMatKhau) {
      setLoiNoiBo("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setDangGui(true);
    const ketQua = laDangKy
      ? await dangKy(emailDaNhap, password)
      : await dangNhap(emailDaNhap, password);
    setDangGui(false);

    if (laDangKy && !ketQua.error) {
      setCheDo("dang-nhap");
      setPassword("");
      setXacNhanMatKhau("");
    }
  }

  return (
    <main className="app-shell man-hinh-dang-nhap">
      <div className="the-dang-nhap">
        <div className="logo-dang-nhap">
          <ShieldCheck size={28} />
        </div>

        <p className="nhan-nho">SMART HOME</p>
        <h1>{laDangKy ? "Đăng ký tài khoản" : "Đăng nhập"}</h1>
        <p className="mo-ta-dang-nhap">
          {laDangKy
            ? "Tạo tài khoản để bắt đầu quản lý nhà thông minh của bạn."
            : "Đăng nhập để xem và điều khiển thiết bị trong gia đình của bạn."}
        </p>

        <div className="tab-dang-nhap" role="tablist" aria-label="Chọn chế độ đăng nhập">
          <button
            type="button"
            className={cheDo === "dang-nhap" ? "dang-chon" : ""}
            onClick={() => doiCheDo("dang-nhap")}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={cheDo === "dang-ky" ? "dang-chon" : ""}
            onClick={() => doiCheDo("dang-ky")}
          >
            Đăng ký
          </button>
        </div>

        <form className="form-dang-nhap" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email tài khoản"
              autoComplete="email"
            />
          </label>

          <label>
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="mật khẩu"
              autoComplete={laDangKy ? "new-password" : "current-password"}
            />
          </label>

          {laDangKy && (
            <label>
              Nhập lại mật khẩu
              <input
                type="password"
                value={xacNhanMatKhau}
                onChange={(event) => setXacNhanMatKhau(event.target.value)}
                placeholder="nhập lại mật khẩu"
                autoComplete="new-password"
              />
            </label>
          )}

          {(loiNoiBo || authError) && (
            <p className="loi-dang-nhap">{loiNoiBo || authError}</p>
          )}

          {authMessage && <p className="thong-bao-dang-nhap">{authMessage}</p>}

          <button type="submit" disabled={dangGui || dangTai}>
            {dangGui
              ? laDangKy
                ? "Đang đăng ký..."
                : "Đang đăng nhập..."
              : laDangKy
                ? "Tạo tài khoản"
                : "Đăng nhập"}
          </button>
        </form>
      </div>
    </main>
  );
}
