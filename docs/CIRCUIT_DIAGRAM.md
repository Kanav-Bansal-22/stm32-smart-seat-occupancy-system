# Circuit Diagram and Hardware Setup

## Circuit Schematic

```
                    ESP32 Development Board
                    ┌─────────────────────┐
                    │                     │
                    │      ESP32-WROOM    │
                    │                     │
    IR Sensor 1     │                     │
    ┌──────────┐    │                     │
    │   VCC ───┼────┤ 3.3V                │
    │   GND ───┼────┤ GND                 │
    │   OUT ───┼────┤ GPIO 5              │
    └──────────┘    │                     │
                    │                     │
    IR Sensor 2     │                     │
    ┌──────────┐    │                     │
    │   VCC ───┼────┤ 3.3V                │
    │   GND ───┼────┤ GND                 │
    │   OUT ───┼────┤ GPIO 18             │
    └──────────┘    │                     │
                    │                     │
                    │   USB ──────────────┼──── Computer/Power
                    │                     │
                    └─────────────────────┘
```

## Component Details

### ESP32 Development Board
- **Model**: ESP32-WROOM-32
- **Operating Voltage**: 3.3V
- **Input Voltage**: 5V (via USB)
- **Wi-Fi**: 802.11 b/g/n
- **GPIO Pins Used**: GPIO 5, GPIO 18

### IR Proximity Sensors
- **Model**: Generic IR Obstacle Avoidance Sensor
- **Operating Voltage**: 3.3V - 5V
- **Detection Range**: 2cm - 30cm (adjustable)
- **Output**: Digital (HIGH/LOW)
- **Logic**: Active LOW (LOW when object detected)

## Pin Connections

| ESP32 Pin | Component | Wire Color (Suggested) |
|-----------|-----------|------------------------|
| 3.3V | IR Sensor 1 VCC | Red |
| GND | IR Sensor 1 GND | Black |
| GPIO 5 | IR Sensor 1 OUT | Yellow |
| 3.3V | IR Sensor 2 VCC | Red |
| GND | IR Sensor 2 GND | Black |
| GPIO 18 | IR Sensor 2 OUT | Green |

## Physical Installation

### Sensor Placement

```
        Chair (Side View)
        
        ┌─────────────┐
        │   Backrest  │
        │             │
        │             │
        └─────┬───────┘
              │ Seat
        ┌─────┴───────┐
        │             │
        │   [Sensor]  │  ← IR Sensor mounted under seat
        │      ↑      │     facing upward
        └─────────────┘
              │
        ┌─────┴───────┐
        │   Legs      │
        └─────────────┘
```

### Installation Steps

1. **Mount Sensors Under Seats**
   - Position sensor 5-10cm below seat surface
   - Ensure sensor faces directly upward
   - Use double-sided tape or mounting brackets
   - Avoid direct sunlight exposure

2. **Adjust Sensitivity**
   - Turn the potentiometer on the sensor
   - Clockwise: Increase detection range
   - Counter-clockwise: Decrease detection range
   - Test with person sitting/standing

3. **Wire Management**
   - Route wires along chair legs
   - Use cable ties to secure wires
   - Avoid pinch points and moving parts
   - Leave slack for chair movement

4. **ESP32 Placement**
   - Mount ESP32 in central location
   - Ensure good Wi-Fi signal strength
   - Protect from physical damage
   - Provide adequate ventilation

## Power Supply Options

### Option 1: USB Power (Recommended for Testing)
- Connect ESP32 to computer via USB cable
- Provides 5V @ 500mA
- Easy for development and debugging

### Option 2: External Power Adapter
- Use 5V 2A power adapter
- Connect to ESP32 VIN and GND
- Better for permanent installation
- More stable power supply

### Option 3: Battery Power
- Use 3.7V LiPo battery with voltage regulator
- Add battery management circuit
- Suitable for portable installations
- Requires periodic recharging

## Troubleshooting

### Sensor Not Detecting

**Problem**: Sensor always shows "Empty" or "Occupied"

**Solutions**:
1. Check sensor orientation (must face upward)
2. Adjust sensitivity potentiometer
3. Verify 3.3V power supply
4. Test sensor with multimeter (should output 0V when triggered)
5. Check detection range (2-30cm)

### Intermittent Detection

**Problem**: Sensor readings fluctuate

**Solutions**:
1. Ensure stable power supply
2. Add 100nF capacitor between VCC and GND
3. Check for loose connections
4. Shield sensor from ambient light
5. Increase polling delay in code

### Wi-Fi Connection Issues

**Problem**: ESP32 not connecting to Wi-Fi

**Solutions**:
1. Verify SSID and password
2. Check 2.4GHz network (ESP32 doesn't support 5GHz)
3. Move closer to router
4. Check router firewall settings
5. Restart ESP32

## Safety Considerations

1. **Electrical Safety**
   - Use proper insulation on all connections
   - Avoid exposed wires in public areas
   - Use appropriate wire gauge (22-24 AWG)
   - Add fuse protection for permanent installations

2. **Mechanical Safety**
   - Secure all components firmly
   - Avoid sharp edges on mounting brackets
   - Ensure wires don't interfere with chair movement
   - Regular inspection for wear and tear

3. **Fire Safety**
   - Don't exceed component voltage ratings
   - Ensure adequate ventilation for ESP32
   - Use flame-retardant enclosures
   - Include thermal protection if needed

## Bill of Materials (BOM)

| Item | Quantity | Estimated Cost (USD) |
|------|----------|---------------------|
| ESP32 Development Board | 1 | $5-10 |
| IR Proximity Sensor | 2 | $2-4 |
| Jumper Wires (M-M) | 10 | $2 |
| USB Cable (Micro-B) | 1 | $3 |
| Double-sided Tape | 1 roll | $2 |
| Cable Ties | 10 | $1 |
| **Total** | - | **$15-22** |

## Advanced Modifications

### Adding More Sensors
- ESP32 has 34 GPIO pins
- Can support 10+ sensors per board
- Update code to handle additional chairs
- Consider using I2C multiplexer for 20+ sensors

### Adding Display
- Connect OLED display via I2C
- Show real-time occupancy count
- Display Wi-Fi status
- Add QR code for dashboard access

### Battery Backup
- Add 18650 battery with TP4056 charger
- Implement deep sleep mode
- Wake on sensor interrupt
- Extend runtime to 24+ hours

## References

- [ESP32 Pinout Reference](https://randomnerdtutorials.com/esp32-pinout-reference-gpios/)
- [IR Sensor Datasheet](https://components101.com/sensors/ir-sensor-module)
- [ESP32 Power Consumption](https://lastminuteengineers.com/esp32-sleep-modes-power-consumption/)
