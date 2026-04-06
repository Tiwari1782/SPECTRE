import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('devmatch_theme') || 'dark';
  });

  // Apply theme on mount & change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('devmatch_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-icon">
            <i className="fa-solid fa-code" />
          </span>
          Dev<span className="brand-highlight">Match</span>
        </NavLink>

        {user && (
          <div className="navbar-links">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="fa-solid fa-grid-2" />
              Dashboard
            </NavLink>
            <NavLink to="/matches" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="fa-solid fa-sparkles" />
              Matches
            </NavLink>
            <NavLink to="/developers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="fa-solid fa-search" />
              Developers
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="fa-solid fa-comments" />
              Chat
            </NavLink>
            <NavLink to="/team" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="fa-solid fa-people-group" />
              Team
            </NavLink>
            <NavLink to="/hackathons" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="fa-solid fa-trophy" />
              Hackathons
            </NavLink>
            <NavLink to="/showcase" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="fa-solid fa-rocket" />
              Showcase
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="fa-solid fa-user-gear" />
              Profile
            </NavLink>
          </div>
        )}

        <div className="navbar-user">
          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            aria-label="Toggle theme"
          >
            <i
              className={`toggle-icon fa-solid fa-sun ${theme === 'dark' ? 'visible' : 'hidden'}`}
            />
            <i
              className={`toggle-icon fa-solid fa-moon ${theme === 'light' ? 'visible' : 'hidden'}`}
            />
          </button>

          {user ? (
            <>
              {user.xp > 0 && (
                <span className="xp-badge">
                  <i className="fa-solid fa-bolt" />
                  {user.xp} XP
                </span>
              )}
              <div className="user-avatar" title={user.name}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket" />
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary btn-sm">
              <i className="fa-solid fa-right-to-bracket" />
              Get Started
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
