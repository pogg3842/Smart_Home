# ESP32 auto provision

Script nay tu dong dong bo ma ESP32 voi Supabase truoc khi nap firmware.

## Kiem tra truoc, chua ghi gi

```powershell
npm run esp32:provision -- --dry-run --home-code SMH-HOME-000001
```

Neu nha chua co trong Supabase, them `--create-home` de script tao nha:

```powershell
npm run esp32:provision -- --dry-run --home-code SMH-HOME-000001 --create-home
```

## Ghi Supabase + cap nhat CauHinh.h

```powershell
npm run esp32:provision -- --home-code SMH-HOME-000001
```

## Ghi Supabase + nap firmware ESP32

```powershell
npm run esp32:upload -- --home-code SMH-HOME-000001
```

## Tao ma ESP32 moi

```powershell
npm run esp32:upload -- --new --home-code SMH-HOME-000001 --name "Bo dieu khien tang 1"
```

## Tuy chon hay dung

- `--home-code SMH-HOME-000001`: gan ESP32 vao nha co ma nay.
- `--create-home`: tao nha neu `--home-code` chua ton tai.
- `--home-name "..."`: ten nha khi dung `--create-home`.
- `--new`: tao `ESP32_ID` moi.
- `--id SMH-GW-...`: dung ma ESP32 cu the.
- `--name "..."`: ten gateway hien tren web.
- `--ssid "Lac Hong University"`: ten Wi-Fi.
- `--wifi-password ""`: mat khau Wi-Fi rong.
- `--host 10.0.12.76`: IP backend/WebSocket.
- `--role control`: loai gateway, mac dinh la `control`.

Neu khong truyen `--home-code`, gateway se duoc tao trong Supabase nhung chua gan nha.
Khi do ESP32 chi ket noi duoc sau khi gateway duoc ghep nha tren web.
