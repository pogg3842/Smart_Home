const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const esp32Dir = path.join(rootDir, "esp32", "SMHOME_ESP32_Realtime");
const configPath = path.join(esp32Dir, "include", "CauHinh.h");
const envPath = path.join(rootDir, ".env");

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;

    const raw = item.slice(2);
    const eq = raw.indexOf("=");
    if (eq !== -1) {
      args[raw.slice(0, eq)] = raw.slice(eq + 1);
      continue;
    }

    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[raw] = true;
    } else {
      args[raw] = next;
      i += 1;
    }
  }

  return args;
}

function loadEnv(filePath) {
  const env = {};
  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return env;
}

function readMacro(content, name) {
  const match = content.match(new RegExp(`#define\\s+${name}\\s+"([^"]*)"`));
  return match ? match[1] : "";
}

function readNumberMacro(content, name) {
  const match = content.match(new RegExp(`#define\\s+${name}\\s+(\\d+)`));
  return match ? Number(match[1]) : undefined;
}

function replaceStringMacro(content, name, value) {
  const escaped = String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pattern = new RegExp(`(#define\\s+${name}\\s+)"[^"]*"`);
  if (!pattern.test(content)) throw new Error(`Khong tim thay macro ${name} trong CauHinh.h`);
  return content.replace(pattern, `$1"${escaped}"`);
}

function replaceNumberMacro(content, name, value) {
  const pattern = new RegExp(`(#define\\s+${name}\\s+)\\d+`);
  if (!pattern.test(content)) throw new Error(`Khong tim thay macro ${name} trong CauHinh.h`);
  return content.replace(pattern, `$1${Number(value)}`);
}

function makeGatewayId(role) {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `SMH-GW-${stamp}-${String(role || "CTRL").toUpperCase()}-${suffix}`;
}

function makeSecret() {
  return `smh_${crypto.randomBytes(32).toString("base64url")}`;
}

function makePairCode() {
  return `GW-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

async function supabaseRequest({ env, pathName, method = "GET", body, prefer }) {
  const url = `${env.SUPABASE_URL}/rest/v1/${pathName}`;
  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  };

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (prefer) headers.Prefer = prefer;

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = text;
    }
  }

  if (!response.ok) {
    const message = typeof data === "string" ? data : data?.message || response.statusText;
    throw new Error(`Supabase ${method} ${pathName} failed: ${message}`);
  }

  return data;
}

async function findHome(env, homeCode) {
  if (!homeCode) return null;

  const rows = await supabaseRequest({
    env,
    pathName: `homes?home_code=eq.${encodeURIComponent(homeCode)}&select=id,home_code,name`,
  });

  if (!rows.length) {
    throw new Error(`Khong tim thay nha co home_code: ${homeCode}`);
  }

  return rows[0];
}

async function createHome(env, homeCode, homeName) {
  const rows = await supabaseRequest({
    env,
    pathName: "homes?on_conflict=home_code",
    method: "POST",
    body: {
      home_code: homeCode,
      name: homeName,
      service_status: "active",
      updated_at: new Date().toISOString(),
    },
    prefer: "resolution=merge-duplicates,return=representation",
  });

  return Array.isArray(rows) ? rows[0] : rows;
}

async function createDefaultRooms(env, homeId) {
  const rooms = [
    { home_id: homeId, area_name: "Tang 1", name: "Phong khach" },
    { home_id: homeId, area_name: "Tang 1", name: "Phong ngu" },
    { home_id: homeId, area_name: "Tang 1", name: "Bep" },
    { home_id: homeId, area_name: "Ngoai troi", name: "San" },
  ];

  await supabaseRequest({
    env,
    pathName: "rooms",
    method: "POST",
    body: rooms,
    prefer: "return=minimal",
  });
}

async function findOrCreateHome(env, { homeCode, homeName, createIfMissing, dryRun }) {
  if (!homeCode) return null;

  const rows = await supabaseRequest({
    env,
    pathName: `homes?home_code=eq.${encodeURIComponent(homeCode)}&select=id,home_code,name`,
  });

  if (rows.length) return rows[0];

  if (!createIfMissing) {
    throw new Error(
      `Khong tim thay nha co home_code: ${homeCode}. Neu muon tao tu dong, them --create-home.`,
    );
  }

  if (dryRun) {
    return {
      id: "(se tao khi chay that)",
      home_code: homeCode,
      name: homeName,
      willCreate: true,
    };
  }

  const home = await createHome(env, homeCode, homeName);
  await createDefaultRooms(env, home.id);
  return home;
}

async function findGateway(env, gatewayId) {
  const rows = await supabaseRequest({
    env,
    pathName: `esp32_devices?id=eq.${encodeURIComponent(gatewayId)}&select=id,home_id,pair_code`,
  });

  return rows[0] || null;
}

async function upsertGateway(env, payload) {
  const rows = await supabaseRequest({
    env,
    pathName: "esp32_devices?on_conflict=id",
    method: "POST",
    body: payload,
    prefer: "resolution=merge-duplicates,return=representation",
  });

  return Array.isArray(rows) ? rows[0] : rows;
}

function writeConfig(nextConfig) {
  let content = fs.readFileSync(configPath, "utf8");

  content = replaceStringMacro(content, "ESP32_ID", nextConfig.gatewayId);
  content = replaceStringMacro(content, "DEVICE_SECRET", nextConfig.deviceSecret);
  content = replaceStringMacro(content, "GATEWAY_NAME", nextConfig.gatewayName);
  content = replaceStringMacro(content, "WIFI_SSID", nextConfig.wifiSsid);
  content = replaceStringMacro(content, "WIFI_PASSWORD", nextConfig.wifiPassword);
  content = replaceStringMacro(content, "WS_HOST", nextConfig.wsHost);
  content = replaceNumberMacro(content, "WS_PORT", nextConfig.wsPort);

  fs.writeFileSync(configPath, content, "utf8");
}

function uploadFirmware() {
  const result = spawnSync("pio run -t upload", {
    cwd: esp32Dir,
    shell: true,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv(envPath);
  const currentConfig = fs.readFileSync(configPath, "utf8");

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Thieu SUPABASE_URL hoac SUPABASE_SERVICE_ROLE_KEY trong .env");
  }

  const role = String(args.role || "control").toLowerCase();
  const gatewayId = args.new
    ? makeGatewayId(role === "voice" ? "VOICE" : role === "sensor" ? "SENSOR" : "CTRL")
    : String(args.id || readMacro(currentConfig, "ESP32_ID"));
  const deviceSecret = String(args.secret || makeSecret());
  const gatewayName = String(args.name || readMacro(currentConfig, "GATEWAY_NAME") || gatewayId);
  const wifiSsid = String(args.ssid ?? readMacro(currentConfig, "WIFI_SSID"));
  const wifiPassword = String(args["wifi-password"] ?? readMacro(currentConfig, "WIFI_PASSWORD"));
  const wsHost = String(args.host || readMacro(currentConfig, "WS_HOST") || "10.0.12.76");
  const wsPort = Number(args.port || readNumberMacro(currentConfig, "WS_PORT") || 3000);
  const homeCode = args["home-code"] ? String(args["home-code"]) : "";
  const homeName = String(args["home-name"] || `Nha thong minh ${homeCode || gatewayId}`);
  const dryRun = Boolean(args["dry-run"]);

  const home = await findOrCreateHome(env, {
    homeCode,
    homeName,
    createIfMissing: Boolean(args["create-home"]),
    dryRun,
  });
  const existingGateway = dryRun ? null : await findGateway(env, gatewayId);
  const pairCode =
    args["pair-code"] ||
    (home ? null : existingGateway?.home_id ? existingGateway.pair_code || null : makePairCode());

  const payload = {
    id: gatewayId,
    name: gatewayName,
    device_secret: deviceSecret,
    gateway_role: role,
    status: "offline",
    updated_at: new Date().toISOString(),
  };

  if (args.location) payload.location_note = String(args.location);

  if (home) {
    payload.home_id = home.id;
    payload.pair_code = null;
    payload.paired_at = new Date().toISOString();
  } else if (!existingGateway?.home_id) {
    payload.pair_code = pairCode;
    payload.paired_at = null;
  }

  const nextConfig = {
    gatewayId,
    deviceSecret,
    gatewayName,
    wifiSsid,
    wifiPassword,
    wsHost,
    wsPort,
  };

  console.log("ESP32 provision:");
  console.log(`  ESP32_ID      : ${gatewayId}`);
  console.log(`  GATEWAY_NAME  : ${gatewayName}`);
  console.log(`  WIFI_SSID     : ${wifiSsid}`);
  console.log(`  WS            : ws://${wsHost}:${wsPort}/device`);
  console.log(`  HOME_CODE     : ${homeCode || "(chua gan nha)"}`);
  if (home?.willCreate) console.log(`  CREATE_HOME   : ${homeName}`);
  console.log(`  PAIR_CODE     : ${pairCode || "(khong dung)"}`);

  if (dryRun) {
    console.log("Dry-run: khong ghi CauHinh.h, khong ghi Supabase, khong upload firmware.");
    return;
  }

  const gateway = await upsertGateway(env, payload);
  writeConfig(nextConfig);

  console.log("Da ghi Supabase va CauHinh.h.");
  console.log(`Gateway trong Supabase: ${gateway.id}`);

  if (args.upload) {
    console.log("Dang nap firmware ESP32 bang PlatformIO...");
    uploadFirmware();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
