import { useEffect, useState } from 'react';

const PROFICIENCY = [
  { value: 1, label: 'Beginner', color: '#FF3A5C', bg: 'rgba(255,58,92,0.12)', desc: 'Mới bắt đầu học' },
  { value: 2, label: 'Elementary', color: '#F5D547', bg: 'rgba(245,213,71,0.12)', desc: 'Biết cơ bản' },
  { value: 3, label: 'Intermediate', color: '#3DD7E5', bg: 'rgba(61,215,229,0.12)', desc: 'Ứng dụng được' },
  { value: 4, label: 'Advanced', color: '#5B6BFF', bg: 'rgba(91,107,255,0.12)', desc: 'Thành thạo' },
  { value: 5, label: 'Expert', color: '#2BE08C', bg: 'rgba(43,224,140,0.12)', desc: 'Chuyên gia' },
];

const getScoreGradient = (score) => {
  if (score >= 80) return 'linear-gradient(90deg, #2BE08C, #3DD7E5)';
  if (score >= 60) return 'linear-gradient(90deg, #5B6BFF, #3DD7E5)';
  if (score >= 40) return 'linear-gradient(90deg, #F5D547, #5B6BFF)';
  return 'linear-gradient(90deg, #FF3A5C, #F5D547)';
};

const getScoreColor = (score) => {
  if (score >= 80) return '#2BE08C';
  if (score >= 60) return '#5B6BFF';
  if (score >= 40) return '#F5D547';
  return '#FF3A5C';
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Xuất sắc';
  if (score >= 60) return 'Tốt';
  if (score >= 40) return 'Khá';
  return 'Cần cải thiện';
};

const CategoryIcon = ({ category }) => {
  const icons = {
    'Programming': '💻',
    'Backend': '⚙️',
    'Frontend': '🎨',
    'Database': '🗄️',
    'DevOps': '🚀',
    'Mobile': '📱',
    'AI': '🤖',
    'Security': '🔒',
    'Testing': '🧪',
  };
  const key = Object.keys(icons).find(k => category?.toLowerCase().includes(k.toLowerCase()));
  return <span style={{ fontSize: '1.25rem' }}>{icons[key] || '⚡'}</span>;
};

const SkillAssessmentPanel = ({ token }) => {
  const [skills, setSkills] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [view, setView] = useState('overview'); // 'overview' | 'form' | 'skills'
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [form, setForm] = useState({ skillId: '', score: 50, proficiencyLevel: 3, feedback: '' });
  const [bulkSelections, setBulkSelections] = useState({});

  useEffect(() => {
    if (view === 'bulk') {
      const initial = {};
      unevaluatedSkills.forEach(s => {
        initial[s.id] = { selected: false, score: 50, proficiencyLevel: 3 };
      });
      setBulkSelections(initial);
    }
  }, [view, skills, assessments]);

  useEffect(() => {
    if (token) {
      fetchAll();
    }
  }, [token]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchSkills(), fetchAssessments(), fetchSummary()]);
    setLoading(false);
  };

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (e) { console.error(e); }
  };

  const fetchAssessments = async () => {
    try {
      const res = await fetch('/api/skills/assessments/my-assessments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAssessments(data.assessments || []);
    } catch (e) { console.error(e); }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/skills/assessments/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSummary(data);
    } catch (e) { console.error(e); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: ['skillId', 'proficiencyLevel', 'score'].includes(name) ? Number(value) : value });
  };

  const handleBulkChange = (skillId, field, value) => {
    setBulkSelections(prev => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        [field]: value
      }
    }));
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    const selectedIds = Object.keys(bulkSelections).filter(id => bulkSelections[id].selected);
    if (selectedIds.length === 0) {
      setError("Vui lòng chọn ít nhất một kỹ năng để đánh giá!");
      return;
    }

    setSubmitLoading(true);
    setError(null);
    setMessage(null);

    try {
      const promises = selectedIds.map(skillId => {
        const item = bulkSelections[skillId];
        return fetch('/api/skills/assessments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            skillId: Number(skillId),
            score: item.score,
            proficiencyLevel: item.proficiencyLevel,
            feedback: 'Đánh giá nhanh hàng loạt'
          })
        }).then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Lỗi khi gửi đánh giá');
          return data;
        });
      });

      await Promise.all(promises);
      setMessage(`Đã gửi thành công ${selectedIds.length} đánh giá kỹ năng!`);
      setView('overview');
      fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setMessage(null);
    try {
      const endpoint = editingId ? `/api/skills/assessments/${editingId}` : '/api/skills/assessments';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { score: form.score, proficiencyLevel: form.proficiencyLevel, feedback: form.feedback }
        : { skillId: form.skillId, score: form.score, proficiencyLevel: form.proficiencyLevel, feedback: form.feedback };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Thất bại');

      setMessage(editingId ? 'Cập nhật đánh giá thành công!' : 'Gửi đánh giá thành công!');
      setForm({ skillId: '', score: 50, proficiencyLevel: 3, feedback: '' });
      setEditingId(null);
      setView('overview');
      fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (assessment) => {
    setEditingId(assessment.id);
    setForm({ skillId: '', score: assessment.score, proficiencyLevel: assessment.proficiencyLevel, feedback: assessment.feedback || '' });
    setView('form');
    setError(null);
    setMessage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa đánh giá này?')) return;
    try {
      const res = await fetch(`/api/skills/assessments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('Xóa đánh giá thành công!');
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const categories = ['all', ...new Set(skills.map(s => s.category).filter(Boolean))];
  const filteredSkills = selectedCategory === 'all' ? skills : skills.filter(s => s.category === selectedCategory);
  const assessedSkillIds = new Set(assessments.map(a => a.skill?.id || a.skillId));
  const unevaluatedSkills = skills.filter(s => !assessedSkillIds.has(s.id));
  const proficiencyInfo = PROFICIENCY.find(p => p.value === form.proficiencyLevel);

  if (loading && assessments.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem 0' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid rgba(91,107,255,0.2)',
          borderTopColor: '#5B6BFF',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#9AA0AE', fontSize: '0.9rem' }}>Đang tải dữ liệu kỹ năng...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .skill-card:hover { border-color: rgba(91,107,255,0.5) !important; transform: translateY(-2px); }
        .skill-card { transition: all 0.2s ease !important; }
        .tab-btn:hover { color: #F2F4F8 !important; }
        .action-btn:hover { opacity: 0.85; transform: scale(0.98); }
        .action-btn { transition: all 0.15s ease; }
        .delete-btn:hover { border-color: rgba(255,58,92,0.6) !important; background: rgba(255,58,92,0.15) !important; }
        .range-input { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 999px; outline: none; cursor: pointer; }
        .range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #5B6BFF; cursor: pointer; box-shadow: 0 0 0 4px rgba(91,107,255,0.2); }
      `}</style>

      {/* Header & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{
          display: 'inline-flex', background: '#14151C', border: '1px solid #2A2D38',
          borderRadius: 999, padding: 4, gap: 2
        }}>
          {[
            { key: 'overview', label: '📊 Tổng quan' },
            { key: 'form', label: editingId ? '✏️ Cập nhật' : '➕ Đánh giá mới' },
            { key: 'bulk', label: '⚡ Đánh giá hàng loạt' },
            { key: 'skills', label: '🎯 Kỹ năng' },
          ].map(tab => (
            <button
              key={tab.key}
              className="tab-btn"
              onClick={() => { setView(tab.key); if (tab.key !== 'form') { setEditingId(null); setForm({ skillId: '', score: 50, proficiencyLevel: 3, feedback: '' }); } }}
              style={{
                padding: '8px 18px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 600,
                border: view === tab.key ? '1px solid #5B6BFF' : '1px solid transparent',
                background: view === tab.key ? '#1E2029' : 'transparent',
                color: view === tab.key ? '#F2F4F8' : '#9AA0AE',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          className="action-btn"
          onClick={() => { setView('form'); setEditingId(null); setForm({ skillId: '', score: 50, proficiencyLevel: 3, feedback: '' }); }}
          style={{
            padding: '10px 20px', borderRadius: 10, background: '#5B6BFF',
            color: '#fff', fontWeight: 600, fontSize: '0.875rem',
            border: 'none', cursor: 'pointer',
          }}
        >
          + Thêm đánh giá
        </button>
      </div>

      {/* Alert Messages */}
      {(message || error) && (
        <div style={{
          animation: 'fadeUp 0.3s ease',
          padding: '14px 20px', borderRadius: 12, fontSize: '0.875rem',
          border: `1px solid ${error ? 'rgba(255,58,92,0.4)' : 'rgba(43,224,140,0.4)'}`,
          background: error ? 'rgba(255,58,92,0.08)' : 'rgba(43,224,140,0.08)',
          color: error ? '#FF3A5C' : '#2BE08C',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>{error ? '❌' : '✅'}</span>
          <span>{error || message}</span>
          <button onClick={() => { setError(null); setMessage(null); }}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
        </div>
      )}

      {/* ========== OVERVIEW TAB ========== */}
      {view === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeUp 0.3s ease' }}>
          {/* Stats Row */}
          {summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Tổng đánh giá', value: summary.totalAssessments, icon: '📋', color: '#5B6BFF' },
                { label: 'Điểm trung bình', value: Math.round(summary.averageScore || 0), suffix: '/100', icon: '⭐', color: getScoreColor(summary.averageScore || 0) },
                { label: 'Danh mục kỹ năng', value: Object.keys(summary.categoryBreakdown || {}).length, icon: '🗂️', color: '#3DD7E5' },
                { label: 'Chờ đánh giá', value: unevaluatedSkills.length, icon: '⏳', color: '#F5D547' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: '#14151C', border: '1px solid #2A2D38', borderRadius: 16, padding: '20px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: stat.color, opacity: 0.6 }} />
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{stat.icon}</div>
                  <p style={{ color: '#9AA0AE', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{stat.label}</p>
                  <p style={{ color: stat.color, fontSize: '2rem', fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>
                    {stat.value}<span style={{ fontSize: '0.875rem', color: '#5C6170' }}>{stat.suffix || ''}</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Category Breakdown */}
          {summary?.categoryBreakdown && Object.keys(summary.categoryBreakdown).length > 0 && (
            <div style={{ background: '#14151C', border: '1px solid #2A2D38', borderRadius: 16, padding: '24px' }}>
              <h3 style={{ color: '#F2F4F8', fontWeight: 600, marginBottom: '1rem', fontSize: '1rem' }}>Phân bổ theo danh mục</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(summary.categoryBreakdown).map(([cat, count]) => {
                  const maxCount = Math.max(...Object.values(summary.categoryBreakdown));
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: '#9AA0AE', fontSize: '0.8125rem' }}>{cat}</span>
                        <span style={{ color: '#F2F4F8', fontSize: '0.8125rem', fontWeight: 600 }}>{count} kỹ năng</span>
                      </div>
                      <div style={{ height: 6, background: '#1E2029', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`, borderRadius: 999,
                          background: 'linear-gradient(90deg, #5B6BFF, #3DD7E5)',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* My Assessments */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ color: '#F2F4F8', fontWeight: 600, fontSize: '1.0625rem' }}>
                Đánh giá của tôi
                <span style={{ marginLeft: 8, background: 'rgba(91,107,255,0.15)', color: '#7886FF', borderRadius: 999, padding: '2px 10px', fontSize: '0.8125rem' }}>
                  {assessments.length}
                </span>
              </h3>
            </div>

            {assessments.length === 0 ? (
              <div style={{
                background: '#14151C', border: '1px dashed #2A2D38', borderRadius: 16,
                padding: '3rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                <p style={{ color: '#9AA0AE', marginBottom: '0.5rem' }}>Chưa có đánh giá kỹ năng nào</p>
                <p style={{ color: '#5C6170', fontSize: '0.8125rem' }}>Bắt đầu bằng cách nhấn "Thêm đánh giá"</p>
                <button onClick={() => setView('form')} style={{
                  marginTop: '1rem', padding: '10px 24px', background: '#5B6BFF', color: '#fff',
                  borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                }}>
                  + Thêm đánh giá đầu tiên
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {assessments.map(a => {
                  const profInfo = PROFICIENCY.find(p => p.value === a.proficiencyLevel);
                  return (
                    <div key={a.id} className="skill-card" style={{
                      background: '#14151C', border: '1px solid #2A2D38', borderRadius: 16, padding: '20px',
                      display: 'flex', flexDirection: 'column', gap: '0.875rem',
                    }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: '#F2F4F8', fontWeight: 600, fontSize: '0.9375rem', marginBottom: 2 }}>
                            {a.skill?.name || 'Kỹ năng'}
                          </h4>
                          <span style={{
                            fontSize: '0.75rem', padding: '2px 8px', borderRadius: 999,
                            background: 'rgba(91,107,255,0.12)', color: '#7886FF',
                          }}>
                            {a.skill?.category || 'General'}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace',
                          color: getScoreColor(a.score), lineHeight: 1,
                        }}>
                          {a.score}
                        </div>
                      </div>

                      {/* Score Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.75rem' }}>
                          <span style={{ color: '#9AA0AE' }}>Điểm số</span>
                          <span style={{ color: getScoreColor(a.score), fontWeight: 600 }}>{getScoreLabel(a.score)}</span>
                        </div>
                        <div style={{ height: 6, background: '#1E2029', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${a.score}%`,
                            background: getScoreGradient(a.score), borderRadius: 999,
                          }} />
                        </div>
                      </div>

                      {/* Proficiency Badge */}
                      {profInfo && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: profInfo.bg, border: `1px solid ${profInfo.color}40`,
                          borderRadius: 8, padding: '6px 12px', alignSelf: 'flex-start',
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: profInfo.color }} />
                          <span style={{ color: profInfo.color, fontSize: '0.75rem', fontWeight: 600 }}>
                            Level {a.proficiencyLevel} — {profInfo.label}
                          </span>
                        </div>
                      )}

                      {/* Feedback */}
                      {a.feedback && (
                        <p style={{ color: '#9AA0AE', fontSize: '0.8125rem', lineHeight: 1.5, borderTop: '1px solid #2A2D38', paddingTop: '0.75rem' }}>
                          "{a.feedback}"
                        </p>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                        <button onClick={() => handleEdit(a)} style={{
                          flex: 1, padding: '8px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600,
                          border: '1px solid rgba(91,107,255,0.4)', background: 'rgba(91,107,255,0.08)',
                          color: '#7886FF', cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                          ✏️ Sửa
                        </button>
                        <button onClick={() => handleDelete(a.id)} className="delete-btn" style={{
                          flex: 1, padding: '8px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600,
                          border: '1px solid rgba(255,58,92,0.3)', background: 'rgba(255,58,92,0.06)',
                          color: '#FF3A5C', cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== FORM TAB ========== */}
      {view === 'form' && (
        <div style={{ animation: 'fadeUp 0.3s ease', maxWidth: 640, margin: '0 auto', width: '100%' }}>
          <div style={{ background: '#14151C', border: '1px solid #2A2D38', borderRadius: 20, overflow: 'hidden' }}>
            {/* Form Header */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #2A2D38', background: 'linear-gradient(135deg, rgba(91,107,255,0.08), rgba(61,215,229,0.04))' }}>
              <h3 style={{ color: '#F2F4F8', fontWeight: 700, fontSize: '1.125rem', marginBottom: 4 }}>
                {editingId ? '✏️ Cập nhật đánh giá kỹ năng' : '🎯 Đánh giá kỹ năng mới'}
              </h3>
              <p style={{ color: '#9AA0AE', fontSize: '0.875rem' }}>
                {editingId ? 'Cập nhật điểm số và mức độ thành thạo của bạn' : 'Chọn kỹ năng và tự đánh giá trình độ hiện tại'}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Skill Selector */}
              {!editingId && (
                <div>
                  <label style={{ display: 'block', color: '#9AA0AE', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Chọn kỹ năng
                  </label>
                  <select
                    name="skillId"
                    value={form.skillId}
                    onChange={handleChange}
                    required={!editingId}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: '0.9375rem',
                      background: '#1E2029', border: '1px solid #2A2D38', color: form.skillId ? '#F2F4F8' : '#5C6170',
                      outline: 'none', cursor: 'pointer', appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239AA0AE' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                    }}
                  >
                    <option value="">-- Chọn kỹ năng cần đánh giá --</option>
                    {unevaluatedSkills.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                    ))}
                    {unevaluatedSkills.length === 0 && (
                      <option disabled>✅ Bạn đã đánh giá tất cả kỹ năng!</option>
                    )}
                  </select>
                </div>
              )}

              {/* Score Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label style={{ color: '#9AA0AE', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Điểm tự đánh giá
                  </label>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ color: getScoreColor(form.score), fontSize: '2rem', fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>
                      {form.score}
                    </span>
                    <span style={{ color: '#5C6170', fontSize: '0.875rem' }}>/100</span>
                    <span style={{ marginLeft: 8, fontSize: '0.8125rem', color: getScoreColor(form.score), fontWeight: 600 }}>
                      — {getScoreLabel(form.score)}
                    </span>
                  </div>
                </div>

                <div style={{ background: '#1E2029', borderRadius: 12, padding: '16px' }}>
                  <input
                    type="range"
                    name="score"
                    value={form.score}
                    onChange={handleChange}
                    min="0" max="100"
                    className="range-input"
                    style={{
                      width: '100%',
                      background: `linear-gradient(90deg, ${getScoreColor(form.score)} ${form.score}%, #2A2D38 ${form.score}%)`,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    {[0, 25, 50, 75, 100].map(v => (
                      <span key={v} style={{ color: '#5C6170', fontSize: '0.6875rem' }}>{v}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Proficiency Level */}
              <div>
                <label style={{ display: 'block', color: '#9AA0AE', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  Mức độ thành thạo
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {PROFICIENCY.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm({ ...form, proficiencyLevel: p.value })}
                      style={{
                        flex: 1, minWidth: 80, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                        border: form.proficiencyLevel === p.value ? `1px solid ${p.color}` : '1px solid #2A2D38',
                        background: form.proficiencyLevel === p.value ? p.bg : '#1E2029',
                        color: form.proficiencyLevel === p.value ? p.color : '#9AA0AE',
                        fontWeight: form.proficiencyLevel === p.value ? 700 : 400,
                        fontSize: '0.75rem', transition: 'all 0.15s', textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '1rem', marginBottom: 2 }}>
                        {['🌱', '📚', '⚡', '🔥', '👑'][p.value - 1]}
                      </div>
                      <div>{p.label}</div>
                    </button>
                  ))}
                </div>
                {proficiencyInfo && (
                  <p style={{ color: '#5C6170', fontSize: '0.8125rem', marginTop: 8, fontStyle: 'italic' }}>
                    {proficiencyInfo.desc}
                  </p>
                )}
              </div>

              {/* Feedback */}
              <div>
                <label style={{ display: 'block', color: '#9AA0AE', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Ghi chú (Tùy chọn)
                </label>
                <textarea
                  name="feedback"
                  value={form.feedback}
                  onChange={handleChange}
                  placeholder="Ví dụ: Tôi đã làm 2 dự án thực tế với kỹ năng này..."
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: '0.9375rem',
                    background: '#1E2029', border: '1px solid #2A2D38', color: '#F2F4F8',
                    outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => { setView('overview'); setEditingId(null); }} style={{
                  flex: 1, padding: '14px', borderRadius: 10, fontSize: '0.9375rem', fontWeight: 600,
                  border: '1px solid #3A3D4A', background: 'transparent', color: '#9AA0AE', cursor: 'pointer',
                }}>
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || (!editingId && !form.skillId)}
                  style={{
                    flex: 2, padding: '14px', borderRadius: 10, fontSize: '0.9375rem', fontWeight: 700,
                    background: submitLoading ? '#3A3D4A' : '#5B6BFF', color: '#fff',
                    border: 'none', cursor: submitLoading ? 'not-allowed' : 'pointer',
                    opacity: (!editingId && !form.skillId) ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  {submitLoading ? '⏳ Đang xử lý...' : editingId ? '✅ Cập nhật đánh giá' : '🚀 Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========== BULK TAB ========== */}
      {view === 'bulk' && (
        <div style={{ animation: 'fadeUp 0.3s ease', width: '100%' }}>
          <div style={{ background: '#14151C', border: '1px solid #2A2D38', borderRadius: 20, padding: '28px' }}>
            <h3 style={{ color: '#F2F4F8', fontWeight: 700, fontSize: '1.125rem', marginBottom: 6 }}>
              ⚡ Đánh giá nhanh hàng loạt kỹ năng
            </h3>
            <p style={{ color: '#9AA0AE', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Chọn các kỹ năng bạn muốn tự đánh giá, điều chỉnh điểm số và trình độ thành thạo tương ứng cho mỗi mục, rồi lưu lại toàn bộ chỉ với một lần bấm.
            </p>

            {unevaluatedSkills.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#5C6170' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <p>Bạn đã hoàn thành đánh giá cho tất cả kỹ năng!</p>
              </div>
            ) : (
              <form onSubmit={handleBulkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {unevaluatedSkills.map(skill => {
                    const selection = bulkSelections[skill.id] || { selected: false, score: 50, proficiencyLevel: 3 };
                    return (
                      <div key={skill.id} style={{
                        border: `1px solid ${selection.selected ? '#5B6BFF' : '#2A2D38'}`,
                        background: selection.selected ? 'rgba(91,107,255,0.02)' : 'transparent',
                        borderRadius: 16, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
                        transition: 'all 0.2s ease',
                      }}>
                        {/* Title & Checkbox */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="checkbox"
                            checked={selection.selected}
                            onChange={(e) => handleBulkChange(skill.id, 'selected', e.target.checked)}
                            style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#5B6BFF' }}
                            id={`check-${skill.id}`}
                          />
                          <label htmlFor={`check-${skill.id}`} style={{
                            fontWeight: 600, color: '#F2F4F8', cursor: 'pointer', fontSize: '0.9375rem',
                            display: 'flex', alignItems: 'center', gap: 8
                          }}>
                            <CategoryIcon category={skill.category} />
                            {skill.name}
                            <span style={{ fontSize: '0.75rem', color: '#5C6170', fontWeight: 400 }}>({skill.category})</span>
                          </label>
                        </div>

                        {/* Sliders and level selections (visible only when checkbox is selected) */}
                        {selection.selected && (
                          <div style={{
                            display: 'grid', gridTemplateColumns: '1fr', gap: '1rem',
                            padding: '8px 12px 12px 30px', borderLeft: '2px solid #5B6BFF',
                            animation: 'fadeUp 0.15s ease'
                          }}>
                            {/* Score Slider */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ color: '#9AA0AE', fontSize: '0.75rem', textTransform: 'uppercase' }}>Điểm tự đánh giá:</span>
                                <span style={{ color: getScoreColor(selection.score), fontWeight: 700, fontFamily: 'monospace' }}>
                                  {selection.score}/100 ({getScoreLabel(selection.score)})
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0" max="100"
                                value={selection.score}
                                onChange={(e) => handleBulkChange(skill.id, 'score', Number(e.target.value))}
                                className="range-input"
                                style={{
                                  width: '100%',
                                  background: `linear-gradient(90deg, ${getScoreColor(selection.score)} ${selection.score}%, #2A2D38 ${selection.score}%)`,
                                }}
                              />
                            </div>

                            {/* Level Selector */}
                            <div>
                              <div style={{ color: '#9AA0AE', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 6 }}>Mức độ thành thạo:</div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {PROFICIENCY.map(p => (
                                  <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => handleBulkChange(skill.id, 'proficiencyLevel', p.value)}
                                    style={{
                                      padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                                      border: selection.proficiencyLevel === p.value ? `1px solid ${p.color}` : '1px solid #2A2D38',
                                      background: selection.proficiencyLevel === p.value ? p.bg : '#1E2029',
                                      color: selection.proficiencyLevel === p.value ? p.color : '#9AA0AE',
                                      fontWeight: selection.proficiencyLevel === p.value ? 700 : 400,
                                      fontSize: '0.75rem', transition: 'all 0.1s',
                                    }}
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: '1rem' }}>
                  <button type="button" onClick={() => setView('overview')} style={{
                    flex: 1, padding: '14px', borderRadius: 10, fontSize: '0.9375rem', fontWeight: 600,
                    border: '1px solid #3A3D4A', background: 'transparent', color: '#9AA0AE', cursor: 'pointer',
                  }}>
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading || Object.keys(bulkSelections).filter(id => bulkSelections[id].selected).length === 0}
                    style={{
                      flex: 2, padding: '14px', borderRadius: 10, fontSize: '0.9375rem', fontWeight: 700,
                      background: submitLoading ? '#3A3D4A' : '#5B6BFF', color: '#fff',
                      border: 'none', cursor: submitLoading ? 'not-allowed' : 'pointer',
                      opacity: Object.keys(bulkSelections).filter(id => bulkSelections[id].selected).length === 0 ? 0.5 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    {submitLoading ? '⏳ Đang lưu...' : `🚀 Gửi ${Object.keys(bulkSelections).filter(id => bulkSelections[id].selected).length} đánh giá`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========== SKILLS TAB ========== */}
      {view === 'skills' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeUp 0.3s ease' }}>
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 16px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 600,
                  border: selectedCategory === cat ? '1px solid #5B6BFF' : '1px solid #2A2D38',
                  background: selectedCategory === cat ? 'rgba(91,107,255,0.15)' : '#14151C',
                  color: selectedCategory === cat ? '#7886FF' : '#9AA0AE',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {cat === 'all' ? '🌐 Tất cả' : cat}
              </button>
            ))}
          </div>

          {/* Skills Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {filteredSkills.map(skill => {
              const assessed = assessments.find(a => a.skill?.id === skill.id || a.skillId === skill.id);
              return (
                <div key={skill.id} className="skill-card" style={{
                  background: '#14151C', border: `1px solid ${assessed ? 'rgba(43,224,140,0.2)' : '#2A2D38'}`,
                  borderRadius: 16, padding: '18px', position: 'relative', overflow: 'hidden',
                }}>
                  {assessed && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #2BE08C, #3DD7E5)' }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: assessed ? 'rgba(43,224,140,0.1)' : 'rgba(91,107,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <CategoryIcon category={skill.category} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <h4 style={{ color: '#F2F4F8', fontWeight: 600, fontSize: '0.9375rem', margin: 0 }}>
                          {skill.name}
                        </h4>
                        {assessed ? (
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace',
                            color: getScoreColor(assessed.score),
                          }}>
                            {assessed.score}pts
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 999,
                            background: 'rgba(245,213,71,0.1)', color: '#F5D547', fontWeight: 600,
                          }}>
                            Chưa đánh giá
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#5C6170', fontSize: '0.75rem', margin: '2px 0 0 0' }}>{skill.category}</p>
                    </div>
                  </div>

                  {skill.description && (
                    <p style={{ color: '#9AA0AE', fontSize: '0.8125rem', lineHeight: 1.5, marginTop: 12 }}>
                      {skill.description}
                    </p>
                  )}

                  {assessed ? (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ height: 4, background: '#1E2029', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${assessed.score}%`,
                          background: getScoreGradient(assessed.score), borderRadius: 999,
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                        <span style={{ color: '#2BE08C', fontSize: '0.75rem' }}>✓ Đã đánh giá</span>
                        <button onClick={() => handleEdit(assessed)} style={{
                          fontSize: '0.75rem', color: '#7886FF', background: 'none', border: 'none', cursor: 'pointer',
                        }}>
                          Sửa →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setForm({ ...form, skillId: skill.id });
                        setView('form');
                        setEditingId(null);
                      }}
                      style={{
                        width: '100%', marginTop: 12, padding: '8px', borderRadius: 8, fontSize: '0.8125rem',
                        border: '1px dashed rgba(91,107,255,0.4)', background: 'rgba(91,107,255,0.05)',
                        color: '#7886FF', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s',
                      }}
                    >
                      + Đánh giá ngay
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {filteredSkills.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#5C6170' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <p>Không có kỹ năng nào trong danh mục này</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillAssessmentPanel;
