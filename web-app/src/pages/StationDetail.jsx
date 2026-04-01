import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStationById, getReviewsByStationId } from '../lib/data';

export default function StationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getStationById(id);
    setStation(data);
    setReviews(getReviewsByStationId(id));
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="page page-narrow">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <h3>Station not found</h3>
          <p>The station you are looking for doesn't exist.</p>
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

      {/* Location */}
      <div className="detail-section">
        <div className="detail-label">📍 Location</div>
        <div className="map-placeholder">
          <div className="map-icon">🗺️</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>
            {station.address}
          </div>
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            Open in Google Maps →
          </a>
        </div>
      </div>

      {/* Phone */}
      <div className="detail-section">
        <div className="detail-label">Phone</div>
        <a href={`tel:${station.phone}`} className="detail-value clickable">
          {station.phone}
        </a>
      </div>

      {/* Website */}
      <div className="detail-section">
        <div className="detail-label">Website</div>
        <a
          href={station.web}
          target="_blank"
          rel="noopener noreferrer"
          className="detail-value clickable"
        >
          {station.web}
        </a>
      </div>

      {/* Operating Hours */}
      <div className="detail-section">
        <div className="detail-label">Operating Hours</div>
        <div className="detail-value">{station.operating_hours}</div>
      </div>

      {/* Services */}
      <div className="detail-section">
        <div className="detail-label">Services</div>
        <div className="detail-services">
          {station.services.map((service, index) => (
            <span key={index} className="service-chip">
              {service}
            </span>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="detail-section">
        <div className="detail-label">Rating</div>
        <div className="detail-rating-big">
          {station.rating} <span>/ 5 ⭐</span>
        </div>
      </div>

      {/* Reviews */}
      <div className="detail-section">
        <div className="detail-label">Reviews</div>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review-card">
              <div className="review-text">"{review.review}"</div>
              <div className="review-meta">
                By {review.creator.username} •{' '}
                {new Date(review.date).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="no-reviews">No reviews yet. Be the first!</div>
        )}
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={() => navigate(`/stations/${station.$id}/review`)}
        id="give-review-btn"
        style={{ marginBottom: '20px' }}
      >
        ✍️ Give Review
      </button>
    </div>
  );
}
