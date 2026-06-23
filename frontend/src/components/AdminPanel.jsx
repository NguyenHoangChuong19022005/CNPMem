import { useEffect, useState } from 'react';

const AdminPanel = ({ token }) => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'skills' | 'careers'
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Forms states
  const [skillForm, setSkillForm] = useState({
    name: '',
    description: '',
    category: 'Backend',
    proficiencyLevel: 3
  });

  const [careerForm, setCareerForm] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requirements: '',
    seniority: 'ENTRY_LEVEL',
    salaryRange: '15M - 25M VND',
    experienceYearsRequired: 0
  });

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'users') {
        const res = await fetch('/api/users/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load users');
        setUsers(data.users || []);
      } else if (activeTab === 'skills') {
        const res = await fetch('/api/skills', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load skills');
        setSkills(data.skills || []);
      } else if (activeTab === 'careers') {
        const res = await fetch('/api/careers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load careers');
        setCareers(data.careers || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(skillForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create skill');
      
      setMessage('Tạo kỹ năng mới thành công!');
      setSkillForm({ name: '', description: '', category: 'Backend', proficiencyLevel: 3 });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kỹ năng này?')) return;
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/skills/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete skill');
      setMessage('Xóa kỹ năng thành công!');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateCareer = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(careerForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create career');

      setMessage('Tạo ngành nghề mới thành công!');
      setCareerForm({
        title: '',
        description: '',
        responsibilities: '',
        requirements: '',
        seniority: 'ENTRY_LEVEL',
        salaryRange: '15M - 25M VND',
        experienceYearsRequired: 0
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCareer = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ngành nghề này?')) return;
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/careers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete career');
      setMessage('Xóa ngành nghề thành công!');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        {[
          { key: 'users', label: '👥 Quản lý thành viên' },
          { key: 'skills', label: '🎯 Quản lý kỹ năng' },
          { key: 'careers', label: '💼 Quản lý công việc' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setError(null);
              setMessage(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      {(message || error) && (
        <div className={`rounded-3xl border px-5 py-4 text-sm ${
          error ? 'border-red-500 bg-red-500/10 text-red-200' : 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
        }`}>
          {error || message}
        </div>
      )}

      {loading && (
        <p className="text-slate-400 text-center py-6">Đang tải dữ liệu hệ thống...</p>
      )}

      {/* users management */}
      {!loading && activeTab === 'users' && (
        <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow overflow-x-auto">
          <h3 className="text-xl font-bold text-white mb-4">Danh sách thành viên ({users.length})</h3>
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-widest text-slate-500 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Tài khoản</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Vai trò</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-mono text-slate-500">{u.id}</td>
                  <td className="py-3 px-4 font-semibold text-white">{u.username}</td>
                  <td className="py-3 px-4">{u.fullName || <span className="text-slate-600 font-light">Chưa cập nhật</span>}</td>
                  <td className="py-3 px-4 break-all">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'ROLE_ADMIN' 
                        ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' 
                        : 'bg-brand-500/10 text-brand-300 border border-brand-500/20'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* skills management */}
      {!loading && activeTab === 'skills' && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* List */}
          <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow space-y-4">
            <h3 className="text-xl font-bold text-white">Danh sách kỹ năng ({skills.length})</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {skills.map(s => (
                <div key={s.id} className="flex flex-col justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-white">{s.name}</h4>
                      <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 text-xs border border-brand-500/20">{s.category}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{s.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-500">Chuẩn Level: {s.proficiencyLevel || 3}</span>
                    <button
                      onClick={() => handleDeleteSkill(s.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow h-fit">
            <h3 className="text-xl font-bold text-white mb-4">Thêm kỹ năng mới</h3>
            <form onSubmit={handleCreateSkill} className="space-y-4">
              <label className="block space-y-1 text-sm text-slate-300">
                Tên kỹ năng
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: React, Java, Docker..."
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                />
              </label>

              <label className="block space-y-1 text-sm text-slate-300">
                Nhóm danh mục
                <select
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                >
                  {['Backend', 'Frontend', 'Database', 'DevOps', 'Mobile', 'AI', 'Security', 'Testing'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1 text-sm text-slate-300">
                Cấp độ chuẩn tối thiểu (1 - 5)
                <input
                  type="number"
                  min="1" max="5"
                  required
                  value={skillForm.proficiencyLevel}
                  onChange={(e) => setSkillForm({ ...skillForm, proficiencyLevel: Number(e.target.value) })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                />
              </label>

              <label className="block space-y-1 text-sm text-slate-300">
                Mô tả chi tiết
                <textarea
                  placeholder="Nhập mô tả ngắn về yêu cầu kỹ năng này..."
                  rows={3}
                  value={skillForm.description}
                  onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400 resize-none"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition"
              >
                🚀 Thêm kỹ năng
              </button>
            </form>
          </div>
        </div>
      )}

      {/* careers management */}
      {!loading && activeTab === 'careers' && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* List */}
          <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow space-y-4">
            <h3 className="text-xl font-bold text-white">Danh mục định hướng công việc ({careers.length})</h3>
            <div className="space-y-3">
              {careers.map(c => (
                <div key={c.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white text-base">{c.title}</h4>
                      <span className="inline-block mt-1 text-xs text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                        {c.seniority}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteCareer(c.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      🗑️ Xóa công việc
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-3">{c.description}</p>
                  <div className="grid gap-2 sm:grid-cols-2 text-xs text-slate-500 pt-3 border-t border-slate-800">
                    <div>
                      <span className="font-semibold text-slate-300">Dải lương:</span> {c.salaryRange}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-300">Kinh nghiệm:</span> {c.experienceYearsRequired} năm
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow h-fit">
            <h3 className="text-xl font-bold text-white mb-4">Thêm ngành nghề mới</h3>
            <form onSubmit={handleCreateCareer} className="space-y-4">
              <label className="block space-y-1 text-sm text-slate-300">
                Tên công việc
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Devops Engineer, Data Scientist..."
                  value={careerForm.title}
                  onChange={(e) => setCareerForm({ ...careerForm, title: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1 text-sm text-slate-300">
                  Cấp bậc (Seniority)
                  <select
                    value={careerForm.seniority}
                    onChange={(e) => setCareerForm({ ...careerForm, seniority: e.target.value })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                  >
                    <option value="ENTRY_LEVEL">ENTRY LEVEL</option>
                    <option value="MID_LEVEL">MID LEVEL</option>
                    <option value="SENIOR_LEVEL">SENIOR LEVEL</option>
                  </select>
                </label>

                <label className="block space-y-1 text-sm text-slate-300">
                  Kinh nghiệm (năm)
                  <input
                    type="number"
                    min="0"
                    required
                    value={careerForm.experienceYearsRequired}
                    onChange={(e) => setCareerForm({ ...careerForm, experienceYearsRequired: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              <label className="block space-y-1 text-sm text-slate-300">
                Dải thu nhập (Lương)
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 20M - 35M VND"
                  value={careerForm.salaryRange}
                  onChange={(e) => setCareerForm({ ...careerForm, salaryRange: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                />
              </label>

              <label className="block space-y-1 text-sm text-slate-300">
                Mô tả ngành nghề
                <textarea
                  placeholder="Nhập mô tả chi tiết về ngành nghề này..."
                  rows={2}
                  value={careerForm.description}
                  onChange={(e) => setCareerForm({ ...careerForm, description: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400 resize-none"
                />
              </label>

              <label className="block space-y-1 text-sm text-slate-300">
                Trách nhiệm chính
                <textarea
                  placeholder="Các công việc hàng ngày phải thực hiện..."
                  rows={2}
                  value={careerForm.responsibilities}
                  onChange={(e) => setCareerForm({ ...careerForm, responsibilities: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400 resize-none"
                />
              </label>

              <label className="block space-y-1 text-sm text-slate-300">
                Yêu cầu chung khác
                <textarea
                  placeholder="Yêu cầu bổ sung về kỹ năng mềm, ngoại ngữ..."
                  rows={2}
                  value={careerForm.requirements}
                  onChange={(e) => setCareerForm({ ...careerForm, requirements: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400 resize-none"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition"
              >
                🚀 Thêm ngành nghề
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
