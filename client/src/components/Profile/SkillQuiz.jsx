import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function SkillQuiz({ skill, onClose, onSuccess }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(/quiz/${skill});
        setQuestions(data.questions);
      } catch (err) {
        setError("Failed to load quiz. AI service might be busy.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [skill]);

  const handleAnswer = (optionIdx) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optionIdx;
    setAnswers(newAnswers);

    if (currentIdx < questions.length - 1) {
      setTimeout(() => setCurrentIdx(prev => prev + 1), 300);
    }
  };

  const submitQuiz = async () => {
    if (answers.length < questions.length || answers.includes(undefined)) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(/quiz/${skill}/submit, { answers, timeTaken: 120 });
      setResult(data);
    } catch (err) {
      setError("Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="quiz-modal-overlay">
        <div className="glass-card quiz-modal animate-fadeInUp">
          <button className="close-btn" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
          <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: 'var(--danger)', marginBottom: '1rem' }}></i>
            <h3>An error occurred</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="quiz-modal-overlay">
        <div className="glass-card quiz-modal animate-fadeInUp" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
          <div className="loader" style={{ width: 40, height: 40, borderWidth: 4, margin: '0 auto var(--space-lg)' }}></div>
          <h3 style={{ fontWeight: 700 }}>Generating {skill} Quiz...</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Our AI is creating custom questions to verify your knowledge.</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="quiz-modal-overlay">
        <div className="glass-card quiz-modal animate-fadeInUp" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>
            {result.passed ? '🎉' : '💔'}
          </div>
          <h2 style={{ fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
            {result.passed ? 'Skill Verified!' : 'Not Quite There'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
            You scored {result.score}% ({result.correct}/{result.total}). Let&apos;s keep building!
          </p>
          
          <button 
            className="btn btn-primary btn-full btn-lg" 
            onClick={() => {
              if (result.passed) onSuccess();
              onClose();
            }}
          >
            {result.passed ? 'Awesome' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="quiz-modal-overlay">
      <div className="glass-card quiz-modal animate-fadeInUp">
        <div className="quiz-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontWeight: 700, margin: 0 }}>
            {skill} Verification
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <i className="fa-solid fa-xmark" style={{ fontSize: '1.25rem' }}></i>
          </button>
        </div>

        <div className="quiz-progress-bar" style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 'var(--space-lg)' }}>
          <div style={{ height: '100%', background: 'var(--accent-primary)', borderRadius: 2, width: ${((currentIdx + 1) / questions.length) * 100}%, transition: 'width 0.3s ease' }}></div>
        </div>

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--accent-secondary)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
            Question {currentIdx + 1} of {questions.length}
          </div>
          <p style={{ fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.5 }}>
            {q?.question}
          </p>
        </div>

        <div className="flex-col gap-sm" style={{ marginBottom: 'var(--space-xl)' }}>
          {q?.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={quiz-option ${answers[currentIdx] === i ? 'selected' : ''}}
            >
              <div className="quiz-option-letter">{String.fromCharCode(65 + i)}</div>
              <div className="quiz-option-text">{opt}</div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0 || submitting}
          >
            Previous
          </button>
          
          {currentIdx === questions.length - 1 ? (
            <button 
              className="btn btn-primary" 
              onClick={submitQuiz}
              disabled={answers[currentIdx] === undefined || submitting}
            >
              {submitting ? 'Verifying...' : 'Submit Quiz'}
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={() => setCurrentIdx(prev => prev + 1)}
              disabled={answers[currentIdx] === undefined}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}