/**
 * SMART CAR PARKING IOT DASHBOARD - APPLICATION JAVASCRIPT
 * Direct communication with ESP32 via HTTP endpoints
 */

const ESP32_IP = "http://10.63.112.105";

const state = {
  slotBooked: [false, false, false],
  slotOccupied: [false, false, false],
  slotAvailable: [true, true, true],
  gateInOpen: false,
  gateOutOpen: false,
  lcdLine1: "",
  lcdLine2: "",
  pollInterval: 1500
};

let pollTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderDashboard();
  startPolling();
});

// =========================================================
// API COMMUNICATION (ESP32 endpoints)
// =========================================================
async function fetchSlotData() {
  try {
    const res = await fetch(`${ESP32_IP}/getSlots`);
    if (res.ok) {
      const data = await res.json();
      state.slotBooked = data.booked;
      state.slotOccupied = data.occupied;
      state.slotAvailable = data.available;
      state.gateInOpen = data.gateInOpen;
      state.gateOutOpen = data.gateOutOpen;
      state.lcdLine1 = data.lcdLine1;
      state.lcdLine2 = data.lcdLine2;
      renderDashboard();
    }
  } catch (err) {
    console.error("Error fetching slot data:", err);
  }
}

async function sendBookingUpdate(slotNum, booked) {
  try {
    const res = await fetch(`${ESP32_IP}/updateBooking?slot=${slotNum}&booked=${booked}`);
    return res.ok;
  } catch (err) {
    console.error("Failed to update booking:", err);
    return false;
  }
}

function startPolling() {
  stopPolling();
  fetchSlotData();
  pollTimer = setInterval(fetchSlotData, state.pollInterval);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// =========================================================
// BOOKING LOGIC
// =========================================================
function toggleSlotBooking(slotNum) {
  const idx = slotNum - 1;
  const newBookedState = !state.slotBooked[idx];
  state.slotBooked[idx] = newBookedState;

  sendBookingUpdate(slotNum, newBookedState);
  renderDashboard();
}

// =========================================================
// DASHBOARD RENDERING
// =========================================================
function renderDashboard() {
  // Render slots
  for (let i = 0; i < 3; i++) {
    const slotNum = i + 1;
    const isBooked = state.slotBooked[i];
    const isOccupied = state.slotOccupied[i];
    const slotBay = document.getElementById(`slotBay${slotNum}`);
    const stateText = document.getElementById(`stateText${slotNum}`);
    const bookTag = document.getElementById(`bookTag${slotNum}`);
    const carGraphic = document.getElementById(`car${slotNum}`);

    if (isBooked && isOccupied) {
      stateText.textContent = "VIOLATION!";
      slotBay.className = "parking-slot violation";
      bookTag.style.display = "block";
      carGraphic.style.display = "block";
    } else if (isOccupied) {
      stateText.textContent = "OCCUPIED";
      slotBay.className = "parking-slot occupied";
      bookTag.style.display = "none";
      carGraphic.style.display = "block";
    } else if (isBooked) {
      stateText.textContent = "RESERVED";
      slotBay.className = "parking-slot booked";
      bookTag.style.display = "block";
      carGraphic.style.display = "none";
    } else {
      stateText.textContent = "AVAILABLE";
      slotBay.className = "parking-slot available";
      bookTag.style.display = "none";
      carGraphic.style.display = "none";
    }
  }

  // Render gate status
  document.getElementById("gateInStatus").textContent = state.gateInOpen ? "OPEN" : "CLOSED";
  document.getElementById("gateOutStatus").textContent = state.gateOutOpen ? "OPEN" : "CLOSED";

  // Render LCD lines
  document.getElementById("lcdRow0").textContent = state.lcdLine1;
  document.getElementById("lcdRow1").textContent = state.lcdLine2;
}

// =========================================================
// EVENT LISTENERS
// =========================================================
function setupEventListeners() {
  document.getElementById("toggleSlot1").addEventListener("click", () => toggleSlotBooking(1));
  document.getElementById("toggleSlot2").addEventListener("click", () => toggleSlotBooking(2));
  document.getElementById("toggleSlot3").addEventListener("click", () => toggleSlotBooking(3));
}
