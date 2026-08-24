/**
 * SMART CAR PARKING IOT DASHBOARD - APPLICATION JAVASCRIPT
 * Direct communication with ESP32 via HTTP endpoints
 */

const state = {
  slotBooked: [false, false, false],
  slotOccupied: [false, false, false],
  slotAvailable: [true, true, true],
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
    // ESP32 must serve this endpoint
    const res = await fetch("http://esp32.local/getSlots");
    if (res.ok) {
      const data = await res.json();
      state.slotBooked = data.booked;
      state.slotOccupied = data.occupied;
      state.slotAvailable = data.available;
      renderDashboard();
    }
  } catch (err) {
    console.error("Error fetching slot data:", err);
  }
}

async function sendBookingUpdate(slotNum, booked) {
  try {
    // ESP32 must accept booking updates here
    const res = await fetch("http://esp32.local/updateBooking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot: slotNum, booked })
    });
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
// DASHBOARD RENDERING (simplified)
// =========================================================
function renderDashboard() {
  for (let i = 0; i < 3; i++) {
    const slotNum = i + 1;
    const isBooked = state.slotBooked[i];
    const isOccupied = state.slotOccupied[i];
    const slotBay = document.getElementById(`slotBay${slotNum}`);
    const stateText = document.getElementById(`stateText${slotNum}`);

    if (isBooked && isOccupied) {
      stateText.textContent = "VIOLATION!";
      slotBay.className = "parking-slot violation";
    } else if (isOccupied) {
      stateText.textContent = "OCCUPIED";
      slotBay.className = "parking-slot occupied";
    } else if (isBooked) {
      stateText.textContent = "RESERVED";
      slotBay.className = "parking-slot booked";
    } else {
      stateText.textContent = "AVAILABLE";
      slotBay.className = "parking-slot available";
    }
  }
}
