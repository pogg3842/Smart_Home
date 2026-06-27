import { SendHorizontal, Terminal } from "lucide-react";
import { motion } from "motion/react";

// Component form nhập lệnh điều khiển
export default function ONhapLenh({ value, onChange, onSubmit }) {
  return (
    <article className="the-ui o-nhap-lenh">
      <div className="dau-the">
        <div>
          <p className="nhan-nho">TEXT COMMAND</p>
          <h2>Nhập lệnh điều khiển</h2>
        </div>
      </div>

      <form className="form-lenh" onSubmit={onSubmit}>

        <div className="khung-input">
          <input
            id="command-input"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="VD: bật đèn phòng khách"
          />

          <motion.button
            type="submit"
            aria-label="Gửi lệnh"
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 520, damping: 30, mass: 0.5 }}
          >
            <SendHorizontal size={18} />
          </motion.button>
        </div>
      </form>

      <div className="goi-y-lenh">
        <span>Bật hết đèn</span>
        <span>Tắt hết đèn</span>
        <span>Bật đèn khách</span>
      </div>
    </article>
  );
}
