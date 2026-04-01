import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalProvider, { useGlobalContext } from './context/GlobalProvider';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import NearbyStations from './pages/NearbyStations';
import EnrouteFinder from './pages/EnrouteFinder';
import Profile from './pages/Profile';
import StationDetail from './pages/StationDetail';
import StationDetailAPI from './pages/StationDetailAPI';
import BookStation from './pages/BookStation';
import ReviewPage from './pages/ReviewPage';
import TabBar from './components/TabBar';

function ProtectedRoute({ children, hideTabBar }) {
  const { isLogged, isLoading } = useGlobalContext();

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!isLogged) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <>
      {children}
      {!hideTabBar && <TabBar />}
    </>
  );
}

function AuthRoute({ children }) {
  const { isLogged, isLoading } = useGlobalContext();

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  if (isLogged) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<AuthRoute><Landing /></AuthRoute>} />
      <Route path="/sign-in" element={<AuthRoute><SignIn /></AuthRoute>} />
      <Route path="/sign-up" element={<AuthRoute><SignUp /></AuthRoute>} />

      {/* Main Tabs */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/nearby" element={<ProtectedRoute><NearbyStations /></ProtectedRoute>} />
      <Route path="/enroute" element={<ProtectedRoute><EnrouteFinder /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Station Details (API stations) */}
      <Route path="/station/:id" element={<ProtectedRoute><StationDetailAPI /></ProtectedRoute>} />

      {/* Booking */}
      <Route path="/book/:id" element={<ProtectedRoute hideTabBar><BookStation /></ProtectedRoute>} />

      {/* Legacy station detail & review */}
      <Route path="/stations/:id" element={<ProtectedRoute><StationDetail /></ProtectedRoute>} />
      <Route path="/stations/:id/review" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <div className="gradient-bg" />
        <div className="app-container">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </GlobalProvider>
  );
}
