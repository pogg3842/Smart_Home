import { Clock3, FileTerminal } from "lucide-react";

// Component danh sách log hệ thống
export default function LogHeThong({ logs }) {
  return (
    <article className="the-ui log-he-thong">
      <div className="dau-the">
        <div>
          <p className="nhan-nho">SYSTEM LOG</p>
          <h2>Log hệ thống</h2>
        </div>

        <FileTerminal size={22} />
      </div>

      <div className="danh-sach-log">
        {logs.map((log) => (
          <div className={`dong-log ${log.level}`} key={log.id}>
            <div className="thoi-gian-log">
              <Clock3 size={14} />
              {log.time}
            </div>

            <div>
              <strong>{log.title}</strong>
              <p>{log.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
