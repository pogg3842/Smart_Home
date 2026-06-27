const { execFileSync, spawn } = require("child_process");

function run(name, command) {
  const child = spawn(command, {
    cwd: __dirname,
    shell: true,
    stdio: "inherit",
    windowsHide: false,
  });

  child.on("error", (error) => {
    console.error(`[${name}] Khong khoi dong duoc:`, error.message);
  });

  return child;
}

const processes = [
  run("backend", "npm --prefix backend run dev"),
  run("frontend", "npm --prefix frontend run dev"),
];

function stopAll() {
  for (const child of processes) {
    if (child.killed) continue;

    if (process.platform === "win32") {
      try {
        execFileSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
      } catch (_) {
        child.kill();
      }
    } else {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopAll();
  process.exit(0);
});

for (const child of processes) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      stopAll();
      process.exit(code);
    }
  });
}
