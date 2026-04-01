import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalProvider';
import { signOut } from '../lib/auth';
import { getUserVisitedStations, removeVisited } from '../lib/data';
import { getUserBookings, cancelBooking } from '../lib/booking';

export default function Profile() {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [visitedStations, setVisitedStations] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);

  const loadData = () => {
    if (user) {
      setBookings(getUserBookings(user.$id));
      setVisitedStations(getUserVisitedStations(user.$id));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleLogout = () => {
    signOut();
    setUser(null);
    setIsLogged(false);
    navigate('/sign-in', { replace: true });
  };

  const handleCancelBooking = (bookingId) => {
    setCancellingId(bookingId);
    setTimeout(() => {
      try {
        cancelBooking(bookingId);
        loadData();
      } catch (err) {
        console.error(err);
      } finally {
        setCancellingId(null);
      }
    }, 800);
  };

  const handleDeleteVisited = (visitedId) => {
    removeVisited(visitedId);
    loadData();
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const initials = user?.username
    ? user.username.charAt(0).toUpperCase()
    : '?';

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <div className="profile-name">{user?.username}</div>
          <div className="profile-email">{user?.email}</div>
        </div>
        <button className="profile-logout" onClick={handleLogout} id="profile-logout-btn">
          🚪 Logout
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📋 Bookings ({bookings.length})
        </button>
        <button
          className={`profile-tab ${activeTab === 'visited' ? 'active' : ''}`}
          onClick={() => setActiveTab('visited')}
        >
          📍 Visited ({visitedStations.length})
        </button>
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No bookings yet</h3>
              <p>Book a charging slot from the home page!</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/home')}
                style={{ marginTop: '16px' }}
              >
                Find Stations
              </button>
            </div>
          ) : (
            <>
              {/* Active Bookings */}
              {confirmedBookings.length > 0 && (
                <>
                  <div className="section-title" style={{ color: 'var(--green-400)' }}>
                    ✅ Active Bookings ({confirmedBookings.length})
                  </div>
                  {confirmedBookings.map(booking => (
                    <div key={booking.$id} className="booking-history-card">
                      <div className="booking-history-header">
                        <div className="booking-history-station">{booking.stationName}</div>
                        <span className="booking-status-badge confirmed">Confirmed</span>
                      </div>
                      <div className="booking-history-details">
                        <div className="booking-detail-row">
                          <span>📅</span>
                          <span>{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="booking-detail-row">
                          <span>⏰</span>
                          <span>{booking.slotTime}</span>
                        </div>
                        <div className="booking-detail-row">
                          <span>⚡</span>
                          <span>{booking.chargerType} · {booking.duration} min</span>
                        </div>
                        <div className="booking-detail-row">
                          <span>💰</span>
                          <span>₹{booking.payment.amount.toFixed(2)} via {booking.payment.method}</span>
                        </div>
                        <div className="booking-detail-row" style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                          <span>🆔</span>
                          <span>{booking.$id}</span>
                        </div>
                      </div>
                      <div className="booking-history-actions">
                        <button
                          className="btn btn-outline"
                          style={{ fontSize: '.85rem', padding: '8px 16px' }}
                          onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${booking.stationLat},${booking.stationLng}`;
                            window.open(url, '_blank');
                          }}
                        >
                          🧭 Directions
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: '.85rem', padding: '8px 16px' }}
                          onClick={() => handleCancelBooking(booking.$id)}
                          disabled={cancellingId === booking.$id}
                        >
                          {cancellingId === booking.$id ? '⏳ Cancelling...' : '❌ Cancel'}
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Cancelled Bookings */}
              {cancelledBookings.length > 0 && (
                <>
                  <div className="section-title" style={{ color: 'var(--text-muted)', marginTop: '24px' }}>
                    ❌ Cancelled ({cancelledBookings.length})
                  </div>
                  {cancelledBookings.map(booking => (
                    <div key={booking.$id} className="booking-history-card cancelled">
                      <div className="booking-history-header">
                        <div className="booking-history-station">{booking.stationName}</div>
                        <span className="booking-status-badge cancelled">Cancelled</span>
                      </div>
                      <div className="booking-history-details">
                        <div className="booking-detail-row">
                          <span>📅</span>
                          <span>{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="booking-detail-row">
                          <span>⏰</span>
                          <span>{booking.slotTime}</span>
                        </div>
                        <div className="booking-detail-row">
                          <span>💰</span>
                          <span>₹{booking.payment.amount.toFixed(2)} — <span style={{ color: 'var(--green-400)' }}>Refunded</span></span>
                        </div>
                        <div className="booking-detail-row" style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                          <span>🕐</span>
                          <span>Cancelled on {formatDateTime(booking.cancelledAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Visited Tab */}
      {activeTab === 'visited' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="visited-tab-description" style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--green-400)' }}>About Visited Stations</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Keep a personal log of stations you've visited. After your charging session, you can leave a review, notes, and the date you visited. This history helps you remember the best spots for your future trips!
            </p>
          </div>

          {visitedStations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No stations visited yet</h3>
              <p>Visit a station and let us know your experience!</p>
            </div>
          ) : (
            visitedStations.map((item) => (
              <div
                key={item.visitedId}
                className="visited-card"
                onClick={() => navigate(`/station/${item.$id}`, { state: { station: item } })}
              >
                <div className="visited-card-title">{item.title}</div>
                <div className="visited-card-meta">
                  <span>📞 {item.phone}</span>
                  <span>💬 {item.visitedReview || 'N/A'}</span>
                  <span>📅 {formatDateTime(item.visitedDate)}</span>
                </div>
                <button
                  className="btn btn-danger"
                  onClick={(e) => { e.stopPropagation(); handleDeleteVisited(item.visitedId); }}
                  style={{ padding: '8px 16px', fontSize: '.85rem' }}
                >
                  🗑️ Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
