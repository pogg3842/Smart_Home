import ChiTietKetNoi from "./ChiTietKetNoi.jsx";
import LogHeThong from "./LogHeThong.jsx";
import ThongTinHeThong from "./ThongTinHeThong.jsx";

import { nhatKyHeThongMau, thongTinHeThongMau } from "../js/duLieuHeThong.js";

// Bảng hiển thị thông tin nâng cao, log và chi tiết kết nối
export default function BangNangCao({ ketNoi }) {
  return (
    <div className="khu-nang-cao">
      <ChiTietKetNoi ketNoi={ketNoi} />
      <LogHeThong logs={nhatKyHeThongMau} />
      <ThongTinHeThong info={thongTinHeThongMau} />
    </div>
  );
}
