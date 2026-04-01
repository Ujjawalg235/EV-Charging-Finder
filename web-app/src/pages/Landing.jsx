import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div style={{ fontSize: '4rem', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
        ⚡
      </div>
      <h1>
        Discover your nearest<br />
        EV charging station with{' '}
        <span className="highlight">EVCS Finder</span>
      </h1>
      <p>
        Locate, know more and compare your nearest EV charging centers.
        Fast, reliable, and always up-to-date.
      </p>
      <button
        className="btn btn-primary"
        onClick={() => navigate('/sign-in')}
        id="landing-continue-btn"
        style={{ minWidth: '280px', fontSize: '1.05rem' }}
      >
        ⚡&nbsp;&nbsp;Continue with Email&nbsp;&nbsp;⚡
      </button>
    </div>
  );
}
