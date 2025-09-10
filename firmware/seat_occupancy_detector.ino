/*
 * Smart Seat Occupancy Detection System
 * 
 * Description: Real-time IoT-based seat monitoring system using ESP32 and IR sensors
 * Author: Kanav Bansal
 * Date: September 2025
 * 
 * Hardware:
 * - ESP32 Development Board
 * - 2x IR Proximity Sensors
 * 
 * Pin Configuration:
 * - GPIO 5  : IR Sensor 1 (Seat 1)
 * - GPIO 18 : IR Sensor 2 (Seat 2)
 * 
 * Features:
 * - Direct GPIO register access for low-latency sensor reading
 * - Wi-Fi connectivity for real-time data transmission
 * - RESTful API integration with HTTP POST
 * - Change detection to minimize network traffic
 */

#include <WiFi.h>
#include <HTTPClient.h>

// ====== GPIO REGISTER DEFINITIONS ======
#define GPIO_BASE 0x3FF44000
#define GPIO_IN_REG (GPIO_BASE + 0x3C)

// ====== WIFI CREDENTIALS ======
const char* ssid = "Garv's Nothing";
const char* password = "gareebonkawifi";

// ====== SERVER CONFIGURATION ======
String serverIP = "http://10.57.251.206:3001";   
String endpoint = "/api/chairs";                

// ====== PIN DEFINITIONS ======
#define SENSOR1_PIN 5   // IR Sensor 1 - Seat 1
#define SENSOR2_PIN 18  // IR Sensor 2 - Seat 2

// ====== STATE VARIABLES ======
bool lastSeat1 = false;
bool lastSeat2 = false;

void setup() {
  Serial.begin(115200);
  
  Serial.println("\n========================================");
  Serial.println("  Smart Seat Occupancy Detection System");
  Serial.println("========================================\n");

  // ====== CONNECT TO WIFI ======
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Connected to Wi-Fi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Server: ");
  Serial.println(serverIP);
  Serial.println("\n🔍 Starting seat monitoring...\n");
}

void loop() {
  // ====== READ GPIO REGISTERS DIRECTLY ======
  // Direct memory-mapped register access for faster reading
  volatile uint32_t *gpio_in = (uint32_t *)GPIO_IN_REG;

  // Read sensor states (LOW = occupied, HIGH = empty)
  bool seat1 = (*gpio_in & (1 << SENSOR1_PIN)) == 0;  // LOW = occupied
  bool seat2 = (*gpio_in & (1 << SENSOR2_PIN)) == 0;

  // ====== DISPLAY CURRENT STATUS ======
  Serial.print("Seat 1: ");
  Serial.print(seat1 ? "Occupied" : "Empty   ");
  Serial.print(" | Seat 2: ");
  Serial.println(seat2 ? "Occupied" : "Empty   ");

  // ====== DETECT CHANGES AND SEND UPDATES ======
  if (seat1 != lastSeat1 || seat2 != lastSeat2) {
    Serial.println("\n🔄 Change detected! Sending update...");

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      
      // ====== UPDATE SEAT 1 STATUS ======
      http.begin(serverIP + endpoint);
      http.addHeader("Content-Type", "application/json");

      String json1 = "{\"chairId\": \"chair-1\", \"is_occupied\": ";
      json1 += (seat1 ? "true" : "false");
      json1 += "}";

      int httpCode1 = http.POST(json1);
      Serial.print("Seat 1 → HTTP Response: ");
      Serial.print(httpCode1);
      Serial.println(httpCode1 == 200 ? " ✅" : " ❌");

      // ====== UPDATE SEAT 2 STATUS ======
      String json2 = "{\"chairId\": \"chair-2\", \"is_occupied\": ";
      json2 += (seat2 ? "true" : "false");
      json2 += "}";

      int httpCode2 = http.POST(json2);
      Serial.print("Seat 2 → HTTP Response: ");
      Serial.print(httpCode2);
      Serial.println(httpCode2 == 200 ? " ✅" : " ❌");

      http.end();
      Serial.println();
    } else {
      Serial.println("⚠️ Wi-Fi disconnected, skipping update.\n");
    }

    // Update last known states
    lastSeat1 = seat1;
    lastSeat2 = seat2;
  }

  delay(100);  // 100ms polling interval
}
