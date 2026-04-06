import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import useAuth from '../hooks/useAuth';

// Typewriter phrases
const TYPEWRITER_PHRASES = [
  'Hackathon Team',
  'Dream Squad',
  'Perfect Match',
  'Code Partners',
  'Winning Crew',
];

// Animated counter hook
function useCountUp(target, duration = 2000, startOnView = false) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

// Particle Canvas Component — interactive mesh network
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 80;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener('mousemove', handleMouse);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w(),
        y: Math.random() * h(),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, w(), h());
      const mouse = mouseRef.current;

      particles.forEach((p) => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (180 - dist) / 180;
          p.vx += (dx / dist) * force * 0.15;
          p.vy += (dy / dist) * force * 0.15;
        }

        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w();
        if (p.x > w()) p.x = 0;
        if (p.y < 0) p.y = h();
        if (p.y > h()) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const opacity = (1 - dist / 140) * 0.12;
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="landing-canvas" />;
}

// Floating geometric shape SVGs
function FloatingShapes() {
  return (
    <>
      <div className="floating-shape shape-1">
        <svg viewBox="0 0 60 60">
          <polygon points="30,2 55,17 55,43 30,58 5,43 5,17" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent-primary)' }} />
        </svg>
      </div>
      <div className="floating-shape shape-2">
        <svg viewBox="0 0 40 40">
          <polygon points="20,2 38,38 2,38" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent-secondary, #22d3ee)' }} />
        </svg>
      </div>
      <div className="floating-shape shape-3">
        <svg viewBox="0 0 50 50">
          <rect x="10" y="10" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent-primary-light)' }} transform="rotate(45, 25, 25)" />
        </svg>
      </div>
      <div className="floating-shape shape-4">
        <svg viewBox="0 0 35 35">
          <circle cx="17.5" cy="17.5" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--success, #10b981)' }} />
        </svg>
      </div>
      <div className="floating-shape shape-5">
        <svg viewBox="0 0 45 45">
          <line x1="22.5" y1="5" x2="22.5" y2="40" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--warning, #f59e0b)' }} />
          <line x1="5" y1="22.5" x2="40" y2="22.5" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--warning, #f59e0b)' }} />
        </svg>
      </div>
    </>
  );
}

// Circuit SVG decoration
function CircuitSVG() {
  return (
    <svg className="hero-circuit-svg" viewBox="0 0 1200 800" preserveAspectRatio="none">
      <polyline className="circuit-line" points="0,400 200,400 250,350 400,350 450,300" />
      <polyline className="circuit-line" points="1200,200 1000,200 950,250 800,250 750,300" />
      <polyline className="circuit-line" points="100,700 300,700 350,650 500,650 550,600" />
      <circle className="circuit-dot" cx="450" cy="300" />
      <circle className="circuit-dot" cx="750" cy="300" />
      <circle className="circuit-dot" cx="250" cy="350" />
      <circle className="circuit-dot" cx="550" cy="600" />
    </svg>
  );
}

// Floating code window
function CodeWindow({ className = '' }) {
  return (
    <div className={`hero-code-window ${className}`}>
      <div className="code-window-bar">
        <div className="code-window-dot red" />
        <div className="code-window-dot yellow" />
        <div className="code-window-dot green" />
      </div>
      <div className="code-window-content">
        <div>
          <span className="code-keyword">import</span>{' '}
          <span className="code-bracket">{'{'}</span>{' '}
          <span className="code-component">DevMatch</span>{' '}
          <span className="code-bracket">{'}'}</span>{' '}
          <span className="code-keyword">from</span>{' '}
          <span className="code-string">'@ai'</span>
        </div>
        <div>&nbsp;</div>
        <div>
          <span className="code-bracket">{'<'}</span>
          <span className="code-component">TeamBuilder</span>
        </div>
        <div>
          {'  '}<span className="code-prop">skills</span>=
          <span className="code-bracket">{'{'}</span>
          <span className="code-string">verified</span>
          <span className="code-bracket">{'}'}</span>
        </div>
        <div>
          {'  '}<span className="code-prop">match</span>=
          <span className="code-bracket">{'{'}</span>
          <span className="code-string">ai_powered</span>
          <span className="code-bracket">{'}'}</span>
        </div>
        <div>
          <span className="code-bracket">{'/>'}</span>
        </div>
      </div>
    </div>
  );
}

// Feature card with spotlight
function FeatureCard({ icon, iconType, title, desc, index }) {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  return (
    <div
      ref={cardRef}
      className="glass-card feature-card feature-card-spotlight reveal-on-scroll"
      onMouseMove={handleMouseMove}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="feature-icon">
        {iconType === 'material' ? (
          <span className="material-symbols-outlined">{icon}</span>
        ) : (
          <i className={icon} />
        )}
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  );
}

// Social proof logos
function TrustLogos() {
  return (
    <div className="trust-bar reveal-on-scroll">
      <span className="trust-label">Powering teams at</span>
      <div className="trust-logos">
        {['MLH', 'Devpost', 'Unstop', 'HackerEarth', 'GitHub'].map(name => (
          <span key={name} className="trust-logo-item">{name}</span>
        ))}
      </div>
    </div>
  );
}

// Testimonial card
function TestimonialCard({ quote, name, role, avatarLetter }) {
  return (
    <div className="glass-card testimonial-card reveal-on-scroll">
      <div className="testimonial-stars">
        {[...Array(5)].map((_, i) => <i key={i} className="fa-solid fa-star" />)}
      </div>
      <p className="testimonial-quote">&ldquo;{quote}&rdquo;</p>
      <div className="testimonial-author">
        <div className="user-avatar" style={{ width: 40, height: 40, fontSize: '0.875rem' }}>
          {avatarLetter}
        </div>
        <div>
          <div className="testimonial-name">{name}</div>
          <div className="testimonial-role">{role}</div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [typewriterText, setTypewriterText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const currentPhrase = TYPEWRITER_PHRASES[phraseIndex];
    let timer;

    if (!isDeleting && typewriterText === currentPhrase) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && typewriterText === '') {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
    } else {
      const speed = isDeleting ? 40 : 80;
      timer = setTimeout(() => {
        setTypewriterText(
          isDeleting
            ? currentPhrase.substring(0, typewriterText.length - 1)
            : currentPhrase.substring(0, typewriterText.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [typewriterText, phraseIndex, isDeleting]);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Counter hooks
  const stat1 = useCountUp(500, 2000, true);
  const stat2 = useCountUp(92, 2000, true);
  const stat3 = useCountUp(150, 2000, true);
  const stat4 = useCountUp(24, 2000, true);

  const features = [
    {
      icon: 'fa-solid fa-brain',
      iconType: 'fa',
      title: 'AI-Powered Matching',
      desc: 'Our algorithm scores compatibility across 8 dimensions including skills, goals, availability, and working style.',
    },
    {
      icon: 'verified',
      iconType: 'material',
      title: 'Verified Skills',
      desc: 'Connect GitHub for auto-detection plus take skill quizzes to earn verification badges that boost your match score.',
    },
    {
      icon: 'fa-solid fa-comments',
      iconType: 'fa',
      title: 'Real-Time Chat',
      desc: 'Instantly message matches with context-aware conversation starters. AI co-pilot helps brainstorm project ideas.',
    },
    {
      icon: 'fa-solid fa-trophy',
      iconType: 'fa',
      title: 'Live Hackathons',
      desc: 'Discover real hackathons from Devpost and Unstop. Filter by domain, deadline, and prize pool.',
    },
    {
      icon: 'monitoring',
      iconType: 'material',
      title: 'Team Health Dashboard',
      desc: 'Visualize skill coverage, identify gaps, and get AI recommendations for your team composition.',
    },
    {
      icon: 'fa-solid fa-ranking-star',
      iconType: 'fa',
      title: 'XP & Leaderboard',
      desc: 'Earn XP for completing profiles, verifying skills, and shipping projects. Climb the global leaderboard.',
    },
  ];

  const testimonials = [
    {
      quote: "DevMatch helped us find the perfect backend dev in 10 minutes. We won 1st place at MLH Global Hack Week!",
      name: "Aisha Patel",
      role: "Frontend Developer",
      avatarLetter: "A"
    },
    {
      quote: "The AI matching is insane. It paired me with someone who had exactly the skills my team was lacking.",
      name: "Raj Kumar",
      role: "Full Stack Developer",
      avatarLetter: "R"
    },
    {
      quote: "The Idea Co-Pilot literally brainstormed our entire project architecture. Game changer for hackathons.",
      name: "Priya Sharma",
      role: "ML Engineer",
      avatarLetter: "P"
    }
  ];

  return (
    <div className="landing">
      {/* ========== HERO ========== */}
      <section className="landing-hero">
        <ParticleCanvas />
        <div className="hero-glow-orb orb-1" />
        <div className="hero-glow-orb orb-2" />
        <div className="hero-glow-orb orb-3" />
        <FloatingShapes />
        <CircuitSVG />
        <CodeWindow />
        <CodeWindow className="hero-code-window-2" />

        {/* Hero Content */}
        <div className="hero-badge">
          <i className="fa-solid fa-microchip" />
          AI-Powered Team Formation
        </div>

        <h1 className="hero-title">
          Find Your Perfect<br />
          <span className="hero-typewriter-wrapper">
            <span className="hero-typewriter">{typewriterText}</span>
            <span className="typewriter-cursor" />
          </span>
        </h1>

        <p className="hero-subtitle">
          DevMatch intelligently pairs developers based on skills, goals, and working style.
          Powered by AI matching, verified GitHub skills, and real-time collaboration.
        </p>

        <div className="hero-actions">
          {user ? (
            <button className="btn btn-primary btn-lg hero-cta-btn" onClick={() => navigate('/dashboard')}>
              <i className="fa-solid fa-grid-2" />
              Go to Dashboard
            </button>
          ) : (
            <>
              <button className="btn btn-primary btn-lg hero-cta-btn" onClick={() => navigate('/login')}>
                <i className="fa-solid fa-rocket" />
                Get Started Free
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() =>
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <span className="material-symbols-outlined">explore</span>
                How It Works
              </button>
            </>
          )}
        </div>

        <div className="hero-stats">
          <div className="hero-stat glass-stat" ref={stat1.ref}>
            <div className="hero-stat-value counting">{stat1.count}+</div>
            <div className="hero-stat-label">Developers Matched</div>
          </div>
          <div className="hero-stat glass-stat" ref={stat2.ref}>
            <div className="hero-stat-value counting">{stat2.count}%</div>
            <div className="hero-stat-label">Match Satisfaction</div>
          </div>
          <div className="hero-stat glass-stat" ref={stat3.ref}>
            <div className="hero-stat-value counting">{stat3.count}+</div>
            <div className="hero-stat-label">Hackathons Tracked</div>
          </div>
          <div className="hero-stat glass-stat" ref={stat4.ref}>
            <div className="hero-stat-value counting">{stat4.count}h</div>
            <div className="hero-stat-label">Avg Team Formation</div>
          </div>
        </div>
      </section>

      {/* ========== TRUST BAR ========== */}
      <TrustLogos />

      {/* ========== HOW IT WORKS ========== */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header">
          <span className="section-badge reveal-on-scroll">
            <span className="material-symbols-outlined">bolt</span>
            Simple Process
          </span>
          <h2 className="section-title reveal-on-scroll">How DevMatch Works</h2>
          <p className="section-subtitle reveal-on-scroll">
            Three simple steps to build your dream hackathon team
          </p>
        </div>

        <div className="steps-container">
          <div className="step-card glass-card-static reveal-on-scroll">
            <div className="step-number">
              <span>1</span>
            </div>
            <div className="step-icon-bg">
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <h3 className="step-title">Create Your Profile</h3>
            <p className="step-desc">
              Sign up, add your skills, connect GitHub, and take skill quizzes to get verified badges.
            </p>
            <ul className="step-features">
              <li><i className="fa-solid fa-check"></i> GitHub auto-detection</li>
              <li><i className="fa-solid fa-check"></i> Skill quizzes</li>
              <li><i className="fa-solid fa-check"></i> Voice pitch intro</li>
            </ul>
          </div>
          <div className="step-card glass-card-static reveal-on-scroll">
            <div className="step-number">
              <span>2</span>
            </div>
            <div className="step-icon-bg">
              <i className="fa-solid fa-brain"></i>
            </div>
            <h3 className="step-title">Get AI-Matched</h3>
            <p className="step-desc">
              Our AI analyzes your profile across 8+ dimensions to find the most compatible teammates.
            </p>
            <ul className="step-features">
              <li><i className="fa-solid fa-check"></i> 8-dimension scoring</li>
              <li><i className="fa-solid fa-check"></i> Blind matching mode</li>
              <li><i className="fa-solid fa-check"></i> Real-time chat</li>
            </ul>
          </div>
          <div className="step-card glass-card-static reveal-on-scroll">
            <div className="step-number">
              <span>3</span>
            </div>
            <div className="step-icon-bg">
              <i className="fa-solid fa-trophy"></i>
            </div>
            <h3 className="step-title">Build & Ship</h3>
            <p className="step-desc">
              Chat in real-time, brainstorm with AI co-pilot, track team health, and publish your project.
            </p>
            <ul className="step-features">
              <li><i className="fa-solid fa-check"></i> AI Idea Co-Pilot</li>
              <li><i className="fa-solid fa-check"></i> Team health radar</li>
              <li><i className="fa-solid fa-check"></i> Project showcase</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-badge reveal-on-scroll">
            <span className="material-symbols-outlined">auto_awesome</span>
            Powerful Features
          </span>
          <h2 className="section-title reveal-on-scroll">Everything You Need to Win</h2>
          <p className="section-subtitle reveal-on-scroll">
            From finding teammates to shipping projects, DevMatch is your complete hackathon operating system.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((f, i) => (
            <FeatureCard key={f.title} index={i} {...f} />
          ))}
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="testimonials-section">
        <div className="section-header">
          <span className="section-badge reveal-on-scroll">
            <i className="fa-solid fa-heart"></i>
            Loved by Developers
          </span>
          <h2 className="section-title reveal-on-scroll">What Hackers Say</h2>
          <p className="section-subtitle reveal-on-scroll">
            Real stories from developers who found their dream teams on DevMatch
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="cta-inner glass-card-static reveal-on-scroll">
          <span className="material-symbols-outlined cta-icon">rocket_launch</span>
          <h2 className="cta-title">Ready to Find Your Dream Team?</h2>
          <p className="cta-subtitle">
            Join hundreds of developers who've already found their perfect hackathon teammates.
            It's free, fast, and powered by AI.
          </p>
          <div className="cta-actions">
            <button
              className="btn btn-primary btn-lg hero-cta-btn"
              onClick={() => navigate(user ? '/dashboard' : '/login')}
            >
              <i className="fa-solid fa-rocket" />
              {user ? 'Go to Dashboard' : 'Start Matching Now'}
            </button>
            <span className="cta-note">
              <i className="fa-solid fa-clock"></i>
              Takes less than 2 minutes
            </span>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-icon" style={{ width: 32, height: 32, fontSize: '0.875rem' }}>
              <i className="fa-solid fa-code" />
            </span>
            Dev<span className="brand-highlight">Match</span>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <span className="footer-link-divider">·</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-github"></i> GitHub
            </a>
          </div>
          <p className="footer-copy">
            Built with ❤️ for hackathon warriors — DevMatch © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
