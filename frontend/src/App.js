import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function AppContent() {
  const { isTransitioning, animationIndex, currentQuote } = usePageTransition();
  return (
    <>
      <PageTransition isTransitioning={isTransitioning} animationIndex={animationIndex} currentQuote={currentQuote} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/input" element={
          <ProtectedRoute><InputPortal /></ProtectedRoute>
        } />
        <Route path="/placement" element={
          <ProtectedRoute><Placement /></ProtectedRoute>
        } />
        <Route path="/insights" element={
          <ProtectedRoute><Insights /></ProtectedRoute>
        } />
        <Route path="/skills" element={
          <ProtectedRoute><Skills /></ProtectedRoute>
        } />
        <Route path="/achievements" element={
          <ProtectedRoute><Achievements /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute><Support /></ProtectedRoute>
        } />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/data-quality" element={<DataQuality />} />
      </Routes>
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