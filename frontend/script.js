// Smart Seat Occupancy System - Frontend JavaScript
// Author: Kanav Bansal

const API_URL = 'http://10.57.251.206:3001/api/chairs';
const POLL_INTERVAL = 2000; // Poll every 2 seconds

let seats = {
    'chair-1': false,
    'chair-2': false
};

// Initialize the dashboard
function init() {
    console.log('🚀 Smart Seat Occupancy System Initialized');
    updateConnectionStatus('connected');
    fetchSeatStatus();
    setInterval(fetchSeatStatus, POLL_INTERVAL);
}

// Fetch seat status from server
async function fetchSeatStatus() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.chairs) {
            data.chairs.forEach(chair => {
                seats[chair.chairId] = chair.is_occupied;
                updateSeatUI(chair.chairId, chair.is_occupied);
            });
            
            updateStats();
            updateLastUpdate();
            updateConnectionStatus('connected');
        }
    } catch (error) {
        console.error('❌ Error fetching seat status:', error);
        updateConnectionStatus('disconnected');
    }
}

// Update individual seat UI
function updateSeatUI(chairId, isOccupied) {
    const seatElement = document.getElementById(chairId);
    
    if (!seatElement) return;
    
    // Remove existing classes
    seatElement.classList.remove('available', 'occupied');
    
    // Add appropriate class
    if (isOccupied) {
        seatElement.classList.add('occupied');
        seatElement.querySelector('.seat-status').textContent = 'Occupied';
    } else {
        seatElement.classList.add('available');
        seatElement.querySelector('.seat-status').textContent = 'Available';
    }
}

// Update statistics
function updateStats() {
    const totalSeats = Object.keys(seats).length;
    const occupiedSeats = Object.values(seats).filter(occupied => occupied).length;
    const availableSeats = totalSeats - occupiedSeats;
    
    document.getElementById('total-seats').textContent = totalSeats;
    document.getElementById('occupied-seats').textContent = occupiedSeats;
    document.getElementById('available-seats').textContent = availableSeats;
}

// Update last update timestamp
function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('last-update').textContent = timeString;
}

// Update connection status
function updateConnectionStatus(status) {
    const statusElement = document.getElementById('connection-status');
    
    if (status === 'connected') {
        statusElement.textContent = '🟢 Connected';
        statusElement.className = 'connected';
    } else {
        statusElement.textContent = '🔴 Disconnected';
        statusElement.className = 'disconnected';
    }
}

// Add click handlers for seats (optional - for testing)
document.addEventListener('DOMContentLoaded', () => {
    const seatElements = document.querySelectorAll('.seat');
    
    seatElements.forEach(seat => {
        seat.addEventListener('click', () => {
            const chairId = seat.dataset.chair;
            console.log(`Clicked on ${chairId}`);
            // Could add manual toggle for testing
        });
    });
});

// Start the application
window.addEventListener('load', init);

// Handle visibility change (pause/resume polling when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('⏸️ Tab hidden - polling continues in background');
    } else {
        console.log('▶️ Tab visible - refreshing data');
        fetchSeatStatus();
    }
});
