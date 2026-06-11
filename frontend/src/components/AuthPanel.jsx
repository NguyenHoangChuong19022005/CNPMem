import { useEffect, useState } from 'react';

const initialForm = {
  username: '',
  password: '',
  email: '',
  fullName: '',
};

const AuthPanel = ({ token, onTokenChange, onLogout }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentToken, setCurrentToken] = useState(token);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (token) {
      setCurrentToken(token);
      fetchProfile(token);
    }
  }, [token]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const fetchProfile = async (jwt) => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to load profile');
      }

      setProfile(data);
    } catch (err) {
      setError(err.message);
      setProfile(null);
      handleLogout(); // Clear invalid token from localStorage
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login'
      ? { username: form.username, password: form.password }
      : { username: form.username, password: form.password, email: form.email, fullName: form.fullName };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      if (mode === 'login') {
        const accessToken = data.accessToken;
        localStorage.setItem('careerpathse_token', accessToken);
        setCurrentToken(accessToken);
        setMessage('Login successful. Profile loaded below.');
        if (onTokenChange) onTokenChange(accessToken);
      } else {
        setMessage('Registration successful. You can now login.');
      }

      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('careerpathse_token');
    setCurrentToken(null);
    setProfile(null);
    setMessage('Logged out successfully.');
    setError(null);
    if (onTokenChange) onTokenChange(null);
    if (onLogout) onLogout();
  };

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 p-1 text-sm text-slate-400">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setMessage(null);
            setError(null);
          }}
          className={`rounded-full px-4 py-2 transition ${mode === 'login' ? 'bg-brand-500 text-slate-950' : 'hover:bg-slate-800'}`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setMessage(null);
            setError(null);
          }}
          className={`rounded-full px-4 py-2 transition ${mode === 'register' ? 'bg-brand-500 text-slate-950' : 'hover:bg-slate-800'}`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.75rem] border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow">
        {mode === 'register' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Full name
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
                placeholder="Nguyen Van A"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Email address
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
                placeholder="name@example.com"
              />
            </label>
          </div>
        )}

        <div className="space-y-4">
          <label className="space-y-2 text-sm text-slate-300">
            Username
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
              placeholder="student123"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
              placeholder="••••••••"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Login to CareerPathSE' : 'Create an account'}
        </button>
      </form>

      {(message || error) && (
        <div className={`rounded-3xl border px-5 py-4 text-sm ${error ? 'border-red-500 bg-red-500/10 text-red-200' : 'border-emerald-500 bg-emerald-500/10 text-emerald-200'}`}>
          {error || message}
        </div>
      )}

      {token && profile && (
        <div className="space-y-4 rounded-[1.75rem] border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Authenticated profile</p>
              <p className="mt-2 text-lg font-semibold text-white">{profile.fullName || profile.username}</p>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-3xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-brand-400 hover:text-white"
            >
              Logout
            </button>
          </div>
          <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-400">
            <p><strong>Role:</strong> {profile.role}</p>
            <p className="break-all"><strong>Token:</strong> {token.slice(0, 28)}...</p>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-5 text-sm text-slate-400">
        <p className="font-semibold text-slate-100">Backend API integration active</p>
        <p className="mt-2 leading-6">
          This panel calls <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-200">/api/auth/login</code>, <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-200">/api/auth/register</code>, and <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-200">/api/users/profile</code>.
        </p>
      </div>
    </div>
  );
};

export default AuthPanel;
