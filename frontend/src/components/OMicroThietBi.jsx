import { Mic, Smartphone, Waves } from "lucide-react";
import { motion } from "motion/react";

// Component mô phỏng microphone thiết bị
export default function OMicroThietBi() {
  return (
    <article className="the-ui o-micro">
      <div className="dau-the">
        <div>
          <p className="nhan-nho">DEVICE MICROPHONE</p>
          <h2>Microphone thiết bị</h2>
        </div>
      </div>  
      <div className="mic-core">
        <div className="mic-vong mic-vong-ngoai" />
        <div className="mic-vong mic-vong-giua" />

        <motion.button
          className="nut-mic"
          type="button"
          aria-label="Bật microphone thiết bị"
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 520, damping: 30, mass: 0.5 }}
        >
          <Mic size={34} />
        </motion.button>
      </div>

      <div className="song-am" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </article>
  );
}
