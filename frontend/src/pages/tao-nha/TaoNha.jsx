import { useState } from "react";
import { Home, KeyRound, LogOut } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider.jsx";

export default function TaoNha() {
  const { nhanNhaBangMa, dangXuat, authError } = useAuth();
  const [maThietBi, setMaThietBi] = useState("SMH-HOME-000001");
  const [dangGui, setDangGui] = useState(false);
  const [loiForm, setLoiForm] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const code = maThietBi.trim().toUpperCase().replace(/\s+/g, "");

    if (code.length < 6) {
      setLoiForm("Mã thiết bị/mã nhà không hợp lệ");
      return;
    }

    setLoiForm("");
    setDangGui(true);
    const { error } = await nhanNhaBangMa(code);
    setDangGui(false);

    if (error) {
      setLoiForm(error.message || "Không kết nối được nhà");
    }
  }

  return (
    <main className="app-shell man-hinh-dang-nhap">
      <div className="the-dang-nhap">
        <div className="logo-dang-nhap">
          <Home size={28} />
        </div>

        <p className="nhan-nho">SMART HOME V8</p>
        <h1>Kết nối nhà bằng 1 mã</h1>
        <p className="mo-ta-dang-nhap">
          Nhập mã thiết bị/mã nhà do nhân viên lắp đặt cung cấp. Tài khoản nhập đầu tiên sẽ trở thành chủ nhà.
        </p>

        <form className="form-dang-nhap" onSubmit={handleSubmit}>
          <label>
            Mã thiết bị / mã nhà
            <div className="input-co-icon">
              <KeyRound size={17} />
              <input
                type="text"
                value={maThietBi}
                onChange={(event) => setMaThietBi(event.target.value)}
                placeholder="VD: SMH-HOME-000001"
                autoComplete="off"
                maxLength={40}
              />
            </div>
          </label>

          {(loiForm || authError) && <p className="loi-dang-nhap">{loiForm || authError}</p>}

          <button type="submit" disabled={dangGui}>
            {dangGui ? "Đang kết nối..." : "Kết nối và nhận quyền chủ nhà"}
          </button>
        </form>

        <p className="goi-y-ma-nha">
          Test nhanh: chạy SQL <strong>11_seed_home_000001_2esp32.sql</strong>, sau đó nhập <strong>SMH-HOME-000001</strong>.
        </p>

        <button className="nut-phu-dang-nhap nut-dang-xuat-nho" type="button" onClick={dangXuat}>
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </main>
  );
}
