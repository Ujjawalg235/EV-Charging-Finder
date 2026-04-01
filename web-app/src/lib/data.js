// Sample EV charging station data
const stations = [
  {
    $id: 'station_001',
    title: 'GreenVolt SuperCharger Hub',
    thumbnail: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=400&fit=crop',
    phone: '+1 (555) 234-5678',
    web: 'https://greenvolt.example.com',
    address: '1234 Electric Avenue, San Jose, CA 95110',
    latitude: 37.3382,
    longitude: -121.8863,
    operating_hours: '24/7',
    services: ['DC Fast Charging', 'Level 2 Charging', 'Lounge Area', 'Free WiFi', 'Restrooms'],
    rating: 4.7,
  },
  {
    $id: 'station_002',
    title: 'ChargePoint Express Station',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
    phone: '+1 (555) 345-6789',
    web: 'https://chargepoint.example.com',
    address: '456 Sustainable Dr, Palo Alto, CA 94301',
    latitude: 37.4419,
    longitude: -122.1430,
    operating_hours: '6:00 AM - 11:00 PM',
    services: ['Level 2 Charging', 'Solar Powered', 'Covered Parking', 'Convenience Store'],
    rating: 4.3,
  },
  {
    $id: 'station_003',
    title: 'ElectraFuel Mega Station',
    thumbnail: 'https://images.unsplash.com/photo-1647500843411-0a0c2c568688?w=600&h=400&fit=crop',
    phone: '+1 (555) 456-7890',
    web: 'https://electrafuel.example.com',
    address: '789 Voltage Blvd, Mountain View, CA 94043',
    latitude: 37.3861,
    longitude: -122.0839,
    operating_hours: '5:00 AM - 12:00 AM',
    services: ['DC Fast Charging', 'Tesla Supercharger', 'CCS', 'CHAdeMO', 'Café', 'Kids Play Area'],
    rating: 4.8,
  },
  {
    $id: 'station_004',
    title: 'VoltEdge Community Charger',
    thumbnail: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=600&h=400&fit=crop',
    phone: '+1 (555) 567-8901',
    web: 'https://voltedge.example.com',
    address: '321 Green Street, Santa Clara, CA 95050',
    latitude: 37.3541,
    longitude: -121.9552,
    operating_hours: '7:00 AM - 10:00 PM',
    services: ['Level 2 Charging', 'Community Hub', 'EV Maintenance Tips', 'Bike Parking'],
    rating: 4.1,
  },
  {
    $id: 'station_005',
    title: 'PowerGrid Ultra Station',
    thumbnail: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&h=400&fit=crop',
    phone: '+1 (555) 678-9012',
    web: 'https://powergrid.example.com',
    address: '555 Watt Lane, Sunnyvale, CA 94085',
    latitude: 37.3688,
    longitude: -122.0363,
    operating_hours: '24/7',
    services: ['DC Fast Charging 350kW', 'Vehicle-to-Grid', 'Premium Lounge', 'Valet Service', 'Car Wash'],
    rating: 4.9,
  },
  {
    $id: 'station_006',
    title: 'EcoCharge Green Hub',
    thumbnail: 'https://images.unsplash.com/photo-1594535182308-8ffefbb661e1?w=600&h=400&fit=crop',
    phone: '+1 (555) 789-0123',
    web: 'https://ecocharge.example.com',
    address: '888 Solar Way, Fremont, CA 94538',
    latitude: 37.5485,
    longitude: -121.9886,
    operating_hours: '6:00 AM - 10:00 PM',
    services: ['Level 2 Charging', 'Solar Canopy', 'Organic Café', 'Pet-Friendly', 'Recycling Center'],
    rating: 4.5,
  },
];

export function getAllStations() {
  return stations;
}

export function getStationById(id) {
  return stations.find(s => s.$id === id) || null;
}

export function searchStations(query) {
  const q = query.toLowerCase();
  return stations.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.address.toLowerCase().includes(q)
  );
}

// ── Visited / Reviews (localStorage) ─────────────────────

const VISITED_KEY = 'ev_finder_visited';

function getVisitedData() {
  try {
    return JSON.parse(localStorage.getItem(VISITED_KEY)) || [];
  } catch {
    return [];
  }
}

function saveVisitedData(data) {
  localStorage.setItem(VISITED_KEY, JSON.stringify(data));
}

export function markVisited(userId, station, visitedDate, review) {
  const visited = getVisitedData();
  const entry = {
    $id: 'visited_' + Date.now(),
    creator: userId,
    stationsId: station.id || station.$id,
    stationData: {
      title: station.title,
      phone: station.phone,
      thumbnail: station.thumbnail,
      address: station.address
    },
    date: visitedDate,
    review: review,
  };
  visited.push(entry);
  saveVisitedData(visited);
  return entry;
}

export function getUserVisitedStations(userId) {
  const visited = getVisitedData();
  const userVisited = visited.filter(v => v.creator === userId);

  return userVisited.map(v => {
    let station = getStationById(v.stationsId);
    if (!station) {
      if (!v.stationData) return null;
      station = {
        $id: v.stationsId,
        ...v.stationData
      };
    }
    return {
      ...station,
      visitedDate: v.date,
      visitedReview: v.review,
      visitedId: v.$id,
    };
  }).filter(Boolean);
}

export function removeVisited(visitedId) {
  const visited = getVisitedData();
  const filtered = visited.filter(v => v.$id !== visitedId);
  saveVisitedData(filtered);
}

export function getReviewsByStationId(stationId) {
  const visited = getVisitedData();
  const reviews = visited.filter(v => v.stationsId === stationId && v.review);

  // Get usernames from localStorage
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem('ev_finder_users')) || [];
  } catch { /* empty */ }

  return reviews.map(r => {
    const user = users.find(u => u.$id === r.creator);
    return {
      review: r.review,
      date: r.date,
      creator: { username: user?.username || 'Anonymous' },
    };
  });
}
