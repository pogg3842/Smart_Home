// Dữ liệu hệ thống mẫu để dựng UI/UX trước
export const trangThaiKetNoiMau = {
  esp32: {
    status: "online",
    detail: "WebSocket đã kết nối",
    latency: "24ms",
  },
  supabase: {
    status: "online",
    detail: "Database sẵn sàng",
    latency: "68ms",
  },
  wifi: {
    status: "online",
    detail: "Mạng ổn định",
    latency: "18ms",
  },
  server: {
    status: "warn",
    detail: "Đang kiểm tra backend",
    latency: "--",
  },
  auth: {
    status: "online",
    detail: "Không hardcode key",
    latency: "OK",
  },
};

export const nhatKyHeThongMau = [
  {
    id: 1,
    time: "22:41",
    level: "success",
    title: "ESP32 connected",
    detail: "WebSocket handshake thành công",
  },
  {
    id: 2,
    time: "22:42",
    level: "info",
    title: "Device microphone ready",
    detail: "Trình duyệt sẵn sàng xin quyền microphone",
  },
  {
    id: 3,
    time: "22:43",
    level: "success",
    title: "Supabase ping",
    detail: "Kết nối database phản hồi ổn định",
  },
  {
    id: 4,
    time: "22:44",
    level: "warn",
    title: "Backend pending",
    detail: "Backend thật xử lý lệnh và quyền truy cập",
  },
];

export const thongTinHeThongMau = [
  {
    label: "Frontend",
    value: "React + Vite",
  },
  {
    label: "Audio input",
    value: "Device Mic",
  },
  {
    label: "ESP32 Mic",
    value: "Không dùng",
  },
  {
    label: "Mode PC",
    value: "Full chức năng",
  },
];
