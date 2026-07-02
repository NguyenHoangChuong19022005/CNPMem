import { useEffect, useState } from 'react';

const PHASE_CONFIG = {
  'Foundation': { color: '#F5D547', bg: 'rgba(245,213,71,0.10)', icon: '🌱', label: 'Nền tảng' },
  'Core Skills': { color: '#3DD7E5', bg: 'rgba(61,215,229,0.10)', icon: '⚡', label: 'Kỹ năng cốt lõi' },
  'Advanced': { color: '#5B6BFF', bg: 'rgba(91,107,255,0.10)', icon: '🔥', label: 'Nâng cao' },
  'Project': { color: '#2BE08C', bg: 'rgba(43,224,140,0.10)', icon: '🚀', label: 'Dự án thực tế' },
};

const LearningRoadmapPanel = ({ token }) => {
  const [myRoadmaps, setMyRoadmaps] = useState([]);
  const [allRoadmaps, setAllRoadmaps] = useState([]);
  const [selectedUserRoadmap, setSelectedUserRoadmap] = useState(null);
  const [roadmapDetail, setRoadmapDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState('my'); // 'my' | 'browse' | 'detail'
  const [updatingStep, setUpdatingStep] = useState(null);

  useEffect(() => {
    if (token) {
      fetchMyRoadmaps();
      fetchAllRoadmaps();
    }
  }, [token]);

  const fetchMyRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/roadmaps/my-roadmaps', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tải roadmap');
      setMyRoadmaps(data.roadmaps || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRoadmaps = async () => {
    try {
      const res = await fetch('/api/roadmaps', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAllRoadmaps(data.roadmaps || []);
    } catch (e) { console.error(e); }
  };

  const fetchRoadmapDetail = async (userRoadmapId) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/roadmaps/my-roadmaps/${userRoadmapId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tải chi tiết');
      setRoadmapDetail(data);
      setView('detail');
    } catch (e) {
      setError(e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEnroll = async (roadmapId) => {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/roadmaps/${roadmapId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi đăng ký');
      setMessage('Đã đăng ký lộ trình thành công! 🎉');
      fetchMyRoadmaps();
      setView('my');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleToggleStep = async (stepId, isCompleted) => {
    if (!roadmapDetail) return;
    setUpdatingStep(stepId);
    try {
      const res = await fetch(`/api/roadmaps/progress/${stepId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRoadmapId: roadmapDetail.userRoadmapId, isCompleted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật');

      // Update local state
      setRoadmapDetail(prev => ({
        ...prev,
        completedSteps: data.completedSteps,
        progressPercent: data.progressPercent,
        status: data.progressPercent === 100 ? 'COMPLETED' : 'IN_PROGRESS',
        steps: prev.steps.map(s => s.id === stepId ? { ...s, isCompleted } : s),
      }));

      // Update list card too
      setMyRoadmaps(prev => prev.map(r =>
        r.userRoadmapId === roadmapDetail.userRoadmapId
          ? { ...r, completedSteps: data.completedSteps, progressPercent: data.progressPercent }
          : r
      ));
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdatingStep(null);
    }
  };

  const isEnrolled = (roadmapId) => myRoadmaps.some(r => r.roadmapId === roadmapId);
  const getMyRoadmapForId = (roadmapId) => myRoadmaps.find(r => r.roadmapId === roadmapId);

  const phaseGroups = roadmapDetail ? roadmapDetail.steps.reduce((acc, step) => {
    const phase = step.phase || 'Foundation';
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(step);
    return acc;
  }, {}) : {};

  const phaseOrder = ['Foundation', 'Core Skills', 'Advanced', 'Project'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .rm-card:hover { border-color: rgba(91,107,255,0.5) !important; transform: translateY(-2px); }
        .rm-card { transition: all 0.2s ease !important; cursor: pointer; }
        .tab-btn:hover { color: #F2F4F8 !important; }
        .step-row:hover { background: rgba(91,107,255,0.05) !important; }
        .step-row { transition: background 0.15s ease; }
        .enroll-btn:hover { opacity: 0.85; transform: scale(0.98); }
        .enroll-btn { transition: all 0.15s ease; }
      `}</style>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{
          display: 'inline-flex', background: '#14151C', border: '1px solid #2A2D38',
          borderRadius: 999, padding: 4, gap: 2
        }}>
          {[
            { key: 'my', label: '📋 Lộ trình của tôi', count: myRoadmaps.length },
            { key: 'browse', label: '🔍 Khám phá lộ trình' },
          ].map(tab => (
            <button key={tab.key} className="tab-btn" onClick={() => { setView(tab.key); setRoadmapDetail(null); }}
              style={{
                padding: '8px 18px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 600,
                border: view === tab.key || (view === 'detail' && tab.key === 'my') ? '1px solid #5B6BFF' : '1px solid transparent',
                background: view === tab.key || (view === 'detail' && tab.key === 'my') ? '#1E2029' : 'transparent',
                color: view === tab.key || (view === 'detail' && tab.key === 'my') ? '#F2F4F8' : '#9AA0AE',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}>
              {tab.label}
              {tab.count !== undefined && (
                <span style={{ marginLeft: 6, background: 'rgba(91,107,255,0.2)', color: '#7886FF', borderRadius: 999, padding: '1px 8px', fontSize: '0.75rem' }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        {view === 'detail' && (
          <button onClick={() => { setView('my'); setRoadmapDetail(null); }}
            style={{ color: '#7886FF', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
            ← Quay lại
          </button>
        )}
      </div>

      {/* Alert */}
      {(message || error) && (
        <div style={{
          animation: 'fadeUp 0.3s ease', padding: '14px 20px', borderRadius: 12, fontSize: '0.875rem',
          border: `1px solid ${error ? 'rgba(255,58,92,0.4)' : 'rgba(43,224,140,0.4)'}`,
          background: error ? 'rgba(255,58,92,0.08)' : 'rgba(43,224,140,0.08)',
          color: error ? '#FF3A5C' : '#2BE08C', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>{error ? '❌' : '✅'}</span>
          <span>{error || message}</span>
          <button onClick={() => { setError(null); setMessage(null); }}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(91,107,255,0.2)', borderTopColor: '#5B6BFF', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {/* ========== MY ROADMAPS VIEW ========== */}
      {view === 'my' && !loading && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          {myRoadmaps.length === 0 ? (
            <div style={{
              background: '#14151C', border: '1px dashed #2A2D38', borderRadius: 20,
              padding: '4rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🗺️</div>
              <p style={{ color: '#F2F4F8', fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>Chưa có lộ trình nào</p>
              <p style={{ color: '#5C6170', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Khám phá và đăng ký lộ trình học tập phù hợp với mục tiêu nghề nghiệp của bạn.
              </p>
              <button onClick={() => setView('browse')} style={{
                padding: '12px 28px', background: '#5B6BFF', color: '#fff',
                borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
              }}>
                🔍 Khám phá lộ trình
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {myRoadmaps.map(rm => (
                <div key={rm.userRoadmapId} className="rm-card"
                  onClick={() => { setSelectedUserRoadmap(rm); fetchRoadmapDetail(rm.userRoadmapId); }}
                  style={{ background: '#14151C', border: '1px solid #2A2D38', borderRadius: 18, padding: '22px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#F2F4F8', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{rm.title}</h4>
                      <span style={{
                        fontSize: '0.75rem', padding: '2px 10px', borderRadius: 999,
                        background: 'rgba(91,107,255,0.12)', color: '#7886FF',
                      }}>{rm.careerTitle}</span>
                    </div>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                      background: rm.status === 'COMPLETED' ? 'rgba(43,224,140,0.12)' : 'rgba(245,213,71,0.12)',
                      color: rm.status === 'COMPLETED' ? '#2BE08C' : '#F5D547',
                      border: `1px solid ${rm.status === 'COMPLETED' ? 'rgba(43,224,140,0.3)' : 'rgba(245,213,71,0.3)'}`,
                    }}>
                      {rm.status === 'COMPLETED' ? '✅ Hoàn thành' : '📖 Đang học'}
                    </span>
                  </div>

                  {/* Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
                      <span style={{ color: '#9AA0AE' }}>Tiến độ</span>
                      <span style={{ color: rm.progressPercent >= 80 ? '#2BE08C' : rm.progressPercent >= 50 ? '#5B6BFF' : '#F5D547', fontWeight: 700 }}>
                        {rm.completedSteps}/{rm.totalSteps} bước ({rm.progressPercent}%)
                      </span>
                    </div>
                    <div style={{ height: 8, background: '#1E2029', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 999, transition: 'width 0.6s ease',
                        width: `${rm.progressPercent}%`,
                        background: rm.progressPercent === 100
                          ? 'linear-gradient(90deg, #2BE08C, #3DD7E5)'
                          : rm.progressPercent >= 50
                            ? 'linear-gradient(90deg, #5B6BFF, #3DD7E5)'
                            : 'linear-gradient(90deg, #F5D547, #5B6BFF)',
                      }} />
                    </div>
                  </div>

                  <div style={{ color: '#7886FF', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right' }}>
                    Xem chi tiết →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== BROWSE ROADMAPS VIEW ========== */}
      {view === 'browse' && (
        <div style={{ animation: 'fadeUp 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: '#9AA0AE', fontSize: '0.875rem' }}>
            Chọn lộ trình phù hợp với mục tiêu nghề nghiệp của bạn và bắt đầu hành trình học tập.
          </p>
          {allRoadmaps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#5C6170' }}>Chưa có lộ trình nào trong hệ thống.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {allRoadmaps.map(rm => {
                const enrolled = isEnrolled(rm.id);
                const myRm = getMyRoadmapForId(rm.id);
                return (
                  <div key={rm.id} style={{
                    background: '#14151C', border: `1px solid ${enrolled ? 'rgba(43,224,140,0.3)' : '#2A2D38'}`,
                    borderRadius: 18, padding: '22px', display: 'flex', flexDirection: 'column', gap: '1rem',
                  }}>
                    <div>
                      <h4 style={{ color: '#F2F4F8', fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{rm.title}</h4>
                      <span style={{
                        fontSize: '0.75rem', padding: '2px 10px', borderRadius: 999,
                        background: 'rgba(91,107,255,0.12)', color: '#7886FF',
                      }}>{rm.careerTitle}</span>
                    </div>

                    <p style={{ color: '#9AA0AE', fontSize: '0.8125rem', lineHeight: 1.6 }}>{rm.description}</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#5C6170', fontSize: '0.8rem' }}>
                      <span>📌</span>
                      <span>{rm.totalSteps} bước học tập</span>
                    </div>

                    {enrolled ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ height: 6, background: '#1E2029', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${myRm?.progressPercent || 0}%`, borderRadius: 999, background: 'linear-gradient(90deg, #2BE08C, #3DD7E5)' }} />
                        </div>
                        <button
                          onClick={() => { setSelectedUserRoadmap(myRm); fetchRoadmapDetail(myRm.userRoadmapId); }}
                          style={{
                            padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: '0.875rem',
                            border: '1px solid rgba(43,224,140,0.4)', background: 'rgba(43,224,140,0.08)',
                            color: '#2BE08C', cursor: 'pointer',
                          }}>
                          ✅ Đã đăng ký — Tiếp tục học ({myRm?.progressPercent || 0}%)
                        </button>
                      </div>
                    ) : (
                      <button className="enroll-btn"
                        onClick={() => handleEnroll(rm.id)}
                        style={{
                          padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: '0.875rem',
                          border: 'none', background: '#5B6BFF', color: '#fff', cursor: 'pointer',
                        }}>
                        🚀 Đăng ký lộ trình này
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========== ROADMAP DETAIL VIEW ========== */}
      {view === 'detail' && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          {detailLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(91,107,255,0.2)', borderTopColor: '#5B6BFF', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : roadmapDetail && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Header Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(91,107,255,0.1), rgba(61,215,229,0.05))',
                border: '1px solid rgba(91,107,255,0.3)', borderRadius: 20, padding: '28px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <p style={{ color: '#7886FF', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                      {roadmapDetail.careerTitle}
                    </p>
                    <h2 style={{ color: '#F2F4F8', fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>{roadmapDetail.title}</h2>
                    <p style={{ color: '#9AA0AE', fontSize: '0.875rem' }}>{roadmapDetail.description}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'monospace', color: roadmapDetail.progressPercent === 100 ? '#2BE08C' : '#5B6BFF' }}>
                      {roadmapDetail.progressPercent}%
                    </div>
                    <div style={{ color: '#9AA0AE', fontSize: '0.8rem' }}>
                      {roadmapDetail.completedSteps}/{roadmapDetail.totalSteps} bước
                    </div>
                  </div>
                </div>

                {/* Big Progress Bar */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ height: 12, background: '#1E2029', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 999, transition: 'width 0.6s ease',
                      width: `${roadmapDetail.progressPercent}%`,
                      background: roadmapDetail.progressPercent === 100
                        ? 'linear-gradient(90deg, #2BE08C, #3DD7E5)'
                        : 'linear-gradient(90deg, #5B6BFF, #3DD7E5)',
                    }} />
                  </div>
                  {roadmapDetail.progressPercent === 100 && (
                    <p style={{ marginTop: 8, color: '#2BE08C', fontWeight: 700, fontSize: '0.875rem', textAlign: 'center' }}>
                      🎉 Chúc mừng! Bạn đã hoàn thành lộ trình này!
                    </p>
                  )}
                </div>
              </div>

              {/* Phases */}
              {phaseOrder.map(phase => {
                const phaseSteps = phaseGroups[phase];
                if (!phaseSteps || phaseSteps.length === 0) return null;
                const cfg = PHASE_CONFIG[phase] || PHASE_CONFIG['Foundation'];
                const phaseCompleted = phaseSteps.filter(s => s.isCompleted).length;
                const phasePct = Math.round((phaseCompleted / phaseSteps.length) * 100);

                return (
                  <div key={phase} style={{ background: '#14151C', border: '1px solid #2A2D38', borderRadius: 18, overflow: 'hidden' }}>
                    {/* Phase Header */}
                    <div style={{
                      padding: '16px 22px', borderBottom: '1px solid #2A2D38',
                      background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.25rem' }}>{cfg.icon}</span>
                        <div>
                          <p style={{ color: cfg.color, fontWeight: 700, fontSize: '0.9375rem' }}>{cfg.label}</p>
                          <p style={{ color: '#5C6170', fontSize: '0.75rem' }}>{phaseSteps.length} bước</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 80, height: 6, background: '#1E2029', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${phasePct}%`, background: cfg.color, borderRadius: 999, transition: 'width 0.4s ease' }} />
                        </div>
                        <span style={{ color: cfg.color, fontSize: '0.8rem', fontWeight: 700, minWidth: 40, textAlign: 'right' }}>
                          {phaseCompleted}/{phaseSteps.length}
                        </span>
                      </div>
                    </div>

                    {/* Steps */}
                    <div>
                      {phaseSteps.map((step, idx) => (
                        <div key={step.id} className="step-row" style={{
                          display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 22px',
                          borderBottom: idx < phaseSteps.length - 1 ? '1px solid #1E2029' : 'none',
                          background: step.isCompleted ? 'rgba(43,224,140,0.03)' : 'transparent',
                        }}>
                          {/* Checkbox */}
                          <div style={{ paddingTop: 2 }}>
                            <button
                              disabled={updatingStep === step.id}
                              onClick={() => handleToggleStep(step.id, !step.isCompleted)}
                              style={{
                                width: 24, height: 24, borderRadius: 6, cursor: 'pointer',
                                border: `2px solid ${step.isCompleted ? '#2BE08C' : '#3A3D4A'}`,
                                background: step.isCompleted ? '#2BE08C' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s ease', flexShrink: 0,
                                animation: updatingStep === step.id ? 'pulse 0.6s ease infinite' : 'none',
                              }}>
                              {step.isCompleted && <span style={{ color: '#0A0D14', fontSize: '0.85rem', fontWeight: 900 }}>✓</span>}
                            </button>
                          </div>

                          {/* Step Info */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ color: '#5C6170', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                                {String(step.stepOrder).padStart(2, '0')}
                              </span>
                              <h4 style={{
                                color: step.isCompleted ? '#5C6170' : '#F2F4F8',
                                fontWeight: 600, fontSize: '0.9375rem',
                                textDecoration: step.isCompleted ? 'line-through' : 'none',
                                transition: 'all 0.2s ease',
                              }}>
                                {step.topicName}
                              </h4>
                            </div>
                            {step.description && (
                              <p style={{ color: '#9AA0AE', fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: 6 }}>
                                {step.description}
                              </p>
                            )}
                            {step.contentUrl && (
                              <a href={step.contentUrl} target="_blank" rel="noreferrer"
                                style={{ color: '#5B6BFF', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}
                                onClick={e => e.stopPropagation()}>
                                📎 Tài liệu học →
                              </a>
                            )}
                          </div>

                          {/* Status Badge */}
                          {step.isCompleted && (
                            <span style={{
                              fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, flexShrink: 0,
                              background: 'rgba(43,224,140,0.12)', color: '#2BE08C', border: '1px solid rgba(43,224,140,0.25)',
                            }}>Hoàn thành</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LearningRoadmapPanel;
