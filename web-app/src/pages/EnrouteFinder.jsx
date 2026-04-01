import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEnrouteStations, geocodePlace } from '../lib/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function EnrouteFinder() {
  const navigate = useNavigate();
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [connectorFilter, setConnectorFilter] = useState('');

  const filteredStations = useMemo(() => {
    if (!connectorFilter) return stations;
    return stations.filter(s => 
      s.connectionTypes.some(ct => ct.toLowerCase().includes(connectorFilter.toLowerCase()))
    );
  }, [stations, connectorFilter]);

  const handleSearch = async () => {
    if (!startQuery.trim() || !endQuery.trim()) {
      setError('Please enter both start and destination locations');
      return;
    }

    setLoading(true);
    setError('');
    setStations([]);
    setSearched(true);

    try {
      const [start, end] = await Promise.all([
        geocodePlace(startQuery),
        geocodePlace(endQuery),
      ]);

      setRouteInfo({
        startName: start.displayName.split(',').slice(0, 2).join(','),
        endName: end.displayName.split(',').slice(0, 2).join(','),
        startCoords: [start.lat, start.lng],
        endCoords: [end.lat, end.lng],
      });

      const results = await fetchEnrouteStations(
        start.lat, start.lng,
        end.lat, end.lng,
        8, 60
      );

      setStations(results);
    } catch (err) {
      setError(err.message || 'Failed to find stations along route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="page-title">🗺️ Enroute Charging Stations</h1>
      <p className="page-subtitle">Find charging stations along your travel route</p>

      {/* Route Input */}
      <div className="route-input-card">
        <div className="route-point">
          <div className="route-dot start" />
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <input
              className="form-input"
              type="text"
              placeholder="Start location (e.g., Mumbai)"
              value={startQuery}
              onChange={(e) => setStartQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              id="enroute-start"
            />
          </div>
        </div>
        <div className="route-line" />
        <div className="route-point">
          <div className="route-dot end" />
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <input
              className="form-input"
              type="text"
              placeholder="Destination (e.g., Pune)"
              value={endQuery}
              onChange={(e) => setEndQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              id="enroute-end"
            />
          </div>
        </div>
        <button
          className="btn btn-primary btn-full"
          onClick={handleSearch}
          disabled={loading}
          id="enroute-search-btn"
          style={{ marginTop: '16px' }}
        >
          {loading ? '🔍 Searching...' : '🔍 Find Stations Along Route'}
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {routeInfo && !loading && (
        <div className="route-info-banner">
          <span>🚗</span>
          <span>{routeInfo.startName}</span>
          <span>→</span>
          <span>{routeInfo.endName}</span>
        </div>
      )}

      {/* Map Embed & Filter */}
      {searched && !loading && routeInfo && (
        <div style={{ marginBottom: '24px' }}>
          <div className="filter-group" style={{ marginBottom: '16px' }}>
            <span className="filter-label">Filter by Connector:</span>
            <div className="radius-options">
              {['', 'Type 2', 'CCS', 'CHAdeMO'].map(type => (
                <button
                  key={type}
                  className={`radius-chip ${connectorFilter === type ? 'active' : ''}`}
                  onClick={() => setConnectorFilter(type)}
                >
                  {type || 'All Connectors'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="map-embed" style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <MapContainer center={routeInfo.startCoords} zoom={9} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OSM'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <Marker position={routeInfo.startCoords}>
                <Popup><span>Start: {routeInfo.startName}</span></Popup>
              </Marker>
              <Marker position={routeInfo.endCoords}>
                <Popup><span>Destination: {routeInfo.endName}</span></Popup>
              </Marker>
              
              {filteredStations.map(station => (
                <Marker key={station.id} position={[station.latitude, station.longitude]}>
                  <Popup>
                    <div style={{ color: '#000' }}>
                      <strong>{station.title}</strong><br/>
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
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : searched && stations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛣️</div>
          <h3>No stations found on this route</h3>
          <p>Try different locations or a longer route.</p>
        </div>
      ) : filteredStations.length > 0 && (
        <>
          <div className="results-count">
            Found <strong>{filteredStations.length}</strong> stations along your route
          </div>
          <div className="stations-list">
            {filteredStations.map(station => (
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
