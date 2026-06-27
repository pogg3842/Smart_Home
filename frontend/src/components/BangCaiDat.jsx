import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check, Home, Layers3, Pencil, Plus, Settings, Trash2, X } from "lucide-react";
import { motion } from "motion/react";

import {
  docCauHinhNha,
  luuCauHinhNha,
  suaKhuVuc,
  suaPhong,
  suaThietBi,
  themKhuVuc,
  themPhong,
  xoaKhuVuc,
  xoaPhong,
  xoaThietBi,
} from "../js/xuLyCaiDat.js";

const nutMem = {
  whileTap: { scale: 0.96 },
  transition: { type: "spring", stiffness: 520, damping: 34, mass: 0.5 },
};

const GPIO_MAC_DINH = [
  { port: 1, pin: 14, label: "Cổng 1 - GPIO14" },
  { port: 2, pin: 26, label: "Cổng 2 - GPIO26" },
  { port: 3, pin: 33, label: "Cổng 3 - GPIO33" },
  { port: 4, pin: 18, label: "Cổng 4 - GPIO18" },
  { port: 5, pin: 22, label: "Cổng 5 - GPIO22" },
  { port: 6, pin: 21, label: "Cổng 6 - GPIO21" },
];

const formRong = {
  type: "",
  value: "",
  loaiThietBi: "",
  esp32Id: "",
  gpioPin: "",
  target: {},
};

// Panel cài đặt: thêm thiết bị thủ công theo Gateway + GPIO.
export default function BangCaiDat({
  mo,
  onDong,
  cauHinhNhaTuServer = [],
  gateways = [],
  activeHome,
  onDataChanged,
  onReleaseOwner,
}) {
  const [cauHinh, setCauHinh] = useState(() => docCauHinhNha());
  const [khuVucIdDangChon, setKhuVucIdDangChon] = useState("tang-1");
  const [phongIdDangChon, setPhongIdDangChon] = useState("");
  const [capMobile, setCapMobile] = useState("khu-vuc");
  const [form, setForm] = useState(formRong);

  useEffect(() => {
    if (!mo) return;
    const tuServer = Array.isArray(cauHinhNhaTuServer) ? cauHinhNhaTuServer : [];
    setCauHinh(tuServer.length > 0 ? tuServer : docCauHinhNha());
  }, [mo, cauHinhNhaTuServer]);

  useEffect(() => {
    luuCauHinhNha(cauHinh);
    window.dispatchEvent(new CustomEvent("cau-hinh-nha-thay-doi", { detail: cauHinh }));
  }, [cauHinh]);

  useEffect(() => {
    if (!mo) return undefined;
    const overflowCu = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowCu;
    };
  }, [mo]);

  const khuVucDangChon = useMemo(
    () => cauHinh.find((khuVuc) => khuVuc.id === khuVucIdDangChon) ?? cauHinh[0],
    [cauHinh, khuVucIdDangChon],
  );

  const phongDangChon = useMemo(() => {
    if (!khuVucDangChon) return null;
    return khuVucDangChon.phong.find((phong) => phong.id === phongIdDangChon) ?? null;
  }, [khuVucDangChon, phongIdDangChon]);

  const gatewayDauTien = gateways.find((gateway) => (gateway.gateway_role || "control") !== "voice")?.id || "";

  if (!mo) return null;

  function layGateway(esp32Id) {
    return gateways.find((gateway) => gateway.id === esp32Id) || null;
  }

  function layDanhSachPin(esp32Id) {
    return layGateway(esp32Id)?.available_pins || GPIO_MAC_DINH;
  }

  function layPinsDaDung(esp32Id, boQuaThietBiId = "") {
    const pins = new Set();
    for (const khuVuc of cauHinh) {
      for (const phong of khuVuc.phong) {
        for (const thietBi of phong.thietBi) {
          if (thietBi.id === boQuaThietBiId) continue;
          if (thietBi.esp32Id === esp32Id && thietBi.gpioPin !== undefined) {
            pins.add(Number(thietBi.gpioPin));
          }
        }
      }
    }
    return pins;
  }

  function moForm(type, target = {}, value = "", loaiThietBi = "") {
    const esp32Id = target.esp32Id || gatewayDauTien;
    setForm({
      type,
      target,
      value,
      loaiThietBi,
      esp32Id,
      gpioPin: target.gpioPin !== undefined && target.gpioPin !== null ? String(target.gpioPin) : "",
    });
  }

  function dongForm() {
    setForm(formRong);
  }

  function chonKhuVuc(khuVucId) {
    setKhuVucIdDangChon(khuVucId);
    setPhongIdDangChon("");
    setCapMobile("phong");
    dongForm();
  }

  function chonPhong(phongId) {
    setPhongIdDangChon(phongId);
    setCapMobile("thiet-bi");
    dongForm();
  }

  function quayLaiMobile() {
    if (capMobile === "thiet-bi") {
      setCapMobile("phong");
      return;
    }
    if (capMobile === "phong") {
      setPhongIdDangChon("");
      setCapMobile("khu-vuc");
      return;
    }
    onDong();
  }

  async function handleSubmitForm(event) {
    event.preventDefault();

    if (form.type === "them-khu-vuc") {
      setCauHinh((current) => themKhuVuc(current, form.value));
      dongForm();
      return;
    }

    if (form.type === "sua-khu-vuc") {
      setCauHinh((current) => suaKhuVuc(current, form.target.khuVucId, form.value));
      dongForm();
      return;
    }

    if (form.type === "them-phong" && khuVucDangChon) {
      setCauHinh((current) => themPhong(current, khuVucDangChon.id, form.value));
      dongForm();
      return;
    }

    if (form.type === "sua-phong" && khuVucDangChon) {
      setCauHinh((current) => suaPhong(current, khuVucDangChon.id, form.target.phongId, form.value));
      dongForm();
      return;
    }

    if (form.type === "them-thiet-bi" && khuVucDangChon && phongDangChon) {
      if (!gatewaysDieuKhien.length) {
        window.alert("Nhà này chưa có Gateway điều khiển GPIO/relay.");
        return;
      }
      if (!form.esp32Id || !form.gpioPin) {
        window.alert("Hãy chọn Gateway và GPIO điều khiển.");
        return;
      }

      const [{ taoThietBiServer }, { layAccessTokenHienTai }] = await Promise.all([
        import("../js/apiServer.js"),
        import("../auth/supabaseAuthClient.js"),
      ]);
      const token = await layAccessTokenHienTai();
      const { error } = await taoThietBiServer({
        homeId: activeHome?.id,
        esp32Id: form.esp32Id,
        gpioPin: Number(form.gpioPin),
        deviceName: form.value,
        deviceType: form.loaiThietBi,
        areaName: khuVucDangChon.ten,
        roomName: phongDangChon.ten,
        icon: "den",
      }, token);

      if (error) {
        window.alert(`Không thêm được thiết bị: ${error.message}`);
        return;
      }

      await onDataChanged?.();
      dongForm();
      return;
    }

    if (form.type === "sua-thiet-bi" && khuVucDangChon && phongDangChon) {
      const [{ capNhatThietBiServer }, { layAccessTokenHienTai }] = await Promise.all([
        import("../js/apiServer.js"),
        import("../auth/supabaseAuthClient.js"),
      ]);
      const token = await layAccessTokenHienTai();
      const { error } = await capNhatThietBiServer(form.target.thietBiId, {
        deviceName: form.value,
        deviceType: form.loaiThietBi,
        esp32Id: form.esp32Id,
        gpioPin: Number(form.gpioPin),
        areaName: khuVucDangChon.ten,
        roomName: phongDangChon.ten,
      }, token);

      if (error) {
        window.alert(`Không cập nhật được thiết bị: ${error.message}`);
        return;
      }

      setCauHinh((current) =>
        suaThietBi(current, khuVucDangChon.id, phongDangChon.id, form.target.thietBiId, {
          ten: form.value,
          loai: form.loaiThietBi,
        }),
      );
      await onDataChanged?.();
      dongForm();
    }
  }

  function handleXoaKhuVuc(khuVuc) {
    const dongY = window.confirm(`Xóa ${khuVuc.ten}? Toàn bộ phòng và thiết bị bên trong cũng sẽ bị xóa khỏi giao diện cục bộ.`);
    if (!dongY) return;
    setCauHinh((current) => xoaKhuVuc(current, khuVuc.id));
    setKhuVucIdDangChon("");
    setPhongIdDangChon("");
    setCapMobile("khu-vuc");
  }

  function handleXoaPhong(phong) {
    if (!khuVucDangChon) return;
    const dongY = window.confirm(`Xóa ${phong.ten}? Các thiết bị trong phòng này nên được xóa thủ công trước.`);
    if (!dongY) return;
    setCauHinh((current) => xoaPhong(current, khuVucDangChon.id, phong.id));
    setPhongIdDangChon("");
    setCapMobile("phong");
  }

  async function handleXoaThietBi(thietBi) {
    if (!khuVucDangChon || !phongDangChon) return;

    const dongY = window.confirm(`Xóa thiết bị ${thietBi.ten}?`);
    if (!dongY) return;

    const [{ xoaThietBiServer }, { layAccessTokenHienTai }] = await Promise.all([
      import("../js/apiServer.js"),
      import("../auth/supabaseAuthClient.js"),
    ]);
    const token = await layAccessTokenHienTai();
    const { error } = await xoaThietBiServer(thietBi.id, token);

    if (error) {
      window.alert(`Không xóa được thiết bị trên server: ${error.message}`);
      return;
    }

    setCauHinh((current) => xoaThietBi(current, khuVucDangChon.id, phongDangChon.id, thietBi.id));
    await onDataChanged?.();
  }

  const gatewaysDieuKhien = gateways.filter((gateway) => (gateway.gateway_role || "control") !== "voice");
  const moDuocThemThietBi = Boolean(phongDangChon) && gatewaysDieuKhien.length > 0;

  return createPortal(
    <div className="lop-phu-cai-dat" role="dialog" aria-modal="true" aria-label="Cài đặt nhà thông minh">
      <motion.section
        className={`bang-cai-dat cap-mobile-${capMobile}`}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="dau-cai-dat">
          <button type="button" className="nut-quay-lai-cai-dat" onClick={quayLaiMobile} aria-label="Quay lại">
            <ArrowLeft size={18} />
          </button>

          <div>
            <p className="nhan-nho">SETTINGS</p>
            <h2>Cài đặt nhà thông minh</h2>
          </div>

          <motion.button type="button" className="nut-dong-cai-dat" onClick={onDong} aria-label="Đóng cài đặt" {...nutMem}>
            <X size={18} />
          </motion.button>
        </header>

        <div className="duong-dan-cai-dat" aria-label="Vị trí hiện tại">
          <span className="item-goc">Cài đặt</span>
          {capMobile !== "khu-vuc" && khuVucDangChon && <span className="item-phu">{khuVucDangChon.ten}</span>}
          {capMobile === "thiet-bi" && phongDangChon && <span className="item-phu">{phongDangChon.ten}</span>}
        </div>

        <section className="the-thong-tin-nha-v8">
          <div>
            <p className="nhan-nho">MÃ NHÀ</p>
            <strong>{activeHome?.home_code || "Chưa có mã"}</strong>
            <span>{activeHome?.name || "Nhà thông minh"} · {activeHome?.role === "owner" ? "Chủ nhà" : "Thành viên"}</span>
          </div>
          {activeHome?.role === "owner" && (
            <button type="button" className="nut-go-chu-nha" onClick={onReleaseOwner}>
              Gỡ kết nối chủ nhà
            </button>
          )}
        </section>

        <section className="the-gateway-v8">
          <p className="nhan-nho">GATEWAY NỘI BỘ</p>
          <div className="ds-gateway-v8">
            {gateways.length === 0 ? (
              <span>Chưa có Gateway trong mã nhà này.</span>
            ) : gateways.map((gateway) => (
              <span key={gateway.id} className={`tag-gateway-v8 ${gateway.status || "offline"}`}>
                {gateway.name || gateway.id} · {gateway.gateway_role || "control"} · {gateway.status || "offline"}
              </span>
            ))}
          </div>
        </section>

        <div className="luoi-cai-dat">
          <CotCaiDat
            className="cot-khu-vuc"
            icon={Layers3}
            title="Khu vực"
            description="Quản lý tầng hoặc khu vực trong nhà."
            actionLabel="Thêm khu vực"
            onAdd={() => moForm("them-khu-vuc")}
          >
            {form.type === "them-khu-vuc" && (
              <FormNhanh title="Thêm khu vực" placeholder="Ví dụ: Tầng 2" form={form} onChangeForm={setForm} onSubmit={handleSubmitForm} onCancel={dongForm} />
            )}

            <div className="danh-sach-cai-dat">
              {cauHinh.map((khuVuc) => (
                <DongQuanLy
                  key={khuVuc.id}
                  dangChon={khuVucDangChon?.id === khuVuc.id}
                  title={khuVuc.ten}
                  subtitle={`${khuVuc.phong.length} phòng`}
                  onClick={() => chonKhuVuc(khuVuc.id)}
                  onEdit={() => moForm("sua-khu-vuc", { khuVucId: khuVuc.id }, khuVuc.ten)}
                  onDelete={() => handleXoaKhuVuc(khuVuc)}
                />
              ))}
            </div>

            {form.type === "sua-khu-vuc" && (
              <FormNhanh title="Sửa tên khu vực" placeholder="Tên khu vực" form={form} onChangeForm={setForm} onSubmit={handleSubmitForm} onCancel={dongForm} />
            )}
          </CotCaiDat>

          <CotCaiDat
            className="cot-phong"
            icon={Home}
            title={khuVucDangChon ? `Phòng trong ${khuVucDangChon.ten}` : "Phòng"}
            description="Chọn khu vực để thêm hoặc sửa phòng."
            actionLabel="Thêm phòng"
            disabled={!khuVucDangChon}
            onAdd={() => moForm("them-phong")}
          >
            {!khuVucDangChon && <TrangThaiRong text="Chưa có khu vực nào. Hãy thêm khu vực trước." />}

            {khuVucDangChon && form.type === "them-phong" && (
              <FormNhanh title="Thêm phòng" placeholder="Ví dụ: Phòng làm việc" form={form} onChangeForm={setForm} onSubmit={handleSubmitForm} onCancel={dongForm} />
            )}

            {khuVucDangChon && khuVucDangChon.phong.length === 0 && <TrangThaiRong text="Khu vực này chưa có phòng nào." />}

            <div className="danh-sach-cai-dat">
              {khuVucDangChon?.phong.map((phong) => (
                <DongQuanLy
                  key={phong.id}
                  dangChon={phongDangChon?.id === phong.id}
                  title={phong.ten}
                  subtitle={`${phong.thietBi.length} thiết bị`}
                  onClick={() => chonPhong(phong.id)}
                  onEdit={() => moForm("sua-phong", { phongId: phong.id }, phong.ten)}
                  onDelete={() => handleXoaPhong(phong)}
                />
              ))}
            </div>

            {form.type === "sua-phong" && (
              <FormNhanh title="Sửa tên phòng" placeholder="Tên phòng" form={form} onChangeForm={setForm} onSubmit={handleSubmitForm} onCancel={dongForm} />
            )}
          </CotCaiDat>

          <CotCaiDat
            className="cot-thiet-bi"
            icon={Settings}
            title={phongDangChon ? `Thiết bị trong ${phongDangChon.ten}` : "Thiết bị"}
            description="Thêm thủ công thiết bị theo Gateway và GPIO điều khiển."
            actionLabel="Thêm thiết bị"
            disabled={!moDuocThemThietBi}
            onAdd={() => moForm("them-thiet-bi", {}, "", "Đèn")}
          >
            {!phongDangChon && <TrangThaiRong text="Chọn một phòng để xem thiết bị." />}
            {phongDangChon && gatewaysDieuKhien.length === 0 && <TrangThaiRong text="Nhà này chưa có Gateway điều khiển GPIO/relay." />}

            {phongDangChon && form.type === "them-thiet-bi" && (
              <FormNhanh
                title="Thêm thiết bị"
                placeholder="Ví dụ: Đèn học"
                coLoaiThietBi
                coCauHinhGpio
                gateways={gatewaysDieuKhien}
                danhSachPin={layDanhSachPin(form.esp32Id)}
                pinsDaDung={layPinsDaDung(form.esp32Id)}
                form={form}
                onChangeForm={setForm}
                onSubmit={handleSubmitForm}
                onCancel={dongForm}
              />
            )}

            {phongDangChon && phongDangChon.thietBi.length === 0 && <TrangThaiRong text="Phòng này chưa có thiết bị nào." />}

            <div className="danh-sach-cai-dat">
              {phongDangChon?.thietBi.map((thietBi) => (
                <DongQuanLy
                  key={thietBi.id}
                  dangChon={false}
                  title={thietBi.ten}
                  subtitle={`${thietBi.loai} · ${thietBi.gatewayName || thietBi.esp32Id || "Gateway"} · GPIO${thietBi.gpioPin}`}
                  onClick={() => moForm("sua-thiet-bi", {
                    thietBiId: thietBi.id,
                    esp32Id: thietBi.esp32Id,
                    gpioPin: thietBi.gpioPin,
                  }, thietBi.ten, thietBi.loai)}
                  onEdit={() => moForm("sua-thiet-bi", {
                    thietBiId: thietBi.id,
                    esp32Id: thietBi.esp32Id,
                    gpioPin: thietBi.gpioPin,
                  }, thietBi.ten, thietBi.loai)}
                  onDelete={() => handleXoaThietBi(thietBi)}
                />
              ))}
            </div>

            {form.type === "sua-thiet-bi" && (
              <FormNhanh
                title="Sửa thiết bị"
                placeholder="Tên thiết bị"
                coLoaiThietBi
                coCauHinhGpio
                gateways={gatewaysDieuKhien}
                danhSachPin={layDanhSachPin(form.esp32Id)}
                pinsDaDung={layPinsDaDung(form.esp32Id, form.target.thietBiId)}
                form={form}
                onChangeForm={setForm}
                onSubmit={handleSubmitForm}
                onCancel={dongForm}
              />
            )}
          </CotCaiDat>
        </div>
      </motion.section>
    </div>,
    document.body,
  );
}

function CotCaiDat({ className, icon: Icon, title, description, actionLabel, disabled, onAdd, children }) {
  return (
    <section className={`cot-cai-dat ${className}`}>
      <div className="dau-cot-cai-dat">
        <span className="icon-cot-cai-dat" aria-hidden="true"><Icon size={18} /></span>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <motion.button type="button" className="nut-them-cai-dat" disabled={disabled} onClick={onAdd} {...nutMem}>
        <Plus size={16} />
        {actionLabel}
      </motion.button>

      {children}
    </section>
  );
}

function DongQuanLy({ dangChon, title, subtitle, onClick, onEdit, onDelete }) {
  return (
    <motion.article className={`dong-quan-ly ${dangChon ? "dang-chon" : ""}`} {...nutMem}>
      <button type="button" className="noi-dung-dong-quan-ly" onClick={onClick}>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </button>

      <div className="hanh-dong-dong-quan-ly">
        <button type="button" aria-label={`Sửa ${title}`} onClick={(event) => { event.stopPropagation(); onEdit(); }}>
          <Pencil size={14} />
        </button>

        <button type="button" aria-label={`Xóa ${title}`} onClick={(event) => { event.stopPropagation(); onDelete(); }}>
          <Trash2 size={14} />
        </button>
      </div>
    </motion.article>
  );
}

function FormNhanh({
  title,
  placeholder,
  coLoaiThietBi,
  coCauHinhGpio,
  gateways = [],
  danhSachPin = GPIO_MAC_DINH,
  pinsDaDung = new Set(),
  form,
  onChangeForm,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="form-cai-dat" onSubmit={onSubmit}>
      <strong>{title}</strong>

      <input value={form.value} placeholder={placeholder} onChange={(event) => onChangeForm({ ...form, value: event.target.value })} />

      {coLoaiThietBi && (
        <input value={form.loaiThietBi} placeholder="Loại thiết bị, ví dụ: Đèn" onChange={(event) => onChangeForm({ ...form, loaiThietBi: event.target.value })} />
      )}

      {coCauHinhGpio && (
        <>
          <select
            value={form.esp32Id}
            onChange={(event) => onChangeForm({ ...form, esp32Id: event.target.value, gpioPin: "" })}
            required
          >
            <option value="">Chọn Gateway</option>
            {gateways.map((gateway) => (
              <option key={gateway.id} value={gateway.id}>
                {gateway.name || gateway.id} · {gateway.status || "offline"}
              </option>
            ))}
          </select>

          <select value={form.gpioPin} onChange={(event) => onChangeForm({ ...form, gpioPin: event.target.value })} required>
            <option value="">Chọn GPIO điều khiển</option>
            {danhSachPin.map((item) => {
              const pin = Number(item.pin);
              const daDung = pinsDaDung.has(pin);
              return (
                <option key={pin} value={pin} disabled={daDung}>
                  {item.label || `GPIO${pin}`}{daDung ? " · đã dùng" : ""}
                </option>
              );
            })}
          </select>

          <p className="goi-y-form-cai-dat">
            GPIO đã chọn là chân CONTROL. Không cắm trực tiếp GPIO xuống GND; hãy nối GPIO qua LED/relay đúng cách.
          </p>
        </>
      )}

      <div className="nut-form-cai-dat">
        <button type="button" onClick={onCancel}><X size={15} />Hủy</button>
        <button type="submit"><Check size={15} />Lưu</button>
      </div>
    </form>
  );
}

function TrangThaiRong({ text }) {
  return <p className="trang-thai-rong-cai-dat">{text}</p>;
}
