import { Info } from "lucide-react";

export default function ThongTinHeThong({ info }) {
  return (
    <article className="the-ui thong-tin-he-thong">
      <div className="dau-the">
        <div>
          <p className="nhan-nho">SYSTEM INFO</p>
          <h2>Thông tin</h2>
        </div>

        <Info size={22} />
      </div>

      <div className="luoi-thong-tin">
        {info.map((item) => (
          <div className="o-thong-tin" key={item.label}>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}
