import { useState, useRef, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

export default function VoiceIntro() {
  const { user, updateUser } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState(user?.voiceIntroUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    if (user?.voiceIntroUrl) {
      setAudioURL(user.voiceIntroUrl);
    }
  }, [user]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audioURL) {
      audio.src = audioURL;
    }
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audioURL]);

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioURL(reader.result);
          uploadVoice(reader.result, recordingTime);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 29) { // 30 sec limit
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setError('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const uploadVoice = async (base64Audio, duration) => {
    setLoading(true);
    try {
      await api.post('/voice/upload', { voiceUrl: base64Audio, duration });
      updateUser({ ...user, voiceIntroUrl: base64Audio });
    } catch (err) {
      setError('Failed to upload voice intro. File might be too large.');
      setAudioURL(user?.voiceIntroUrl || '');
    } finally {
      setLoading(false);
    }
  };

  const deleteVoice = async () => {
    if (!window.confirm('Remove your voice intro?')) return;
    setLoading(true);
    try {
      await api.delete('/voice');
      setAudioURL('');
      updateUser({ ...user, voiceIntroUrl: null });
    } catch (err) {
      setError('Failed to delete voice intro.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds) => {
    return 00:${seconds.toString().padStart(2, '0')};
  };

  return (
    <div className="glass-card-static voice-intro-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {isRecording && <div className="recording-glow"></div>}
      
      <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
        <span className="material-symbols-outlined">mic</span> Audio Pitch
      </h3>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)', position: 'relative', zIndex: 1 }}>
        Stand out to teams by recording a 30-second audio pitch about what you want to build!
      </p>

      {error && <div style={{ color: 'var(--danger)', fontSize: '0.8125rem', marginBottom: 'var(--space-md)' }}>{error}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', position: 'relative', zIndex: 1 }}>
        {!audioURL || isRecording ? (
          <>
            {isRecording ? (
              <button 
                className="btn btn-primary" 
                onClick={stopRecording}
                style={{ background: 'var(--danger)', borderColor: 'var(--danger)', borderRadius: '50%', width: 48, height: 48, padding: 0 }}
              >
                <i className="fa-solid fa-stop"></i>
              </button>
            ) : (
              <button 
                className="btn btn-secondary" 
                onClick={startRecording}
                disabled={loading}
                style={{ borderRadius: '50%', width: 48, height: 48, padding: 0 }}
              >
                <i className="fa-solid fa-microphone"></i>
              </button>
            )}
            <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 600, color: isRecording ? 'var(--danger)' : 'var(--text-primary)' }}>
              {isRecording ? formatTime(recordingTime) : '00:30'}
            </div>
            {isRecording && <div className="recording-pulse"></div>}
          </>
        ) : (
          <>
            <button 
              className="btn btn-primary" 
              onClick={togglePlayback}
              style={{ borderRadius: '50%', width: 48, height: 48, padding: 0 }}
            >
              <i className={fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}}></i>
            </button>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
               <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}></div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={deleteVoice} disabled={loading}>
              <i className="fa-solid fa-trash"></i>
            </button>
          </>
        )}
      </div>
    </div>
  );
}