import { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalProvider';
import {
  getAvailableSlots,
  createBooking,
  calculateCost,
  getChargerTypes,
  getDurationOptions,
} from '../lib/booking';

export default function BookStation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const locationState = useLocation();
  const { user } = useGlobalContext();

  const station = locationState.state?.station;

  const [step, setStep] = useState(1); // 1=slot, 2=charger, 3=payment, 4=confirm
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  const chargerTypes = getChargerTypes();
  const durationOptions = getDurationOptions();

  const slots = useMemo(() => {
    if (!station) return [];
    return getAvailableSlots(station.id, selectedDate);
  }, [station, selectedDate]);

  const cost = useMemo(() => {
    if (!selectedCharger) return 0;
    const chargerName = chargerTypes.find(c => c.id === selectedCharger)?.name || '';
    return calculateCost(chargerName, selectedDuration);
  }, [selectedCharger, selectedDuration]);

  if (!station) {
    return (
      <div className="page page-narrow" style={{ paddingBottom: '100px' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <h3>Station not found</h3>
          <p>Please go back and select a station.</p>
        </div>
      </div>
    );
  }

  const handleConfirmBooking = async () => {
    setProcessing(true);
    setError('');

    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));

    try {
      const chargerName = chargerTypes.find(c => c.id === selectedCharger)?.name || '';
      const slotInfo = slots.find(s => s.id === selectedSlot);
      const last4 = paymentMethod === 'card'
        ? cardNumber.replace(/\s/g, '').slice(-4) || '4242'
        : paymentMethod === 'upi' ? 'UPI' : 'WALLET';

      const result = createBooking(
        user.$id,
        station,
        selectedSlot,
        slotInfo?.displayTime || '',
        selectedDate,
        chargerName,
        selectedDuration,
        { method: paymentMethod, amount: cost, last4 }
      );

      setBooking(result);
      setStep(4);
    } catch (err) {
      setError('Booking failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Step indicators
  const stepLabels = ['Select Slot', 'Charger & Duration', 'Payment', 'Confirmed'];

  return (
    <div className="page page-narrow" style={{ paddingBottom: '100px' }}>
      <button className="back-btn" onClick={() => step > 1 && step < 4 ? setStep(step - 1) : navigate(-1)}>
        ← {step > 1 && step < 4 ? 'Previous Step' : 'Back'}
      </button>

      {/* Station Header */}
      <div className="book-station-header">
        <h1 className="book-station-name">{station.title}</h1>
        <p className="book-station-address">{station.address}</p>
      </div>

      {/* Progress Steps */}
      <div className="booking-steps">
        {stepLabels.map((label, i) => (
          <div key={i} className={`booking-step ${step > i ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}>
            <div className="booking-step-circle">
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className="booking-step-label">{label}</span>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Step 1: Slot Selection */}
      {step === 1 && (
        <div className="booking-section">
          <h2 className="booking-section-title">📅 Select Date & Time Slot</h2>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
            />
          </div>

          <div className="slots-grid">
            {slots.map(slot => (
              <button
                key={slot.id}
                className={`slot-btn ${selectedSlot === slot.id ? 'selected' : ''} ${slot.isBooked ? 'booked' : ''}`}
                onClick={() => !slot.isBooked && setSelectedSlot(slot.id)}
                disabled={slot.isBooked}
              >
                {slot.displayTime}
                {slot.isBooked && <span className="slot-booked-label">Booked</span>}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary btn-full"
            disabled={!selectedSlot}
            onClick={() => setStep(2)}
            style={{ marginTop: '20px' }}
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Charger Type & Duration */}
      {step === 2 && (
        <div className="booking-section">
          <h2 className="booking-section-title">⚡ Charger Type & Duration</h2>

          <div className="charger-options">
            {chargerTypes.map(ct => (
              <button
                key={ct.id}
                className={`charger-option ${selectedCharger === ct.id ? 'selected' : ''}`}
                onClick={() => setSelectedCharger(ct.id)}
              >
                <span className="charger-option-icon">{ct.icon}</span>
                <span className="charger-option-name">{ct.name}</span>
                <span className="charger-option-rate">{ct.rate}</span>
              </button>
            ))}
          </div>

          <h3 className="booking-subsection-title">⏱️ Charging Duration</h3>
          <div className="duration-options">
            {durationOptions.map(d => (
              <button
                key={d.minutes}
                className={`duration-btn ${selectedDuration === d.minutes ? 'selected' : ''}`}
                onClick={() => setSelectedDuration(d.minutes)}
              >
                {d.label}
              </button>
            ))}
          </div>

          {selectedCharger && (
            <div className="cost-preview">
              <span>Estimated Cost:</span>
              <span className="cost-amount">₹{cost.toFixed(2)}</span>
            </div>
          )}

          <button
            className="btn btn-primary btn-full"
            disabled={!selectedCharger}
            onClick={() => setStep(3)}
            style={{ marginTop: '16px' }}
          >
            Continue to Payment →
          </button>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="booking-section">
          <h2 className="booking-section-title">💳 Payment</h2>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Station</span>
              <span>{station.title}</span>
            </div>
            <div className="summary-row">
              <span>Date</span>
              <span>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="summary-row">
              <span>Time Slot</span>
              <span>{slots.find(s => s.id === selectedSlot)?.displayTime}</span>
            </div>
            <div className="summary-row">
              <span>Charger</span>
              <span>{chargerTypes.find(c => c.id === selectedCharger)?.name}</span>
            </div>
            <div className="summary-row">
              <span>Duration</span>
              <span>{durationOptions.find(d => d.minutes === selectedDuration)?.label}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{cost.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <h3 className="booking-subsection-title">Payment Method</h3>
          <div className="payment-methods">
            <button
              className={`payment-method-btn ${paymentMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              💳 Credit/Debit Card
            </button>
            <button
              className={`payment-method-btn ${paymentMethod === 'upi' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('upi')}
            >
              📱 UPI
            </button>
            <button
              className={`payment-method-btn ${paymentMethod === 'wallet' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('wallet')}
            >
              👛 Wallet
            </button>
          </div>

          {paymentMethod === 'card' && (
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Card Number</label>
              <input
                className="form-input"
                type="text"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, '').slice(0, 19))}
                maxLength={19}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label className="form-label">Expiry</label>
                  <input className="form-input" type="text" placeholder="MM/YY" maxLength={5} />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label className="form-label">CVV</label>
                  <input className="form-input" type="text" placeholder="123" maxLength={3} />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">UPI ID</label>
              <input className="form-input" type="text" placeholder="yourname@upi" />
            </div>
          )}

          {paymentMethod === 'wallet' && (
            <div className="wallet-info">
              <span>👛 Wallet Balance: <strong>₹2500.00</strong></span>
            </div>
          )}

          <button
            className="btn btn-primary btn-full pay-btn"
            onClick={handleConfirmBooking}
            disabled={processing}
            style={{ marginTop: '20px' }}
          >
            {processing ? (
              <span className="pay-processing">
                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                Processing Payment...
              </span>
            ) : (
              `💰 Pay ₹${cost.toFixed(2)} & Confirm Booking`
            )}
          </button>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && booking && (
        <div className="booking-section">
          <div className="booking-success">
            <div className="success-icon">✅</div>
            <h2>Booking Confirmed!</h2>
            <p>Your charging slot has been reserved successfully.</p>
          </div>

          <div className="booking-confirmation-card">
            <div className="confirmation-row">
              <span className="confirmation-label">Booking ID</span>
              <span className="confirmation-value">{booking.$id}</span>
            </div>
            <div className="confirmation-row">
              <span className="confirmation-label">Station</span>
              <span className="confirmation-value">{booking.stationName}</span>
            </div>
            <div className="confirmation-row">
              <span className="confirmation-label">Date</span>
              <span className="confirmation-value">
                {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="confirmation-row">
              <span className="confirmation-label">Time</span>
              <span className="confirmation-value">{booking.slotTime}</span>
            </div>
            <div className="confirmation-row">
              <span className="confirmation-label">Charger</span>
              <span className="confirmation-value">{booking.chargerType}</span>
            </div>
            <div className="confirmation-row">
              <span className="confirmation-label">Duration</span>
              <span className="confirmation-value">{booking.duration} min</span>
            </div>
            <div className="confirmation-divider" />
            <div className="confirmation-row">
              <span className="confirmation-label">Amount Paid</span>
              <span className="confirmation-value confirmation-amount">
                ₹{booking.payment.amount.toFixed(2)}
              </span>
            </div>
            <div className="confirmation-row">
              <span className="confirmation-label">Transaction ID</span>
              <span className="confirmation-value" style={{ fontSize: '.8rem' }}>
                {booking.payment.transactionId}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => navigate('/home')}
            >
              🏠 Go Home
            </button>
            <button
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => navigate('/profile')}
            >
              📋 View Bookings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
