# 🚗 Smart Car Parking System - IoT Web Dashboard

A real-time web dashboard designed for your ESP32 Arduino Smart Car Parking System. It communicates directly with your ESP32 hardware via the **Blynk IoT REST API**, providing live 2D parking visualization, slot booking controls, gate servo indicators, violation alarms, and a simulated 16x2 I2C LCD screen.

---

## 🌟 Key Features

1. **Live Blynk Cloud REST API Integration**:
   - Sends slot reservations directly to Virtual Pins `V0`, `V1`, `V2`.
   - Reads real-time slot occupancy & availability from Virtual Pins `V3`, `V4`, `V5`.
   - Tracks hardware online / offline status via `isHardwareConnected`.
2. **Interactive 2D Parking Lot Visualization**:
   - Visual parking bays for Slot 1, Slot 2, Slot 3 with real-time car presence animations.
   - Status LEDs (Green = Free, Yellow = Reserved, Red = Occupied/Full).
   - Gate IN & Gate OUT servo movement animations (0° to 90°).
3. **Hardware Emulation & LCD Mirror**:
   - Emulates the exact text displayed on your physical I2C 16x2 LCD screen (`S1:O S2:X S3:O` / `Gate Closed` / `WARNING: Slot Occupied!`).
   - Reflects the physical Green, Red, and Yellow LEDs on the ESP32 pins.
4. **Violation & Security Alarm**:
   - Immediately alerts if a reserved/booked slot is occupied by an unauthorized vehicle (`slotOccupied && slotBooked`).
   - Built-in Web Audio alarm chime and flashing danger banner.
5. **Interactive Demo / Simulator Mode**:
   - Test and demonstrate the full project functionality directly in any browser without needing the physical ESP32 powered on.
   - Click slots to toggle cars, trigger arrival and departure gates.

---

## 📋 Blynk Virtual Pin Mapping

| Pin | Type | Direction | Description |
| :--- | :--- | :--- | :--- |
| **`V0`** | Integer (0/1) | Web ➔ ESP32 | **Slot 1 Booking** (1: Booked, 0: Unbooked) |
| **`V1`** | Integer (0/1) | Web ➔ ESP32 | **Slot 2 Booking** (1: Booked, 0: Unbooked) |
| **`V2`** | Integer (0/1) | Web ➔ ESP32 | **Slot 3 Booking** (1: Booked, 0: Unbooked) |
| **`V3`** | Integer (0/1) | ESP32 ➔ Web | **Slot 1 Availability** (1: Available, 0: Unavailable) |
| **`V4`** | Integer (0/1) | ESP32 ➔ Web | **Slot 2 Availability** (1: Available, 0: Unavailable) |
| **`V5`** | Integer (0/1) | ESP32 ➔ Web | **Slot 3 Availability** (1: Free, 0: Unavailable) |

---

## 🚀 How to Run the Web Dashboard

### Option 1: Direct Double-Click (Zero Setup)
1. Navigate to `C:\Users\Dell\.gemini\antigravity\scratch\smart-car-parking-web`.
2. Double-click **`index.html`** to open it in Google Chrome, Microsoft Edge, Firefox, or Safari.

### Option 2: Run via a Local Web Server (Recommended)
You can use Python or Node.js to serve the files locally:

```bash
# Using Python
cd C:\Users\Dell\.gemini\antigravity\scratch\smart-car-parking-web
python -m http.server 8080
```
Then open `http://localhost:8080` in your web browser.

---

## ⚙️ Connecting to your ESP32 Hardware

1. Open the web dashboard in your browser.
2. Click the **Settings (⚙️)** button in the top navigation bar.
3. Paste your **Blynk Auth Token** (the one in `#define BLYNK_AUTH_TOKEN "..."` of your Arduino code).
4. Select your Blynk Server Region (e.g. `blynk.cloud` or `blr1.blynk.cloud` for India / `fra1.blynk.cloud` for Europe).
5. Click **Test Connection** and then **Save & Connect**.
6. When your ESP32 is powered on and connected to WiFi, the status pill will turn **Green (ESP32 Online)** and all data will sync in real-time!
