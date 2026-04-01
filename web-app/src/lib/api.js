// Open Charge Map API integration
const API_KEY = '13650879-eb77-4645-bed9-85e579033eb0';
const BASE_URL = 'https://api.openchargemap.io/v3/poi';

/**
 * Fetch nearby charging stations from Open Charge Map API
 */
export async function fetchNearbyStations(latitude, longitude, distance = 15, maxResults = 30) {
  const url = `${BASE_URL}?output=json&latitude=${latitude}&longitude=${longitude}&distance=${distance}&distanceunit=km&maxresults=${maxResults}&compact=true&verbose=false&key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch stations');
  const data = await res.json();
  return data.map(normalizeStation);
}

/**
 * Fetch stations along a route (between two points, sampled at intervals)
 */
export async function fetchEnrouteStations(startLat, startLng, endLat, endLng, distance = 5, maxResults = 40) {
  // Sample points along the route (simple linear interpolation)
  const numSamples = 5;
  const allStations = new Map();

  const promises = [];
  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const lat = startLat + t * (endLat - startLat);
    const lng = startLng + t * (endLng - startLng);
    promises.push(
      fetchNearbyStations(lat, lng, distance, Math.ceil(maxResults / (numSamples + 1)))
        .catch(() => [])
    );
  }

  const results = await Promise.all(promises);
  results.flat().forEach(s => {
    if (!allStations.has(s.id)) {
      allStations.set(s.id, s);
    }
  });

  return Array.from(allStations.values());
}

/**
 * Geocode a place name to coordinates using Nominatim (free)
 */
export async function geocodePlace(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'EVChargingFinderApp/1.0' }
  });
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  if (data.length === 0) throw new Error('Location not found');
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

/**
 * Normalize OCM API response to a consistent station object
 */
function normalizeStation(poi) {
  const addr = poi.AddressInfo || {};
  const connections = poi.Connections || [];
  const operator = poi.OperatorInfo || {};

  // Build connection types list
  const connectionTypes = connections.map(c => {
    const typeName = c.ConnectionType?.Title || 'Unknown';
    const power = c.PowerKW ? `${c.PowerKW}kW` : '';
    const level = c.Level?.Title || '';
    return [typeName, power, level].filter(Boolean).join(' · ');
  }).filter(Boolean);

  // Determine a thumbnail image based on the number of connections
  const thumbnails = [
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1647500843411-0a0c2c568688?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1594535182308-8ffefbb661e1?w=600&h=400&fit=crop',
  ];

  const status = poi.StatusType?.Title || 'Unknown';
  const isOperational = poi.StatusType?.IsOperational !== false;

  let thumbnail = thumbnails[poi.ID % thumbnails.length];
  if (poi.MediaItems && poi.MediaItems.length > 0 && poi.MediaItems[0].ItemURL) {
    thumbnail = poi.MediaItems[0].ItemURL;
  }

  return {
    id: String(poi.ID),
    title: addr.Title || operator.Title || 'EV Charging Station',
    address: [addr.AddressLine1, addr.Town, addr.StateOrProvince, addr.Postcode, addr.Country?.Title]
      .filter(Boolean).join(', '),
    latitude: addr.Latitude,
    longitude: addr.Longitude,
    distance: addr.Distance ? parseFloat(addr.Distance).toFixed(1) : null,
    phone: addr.ContactTelephone1 || null,
    web: addr.RelatedURL || operator.WebsiteURL || null,
    operatorName: operator.Title || 'Independent',
    status,
    isOperational,
    numConnections: connections.length,
    connectionTypes: connectionTypes.length > 0 ? connectionTypes : ['Standard Charging'],
    usageCost: poi.UsageCost || 'Contact operator',
    thumbnail: thumbnail,
    // Raw data for extras
    _raw: poi,
  };
}

/**
 * Get user's current location via Geolocation API
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error('Unable to get your location. Please allow location access.'));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
}
