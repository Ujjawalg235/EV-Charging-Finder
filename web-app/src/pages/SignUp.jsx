import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUser } from '../lib/auth';
import { useGlobalContext } from '../context/GlobalProvider';

export default function SignUp() {
  const { setUser, setIsLogged } = useGlobalContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = createUser(form.email, form.password, form.username);
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
        <h1 className="auth-title">Create your account</h1>

        {error && (
          <div className="alert alert-error" id="signup-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-username">Username</label>
            <div className="form-input-wrapper">
              <input
                id="signup-username"
                className="form-input"
                type="text"
                name="username"
                placeholder="Your name"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email</label>
            <div className="form-input-wrapper">
              <input
                id="signup-email"
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
            <label className="form-label" htmlFor="signup-password">Password</label>
            <div className="form-input-wrapper">
              <input
                id="signup-password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
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
            id="signup-submit-btn"
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/sign-in">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
