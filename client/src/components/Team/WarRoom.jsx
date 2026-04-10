import { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import Loader from '../UI/Loader';
import { toast } from 'react-toastify';

const COMMIT_MESSAGES = [
  { msg: "Refactored auth context", impact: 5, velocity: 12 },
  { msg: "Quick hack to fix CORS", impact: -8, velocity: 25 },
  { msg: "Added redis caching layer", impact: 7, velocity: 15 },
  { msg: "Bypassed type checking to ship faster!", impact: -10, velocity: 30 },
  { msg: "Wrote unit tests for matching algo", impact: 8, velocity: 5 },
  { msg: "Spaghetti CSS in index.css", impact: -6, velocity: 20 },
  { msg: "Optimized MongoDB indices", impact: 6, velocity: 10 },
  { msg: "Pushed secrets to public repo (deleted later)", impact: -15, velocity: 5 },
];

export default function WarRoom({ teamId }) {
  const [loadingArchitect, setLoadingArchitect] = useState(false);
  const [architecture, setArchitecture] = useState(null);

  // Live Simulation State
  const [velocityData, setVelocityData] = useState(Array.from({ length: 20 }, (_, i) => ({ time: i, commits: Math.floor(Math.random() * 10) })));
  const [codeHealth, setCodeHealth] = useState(75); // 0-100
  const [liveLog, setLiveLog] = useState([]);
  
  const timerRef = useRef(null);

  useEffect(() => {
    // Start simulation when component mounts
    timerRef.current = setInterval(() => {
      const isCommitEvent = Math.random() > 0.4;
      if (isCommitEvent) {
        const randomCommit = COMMIT_MESSAGES[Math.floor(Math.random() * COMMIT_MESSAGES.length)];
        
        // Add log
        setLiveLog(prev => [{ id: Date.now(), ...randomCommit, time: new Date() }, ...prev].slice(0, 5));
        
        // Update velocity
        setVelocityData(prev => {
          const newData = [...prev.slice(1)];
          newData.push({ time: prev[prev.length - 1].time + 1, commits: randomCommit.velocity + Math.floor(Math.random() * 5) });
          return newData;
        });

        // Update health
        setCodeHealth(prev => Math.min(100, Math.max(10, prev + randomCommit.impact)));
      } else {
         // Quiet moment
         setVelocityData(prev => {
            const newData = [...prev.slice(1)];
            newData.push({ time: prev[prev.length - 1].time + 1, commits: Math.floor(Math.random() * 3) });
            return newData;
          });
      }
    }, 2500);

    return () => clearInterval(timerRef.current);
  }, []);

  const generateArchitecture = async () => {
    setLoadingArchitect(true);
    try {
      const { data } = await api.get(`/match/architect/${teamId}`);
      setArchitecture(data.architecture);
      toast.success("AI Architect finished designing your system!");
    } catch (err) {
      toast.error("Failed to generate architecture.");
    } finally {
      setLoadingArchitect(false);
    }
  };

  const getHealthColor = (health) => {
    if (health > 70) return '#10b981'; // Green
    if (health > 40) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="animate-fadeInUp" style={{ paddingBottom: 'var(--space-2xl)' }}>
      {/* Top Section: AI Architect */}
      <div className="team-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
           <h2 className="team-section-title" style={{ margin: 0 }}>
             <i className="fa-solid fa-server" style={{ color: 'var(--accent-primary-light)' }}></i> AI Tech-Stack Architect
           </h2>
           {!architecture && !loadingArchitect && (
              <button className="btn btn-primary" onClick={generateArchitecture}>
                <i className="fa-solid fa-wand-magic-sparkles"></i> Design Architecture
              </button>
           )}
        </div>

        {loadingArchitect && <Loader text="AI CTO is analyzing your team's exact skills to design the perfect stack..." />}

        {architecture && (
          <div className="stagger-children">
             <div className="grid-3">
               <div className="glass-card animate-fadeInUp">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-sm)' }}>
                     <i className="fa-brands fa-react" style={{ color: '#22d3ee', fontSize: '1.25rem' }}></i>
                     <h3 style={{ fontWeight: 700 }}>Frontend</h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{architecture.frontend}</p>
               </div>
               <div className="glass-card animate-fadeInUp">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-sm)' }}>
                     <i className="fa-brands fa-node-js" style={{ color: '#10b981', fontSize: '1.25rem' }}></i>
                     <h3 style={{ fontWeight: 700 }}>Backend</h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{architecture.backend}</p>
               </div>
               <div className="glass-card animate-fadeInUp">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-sm)' }}>
                     <i className="fa-solid fa-database" style={{ color: '#f59e0b', fontSize: '1.25rem' }}></i>
                     <h3 style={{ fontWeight: 700 }}>Database</h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{architecture.database}</p>
               </div>
             </div>

             <div className="glass-card animate-fadeInUp" style={{ marginTop: 'var(--space-md)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-terminal" style={{ color: 'var(--text-primary)' }}></i> Scaffolding Command
                </h3>
                <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b', position: 'relative' }}>
                   <code style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                     {architecture.scaffoldCommand}
                   </code>
                   <button 
                     className="btn btn-ghost btn-sm" 
                     style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                     onClick={() => {
                       navigator.clipboard.writeText(architecture.scaffoldCommand);
                       toast.success('Command copied!');
                     }}
                   >
                     <i className="fa-regular fa-copy"></i>
                   </button>
                </div>
             </div>

             {architecture.architectureNotes && (
               <div className="glass-card-static alert-warning" style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)' }}>
                  <i className="fa-solid fa-lightbulb" style={{ color: 'var(--warning)', marginRight: '0.5rem' }}></i>
                  <span style={{ fontSize: '0.875rem' }}>{architecture.architectureNotes}</span>
               </div>
             )}
          </div>
        )}
      </div>

      {/* Bottom Section: Live Telemetry */}
      <div className="team-section" style={{ marginTop: 'var(--space-2xl)' }}>
        <h2 className="team-section-title">
          <i className="fa-solid fa-satellite-dish" style={{ color: '#ec4899', animation: 'pulse 2s infinite' }}></i> Live Hackathon Telemetry
        </h2>
        
        <div className="grid-2 stagger-children" style={{ alignItems: 'stretch' }}>
           
           {/* Code Quality Radar */}
           <div className="glass-card animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
             <h3 style={{ alignSelf: 'flex-start', fontWeight: 700, marginBottom: '0' }}>Real-time Code Health</h3>
             <p style={{ alignSelf: 'flex-start', fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI-driven Spaghetti Code Radar</p>
             
             <div style={{ position: 'relative', width: 250, height: 180, marginTop: 'var(--space-lg)' }}>
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={[
                       { value: codeHealth, fill: getHealthColor(codeHealth) },
                       { value: 100 - codeHealth, fill: 'rgba(148,163,184,0.1)' }
                     ]}
                     cx="50%" cy="100%" startAngle={180} endAngle={0}
                     innerRadius={80} outerRadius={110}
                     stroke="none"
                     dataKey="value"
                     animationDuration={1500}
                   />
                 </PieChart>
               </ResponsiveContainer>
               {/* Center text manually */}
               <div style={{ position: 'absolute', bottom: '10px', left: 0, width: '100%', textAlign: 'center' }}>
                 <div style={{ fontSize: '2.5rem', fontWeight: 800, color: getHealthColor(codeHealth), lineHeight: 1 }}>{codeHealth}%</div>
                 <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                   {codeHealth > 70 ? 'Clean Code' : codeHealth > 40 ? 'Moderate Tech Debt' : '🍝 SPAGHETTI ALERT'}
                 </div>
               </div>
             </div>
           </div>

           {/* Velocity Chart */}
           <div className="glass-card animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column' }}>
             <h3 style={{ fontWeight: 700, marginBottom: '0' }}>Team Push Velocity</h3>
             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>Simulated Live GitHub Commits / Min</p>
             <div style={{ flex: 1, minHeight: 200 }}>
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={velocityData}>
                   <XAxis dataKey="time" hide />
                   <YAxis hide domain={[0, 40]} />
                   <Tooltip 
                     contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, color: '#fff' }} 
                     itemStyle={{ color: '#38bdf8' }}
                   />
                   <Line type="monotone" dataKey="commits" stroke="#38bdf8" strokeWidth={3} dot={false} isAnimationActive={false} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* Live Feed */}
           <div className="glass-card animate-fadeInUp" style={{ gridColumn: '1 / -1' }}>
             <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>Live Hackathon Feed</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               {liveLog.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Waiting for team pushes...</div>}
               {liveLog.map((log) => (
                 <div key={log.id} className="animate-fadeInLeft" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(148,163,184,0.05)', borderRadius: 'var(--radius-md)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     <div style={{ width: 8, height: 8, borderRadius: '50%', background: log.impact > 0 ? '#10b981' : '#ef4444', boxShadow: `0 0 10px ${log.impact > 0 ? '#10b981' : '#ef4444'}` }}></div>
                     <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{log.msg}</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem' }}>
                     <span style={{ color: log.impact > 0 ? '#10b981' : '#ef4444' }}>{log.impact > 0 ? '+' : ''}{log.impact} Health</span>
                     <span style={{ color: 'var(--text-muted)' }}>{log.time.toLocaleTimeString()}</span>
                   </div>
                 </div>
               ))}
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}
