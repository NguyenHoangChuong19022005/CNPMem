import { useEffect, useState } from 'react';

const UserProfilePanel = ({ token, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
  });

  const [passwordMode, setPasswordMode] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch profile');
      }

      setProfile(data);
      setEditForm({
        fullName: data.fullName || '',
        email: data.email || '',
      });
      setError(null);
    } catch (err) {
      setError('Failed to load profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const submitProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: editForm.fullName,
          email: editForm.email,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update profile');
      }

      setProfile(data.user);
      setMessage('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password do not match!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long!');
      return;
    }

    setPasswordLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to change password');
      }

      setMessage('Password changed successfully!');
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordMode(false);
    } catch (err) {
      setError('Failed to change password: ' + err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to delete account');
      }

      setMessage('Account deleted. Logging out...');
      setTimeout(() => {
        onLogout();
      }, 2000);
    } catch (err) {
      setError('Failed to delete account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-12 text-center">
        <p className="text-slate-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {(message || error) && (
        <div className={`rounded-3xl border px-5 py-4 text-sm ${error ? 'border-red-500 bg-red-500/10 text-red-200' : 'border-emerald-500 bg-emerald-500/10 text-emerald-200'}`}>
          {error || message}
        </div>
      )}

      {/* Profile Overview */}
      {profile && !editMode && !passwordMode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-white">Profile Information</h3>
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 text-sm rounded-full border border-brand-500/50 text-brand-400 hover:bg-brand-500/10 transition"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400">Username</p>
              <p className="mt-3 text-lg font-semibold text-white">{profile.username}</p>
            </div>

            <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400">Role</p>
              <p className="mt-3 text-lg font-semibold text-white">{profile.role}</p>
            </div>

            <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400">Full Name</p>
              <p className="mt-3 text-lg font-semibold text-white">{profile.fullName || 'Not set'}</p>
            </div>

            <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400">Email</p>
              <p className="mt-3 text-lg font-semibold text-white break-all">{profile.email}</p>
            </div>
          </div>

          {/* Security Actions */}
          <div className="space-y-3 pt-4">
            <h4 className="font-semibold text-white">Security</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={() => setPasswordMode(true)}
                className="rounded-3xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-brand-400 hover:text-white"
              >
                Change Password
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="rounded-3xl border border-red-500/50 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      {editMode && (
        <form onSubmit={submitProfileUpdate} className="space-y-5 rounded-[1.75rem] border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-white">Edit Profile</h3>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="text-sm text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-4">
            <label className="space-y-2 text-sm text-slate-300">
              Full Name
              <input
                type="text"
                name="fullName"
                value={editForm.fullName}
                onChange={handleEditChange}
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
                placeholder="Enter your full name"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              Email Address
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                required
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
                placeholder="your@email.com"
              />
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="flex-1 rounded-3xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-brand-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Change Password Form */}
      {passwordMode && (
        <form onSubmit={submitPasswordChange} className="space-y-5 rounded-[1.75rem] border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-white">Change Password</h3>
            <button
              type="button"
              onClick={() => setPasswordMode(false)}
              className="text-sm text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
          </div>

          <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Password Requirements</p>
            <ul className="space-y-1 text-xs">
              <li>• At least 6 characters long</li>
              <li>• Use a strong, unique password</li>
            </ul>
          </div>

          <div className="space-y-4">
            <label className="space-y-2 text-sm text-slate-300">
              Current Password
              <input
                type="password"
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                required
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
                placeholder="••••••••"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              New Password
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
                placeholder="••••••••"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              Confirm New Password
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
                placeholder="••••••••"
              />
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setPasswordMode(false)}
              className="flex-1 rounded-3xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-brand-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex-1 rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-5 text-sm text-slate-400">
        <p className="font-semibold text-slate-100">User Profile Integration</p>
        <p className="mt-2 leading-6">
          This panel uses profile APIs: <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-200">GET /api/users/profile</code>, <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-200">PUT /api/users/profile</code>, and <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-200">PUT /api/users/change-password</code>.
        </p>
      </div>
    </div>
  );
};

export default UserProfilePanel;
