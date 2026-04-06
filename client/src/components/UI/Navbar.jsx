import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'fa-solid fa-grid-2', label: 'Dashboard' },
  { to: '/matches', icon: 'fa-solid fa-sparkles', label: 'Matches' },
  { to: '/developers', icon: 'fa-solid fa-search', label: 'Developers' },
  { to: '/chat', icon: 'fa-solid fa-comments', label: 'Chat' },
  { to: '/team', icon: 'fa-solid fa-people-group', label: 'Team' },
  { to: '/hackathons', icon: 'fa-solid fa-trophy', label: 'Hackathons' },
  { to: '/showcase', icon: 'fa-solid fa-rocket', label: 'Showcase' },
  { to: '/profile', icon: 'fa-solid fa-user-gear', label: 'Profile' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('devmatch_theme') || 'dark';
  });

  // Apply theme on mount & change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('devmatch_theme', theme);
  }, [theme]);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.classList.add('nav-open');
    } else {
      document.body.classList.remove('nav-open');
    }
    return () => document.body.classList.remove('nav-open');
  }, [mobileNavOpen]);

  // Close mobile nav on window resize above 768px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileNavOpen) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileNavOpen]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    setMobileNavOpen(false);
    logout();
    navigate('/');
  };

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  return (
    <>
      <nav className="navbar" id="main-navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-brand" onClick={closeMobileNav}>
            <span className="brand-icon">
              <i className="fa-solid fa-code" />
            </span>
            Dev<span className="brand-highlight">Match</span>
          </NavLink>

          {/* Desktop links — hidden on mobile via existing CSS */}
          {user && (
            <div className="navbar-links">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <i className={item.icon} />
                  {item.label}
                </NavLink>
              ))}
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
                {/* Desktop logout */}
                <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ display: 'none' }} id="desktop-logout">
                  <i className="fa-solid fa-right-from-bracket" />
                </button>
                {/* Hamburger — visible on mobile */}
                <button
                  className={`navbar-hamburger ${mobileNavOpen ? 'active' : ''}`}
                  onClick={() => setMobileNavOpen((prev) => !prev)}
                  aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileNavOpen}
                >
                  <div className="hamburger-icon">
                    <span />
                    <span />
                    <span />
                  </div>
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

      {/* Mobile Navigation Drawer & Overlay */}
      {user && (
        <>
          <div
            className={`mobile-nav-overlay ${mobileNavOpen ? 'active' : ''}`}
            onClick={closeMobileNav}
            aria-hidden="true"
          />
          <div className={`mobile-nav-drawer ${mobileNavOpen ? 'active' : ''}`}>
            <div className="mobile-nav-links">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileNav}
                >
                  <i className={item.icon} />
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="mobile-nav-divider" />
            <div className="mobile-nav-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: '0 var(--space-md)' }}>
                <div className="user-avatar" style={{ width: 40, height: 40, fontSize: '1rem' }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{user.name || 'Developer'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {user.level || 'Rookie'} · {user.xp || 0} XP
                  </div>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-full"
                onClick={handleLogout}
                style={{ marginTop: 'var(--space-sm)', justifyContent: 'flex-start', paddingLeft: 'var(--space-md)' }}
              >
                <i className="fa-solid fa-right-from-bracket" />
                Log Out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
