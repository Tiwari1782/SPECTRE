import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from './hooks/useAuth';
import Navbar from './components/UI/Navbar';
import Loader from './components/UI/Loader';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Hackathons from './pages/Hackathons';
import Showcase from './pages/Showcase';
import TeamBuilder from './pages/TeamBuilder';
import Team from './pages/Team';
import JoinTeam from './pages/JoinTeam';
import Developers from './pages/Developers';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader text="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <Loader text="Starting DevMatch..." />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ToastContainer position="bottom-right" autoClose={3000} newestOnTop hideProgressBar={false} closeOnClick pauseOnHover />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join/:token" element={<JoinTeam />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/hackathons" element={<ProtectedRoute><Hackathons /></ProtectedRoute>} />
          <Route path="/showcase" element={<ProtectedRoute><Showcase /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
          <Route path="/developers" element={<ProtectedRoute><Developers /></ProtectedRoute>} />
          <Route path="/team-builder" element={<ProtectedRoute><TeamBuilder /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
