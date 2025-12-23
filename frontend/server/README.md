# Chair-tracking Express backend

This small Express server accepts occupancy updates from an ESP32 and stores the last-known state in `chairs.json`.

Endpoints
- GET /health — simple health check
- POST /api/chairs — update chair state
  - Body (JSON): { "chairId": "chair-1", "is_occupied": true }
- GET /api/chairs — returns current stored state

Run (PowerShell)
```powershell
cd server
npm install
# start server and bind to all interfaces (0.0.0.0)
npm run start
```

ESP32 / Payload example
- Send a POST with Content-Type: application/json to http://<server-ip>:3001/api/chairs
- Example body:
```json
{ "chairId": "chair-1", "is_occupied": true }
```

Make the server reachable from other devices on your local network
- Find the machine's LAN IP (run in PowerShell):
```powershell
ipconfig
# look for "IPv4 Address" under your active network adapter
```
- Open Windows Firewall for TCP port 3001 (run as Administrator in PowerShell):
```powershell
New-NetFirewallRule -DisplayName "ChairTracking Port 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```
- Use the machine LAN IP in the curl from other devices on the same network:
```powershell
# PowerShell (use the machine LAN IP you found, e.g. 192.168.1.42)
Invoke-RestMethod -Uri 'http://192.168.1.42:3001/api/chairs' -Method Post -Body ( @{ chairId = 'chair-1'; is_occupied = $true } | ConvertTo-Json ) -ContentType 'application/json'

# Or use curl from Linux/ESP32 HTTP client
curl -X POST http://192.168.1.42:3001/api/chairs -H "Content-Type: application/json" -d '{"chairId":"chair-1","is_occupied":true}'
```

Optional: require an API key
- You can require a simple API key by setting an env var before starting the server:
```powershell
$env:API_KEY = 's3cret'
npm run start
# Then clients must send header: x-api-key: s3cret
```

Security note
- Allowing "anyone on the network" to hit the endpoint is convenient for development, but opens attacks if your network is public or untrusted. Consider adding an API key, basic auth, or moving this behind an authenticated gateway for production.

Note
- This implementation stores state in `server/chairs.json`. For production you'd likely use a DB or secure API with auth.
