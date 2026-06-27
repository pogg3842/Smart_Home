import { useEffect, useRef, useState } from "react";
import { BedDouble, ChefHat, LampCeiling, Lock, LockOpen, ShieldCheck, Sofa } from "lucide-react";
import { motion } from "motion/react";

const iconMap = {
  khach: Sofa,
  ngu: BedDouble,
  bep: ChefHat,
  den: LampCeiling,
};

export default function OThietBi({ device, onToggle, onToggleMemberControl, isOwner }) {
  const Icon = iconMap[device.icon] || LampCeiling;
  const [vuaBam, setVuaBam] = useState(false);
  const timeoutRef = useRef(null);
  const biKhoaVoiMember = !device.memberCanControl;
  const khongDuocDieuKhien = !device.canControl;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleClick() {
    if (khongDuocDieuKhien) return;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    setVuaBam(false);
    window.requestAnimationFrame(() => {
      setVuaBam(true);
      timeoutRef.current = window.setTimeout(() => setVuaBam(false), 120);
    });

    onToggle();
  }

  return (
    <motion.article
      className={`o-thiet-bi ${device.isOn ? "dang-bat" : ""} ${vuaBam ? "vua-bam" : ""} ${khongDuocDieuKhien ? "bi-khoa-dieu-khien" : ""}`}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      <button type="button" className="nut-bat-tat-thiet-bi" onClick={handleClick} disabled={khongDuocDieuKhien}>
        <div className="hang-o-thiet-bi">
          <div className="icon-thiet-bi">
            <Icon size={24} />
          </div>

          <span className="cong-tac">
            <span />
          </span>
        </div>

        <div className="noi-dung-thiet-bi">
          <p>{device.room}</p>
          <h3>{device.name}</h3>
          <small>{khongDuocDieuKhien ? "Bị khóa quyền điều khiển" : device.isOn ? "Đang bật" : "Đang tắt"}</small>
          <em>{device.gatewayName || device.esp32Id}</em>
          <em>GPIO{device.gpioPin}</em>
        </div>
      </button>

      {isOwner && (
        <div className="hang-quyen-thiet-bi">
          <span><ShieldCheck size={13} /> Chủ nhà</span>
          <button
            type="button"
            className={biKhoaVoiMember ? "dang-khoa-member" : ""}
            onClick={() => onToggleMemberControl?.(device.id, !device.memberCanControl)}
          >
            {biKhoaVoiMember ? <Lock size={13} /> : <LockOpen size={13} />}
            {biKhoaVoiMember ? "Member bị khóa" : "Member được bật/tắt"}
          </button>
        </div>
      )}
    </motion.article>
  );
}
