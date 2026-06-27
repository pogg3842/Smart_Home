import { motion } from "motion/react";

import { cheDoUi } from "../js/cheDoUi.js";

const nutTabMotion = {
  whileTap: { scale: 0.92 },
  transition: { type: "spring", stiffness: 520, damping: 34, mass: 0.5 },
};

// Thanh điều khiển chuyển chế độ trên mobile
export default function ChuyenCheDoMobile({ cheDoHienTai, onChangeMode }) {
  const dangONangCao = cheDoHienTai === cheDoUi.NANG_CAO;

  return (
    <nav
      className={`chuyen-che-do-mobile ${dangONangCao ? "che-do-nang-cao" : "che-do-co-ban"}`}
      aria-label="Chọn chế độ hiển thị trên mobile"
    >
      <motion.button
        type="button"
        className={cheDoHienTai === cheDoUi.CO_BAN ? "dang-chon" : ""}
        onClick={() => onChangeMode(cheDoUi.CO_BAN)}
        {...nutTabMotion}
      >
        Cơ bản
      </motion.button>

      <motion.button
        type="button"
        className={dangONangCao ? "dang-chon" : ""}
        onClick={() => onChangeMode(cheDoUi.NANG_CAO)}
        {...nutTabMotion}
      >
        Nâng cao
      </motion.button>
    </nav>
  );
}
