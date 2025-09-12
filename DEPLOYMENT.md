# Deployment Guide

This guide explains how to deploy the Smart Seat Occupancy Detection System.

## Architecture Overview

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  ESP32      │ ───▶ │  Backend    │ ───▶ │  Frontend   │
│  Hardware   │      │  (Node.js)  │      │  (React)    │
│  + Sensors  │      │  Port 3001  │      │  Vercel     │
└─────────────┘      └─────────────┘      └─────────────┘
```

## Current Deployment

### Frontend (Production)
- **Platform**: Vercel
- **URL**: [https://stm32-smart-seat-occupancy-system.vercel.app/](https://stm32-smart-seat-occupancy-system.vercel.app/)
- **Technology**: React + TypeScript + Vite + Tailwind CSS
- **Auto-deploy**: Pushes to `main` branch trigger automatic deployment

### Backend (Local/Server)
- **Platform**: Node.js Express Server
- **Port**: 3001
- **Data Storage**: JSON file (`chairs.json`)
- **API Endpoints**:
  - `POST /api/chairs` - Update chair status
  - `GET /api/chairs` - Get all chair statuses
  - `GET /health` - Health check

### Hardware (ESP32)
- **Firmware**: Arduino C++ code
- **Communication**: HTTP POST to backend server
- **Sensors**: IR proximity sensors on GPIO 5 and 18

## Deployment Steps

### 1. Deploy Backend Server

#### Option A: Local Network (Development)

```bash
cd server
npm install
npm start
```

Server will be accessible at:
- `http://localhost:3001`
- `http://YOUR_LOCAL_IP:3001` (on LAN)

#### Option B: Cloud Server (Production)

**Using Railway/Render/Heroku:**

1. Create account on platform
2. Connect GitHub repository
3. Set root directory to `server/`
4. Set start command: `npm start`
5. Deploy

**Environment Variables:**
- `PORT`: Server port (default: 3001)
- `API_KEY`: Optional API key for authentication

#### Option C: VPS (DigitalOcean/AWS/Linode)

```bash
# SSH into server
ssh user@your-server-ip

# Clone repository
git clone https://github.com/Kanav-Bansal-22/stm32-smart-seat-occupancy-system.git
cd stm32-smart-seat-occupancy-system/server

# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2

# Start server with PM2
pm2 start index.js --name "seat-server"
pm2 save
pm2 startup

# Configure firewall
sudo ufw allow 3001
```

### 2. Deploy Frontend

#### Option A: Vercel (Current - Recommended)

**Already deployed!** Any push to `main` branch auto-deploys.

To redeploy manually:
```bash
npm install -g vercel
vercel --prod
```

#### Option B: Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

#### Option C: GitHub Pages

```bash
# Update vite.config.ts with base path
npm run build
# Deploy dist/ to gh-pages branch
```

### 3. Configure ESP32 Firmware

1. Open `firmware/seat_occupancy_detector.ino` in Arduino IDE

2. Update Wi-Fi credentials:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

3. Update server URL:
```cpp
// For local server
String serverIP = "http://192.168.1.100:3001";

// For cloud server
String serverIP = "https://your-backend-url.com";
```

4. Upload to ESP32

## Testing the System

### 1. Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# Update chair status
curl -X POST http://localhost:3001/api/chairs \
  -H "Content-Type: application/json" \
  -d '{"chairId": "chair-1", "is_occupied": true}'

# Get all chairs
curl http://localhost:3001/api/chairs
```

### 2. Test ESP32 Connection

1. Open Serial Monitor in Arduino IDE (115200 baud)
2. Check for Wi-Fi connection message
3. Trigger sensor (place hand over IR sensor)
4. Verify HTTP POST request in serial output
5. Check backend logs for received data

### 3. Test Frontend

1. Open [https://stm32-smart-seat-occupancy-system.vercel.app/](https://stm32-smart-seat-occupancy-system.vercel.app/)
2. Trigger sensor on ESP32
3. Verify chair status updates in real-time on dashboard

## Network Configuration

### For Local Development

```
ESP32 (192.168.1.50) ──▶ Backend (192.168.1.100:3001) ──▶ Frontend (localhost:5173)
```

All devices must be on the same network.

### For Production

```
ESP32 (Local Network) ──▶ Backend (Cloud Server) ──▶ Frontend (Vercel CDN)
```

Backend must have public IP or domain name.

## Troubleshooting

### ESP32 Can't Connect to Backend

**Problem**: ESP32 shows "Failed to connect" in serial monitor

**Solutions**:
1. Verify backend server is running: `curl http://SERVER_IP:3001/health`
2. Check firewall allows port 3001
3. Ensure ESP32 and server are on same network (local) or server has public IP (cloud)
4. Verify server URL in ESP32 code matches actual server address

### Frontend Not Updating

**Problem**: Dashboard doesn't show real-time updates

**Solutions**:
1. Check browser console for errors
2. Verify backend API is accessible from browser
3. Check CORS settings in backend (should allow frontend domain)
4. Clear browser cache and reload

### Backend Not Receiving Data

**Problem**: Backend logs show no incoming requests

**Solutions**:
1. Check ESP32 serial monitor for HTTP response codes
2. Verify JSON payload format matches API expectations
3. Check network connectivity between ESP32 and backend
4. Test API manually with curl/Postman

## Security Considerations

### For Production Deployment

1. **Enable API Key Authentication**:
```bash
# Set environment variable
export API_KEY="your-secret-key"

# Update ESP32 code to include API key
http.addHeader("x-api-key", "your-secret-key");
```

2. **Use HTTPS**:
- Deploy backend behind reverse proxy (nginx)
- Use Let's Encrypt for SSL certificate
- Update ESP32 to use HTTPS URLs

3. **Implement Rate Limiting**:
```javascript
// In server/index.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100 // limit each IP to 100 requests per minute
});

app.use('/api/', limiter);
```

4. **Database Security**:
- Use proper database instead of JSON file
- Implement authentication for database access
- Regular backups

## Scaling

### Adding More Seats

1. **Hardware**: Connect additional IR sensors to available GPIO pins
2. **Firmware**: Add sensor definitions and update loop
3. **Backend**: No changes needed (dynamic chair IDs)
4. **Frontend**: Update layout in `DiningHall.tsx`

### Multiple ESP32 Boards

Each ESP32 can handle 10+ sensors. For larger deployments:

1. Deploy multiple ESP32 boards
2. Use unique chair IDs (e.g., `board1-chair1`, `board2-chair1`)
3. Backend automatically handles multiple boards
4. Frontend scales to show all chairs

## Monitoring

### Backend Logs

```bash
# View PM2 logs
pm2 logs seat-server

# View last 100 lines
pm2 logs seat-server --lines 100

# Monitor in real-time
pm2 monit
```

### ESP32 Logs

Connect via Serial Monitor (115200 baud) to see:
- Wi-Fi connection status
- Sensor readings
- HTTP request/response codes
- Error messages

### Frontend Analytics

Add analytics to track:
- Page views
- Real-time active users
- Chair status change frequency
- System uptime

## Backup and Recovery

### Backup Chair Data

```bash
# Backup chairs.json
cp server/chairs.json server/chairs.backup.json

# Automated daily backup
crontab -e
# Add: 0 0 * * * cp /path/to/chairs.json /path/to/backup/chairs-$(date +\%Y\%m\%d).json
```

### Restore from Backup

```bash
cp server/chairs.backup.json server/chairs.json
pm2 restart seat-server
```

## Performance Optimization

### Backend

1. Use Redis for caching
2. Implement WebSocket for real-time updates
3. Use proper database (PostgreSQL/MongoDB)
4. Enable gzip compression

### Frontend

1. Implement lazy loading for components
2. Use React.memo for chair components
3. Optimize bundle size with code splitting
4. Enable service worker for offline support

### ESP32

1. Implement deep sleep between readings
2. Batch multiple updates
3. Use MQTT instead of HTTP for lower overhead
4. Optimize polling interval

## Cost Estimation

### Development/Testing (Free)
- Frontend: Vercel Free Tier
- Backend: Local machine
- Hardware: ~$15-20 (ESP32 + sensors)

### Small Deployment (< 50 seats)
- Frontend: Vercel Free Tier ($0)
- Backend: Railway/Render Free Tier ($0) or VPS ($5/month)
- Hardware: ~$50-100 (multiple ESP32 boards)

### Large Deployment (100+ seats)
- Frontend: Vercel Pro ($20/month)
- Backend: VPS ($10-20/month)
- Database: Managed PostgreSQL ($15/month)
- Hardware: ~$200-500 (10+ ESP32 boards)

## Support

For issues or questions:
- GitHub Issues: [https://github.com/Kanav-Bansal-22/stm32-smart-seat-occupancy-system/issues](https://github.com/Kanav-Bansal-22/stm32-smart-seat-occupancy-system/issues)
- Email: kanavbansal22@gmail.com

---

*Last Updated: December 2025*
