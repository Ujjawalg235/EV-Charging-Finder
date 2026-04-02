import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNearbyStations, getCurrentPosition } from '../lib/api';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker } from 'react-leaflet';

export default function NearbyStations() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(10);
  const [sortBy, setSortBy] = useState('distance');

  useEffect(() => {
    loadNearby();
  }, []);

  const loadNearby = async () => {
    setLoading(true);
    setError('');
    try {
      const pos = await getCurrentPosition();
      setLocation(pos);
      const data = await fetchNearbyStations(pos.lat, pos.lng, radius, 50);
      setStations(data);
    } catch (err) {
      setError(err.message + ' Using default location.');
      const defaultPos = { lat: 28.6139, lng: 77.2090 };
      setLocation(defaultPos);
      try {
        const data = await fetchNearbyStations(defaultPos.lat, defaultPos.lng, radius, 50);
        setStations(data);
      } catch { /* empty */ }
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusSearch = async (newRadius) => {
    setRadius(newRadius);
    if (!location) return;
    setLoading(true);
    try {
      const data = await fetchNearbyStations(location.lat, location.lng, newRadius, 50);
      setStations(data);
    } catch (err) {
      setError('Failed to load stations.');
    } finally {
      setLoading(false);
    }
  };

  const sortedStations = [...stations].sort((a, b) => {
    if (sortBy === 'distance') return (parseFloat(a.distance) || 999) - (parseFloat(b.distance) || 999);
    if (sortBy === 'connectors') return b.numConnections - a.numConnections;
    return 0;
  });

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="page-title">📍 Nearby Charging Stations</h1>
      <p className="page-subtitle">
        {location ? `Searching around ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Getting your location...'}
      </p>

      {/* Controls */}
      <div className="filter-row">
        <div className="filter-group">
          <span className="filter-label">Radius:</span>
          <div className="radius-options">
            {[5, 10, 15, 25, 50].map(r => (
              <button
                key={r}
                className={`radius-chip ${radius === r ? 'active' : ''}`}
                onClick={() => handleRadiusSearch(r)}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Sort:</span>
          <div className="radius-options">
            <button
              className={`radius-chip ${sortBy === 'distance' ? 'active' : ''}`}
              onClick={() => setSortBy('distance')}
            >
              Distance
            </button>
            <button
              className={`radius-chip ${sortBy === 'connectors' ? 'active' : ''}`}
              onClick={() => setSortBy('connectors')}
            >
              Connectors
            </button>
          </div>
        </div>
      </div>

      {/* Map Embed */}
      {location && (
        <div className="map-embed" style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', border: '1px solid var(--border-subtle)' }}>
          <MapContainer center={[location.lat, location.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {/* User Location - Blue pulsing dot */}
            <CircleMarker center={[location.lat, location.lng]} radius={10} pathOptions={{ color: '#4285F4', fillColor: '#4285F4', fillOpacity: 0.9, weight: 3 }}>
              <Popup><span>📍 Your Location</span></Popup>
            </CircleMarker>
            <Circle center={[location.lat, location.lng]} radius={radius * 1000} pathOptions={{ color: 'var(--green-500)', fillColor: 'var(--green-500)', fillOpacity: 0.1 }} />
            
            {/* Stations */}
            {sortedStations.map(station => (
              <Marker key={station.id} position={[station.latitude, station.longitude]}>
                <Popup>
                  <div style={{ color: '#000' }}>
                    <strong>{station.title}</strong><br/>
                    {station.distance} km away<br/>
                    {station.isOperational ? '🟢 Operational' : '🔴 Offline'}<br/>
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

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : sortedStations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📡</div>
          <h3>No stations found nearby</h3>
          <p>Try increasing the search radius.</p>
        </div>
      ) : (
        <>
          <div className="results-count">
            Found <strong>{sortedStations.length}</strong> stations
          </div>
          <div className="stations-list">
            {sortedStations.map(station => (
              <div
                key={station.id}
                className="station-list-card"
                onClick={() => navigate(`/station/${station.id}`, { state: { station } })}
              >
                <div className="station-list-card-img-wrap">
                  <img src={station.thumbnail} alt={station.title} className="station-list-card-img" loading="lazy" />
                  {station.distance && (
                    <div className="station-distance-badge">{station.distance} km</div>
                  )}
                </div>
                <div className="station-list-card-body">
                  <div className="station-list-card-title">{station.title}</div>
                  <div className="station-list-card-address">{station.address}</div>
                  <div className="station-list-card-meta">
                    <span className={`status-badge ${station.isOperational ? 'operational' : 'offline'}`}>
                      {station.isOperational ? '🟢 Operational' : '🔴 Offline'}
                    </span>
                    <span className="connector-count">🔌 {station.numConnections} connectors</span>
                  </div>
                  <div className="station-connectors">
                    {station.connectionTypes.slice(0, 3).map((ct, i) => (
                      <span key={i} className="connector-chip">{ct}</span>
                    ))}
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
                    Book
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
