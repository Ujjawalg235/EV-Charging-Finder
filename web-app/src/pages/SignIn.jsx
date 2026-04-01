import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn, getCurrentUser } from '../lib/auth';
import { useGlobalContext } from '../context/GlobalProvider';

export default function SignIn() {
  const { setUser, setIsLogged } = useGlobalContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      signIn(form.email, form.password);
      const user = getCurrentUser();
      setUser(user);
      setIsLogged(true);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⚡</div>
        <h1 className="auth-title">Welcome back</h1>

        {error && (
          <div className="alert alert-error" id="signin-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="signin-email">Email</label>
            <div className="form-input-wrapper">
              <input
                id="signin-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signin-password">Password</label>
            <div className="form-input-wrapper">
              <input
                id="signin-password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isSubmitting}
            id="signin-submit-btn"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/sign-up">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
