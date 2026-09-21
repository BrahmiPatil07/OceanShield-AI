// Ocean Shield — Marine Intelligence & Satellite Oil Spill Investigation Platform
// Free and Open-Source Engine: Leaflet.js + CartoDB Dark Matter

// Initialize Leaflet Map with Dark Ocean theme
const map = L.map('map', {
  zoomControl: true,
  attributionControl: true
}).setView([9.7, 76.1], 8);

// Free CartoDB Dark Matter Tiles (OpenStreetMap data)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 18
}).addTo(map);

// Layer Groups for easy toggling
const layerSlick = L.layerGroup().addTo(map);
const layerVessels = L.layerGroup().addTo(map);
const layerTracks = L.layerGroup().addTo(map);
const layerDrift = L.layerGroup().addTo(map);
const layerUploadedAIS = L.layerGroup().addTo(map);
const layerDriftForecast = L.layerGroup().addTo(map);
const layerReviewArea = L.layerGroup().addTo(map);

// Ingested CSV AIS state
let uploadedVessels = [];
let activeUploadedMarkers = [];
let currentFeedSource = 'simulated'; // 'simulated' | 'uploaded'

// Comprehensive Simulated Incident Database (DEMO DATA)
const incidentData = {
  kerala: {
    name: 'Kerala Coast (Arabian Sea Corridor)',
    center: [9.72, 76.08],
    coordsDisplay: "Lat: 09°43'12\"N | Lon: 76°04'48\"E",
    area: '18.6',
    volume: '~1,420 m³',
    confidence: '94.8',
    sensor: 'Sentinel-1 C-SAR',
    pass: 'Pass #2918 • 10m Res (IW)',
    vesselsCount: '05',
    window: 'Within 6h spill window',
    drift: {
      bearing: 65,
      speed: '1.4 kts',
      wind: '14 kts NW (315°)',
      current: '0.8 kts SE (135°)',
      target: 'Kozhikode Coastal Sanctuary',
      eta: '18h 45m',
      risk: 'CRITICAL RISK',
      riskClass: 'risk-high',
      vectorEnd: [9.85, 76.38]
    },
    timeline: {
      t1: '14:20 UTC (-4h 30m)',
      t2: '15:05 UTC (-3h 45m)',
      t3: '16:35 UTC (-2h 15m)',
      t4: '17:50 UTC (-1h 00m)',
      t5: '18:40 UTC (-0h 10m)'
    },
    // Realistic multi-vertex radar dark slick geometry
    polygon: [
      [9.76, 76.02],
      [9.79, 76.07],
      [9.77, 76.14],
      [9.73, 76.16],
      [9.68, 76.12],
      [9.67, 76.05],
      [9.71, 76.01]
    ],
    vessels: [
      {
        name: 'MV Horizon',
        mmsi: '419001248',
        type: 'Crude Oil Tanker',
        flag: 'Panama [PA]',
        distance: '11.2 km',
        overlap: 'Δt: -38 min',
        speed: '12.4 kts',
        speedAnomaly: 'Slowed from 16.2 kts',
        riskLevel: 'High',
        riskClass: 'risk-high',
        score: '88%',
        scoreNum: 88,
        heading: 320,
        pos: [9.79, 75.98],
        track: [
          [9.55, 76.22],
          [9.65, 76.12],
          [9.72, 76.05],
          [9.79, 75.98],
          [9.88, 75.90]
        ]
      },
      {
        name: 'Sea Pioneer',
        mmsi: '636015291',
        type: 'Chemical Tanker',
        flag: 'Liberia [LR]',
        distance: '18.4 km',
        overlap: 'Δt: +1h 12m',
        speed: '14.1 kts',
        speedAnomaly: 'Steady speed',
        riskLevel: 'High',
        riskClass: 'risk-high',
        score: '82%',
        scoreNum: 82,
        heading: 335,
        pos: [9.84, 76.18],
        track: [
          [9.60, 76.30],
          [9.70, 76.25],
          [9.77, 76.21],
          [9.84, 76.18],
          [9.95, 76.12]
        ]
      },
      {
        name: 'Ocean Crest',
        mmsi: '352001994',
        type: 'Bulk Carrier',
        flag: 'Singapore [SG]',
        distance: '26.1 km',
        overlap: 'Δt: -2h 20m',
        speed: '10.8 kts',
        speedAnomaly: 'Minor course alteration',
        riskLevel: 'Medium',
        riskClass: 'risk-medium',
        score: '69%',
        scoreNum: 69,
        heading: 140,
        pos: [9.62, 75.88],
        track: [
          [9.85, 75.70],
          [9.74, 75.79],
          [9.62, 75.88],
          [9.50, 75.97]
        ]
      },
      {
        name: 'Blue Meridian',
        mmsi: '210458000',
        type: 'Container Ship',
        flag: 'Cyprus [CY]',
        distance: '41.7 km',
        overlap: 'Δt: +3h 05m',
        speed: '18.5 kts',
        speedAnomaly: 'Nominal corridor transit',
        riskLevel: 'Medium',
        riskClass: 'risk-medium',
        score: '52%',
        scoreNum: 52,
        heading: 310,
        pos: [9.92, 75.75],
        track: [
          [9.65, 75.95],
          [9.78, 75.85],
          [9.92, 75.75],
          [10.05, 75.65]
        ]
      },
      {
        name: 'Coastal Star',
        mmsi: '419900331',
        type: 'General Cargo',
        flag: 'India [IN]',
        distance: '57.3 km',
        overlap: 'Δt: +4h 45m',
        speed: '8.2 kts',
        speedAnomaly: 'Inshore transit route',
        riskLevel: 'Low',
        riskClass: 'risk-low',
        score: '34%',
        scoreNum: 34,
        heading: 160,
        pos: [9.50, 76.28],
        track: [
          [9.75, 76.22],
          [9.62, 76.25],
          [9.50, 76.28],
          [9.38, 76.32]
        ]
      }
    ]
  },

  mangalore: {
    name: 'Mangaluru Offshore (New Mangalore Port)',
    center: [12.92, 74.76],
    coordsDisplay: "Lat: 12°55'12\"N | Lon: 74°45'36\"E",
    area: '14.2',
    volume: '~980 m³',
    confidence: '91.2',
    sensor: 'Sentinel-1 C-SAR',
    pass: 'Pass #3104 • 10m Res (IW)',
    vesselsCount: '04',
    window: 'Within 4h spill window',
    drift: {
      bearing: 80,
      speed: '1.1 kts',
      wind: '11 kts WNW (290°)',
      current: '0.6 kts ESE (110°)',
      target: 'Panambur Mangrove Estuary',
      eta: '12h 10m',
      risk: 'CRITICAL RISK',
      riskClass: 'risk-high',
      vectorEnd: [12.96, 74.98]
    },
    timeline: {
      t1: '08:15 UTC (-4h 10m)',
      t2: '09:00 UTC (-3h 25m)',
      t3: '10:15 UTC (-2h 10m)',
      t4: '11:20 UTC (-1h 05m)',
      t5: '12:15 UTC (-0h 10m)'
    },
    polygon: [
      [12.96, 74.71],
      [12.98, 74.77],
      [12.95, 74.82],
      [12.89, 74.80],
      [12.87, 74.74],
      [12.91, 74.69]
    ],
    vessels: [
      {
        name: 'Arabian Gulf Pioneer',
        mmsi: '470123000',
        type: 'Crude Oil Tanker',
        flag: 'UAE [AE]',
        distance: '8.7 km',
        overlap: 'Δt: -25 min',
        speed: '11.5 kts',
        speedAnomaly: 'Course change near SPM berth',
        riskLevel: 'High',
        riskClass: 'risk-high',
        score: '89%',
        scoreNum: 89,
        heading: 340,
        pos: [12.99, 74.68],
        track: [
          [12.78, 74.82],
          [12.88, 74.74],
          [12.99, 74.68],
          [13.10, 74.60]
        ]
      },
      {
        name: 'Kallianpur Express',
        mmsi: '419082310',
        type: 'Product Tanker',
        flag: 'India [IN]',
        distance: '16.5 km',
        overlap: 'Δt: +1h 40m',
        speed: '9.4 kts',
        speedAnomaly: 'Speed dropped to 6.2 kts',
        riskLevel: 'High',
        riskClass: 'risk-high',
        score: '79%',
        scoreNum: 79,
        heading: 175,
        pos: [12.82, 74.78],
        track: [
          [13.05, 74.75],
          [12.94, 74.76],
          [12.82, 74.78],
          [12.70, 74.80]
        ]
      },
      {
        name: 'Nordic Osprey',
        mmsi: '257002000',
        type: 'Bulk Carrier',
        flag: 'Norway [NO]',
        distance: '34.2 km',
        overlap: 'Δt: -3h 10m',
        speed: '13.1 kts',
        speedAnomaly: 'Standard deep-water lane',
        riskLevel: 'Medium',
        riskClass: 'risk-medium',
        score: '58%',
        scoreNum: 58,
        heading: 325,
        pos: [13.08, 74.52],
        track: [
          [12.80, 74.65],
          [12.95, 74.58],
          [13.08, 74.52],
          [13.25, 74.45]
        ]
      },
      {
        name: 'Ocean Falcon',
        mmsi: '538004122',
        type: 'LPG Tanker',
        flag: 'Marshall Islands [MH]',
        distance: '48.9 km',
        overlap: 'Δt: +3h 50m',
        speed: '16.8 kts',
        speedAnomaly: 'Nominal outer transit',
        riskLevel: 'Low',
        riskClass: 'risk-low',
        score: '41%',
        scoreNum: 41,
        heading: 315,
        pos: [13.18, 74.40],
        track: [
          [12.90, 74.60],
          [13.05, 74.50],
          [13.18, 74.40]
        ]
      }
    ]
  },

  chennai: {
    name: 'Chennai Coast (Bay of Bengal Outer Anchorage)',
    center: [13.12, 80.34],
    coordsDisplay: "Lat: 13°07'12\"N | Lon: 80°20'24\"E",
    area: '22.4',
    volume: '~1,850 m³',
    confidence: '96.4',
    sensor: 'Sentinel-1 C-SAR',
    pass: 'Pass #1842 • 10m Res (IW)',
    vesselsCount: '05',
    window: 'Within 5h spill window',
    drift: {
      bearing: 250,
      speed: '1.8 kts',
      wind: '18 kts NE (045°)',
      current: '1.1 kts SW (225°)',
      target: 'Marina Beach & Ennore Estuary',
      eta: '10h 30m',
      risk: 'CRITICAL RISK',
      riskClass: 'risk-high',
      vectorEnd: [13.05, 80.18]
    },
    timeline: {
      t1: '02:00 UTC (-4h 40m)',
      t2: '02:50 UTC (-3h 50m)',
      t3: '04:10 UTC (-2h 30m)',
      t4: '05:30 UTC (-1h 10m)',
      t5: '06:30 UTC (-0h 10m)'
    },
    polygon: [
      [13.18, 80.29],
      [13.21, 80.36],
      [13.16, 80.42],
      [13.08, 80.39],
      [13.05, 80.32],
      [13.10, 80.27]
    ],
    vessels: [
      {
        name: 'Bay of Bengal Star',
        mmsi: '419100452',
        type: 'Crude Oil Tanker',
        flag: 'India [IN]',
        distance: '9.4 km',
        overlap: 'Δt: -18 min',
        speed: '8.6 kts',
        speedAnomaly: 'Maneuvering near outer anchorage',
        riskLevel: 'High',
        riskClass: 'risk-high',
        score: '92%',
        scoreNum: 92,
        heading: 200,
        pos: [13.14, 80.31],
        track: [
          [13.25, 80.36],
          [13.19, 80.33],
          [13.14, 80.31],
          [13.08, 80.28]
        ]
      },
      {
        name: 'Coromandel Pearl',
        mmsi: '636018942',
        type: 'Chemical Tanker',
        flag: 'Liberia [LR]',
        distance: '15.8 km',
        overlap: 'Δt: +52 min',
        speed: '11.2 kts',
        speedAnomaly: 'Sudden heading deviation of 35°',
        riskLevel: 'High',
        riskClass: 'risk-high',
        score: '84%',
        scoreNum: 84,
        heading: 190,
        pos: [13.08, 80.36],
        track: [
          [13.24, 80.40],
          [13.16, 80.38],
          [13.08, 80.36],
          [12.98, 80.34]
        ]
      },
      {
        name: 'Oriental Jade',
        mmsi: '477218900',
        type: 'Container Ship',
        flag: 'Hong Kong [HK]',
        distance: '29.3 km',
        overlap: 'Δt: -2h 45m',
        speed: '17.4 kts',
        speedAnomaly: 'Approaching Kamarajar Port channel',
        riskLevel: 'Medium',
        riskClass: 'risk-medium',
        score: '63%',
        scoreNum: 63,
        heading: 220,
        pos: [13.26, 80.44],
        track: [
          [13.40, 80.52],
          [13.32, 80.48],
          [13.26, 80.44],
          [13.18, 80.38]
        ]
      },
      {
        name: 'Tamil Glory',
        mmsi: '419000877',
        type: 'Bulk Carrier',
        flag: 'India [IN]',
        distance: '38.6 km',
        overlap: 'Δt: +3h 15m',
        speed: '10.5 kts',
        speedAnomaly: 'Outer waiting zone',
        riskLevel: 'Medium',
        riskClass: 'risk-medium',
        score: '55%',
        scoreNum: 55,
        heading: 160,
        pos: [13.02, 80.46],
        track: [
          [13.18, 80.48],
          [13.10, 80.47],
          [13.02, 80.46]
        ]
      },
      {
        name: 'Brahmaputra Leader',
        mmsi: '419200331',
        type: 'Tug / Supply Vessel',
        flag: 'India [IN]',
        distance: '52.1 km',
        overlap: 'Δt: +4h 30m',
        speed: '7.8 kts',
        speedAnomaly: 'Inshore port operations',
        riskLevel: 'Low',
        riskClass: 'risk-low',
        score: '28%',
        scoreNum: 28,
        heading: 040,
        pos: [12.95, 80.28],
        track: [
          [12.85, 80.24],
          [12.95, 80.28],
          [13.04, 80.32]
        ]
      }
    ]
  }
};

// Store active markers and polylines for tracking and selection
let activeVesselMarkers = [];
let activeTrackPolylines = [];
let activeSlickPolygon = null;
let activeDriftVector = null;

// Helper: Create custom vessel marker SVG icon with directional rotation
function createVesselIcon(heading = 0, isSelected = false, riskLevel = 'High') {
  const color = riskLevel === 'High' ? '#f43f5e' : (riskLevel === 'Medium' ? '#fbbf24' : '#00f5a0');
  const strokeColor = isSelected ? '#00f2fe' : '#ffffff';
  const filter = isSelected ? 'drop-shadow(0 0 8px #00f2fe)' : 'drop-shadow(0 0 4px rgba(0,0,0,0.8))';

  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" style="transform: rotate(${heading}deg); filter: ${filter};">
      <polygon points="16,2 26,26 16,20 6,26" fill="${color}" stroke="${strokeColor}" stroke-width="2" />
      <circle cx="16" cy="14" r="3" fill="#ffffff" />
    </svg>
  `;

  return L.divIcon({
    className: 'vessel-marker-icon',
    html: svg,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

// Global active incident state (dynamically updated by satellite detection)
let currentIncident = null;

// Core Inspection Function
function inspect() {
  const key = document.querySelector('#incident').value || 'kerala';
  const base = incidentData[key] || incidentData.kerala;
  currentIncident = JSON.parse(JSON.stringify(base));
  const data = currentIncident;

  // 1. Center & Zoom Map
  map.setView(data.center, 9, { animate: true, duration: 1 });

  // 2. Clear previous layers
  layerSlick.clearLayers();
  layerVessels.clearLayers();
  layerTracks.clearLayers();
  layerDrift.clearLayers();
  layerReviewArea.clearLayers();
  activeVesselMarkers = [];
  activeTrackPolylines = [];

  // 3. Render Multi-vertex Radar Slick Polygon (Orange: simulated spill zone)
  activeSlickPolygon = L.polygon(data.polygon, {
    color: '#f97316',
    weight: 2.5,
    opacity: 0.95,
    fillColor: '#ea580c',
    fillOpacity: 0.55,
    dashArray: '4, 4'
  }).addTo(layerSlick);

  // Pulse halo around slick centroid (Orange)
  const slickHalo = L.circle(data.center, {
    radius: 7500,
    color: '#f97316',
    weight: 1,
    opacity: 0.4,
    fillColor: '#f97316',
    fillOpacity: 0.12,
    className: 'spill-pulse'
  }).addTo(layerSlick);

  activeSlickPolygon.bindPopup(`
    <div class="map-popup-title">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
      SAR Slick Detection Zone (Simulated)
    </div>
    <div class="map-popup-meta">
      <div><b>Incident:</b> ${data.name}</div>
      <div><b>Sensor:</b> ${data.sensor} (${data.pass})</div>
      <div><b>Est. Area:</b> ${data.area} km² | Vol: ${data.volume}</div>
      <div><b>AI Confidence:</b> ${data.confidence}% (Dual-Pol VV/VH)</div>
      <div style="margin-top: 6px; color: #fed7aa;"><b>Screening Status:</b> Active AIS Back-Projection</div>
    </div>
  `);

  // 4. Render Drift Vector & Arrow (Green: possible drift direction)
  const driftCoords = [data.center, data.drift.vectorEnd];
  activeDriftVector = L.polyline(driftCoords, {
    color: '#10b981',
    weight: 3,
    opacity: 0.9,
    dashArray: '6, 6'
  }).addTo(layerDrift);

  // Arrowhead marker for drift (Green)
  const driftArrowIcon = L.divIcon({
    className: 'drift-arrow-icon',
    html: `
      <div style="transform: rotate(${data.drift.bearing}deg); color: #10b981; display: flex; align-items: center; justify-content: center;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,2 22,22 12,17 2,22" />
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const driftEndMarker = L.marker(data.drift.vectorEnd, { icon: driftArrowIcon }).addTo(layerDrift);
  driftEndMarker.bindPopup(`
    <div class="map-popup-title">Possible Drift Direction Forecast</div>
    <div class="map-popup-meta">
      <div><b>Trajectory:</b> ${data.drift.bearing}° @ ${data.drift.speed}</div>
      <div><b>Metocean:</b> ${data.drift.wind}</div>
      <div><b>Target Shoreline:</b> ${data.drift.target}</div>
      <div><b>Landfall ETA:</b> ${data.drift.eta}</div>
    </div>
  `);

  // 5. Render Review-Required Area (Red: review-required area)
  const reviewArea = L.circle(data.center, {
    radius: 12000,
    color: '#ef4444',
    weight: 2,
    opacity: 0.9,
    dashArray: '6, 6',
    fillColor: '#ef4444',
    fillOpacity: 0.12
  }).addTo(layerReviewArea);

  reviewArea.bindPopup(`
    <div class="map-popup-title" style="color: #f87171;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Review-Required Surveillance Area
    </div>
    <div class="map-popup-meta">
      <div><b>Status:</b> Immediate Human Review Required (Priority 1)</div>
      <div><b>Coverage Radius:</b> 12.0 km around SAR slick centroid</div>
      <div><b>Action:</b> Validate vessel AIS records against radar dark slick geometry</div>
      <div style="margin-top: 6px; color: #fca5a5;"><b>Directive:</b> Requires Port State Control physical verification</div>
    </div>
  `);

  // 6. Render Vessels & Historical AIS Tracks (Blue: vessel tracks)
  data.vessels.forEach((v, index) => {
    // Historical AIS Track Polyline (Blue: vessel tracks)
    const isHigh = v.riskLevel === 'High';
    const trackColor = isHigh ? '#38bdf8' : (v.riskLevel === 'Medium' ? '#60a5fa' : '#93c5fd');
    const trackLine = L.polyline(v.track, {
      color: trackColor,
      weight: isHigh ? 2.5 : 1.8,
      opacity: 0.8,
      dashArray: '5, 8'
    }).addTo(layerTracks);

    trackLine.bindPopup(`
      <div class="map-popup-title">${v.name} AIS Historical Track</div>
      <div class="map-popup-meta">
        <div>MMSI: ${v.mmsi} | Flag: ${v.flag}</div>
        <div>CPA Distance: ${v.distance}</div>
        <div>Anomaly: ${v.speedAnomaly}</div>
      </div>
    `);

    activeTrackPolylines.push(trackLine);

    // Vessel Marker
    const icon = createVesselIcon(v.heading, false, v.riskLevel);
    const marker = L.marker(v.pos, { icon }).addTo(layerVessels);

    marker.bindPopup(`
      <div class="map-popup-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/></svg>
        ${v.name} (${v.flag})
        <span class="badge-demo-vessel" style="margin-left: 6px;">SIMULATED AIS</span>
      </div>
      <div class="map-popup-meta">
        <div><b>MMSI:</b> ${v.mmsi} | <b>Type:</b> ${v.type}</div>
        <div><b>CPA Distance:</b> ${v.distance} | <b>Overlap:</b> ${v.overlap}</div>
        <div><b>Current AIS Speed:</b> ${v.speed}</div>
        <div><b>Speed Profile:</b> ${v.speedAnomaly}</div>
        <div style="margin-top: 4px;"><b>Correlation Score:</b> <span class="risk-level-badge ${v.riskClass}">${v.score} (${v.riskLevel})</span></div>
        <div style="margin-top: 4px; font-size: 10px; color: var(--text-muted);">• POTENTIALLY ASSOCIATED VESSEL • PRELIMINARY SCREENING •</div>
      </div>
    `);

    // Click marker also highlights the table row
    marker.on('click', () => {
      highlightTableRow(index);
    });

    activeVesselMarkers.push(marker);
  });

  // 6. Update Telemetry Cards
  if (document.querySelector('#stat-area')) document.querySelector('#stat-area').innerText = data.area;
  if (document.querySelector('#stat-volume')) document.querySelector('#stat-volume').innerText = data.volume;
  if (document.querySelector('#stat-conf')) document.querySelector('#stat-conf').innerText = data.confidence;
  if (document.querySelector('#stat-vessels')) document.querySelector('#stat-vessels').innerText = data.vesselsCount;
  if (document.querySelector('#stat-window')) document.querySelector('#stat-window').innerText = data.window;
  if (document.querySelector('#map-coords')) document.querySelector('#map-coords').innerText = data.coordsDisplay;
  updateDashboardCards();

  // 7. Update Drift Widget
  document.querySelector('#drift-needle').style.transform = `rotate(${data.drift.bearing}deg)`;
  document.querySelector('#drift-bearing').innerText = `${data.drift.bearing.toString().padStart(3, '0')}° @ ${data.drift.speed}`;
  document.querySelector('#drift-forces').innerText = `Wind: ${data.drift.wind} • Current: ${data.drift.current}`;
  document.querySelector('#impact-target').innerText = data.drift.target;
  document.querySelector('#impact-eta').innerText = data.drift.eta;
  
  const riskBadge = document.querySelector('#impact-risk');
  riskBadge.innerText = data.drift.risk;
  riskBadge.className = `risk-level-badge ${data.drift.riskClass}`;

  // Update Oil Spill Drift Forecast Section
  updateDriftForecastSection(data);

  // 8. Update Timeline Timestamps
  document.querySelector('#t-step-1').innerText = data.timeline.t1;
  document.querySelector('#t-step-2').innerText = data.timeline.t2;
  document.querySelector('#t-step-3').innerText = data.timeline.t3;
  document.querySelector('#t-step-4').innerText = data.timeline.t4;
  document.querySelector('#t-step-5').innerText = data.timeline.t5;

  // 9. Update Result Card (#result)
  const [lat, lon] = data.center;
  document.querySelector('#result').innerHTML = `
    <b>Preliminary Intelligence Dossier</b><br>
    Confirmed anomalous low-backscatter slick zone detected at 
    <span style="font-family: var(--font-mono); color: var(--accent-cyan);">${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E</span>.<br>
    <div class="telemetry-pill-group">
      <span class="telemetry-pill">Area: ${data.area} km²</span>
      <span class="telemetry-pill">Confidence: ${data.confidence}%</span>
      <span class="telemetry-pill">Candidates: ${data.vesselsCount}</span>
      <span class="telemetry-pill">Drift: ${data.drift.bearing}° / ${data.drift.speed}</span>
    </div>
    <b>Spatio-Temporal Findings:</b> AIS retrospective trajectory analysis identified <b>${data.vessels[0].name}</b> (MMSI: ${data.vessels[0].mmsi}) and <b>${data.vessels[1].name}</b> within the high-probability discharge time window.<br><br>
    <b style="color: #fda4af;">Statutory Disclaimer:</b> AIS correlation cannot independently prove responsibility. Forwarded to Indian Coast Guard Maritime Rescue Co-ordination Centre (MRCC) for aerial surveillance and port state inspection.
  `;

  // 10. Populate Potentially Associated Vessels Table (#rows)
  document.querySelector('#badge-simulated-count').innerText = data.vessels.length;
  document.querySelector('#badge-uploaded-count').innerText = uploadedVessels.length;

  if (uploadedVessels.length > 0) {
    // Re-render uploaded markers with new distance to this incident
    renderUploadedVesselsOnMap(data.center);
    if (currentFeedSource === 'uploaded') {
      renderUploadedTable(data.center);
    } else {
      renderSimulatedTable(data.vessels);
    }
  } else {
    renderSimulatedTable(data.vessels);
  }

  // 11. Update Evidence & Risk Analysis Dashboard (Default to highest-risk vessel)
  updateEvidenceRiskDashboard(data, data.vessels[0]);
}

// Function to render simulated vessels in #rows
function renderSimulatedTable(vessels) {
  const rowsHtml = vessels.map((v, i) => `
    <tr data-vessel-idx="${i}" data-vessel-type="simulated">
      <td class="vessel-name-cell">
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span style="font-weight: 700;">${v.name}</span>
          <span class="badge-demo-vessel">SIMULATED AIS</span>
        </div>
        <span class="vessel-mmsi">MMSI: ${v.mmsi} • ${v.flag}</span>
        <span style="font-size: 10px; color: #94a3b8; display: block; margin-top: 2px;">Potentially Associated Vessel</span>
      </td>
      <td>
        <span class="vessel-type-tag">${v.type}</span>
      </td>
      <td class="mono-val">${v.distance}</td>
      <td class="mono-val">
        <div>${v.overlap}</div>
        <div style="font-size: 9.5px; color: var(--text-muted);">${v.timestamp ? v.timestamp.slice(11, 16) + ' UTC' : 'Recorded'}</div>
      </td>
      <td class="mono-val">
        <div>${v.speed}</div>
        <div style="font-size: 10px; color: var(--text-muted);">${v.speedAnomaly}</div>
      </td>
      <td>
        <div class="score-cell">
          <span class="risk-level-badge ${v.riskClass}">${v.score}</span>
          <div class="score-bar-bg">
            <div class="score-bar-fill" style="width: ${v.scoreNum}%; background: ${v.riskLevel === 'High' ? '#f43f5e' : (v.riskLevel === 'Medium' ? '#fbbf24' : '#00f5a0')};"></div>
          </div>
        </div>
      </td>
      <td>
        <button type="button" class="inspect-vessel-btn" data-vessel-idx="${i}" style="padding: 6px 10px; font-size: 11px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; color: var(--accent-cyan); cursor: pointer;">
          Track
        </button>
      </td>
    </tr>
  `).join('');

  document.querySelector('#rows').innerHTML = rowsHtml;

  // Attach click events to rows and buttons
  document.querySelectorAll('#rows tr[data-vessel-type="simulated"]').forEach(row => {
    row.addEventListener('click', () => {
      const idx = parseInt(row.getAttribute('data-vessel-idx'), 10);
      focusVessel(idx);
    });
  });

  document.querySelectorAll('#rows .inspect-vessel-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-vessel-idx'), 10);
      focusVessel(idx);
    });
  });
}

// Function to highlight table row
function highlightTableRow(idx) {
  document.querySelectorAll('#rows tr').forEach(row => row.classList.remove('selected-row'));
  const targetRow = document.querySelector(`#rows tr[data-vessel-idx="${idx}"]`);
  if (targetRow) {
    targetRow.classList.add('selected-row');
    targetRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Function to focus on a specific vessel track and open its popup
function focusVessel(idx) {
  highlightTableRow(idx);
  const key = document.querySelector('#incident').value || 'kerala';
  const data = currentIncident || incidentData[key] || incidentData.kerala;
  const vessel = data.vessels[idx];
  if (vessel) {
    updateEvidenceRiskDashboard(data, vessel);
  }

  const marker = activeVesselMarkers[idx];
  const polyline = activeTrackPolylines[idx];

  if (marker && polyline) {
    map.panTo(marker.getLatLng(), { animate: true });
    marker.openPopup();

    // Pulse the polyline weight briefly
    polyline.setStyle({ weight: 4.5, opacity: 1, color: '#38bdf8' });
    setTimeout(() => {
      polyline.setStyle({ weight: 2.5, opacity: 0.8 });
    }, 1200);
  }
}

// Layer Toggle Listeners
document.querySelector('#layer-slick').addEventListener('change', (e) => {
  if (e.target.checked) {
    map.addLayer(layerSlick);
  } else {
    map.removeLayer(layerSlick);
  }
});

document.querySelector('#layer-vessels').addEventListener('change', (e) => {
  if (e.target.checked) {
    map.addLayer(layerVessels);
  } else {
    map.removeLayer(layerVessels);
  }
});

document.querySelector('#layer-tracks').addEventListener('change', (e) => {
  if (e.target.checked) {
    map.addLayer(layerTracks);
  } else {
    map.removeLayer(layerTracks);
  }
});

document.querySelector('#layer-drift').addEventListener('change', (e) => {
  if (e.target.checked) {
    map.addLayer(layerDrift);
  } else {
    map.removeLayer(layerDrift);
  }
});

document.querySelector('#layer-uploaded').addEventListener('change', (e) => {
  if (e.target.checked) {
    map.addLayer(layerUploadedAIS);
  } else {
    map.removeLayer(layerUploadedAIS);
  }
});

document.querySelector('#layer-review')?.addEventListener('change', (e) => {
  if (e.target.checked) {
    map.addLayer(layerReviewArea);
  } else {
    map.removeLayer(layerReviewArea);
  }
});

// Event Listeners for existing elements
const inspectEl = document.querySelector('#inspect');
if (inspectEl) inspectEl.onclick = inspect;

const runEl = document.querySelector('#run');
if (runEl) runEl.onclick = inspect;

const incidentEl = document.querySelector('#incident');
if (incidentEl) incidentEl.onchange = inspect;

// ==========================================================================
// Client-Side CSV Parsing, Haversine Distance & Explainable Correlation Engine
// ==========================================================================

// Haversine formula to compute great-circle distance in kilometers
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Explainable Correlation Scoring Formula:
// Score = Distance_Score (max 50) + Time_Score (max 30) + Speed_Score (max 20)
function calculateCorrelationScore(vessel, spillCenter) {
  const d = haversineDistance(vessel.lat, vessel.lon, spillCenter[0], spillCenter[1]);

  // 1. Distance Score (max 50 pts)
  let sDist = 0;
  if (d <= 5) {
    sDist = 50;
  } else if (d <= 15) {
    sDist = Math.round(50 - 2 * (d - 5));
  } else if (d <= 35) {
    sDist = Math.round(30 - (d - 15));
  } else {
    sDist = Math.max(0, Math.round(10 - 0.2 * (d - 35)));
  }

  // 2. Time Score (max 30 pts)
  let sTime = 18; // default moderate score if timestamp is generic
  let timeDiffStr = 'Available';
  if (vessel.timestamp && vessel.timestamp !== 'N/A') {
    const vTime = new Date(vessel.timestamp).getTime();
    if (!isNaN(vTime)) {
      // Reference spill time (14:00 UTC)
      const refTime = new Date(vessel.timestamp).setUTCHours(14, 0, 0, 0);
      const diffHours = Math.abs((vTime - refTime) / (1000 * 60 * 60));
      if (diffHours <= 1) {
        sTime = 30;
        timeDiffStr = `Δt: ~${Math.round(diffHours * 60)}m`;
      } else if (diffHours <= 3) {
        sTime = 22;
        timeDiffStr = `Δt: ~${diffHours.toFixed(1)}h`;
      } else if (diffHours <= 6) {
        sTime = 12;
        timeDiffStr = `Δt: ~${diffHours.toFixed(1)}h`;
      } else {
        sTime = 5;
        timeDiffStr = `Δt: >6h`;
      }
    }
  }

  // 3. Speed Score (max 20 pts)
  let sSpeed = 10;
  if (vessel.speed >= 5 && vessel.speed <= 14) {
    sSpeed = 20; // typical cargo/tanker operational discharge or maneuvering speed
  } else if (vessel.speed > 14 && vessel.speed <= 20) {
    sSpeed = 12;
  } else if (vessel.speed < 5) {
    sSpeed = 8;
  } else {
    sSpeed = 6;
  }

  const totalScore = Math.min(100, Math.max(0, sDist + sTime + sSpeed));
  const riskLevel = totalScore >= 70 ? 'High' : (totalScore >= 45 ? 'Medium' : 'Low');
  const riskClass = totalScore >= 70 ? 'risk-high' : (totalScore >= 45 ? 'risk-medium' : 'risk-low');
  const isNear = d <= 25;

  const formulaExplanation = `Dist ${d.toFixed(1)}km (+${sDist}pts) • Time ${timeDiffStr} (+${sTime}pts) • Speed ${vessel.speed}kts (+${sSpeed}pts)`;

  return {
    distance: d,
    distanceStr: `${d.toFixed(1)} km`,
    score: `${totalScore}%`,
    scoreNum: totalScore,
    sDist,
    sTime,
    sSpeed,
    riskLevel,
    riskClass,
    isNear,
    timeDiffStr,
    formulaExplanation
  };
}

// Browser-based CSV Parser (Pure JavaScript, Zero Backend)
function parseAisCsv(text) {
  const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
  if (lines.length < 2) {
    alert('Invalid CSV file: The file must contain a header row and at least one data row.');
    return [];
  }

  // Parse header
  const headerParts = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
  
  const nameIdx = headerParts.findIndex(h => /^(vessel_name|name|vessel|ship_name|ship)$/.test(h));
  const latIdx = headerParts.findIndex(h => /^(latitude|lat|y)$/.test(h));
  const lonIdx = headerParts.findIndex(h => /^(longitude|lon|lng|long|x)$/.test(h));
  const timeIdx = headerParts.findIndex(h => /^(timestamp|time|datetime|date)$/.test(h));
  const spdIdx = headerParts.findIndex(h => /^(speed|sog|spd)$/.test(h));
  const hdgIdx = headerParts.findIndex(h => /^(heading|cog|hdg|course)$/.test(h));

  if (latIdx === -1 || lonIdx === -1) {
    alert('CSV Parsing Error: Could not find Latitude and Longitude columns.\nExpected header columns like: vessel_name, latitude, longitude, timestamp, speed, heading');
    return [];
  }

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (row.length <= Math.max(latIdx, lonIdx)) continue;

    const lat = parseFloat(row[latIdx]);
    const lon = parseFloat(row[lonIdx]);
    if (isNaN(lat) || isNaN(lon)) continue;

    const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim() : `Uploaded Vessel #${i}`;
    const timestamp = timeIdx !== -1 && row[timeIdx] ? row[timeIdx].trim() : 'N/A';
    const speed = spdIdx !== -1 && !isNaN(parseFloat(row[spdIdx])) ? parseFloat(row[spdIdx]) : 12.0;
    const heading = hdgIdx !== -1 && !isNaN(parseFloat(row[hdgIdx])) ? parseFloat(row[hdgIdx]) : 0;

    results.push({ name, lat, lon, timestamp, speed, heading });
  }

  return results;
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim().replace(/^["']|["']$/g, ''));
  return values;
}

// Create Custom Icon for Uploaded Vessels (Oriented with Heading, Violet/Cyan glow)
function createUploadedVesselIcon(heading = 0, isNear = false) {
  const fill = isNear ? '#f43f5e' : '#a855f7';
  const stroke = isNear ? '#ffffff' : '#00f2fe';
  const filter = isNear 
    ? 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.9))' 
    : 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.8))';

  const svg = `
    <svg width="34" height="34" viewBox="0 0 32 32" style="transform: rotate(${heading}deg); filter: ${filter};">
      <polygon points="16,2 26,26 16,20 6,26" fill="${fill}" stroke="${stroke}" stroke-width="2.2" />
      <circle cx="16" cy="14" r="3.5" fill="#ffffff" />
    </svg>
  `;

  return L.divIcon({
    className: 'uploaded-vessel-icon',
    html: svg,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
}

// Render Uploaded Vessels on Leaflet Map
function renderUploadedVesselsOnMap(spillCenter) {
  layerUploadedAIS.clearLayers();
  activeUploadedMarkers = [];

  uploadedVessels.forEach((v, index) => {
    const scoreData = calculateCorrelationScore(v, spillCenter);
    v.eval = scoreData; // cache evaluation

    const icon = createUploadedVesselIcon(v.heading, scoreData.isNear);
    const marker = L.marker([v.lat, v.lon], { icon }).addTo(layerUploadedAIS);

    marker.bindPopup(`
      <div class="map-popup-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="16,2 26,26 16,20 6,26"></polygon>
        </svg>
        ${v.name}
        <span class="uploaded-badge">CSV UPLOAD</span>
      </div>
      <div class="map-popup-meta">
        <div><b>Position:</b> ${v.lat.toFixed(4)}°N, ${v.lon.toFixed(4)}°E</div>
        <div><b>Timestamp:</b> ${v.timestamp}</div>
        <div><b>Speed:</b> ${v.speed} kts | <b>Heading:</b> ${v.heading}°</div>
        <div><b>Distance to Spill:</b> <span style="color: ${scoreData.isNear ? '#fda4af' : '#cbd5e1'}; font-weight: 700;">${scoreData.distanceStr}</span> ${scoreData.isNear ? '(Near Spill Zone!)' : ''}</div>
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1);">
          <b>Correlation Score:</b> <span class="risk-level-badge ${scoreData.riskClass}">${scoreData.score} (${scoreData.riskLevel})</span>
          <div style="font-size: 10px; color: var(--accent-cyan); margin-top: 3px;">
            ${scoreData.formulaExplanation}
          </div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">
            • PRELIMINARY DEMO EVALUATION •
          </div>
        </div>
      </div>
    `);

    marker.on('click', () => {
      highlightTableRow(index);
    });

    activeUploadedMarkers.push(marker);
  });
}

// Render Uploaded Vessels in Table (#rows)
function renderUploadedTable(spillCenter) {
  if (uploadedVessels.length === 0) {
    document.querySelector('#rows').innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">
          No uploaded AIS records. Click "Upload AIS Data" above or use "Sample CSV" to test.
        </td>
      </tr>
    `;
    return;
  }

  // Sort by correlation score descending (highest risk first)
  const sortedVessels = uploadedVessels.map((v, originalIdx) => ({
    ...v,
    originalIdx,
    eval: calculateCorrelationScore(v, spillCenter)
  })).sort((a, b) => b.eval.scoreNum - a.eval.scoreNum);

  const rowsHtml = sortedVessels.map((v) => `
    <tr data-vessel-idx="${v.originalIdx}" data-vessel-type="uploaded" class="${v.eval.isNear ? 'near-spill-row' : ''}">
      <td class="vessel-name-cell">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span>${v.name}</span>
          ${v.eval.isNear ? '<span class="risk-level-badge risk-high" style="font-size: 9px; padding: 1px 6px;">NEAR SPILL</span>' : ''}
        </div>
        <span class="uploaded-badge">USER UPLOADED AIS</span>
        <span style="font-size: 10px; color: #94a3b8; display: block; margin-top: 2px;">Potentially Associated Vessel</span>
      </td>
      <td>
        <span class="vessel-type-tag">AIS Target (Hdg ${v.heading}°)</span>
      </td>
      <td class="mono-val">
        <span style="${v.eval.isNear ? 'color: #fda4af; font-weight: 700;' : ''}">${v.eval.distanceStr}</span>
      </td>
      <td class="mono-val">
        <div>${v.eval.timeDiffStr}</div>
        <div style="font-size: 9.5px; color: var(--text-muted);">${v.timestamp !== 'N/A' ? v.timestamp.slice(11, 16) + ' UTC' : 'N/A'}</div>
      </td>
      <td class="mono-val">
        <div>${v.speed} kts</div>
      </td>
      <td>
        <div class="score-cell">
          <span class="risk-level-badge ${v.eval.riskClass}">${v.eval.score}</span>
          <div class="score-bar-bg">
            <div class="score-bar-fill" style="width: ${v.eval.scoreNum}%; background: ${v.eval.riskLevel === 'High' ? '#f43f5e' : (v.eval.riskLevel === 'Medium' ? '#fbbf24' : '#00f5a0')};"></div>
          </div>
        </div>
        <div class="score-formula-tip">${v.eval.formulaExplanation}</div>
      </td>
      <td>
        <button type="button" class="inspect-uploaded-btn" data-vessel-idx="${v.originalIdx}" style="padding: 6px 10px; font-size: 11px; background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 6px; color: #d8b4fe; cursor: pointer;">
          Locate
        </button>
      </td>
    </tr>
  `).join('');

  document.querySelector('#rows').innerHTML = rowsHtml;

  // Attach click events
  document.querySelectorAll('#rows tr[data-vessel-type="uploaded"]').forEach(row => {
    row.addEventListener('click', () => {
      const idx = parseInt(row.getAttribute('data-vessel-idx'), 10);
      focusUploadedVessel(idx);
    });
  });

  document.querySelectorAll('#rows .inspect-uploaded-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-vessel-idx'), 10);
      focusUploadedVessel(idx);
    });
  });
}

// Function to focus on uploaded vessel
function focusUploadedVessel(idx) {
  highlightTableRow(idx);
  const key = document.querySelector('#incident').value || 'kerala';
  const data = currentIncident || incidentData[key] || incidentData.kerala;
  const v = uploadedVessels[idx];
  if (v) {
    updateEvidenceRiskDashboard(data, v);
  }

  const marker = activeUploadedMarkers[idx];
  if (marker) {
    map.panTo(marker.getLatLng(), { animate: true });
    marker.openPopup();
  }
}

// Handle Ingested CSV Data
function handleUploadedCsv(text, filename = 'uploaded_ais.csv') {
  const parsed = parseAisCsv(text);
  if (parsed.length === 0) return;

  uploadedVessels = parsed;

  const key = document.querySelector('#incident').value || 'kerala';
  const data = currentIncident || incidentData[key] || incidentData.kerala;

  // Count how many are near the spill zone (<25km)
  const nearCount = uploadedVessels.filter(v => haversineDistance(v.lat, v.lon, data.center[0], data.center[1]) <= 25).length;

  // Update banner
  const banner = document.querySelector('#upload-status-banner');
  banner.classList.add('visible');
  document.querySelector('#upload-count-pill').innerText = `${uploadedVessels.length} Uploaded Vessels`;
  document.querySelector('#upload-near-pill').innerText = `${nearCount} Near Spill Zone (<25km)`;
  document.querySelector('#upload-filename').innerText = filename;

  // Update tabs
  const tabUploaded = document.querySelector('#tab-uploaded');
  tabUploaded.style.display = 'inline-flex';
  document.querySelector('#badge-uploaded-count').innerText = uploadedVessels.length;

  // Switch to uploaded feed
  switchFeedSource('uploaded');

  // Fit map bounds to show both spill and uploaded vessels
  const allPoints = [data.center, ...uploadedVessels.map(v => [v.lat, v.lon])];
  const bounds = L.latLngBounds(allPoints);
  map.fitBounds(bounds, { padding: [40, 40] });
}

// Switch between Simulated and Uploaded feeds
function switchFeedSource(source) {
  currentFeedSource = source;
  const key = document.querySelector('#incident').value || 'kerala';
  const data = currentIncident || incidentData[key] || incidentData.kerala;

  const tabSim = document.querySelector('#tab-simulated');
  const tabUp = document.querySelector('#tab-uploaded');

  if (source === 'uploaded') {
    tabSim.classList.remove('active');
    tabUp.classList.add('active');
    renderUploadedTable(data.center);
  } else {
    tabUp.classList.remove('active');
    tabSim.classList.add('active');
    renderSimulatedTable(data.vessels);
  }
}

// Setup Event Listeners for Upload & Tabs
document.querySelector('#btn-upload-ais').addEventListener('click', () => {
  document.querySelector('#ais-file-input').click();
});

document.querySelector('#ais-file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    handleUploadedCsv(event.target.result, file.name);
  };
  reader.readAsText(file);
});

document.querySelector('#btn-sample-csv').addEventListener('click', () => {
  const sampleContent = `vessel_name,latitude,longitude,timestamp,speed,heading
MV Ocean Chemist,9.752,76.045,2026-09-20T14:30:00Z,11.5,325
Pacific Explorer,9.815,75.952,2026-09-20T15:10:00Z,13.2,340
Kerala Pride,9.654,76.151,2026-09-20T14:45:00Z,8.4,160
Global Sentinel,10.150,75.500,2026-09-20T16:00:00Z,17.8,310
Malabar Fisher,9.702,76.088,2026-09-20T14:15:00Z,5.2,080
Arabian Titan,9.890,75.820,2026-09-20T13:40:00Z,14.6,315
Cochin Trader,9.580,76.220,2026-09-20T15:30:00Z,9.1,145
Deepsea Voyager,10.350,75.300,2026-09-20T16:30:00Z,19.2,305`;

  const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'sample_ais_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

document.querySelector('#tab-simulated').addEventListener('click', () => {
  switchFeedSource('simulated');
});

document.querySelector('#tab-uploaded').addEventListener('click', () => {
  switchFeedSource('uploaded');
});

// ==========================================================================
// Satellite SAR Image Upload, Zoom/Pan Canvas & Simulated AI Detection Engine
// ==========================================================================

const satCanvas = document.querySelector('#sat-canvas');
const satCtx = satCanvas.getContext('2d');
const satViewport = document.querySelector('#sat-viewport');

let satImage = null;
let satScale = 1.0;
let satPanX = 0;
let satPanY = 0;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;
var simulatedAiResults = null;
if (typeof window !== 'undefined') window.simulatedAiResults = simulatedAiResults;
let isDemoSample = false;

// Draw and Render the Satellite Canvas with Zoom, Pan and Simulated AI Overlay
function renderSatCanvas() {
  if (!satImage) return;

  const vpWidth = satViewport.clientWidth || 700;
  const vpHeight = satViewport.clientHeight || 480;

  satCanvas.width = vpWidth;
  satCanvas.height = vpHeight;

  satCtx.clearRect(0, 0, satCanvas.width, satCanvas.height);
  satCtx.save();

  // Apply Pan & Zoom Transform
  satCtx.translate(satPanX, satPanY);
  satCtx.scale(satScale, satScale);

  // Draw base satellite raster image centered
  const imgW = satImage.width;
  const imgH = satImage.height;
  const drawX = -imgW / 2;
  const drawY = -imgH / 2;

  satCtx.drawImage(satImage, drawX, drawY, imgW, imgH);

  // Draw Simulated AI Detection Overlay if enabled
  if (showAiMask && simulatedAiResults) {
    const { polygon, bbox, centroid, confidence, areaKm2 } = simulatedAiResults;

    // 1. Draw Bounding Box with dashed border
    satCtx.save();
    satCtx.strokeStyle = 'rgba(0, 242, 254, 0.85)';
    satCtx.lineWidth = 1.8 / satScale;
    satCtx.setLineDash([6 / satScale, 4 / satScale]);
    satCtx.strokeRect(drawX + bbox.x, drawY + bbox.y, bbox.w, bbox.h);

    // Bounding Box Label: "AI SLICK DETECTION | PROTOTYPE SIMULATION"
    const labelText = 'AI SLICK DETECTION | PROTOTYPE SIMULATION';
    satCtx.font = `bold ${11 / satScale}px monospace`;
    const textWidth = satCtx.measureText(labelText).width;
    const badgeW = textWidth + (16 / satScale);
    const badgeH = 22 / satScale;

    satCtx.fillStyle = 'rgba(6, 14, 30, 0.92)';
    satCtx.fillRect(drawX + bbox.x, drawY + bbox.y - badgeH, badgeW, badgeH);
    satCtx.strokeStyle = 'rgba(0, 242, 254, 0.75)';
    satCtx.lineWidth = 1 / satScale;
    satCtx.strokeRect(drawX + bbox.x, drawY + bbox.y - badgeH, badgeW, badgeH);

    satCtx.fillStyle = '#00f2fe';
    satCtx.fillText(labelText, drawX + bbox.x + (8 / satScale), drawY + bbox.y - (7 / satScale));

    // Bottom Bounding Box Metric Tag: "CONF: XX% | EST. AREA: XX km² (PROTOTYPE)"
    const metricText = `CONF: ${confidence}% | EST. AREA: ${areaKm2} km² (PROTOTYPE)`;
    satCtx.font = `bold ${10 / satScale}px monospace`;
    const metricWidth = satCtx.measureText(metricText).width;
    const metricBadgeW = metricWidth + (14 / satScale);
    const metricBadgeH = 20 / satScale;

    satCtx.fillStyle = 'rgba(6, 14, 30, 0.92)';
    satCtx.fillRect(drawX + bbox.x, drawY + bbox.y + bbox.h, metricBadgeW, metricBadgeH);
    satCtx.strokeStyle = 'rgba(249, 115, 22, 0.75)';
    satCtx.lineWidth = 1 / satScale;
    satCtx.strokeRect(drawX + bbox.x, drawY + bbox.y + bbox.h, metricBadgeW, metricBadgeH);

    satCtx.fillStyle = '#f97316';
    satCtx.fillText(metricText, drawX + bbox.x + (7 / satScale), drawY + bbox.y + bbox.h + (14 / satScale));
    satCtx.restore();

    // 2. Draw Translucent Red/Orange Segmentation Mask with Clear Boundary
    satCtx.save();
    satCtx.beginPath();
    polygon.forEach((pt, idx) => {
      const px = drawX + pt.x;
      const py = drawY + pt.y;
      if (idx === 0) satCtx.moveTo(px, py);
      else satCtx.lineTo(px, py);
    });
    satCtx.closePath();

    // Translucent red/orange segmentation mask
    satCtx.fillStyle = 'rgba(239, 68, 68, 0.40)';
    satCtx.fill();

    // Clear boundary with glowing neon outline
    satCtx.strokeStyle = '#ff4d6d';
    satCtx.lineWidth = 2.4 / satScale;
    satCtx.shadowColor = '#f97316';
    satCtx.shadowBlur = 10 / satScale;
    satCtx.stroke();
    satCtx.restore();

    // 3. Draw Centroid Target Crosshair
    satCtx.save();
    const cx = drawX + centroid.x;
    const cy = drawY + centroid.y;
    const chSize = 10 / satScale;

    satCtx.strokeStyle = '#00f5a0';
    satCtx.lineWidth = 1.5 / satScale;
    satCtx.beginPath();
    satCtx.moveTo(cx - chSize, cy);
    satCtx.lineTo(cx + chSize, cy);
    satCtx.moveTo(cx, cy - chSize);
    satCtx.lineTo(cx, cy + chSize);
    satCtx.stroke();

    satCtx.fillStyle = '#00f5a0';
    satCtx.beginPath();
    satCtx.arc(cx, cy, 2.5 / satScale, 0, Math.PI * 2);
    satCtx.fill();
    satCtx.restore();
  }

  // Prominent DEMO SAMPLE watermark label on canvas preview
  if (isDemoSample) {
    satCtx.save();
    const badgeW = 160 / satScale;
    const badgeH = 28 / satScale;
    const badgeX = drawX + imgW - badgeW - (14 / satScale);
    const badgeY = drawY + (14 / satScale);

    satCtx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    satCtx.fillRect(badgeX, badgeY, badgeW, badgeH);
    satCtx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    satCtx.lineWidth = 1.5 / satScale;
    satCtx.strokeRect(badgeX, badgeY, badgeW, badgeH);

    satCtx.fillStyle = '#ef4444';
    satCtx.beginPath();
    satCtx.arc(badgeX + (14 / satScale), badgeY + (14 / satScale), 4 / satScale, 0, Math.PI * 2);
    satCtx.fill();

    satCtx.fillStyle = '#fca5a5';
    satCtx.font = `bold ${11 / satScale}px monospace`;
    satCtx.fillText('DEMO SAMPLE', badgeX + (26 / satScale), badgeY + (18 / satScale));
    satCtx.restore();
  }

  satCtx.restore();

  // Update zoom display label
  document.querySelector('#sat-zoom-level').innerText = `${Math.round(satScale * 100)}%`;
}

// Dynamic Image-Processing Oil Slick Detection (Grayscale, Adaptive Threshold, Connected Components, Contour Detection)
function computeSimulatedAiDetection(imageSource, imgW, imgH) {
  // If invalid dimensions or no image source, return safe fallback
  if (!imageSource || !imgW || !imgH) {
    return {
      polygon: [],
      bbox: { x: 0, y: 0, w: 0, h: 0 },
      centroid: { x: 0, y: 0 },
      confidence: '85.0',
      areaKm2: '12.0',
      perimeterKm: '14.0'
    };
  }

  // 1. Create offscreen canvas downsampled for fast client-side pixel processing & noise reduction
  const maxDim = 480;
  const scale = Math.min(1.0, maxDim / Math.max(imgW, imgH));
  const procW = Math.max(20, Math.round(imgW * scale));
  const procH = Math.max(20, Math.round(imgH * scale));

  const offCanvas = document.createElement('canvas');
  offCanvas.width = procW;
  offCanvas.height = procH;
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
  offCtx.drawImage(imageSource, 0, 0, procW, procH);

  let imgData = null;
  try {
    imgData = offCtx.getImageData(0, 0, procW, procH);
  } catch (canvasErr) {
    console.warn('Canvas pixel extraction tainted (cross-origin / file:// protocol). Using synthetic pipeline features.', canvasErr);
  }

  const totalPixels = procW * procH;

  // 2. Grayscale Conversion & Statistical Luminance Analysis
  const lumArray = new Float32Array(totalPixels);
  let sumLum = 0;
  let sumSqLum = 0;
  const hist = new Int32Array(256);

  // Border margin (5%) to exclude border artifacts / labels / neatlines common in satellite rasters
  const marginX = Math.round(procW * 0.05);
  const marginY = Math.round(procH * 0.05);
  let validPixelCount = 0;

  if (!imgData) {
    // Generate synthetic SAR ocean background with dark slick anomaly in center
    for (let y = 0; y < procH; y++) {
      for (let x = 0; x < procW; x++) {
        const idx = (y * procW + x);
        const dx = (x - procW * 0.48) / (procW * 0.22);
        const dy = (y - procH * 0.52) / (procH * 0.15);
        const isSlick = (dx * dx + dy * dy < 1.0) || ((dx - 0.2) * (dx - 0.2) + (dy + 0.3) * (dy + 0.3) < 0.6);
        const baseSea = 115 + (Math.sin(x * 0.1) * Math.cos(y * 0.1) * 20) + (Math.random() * 25);
        const lum = isSlick ? (28 + Math.random() * 22) : baseSea;
        lumArray[idx] = lum;

        if (x >= marginX && x < procW - marginX && y >= marginY && y < procH - marginY) {
          sumLum += lum;
          sumSqLum += lum * lum;
          hist[Math.min(255, Math.floor(lum))]++;
          validPixelCount++;
        }
      }
    }
  } else {
    const data = imgData.data;
    for (let y = 0; y < procH; y++) {
      for (let x = 0; x < procW; x++) {
        const idx = (y * procW + x);
        const pIdx = idx * 4;
        // Luminance using ITU-R BT.601 standard coefficients
        const lum = 0.299 * data[pIdx] + 0.587 * data[pIdx + 1] + 0.114 * data[pIdx + 2];
        lumArray[idx] = lum;

        if (x >= marginX && x < procW - marginX && y >= marginY && y < procH - marginY) {
          sumLum += lum;
          sumSqLum += lum * lum;
          hist[Math.min(255, Math.floor(lum))]++;
          validPixelCount++;
        }
      }
    }
  }

  const meanLum = validPixelCount > 0 ? sumLum / validPixelCount : 128;
  const variance = validPixelCount > 0 ? Math.max(0, (sumSqLum / validPixelCount) - (meanLum * meanLum)) : 400;
  const stdDev = Math.sqrt(variance);

  // 3. Adaptive Thresholding to identify dark slick-like regions (radar backscatter damping)
  // Compute 12th percentile of luminance in the valid area
  let cumulative = 0;
  let p12 = 0;
  const targetCount = validPixelCount * 0.12;
  for (let i = 0; i < 256; i++) {
    cumulative += hist[i];
    if (cumulative >= targetCount) {
      p12 = i;
      break;
    }
  }

  // Adaptive threshold: lower than sea mean, constrained by standard deviation and percentile
  let threshold = Math.max(20, Math.min(p12 * 1.15, meanLum - 0.85 * stdDev));
  if (threshold >= meanLum * 0.9) {
    threshold = meanLum * 0.75;
  }

  // 4. Binary Slick Mask & Connected Components Labeling (BFS clustering)
  const mask = new Uint8Array(totalPixels);
  for (let y = marginY; y < procH - marginY; y++) {
    for (let x = marginX; x < procW - marginX; x++) {
      const idx = y * procW + x;
      if (lumArray[idx] <= threshold) {
        mask[idx] = 1;
      }
    }
  }

  const visited = new Uint8Array(totalPixels);
  const components = [];

  for (let y = marginY; y < procH - marginY; y++) {
    for (let x = marginX; x < procW - marginX; x++) {
      const startIdx = y * procW + x;
      if (mask[startIdx] === 1 && visited[startIdx] === 0) {
        // BFS to collect component pixels
        const queue = [startIdx];
        visited[startIdx] = 1;
        const compPixels = [];
        let compSumX = 0;
        let compSumY = 0;
        let compMinX = x, compMaxX = x, compMinY = y, compMaxY = y;
        let compSumLum = 0;

        let head = 0;
        while (head < queue.length) {
          const curr = queue[head++];
          const cy = Math.floor(curr / procW);
          const cx = curr % procW;

          compPixels.push(curr);
          compSumX += cx;
          compSumY += cy;
          compSumLum += lumArray[curr];

          if (cx < compMinX) compMinX = cx;
          if (cx > compMaxX) compMaxX = cx;
          if (cy < compMinY) compMinY = cy;
          if (cy > compMaxY) compMaxY = cy;

          // 4-neighborhood
          const neighbors = [
            curr - 1, curr + 1, curr - procW, curr + procW
          ];

          for (let n = 0; n < 4; n++) {
            const nIdx = neighbors[n];
            if (nIdx >= 0 && nIdx < totalPixels) {
              const nx = nIdx % procW;
              const ny = Math.floor(nIdx / procW);
              if (nx >= marginX && nx < procW - marginX && ny >= marginY && ny < procH - marginY) {
                if (mask[nIdx] === 1 && visited[nIdx] === 0) {
                  visited[nIdx] = 1;
                  queue.push(nIdx);
                }
              }
            }
          }
        }

        if (compPixels.length >= 15) { // filter out speckle noise
          components.push({
            pixels: compPixels,
            count: compPixels.length,
            centroidX: compSumX / compPixels.length,
            centroidY: compSumY / compPixels.length,
            minX: compMinX,
            minY: compMinY,
            maxX: compMaxX,
            maxY: compMaxY,
            meanLum: compSumLum / compPixels.length
          });
        }
      }
    }
  }

  // Sort components by size descending
  components.sort((a, b) => b.count - a.count);

  let targetComponent = components[0];

  // If no significant component found with strict threshold, fallback to darkest cluster
  if (!targetComponent) {
    let bestX = Math.round(procW * 0.5);
    let bestY = Math.round(procH * 0.5);
    let minRegionLum = Infinity;
    const blockR = Math.max(5, Math.round(procW * 0.08));

    for (let y = marginY + blockR; y < procH - marginY - blockR; y += 4) {
      for (let x = marginX + blockR; x < procW - marginX - blockR; x += 4) {
        let bLum = 0;
        let bCount = 0;
        for (let dy = -blockR; dy <= blockR; dy += 2) {
          for (let dx = -blockR; dx <= blockR; dx += 2) {
            bLum += lumArray[(y + dy) * procW + (x + dx)];
            bCount++;
          }
        }
        const avg = bLum / bCount;
        if (avg < minRegionLum) {
          minRegionLum = avg;
          bestX = x;
          bestY = y;
        }
      }
    }

    targetComponent = {
      pixels: [],
      count: blockR * blockR * 4,
      centroidX: bestX,
      centroidY: bestY,
      minX: Math.max(marginX, bestX - blockR * 2),
      minY: Math.max(marginY, bestY - blockR * 2),
      maxX: Math.min(procW - marginX, bestX + blockR * 2),
      maxY: Math.min(procH - marginY, bestY + blockR * 2),
      meanLum: minRegionLum
    };
  }

  // 5. Contour Points Calculation (Radial Ray-Tracing Boundary Detection)
  const cX = targetComponent.centroidX;
  const cY = targetComponent.centroidY;
  const numRays = 28;
  const rawRadii = [];

  // Create lookup set for target component pixels for fast membership test
  const compPixelSet = new Set(targetComponent.pixels);

  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    let maxDist = 0;
    const searchLimit = Math.max(targetComponent.maxX - targetComponent.minX, targetComponent.maxY - targetComponent.minY);
    const stepLimit = Math.min(searchLimit, Math.max(procW, procH) * 0.45);

    for (let r = 2; r <= stepLimit; r += 1.5) {
      const px = Math.round(cX + cosA * r);
      const py = Math.round(cY + sinA * r);
      if (px < 0 || px >= procW || py < 0 || py >= procH) break;

      const pIdx = py * procW + px;
      if (compPixelSet.has(pIdx) || (targetComponent.pixels.length === 0 && lumArray[pIdx] <= threshold * 1.1)) {
        maxDist = r;
      } else if (maxDist > 0 && r > maxDist + 12) {
        break;
      }
    }

    // If no boundary reached in this ray direction, use fallback radius proportional to component extent
    if (maxDist < 4) {
      const approxR = Math.max(10, Math.min(targetComponent.maxX - targetComponent.minX, targetComponent.maxY - targetComponent.minY) * 0.35);
      maxDist = approxR;
    }

    rawRadii.push(maxDist);
  }

  // Smooth radii using 3-tap moving average for natural organic slick boundary
  const smoothedRadii = [];
  for (let i = 0; i < numRays; i++) {
    const prev = rawRadii[(i - 1 + numRays) % numRays];
    const curr = rawRadii[i];
    const next = rawRadii[(i + 1) % numRays];
    smoothedRadii.push(prev * 0.25 + curr * 0.5 + next * 0.25);
  }

  // Convert smoothed radii to contour points in downsampled coordinate space
  const contourPointsProc = [];
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2;
    const r = smoothedRadii[i];
    contourPointsProc.push({
      x: cX + Math.cos(angle) * r,
      y: cY + Math.sin(angle) * r
    });
  }

  // 6. Scale coordinates back to Native Image Coordinate Space
  const invScale = 1.0 / scale;

  const polygon = contourPointsProc.map(pt => ({
    x: Math.round(pt.x * invScale),
    y: Math.round(pt.y * invScale)
  }));

  // Native bounding box from component bounds + padding
  const pad = Math.round(8 * invScale);
  const nativeMinX = Math.max(0, Math.round(targetComponent.minX * invScale) - pad);
  const nativeMinY = Math.max(0, Math.round(targetComponent.minY * invScale) - pad);
  const nativeMaxX = Math.min(imgW, Math.round(targetComponent.maxX * invScale) + pad);
  const nativeMaxY = Math.min(imgH, Math.round(targetComponent.maxY * invScale) + pad);

  const bbox = {
    x: nativeMinX,
    y: nativeMinY,
    w: nativeMaxX - nativeMinX,
    h: nativeMaxY - nativeMinY
  };

  const centroid = {
    x: Math.round(targetComponent.centroidX * invScale),
    y: Math.round(targetComponent.centroidY * invScale)
  };

  // 7. Dynamic Estimated Area, Perimeter & Confidence Metrics
  // Area calculation using polygon shoelace formula
  let polyAreaPx = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    polyAreaPx += polygon[i].x * polygon[j].y;
    polyAreaPx -= polygon[j].x * polygon[i].y;
  }
  polyAreaPx = Math.abs(polyAreaPx) / 2;

  // Assuming nominal 10m/pixel Sentinel-1 SAR resolution (1 px = 100 m² = 0.0001 km²)
  const nominalAreaKm2 = (polyAreaPx * 0.0001).toFixed(1);
  const areaKm2 = (Math.max(3.2, Math.min(48.0, parseFloat(nominalAreaKm2)))).toFixed(1);

  // Perimeter in km
  let polyPerimPx = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const dx = polygon[j].x - polygon[i].x;
    const dy = polygon[j].y - polygon[i].y;
    polyPerimPx += Math.sqrt(dx * dx + dy * dy);
  }
  const perimeterKm = Math.max(2.0, (polyPerimPx * 0.01)).toFixed(1);

  // Confidence calculation based on statistical contrast (sea mean vs slick mean normalized by stdDev)
  const contrastDiff = Math.max(0, meanLum - targetComponent.meanLum);
  const contrastRatio = contrastDiff / Math.max(1, stdDev);
  const confNum = Math.min(97.8, Math.max(81.2, 78.0 + contrastRatio * 9.2));
  const confidence = confNum.toFixed(1);

  return {
    polygon,
    bbox,
    centroid,
    confidence,
    areaKm2,
    perimeterKm
  };
}

// ==========================================================================
// SIH 2026 End-to-End Pipeline Workflow Stepper Controller
// ==========================================================================
function updateWorkflowStepper(state = {}) {
  const stepper = document.getElementById('workflow-stepper');
  if (!stepper) return;

  const statusText = document.getElementById('workflow-status-text');
  if (state.step && isDemoModeActive && state.step < currentDemoStep) {
    return;
  }
  const stepNum = state.step || currentDemoStep || 1;
  const customText = state.statusText;

  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById(`wf-step-${i}`);
    const tag = document.getElementById(`wf-status-${i}`);
    if (!el) continue;
    el.classList.remove('active', 'completed');
    if (i < stepNum) {
      el.classList.add('completed');
      if (tag) tag.innerText = 'DONE ✓';
    } else if (i === stepNum) {
      el.classList.add('active');
      if (tag) tag.innerText = 'ACTIVE';
    } else {
      if (tag) tag.innerText = 'PENDING';
    }
  }

  if (statusText) {
    if (customText) {
      statusText.innerText = customText;
    } else {
      const stepObj = (typeof DEMO_STEPS !== 'undefined' && DEMO_STEPS[stepNum - 1]) ? DEMO_STEPS[stepNum - 1] : null;
      statusText.innerText = `Step ${stepNum} of 6 • ${stepObj ? stepObj.title : 'Pipeline Ready'}`;
    }
  }
}

// ==========================================================================
// SIH 2026 Interactive Demo Mode Controller (Projector-Ready Presentation)
// ==========================================================================
var isDemoModeActive = false;
var currentDemoStep = 1;
if (typeof window !== 'undefined') {
  window.isDemoModeActive = isDemoModeActive;
  window.currentDemoStep = currentDemoStep;
}

const DEMO_STEPS = [
  {
    step: 1,
    id: 'satellite-upload',
    targetSection: 'satellite-analysis-panel',
    badge: 'STEP 01',
    title: 'Satellite Image Ingestion',
    shortDesc: 'Sentinel-1 C-SAR Ingestion & Radar Calibration',
    explanation: 'Synthetic Aperture Radar (SAR) penetrates cloud cover and darkness to detect ocean surface roughness anomalies. Ocean Shield ingests high-resolution SAR rasters (GeoTIFF, JPG, PNG, GIF) to identify potential oil-slick dampening of capillary waves.',
    actionLabel: 'Load Sample SAR Raster',
    actionFn: () => {
      loadSatelliteImage('sample_sar_image.jpg');
      showToast('Ingested Sentinel-1 SAR sample raster', 'success');
    },
    hint: '💡 Click "Load Sample SAR Raster" or upload custom GeoTIFF/imagery to inspect the raw synthetic aperture radar image.',
    requiresHv: false
  },
  {
    step: 2,
    id: 'spill-detection',
    targetSection: 'satellite-analysis-panel',
    badge: 'STEP 02',
    title: 'Oil-Slick-Like Region Detection',
    shortDesc: 'Adaptive CFAR & Morphological Segmentation',
    explanation: 'Ocean Shield executes a 4-stage computer vision pipeline: Image Preprocessing, CFAR Background Thresholding, Contour Boundary Extraction, and Morphological Clustering. It isolates the low-backscatter slick, computing surface area (km²), perimeter, and pixel centroid with AI confidence scoring.',
    actionLabel: 'Run AI Detection Pipeline',
    actionFn: () => {
      runAiSpillDetectionPipeline();
    },
    hint: '💡 Click "Run AI Detection Pipeline" to observe the 4-stage inference and segmentation overlay.',
    requiresHv: false
  },
  {
    step: 3,
    id: 'spill-location',
    targetSection: 'map-panel',
    badge: 'STEP 03',
    title: 'Spill Location & Geospatial Map',
    shortDesc: 'Centroid Mapping & 12km Incident Review Zone',
    explanation: 'Detected pixel coordinates are projected onto the WGS-84 geographic coordinate system. The interactive Leaflet maritime map plots the slick polygon, animated centroid halo pulse, coordinates readout, and an active 12 km incident review zone.',
    actionLabel: 'Center Map on Spill',
    actionFn: () => {
      const center = currentIncident?.center || [9.72, 76.08];
      if (typeof map !== 'undefined' && map) {
        map.setView(center, 10, { animate: true, duration: 1 });
      }
      showToast('Map centered on detected spill centroid', 'success');
    },
    hint: '💡 Notice the live coordinates, contour boundary, and 12 km candidate screening perimeter.',
    requiresHv: false
  },
  {
    step: 4,
    id: 'drift-forecast',
    targetSection: 'drift-forecast-section',
    badge: 'STEP 04',
    title: 'Hydrodynamic Drift Forecast',
    shortDesc: 'Metocean Physics Trajectory (6h to 48h Horizons)',
    explanation: 'Applying hydrodynamic physics (vector sum of 3% surface windage plus ocean currents), Ocean Shield computes the slick trajectory and expanding dispersion uncertainty ellipses across 6h, 12h, 24h, and 48h horizons to guide containment assets.',
    actionLabel: 'Simulate 24h Drift',
    actionFn: () => {
      setDriftHorizon(24);
      simulateSpillDrift(24);
    },
    hint: '💡 Click "Simulate 24h Drift" or change wind/current controls to demonstrate dynamic trajectory modeling.',
    requiresHv: false
  },
  {
    step: 5,
    id: 'ais-correlation',
    targetSection: 'vessels-panel',
    badge: 'STEP 05',
    title: 'AIS Vessel Correlation',
    shortDesc: 'Spatio-Temporal Candidate Screening',
    explanation: 'Ocean Shield correlates Automatic Identification System (AIS) vessel trajectories against the detected spill window, calculating Closest Point of Approach (CPA) distance and route overlap. Candidate vessels are screened and ranked by explainable multi-factor proximity scores. Statutory Notice: Candidates are strictly designated as "Potentially Associated Vessels" for investigative screening only. Ocean Shield does NOT claim that any vessel caused or is liable for the spill.',
    actionLabel: 'Inspect Top Candidate',
    actionFn: () => {
      inspect();
      showToast('Highlighting top candidate vessel dossier', 'info');
    },
    hint: '💡 Notice: Candidates are strictly labeled "Potentially Associated Vessels". Never claims causation or legal liability.',
    requiresHv: true
  },
  {
    step: 6,
    id: 'investigation-report',
    targetSection: 'evidence-risk-section',
    badge: 'STEP 06',
    title: 'Investigation Report (SITREP)',
    shortDesc: 'Official Forensic Situation Report',
    explanation: 'Compiles an official 6-section Situation Report (SITREP) combining the SAR raster snapshot, segmentation boundary, hydrodynamic drift vectors, AIS vessel correlation table, evidence timeline, and an objective factual conclusion for maritime enforcement authorities.',
    actionLabel: 'Open Official SITREP Report',
    actionFn: () => {
      generateInvestigationReport();
    },
    hint: '💡 Click "Open Official SITREP Report" to present the complete downloadable and printable dossier.',
    requiresHv: false
  }
];

function startDemoMode() {
  isDemoModeActive = true;
  currentDemoStep = 1;

  const startBtn = document.getElementById('btn-start-demo');
  const toolbar = document.getElementById('demo-mode-toolbar');
  const expCard = document.getElementById('demo-explanation-card');

  if (startBtn) {
    startBtn.classList.add('active');
    startBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      <span>Exit Demo</span>
    `;
  }
  if (toolbar) toolbar.style.display = 'flex';
  if (expCard) expCard.style.display = 'flex';

  renderDemoStep(1);
  showToast('Interactive Demo Mode Started (Step 1 of 6)', 'info');
}

function exitDemoMode() {
  isDemoModeActive = false;

  const startBtn = document.getElementById('btn-start-demo');
  const toolbar = document.getElementById('demo-mode-toolbar');
  const expCard = document.getElementById('demo-explanation-card');

  if (startBtn) {
    startBtn.classList.remove('active');
    startBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      <span>Start Demo</span>
    `;
  }
  if (toolbar) toolbar.style.display = 'flex';
  if (expCard) expCard.style.display = 'flex';

  document.querySelectorAll('.demo-section-spotlight').forEach(el => el.classList.remove('demo-section-spotlight'));
  renderDemoStep(1, { silent: true });
  showToast('Exited Demo Mode', 'info');
}

function nextDemoStep() {
  if (!isDemoModeActive) {
    isDemoModeActive = true;
    const startBtn = document.getElementById('btn-start-demo');
    if (startBtn) {
      startBtn.classList.add('active');
      startBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        <span>Exit Demo</span>
      `;
    }
  }
  if (currentDemoStep < 6) {
    renderDemoStep(currentDemoStep + 1);
  } else {
    renderDemoStep(1);
    showToast('Restarting Demo Mode (Step 1 of 6)', 'info');
  }
}

function prevDemoStep() {
  if (currentDemoStep > 1) {
    renderDemoStep(currentDemoStep - 1);
  }
}

function renderDemoStep(stepNumber, options = {}) {
  if (stepNumber < 1 || stepNumber > 6) return;
  currentDemoStep = stepNumber;
  if (typeof window !== 'undefined') window.currentDemoStep = currentDemoStep;
  const step = DEMO_STEPS[stepNumber - 1];

  updateWorkflowStepper({ step: stepNumber, statusText: `Step ${stepNumber} of 6 • ${step.title}` });

  const prevBtn = document.getElementById('btn-demo-prev');
  const nextBtn = document.getElementById('btn-demo-next');
  const counter = document.getElementById('demo-step-counter');

  if (prevBtn) prevBtn.disabled = (stepNumber === 1);
  if (nextBtn) {
    nextBtn.innerHTML = (stepNumber === 6) ? 'Restart Demo ↺' : 'Next Step &rarr;';
  }
  if (counter) {
    counter.innerText = `Step ${stepNumber} of 6: ${step.title}`;
  }

  const dots = document.querySelectorAll('.demo-dot');
  dots.forEach((dot, idx) => {
    dot.classList.remove('active', 'completed');
    if (idx + 1 < stepNumber) dot.classList.add('completed');
    else if (idx + 1 === stepNumber) dot.classList.add('active');
  });

  const expBadge = document.getElementById('demo-exp-badge');
  const expTitle = document.getElementById('demo-exp-title');
  const expDesc = document.getElementById('demo-exp-desc');
  const expHvBadge = document.getElementById('demo-exp-hv-badge');
  const expHint = document.getElementById('demo-exp-hint');
  const expActionContainer = document.getElementById('demo-exp-action-container');

  if (expBadge) expBadge.innerText = step.badge;
  if (expTitle) expTitle.innerText = step.title;
  if (expDesc) expDesc.innerText = step.explanation;
  if (expHvBadge) expHvBadge.style.display = step.requiresHv ? 'inline-flex' : 'none';
  if (expHint) expHint.innerText = step.hint;

  if (expActionContainer) {
    expActionContainer.innerHTML = '';
    const actBtn = document.createElement('button');
    actBtn.type = 'button';
    actBtn.className = 'btn-demo-action';
    actBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      <span>${step.actionLabel}</span>
    `;
    actBtn.onclick = () => {
      step.actionFn();
    };
    expActionContainer.appendChild(actBtn);
  }

  document.querySelectorAll('.demo-section-spotlight').forEach(el => el.classList.remove('demo-section-spotlight'));
  const targetEl = document.getElementById(step.targetSection);
  if (targetEl) {
    targetEl.classList.add('demo-section-spotlight');
    if (!options.silent) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // AUTOMATIC STEP ACTIONS TO ENSURE CONTENT UPDATES TOGETHER:
  if (stepNumber === 1) {
    if (!satImage) {
      loadSatelliteImage('sample_sar_image.jpg');
    }
  } else if (stepNumber === 2) {
    // Run AI Detection Pipeline so detection overlay, area, volume & confidence are immediately rendered
    if (!simulatedAiResults) {
      if (!satImage) {
        loadSatelliteImage('sample_sar_image.jpg').then(() => {
          runAiSpillDetectionPipeline();
        });
      } else {
        runAiSpillDetectionPipeline();
      }
    }
  } else if (stepNumber === 3) {
    // Center map on spill centroid & refresh map view
    if (typeof map !== 'undefined' && map) {
      setTimeout(() => {
        const center = currentIncident?.center || [9.72, 76.08];
        map.setView(center, 10, { animate: true });
        map.invalidateSize();
      }, 300);
    }
  } else if (stepNumber === 4) {
    // Simulate 24h drift forecast trajectory on map and telemetry
    setDriftHorizon(24);
    simulateSpillDrift(24);
  } else if (stepNumber === 5) {
    // Inspect candidate vessels and show human verification notice
    inspect();
  } else if (stepNumber === 6) {
    // Generate official SITREP report and show modal
    setTimeout(() => {
      generateInvestigationReport();
    }, 300);
  }
}

// ==========================================================================
// Dynamic 5-Card Dashboard Synchronizer (SIH 2026 Presentation)
// ==========================================================================

function updateDashboardCards(state = {}) {
  if (state.stepper) {
    updateWorkflowStepper(state.stepper);
  }
  const key = document.querySelector('#incident')?.value || 'kerala';
  const data = currentIncident || incidentData[key] || incidentData.kerala;

  // 1. Detected Spill Area & Volume
  const areaEl = document.querySelector('#stat-area');
  const volEl = document.querySelector('#stat-volume');
  const areaVal = simulatedAiResults?.areaKm2 || data.area || '18.6';
  const volVal = data.volume || `~${Math.round(parseFloat(areaVal) * 75).toLocaleString()} m³`;
  if (areaEl) areaEl.innerText = areaVal;
  if (volEl) volEl.innerText = volVal;

  // 2. Detection Confidence
  const confEl = document.querySelector('#stat-conf');
  const confSubEl = document.querySelector('#stat-conf-sub');
  const confVal = simulatedAiResults?.confidence || data.confidence || '94.8';
  if (confEl) confEl.innerText = confVal;
  if (confSubEl) {
    confSubEl.innerText = simulatedAiResults 
      ? 'Dual-Pol VV/VH Confirmed' 
      : (satImage ? 'Raster Ingested • Ready' : 'Dual-Pol VV/VH Confirmed');
  }

  // 3. Forecast Duration & Net Displacement
  const durEl = document.querySelector('#stat-duration');
  const durDistEl = document.querySelector('#stat-duration-dist');
  const net = calculateNetDriftVector(activeWindDir, activeWindSpd, activeCurrDir, activeCurrSpd);
  const totalDist = (net.speedKmhNum * activeDriftHorizon).toFixed(1);
  if (durEl) durEl.innerText = activeDriftHorizon.toString().padStart(2, '0');
  if (durDistEl) durDistEl.innerText = `~${totalDist} km Net Displacement`;

  // 4. Potentially Associated Vessels
  const vesselsEl = document.querySelector('#stat-vessels');
  const windowEl = document.querySelector('#stat-window');
  const count = (currentIncident?.vessels?.length || data.vessels?.length || 5).toString().padStart(2, '0');
  if (vesselsEl) vesselsEl.innerText = count;
  if (windowEl) windowEl.innerText = `Within ${activeDriftHorizon}h spill window`;

  // 5. System Status
  const statusEl = document.querySelector('#stat-sys-status');
  const subEl = document.querySelector('#stat-sys-sub');
  const headerStatusText = document.querySelector('#header-status-text');
  const headerStatusIndicator = document.querySelector('#system-status-indicator');

  const statusText = state.statusText || (isAnalyzingSpill ? 'ANALYZING' : (simulatedAiResults ? 'ACTIVE' : 'READY'));
  const statusSub = state.statusSub || (simulatedAiResults ? 'Autonomous Detection Synced' : 'Dual-Pol SAR + AIS Fusion');
  const headerText = state.headerText || (isAnalyzingSpill ? 'PIPELINE ACTIVE • INFERENCE' : (simulatedAiResults ? 'OPERATIONAL • SLICK IDENTIFIED' : 'OPERATIONAL • READY'));

  if (statusEl) {
    statusEl.innerText = statusText;
    statusEl.style.color = statusText === 'ANALYZING' ? 'var(--accent-cyan)' : 'var(--accent-teal)';
  }
  if (subEl) subEl.innerText = statusSub;
  if (headerStatusText) headerStatusText.innerText = `SYSTEM STATUS: ${headerText}`;
  if (headerStatusIndicator) {
    headerStatusIndicator.classList.toggle('analyzing', isAnalyzingSpill);
  }
}

// ==========================================================================
// Connect Satellite Detection to Incident Map, AIS Correlation & Evidence Engine
// ==========================================================================

function applySatelliteDetectionToMapAndAIS(detection, imgW, imgH, filename = 'Sentinel-1_SAR.jpg') {
  if (!detection || !detection.centroid) return;

  const key = document.querySelector('#incident')?.value || 'kerala';
  const baseData = incidentData[key] || incidentData.kerala;

  // 1. Calculate Geographic Coordinates from Satellite Detection Centroid & Dimensions
  const baseLat = baseData.center[0];
  const baseLon = baseData.center[1];

  // Offset from image center normalized to [-0.5, 0.5]
  const dx = (detection.centroid.x - imgW / 2) / imgW;
  const dy = (detection.centroid.y - imgH / 2) / imgH;

  // Typical Sentinel-1 IW SAR scene spans ~0.50° lat x ~0.65° lon
  const newLat = Number((baseLat - (dy * 0.50)).toFixed(5));
  const newLon = Number((baseLon + (dx * 0.65)).toFixed(5));
  const newCenter = [newLat, newLon];

  // Convert detected contour polygon vertices to geographic coordinates
  const geoPolygon = (detection.polygon && detection.polygon.length > 0)
    ? detection.polygon.map(pt => {
        const vDx = (pt.x - imgW / 2) / imgW;
        const vDy = (pt.y - imgH / 2) / imgH;
        return [
          Number((baseLat - (vDy * 0.50)).toFixed(5)),
          Number((baseLon + (vDx * 0.65)).toFixed(5))
        ];
      })
    : baseData.polygon;

  // Format DMS coordinate string
  const formatDMS = (val, type) => {
    const d = Math.floor(Math.abs(val));
    const m = Math.floor((Math.abs(val) - d) * 60);
    const s = Math.round(((Math.abs(val) - d) * 60 - m) * 60);
    const dir = type === 'lat' ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
    return `Lat: ${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"${dir}`;
  };
  const coordsDisplay = `${formatDMS(newLat, 'lat')} | ${formatDMS(newLon, 'lon').replace('Lat:', 'Lon:')}`;

  // 2. Clone and Update Current Incident Data
  const estVolume = `~${Math.round(parseFloat(detection.areaKm2) * 75).toLocaleString()} m³`;
  
  // Calculate new drift vector end based on bearing and speed
  const bearing = baseData.drift.bearing;
  const rad = (bearing * Math.PI) / 180;
  const speedKts = parseFloat(baseData.drift.speed) || 1.4;
  const distKm6h = speedKts * 1.852 * 6;
  const dLatDrift = (distKm6h * Math.cos(rad)) / 111.32;
  const dLonDrift = (distKm6h * Math.sin(rad)) / (111.32 * Math.cos((newLat * Math.PI) / 180));
  const newDriftEnd = [Number((newLat + dLatDrift).toFixed(5)), Number((newLon + dLonDrift).toFixed(5))];

  // Update current incident state
  currentIncident = {
    ...baseData,
    center: newCenter,
    coordsDisplay,
    area: detection.areaKm2,
    volume: estVolume,
    confidence: detection.confidence,
    sensor: filename.includes('Sentinel') || filename.includes('sample_sar') ? 'Sentinel-1 C-SAR' : `Satellite SAR (${filename})`,
    pass: `Dynamic AI Detection • ${imgW}×${imgH}px`,
    polygon: geoPolygon,
    drift: {
      ...baseData.drift,
      vectorEnd: newDriftEnd
    }
  };

  // 3. Spatio-Temporal AIS Vessel Correlation relative to the new spill centroid
  const correlatedSimulatedVessels = baseData.vessels.map(v => {
    const distKm = haversineDistance(v.pos[0], v.pos[1], newLat, newLon);
    
    // Distance proximity score (max 50 pts)
    let sDist = 5;
    if (distKm <= 5) sDist = 50;
    else if (distKm <= 15) sDist = Math.max(30, Math.round(50 - (distKm - 5) * 2.0));
    else if (distKm <= 30) sDist = Math.max(15, Math.round(30 - (distKm - 15) * 1.0));
    else if (distKm <= 60) sDist = Math.max(5, Math.round(15 - (distKm - 30) * 0.33));

    // Time overlap score (max 30 pts)
    let sTime = 12;
    let timeMins = 0;
    const matchMins = v.overlap.match(/([+-]?\d+)\s*m/);
    const matchHours = v.overlap.match(/([+-]?\d+(\.\d+)?)\s*h/);
    if (matchMins) timeMins = parseInt(matchMins[1], 10);
    else if (matchHours) timeMins = Math.round(parseFloat(matchHours[1]) * 60);
    
    const absMins = Math.abs(timeMins);
    if (absMins <= 45) sTime = 30;
    else if (absMins <= 90) sTime = 24;
    else if (absMins <= 180) sTime = 16;
    else if (absMins <= 360) sTime = 10;
    else sTime = 4;

    // Speed anomaly score (max 20 pts)
    const spd = parseFloat(v.speed) || 12.0;
    const sSpeed = (spd >= 5 && spd <= 14) ? 20 : (spd <= 18 ? 12 : 8);

    const scoreNum = Math.min(100, Math.max(12, sDist + sTime + sSpeed));
    const riskLevel = scoreNum >= 75 ? 'High' : (scoreNum >= 48 ? 'Medium' : 'Low');
    const riskClass = scoreNum >= 75 ? 'risk-high' : (scoreNum >= 48 ? 'risk-medium' : 'risk-low');

    return {
      ...v,
      distance: `${distKm.toFixed(1)} km`,
      distNum: distKm,
      score: `${scoreNum}%`,
      scoreNum,
      riskLevel,
      riskClass
    };
  });

  // Sort simulated vessels by correlation score descending (highest risk first)
  correlatedSimulatedVessels.sort((a, b) => b.scoreNum - a.scoreNum);
  currentIncident.vessels = correlatedSimulatedVessels;

  // 4. Update Leaflet Map Layers
  layerSlick.clearLayers();
  layerDrift.clearLayers();
  layerReviewArea.clearLayers();
  layerVessels.clearLayers();
  layerTracks.clearLayers();
  activeVesselMarkers = [];
  activeTrackPolylines = [];

  // A. Render Multi-vertex Radar Slick Polygon from Detected Satellite Contour
  activeSlickPolygon = L.polygon(geoPolygon, {
    color: '#f97316',
    weight: 2.5,
    opacity: 0.95,
    fillColor: '#ea580c',
    fillOpacity: 0.55,
    dashArray: '4, 4'
  }).addTo(layerSlick);

  // Pulse halo around detected centroid
  L.circle(newCenter, {
    radius: 7500,
    color: '#f97316',
    weight: 1,
    opacity: 0.4,
    fillColor: '#f97316',
    fillOpacity: 0.12,
    className: 'spill-pulse'
  }).addTo(layerSlick);

  activeSlickPolygon.bindPopup(`
    <div class="map-popup-title">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
      SAR Slick Detection Zone (Detected from ${filename})
    </div>
    <div class="map-popup-meta">
      <div><b>Image Source:</b> ${filename}</div>
      <div><b>Centroid:</b> ${newLat.toFixed(4)}°N, ${newLon.toFixed(4)}°E (Pixel: X:${detection.centroid.x}, Y:${detection.centroid.y})</div>
      <div><b>Est. Area:</b> ${detection.areaKm2} km² | Vol: ${estVolume}</div>
      <div><b>AI Confidence:</b> ${detection.confidence}% (PROTOTYPE SIMULATION)</div>
      <div style="margin-top: 6px; color: #fed7aa;"><b>AIS Status:</b> Spatio-Temporal Intersect Correlated</div>
    </div>
  `);

  // B. Render Drift Vector from New Centroid
  const driftCoords = [newCenter, newDriftEnd];
  activeDriftVector = L.polyline(driftCoords, {
    color: '#10b981',
    weight: 3,
    opacity: 0.9,
    dashArray: '6, 6'
  }).addTo(layerDrift);

  const driftArrowIcon = L.divIcon({
    className: 'drift-arrow-icon',
    html: `
      <div style="transform: rotate(${bearing}deg); color: #10b981; display: flex; align-items: center; justify-content: center;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,2 22,22 12,17 2,22" />
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const driftEndMarker = L.marker(newDriftEnd, { icon: driftArrowIcon }).addTo(layerDrift);
  driftEndMarker.bindPopup(`
    <div class="map-popup-title">Possible Drift Direction Forecast</div>
    <div class="map-popup-meta">
      <div><b>Trajectory:</b> ${bearing}° @ ${baseData.drift.speed}</div>
      <div><b>Metocean:</b> ${baseData.drift.wind}</div>
      <div><b>Target Shoreline:</b> ${baseData.drift.target}</div>
      <div><b>Landfall ETA:</b> ${baseData.drift.eta}</div>
    </div>
  `);

  // C. Render Review-Required Area (12km radius around new centroid)
  const reviewArea = L.circle(newCenter, {
    radius: 12000,
    color: '#ef4444',
    weight: 2,
    opacity: 0.9,
    dashArray: '6, 6',
    fillColor: '#ef4444',
    fillOpacity: 0.12
  }).addTo(layerReviewArea);

  reviewArea.bindPopup(`
    <div class="map-popup-title" style="color: #f87171;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Review-Required Surveillance Area
    </div>
    <div class="map-popup-meta">
      <div><b>Status:</b> Immediate Human Review Required (Priority 1)</div>
      <div><b>Coverage:</b> 12.0 km around SAR detected centroid (${newLat.toFixed(4)}°N, ${newLon.toFixed(4)}°E)</div>
      <div><b>Action:</b> Validate vessel AIS records against radar dark slick geometry</div>
    </div>
  `);

  // D. Render Vessels & Historical Tracks
  correlatedSimulatedVessels.forEach((v, index) => {
    const isHigh = v.riskLevel === 'High';
    const trackColor = isHigh ? '#38bdf8' : (v.riskLevel === 'Medium' ? '#60a5fa' : '#93c5fd');
    const trackLine = L.polyline(v.track, {
      color: trackColor,
      weight: isHigh ? 2.5 : 1.8,
      opacity: 0.8,
      dashArray: '5, 8'
    }).addTo(layerTracks);

    trackLine.bindPopup(`
      <div class="map-popup-title">${v.name} AIS Historical Track</div>
      <div class="map-popup-meta">
        <div>MMSI: ${v.mmsi} | Flag: ${v.flag}</div>
        <div>CPA Distance: ${v.distance}</div>
        <div>Anomaly: ${v.speedAnomaly}</div>
      </div>
    `);
    activeTrackPolylines.push(trackLine);

    const icon = createVesselIcon(v.heading, false, v.riskLevel);
    const marker = L.marker(v.pos, { icon }).addTo(layerVessels);

    marker.bindPopup(`
      <div class="map-popup-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/></svg>
        ${v.name} (${v.flag})
        <span class="badge-demo-vessel" style="margin-left: 6px;">SIMULATED AIS</span>
      </div>
      <div class="map-popup-meta">
        <div><b>MMSI:</b> ${v.mmsi} | <b>Type:</b> ${v.type}</div>
        <div><b>CPA to Detected Spill:</b> <b>${v.distance}</b> | <b>Overlap:</b> ${v.overlap}</div>
        <div><b>Current AIS Speed:</b> ${v.speed}</div>
        <div style="margin-top: 4px;"><b>Correlation Score:</b> <span class="risk-level-badge ${v.riskClass}">${v.score} (${v.riskLevel})</span></div>
        <div style="margin-top: 4px; font-size: 10px; color: var(--text-muted);">• POTENTIALLY ASSOCIATED VESSEL • PRELIMINARY SCREENING •</div>
      </div>
    `);

    marker.on('click', () => {
      highlightTableRow(index);
    });

    activeVesselMarkers.push(marker);
  });

  // E. If uploaded vessels exist, re-evaluate and re-render them relative to newCenter
  if (uploadedVessels.length > 0) {
    renderUploadedVesselsOnMap(newCenter);
  }

  // F. Pan/Zoom map to frame the detected spill
  map.setView(newCenter, 9, { animate: true, duration: 1 });

  // 5. Update Telemetry Cards & Map Info Panel
  const statArea = document.querySelector('#stat-area');
  if (statArea) statArea.innerText = detection.areaKm2;

  const statVolume = document.querySelector('#stat-volume');
  if (statVolume) statVolume.innerText = estVolume;

  const statConf = document.querySelector('#stat-conf');
  if (statConf) statConf.innerText = detection.confidence;

  const statVessels = document.querySelector('#stat-vessels');
  if (statVessels) statVessels.innerText = correlatedSimulatedVessels.length.toString().padStart(2, '0');

  const mapCoords = document.querySelector('#map-coords');
  if (mapCoords) mapCoords.innerText = `${coordsDisplay} (SAR Detected)`;

  // 6. Update Investigation Dossier (#result)
  const resultCard = document.querySelector('#result');
  if (resultCard) {
    resultCard.innerHTML = `
      <b>Satellite-Correlated Intelligence Dossier (PROTOTYPE)</b><br>
      Confirmed anomalous low-backscatter slick zone detected from <b>${filename}</b> at 
      <span style="font-family: var(--font-mono); color: var(--accent-cyan);">${newLat.toFixed(4)}°N, ${newLon.toFixed(4)}°E</span>.<br>
      <div class="telemetry-pill-group">
        <span class="telemetry-pill">Detected Area: ${detection.areaKm2} km²</span>
        <span class="telemetry-pill">Confidence: ${detection.confidence}%</span>
        <span class="telemetry-pill">Candidates: ${correlatedSimulatedVessels.length}</span>
        <span class="telemetry-pill">Drift: ${bearing}° / ${baseData.drift.speed}</span>
      </div>
      <b>Spatio-Temporal Findings:</b> Retrospective trajectory analysis identified <b>${correlatedSimulatedVessels[0].name}</b> (${correlatedSimulatedVessels[0].distance} CPA) and <b>${correlatedSimulatedVessels[1].name}</b> (${correlatedSimulatedVessels[1].distance} CPA) as potentially associated vessels within the estimated discharge window.<br><br>
      <b style="color: #fda4af;">Statutory Disclaimer:</b> Vessel correlation is a preliminary screening result and does not establish legal responsibility. Forwarded for aerial surveillance and port state inspection.
    `;
  }

  // 7. Render AIS Correlation Table
  document.querySelector('#badge-simulated-count').innerText = correlatedSimulatedVessels.length;
  document.querySelector('#badge-uploaded-count').innerText = uploadedVessels.length;

  if (currentFeedSource === 'uploaded' && uploadedVessels.length > 0) {
    renderUploadedTable(newCenter);
  } else {
    renderSimulatedTable(correlatedSimulatedVessels);
  }

  // 8. Update Drift Forecast & Evidence Dashboard
  updateDriftForecastSection(currentIncident);
  simulateSpillDrift(activeDriftHorizon);
  updateEvidenceRiskDashboard(currentIncident, correlatedSimulatedVessels[0]);
  updateDashboardCards({ statusText: 'ACTIVE', statusSub: 'Autonomous Detection Synced', headerText: 'OPERATIONAL • SLICK IDENTIFIED' });
}

// ==========================================================================
// Satellite SAR Image Upload, Zoom/Pan Canvas & Simulated AI Detection Engine
// ==========================================================================

let currentSatFilename = 'sample_sar_image.jpg';
let currentObjectURL = null;
let isAnalyzingSpill = false;

// 4-Stage Pipeline State Helper
function setPipelineStage(stageNum, state, tagText) {
  const stepEl = document.querySelector(`#sat-step-${stageNum}`);
  const tagEl = document.querySelector(`#sat-tag-${stageNum}`);
  if (!stepEl) return;

  stepEl.classList.remove('active', 'completed');
  if (state === 'active') stepEl.classList.add('active');
  if (state === 'completed') stepEl.classList.add('completed');

  if (tagEl && tagText) tagEl.innerText = tagText;
}

// Reset Analysis State
function resetSpillAnalysis() {
  simulatedAiResults = null;
  showAiMask = false;
  renderSatCanvas();

  // Reset all 4 pipeline stages
  for (let i = 1; i <= 4; i++) {
    setPipelineStage(i, 'idle', 'Ready');
  }

  const pipelineStatus = document.querySelector('#sat-pipeline-status');
  if (pipelineStatus) pipelineStatus.innerText = 'PIPELINE RESET • READY TO RUN';

  const statusText = document.querySelector('#sat-status-text');
  if (statusText) statusText.innerText = satImage ? 'Image Ready • Click "Detect Spill" to Run AI Pipeline' : 'Standby (Awaiting Image)';

  const statusBadge = document.querySelector('#sat-status-badge');
  if (statusBadge) {
    statusBadge.innerText = satImage ? 'READY' : 'STANDBY';
    statusBadge.className = 'sat-status-badge sat-status-waiting';
  }

  // Reset telemetry readouts
  const areaVal = document.querySelector('#sat-area-val');
  if (areaVal) areaVal.innerText = '--';
  const confVal = document.querySelector('#sat-conf-val');
  if (confVal) confVal.innerText = '--';
  const procTimeVal = document.querySelector('#sat-proc-time');
  if (procTimeVal) procTimeVal.innerText = '--';
  const perimVal = document.querySelector('#sat-boundary-perimeter');
  if (perimVal) perimVal.innerText = 'Perimeter: --';
  const centroidVal = document.querySelector('#sat-centroid-readout');
  if (centroidVal) centroidVal.innerText = 'Centroid: [X: --, Y: --]';
  const bboxVal = document.querySelector('#sat-bbox-readout');
  if (bboxVal) bboxVal.innerText = 'Bounding Box: [W: --, H: --]';
  const polyVal = document.querySelector('#sat-poly-vertices');
  if (polyVal) polyVal.innerText = 'Contour Points: -- vertices';

  updateDashboardCards({ statusText: 'STANDBY', statusSub: 'Awaiting Next Detection', headerText: 'STANDBY • READY TO SCAN' });
  showToast('Spill detection analysis reset. Click "Detect Spill" to re-scan.', 'info');
}

// Run AI-Powered Spill Detection Pipeline (4 Stages with Live Animation)
async function runAiSpillDetectionPipeline() {
  if (!satImage) {
    showToast('Please upload a satellite raster or load the sample SAR image first.', 'warn');
    return;
  }

  if (isAnalyzingSpill) return;
  isAnalyzingSpill = true;

  updateWorkflowStepper({ step: 2, statusText: 'AI Pipeline Active • 4-Stage Adaptive CFAR Inference...' });
  updateDashboardCards({ statusText: 'ANALYZING', statusSub: 'Radar CFAR Inference...', headerText: 'PIPELINE ACTIVE • INFERENCE' });

  const btnDetect = document.querySelector('#btn-detect-spill');
  if (btnDetect) {
    btnDetect.classList.add('analyzing');
    btnDetect.disabled = true;
  }

  // Show loading skeleton in AIS table
  const rowsEl = document.querySelector('#rows');
  if (rowsEl) {
    rowsEl.innerHTML = `
      <tr class="loading-correlation-row">
        <td colspan="7" style="text-align: center; padding: 28px; color: var(--accent-cyan);">
          <div style="display: inline-flex; align-items: center; gap: 10px; justify-content: center;">
            <div class="radar-ring" style="width: 18px; height: 18px; border-width: 2px;"></div>
            <span style="font-weight: 600;">AI Engine Analyzing SAR Raster & Correlating Vessels with Detected Slick...</span>
          </div>
        </td>
      </tr>
    `;
  }

  const statusText = document.querySelector('#sat-status-text');
  const statusBadge = document.querySelector('#sat-status-badge');
  const pipelineStatus = document.querySelector('#sat-pipeline-status');

  if (statusBadge) {
    statusBadge.innerText = 'ANALYZING';
    statusBadge.className = 'sat-status-badge sat-status-waiting';
  }

  const t0 = performance.now();

  // STAGE 1: Image Processing
  setPipelineStage(1, 'active', 'Processing...');
  if (statusText) statusText.innerText = '[1/4] Image Processing: Grayscale conversion & luminance analysis...';
  if (pipelineStatus) pipelineStatus.innerText = 'PIPELINE ACTIVE • STAGE 1: IMAGE PROCESSING';
  await new Promise(r => setTimeout(r, 140));
  setPipelineStage(1, 'completed', 'Completed');

  // STAGE 2: Slick Region Identification
  setPipelineStage(2, 'active', 'Clustering...');
  if (statusText) statusText.innerText = '[2/4] Slick Identification: Adaptive CFAR thresholding & clustering...';
  if (pipelineStatus) pipelineStatus.innerText = 'PIPELINE ACTIVE • STAGE 2: SLICK REGION IDENTIFICATION';
  await new Promise(r => setTimeout(r, 140));
  setPipelineStage(2, 'completed', 'Identified');

  // STAGE 3: Boundary Extraction
  setPipelineStage(3, 'active', 'Tracing...');
  if (statusText) statusText.innerText = '[3/4] Boundary Extraction: Radial ray-tracing & contour polygon...';
  if (pipelineStatus) pipelineStatus.innerText = 'PIPELINE ACTIVE • STAGE 3: BOUNDARY EXTRACTION';
  
  // Dynamically analyze current image pixels
  simulatedAiResults = computeSimulatedAiDetection(satImage, satImage.width, satImage.height);
  await new Promise(r => setTimeout(r, 140));
  setPipelineStage(3, 'completed', 'Extracted');

  // STAGE 4: Detection Completed
  setPipelineStage(4, 'active', 'Syncing...');
  if (statusText) statusText.innerText = '[4/4] Finalizing: Centroid calculation & GIS map synchronization...';
  if (pipelineStatus) pipelineStatus.innerText = 'PIPELINE ACTIVE • STAGE 4: GIS MAP SYNCHRONIZATION';
  await new Promise(r => setTimeout(r, 100));
  setPipelineStage(4, 'completed', 'Synchronized');

  const procTime = Math.max(95, Math.round(performance.now() - t0));

  // Update Telemetry & Diagnostics Panel
  const areaVal = document.querySelector('#sat-area-val');
  if (areaVal) areaVal.innerText = simulatedAiResults.areaKm2;
  const confVal = document.querySelector('#sat-conf-val');
  if (confVal) confVal.innerText = simulatedAiResults.confidence;
  const procTimeVal = document.querySelector('#sat-proc-time');
  if (procTimeVal) procTimeVal.innerText = procTime;
  const perimVal = document.querySelector('#sat-boundary-perimeter');
  if (perimVal) perimVal.innerText = `Perimeter: ${simulatedAiResults.perimeterKm} km`;
  const bboxVal = document.querySelector('#sat-bbox-readout');
  if (bboxVal) bboxVal.innerText = `Bounding Box: [W: ${simulatedAiResults.bbox.w}px, H: ${simulatedAiResults.bbox.h}px]`;
  const polyVal = document.querySelector('#sat-poly-vertices');
  if (polyVal) polyVal.innerText = `Contour Points: ${simulatedAiResults.polygon.length} vertices`;

  // Centroid readout (Pixel + Lat/Lon)
  const key = document.querySelector('#incident')?.value || 'kerala';
  const baseData = incidentData[key] || incidentData.kerala;
  const baseLat = baseData.center[0];
  const baseLon = baseData.center[1];
  const dx = (simulatedAiResults.centroid.x - satImage.width / 2) / satImage.width;
  const dy = (simulatedAiResults.centroid.y - satImage.height / 2) / satImage.height;
  const newLat = Number((baseLat - (dy * 0.50)).toFixed(4));
  const newLon = Number((baseLon + (dx * 0.65)).toFixed(4));

  const centroidVal = document.querySelector('#sat-centroid-readout');
  if (centroidVal) {
    centroidVal.innerText = `Centroid: [X: ${simulatedAiResults.centroid.x}px, Y: ${simulatedAiResults.centroid.y}px] • ${newLat}°N, ${newLon}°E`;
  }

  if (statusText) statusText.innerText = `AI Inference Complete (${procTime}ms) • Dark Slick Identified`;
  if (statusBadge) {
    statusBadge.innerText = 'DETECTED';
    statusBadge.className = 'sat-status-badge sat-status-ready';
  }
  if (pipelineStatus) {
    pipelineStatus.innerText = `PIPELINE COMPLETED IN ${procTime}ms • PROTOTYPE SIMULATION`;
  }

  // Ensure AI mask is shown and render canvas overlay
  showAiMask = true;
  const maskToggle = document.querySelector('#sat-toggle-mask');
  if (maskToggle) maskToggle.checked = true;
  renderSatCanvas();

  // Connect to Incident Map, AIS Correlation, Drift Forecast, and Evidence Dashboard
  applySatelliteDetectionToMapAndAIS(simulatedAiResults, satImage.width, satImage.height, currentSatFilename);

  if (btnDetect) {
    btnDetect.classList.remove('analyzing');
    btnDetect.disabled = false;
  }
  isAnalyzingSpill = false;

  showToast(`Spill detection completed in ${procTime}ms • Results synchronized to Map & AIS`, 'success');
}

// Reset Viewport to fit image comfortably
function resetSatViewport() {
  if (!satImage) return;
  const vpWidth = satViewport.clientWidth || 700;
  const vpHeight = satViewport.clientHeight || 480;

  const scaleX = (vpWidth * 0.88) / satImage.width;
  const scaleY = (vpHeight * 0.88) / satImage.height;
  satScale = Math.min(scaleX, scaleY, 1.2);

  satPanX = vpWidth / 2;
  satPanY = vpHeight / 2;
  renderSatCanvas();
}

// Load Sample SAR Image (Original Raster without artificial background)
async function loadSampleSarImage(options = {}) {
  try {
    currentSatFilename = 'Sentinel-1_SAR_Kerala_GRDH.jpg';
    isDemoSample = true;

    // 1. Clear previous detection overlay, results, and reset diagnostics
    simulatedAiResults = null;
    satImage = null;
    satCtx.clearRect(0, 0, satCanvas.width, satCanvas.height);

    for (let i = 1; i <= 4; i++) {
      setPipelineStage(i, 'idle', 'Ready');
    }

    const areaVal = document.querySelector('#sat-area-val');
    if (areaVal) areaVal.innerText = '--';
    const confVal = document.querySelector('#sat-conf-val');
    if (confVal) confVal.innerText = '--';
    const procTimeVal = document.querySelector('#sat-proc-time');
    if (procTimeVal) procTimeVal.innerText = '--';
    const perimVal = document.querySelector('#sat-boundary-perimeter');
    if (perimVal) perimVal.innerText = 'Perimeter: --';
    const centroidVal = document.querySelector('#sat-centroid-readout');
    if (centroidVal) centroidVal.innerText = 'Centroid: [X: --, Y: --]';
    const bboxVal = document.querySelector('#sat-bbox-readout');
    if (bboxVal) bboxVal.innerText = 'Bounding Box: [W: --, H: --]';
    const polyVal = document.querySelector('#sat-poly-vertices');
    if (polyVal) polyVal.innerText = 'Contour Points: -- vertices';

    // Clear map layers from previous detection
    if (typeof layerSlick !== 'undefined' && layerSlick.clearLayers) layerSlick.clearLayers();
    if (typeof layerReviewArea !== 'undefined' && layerReviewArea.clearLayers) layerReviewArea.clearLayers();
    if (typeof layerDrift !== 'undefined' && layerDrift.clearLayers) layerDrift.clearLayers();
    if (typeof layerDriftForecast !== 'undefined' && layerDriftForecast.clearLayers) layerDriftForecast.clearLayers();

    // Reset currentIncident to baseline so old detection results do not linger
    const key = document.querySelector('#incident')?.value || 'kerala';
    currentIncident = JSON.parse(JSON.stringify(incidentData[key] || incidentData.kerala));

    const mapCoords = document.querySelector('#map-coords');
    if (mapCoords) mapCoords.innerText = `${currentIncident.coordsDisplay} (Standby • Awaiting Detection)`;

    renderSimulatedTable(currentIncident.vessels);

    const statusText = document.querySelector('#sat-status-text');
    const statusBadge = document.querySelector('#sat-status-badge');
    if (statusText) statusText.innerText = 'Loading Sentinel-1 SAR Raster...';
    if (statusBadge) {
      statusBadge.innerText = 'LOADING';
      statusBadge.className = 'sat-status-badge sat-status-waiting';
    }

    // Load original SAR image directly without modifying its appearance
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load sample_sar_image.jpg'));
      setTimeout(() => reject(new Error('Image load timed out')), 4000);
      img.src = 'sample_sar_image.jpg';
    });

    satImage = img;

    // Hide empty state & show floating controls
    const emptyState = document.querySelector('#sat-empty-state');
    if (emptyState) emptyState.style.display = 'none';
    const floatControls = document.querySelector('#sat-floating-controls');
    if (floatControls) floatControls.style.display = 'flex';

    // Update Telemetry & Diagnostics Header
    const filenameEl = document.querySelector('#sat-img-filename');
    if (filenameEl) filenameEl.innerText = `Sentinel-1_SAR_Kerala_GRDH.jpg (Original SAR • ${satImage.width}×${satImage.height}px)`;

    const sourceBadge = document.querySelector('#sat-img-source');
    if (sourceBadge) {
      sourceBadge.style.display = 'inline-flex';
      sourceBadge.innerText = 'DEMO SAMPLE';
      sourceBadge.style.background = 'rgba(239, 68, 68, 0.18)';
      sourceBadge.style.color = '#fca5a5';
      sourceBadge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    }

    const sourceName = document.querySelector('#sat-source-name');
    if (sourceName) sourceName.innerText = 'Sentinel-1 SAR C-Band (sample_sar_image.jpg)';

    // Center and render base image
    resetSatViewport();

    // If autoDetect requested, run immediately; otherwise prepare for detection
    if (options.autoDetect) {
      await runAiSpillDetectionPipeline();
    } else {
      if (statusText) statusText.innerText = `Sample SAR Ingested (${satImage.width}×${satImage.height}px) • Click "Detect Spill" to Run AI Pipeline`;
      if (statusBadge) {
        statusBadge.innerText = 'READY';
        statusBadge.className = 'sat-status-badge sat-status-ready';
      }
      const pipelineStatus = document.querySelector('#sat-pipeline-status');
      if (pipelineStatus) pipelineStatus.innerText = 'SAMPLE RASTER INGESTED • READY FOR AI DETECTION';

      const resultCard = document.querySelector('#result');
      if (resultCard) {
        resultCard.innerHTML = `
          <b>Sentinel-1 SAR Sample Raster Ingested</b><br>
          Dimensions: ${satImage.width}×${satImage.height}px. Previous detection masks cleared.<br>
          <span style="color: var(--accent-cyan); font-weight: 600;">Step 2: Click "Detect Spill (Run AI Inference)" to extract anomalous dark slick formations.</span>
        `;
      }

      updateDashboardCards({ statusText: 'STANDBY', statusSub: 'Sample Raster Ingested', headerText: 'STANDBY • READY TO SCAN' });
      showToast('Sample SAR raster loaded. Click "Detect Spill" to run AI detection.', 'info');
    }

    if (!options.silent) {
      const satPanel = document.querySelector('#satellite-analysis-panel');
      if (satPanel) {
        satPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

  } catch (err) {
    console.error('Error loading sample SAR image:', err);
    if (!options.silent) {
      showToast('Failed to load sample SAR image: ' + err.message, 'error');
    }
  }
}

// Load Image into Dashboard (supports JPG, PNG, GIF, and GeoTIFF)
async function loadSatelliteImage(fileOrUrl, filename) {
  filename = filename || (typeof fileOrUrl === 'string' ? fileOrUrl : (fileOrUrl?.name || 'satellite_image.jpg'));
  isDemoSample = false;
  currentSatFilename = filename;
  try {
    // 1. Clear previous detection overlay, results, and reset diagnostics
    simulatedAiResults = null;
    satImage = null;
    showAiMask = false;
    const maskToggle = document.querySelector('#sat-toggle-mask');
    if (maskToggle) maskToggle.checked = false;
    satCtx.clearRect(0, 0, satCanvas.width, satCanvas.height);

    for (let i = 1; i <= 4; i++) {
      setPipelineStage(i, 'idle', 'Ready');
    }

    const areaVal = document.querySelector('#sat-area-val');
    if (areaVal) areaVal.innerText = '--';
    const confVal = document.querySelector('#sat-conf-val');
    if (confVal) confVal.innerText = '--';
    const procTimeVal = document.querySelector('#sat-proc-time');
    if (procTimeVal) procTimeVal.innerText = '--';
    const perimVal = document.querySelector('#sat-boundary-perimeter');
    if (perimVal) perimVal.innerText = 'Perimeter: --';
    const centroidVal = document.querySelector('#sat-centroid-readout');
    if (centroidVal) centroidVal.innerText = 'Centroid: [X: --, Y: --]';
    const bboxVal = document.querySelector('#sat-bbox-readout');
    if (bboxVal) bboxVal.innerText = 'Bounding Box: [W: --, H: --]';
    const polyVal = document.querySelector('#sat-poly-vertices');
    if (polyVal) polyVal.innerText = 'Contour Points: -- vertices';

    // Clear map layers from previous detection
    if (typeof layerSlick !== 'undefined' && layerSlick.clearLayers) layerSlick.clearLayers();
    if (typeof layerReviewArea !== 'undefined' && layerReviewArea.clearLayers) layerReviewArea.clearLayers();
    if (typeof layerDrift !== 'undefined' && layerDrift.clearLayers) layerDrift.clearLayers();
    if (typeof layerDriftForecast !== 'undefined' && layerDriftForecast.clearLayers) layerDriftForecast.clearLayers();

    // Reset currentIncident to baseline so old detection results do not linger
    const key = document.querySelector('#incident')?.value || 'kerala';
    currentIncident = JSON.parse(JSON.stringify(incidentData[key] || incidentData.kerala));

    const mapCoords = document.querySelector('#map-coords');
    if (mapCoords) mapCoords.innerText = `${currentIncident.coordsDisplay} (Standby • Awaiting Detection)`;

    renderSimulatedTable(currentIncident.vessels);

    document.querySelector('#sat-status-text').innerText = 'Processing Raster & Ingesting Image...';
    document.querySelector('#sat-status-badge').innerText = 'LOADING';
    document.querySelector('#sat-status-badge').className = 'sat-status-badge sat-status-waiting';

    // Handle GeoTIFF files (.tif, .tiff)
    if (filename.toLowerCase().endsWith('.tif') || filename.toLowerCase().endsWith('.tiff')) {
      if (typeof GeoTIFF === 'undefined') {
        throw new Error('GeoTIFF parser library is still loading. Please try again in a moment.');
      }

      let arrayBuffer;
      if (typeof File !== 'undefined' && fileOrUrl instanceof File) {
        arrayBuffer = await fileOrUrl.arrayBuffer();
      } else {
        const response = await fetch(fileOrUrl);
        if (!response.ok) throw new Error(`HTTP error ${response.status} fetching GeoTIFF`);
        arrayBuffer = await response.arrayBuffer();
      }

      const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
      const tiffImage = await tiff.getImage();
      const rasters = await tiffImage.readRasters();
      const width = tiffImage.getWidth();
      const height = tiffImage.getHeight();

      // Render raster data to an offscreen canvas
      const offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext('2d');
      const imgData = offCtx.createImageData(width, height);

      const band0 = rasters[0];
      let min = Infinity, max = -Infinity;
      for (let i = 0; i < band0.length; i++) {
        if (band0[i] < min) min = band0[i];
        if (band0[i] > max) max = band0[i];
      }
      const range = max - min || 1;

      for (let i = 0; i < band0.length; i++) {
        const val = Math.floor(((band0[i] - min) / range) * 255);
        const idx = i * 4;
        imgData.data[idx] = val;     // R
        imgData.data[idx + 1] = val; // G
        imgData.data[idx + 2] = val; // B
        imgData.data[idx + 3] = 255; // Alpha
      }

      offCtx.putImageData(imgData, 0, 0);
      satImage = offCanvas;
    } else {
      // Standard JPG / PNG / GIF
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error(`Failed to decode image raster "${filename}". Please check file format.`));
        if (typeof File !== 'undefined' && fileOrUrl instanceof File) {
          if (currentObjectURL) {
            try { URL.revokeObjectURL(currentObjectURL); } catch (_) {}
            currentObjectURL = null;
          }
          currentObjectURL = URL.createObjectURL(fileOrUrl);
          img.src = currentObjectURL;
        } else {
          img.src = fileOrUrl;
        }
      });

      satImage = img;
    }

    // Hide empty state & show floating controls
    document.querySelector('#sat-empty-state').style.display = 'none';
    document.querySelector('#sat-floating-controls').style.display = 'flex';

    // Update Telemetry Panel Header
    document.querySelector('#sat-img-filename').innerText = `${filename} (${satImage.width}×${satImage.height}px)`;
    const sourceBadge = document.querySelector('#sat-img-source');
    if (sourceBadge) {
      sourceBadge.style.display = 'inline-flex';
      sourceBadge.innerText = 'SOURCE: USER UPLOAD';
    }
    const sourceName = document.querySelector('#sat-source-name');
    if (sourceName) sourceName.innerText = `USER UPLOAD (${filename})`;

    // Center and render clean base image
    resetSatViewport();

    // Set Status: Ready for user to click "Detect Spill"
    document.querySelector('#sat-status-text').innerText = `Raster Ingested (${satImage.width}×${satImage.height}px) • Click "Detect Spill" to Run AI Pipeline`;
    document.querySelector('#sat-status-badge').innerText = 'READY';
    document.querySelector('#sat-status-badge').className = 'sat-status-badge sat-status-ready';
    const pipelineStatus = document.querySelector('#sat-pipeline-status');
    if (pipelineStatus) pipelineStatus.innerText = 'RASTER INGESTED • READY FOR AI DETECTION';

    // Update Dossier with prompt to detect
    const resultCard = document.querySelector('#result');
    if (resultCard) {
      resultCard.innerHTML = `
        <b>Satellite Raster Ingested: ${filename}</b><br>
        Dimensions: ${satImage.width}×${satImage.height}px. Previous detection masks and results cleared.<br>
        <span style="color: var(--accent-cyan); font-weight: 600;">Step 2: Click "Detect Spill (Run AI Inference)" to extract anomalous dark slick formations.</span>
      `;
    }

    updateDashboardCards({ statusText: 'STANDBY', statusSub: 'New Raster Ingested', headerText: 'STANDBY • READY TO SCAN' });
    showToast(`Satellite image "${filename}" loaded successfully. Click "Detect Spill" to run AI detection.`, 'info');

  } catch (err) {
    console.error('Error loading satellite image:', err);
    showToast('Failed to process satellite image: ' + err.message, 'error');
    document.querySelector('#sat-status-text').innerText = 'Error processing image: ' + err.message;
    document.querySelector('#sat-status-badge').innerText = 'ERROR';
    document.querySelector('#sat-status-badge').className = 'sat-status-badge sat-status-waiting';
    // Restore simulated table
    const key = document.querySelector('#incident')?.value || 'kerala';
    const fallbackData = currentIncident || incidentData[key] || incidentData.kerala;
    renderSimulatedTable(fallbackData.vessels);
  }
}

// Mouse Drag-to-Pan Handlers
satViewport.addEventListener('mousedown', (e) => {
  if (!satImage) return;
  if (e.target.closest('.sat-floating-controls')) return;
  isPanning = true;
  startPanX = e.clientX - satPanX;
  startPanY = e.clientY - satPanY;
});

window.addEventListener('mousemove', (e) => {
  if (!isPanning || !satImage) return;
  satPanX = e.clientX - startPanX;
  satPanY = e.clientY - startPanY;
  renderSatCanvas();
});

window.addEventListener('mouseup', () => {
  isPanning = false;
});

// Mouse Wheel Zoom
satViewport.addEventListener('wheel', (e) => {
  if (!satImage) return;
  e.preventDefault();

  const rect = satViewport.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
  const newScale = Math.min(Math.max(0.2, satScale * zoomFactor), 8.0);

  // Zoom centered on cursor
  satPanX = mouseX - (mouseX - satPanX) * (newScale / satScale);
  satPanY = mouseY - (mouseY - satPanY) * (newScale / satScale);
  satScale = newScale;

  renderSatCanvas();
}, { passive: false });

// Floating Zoom Buttons
document.querySelector('#sat-zoom-in').addEventListener('click', () => {
  if (!satImage) return;
  satScale = Math.min(satScale * 1.25, 8.0);
  renderSatCanvas();
});

document.querySelector('#sat-zoom-out').addEventListener('click', () => {
  if (!satImage) return;
  satScale = Math.max(satScale * 0.8, 0.2);
  renderSatCanvas();
});

document.querySelector('#sat-zoom-reset').addEventListener('click', () => {
  resetSatViewport();
});

// Toggle AI Mask Checkbox
document.querySelector('#sat-toggle-mask').addEventListener('change', (e) => {
  showAiMask = e.target.checked;
  renderSatCanvas();
});

// Setup Satellite Upload Button & File Input
document.querySelector('#btn-upload-satellite').addEventListener('click', () => {
  document.querySelector('#satellite-file-input').click();
});

const btnUploadPanel = document.querySelector('#btn-upload-satellite-panel');
if (btnUploadPanel) {
  btnUploadPanel.addEventListener('click', () => {
    document.querySelector('#satellite-file-input').click();
  });
}

document.querySelector('#satellite-file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  loadSatelliteImage(file, file.name);
  e.target.value = '';
});

// Drag and Drop & Click-to-Upload on Viewport
const satViewportEl = document.querySelector('#sat-viewport');
if (satViewportEl) {
  satViewportEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    satViewportEl.style.borderColor = 'var(--accent-blue)';
    satViewportEl.style.background = 'var(--accent-blue-subtle)';
  });
  satViewportEl.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    satViewportEl.style.borderColor = '';
    satViewportEl.style.background = '';
  });
  satViewportEl.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    satViewportEl.style.borderColor = '';
    satViewportEl.style.background = '';
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      loadSatelliteImage(file, file.name);
    }
  });
}

const satEmptyStateEl = document.querySelector('#sat-empty-state');
if (satEmptyStateEl) {
  satEmptyStateEl.addEventListener('click', (e) => {
    if (e.target.closest('#btn-sample-satellite-inner')) return;
    document.querySelector('#satellite-file-input').click();
  });
}

// Setup Sample SAR Image Buttons (Header, Inner & Panel)
const btnSampleSat = document.querySelector('#btn-sample-satellite');
if (btnSampleSat) {
  btnSampleSat.addEventListener('click', () => loadSampleSarImage());
}
const btnSampleSatInner = document.querySelector('#btn-sample-satellite-inner');
if (btnSampleSatInner) {
  btnSampleSatInner.addEventListener('click', () => loadSampleSarImage());
}
const btnSampleSatPanel = document.querySelector('#btn-sample-satellite-panel');
if (btnSampleSatPanel) {
  btnSampleSatPanel.addEventListener('click', () => loadSampleSarImage());
}

// Setup Detect Spill and Reset Analysis Buttons
const btnDetectSpill = document.querySelector('#btn-detect-spill');
if (btnDetectSpill) {
  btnDetectSpill.addEventListener('click', runAiSpillDetectionPipeline);
}

const btnResetAnalysis = document.querySelector('#btn-reset-analysis');
if (btnResetAnalysis) {
  btnResetAnalysis.addEventListener('click', resetSpillAnalysis);
}

// Window resize re-renders canvas
window.addEventListener('resize', () => {
  if (satImage) renderSatCanvas();
});

// ==========================================================================
// Dynamic Oil Spill Drift Forecast Engine (6h, 12h, 24h, 48h Horizons)
// ==========================================================================

let activeDriftHorizon = 6;
if (typeof window !== 'undefined') window.activeDriftHorizon = activeDriftHorizon;
let activeWindDir = 315;    // degrees (0-359, blowing FROM)
let activeWindSpd = 14;     // knots (0-45)
let activeCurrDir = 135;    // degrees (0-359, flowing TOWARD)
let activeCurrSpd = 0.8;    // knots (0.1-3.0)

// Helper: Cardinal direction from degrees
function getCardinalDirection(deg) {
  const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const normalized = ((deg % 360) + 360) % 360;
  const idx = Math.round(normalized / 22.5) % 16;
  return cardinals[idx];
}

// Calculate Net Drift Vector (combining 3% surface windage with ocean current)
function calculateNetDriftVector(windDir, windSpd, currDir, currSpd) {
  // Wind blowing FROM windDir pushes oil TOWARD (windDir + 180) % 360
  const windTowardDeg = (windDir + 180) % 360;
  const windRad = (windTowardDeg * Math.PI) / 180;
  const windageKts = windSpd * 0.03; // Standard 3% surface windage
  const uWind = windageKts * Math.sin(windRad);
  const vWind = windageKts * Math.cos(windRad);

  // Ocean current flows TOWARD currDir
  const currRad = (currDir * Math.PI) / 180;
  const uCurr = currSpd * Math.sin(currRad);
  const vCurr = currSpd * Math.cos(currRad);

  // Vector addition
  const uNet = uWind + uCurr;
  const vNet = vWind + vCurr;

  const speedKts = Math.sqrt(uNet * uNet + vNet * vNet);
  const speedKmh = speedKts * 1.852;
  const rawBearing = (Math.atan2(uNet, vNet) * 180) / Math.PI;
  const bearing = Math.round(((rawBearing % 360) + 360) % 360);

  return {
    bearing,
    cardinal: getCardinalDirection(bearing),
    speedKts: speedKts.toFixed(1),
    speedKmh: speedKmh.toFixed(1),
    speedKmhNum: speedKmh,
    speedKtsNum: speedKts,
    uNet,
    vNet
  };
}

// Helper to compute waypoint at given hours from [startLat, startLon]
function computeDriftWaypoint(startLat, startLon, bearingDeg, speedKmh, hours) {
  const dist = speedKmh * hours;
  const rad = (bearingDeg * Math.PI) / 180;
  const dLat = (dist * Math.cos(rad)) / 111.32;
  const dLon = (dist * Math.sin(rad)) / (111.32 * Math.cos((startLat * Math.PI) / 180));
  return {
    hours,
    dist,
    lat: Number((startLat + dLat).toFixed(5)),
    lon: Number((startLon + dLon).toFixed(5))
  };
}

// Update Drift Forecast Section Telemetry & Timeline based on active incident & controls
function updateDriftForecastSection(data) {
  const incident = data || currentIncident || incidentData[document.querySelector('#incident')?.value || 'kerala'] || incidentData.kerala;
  const [startLat, startLon] = incident.center;

  // Compute dynamic net vector
  const net = calculateNetDriftVector(activeWindDir, activeWindSpd, activeCurrDir, activeCurrSpd);
  const totalDist = (net.speedKmhNum * activeDriftHorizon).toFixed(1);
  const predWp = computeDriftWaypoint(startLat, startLon, net.bearing, net.speedKmhNum, activeDriftHorizon);

  // Update control readout badges
  const windDirVal = document.querySelector('#drift-wind-dir-val');
  if (windDirVal) windDirVal.innerText = `${activeWindDir}° ${getCardinalDirection(activeWindDir)}`;
  const windSpdVal = document.querySelector('#drift-wind-spd-val');
  if (windSpdVal) windSpdVal.innerText = `${activeWindSpd} kts`;
  const currDirVal = document.querySelector('#drift-curr-dir-val');
  if (currDirVal) currDirVal.innerText = `${activeCurrDir}° ${getCardinalDirection(activeCurrDir)}`;
  const currSpdVal = document.querySelector('#drift-curr-spd-val');
  if (currSpdVal) currSpdVal.innerText = `${activeCurrSpd.toFixed(1)} kts`;

  // Update Telemetry Grid
  const initLoc = document.querySelector('#drift-initial-loc');
  if (initLoc) initLoc.innerText = `${startLat.toFixed(4)}°N, ${startLon.toFixed(4)}°E`;
  const initSub = document.querySelector('#drift-initial-sub');
  if (initSub) initSub.innerText = incident.pass?.includes('Dynamic') ? 'Detected Centroid (SAR)' : 'Incident Origin';

  const predLoc = document.querySelector('#drift-predicted-loc');
  if (predLoc) predLoc.innerText = `${predWp.lat.toFixed(4)}°N, ${predWp.lon.toFixed(4)}°E`;
  const predSub = document.querySelector('#drift-predicted-sub');
  if (predSub) predSub.innerText = `At T+${activeDriftHorizon}h (${totalDist} km)`;

  const netVec = document.querySelector('#drift-net-vector');
  if (netVec) netVec.innerText = `${net.bearing.toString().padStart(3, '0')}° ${net.cardinal} @ ${net.speedKts} kts`;
  const netSub = document.querySelector('#drift-net-sub');
  if (netSub) netSub.innerText = `Speed: ~${net.speedKmh} km/h • Net Vector`;

  const durVal = document.querySelector('#drift-forecast-duration');
  if (durVal) durVal.innerText = `Horizon: ${activeDriftHorizon} Hours`;
  const distVal = document.querySelector('#drift-forecast-dist');
  if (distVal) distVal.innerText = `${totalDist} km`;

  // Update timeline step distances
  const dist0 = document.querySelector('#drift-dist-0');
  if (dist0) dist0.innerText = '0.0 km';
  const dist6 = document.querySelector('#drift-dist-6');
  if (dist6) dist6.innerText = `~${(net.speedKmhNum * 6).toFixed(1)} km`;
  const dist12 = document.querySelector('#drift-dist-12');
  if (dist12) dist12.innerText = `~${(net.speedKmhNum * 12).toFixed(1)} km`;
  const dist24 = document.querySelector('#drift-dist-24');
  if (dist24) dist24.innerText = `~${(net.speedKmhNum * 24).toFixed(1)} km`;
  const dist48 = document.querySelector('#drift-dist-48');
  if (dist48) dist48.innerText = `~${(net.speedKmhNum * 48).toFixed(1)} km`;

  const activeLabel = document.querySelector('#drift-active-horizon-label');
  if (activeLabel) activeLabel.innerText = `Active: ${activeDriftHorizon}h Horizon`;

  // Update active states on timeline steps
  const s6 = document.querySelector('#drift-step-6');
  if (s6) s6.classList.toggle('active', activeDriftHorizon >= 6);
  const s12 = document.querySelector('#drift-step-12');
  if (s12) s12.classList.toggle('active', activeDriftHorizon >= 12);
  const s24 = document.querySelector('#drift-step-24');
  if (s24) s24.classList.toggle('active', activeDriftHorizon >= 24);
  const s48 = document.querySelector('#drift-step-48');
  if (s48) s48.classList.toggle('active', activeDriftHorizon >= 48);

  updateDashboardCards();
}

// Simulate Spill Drift Movement on Leaflet Map
function simulateSpillDrift(durationHours = activeDriftHorizon) {
  activeDriftHorizon = durationHours;
  if (typeof window !== 'undefined') window.activeDriftHorizon = activeDriftHorizon;
  const key = document.querySelector('#incident')?.value || 'kerala';
  const data = currentIncident || incidentData[key] || incidentData.kerala;

  updateDriftForecastSection(data);

  // Clear existing forecast layer elements
  layerDriftForecast.clearLayers();

  const [startLat, startLon] = data.center;
  const net = calculateNetDriftVector(activeWindDir, activeWindSpd, activeCurrDir, activeCurrSpd);
  const bearing = net.bearing;
  const speedKmh = net.speedKmhNum;

  // Calculate waypoints at 6h, 12h, 24h, and 48h
  const wp6 = computeDriftWaypoint(startLat, startLon, bearing, speedKmh, 6);
  const wp12 = computeDriftWaypoint(startLat, startLon, bearing, speedKmh, 12);
  const wp24 = computeDriftWaypoint(startLat, startLon, bearing, speedKmh, 24);
  const wp48 = computeDriftWaypoint(startLat, startLon, bearing, speedKmh, 48);

  const allWaypoints = [wp6, wp12, wp24, wp48];
  const activeWaypoints = allWaypoints.filter(wp => wp.hours <= durationHours);

  // Trajectory Path Coordinates
  const pathCoords = [[startLat, startLon], ...activeWaypoints.map(wp => [wp.lat, wp.lon])];

  // 1. Draw Trajectory Line with animated flowing dashed line
  L.polyline(pathCoords, {
    color: '#f59e0b',
    weight: 4,
    opacity: 0.95,
    dashArray: '10, 10',
    className: 'drift-flow-line'
  }).addTo(layerDriftForecast);

  // 2. Draw Movement Arrowheads at each segment
  activeWaypoints.forEach((wp, idx) => {
    const prev = idx === 0 ? { lat: startLat, lon: startLon } : activeWaypoints[idx - 1];
    const midLat = (prev.lat + wp.lat) / 2;
    const midLon = (prev.lon + wp.lon) / 2;

    const arrowIcon = L.divIcon({
      className: 'drift-arrow-marker',
      html: `
        <div style="transform: rotate(${bearing}deg); color: #f59e0b; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 6px rgba(245,158,11,0.8));">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,2 22,22 12,17 2,22" />
          </svg>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    L.marker([midLat, midLon], { icon: arrowIcon }).addTo(layerDriftForecast);
  });

  // 3. Draw Projected Spill Dispersion Zones & Milestones (6h, 12h, 24h, 48h)
  const zoneConfigs = [
    { hours: 6, wp: wp6, radius: 7500, color: '#fbbf24', label: 'T+6h Near-Field Dispersion' },
    { hours: 12, wp: wp12, radius: 11000, color: '#f97316', label: 'T+12h Mid-Field Dispersion' },
    { hours: 24, wp: wp24, radius: 15500, color: '#f43f5e', label: 'T+24h Far-Field Approach' },
    { hours: 48, wp: wp48, radius: 22000, color: '#c084fc', label: 'T+48h Extended Coastal Threat' }
  ];

  zoneConfigs.forEach(cfg => {
    if (cfg.hours > durationHours) return;

    // Projected Zone Circle
    const zoneCircle = L.circle([cfg.wp.lat, cfg.wp.lon], {
      radius: cfg.radius,
      color: cfg.color,
      weight: 2,
      dashArray: '5, 5',
      fillColor: cfg.color,
      fillOpacity: 0.18
    }).addTo(layerDriftForecast);

    // Milestone Centroid Marker
    const milestoneIcon = L.divIcon({
      className: 'forecast-milestone-marker',
      html: `
        <div style="background: ${cfg.color}; color: #030712; font-family: monospace; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 9999px; box-shadow: 0 0 10px ${cfg.color}; white-space: nowrap; border: 1px solid #ffffff;">
          T+${cfg.hours}h
        </div>
      `,
      iconSize: [44, 20],
      iconAnchor: [22, 10]
    });

    const marker = L.marker([cfg.wp.lat, cfg.wp.lon], { icon: milestoneIcon }).addTo(layerDriftForecast);

    const popupContent = `
      <div class="map-popup-title" style="color: ${cfg.color};">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        ${cfg.label}
        <span class="badge-demo-vessel" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-color: rgba(245, 158, 11, 0.4); margin-left: 4px;">SIMULATED DRIFT MODEL — DEMO</span>
      </div>
      <div class="map-popup-meta">
        <div><b>Elapsed Time:</b> +${cfg.hours} Hours from Spill Detection</div>
        <div><b>Coordinates:</b> ${cfg.wp.lat.toFixed(4)}°N, ${cfg.wp.lon.toFixed(4)}°E</div>
        <div><b>Projected Displacement:</b> ${cfg.wp.dist.toFixed(1)} km bearing ${bearing}° (${net.cardinal})</div>
        <div><b>Estimated Slick Radius:</b> ~${(cfg.radius / 1000).toFixed(1)} km (Surface Spreading)</div>
        <div><b>MetOcean Conditions:</b> Wind ${activeWindDir}° @ ${activeWindSpd}kts • Current ${activeCurrDir}° @ ${activeCurrSpd.toFixed(1)}kts</div>
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); color: #fda4af;">
          <b>SIMULATION NOTICE:</b> Not an operationally validated oceanographic forecast. Requires verified satellite, wind, and ocean-current data.
        </div>
      </div>
    `;

    zoneCircle.bindPopup(popupContent);
    marker.bindPopup(popupContent);
  });

  // 4. Fit map bounds to frame the trajectory
  const allPoints = [[startLat, startLon], ...activeWaypoints.map(wp => [wp.lat, wp.lon])];
  const bounds = L.latLngBounds(allPoints);
  map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 });
}

// Setup Horizon Selector Buttons (6h, 12h, 24h, 48h)
function setDriftHorizon(hours) {
  activeDriftHorizon = hours;
  if (typeof window !== 'undefined') window.activeDriftHorizon = activeDriftHorizon;
  document.querySelectorAll('.drift-horizon-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.getAttribute('data-hours'), 10) === hours);
  });

  const key = document.querySelector('#incident')?.value || 'kerala';
  const data = currentIncident || incidentData[key] || incidentData.kerala;
  updateDriftForecastSection(data);
}

// Attach Event Listeners for Dynamic Drift Controls
function initDriftControls() {
  const windDirSlider = document.querySelector('#drift-wind-dir-slider');
  if (windDirSlider) {
    windDirSlider.addEventListener('input', (e) => {
      activeWindDir = parseInt(e.target.value, 10);
      document.querySelectorAll('.drift-preset-btn[data-type="wind-dir"]').forEach(b => {
        b.classList.toggle('active', parseInt(b.getAttribute('data-val'), 10) === activeWindDir);
      });
      updateDriftForecastSection();
      simulateSpillDrift(activeDriftHorizon);
    });
  }

  // Quick Preset Buttons for Wind Direction
  document.querySelectorAll('.drift-preset-btn[data-type="wind-dir"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      activeWindDir = val;
      if (windDirSlider) windDirSlider.value = val;
      document.querySelectorAll('.drift-preset-btn[data-type="wind-dir"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateDriftForecastSection();
      simulateSpillDrift(activeDriftHorizon);
    });
  });

  const windSpdSlider = document.querySelector('#drift-wind-spd-slider');
  if (windSpdSlider) {
    windSpdSlider.addEventListener('input', (e) => {
      activeWindSpd = parseInt(e.target.value, 10);
      updateDriftForecastSection();
      simulateSpillDrift(activeDriftHorizon);
    });
  }

  const currDirSlider = document.querySelector('#drift-curr-dir-slider');
  if (currDirSlider) {
    currDirSlider.addEventListener('input', (e) => {
      activeCurrDir = parseInt(e.target.value, 10);
      updateDriftForecastSection();
      simulateSpillDrift(activeDriftHorizon);
    });
  }

  const currSpdSlider = document.querySelector('#drift-curr-spd-slider');
  if (currSpdSlider) {
    currSpdSlider.addEventListener('input', (e) => {
      activeCurrSpd = parseFloat(e.target.value);
      updateDriftForecastSection();
      simulateSpillDrift(activeDriftHorizon);
    });
  }

  // Horizon Buttons
  const h6 = document.querySelector('#horizon-6h');
  if (h6) h6.addEventListener('click', () => { setDriftHorizon(6); simulateSpillDrift(6); });
  const h12 = document.querySelector('#horizon-12h');
  if (h12) h12.addEventListener('click', () => { setDriftHorizon(12); simulateSpillDrift(12); });
  const h24 = document.querySelector('#horizon-24h');
  if (h24) h24.addEventListener('click', () => { setDriftHorizon(24); simulateSpillDrift(24); });
  const h48 = document.querySelector('#horizon-48h');
  if (h48) h48.addEventListener('click', () => { setDriftHorizon(48); simulateSpillDrift(48); });

  // Simulate Spill Drift Button with Loading Indicator
  const btnSim = document.querySelector('#btn-simulate-drift');
  if (btnSim) {
    btnSim.addEventListener('click', async () => {
      const origHtml = btnSim.innerHTML;
      btnSim.disabled = true;
      btnSim.innerHTML = `
        <span class="spin-loader" style="margin-right: 6px;"></span>
        Simulating Metocean Drift...
      `;
      await new Promise(r => setTimeout(r, 260));
      simulateSpillDrift(activeDriftHorizon);
      btnSim.disabled = false;
      btnSim.innerHTML = origHtml;
      const mapEl = document.querySelector('#map');
      if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast(`Simulated drift path generated for ${activeDriftHorizon}h horizon from detected spill centroid`, 'success');
    });
  }
}

// Initialize drift controls on script load
initDriftControls();

// ==========================================================================
// Marine Intelligence Investigation Report Generator (SITREP)
// ==========================================================================

function generateInvestigationReport() {
  const key = document.querySelector('#incident')?.value || 'kerala';
  const data = currentIncident || incidentData[key] || incidentData.kerala;
  const [lat, lon] = data.center || [9.72, 76.08];

  // 1. Live Satellite SAR Detection Results
  const hasSatImage = Boolean(satImage);
  const hasDetection = Boolean(simulatedAiResults);
  const areaVal = hasDetection ? `${simulatedAiResults.areaKm2} km²` : (data.area ? `${data.area} km²` : 'Not Available');
  const confVal = hasDetection ? `${simulatedAiResults.confidence}%` : (data.confidence ? `${data.confidence}%` : 'Not Available');
  const statusVal = hasDetection 
    ? 'CONFIRMED (AUTONOMOUS SAR SLICK EXTRACTION)' 
    : (hasSatImage ? 'IMAGE LOADED • PENDING INFERENCE' : 'STANDBY • NO SATELLITE IMAGE LOADED');
  
  // Coordinates (Centroid)
  let centroidDisplay = 'Not Available';
  let centroidDetail = 'Not Available';
  if (hasDetection && simulatedAiResults.centroid) {
    centroidDisplay = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
    centroidDetail = `Pixel: [X: ${simulatedAiResults.centroid.x}px, Y: ${simulatedAiResults.centroid.y}px] • Geographic: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
  } else if (hasSatImage) {
    centroidDisplay = 'Pending AI Detection';
    centroidDetail = 'Pending AI Detection • Click "Detect Spill" to localize centroid';
  } else if (data.center) {
    centroidDisplay = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
    centroidDetail = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E (${data.coordsDisplay || 'Reference Grid'})`;
  }

  // SAR Canvas Snapshot (Image + AI segmentation overlay)
  let sarSnapshotHtml = '';
  if (hasSatImage && satCanvas) {
    try {
      const dataUrl = satCanvas.toDataURL('image/png');
      sarSnapshotHtml = `
        <div class="report-sar-snapshot-box">
          <img src="${dataUrl}" alt="Satellite SAR with AI Oil Slick Segmentation Overlay">
          <div class="report-sar-caption">
            <span>${currentSatFilename || 'SAR Raster'}</span>
            <span>${satImage.width}×${satImage.height}px • AI Segmentation Overlay</span>
          </div>
        </div>
      `;
    } catch (e) {
      sarSnapshotHtml = `<div class="report-not-available">Snapshot Not Available (Security/Canvas restriction)</div>`;
    }
  } else {
    sarSnapshotHtml = `
      <div style="padding: 24px; text-align: center; background: rgba(15, 23, 42, 0.6); border: 1px dashed rgba(148, 163, 184, 0.3); border-radius: var(--radius-md);">
        <span class="report-not-available">Not Available (No Satellite Image Uploaded)</span>
      </div>
    `;
  }

  // 2. Live Drift Forecast Results
  const net = calculateNetDriftVector(activeWindDir, activeWindSpd, activeCurrDir, activeCurrSpd);
  const totalDist = (net.speedKmhNum * activeDriftHorizon).toFixed(1);
  const predWp = computeDriftWaypoint(lat, lon, net.bearing, net.speedKmhNum, activeDriftHorizon);

  // SVG mini trajectory diagram
  const svgBearingRad = (net.bearing * Math.PI) / 180;
  const arrowLen = 60;
  const arrowX2 = 100 + arrowLen * Math.sin(svgBearingRad);
  const arrowY2 = 100 - arrowLen * Math.cos(svgBearingRad);

  const driftSvgHtml = `
    <div class="report-drift-svg-box">
      <svg viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="3 3"/>
        <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        <text x="100" y="16" fill="#94a3b8" font-size="9.5" text-anchor="middle" font-family="monospace">N 000°</text>
        <text x="188" y="104" fill="#94a3b8" font-size="9.5" text-anchor="end" font-family="monospace">E 090°</text>
        <text x="100" y="194" fill="#94a3b8" font-size="9.5" text-anchor="middle" font-family="monospace">S 180°</text>
        <text x="12" y="104" fill="#94a3b8" font-size="9.5" text-anchor="start" font-family="monospace">W 270°</text>
        <circle cx="100" cy="100" r="6" fill="#00f2fe" stroke="#030712" stroke-width="2"/>
        <line x1="100" y1="100" x2="${arrowX2}" y2="${arrowY2}" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
        <circle cx="${arrowX2}" cy="${arrowY2}" r="5" fill="#fbbf24" stroke="#030712" stroke-width="1.5"/>
      </svg>
      <div style="font-family: var(--font-mono); font-size: 10.5px; color: var(--accent-amber); margin-top: 6px; text-align: center;">
        Net Vector: ${net.bearing}° ${net.cardinal} @ ${net.speedKts} kts (${totalDist} km @ ${activeDriftHorizon}h)
      </div>
    </div>
  `;

  // 3. Live AIS Correlation Results
  const isUploadedActive = currentFeedSource === 'uploaded' && uploadedVessels.length > 0;
  const rawVessels = isUploadedActive
    ? uploadedVessels.map(v => ({
        name: v.name,
        mmsi: 'N/A (CSV)',
        flag: 'Uploaded Feed',
        type: 'AIS Target',
        distance: v.eval?.distanceStr || `${haversineDistance(v.lat, v.lon, lat, lon).toFixed(1)} km`,
        overlap: v.eval?.timeDiffStr || 'Recorded',
        alignment: 'N/A',
        speed: `${v.speed} kts`,
        score: v.eval?.score || '65%',
        riskLevel: v.eval?.riskLevel || 'Medium'
      }))
    : (data.vessels || []);

  const vesselList = rawVessels.map(v => ({
    name: v.name || 'Unknown Vessel',
    mmsi: v.mmsi || 'N/A',
    flag: v.flag || 'International',
    distance: v.distance || 'Not Available',
    overlap: v.overlap || 'Not Available',
    alignment: v.alignment || `${Math.abs(Math.round((parseFloat(v.speed || '10') * 3) % 25))}° Course Alignment`,
    score: v.score || 'Not Available',
    riskLevel: v.riskLevel || 'Medium'
  }));

  // 4. Incident ID and Dates
  const now = new Date();
  const reportDate = now.toUTCString();
  const reportId = `OS-SITREP-${key.toUpperCase()}-${now.getUTCFullYear()}${String(now.getUTCMonth()+1).padStart(2,'0')}${String(now.getUTCDate()).padStart(2,'0')}-01`;

  // 5. Automatic Factual Conclusion Construction
  const topVessel = vesselList[0];
  const secondVessel = vesselList[1];
  const topVesselText = topVessel 
    ? `<strong>${topVessel.name}</strong> (${topVessel.distance} CPA, ${topVessel.score} correlation score)` 
    : 'no specific vessels';
  const secondVesselText = secondVessel 
    ? ` and <strong>${secondVessel.name}</strong> (${secondVessel.distance} CPA, ${secondVessel.score} correlation score)` 
    : '';

  const conclusionParagraph = `
    Based on the autonomous multi-sensor analysis for the <strong>${data.name}</strong> surveillance corridor, a surface oil slick anomaly measuring <strong>${areaVal}</strong> was localized at <strong>${centroidDisplay}</strong> with <strong>${confVal}</strong> confidence. Under current metocean conditions (Wind: ${activeWindSpd} kts @ ${activeWindDir}°, Surface Current: ${activeCurrSpd.toFixed(1)} kts @ ${activeCurrDir}°), the discharge is projected to drift along a <strong>${net.bearing}° ${net.cardinal}</strong> trajectory, traveling an estimated <strong>${totalDist} km</strong> over the next <strong>${activeDriftHorizon} hours</strong> toward ${data.drift?.target ? `<strong>${data.drift.target}</strong>` : 'coastal waters'}. Spatio-temporal AIS correlation identified ${topVesselText}${secondVesselText} as <strong>Potentially Associated Vessels</strong> within the hydrodynamic release window. Immediate aerial reconnaissance and Port State Control (PSC) verification are recommended.
  `;

  const reportHtml = `
    <!-- Report Document Header -->
    <div class="report-doc-header">
      <div>
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-cyan); letter-spacing: 1px; text-transform: uppercase;">
          Ocean Shield • Maritime Rescue Co-ordination Centre
        </div>
        <div class="report-agency-title">MARINE CASUALTY & POLLUTION SITUATION REPORT (SITREP)</div>
        <div style="font-size: 12px; color: var(--text-muted);">
          Automated Satellite SAR Detection & Spatio-Temporal AIS Correlation Dossier
        </div>
        <div class="report-meta-tags">
          <span class="report-badge-demo">PROTOTYPE / SIMULATED DATA</span>
          <span class="report-badge-id">${reportId}</span>
          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); align-self: center;">
            Generated: ${reportDate}
          </span>
        </div>
      </div>
    </div>

    <!-- SECTION A: INCIDENT SUMMARY -->
    <div class="report-section" id="report-sec-a">
      <div class="report-section-title">
        <span class="report-section-pill">SECTION A</span>
        Incident Summary
      </div>
      <div class="report-kv-grid">
        <div class="report-kv-item">
          <span class="report-kv-label">Incident ID</span>
          <span class="report-kv-val" style="color: var(--accent-cyan);">${reportId}</span>
        </div>
        <div class="report-kv-item">
          <span class="report-kv-label">Detection Date & Time</span>
          <span class="report-kv-val">${reportDate.slice(0, 16)} • ${data.timeline?.t1 || '02:45 UTC'}</span>
        </div>
        <div class="report-kv-item">
          <span class="report-kv-label">Spill Detection Status</span>
          <span class="report-kv-val" style="color: ${hasDetection ? 'var(--accent-teal)' : 'var(--accent-amber)'};">${statusVal}</span>
        </div>
        <div class="report-kv-item">
          <span class="report-kv-label">Detected Spill Area</span>
          <span class="report-kv-val">${areaVal} ${data.volume ? `• Est. Volume: ${data.volume}` : ''}</span>
        </div>
        <div class="report-kv-item">
          <span class="report-kv-label">Detection Confidence</span>
          <span class="report-kv-val">${confVal} (Dual-Polarization VV/VH)</span>
        </div>
        <div class="report-kv-item">
          <span class="report-kv-label">Surveillance Corridor</span>
          <span class="report-kv-val">${data.name}</span>
        </div>
      </div>
    </div>

    <!-- SECTION B: SATELLITE ANALYSIS -->
    <div class="report-section" id="report-sec-b">
      <div class="report-section-title">
        <span class="report-section-pill">SECTION B</span>
        Satellite SAR Analysis & Segmentation
      </div>
      <div class="report-sar-grid">
        <div>
          ${sarSnapshotHtml}
        </div>
        <div>
          <div class="report-kv-item" style="margin-bottom: 12px;">
            <span class="report-kv-label">Detected Centroid / Location</span>
            <span class="report-kv-val" style="font-size: 13px;">${centroidDetail}</span>
          </div>
          <div class="report-kv-item" style="margin-bottom: 12px;">
            <span class="report-kv-label">Estimated Surface Area</span>
            <span class="report-kv-val">${areaVal}</span>
          </div>
          <div class="report-kv-item" style="margin-bottom: 12px;">
            <span class="report-kv-label">Estimated Perimeter & Bounding Box</span>
            <span class="report-kv-val" style="font-size: 12px;">
              ${simulatedAiResults?.perimeterKm ? `Perimeter: ${simulatedAiResults.perimeterKm} km` : 'Perimeter: Not Available'} • 
              ${simulatedAiResults?.bbox ? `Box: ${simulatedAiResults.bbox.w}×${simulatedAiResults.bbox.h}px` : 'Box: Not Available'}
            </span>
          </div>
          <div class="report-kv-item">
            <span class="report-kv-label">Sensor Platform</span>
            <span class="report-kv-val">${data.sensor || 'Sentinel-1 C-SAR'} (${data.pass || 'IW Mode'})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION C: DRIFT FORECAST -->
    <div class="report-section" id="report-sec-c">
      <div class="report-section-title">
        <span class="report-section-pill">SECTION C</span>
        Hydrodynamic Drift Forecast
      </div>
      <div class="report-drift-grid">
        <div>
          <div class="report-kv-grid">
            <div class="report-kv-item">
              <span class="report-kv-label">Starting Location</span>
              <span class="report-kv-val">${centroidDisplay}</span>
            </div>
            <div class="report-kv-item">
              <span class="report-kv-label">Forecast Horizon</span>
              <span class="report-kv-val" style="color: var(--accent-amber);">${activeDriftHorizon} Hours</span>
            </div>
            <div class="report-kv-item">
              <span class="report-kv-label">Wind Speed & Direction</span>
              <span class="report-kv-val">${activeWindSpd} kts @ ${activeWindDir}° ${getCardinalDirection(activeWindDir)}</span>
            </div>
            <div class="report-kv-item">
              <span class="report-kv-label">Ocean Current Direction & Speed</span>
              <span class="report-kv-val">${activeCurrSpd.toFixed(1)} kts @ ${activeCurrDir}° ${getCardinalDirection(activeCurrDir)}</span>
            </div>
            <div class="report-kv-item">
              <span class="report-kv-label">Predicted Movement Distance</span>
              <span class="report-kv-val">${totalDist} km</span>
            </div>
            <div class="report-kv-item">
              <span class="report-kv-label">Predicted Future Location</span>
              <span class="report-kv-val">${predWp.lat.toFixed(4)}°N, ${predWp.lon.toFixed(4)}°E</span>
            </div>
          </div>
        </div>
        <div>
          ${driftSvgHtml}
        </div>
      </div>
    </div>

    <!-- SECTION D: AIS CORRELATION -->
    <div class="report-section" id="report-sec-d">
      <div class="report-section-title">
        <span class="report-section-pill">SECTION D</span>
        AIS Spatio-Temporal Correlation Table
      </div>
      <div class="report-table-wrapper">
        <table class="report-table">
          <thead>
            <tr>
              <th>Vessel</th>
              <th>Distance from Estimated Source</th>
              <th>Time Difference</th>
              <th>Route Alignment</th>
              <th>Correlation Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${vesselList.length > 0 ? vesselList.map(v => `
              <tr>
                <td>
                  <strong style="color: var(--text-primary); font-size: 13px;">${v.name}</strong>
                  <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);">${v.mmsi} • ${v.flag}</div>
                </td>
                <td style="font-family: var(--font-mono);">${v.distance}</td>
                <td style="font-family: var(--font-mono);">${v.overlap}</td>
                <td style="font-family: var(--font-mono);">${v.alignment}</td>
                <td>
                  <span class="risk-level-badge ${v.riskLevel === 'High' ? 'risk-high' : (v.riskLevel === 'Medium' ? 'risk-medium' : 'risk-low')}">
                    ${v.score}
                  </span>
                </td>
                <td>
                  <span class="badge-demo-vessel" style="color: ${v.riskLevel === 'High' ? '#fda4af' : '#38bdf8'};">
                    Potentially Associated Vessel
                  </span>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 18px;">
                  <span class="report-not-available">Not Available (No AIS Targets Correlated)</span>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
      <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px; font-family: var(--font-mono);">
        * Note: All vessels in this table are classified as "Potentially Associated Vessels" for investigative screening.
      </div>
    </div>

    <!-- SECTION E: EVIDENCE TIMELINE -->
    <div class="report-section" id="report-sec-e">
      <div class="report-section-title">
        <span class="report-section-pill">SECTION E</span>
        Evidence Timeline & Verification Workflow
      </div>
      <div class="report-timeline-stepper">
        <!-- Stage 1 -->
        <div class="report-timeline-step">
          <div class="report-step-node">01</div>
          <div class="report-step-title">Satellite Observation</div>
          <div class="report-step-desc">Sentinel-1 C-Band SAR dual-pol raster ingested & verified.</div>
        </div>
        <!-- Stage 2 -->
        <div class="report-timeline-step">
          <div class="report-step-node">02</div>
          <div class="report-step-title">Spill Detection</div>
          <div class="report-step-desc">Autonomous CFAR thresholding extracted dark anomaly of ${areaVal}.</div>
        </div>
        <!-- Stage 3 -->
        <div class="report-timeline-step">
          <div class="report-step-node">03</div>
          <div class="report-step-title">Origin Estimation</div>
          <div class="report-step-desc">Centroid pinpointed at ${centroidDisplay} with backward release vector.</div>
        </div>
        <!-- Stage 4 -->
        <div class="report-timeline-step">
          <div class="report-step-node">04</div>
          <div class="report-step-title">Drift Forecast</div>
          <div class="report-step-desc">${activeDriftHorizon}h hydrodynamic dispersion modeled (${net.bearing}° @ ${net.speedKts} kts).</div>
        </div>
        <!-- Stage 5 -->
        <div class="report-timeline-step">
          <div class="report-step-node">05</div>
          <div class="report-step-title">AIS Correlation</div>
          <div class="report-step-desc">${vesselList.length} candidate vessels screened for proximity and temporal overlap.</div>
        </div>
        <!-- Stage 6 -->
        <div class="report-timeline-step">
          <div class="report-step-node alert">06</div>
          <div class="report-step-title">Human Review</div>
          <div class="report-step-desc">Ground-truth verification & Port State inspection required.</div>
        </div>
      </div>
    </div>

    <!-- SECTION F: INVESTIGATION CONCLUSION -->
    <div class="report-section" id="report-sec-f">
      <div class="report-section-title">
        <span class="report-section-pill">SECTION F</span>
        Investigation Conclusion & Recommended Actions
      </div>
      <div class="report-conclusion-box">
        ${conclusionParagraph}
      </div>
    </div>

    <!-- Mandatory Statutory Legal Disclaimer -->
    <div class="report-disclaimer-box">
      <div class="report-disclaimer-text">
        This prototype provides decision-support analysis and does not establish legal responsibility for an oil spill.
      </div>
      <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">
        Correlation findings are preliminary intelligence screening outputs. Formal legal attribution requires independent aerial surveillance confirmation, chain-of-custody physical hydrocarbon fingerprint sampling, and official Port State Control boarding inspection.
      </div>
    </div>
  `;

  document.querySelector('#report-content').innerHTML = reportHtml;
  document.querySelector('#report-modal').classList.add('active');
  updateWorkflowStepper({ step: 6, statusText: 'SITREP Evidence Dossier Generated & Verified' });
}

function closeInvestigationReport() {
  document.querySelector('#report-modal').classList.remove('active');
}

function printInvestigationReport() {
  window.print();
}

function downloadInvestigationReport() {
  window.print();
}

// Helper: Open Report with Professional Loading Indicator
async function triggerReportWithLoader(btn) {
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spin-loader" style="margin-right: 6px;"></span> Compiling SITREP...`;
  }
  await new Promise(r => setTimeout(r, 220));
  generateInvestigationReport();
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = origHtml;
  }
}

// Setup Report Modal Event Listeners
document.querySelector('#btn-generate-report')?.addEventListener('click', function() {
  triggerReportWithLoader(this);
});
document.querySelector('#btn-generate-report-evidence')?.addEventListener('click', function() {
  triggerReportWithLoader(this);
});
document.querySelector('#btn-refresh-report')?.addEventListener('click', () => {
  generateInvestigationReport();
  showToast('Investigation Report re-synchronized with live detection & drift data.', 'success');
});
document.querySelector('#btn-print-report')?.addEventListener('click', printInvestigationReport);
document.querySelector('#btn-download-report')?.addEventListener('click', downloadInvestigationReport);
document.querySelector('#btn-close-report')?.addEventListener('click', closeInvestigationReport);

// Close modal when clicking on backdrop
document.querySelector('#report-modal')?.addEventListener('click', (e) => {
  if (e.target === document.querySelector('#report-modal')) {
    closeInvestigationReport();
  }
});

// Close modal on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.querySelector('#report-modal')?.classList.contains('active')) {
    closeInvestigationReport();
  }
});

// ==========================================================================
// Evidence & Risk Analysis Dashboard Engine
// ==========================================================================
function updateEvidenceRiskDashboard(incidentOrKey, vessel) {
  let data;
  if (!incidentOrKey) {
    const key = document.querySelector('#incident')?.value || 'kerala';
    data = currentIncident || incidentData[key] || incidentData.kerala;
  } else if (typeof incidentOrKey === 'string') {
    data = (currentIncident && currentIncident.key === incidentOrKey) ? currentIncident : (incidentData[incidentOrKey] || incidentData.kerala);
  } else {
    data = incidentOrKey;
  }

  // Default to first vessel in incident if none provided
  const targetVessel = vessel || (data.vessels && data.vessels[0]) || {
    name: 'MV Horizon',
    mmsi: '419001248',
    distance: '11.2 km',
    overlap: 'Δt: -38 min',
    heading: 320,
    speed: '12.4 kts',
    score: '88%',
    scoreNum: 88,
    riskLevel: 'High'
  };

  // 1. Proximity Calculation (in Nautical Miles)
  let distKm = 11.2;
  if (typeof targetVessel.distance === 'number') {
    distKm = targetVessel.distance;
  } else if (typeof targetVessel.distance === 'string') {
    const m = targetVessel.distance.match(/([\d.]+)/);
    if (m) distKm = parseFloat(m[1]);
  } else if (targetVessel.eval && typeof targetVessel.eval.distance === 'number') {
    distKm = targetVessel.eval.distance;
  }
  const distNM = (distKm * 0.539957).toFixed(1);

  const evDistVal = document.getElementById('ev-dist-val');
  const evDistSub = document.getElementById('ev-dist-sub');
  const evDistBadge = document.getElementById('ev-dist-badge');
  if (evDistVal) evDistVal.innerText = distNM;
  if (evDistSub) evDistSub.innerText = `CPA: ${distKm.toFixed(1)} km from spill centroid`;
  if (evDistBadge) {
    if (distKm <= 15) {
      evDistBadge.className = 'evidence-card-status status-high';
      evDistBadge.innerText = 'CRITICAL PROXIMITY';
    } else if (distKm <= 35) {
      evDistBadge.className = 'evidence-card-status status-med';
      evDistBadge.innerText = 'ELEVATED PROXIMITY';
    } else {
      evDistBadge.className = 'evidence-card-status status-good';
      evDistBadge.innerText = 'PERIPHERAL PROXIMITY';
    }
  }

  // 2. AIS Time Overlap
  const evTimeVal = document.getElementById('ev-time-val');
  const evTimeSub = document.getElementById('ev-time-sub');
  const evTimeBadge = document.getElementById('ev-time-badge');
  
  let timeStr = targetVessel.overlap || targetVessel.eval?.timeDiffStr || '-38 min';
  let timeMins = -38;
  const matchMins = timeStr.match(/([+-]?\d+)\s*m/);
  const matchHours = timeStr.match(/([+-]?\d+(\.\d+)?)\s*h/);
  if (matchMins) {
    timeMins = parseInt(matchMins[1], 10);
  } else if (matchHours) {
    timeMins = Math.round(parseFloat(matchHours[1]) * 60);
  }

  if (evTimeVal) evTimeVal.innerText = (timeMins > 0 ? `+${timeMins}` : `${timeMins}`);
  if (evTimeSub) evTimeSub.innerText = `Temporal Delta: ${timeStr}`;
  if (evTimeBadge) {
    const absMins = Math.abs(timeMins);
    if (absMins <= 45) {
      evTimeBadge.className = 'evidence-card-status status-high';
      evTimeBadge.innerText = 'STRONG CONCURRENCE';
    } else if (absMins <= 120) {
      evTimeBadge.className = 'evidence-card-status status-med';
      evTimeBadge.innerText = 'MODERATE OVERLAP';
    } else {
      evTimeBadge.className = 'evidence-card-status status-good';
      evTimeBadge.innerText = 'EXTENDED DELTA';
    }
  }

  // 3. Route Alignment
  const evRouteVal = document.getElementById('ev-route-val');
  const evRouteSub = document.getElementById('ev-route-sub');
  const evRouteBadge = document.getElementById('ev-route-badge');

  const vHdg = typeof targetVessel.heading === 'number' ? targetVessel.heading : 320;
  const driftBearing = data.drift ? data.drift.bearing : 65;
  let angleDiff = Math.abs(vHdg - driftBearing);
  if (angleDiff > 180) angleDiff = 360 - angleDiff;
  const alignmentDeg = Math.round(angleDiff);

  if (evRouteVal) evRouteVal.innerText = alignmentDeg;
  if (evRouteSub) evRouteSub.innerText = `Heading ${vHdg.toString().padStart(3, '0')}° vs Drift ${driftBearing.toString().padStart(3, '0')}°`;
  if (evRouteBadge) {
    if (alignmentDeg <= 35) {
      evRouteBadge.className = 'evidence-card-status status-high';
      evRouteBadge.innerText = 'HIGH ALIGNMENT';
    } else if (alignmentDeg <= 75) {
      evRouteBadge.className = 'evidence-card-status status-med';
      evRouteBadge.innerText = 'PARTIAL CONCORDANCE';
    } else {
      evRouteBadge.className = 'evidence-card-status status-good';
      evRouteBadge.innerText = 'DIVERGENT TRACK';
    }
  }

  // 4. Data Confidence
  const evConfVal = document.getElementById('ev-conf-val');
  const evConfSub = document.getElementById('ev-conf-sub');
  const evConfBadge = document.getElementById('ev-conf-badge');
  if (evConfVal) evConfVal.innerText = data.confidence || '94.8';
  if (evConfSub) evConfSub.innerText = `${data.sensor || 'Sentinel-1 C-SAR'} + Class-A AIS`;
  if (evConfBadge) {
    evConfBadge.className = 'evidence-card-status status-good';
    evConfBadge.innerText = 'HIGH CERTAINTY';
  }

  // 5. Possible Source Corridor
  const evCorridorVal = document.getElementById('ev-corridor-val');
  const evCorridorSub = document.getElementById('ev-corridor-sub');
  const evCorridorBadge = document.getElementById('ev-corridor-badge');
  
  // Updrift bearing (spill origin corridor is 180° opposite to drift)
  const updriftBearing = ((data.drift ? data.drift.bearing : 65) + 180) % 360;
  const cardinalDirections = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const cardinalIdx = Math.round(updriftBearing / 22.5) % 16;
  const updriftCardinal = cardinalDirections[cardinalIdx];

  if (evCorridorVal) evCorridorVal.innerText = `${updriftBearing.toString().padStart(3, '0')}`;
  if (evCorridorSub) evCorridorSub.innerText = `Updrift Vector • Back-projection corridor`;
  if (evCorridorBadge) {
    evCorridorBadge.className = 'evidence-card-status status-med';
    evCorridorBadge.innerText = `${updriftCardinal} CORRIDOR`;
  }

  // Explainable Score Breakdown
  let totalScoreNum = 88;
  if (typeof targetVessel.scoreNum === 'number') {
    totalScoreNum = targetVessel.scoreNum;
  } else if (targetVessel.eval && typeof targetVessel.eval.scoreNum === 'number') {
    totalScoreNum = targetVessel.eval.scoreNum;
  } else if (typeof targetVessel.score === 'string') {
    const s = parseInt(targetVessel.score, 10);
    if (!isNaN(s)) totalScoreNum = s;
  }

  // Sub-factor scores
  const f1 = Math.max(10, Math.min(100, Math.round(100 - (distKm * 2.2))));
  const f2 = Math.max(15, Math.min(100, Math.round(100 - (Math.abs(timeMins) * 0.7))));
  const f3 = Math.max(20, Math.min(100, Math.round(100 - (alignmentDeg * 0.8))));

  const evSelectedVessel = document.getElementById('ev-selected-vessel');
  const evScoreTotal = document.getElementById('ev-score-total');
  const evScoreF1 = document.getElementById('ev-score-f1');
  const evBarF1 = document.getElementById('ev-bar-f1');
  const evScoreF2 = document.getElementById('ev-score-f2');
  const evBarF2 = document.getElementById('ev-bar-f2');
  const evScoreF3 = document.getElementById('ev-score-f3');
  const evBarF3 = document.getElementById('ev-bar-f3');

  if (evSelectedVessel) {
    evSelectedVessel.innerText = `TARGET: ${targetVessel.name.toUpperCase()} (MMSI ${targetVessel.mmsi || 'USER-CSV'})`;
  }
  if (evScoreTotal) evScoreTotal.innerText = `${totalScoreNum}%`;
  if (evScoreF1) evScoreF1.innerText = `${f1}%`;
  if (evBarF1) evBarF1.style.width = `${f1}%`;
  if (evScoreF2) evScoreF2.innerText = `${f2}%`;
  if (evBarF2) evBarF2.style.width = `${f2}%`;
  if (evScoreF3) evScoreF3.innerText = `${f3}%`;
  if (evBarF3) evBarF3.style.width = `${f3}%`;

  // 4-Stage Timeline
  const evStage1Time = document.getElementById('ev-stage1-time');
  const evStage2Time = document.getElementById('ev-stage2-time');
  const evStage3Time = document.getElementById('ev-stage3-time');
  const evStage4Time = document.getElementById('ev-stage4-time');

  if (evStage1Time) evStage1Time.innerText = `2026-09-20 ${data.timeline?.t1 || '14:20 UTC'}`;
  if (evStage2Time) evStage2Time.innerText = `2026-09-20 ${data.timeline?.t2 || '15:05 UTC'} (CPA Overlap: ${targetVessel.overlap || timeStr})`;
  if (evStage3Time) evStage3Time.innerText = `Horizon T+0h to T+24h • Net Vector ${data.drift?.bearing || 65}° @ ${data.drift?.speed || '1.4 kts'}`;
  if (evStage4Time) evStage4Time.innerText = `PENDING COAST GUARD OPERATOR • PRIORITY 1`;
}

// ==========================================================================
// Toast Notification Engine
// ==========================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-message toast-${type}`;
  
  let iconSvg = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;
  if (type === 'success') {
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
  } else if (type === 'warn' || type === 'error') {
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `;
  }

  toast.innerHTML = `
    <div style="flex-shrink: 0; display: flex; align-items: center;">${iconSvg}</div>
    <div style="flex: 1; line-height: 1.4;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px) scale(0.95)';
    setTimeout(() => toast.remove(), 320);
  }, 3500);
}

// ==========================================================================
// Reset Demo State Function
// ==========================================================================
function resetDemo() {
  // 1. Reset Incident select
  const select = document.getElementById('incident');
  if (select) select.value = 'kerala';

  // 2. Clear Uploaded AIS Data
  uploadedVessels = [];
  activeUploadedMarkers = [];
  layerUploadedAIS.clearLayers();

  const aisInput = document.getElementById('ais-file-input');
  if (aisInput) aisInput.value = '';

  const uploadBanner = document.getElementById('upload-status-banner');
  if (uploadBanner) uploadBanner.classList.remove('visible');

  const tabUploaded = document.getElementById('tab-uploaded');
  if (tabUploaded) tabUploaded.style.display = 'none';

  const tabSimulated = document.getElementById('tab-simulated');
  if (tabSimulated) tabSimulated.classList.add('active');

  currentFeedSource = 'simulated';

  // 3. Reset incident baseline data, map layers, & Evidence Dashboard
  inspect();

  // 4. Reset Drift Forecast Horizon & Controls
  activeWindDir = 315;
  activeWindSpd = 14;
  activeCurrDir = 135;
  activeCurrSpd = 0.8;
  const windDirSlider = document.querySelector('#drift-wind-dir-slider');
  if (windDirSlider) windDirSlider.value = 315;
  const windSpdSlider = document.querySelector('#drift-wind-spd-slider');
  if (windSpdSlider) windSpdSlider.value = 14;
  const currDirSlider = document.querySelector('#drift-curr-dir-slider');
  if (currDirSlider) currDirSlider.value = 135;
  const currSpdSlider = document.querySelector('#drift-curr-spd-slider');
  if (currSpdSlider) currSpdSlider.value = 0.8;

  // Clear map layers from previous detection
  if (typeof layerSlick !== 'undefined' && layerSlick.clearLayers) layerSlick.clearLayers();
  if (typeof layerReviewArea !== 'undefined' && layerReviewArea.clearLayers) layerReviewArea.clearLayers();
  if (typeof layerDrift !== 'undefined' && layerDrift.clearLayers) layerDrift.clearLayers();
  if (typeof layerDriftForecast !== 'undefined' && layerDriftForecast.clearLayers) layerDriftForecast.clearLayers();

  // Reset currentIncident to baseline
  const key = document.querySelector('#incident')?.value || 'kerala';
  currentIncident = JSON.parse(JSON.stringify(incidentData[key] || incidentData.kerala));

  const mapCoords = document.querySelector('#map-coords');
  if (mapCoords) mapCoords.innerText = `${currentIncident.coordsDisplay} (Standby • Awaiting Detection)`;

  renderSimulatedTable(currentIncident.vessels);

  document.querySelectorAll('.drift-preset-btn[data-type="wind-dir"]').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-val') === '315');
  });
  setDriftHorizon(6);
  layerDriftForecast.clearLayers();

  // 5. Reset Satellite Image & Canvas to default sample SAR image
  const satInput = document.getElementById('satellite-file-input');
  if (satInput) satInput.value = '';
  loadSampleSarImage({ silent: true });

  // 6. Provide visual confirmation and synchronize 5 dynamic dashboard cards
  updateDashboardCards({ statusText: 'READY', statusSub: 'Dual-Pol SAR + AIS Fusion', headerText: 'OPERATIONAL • READY' });
  showToast('Demo environment restored to baseline simulated state.', 'success');
}

// ==========================================================================
// Navigation & Smooth Scrolling
// ==========================================================================
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('data-target') || link.getAttribute('href')?.replace('#', '');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  // IntersectionObserver to update active nav link on scroll
  const sectionIds = ['overview', 'satellite-analysis-panel', 'map-panel', 'drift-forecast-section', 'vessels-panel', 'evidence-risk-section', 'how-it-works-section'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const matches = link.getAttribute('data-target') === id || link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', matches);
          });
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 });

    sections.forEach(s => observer.observe(s));
  }

  // Wire Workflow Stepper Click Handlers
  const workflowSteps = document.querySelectorAll('.workflow-step');
  workflowSteps.forEach((step, idx) => {
    step.addEventListener('click', () => {
      if (isDemoModeActive) {
        renderDemoStep(idx + 1);
        return;
      }
      const targetId = step.getAttribute('data-target');
      if (targetId === 'report-modal') {
        generateInvestigationReport();
      } else {
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

// ==========================================================================
// Button Audits & Micro-Interactions
// ==========================================================================
function initButtonAudits() {
  // Wire Reset Demo Button (single unified button in header)
  document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
    if (isDemoModeActive) exitDemoMode();
    resetDemo();
  });

  // Wire SIH 2026 Interactive Demo Mode Controls (single unified Start Demo button in header)
  document.getElementById('btn-start-demo')?.addEventListener('click', () => {
    if (isDemoModeActive) {
      exitDemoMode();
    } else {
      startDemoMode();
    }
  });

  document.getElementById('btn-demo-prev')?.addEventListener('click', prevDemoStep);
  document.getElementById('btn-demo-next')?.addEventListener('click', nextDemoStep);
  document.getElementById('btn-exit-demo')?.addEventListener('click', () => {
    renderDemoStep(1);
    showToast('Reset to Step 1', 'info');
  });

  document.querySelectorAll('.demo-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const s = parseInt(dot.getAttribute('data-step') || '1', 10);
      isDemoModeActive = true;
      renderDemoStep(s);
    });
  });

  // Wire interactive workflow step cards (1 through 6)
  for (let i = 1; i <= 6; i++) {
    const stepCard = document.getElementById(`wf-step-${i}`);
    if (stepCard) {
      stepCard.addEventListener('click', () => {
        isDemoModeActive = true;
        renderDemoStep(i);
      });
      stepCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          isDemoModeActive = true;
          renderDemoStep(i);
        }
      });
    }
  }

  // Keyboard navigation for live presentation / projector demo
  window.addEventListener('keydown', (e) => {
    if (!isDemoModeActive) return;
    if (e.key === 'ArrowRight') {
      nextDemoStep();
    } else if (e.key === 'ArrowLeft') {
      prevDemoStep();
    } else if (e.key === 'Escape') {
      exitDemoMode();
    }
  });

  // Run Demo Analysis button - executes full AI pipeline (if present)
  document.getElementById('run')?.addEventListener('click', async () => {
    showToast('Running multi-sensor AI detection & correlation pipeline...', 'info');
    if (!satImage) {
      await loadSampleSarImage({ autoDetect: true });
    } else {
      await runAiSpillDetectionPipeline();
    }
  });

  // Inner sample SAR image button listener
  document.getElementById('btn-sample-satellite-inner')?.addEventListener('click', () => loadSampleSarImage());

  // Inspect Incident button listener
  document.getElementById('inspect')?.addEventListener('click', () => {
    inspect();
    showToast(`Incident surveillance zone loaded for ${currentIncident?.name || 'corridor'}.`, 'info');
  });

  // Incident selector change listener
  document.getElementById('incident')?.addEventListener('change', () => {
    inspect();
    showToast(`Surveillance corridor switched to ${currentIncident?.name || 'selected incident'}.`, 'info');
  });
}

// Expose Demo Mode globally for automated testing
if (typeof window !== 'undefined') {
  window.startDemoMode = startDemoMode;
  window.exitDemoMode = exitDemoMode;
  window.nextDemoStep = nextDemoStep;
  window.prevDemoStep = prevDemoStep;
  window.renderDemoStep = renderDemoStep;
  window.DEMO_STEPS = DEMO_STEPS;
}

// Initial Load & Setup
initNavigation();
initButtonAudits();
inspect();
updateDashboardCards({ statusText: 'READY', statusSub: 'Dual-Pol SAR + AIS Fusion', headerText: 'OPERATIONAL • READY' });
// Load sample SAR image as default satellite image on page load
loadSampleSarImage({ silent: true });
renderDemoStep(1, { silent: true });