export default function ScoreRing({ score, size = 80 }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const level = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="ring-bg" cx={size/2} cy={size/2} r={radius} />
        <circle
          className={`ring-fill ${level}`}
          cx={size/2} cy={size/2} r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="score-value" style={{ color }}>{score}%</span>
    </div>
  );
}
