import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function StationDetailAPI() {
  const { id } = useParams();
  const navigate = useNavigate();
  const locationState = useLocation();
  const station = locationState.state?.station;

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

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;

  return (
    <div className="page" style={{ maxWidth: '720px', paddingBottom: '100px' }}>
      <button className="back-btn" onClick={() => navigate(-1)} id="detail-back-btn">
        ← Back
      </button>

      <img
        src={station.thumbnail}
        alt={station.title}
        className="detail-hero-image"
      />

      <h1 className="detail-title">{station.title}</h1>

      {/* Status */}
      <div className="detail-section">
        <span className={`status-badge-large ${station.isOperational ? 'operational' : 'offline'}`}>
          {station.isOperational ? '🟢 Operational' : '🔴 Currently Offline'}
        </span>
      </div>

      {/* Operator */}
      <div className="detail-section">
        <div className="detail-label">Operator</div>
        <div className="detail-value">{station.operatorName}</div>
      </div>

      {/* Location */}
      <div className="detail-section">
        <div className="detail-label">📍 Location</div>
        <div className="map-placeholder">
          <div className="map-icon">🗺️</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>
            {station.address}
          </div>
          {station.distance && (
            <div style={{ color: 'var(--green-400)', fontWeight: 600, fontSize: '.9rem' }}>
              📏 {station.distance} km away
            </div>
          )}
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            Open in Google Maps →
          </a>
        </div>
      </div>

      {/* Phone */}
      {station.phone && (
        <div className="detail-section">
          <div className="detail-label">Phone</div>
          <a href={`tel:${station.phone}`} className="detail-value clickable">
            {station.phone}
          </a>
        </div>
      )}

      {/* Website */}
      {station.web && (
        <div className="detail-section">
          <div className="detail-label">Website</div>
          <a href={station.web} target="_blank" rel="noopener noreferrer" className="detail-value clickable">
            {station.web}
          </a>
        </div>
      )}

      {/* Connections / Chargers */}
      <div className="detail-section">
        <div className="detail-label">⚡ Charger Types ({station.numConnections} connectors)</div>
        <div className="detail-services">
          {station.connectionTypes.map((ct, index) => (
            <span key={index} className="service-chip">{ct}</span>
          ))}
        </div>
      </div>

      {/* Usage Cost */}
      <div className="detail-section">
        <div className="detail-label">💰 Usage Cost</div>
        <div className="detail-value">{station.usageCost}</div>
      </div>

      {/* Book Slot Button */}
      <button
        className="btn btn-primary btn-full"
        onClick={() => navigate(`/book/${station.id}`, { state: { station } })}
        id="book-slot-btn"
        style={{ marginBottom: '12px' }}
      >
        ⚡ Book a Charging Slot
      </button>

      <button
        className="btn btn-outline btn-full"
        onClick={() => {
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
          window.open(directionsUrl, '_blank');
        }}
        style={{ marginBottom: '12px' }}
      >
        🧭 Get Directions
      </button>

      {/* Review Button */}
      <button
        className="btn btn-outline btn-full"
        onClick={() => navigate(`/stations/${station.id}/review`, { state: { station } })}
        style={{ marginBottom: '20px' }}
      >
        📝 Write a Review
      </button>
    </div>
  );
}
