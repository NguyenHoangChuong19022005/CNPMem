import { useEffect, useState } from 'react';

const SkillAssessmentPanel = ({ token }) => {
  const [skills, setSkills] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  const [form, setForm] = useState({
    skillId: '',
    score: 50,
    proficiencyLevel: 3,
    feedback: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (token) {
      fetchSkills();
      fetchAssessments();
      fetchSummary();
    }
  }, [token]);

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch skills');
      }
      setSkills(data.skills || []);
    } catch (err) {
      setError('Failed to load skills: ' + err.message);
    }
  };

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/skills/assessments/my-assessments', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch assessments');
      }
      setAssessments(data.assessments || []);
    } catch (err) {
      setError('Failed to load assessments: ' + err.message);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/skills/assessments/summary', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch summary');
      }
      setSummary(data);
    } catch (err) {
      console.error('Failed to load summary:', err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'skillId' || name === 'proficiencyLevel' || name === 'score' 
        ? Number(value) 
        : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const endpoint = editingId 
        ? `/api/skills/assessments/${editingId}`
        : '/api/skills/assessments';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillId: !editingId ? form.skillId : undefined,
          score: form.score,
          proficiencyLevel: form.proficiencyLevel,
          feedback: form.feedback,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to submit assessment');
      }

      setMessage(editingId ? 'Assessment updated successfully!' : 'Assessment submitted successfully!');
      setForm({ skillId: '', score: 50, proficiencyLevel: 3, feedback: '' });
      setEditingId(null);
      
      fetchAssessments();
      fetchSummary();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assessment) => {
    setEditingId(assessment.id);
    setForm({
      skillId: '',
      score: assessment.score,
      proficiencyLevel: assessment.proficiencyLevel,
      feedback: assessment.feedback || '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ skillId: '', score: 50, proficiencyLevel: 3, feedback: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;

    try {
      const response = await fetch(`/api/skills/assessments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete assessment');
      }

      setMessage('Assessment deleted successfully!');
      fetchAssessments();
      fetchSummary();
    } catch (err) {
      setError('Failed to delete: ' + err.message);
    }
  };

  const getProficiencyLabel = (level) => {
    const levels = { 1: 'Beginner', 2: 'Elementary', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' };
    return levels[level] || 'Unknown';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStrengthLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs work';
  };

  const categories = [...new Set(skills.map(s => s.category))];
  const filteredSkills = selectedCategory === 'all' 
    ? skills 
    : skills.filter(s => s.category === selectedCategory);

  const assessedSkillIds = new Set(assessments.map(a => a.skill?.id || a.skillId));
  const unevaluatedSkills = filteredSkills.filter(s => !assessedSkillIds.has(s.id));

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 shadow-glow">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Total Assessments</p>
            <p className="mt-3 text-4xl font-semibold text-white">{summary.totalAssessments}</p>
          </div>
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 shadow-glow">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Average Score</p>
            <p className="mt-3 text-4xl font-semibold text-white">{Math.round(summary.averageScore || 0)}</p>
          </div>
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 shadow-glow">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Categories</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {Object.keys(summary.categoryBreakdown || {}).length}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      {(message || error) && (
        <div className={`rounded-3xl border px-5 py-4 text-sm ${error ? 'border-red-500 bg-red-500/10 text-red-200' : 'border-emerald-500 bg-emerald-500/10 text-emerald-200'}`}>
          {error || message}
        </div>
      )}

      {/* Assessment Form */}
      <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.75rem] border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">
            {editingId ? 'Update Assessment' : 'Submit New Assessment'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {!editingId && (
            <label className="space-y-2 text-sm text-slate-300">
              Select Skill
              <select
                name="skillId"
                value={form.skillId}
                onChange={handleChange}
                required={!editingId}
                className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
              >
                <option value="">Choose a skill to assess...</option>
                {unevaluatedSkills.map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name} ({skill.category})
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="space-y-2 text-sm text-slate-300">
            Score (0-100)
            <div className="flex items-center gap-3">
              <input
                type="range"
                name="score"
                value={form.score}
                onChange={handleChange}
                min="0"
                max="100"
                className="flex-1 h-2 rounded-full accent-brand-500"
              />
              <span className="w-12 text-center font-semibold text-brand-400">{form.score}</span>
            </div>
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-300">
          Proficiency Level (1-5)
          <select
            name="proficiencyLevel"
            value={form.proficiencyLevel}
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
          >
            <option value={1}>1 - Beginner</option>
            <option value={2}>2 - Elementary</option>
            <option value={3}>3 - Intermediate</option>
            <option value={4}>4 - Advanced</option>
            <option value={5}>5 - Expert</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          Feedback (Optional)
          <textarea
            name="feedback"
            value={form.feedback}
            onChange={handleChange}
            placeholder="Add notes about your assessment..."
            className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
            rows="3"
          />
        </label>

        <button
          type="submit"
          disabled={loading || (!editingId && !form.skillId)}
          className="w-full rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Submitting...' : editingId ? 'Update Assessment' : 'Submit Assessment'}
        </button>
      </form>

      {/* My Assessments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">My Assessments</h3>
          <span className="text-sm text-slate-400">{assessments.length} completed</span>
        </div>

        {assessments.length === 0 ? (
          <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-8 text-center">
            <p className="text-slate-400">No assessments yet. Start by submitting your first skill assessment above.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {assessments.map(assessment => (
              <div key={assessment.id} className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{assessment.skill?.name || 'Unknown Skill'}</h4>
                    <p className="text-sm text-slate-400">{assessment.skill?.category || 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(assessment)}
                      className="px-3 py-1 text-xs rounded-full border border-brand-500/50 text-brand-400 hover:bg-brand-500/10 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assessment.id)}
                      className="px-3 py-1 text-xs rounded-full border border-red-500/50 text-red-400 hover:bg-red-500/10 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Score</span>
                    <span className="font-semibold text-white">{assessment.score}/100</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div 
                      className={`h-full rounded-full transition ${getScoreColor(assessment.score)}`}
                      style={{ width: `${assessment.score}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400">Proficiency</p>
                    <p className="font-semibold text-white">{getProficiencyLabel(assessment.proficiencyLevel)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Strength</p>
                    <p className="font-semibold text-white">{getStrengthLabel(assessment.score)}</p>
                  </div>
                </div>

                {assessment.feedback && (
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Feedback</p>
                    <p className="mt-2 text-sm text-slate-300">{assessment.feedback}</p>
                  </div>
                )}

                <div className="text-xs text-slate-500">
                  Updated {new Date(assessment.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Skills */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">Available Skills</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-xs rounded-full transition ${
                selectedCategory === 'all'
                  ? 'bg-brand-500 text-slate-950'
                  : 'border border-slate-700 text-slate-300 hover:border-brand-400'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-full transition ${
                  selectedCategory === cat
                    ? 'bg-brand-500 text-slate-950'
                    : 'border border-slate-700 text-slate-300 hover:border-brand-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredSkills.length === 0 ? (
          <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-8 text-center">
            <p className="text-slate-400">No skills available in this category.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredSkills.map(skill => {
              const assessed = assessments.find(a => a.skill?.id === skill.id);
              return (
                <div key={skill.id} className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{skill.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{skill.description}</p>
                    </div>
                    {assessed && (
                      <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300">
                        Assessed
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{skill.category}</span>
                    {assessed && (
                      <span className="text-brand-300 font-semibold">{assessed.score}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-5 text-sm text-slate-400">
        <p className="font-semibold text-slate-100">Skill Assessment Integration</p>
        <p className="mt-2 leading-6">
          This panel integrates with skill assessment APIs: <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-200">GET /api/skills</code>, <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-200">POST /api/skills/assessments</code>, and <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-200">GET /api/skills/assessments/my-assessments</code>.
        </p>
      </div>
    </div>
  );
};

export default SkillAssessmentPanel;
