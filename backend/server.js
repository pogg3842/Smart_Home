require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");

const { router: routesDevices } = require("./src/routesDevices");
const { router: routesHomes } = require("./src/routesHomes");
const { router: routesGateways } = require("./src/routesGateways");
const { khoiTaoDeviceSocket } = require("./src/deviceSocket");
const { danhDauGatewayQuaHanOffline } = require("./src/deviceManager");

const app = express();
const port = Number(process.env.PORT || 3000);
const frontendDist = path.resolve(__dirname, "..", "frontend", "dist");
const corsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "smhome-real-server" });
});

app.use("/api", routesHomes);
app.use("/api", routesDevices);
app.use("/api", routesGateways);

// Server thật: cùng một cổng vừa chạy API/WebSocket, vừa phục vụ giao diện đã build.
if (fs.existsSync(path.join(frontendDist, "index.html"))) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api|\/health).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.get(/^(?!\/api|\/health).*/, (req, res) => {
    res.status(503).send(
      "Frontend chưa được build. Chạy: npm run build rồi mở lại http://localhost:" + port,
    );
  });
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
khoiTaoDeviceSocket(wss);

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Cong ${port} dang bi chiem. Hay tat cua so npm run dev cu hoac chay:`);
    console.error(`  npx kill-port ${port}`);
  } else {
    console.error("[Server] Loi khoi dong:", error);
  }
  process.exit(1);
});

// Watchdog: nếu ESP32 bị rút nguồn/mất WiFi mà WebSocket không báo close ngay,
// backend sẽ tự chuyển Gateway về Offline sau khi quá hạn heartbeat.
setInterval(() => {
  danhDauGatewayQuaHanOffline({ quaHanMs: 2000 }).catch((error) => {
    console.warn("[Watchdog] Lỗi:", error.message);
  });
}, 2000);

server.listen(port, () => {
  console.log(`SMHOME real app dang chay: http://localhost:${port}`);
  console.log(`ESP32 WebSocket path: ws://<IP_MAY_CHU>:${port}/device`);
  console.log("Gateway offline watchdog: bật, timeout 4 giây");
});
