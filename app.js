/**
 * SMART CAR PARKING IOT DASHBOARD - APPLICATION JAVASCRIPT
 */

// Load saved IP from localStorage or fallback
const ESP32_IP = "http://10.182.150.105";

const state = {
  slotBooked: [false, false, false],
  slotOccupied: [false, false, false],
  slotAvailable: [true, true, true],
  gateInOpen: false,
  gateOutOpen: false,
  lcdLine1: "",
  lcdLine2: "",
  isOnline: false,
  pollInterval: 1500
};

let pollTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateHostDisplay();
  renderDashboard();
  startPolling();
});

function updateHostDisplay() {
  const hostValue = document.querySelector(".stat-card:nth-child(3) .stat-value");
  if (hostValue) hostValue.textContent = ESP32_IP.replace("http://", "");
  const subBrand = document.querySelector(".sub-brand");
  if (subBrand) subBrand.textContent = `ESP32 Direct HTTP API (${ESP32_IP})`;
}

// =========================================================
// API COMMUNICATION
// =========================================================
async function fetchSlotData() {
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

    const res = await fetch(`${ESP32_IP}/status`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      state.isOnline = true;

      // Update status pill
      if (statusDot) {
        statusDot.className = "status-dot online";
      }
      if (statusText) statusText.textContent = "ESP32 Online";

      // Parse states
      state.slotBooked = [
        data.slot1 === "Booked",
        data.slot2 === "Booked",
        data.slot3 === "Booked"
      ];
      state.slotOccupied = [
        data.slot1 === "Occupied",
        data.slot2 === "Occupied",
        data.slot3 === "Occupied"
      ];
      state.slotAvailable = [
        data.slot1 === "Available",
        data.slot2 === "Available",
        data.slot3 === "Available"
      ];
      state.gateInOpen = (data.gateIn === "Open");
      state.gateOutOpen = (data.gateOut === "Open");
      state.lcdLine1 = data.lcd || "";

      renderDashboard();
    } else {
      throw new Error(`HTTP Error: ${res.status}`);
    }
  } catch (err) {
    state.isOnline = false;
    if (statusDot) {
      statusDot.className = "status-dot offline";
    }
    if (statusText) statusText.textContent = "ESP32 Offline (Check IP / WiFi)";
  }
}

async function sendBookingUpdate(slotNum, booked) {
  try {
    const res = await fetch(`${ESP32_IP}/book?slot=${slotNum}&state=${booked}`);
    return res.ok;
  } catch (err) {
    console.error("Failed to update booking:", err);
    alert(`Could not reach ESP32 at ${ESP32_IP}. Please check connection.`);
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

function toggleSlotBooking(slotNum) {
  const idx = slotNum - 1;
  const newBookedState = !state.slotBooked[idx];
  state.slotBooked[idx] = newBookedState;

  sendBookingUpdate(slotNum, newBookedState ? 1 : 0);
  renderDashboard();
}

// =========================================================
// DASHBOARD RENDERING
// =========================================================
function renderDashboard() {
  let hasViolation = false;

  for (let i = 0; i < 3; i++) {
    const slotNum = i + 1;
    const isBooked = state.slotBooked[i];
    const isOccupied = state.slotOccupied[i];
    const slotBay = document.getElementById(`slotBay${slotNum}`);
    const stateText = document.getElementById(`stateText${slotNum}`);
    const bookTag = document.getElementById(`bookTag${slotNum}`);
    const carGraphic = document.getElementById(`car${slotNum}`);

    if (slotBay && stateText) {
      if (isBooked && isOccupied) {
        hasViolation = true;
        stateText.textContent = "VIOLATION!";
        slotBay.className = "parking-slot violation";
        if (bookTag) bookTag.style.display = "block";
        if (carGraphic) carGraphic.style.display = "block";
      } else if (isOccupied) {
        stateText.textContent = "OCCUPIED";
        slotBay.className = "parking-slot occupied";
        if (bookTag) bookTag.style.display = "none";
        if (carGraphic) carGraphic.style.display = "block";
      } else if (isBooked) {
        stateText.textContent = "RESERVED";
        slotBay.className = "parking-slot booked";
        if (bookTag) bookTag.style.display = "block";
        if (carGraphic) carGraphic.style.display = "none";
      } else {
        stateText.textContent = "AVAILABLE";
        slotBay.className = "parking-slot available";
        if (bookTag) bookTag.style.display = "none";
        if (carGraphic) carGraphic.style.display = "none";
      }
    }
  }

  // Violation banner
  const banner = document.getElementById("violationBanner");
  if (banner) banner.style.display = hasViolation ? "flex" : "none";

  // Gate Arms & status
  const gateInStatus = document.getElementById("gateInStatus");
  const gateOutStatus = document.getElementById("gateOutStatus");
  const gateInArm = document.getElementById("gateInArm");
  const gateOutArm = document.getElementById("gateOutArm");

  if (gateInStatus) gateInStatus.textContent = state.gateInOpen ? "OPEN" : "CLOSED";
  if (gateOutStatus) gateOutStatus.textContent = state.gateOutOpen ? "OPEN" : "CLOSED";
  if (gateInArm) gateInArm.className = state.gateInOpen ? "barrier-arm open" : "barrier-arm";
  if (gateOutArm) gateOutArm.className = state.gateOutOpen ? "barrier-arm open" : "barrier-arm";

  // LCD Lines
  const lcd0 = document.getElementById("lcdRow0");
  if (lcd0) lcd0.textContent = state.lcdLine1 || "S1:O  S2:O  S3:O";
}

// =========================================================
// EVENT LISTENERS & SETTINGS MODAL
// =========================================================
function setupEventListeners() {
  document.getElementById("toggleSlot1")?.addEventListener("click", () => toggleSlotBooking(1));
  document.getElementById("toggleSlot2")?.addEventListener("click", () => toggleSlotBooking(2));
  document.getElementById("toggleSlot3")?.addEventListener("click", () => toggleSlotBooking(3));

  // Settings Modal (Configure ESP32 IP)
  const settingsBtn = document.getElementById("settingsBtn");
  const modal = document.getElementById("settingsModal");
  const closeBtn = document.getElementById("closeSettingsBtn");

  if (settingsBtn && modal) {
    settingsBtn.addEventListener("click", () => {
      const newIP = prompt("Enter ESP32 IP Address (e.g., 192.168.43.50):", ESP32_IP.replace("http://", ""));
      if (newIP) {
        ESP32_IP = newIP.startsWith("http://") ? newIP : `http://${newIP.trim()}`;
        localStorage.setItem("esp32_ip", ESP32_IP);
        updateHostDisplay();
        startPolling();
      }
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }
}