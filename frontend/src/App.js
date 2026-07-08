import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { usePageTransition } from './hooks/usePageTransition';
import PageTransition from './components/PageTransition';

// Pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import InputPortal from './pages/InputPortal';
import Placement from './pages/Placement';
import Skills from './pages/Skills';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';
import Support from './pages/Support';
import Insights from './pages/Insights';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DataQuality from './pages/DataQuality';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { student } = useAuth();
  return student ? children : <Navigate to="/" />;
}

function renderRoutes(loc) {
  return (
    <Routes location={loc}>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/input" element={<ProtectedRoute><InputPortal /></ProtectedRoute>} />
      <Route path="/placement" element={<ProtectedRoute><Placement /></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
      <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/data-quality" element={<DataQuality />} />
    </Routes>
  );
}

function AppContent() {
  const { isTransitioning, prevLocation, currentQuote } = usePageTransition();
  const routerLocation = useLocation();

  return (
    <>
      <PageTransition isTransitioning={isTransitioning} currentQuote={currentQuote} />
      
      {/* Background: The New Page */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {renderRoutes(routerLocation)}
      </div>

      {/* Foreground: The Old Page (being erased) */}
      {isTransitioning && prevLocation.pathname !== routerLocation.pathname && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, animation: 'eraseOldPage 2.5s linear forwards', pointerEvents: 'none', background: 'var(--chalk-bg)' }}>
          {renderRoutes(prevLocation)}
          <style>{`
            @keyframes eraseOldPage {
              0%   { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
              25%  { clip-path: polygon(0% 25%, 100% 25%, 100% 100%, 0% 100%); }
              50%  { clip-path: polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%); }
              75%  { clip-path: polygon(0% 75%, 100% 75%, 100% 100%, 0% 100%); }
              100% { clip-path: polygon(0% 110%, 100% 110%, 100% 100%, 0% 100%); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;