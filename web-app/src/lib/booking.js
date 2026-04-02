// Booking system using localStorage

const BOOKINGS_KEY = 'ev_finder_bookings';

function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

/**
 * Generate available time slots for a given date
 */
export function getAvailableSlots(stationId, date) {
  const bookings = getBookings();
  const dateStr = new Date(date).toISOString().slice(0, 10);

  // Get all active bookings for this station on this date
  const activeBookings = bookings.filter(
    b => b.stationId === stationId &&
      b.status !== 'cancelled' &&
      b.date === dateStr
  );

  // Build a Set of all slot IDs that are occupied (locked by duration)
  const occupiedSlots = new Set();
  activeBookings.forEach(b => {
    // Parse the booked slot start time
    const [startHour, startMin] = b.slotTime
      ? b.slotTime.replace(/ (AM|PM)/, (_, ampm) => '')
      : b.slotId.split('_')[1].split(':');
    
    // Extract hour/min from slotId which is in 24h format: "YYYY-MM-DD_HH:MM"
    const timePart = b.slotId.split('_')[1]; // "HH:MM"
    if (!timePart) return;
    const [sH, sM] = timePart.split(':').map(Number);
    const duration = b.duration || 30; // default 30 min
    const slotsNeeded = Math.ceil(duration / 30);

    for (let i = 0; i < slotsNeeded; i++) {
      const totalMin = sH * 60 + sM + i * 30;
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      if (h > 22) break; // don't go past closing
      const lockId = `${dateStr}_${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      occupiedSlots.add(lockId);
    }
  });

  // Generate slots from 6 AM to 10 PM in 30-minute intervals
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (let min = 0; min < 60; min += 30) {
      if (hour === 22 && min > 0) break;
      const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      const slotId = `${dateStr}_${timeStr}`;

      slots.push({
        id: slotId,
        time: timeStr,
        displayTime: formatTime(hour, min),
        isBooked: occupiedSlots.has(slotId),
      });
    }
  }
  return slots;
}

function formatTime(hour, min) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h}:${String(min).padStart(2, '0')} ${ampm}`;
}

/**
 * Create a booking
 */
export function createBooking(userId, station, slotId, slotTime, date, chargerType, duration, payment) {
  const bookings = getBookings();
  const booking = {
    $id: 'booking_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    userId,
    stationId: station.id,
    stationName: station.title,
    stationAddress: station.address,
    stationLat: station.latitude,
    stationLng: station.longitude,
    slotId,
    slotTime,
    date,
    chargerType,
    duration, // in minutes
    payment: {
      method: payment.method,
      amount: payment.amount,
      currency: 'INR',
      last4: payment.last4 || '****',
      transactionId: 'TXN_' + Date.now(),
      status: 'completed',
    },
    status: 'confirmed', // confirmed | cancelled
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  saveBookings(bookings);
  return booking;
}

/**
 * Get all bookings for a user
 */
export function getUserBookings(userId) {
  const bookings = getBookings();
  return bookings
    .filter(b => b.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Cancel a booking
 */
export function cancelBooking(bookingId) {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.$id === bookingId);
  if (idx === -1) throw new Error('Booking not found');
  if (bookings[idx].status === 'cancelled') throw new Error('Booking already cancelled');

  bookings[idx].status = 'cancelled';
  bookings[idx].cancelledAt = new Date().toISOString();
  bookings[idx].payment.refundStatus = 'refunded';
  saveBookings(bookings);
  return bookings[idx];
}

/**
 * Calculate charging cost
 */
export function calculateCost(chargerType, durationMinutes) {
  const rates = {
    'Level 2 AC': 10,     // ₹/min
    'DC Fast (50kW)': 25,  // ₹/min
    'DC Ultra (150kW+)': 40, // ₹/min
  };
  const rate = rates[chargerType] || 20;
  return parseFloat((rate * durationMinutes).toFixed(2));
}

/**
 * Get available charger types
 */
export function getChargerTypes() {
  return [
    { id: 'level2', name: 'Level 2 AC', rate: '₹10/min', icon: '🔌' },
    { id: 'dc50', name: 'DC Fast (50kW)', rate: '₹25/min', icon: '⚡' },
    { id: 'dc150', name: 'DC Ultra (150kW+)', rate: '₹40/min', icon: '🔥' },
  ];
}

/**
 * Get duration options
 */
export function getDurationOptions() {
  return [
    { minutes: 15, label: '15 min' },
    { minutes: 30, label: '30 min' },
    { minutes: 45, label: '45 min' },
    { minutes: 60, label: '1 hour' },
    { minutes: 90, label: '1.5 hours' },
    { minutes: 120, label: '2 hours' },
  ];
}
