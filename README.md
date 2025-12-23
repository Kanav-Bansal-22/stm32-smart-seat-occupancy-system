# Smart Seat Occupancy Detection System

A real-time IoT-based seat occupancy monitoring system for auditoriums and lecture halls using ESP32 microcontroller and IR sensors. The system detects seat occupancy status and transmits data to a web dashboard for live visualization.

## Features

- **Real-time Monitoring**: Instant detection of seat occupancy using IR sensors
- **IoT Connectivity**: Wi-Fi enabled ESP32 for wireless data transmission
- **Web Dashboard**: Live visualization of seat availability in auditoriums
- **Low Latency**: Direct GPIO register access for fast sensor reading
- **RESTful API**: HTTP POST requests to update seat status on server
- **Scalable Architecture**: Easily expandable to monitor multiple seats

## Hardware Components

- **Microcontroller**: ESP32 Development Board
- **Sensors**: IR Proximity Sensors (2x)
- **Power Supply**: 5V USB or external power adapter
- **Connectivity**: Wi-Fi (802.11 b/g/n)

## System Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  IR Sensors │ ───> │    ESP32    │ ───> │  Web Server │
│  (GPIO 5,18)│      │  (Wi-Fi)    │      │   (Node.js) │
└─────────────┘      └─────────────┘      └─────────────┘
                                                  │
                                                  ▼
                                           ┌─────────────┐
                                           │ Web Dashboard│
                                           │  (Frontend) │
                                           └─────────────┘
```

## Pin Configuration

| Component | ESP32 Pin | Description |
|-----------|-----------|-------------|
| IR Sensor 1 | GPIO 5 | Detects seat 1 occupancy |
| IR Sensor 2 | GPIO 18 | Detects seat 2 occupancy |
| VCC | 3.3V | Power supply for sensors |
| GND | GND | Common ground |

## Software Architecture

### Firmware (ESP32)
- **Language**: C++ (Arduino Framework)
- **Libraries**: WiFi.h, HTTPClient.h
- **Communication**: HTTP POST with JSON payload
- **Optimization**: Direct GPIO register access for low-latency reading

### Backend Server
- **Framework**: Node.js with Express
- **API Endpoint**: `/api/chairs`
- **Data Format**: JSON
- **Port**: 3001

### Frontend Dashboard
- **Technology**: HTML/CSS/JavaScript
- **Features**: Real-time seat status visualization
- **Link**: [View Dashboard](https://smart-seat-dashboard.example.com)

## Installation

### 1. Hardware Setup

1. Connect IR sensors to ESP32:
   - Sensor 1 OUT → GPIO 5
   - Sensor 2 OUT → GPIO 18
   - VCC → 3.3V
   - GND → GND

2. Position sensors under seats facing upward
3. Adjust sensor sensitivity using onboard potentiometer

### 2. Firmware Upload

1. Install Arduino IDE and ESP32 board support
2. Open `seat_occupancy_detector.ino`
3. Update Wi-Fi credentials:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
4. Update server IP address:
   ```cpp
   String serverIP = "http://YOUR_SERVER_IP:3001";
   ```
5. Upload to ESP32

### 3. Server Setup

1. Navigate to `server/` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

### 4. Access Dashboard

Open browser and navigate to:
```
http://YOUR_SERVER_IP:3000
```

## API Documentation

### Update Seat Status

**Endpoint**: `POST /api/chairs`

**Request Body**:
```json
{
  "chairId": "chair-1",
  "is_occupied": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Seat status updated",
  "chairId": "chair-1",
  "is_occupied": true
}
```

## Code Explanation

### Direct GPIO Register Access

The firmware uses direct memory-mapped GPIO register access for faster sensor reading:

```cpp
#define GPIO_BASE 0x3FF44000
#define GPIO_IN_REG (GPIO_BASE + 0x3C)

volatile uint32_t *gpio_in = (uint32_t *)GPIO_IN_REG;
bool seat1 = (*gpio_in & (1 << SENSOR1_PIN)) == 0;
```

This approach provides:
- **Lower latency** compared to `digitalRead()`
- **Deterministic timing** for real-time applications
- **Direct hardware control** for embedded systems

### Change Detection Algorithm

The system only sends updates when seat status changes:

```cpp
if (seat1 != lastSeat1 || seat2 != lastSeat2) {
    // Send HTTP POST request
    lastSeat1 = seat1;
    lastSeat2 = seat2;
}
```

Benefits:
- Reduces network traffic
- Minimizes server load
- Conserves power

## Performance Metrics

- **Sensor Response Time**: < 50ms
- **Network Latency**: 100-200ms (local network)
- **Update Frequency**: Event-driven (on change)
- **Power Consumption**: ~150mA @ 5V (active)

## Troubleshooting

### ESP32 Not Connecting to Wi-Fi
- Verify SSID and password
- Check Wi-Fi signal strength
- Ensure 2.4GHz network (ESP32 doesn't support 5GHz)

### Sensors Not Detecting
- Check sensor wiring and power supply
- Adjust sensor sensitivity potentiometer
- Verify sensor placement (5-10cm from seat surface)

### Server Not Receiving Data
- Verify server IP address and port
- Check firewall settings
- Ensure ESP32 and server are on same network

## Future Enhancements

- [ ] Add support for 10+ seats per ESP32
- [ ] Implement MQTT protocol for better scalability
- [ ] Add battery backup and sleep mode
- [ ] Integrate with room booking systems
- [ ] Add occupancy analytics and reporting
- [ ] Implement OTA (Over-The-Air) firmware updates

## Project Structure

```
stm32-smart-seat-occupancy-system/
├── firmware/
│   └── seat_occupancy_detector.ino
├── server/
│   ├── server.js
│   ├── package.json
│   └── routes/
│       └── chairs.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── docs/
│   ├── circuit_diagram.png
│   └── setup_guide.md
├── README.md
└── LICENSE
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Kanav Bansal**
- GitHub: [@Kanav-Bansal-22](https://github.com/Kanav-Bansal-22)
- Email: kanavbansal22@gmail.com

## Acknowledgments

- ESP32 community for excellent documentation
- Arduino framework for ease of development
- IIT Indore for project support

---

*Built as part of IoT and Embedded Systems coursework at IIT Indore*
