# EV Charging Finder

A comprehensive, responsive React web application designed to help electric vehicle (EV) owners locate and "book" charging stations efficiently.

## 🌟 Features

*   **Interactive Maps Integration**: Uses `react-leaflet` to display dynamic markers, popups, and radius visualizations on the Home and Nearby search pages.
*   **Enroute Navigation**: Plan a trip from a start location to a destination, rendering the exact path and all EV charging stations situated along that route on a dedicated map.
*   **Connector Type Filtering**: Dynamic filtering for connector types (`Type 2`, `CCS`, `CHAdeMO`) directly in the Enroute finder.
*   **Real Station Data**: Integrates seamlessly with the Open Charge Map API to pull real, live charging stations with actual location data and photographs.
*   **Mock Booking Flow**: A realistic, step-by-step charging slot booking simulator, fully localized and priced realistically.
*   **User "Visited" Log & Reviews**: A personal profile dashboard that saves your previously visited stations, allowing you to log reviews, experiences, and dates for API-sourced charging spots using `localStorage`.
*   **Modern Premium UI**: Built with responsive glassmorphism aesthetics, dynamic dark mode layout, and frictionless tab-based routing for optimal mobile and desktop user experience.

## 🚀 Tech Stack

- **Frontend Framework:** React 18, utilizing functional components and hooks
- **Build Tool:** Vite for blazing fast development and optimized production builds
- **Routing:** React Router DOM (v6)
- **Maps:** Leaflet & React-Leaflet
- **Data & APIs:** Open Charge Map (OCM) and Nominatim (for geographical lookups)
- **Styling:** Custom CSS built with CSS Variables and responsive design paradigms

## 💻 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your machine.

### Installation & Run Instructions

1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/Ujjawalg235/EV-Charging-Finder
   cd EV-Charging-Finder-App-main/web-app
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app via your browser at `http://localhost:5173/` (or whichever port Vite allocates).

## 🗄️ State Management
Data persistence (like saved bookings and visited locations) is primarily handled in the browser's `localStorage` for prototype simplicity without needing a backend. In a production environment, this should seamlessly connect to a Firebase/Supabase layer.

---

