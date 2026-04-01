import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getStationById, markVisited } from '../lib/data';
import { useGlobalContext } from '../context/GlobalProvider';

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useGlobalContext();
  const locationState = useLocation();
  const [station, setStation] = useState(locationState.state?.station || null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 16) // format for datetime-local
  );
  const [review, setReview] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!station) {
      setStation(getStationById(id));
    }
  }, [id, station]);

  if (!station) {
    return (
      <div className="page page-narrow">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <h3>Station not found</h3>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!review.trim()) {
      setError('Please write a review before submitting');
      return;
    }

    try {
      markVisited(user.$id, station, selectedDate, review);
      setSuccess('Review submitted successfully!');
      setError('');
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1500);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    }
  };

  return (
    <div className="page page-narrow" style={{ paddingBottom: '100px' }}>
      <button className="back-btn" onClick={() => navigate(-1)} id="review-back-btn">
        ← Back
      </button>

      <h1 className="review-page-title">{station.title}</h1>
      <p className="review-page-subtitle">When did you last visit this station?</p>

      {error && (
        <div className="alert alert-error">⚠️ {error}</div>
      )}

      {success && (
        <div className="alert alert-success">✅ {success}</div>
      )}

      {/* Date Picker */}
      <div className="form-group">
        <label className="form-label" htmlFor="review-date">Select Date & Time</label>
        <input
          id="review-date"
          className="form-input"
          type="datetime-local"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="date-display">
        <span className="date-display-icon">📅</span>
        <span className="date-display-value">
          {new Date(selectedDate).toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>
      </div>

      {/* Review Text */}
      <div className="form-group">
        <label className="form-label" htmlFor="review-text">Write your review</label>
        <textarea
          id="review-text"
          className="form-input"
          placeholder="How was your experience? Share your thoughts..."
          value={review}
          onChange={(e) => {
            setReview(e.target.value);
            if (error) setError('');
          }}
          rows="6"
        />
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={handleSubmit}
        id="submit-review-btn"
      >
        ✅ Send Review
      </button>
    </div>
  );
}
