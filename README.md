# Ocean Shield — Marine Intelligence & Satellite Oil Spill Investigation Platform

> **Smart India Hackathon (SIH) Prototype**  
> *Satellite-Based Synthetic Aperture Radar (SAR) Oil Spill Detection and Spatio-Temporal AIS Vessel Correlation Engine*

---

## 🌊 Overview

**Ocean Shield** is an operational marine intelligence platform engineered to detect maritime oil slicks from satellite synthetic aperture radar (SAR) imagery and perform retrospective spatio-temporal trajectory correlation against Automatic Identification System (AIS) vessel traffic to screen potentially associated vessels.

---

## 🎯 Smart India Hackathon Features

1. **Cinematic Dark Ocean Command Center**:
   - Modern, high-contrast dark ocean UI built with glassmorphic panels, CSS custom design tokens, and military/maritime telemetry styling.
   - Fully responsive across desktop workstations, laptops, tablets, and mobile screens.

2. **Geospatial Incident Map**:
   - Free and open-source **Leaflet.js** engine utilizing **CartoDB Dark Matter** tiles (derived from OpenStreetMap).
   - Multi-vertex radar dark slick geometry with animated radar pulse halos.
   - AIS vessel targets with heading-oriented markers and popup intelligence dossiers.
   - Historical vessel transit tracks (dashed trajectory vectors) crossing through the spill release zone.
   - Directional hydrodynamic net drift vectors with wind/current drift markers.
   - Dynamic map layer toggles (SAR Slick, AIS Targets, Historical Tracks, Drift Vectors).

3. **Telemetry & Sensor Cards**:
   - **Slick Surface Area**: Real-time area calculation (km²), slick perimeter, and estimated volume (m³).
   - **AI Confidence Metric**: Dual-polarization (VV/VH) radar backscatter ratio and neural segmentation confidence.
   - **Satellite Sensor Metadata**: Sentinel-1 C-SAR pass ID, resolution (10m Interferometric Wide Swath), and acquisition timestamps.
   - **MetOcean Telemetry**: Surface wind vectors, ocean current velocities, and sea state.

4. **Hydrodynamic Drift Direction & Shoreline Impact Forecasting**:
   - Drift compass needle visualization showing combined windage (3% wind factor) and surface currents.
   - Vulnerable coastal target identification (mangroves, sanctuaries, port channels) with automated landfall countdown ETA and risk classification.

5. **Potentially Associated Vessels Intelligence Table**:
   - Shortlists vessels based on Closest Point of Approach (CPA) distance, temporal overlap window ($\Delta t$), and speed anomalies.
   - Displays vessel name, IMO/MMSI, vessel type (Crude Oil Tanker, Chemical Tanker, Bulk Carrier, Container Ship), speed profile, and probabilistic correlation risk score.
   - Interactive tracking: Clicking any vessel or its "Track" button highlights its historical trajectory on the geospatial map and opens its dossier.

6. **Investigation Chronological Timeline**:
   - 5-stage mission audit trail from Sentinel-1 SAR acquisition $\rightarrow$ Dark slick segmentation $\rightarrow$ Hydrodynamic drift back-projection $\rightarrow$ AIS trajectory intersection $\rightarrow$ Coast Guard alert dossier dispatch.

7. **Legal & Operational Compliance Banner**:
   - Prominent disclaimer clarifying that AIS correlation is a probabilistic screening tool for prioritizing maritime reconnaissance and does **not** constitute legal proof of culpability or discharge liability.

8. **Zero Paid APIs / 100% Free & Open-Source**:
   - Zero API keys, zero subscription barriers.
   - Uses Leaflet.js, OpenStreetMap / CartoDB tiles, and Google Fonts (`Outfit`, `JetBrains Mono`).

---

## 🛠️ Architecture & Investigation Flow

```
+---------------------------+
| Sentinel-1 C-Band SAR     |  Copernicus Data Space (Free / Open)
| 10m Dual-Pol (VV/VH)      |
+-------------+-------------+
              |
              v
+---------------------------+
| Dark Formation Detection  |  AI Segmentation / Constant False Alarm Rate (CFAR)
| Thresholding & Wind Mask  |  Filters low-wind look-alikes & biogenic slicks
+-------------+-------------+
              |
              v
+---------------------------+
| Hydrodynamic Drift Model  |  Back-projects slick to estimated discharge time;
| Windage + Surface Current |  Forward-projects trajectory for coastal impact warning
+-------------+-------------+
              |
              v
+---------------------------+
| AIS Spatio-Temporal Match |  Correlates historical vessel trajectories
| CPA & Speed Anomalies     |  Screens candidate shortlist by proximity & timing
+-------------+-------------+
              |
              v
+---------------------------+
| Watchstander SITREP       |  Dossier generated for Coast Guard / Maritime Board
| MRCC Alert & Inspection   |  (Requires visual/sample ground-truthing)
+---------------------------+
```

---

## 🚀 How to Run Locally

1. **Direct Browser**:
   - Double-click or open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
   - No build tools, Node.js server, or compilation required!

2. **With Local Server (Optional)**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or Node.js npx serve
   npx serve .
   ```
   Navigate to `http://localhost:8000`.

---

## ⚖️ Legal & Ethical Notice

*AIS correlation identifies spatio-temporal proximity only and does NOT constitute proof of responsibility or discharge. Ocean Shield is an operational screening and decision-support prototype. Final determinations require aerial surveillance, optical/chemical sampling, and Port State Control (PSC) inspections.*
