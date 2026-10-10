import React, { useState } from 'react';
import { X, User, Lock, Mail, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { api } from '../../services/api';
import { User as UserType } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType, token: string) => void;
  currentUser: UserType | null;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  currentUser,
  onLogout
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.auth.login(identifier, password);
        localStorage.setItem('collabcode_token', res.token);
        onAuthSuccess(res.user, res.token);
        onClose();
      } else {
        const res = await api.auth.register(username, email, password);
        localStorage.setItem('collabcode_token', res.token);
        onAuthSuccess(res.user, res.token);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.auth.guest();
      localStorage.setItem('collabcode_token', res.token);
      onAuthSuccess(res.user, res.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentUser ? 'Developer Account' : mode === 'login' ? 'Sign In to CollabCode' : 'Create Developer Account'}
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.username}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentUser.email}</p>
                <span className="badge badge-cyan" style={{ marginTop: '8px' }}>{currentUser.role}</span>
              </div>
              <button className="btn btn-danger" onClick={onLogout} style={{ marginTop: '8px' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ padding: '8px 12px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fb7185', fontSize: '12px', marginBottom: '14px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {mode === 'login' ? (
                  <>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Email or Username
                      </label>
                      <input
                        type="text"
                        className="input"
                        style={{ width: '100%' }}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="demo@collabcode.dev or DemoDeveloper"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Password
                      </label>
                      <input
                        type="password"
                        className="input"
                        style={{ width: '100%' }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Username
                      </label>
                      <input
                        type="text"
                        className="input"
                        style={{ width: '100%' }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. CodeMaster"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        className="input"
                        style={{ width: '100%' }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Password (min 6 characters)
                      </label>
                      <input
                        type="password"
                        className="input"
                        style={{ width: '100%' }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                  style={{ marginTop: '8px', height: '36px' }}
                >
                  {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0' }}>
                <hr style={{ flex: 1, borderColor: 'var(--border-subtle)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>OR</span>
                <hr style={{ flex: 1, borderColor: 'var(--border-subtle)' }} />
              </div>

              {/* Instant Guest Onboarding */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleGuestLogin}
                disabled={isLoading}
                style={{ width: '100%', height: '36px' }}
              >
                <Sparkles size={14} color="var(--accent-cyan)" />
                <span>Instant Guest Access (No Signup Required)</span>
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                {mode === 'login' ? (
                  <span>
                    Don't have an account?{' '}
                    <a
                      href="#register"
                      style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}
                      onClick={(e) => { e.preventDefault(); setMode('register'); }}
                    >
                      Sign Up
                    </a>
                  </span>
                ) : (
                  <span>
                    Already registered?{' '}
                    <a
                      href="#login"
                      style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}
                      onClick={(e) => { e.preventDefault(); setMode('login'); }}
                    >
                      Sign In
                    </a>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
