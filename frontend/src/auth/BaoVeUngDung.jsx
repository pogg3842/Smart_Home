import App from "../App.jsx";
import DangNhap from "../pages/dang-nhap/DangNhap.jsx";
import TaoNha from "../pages/tao-nha/TaoNha.jsx";
import { useAuth } from "./AuthProvider.jsx";

export default function BaoVeUngDung() {
  const { session, activeHome, dangTai } = useAuth();

  if (dangTai) {
    return (
      <main className="app-shell man-hinh-dang-nhap">
        <div className="the-dang-nhap">
          <p className="nhan-nho">SMHOME</p>
          <h1>Đang kiểm tra đăng nhập...</h1>
        </div>
      </main>
    );
  }

  if (!session) return <DangNhap />;

  if (!activeHome) return <TaoNha />;

  return <App />;
}
