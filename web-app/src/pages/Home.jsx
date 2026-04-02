import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalProvider';
import { fetchNearbyStations, getCurrentPosition } from '../lib/api';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker } from 'react-leaflet';

export default function Home() {
  const { user } = useGlobalContext();
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(15);

  const loadStations = useCallback(async (lat, lng, radius) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchNearbyStations(lat, lng, radius, 30);
      setStations(data);
    } catch (err) {
      setError('Failed to load stations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const pos = await getCurrentPosition();
        setLocation(pos);
        await loadStations(pos.lat, pos.lng, searchRadius);
      } catch (err) {
        setError(err.message + ' Using default location (New Delhi).');
        const defaultPos = { lat: 28.6139, lng: 77.2090 };
        setLocation(defaultPos);
        await loadStations(defaultPos.lat, defaultPos.lng, searchRadius);
      }
    })();
  }, []);

  const handleRadiusChange = async (newRadius) => {
    setSearchRadius(newRadius);
    if (location) {
      await loadStations(location.lat, location.lng, newRadius);
    }
  };

  const handleRefreshLocation = async () => {
    try {
      const pos = await getCurrentPosition();
      setLocation(pos);
      await loadStations(pos.lat, pos.lng, searchRadius);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="home-header">
        <div>
          <div className="home-header-greeting">Welcome Back,</div>
          <div className="home-header-name">{user?.username}</div>
        </div>
        <div style={{ fontSize: '2rem' }}>⚡</div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className="quick-action-card"
          onClick={() => navigate('/nearby')}
          id="action-nearby"
        >
          <span className="quick-action-icon">📍</span>
          <span className="quick-action-label">Nearby Stations</span>
        </button>
        <button
          className="quick-action-card"
          onClick={() => navigate('/enroute')}
          id="action-enroute"
        >
          <span className="quick-action-icon">🗺️</span>
          <span className="quick-action-label">Enroute Finder</span>
        </button>
        <button
          className="quick-action-card"
          onClick={() => navigate('/profile')}
          id="action-bookings"
        >
          <span className="quick-action-icon">📋</span>
          <span className="quick-action-label">My Bookings</span>
        </button>
      </div>

      {/* Map Embed */}
      {location && (
        <div className="map-embed" style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', border: '1px solid var(--border-subtle)' }}>
          <MapContainer center={[location.lat, location.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {/* User Location - Blue pulsing dot */}
            <CircleMarker center={[location.lat, location.lng]} radius={10} pathOptions={{ color: '#4285F4', fillColor: '#4285F4', fillOpacity: 0.9, weight: 3 }}>
              <Popup><span>📍 Your Location</span></Popup>
            </CircleMarker>
            <Circle center={[location.lat, location.lng]} radius={searchRadius * 1000} pathOptions={{ color: 'var(--green-500)', fillColor: 'var(--green-500)', fillOpacity: 0.1 }} />
            
            {/* Stations */}
            {stations.map(station => (
              <Marker key={station.id} position={[station.latitude, station.longitude]}>
                <Popup>
                  <div style={{ color: '#000' }}>
                    <strong>{station.title}</strong><br/>
                    {station.distance} km away<br/>
                    <button 
                      onClick={() => navigate(`/station/${station.id}`, { state: { station } })}
                      style={{ marginTop: '8px', padding: '4px 8px', background: 'var(--green-500)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      View
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Search Radius Controls */}
      <div className="radius-controls">
        <div className="radius-label">
          <span>🔍 Stations within</span>
          <button
            className="refresh-btn"
            onClick={handleRefreshLocation}
            title="Refresh location"
          >
            📍 Refresh Location
          </button>
        </div>
        <div className="radius-options">
          {[5, 10, 15, 25, 50].map(r => (
            <button
              key={r}
              className={`radius-chip ${searchRadius === r ? 'active' : ''}`}
              onClick={() => handleRadiusChange(r)}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Stations List */}
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : stations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔌</div>
          <h3>No Stations Found</h3>
          <p>Try increasing the search radius or refreshing your location.</p>
        </div>
      ) : (
        <>
          <div className="results-count">
            Found <strong>{stations.length}</strong> stations nearby
          </div>
          <div className="stations-list">
            {stations.map((station) => (
              <div
                key={station.id}
                className="station-list-card"
                onClick={() => navigate(`/station/${station.id}`, { state: { station } })}
              >
                <div className="station-list-card-img-wrap">
                  <img
                    src={station.thumbnail}
                    alt={station.title}
                    className="station-list-card-img"
                    loading="lazy"
                  />
                  {station.distance && (
                    <div className="station-distance-badge">
                      {station.distance} km
                    </div>
                  )}
                </div>
                <div className="station-list-card-body">
                  <div className="station-list-card-title">{station.title}</div>
                  <div className="station-list-card-address">{station.address}</div>
                  <div className="station-list-card-meta">
                    <span className={`status-badge ${station.isOperational ? 'operational' : 'offline'}`}>
                      {station.isOperational ? '🟢 Operational' : '🔴 Offline'}
                    </span>
                    <span className="connector-count">
                      🔌 {station.numConnections} connector{station.numConnections !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="station-connectors">
                    {station.connectionTypes.slice(0, 3).map((ct, i) => (
                      <span key={i} className="connector-chip">{ct}</span>
                    ))}
                    {station.connectionTypes.length > 3 && (
                      <span className="connector-chip more">+{station.connectionTypes.length - 3}</span>
                    )}
                  </div>
                </div>
                <div className="station-list-card-action">
                  <button
                    className="btn btn-primary"
                    style={{ padding: '10px 18px', fontSize: '.85rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/book/${station.id}`, { state: { station } });
                    }}
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
