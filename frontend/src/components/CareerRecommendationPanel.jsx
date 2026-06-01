import { useEffect, useState } from 'react';

const CareerRecommendationPanel = ({ token }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (token) {
      fetchRecommendations();
    }
  }, [token]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/careers/recommendations/my-recommendations', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch recommendations');
      }
      setRecommendations(data.recommendations || []);
      setError(null);
    } catch (err) {
      setError('Failed to load recommendations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setGenerating(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/careers/recommendations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to generate recommendations');
      }

      setMessage(`Generated ${data.total || 0} career recommendations based on your skills!`);
      fetchRecommendations();
    } catch (err) {
      setError('Failed to generate recommendations: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const archiveRecommendation = async (id) => {
    try {
      const response = await fetch(`/api/careers/recommendations/${id}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to archive');
      }

      setMessage('Recommendation archived successfully!');
      setSelectedId(null);
      fetchRecommendations();
    } catch (err) {
      setError('Failed to archive: ' + err.message);
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'HIGH':
        return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
      case 'MEDIUM':
        return 'border-blue-500/50 bg-blue-500/10 text-blue-300';
      case 'LOW':
        return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300';
      default:
        return 'border-slate-500/50 bg-slate-500/10 text-slate-300';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const selectedRecommendation = recommendations.find(r => r.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Messages */}
      {(message || error) && (
        <div className={`rounded-3xl border px-5 py-4 text-sm ${error ? 'border-red-500 bg-red-500/10 text-red-200' : 'border-emerald-500 bg-emerald-500/10 text-emerald-200'}`}>
          {error || message}
        </div>
      )}

      {/* Generate Button */}
      <div className="rounded-[1.75rem] border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-white">Generate Career Recommendations</h3>
            <p className="mt-2 text-sm text-slate-400">
              Analyze your skill assessments and receive personalized career path recommendations
            </p>
          </div>
          <button
            onClick={generateRecommendations}
            disabled={generating || loading}
            className="whitespace-nowrap rounded-3xl bg-brand-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? 'Generating...' : 'Generate Now'}
          </button>
        </div>
      </div>

      {/* Empty State */}
      {recommendations.length === 0 && !loading && (
        <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-12 text-center">
          <p className="text-slate-400">No recommendations yet. Click the button above to generate career path recommendations.</p>
        </div>
      )}

      {/* Recommendations Grid */}
      {recommendations.length > 0 && !selectedId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-white">
              Your Career Recommendations ({recommendations.length})
            </h3>
            <button
              onClick={generateRecommendations}
              disabled={generating}
              className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-brand-400 transition"
            >
              Regenerate
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map(rec => (
              <div
                key={rec.id}
                onClick={() => setSelectedId(rec.id)}
                className="cursor-pointer rounded-3xl border border-slate-800/90 bg-slate-950/80 p-5 transition hover:border-brand-400/50 hover:bg-slate-900/80"
              >
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-white text-lg">{rec.career}</h4>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">{rec.seniority?.replace(/_/g, ' ')}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Match Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(rec.matchScore)}`}>
                      {rec.matchScore}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-brand-500 transition"
                      style={{ width: `${rec.matchScore}%` }}
                    />
                  </div>

                  <div className={`rounded-2xl border px-3 py-2 text-xs font-semibold text-center ${getStrengthColor(rec.strength)}`}>
                    {rec.strength} Match
                  </div>

                  {rec.salaryRange && (
                    <div className="pt-3 border-t border-slate-800">
                      <p className="text-xs text-slate-400">{rec.salaryRange}</p>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(rec.id);
                    }}
                    className="w-full mt-3 text-xs text-center text-brand-300 hover:text-brand-200 transition font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail View */}
      {selectedRecommendation && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setSelectedId(null)}
              className="text-sm text-brand-300 hover:text-brand-200 transition"
            >
              ← Back to List
            </button>
            <h3 className="text-xl font-semibold text-white flex-1 text-center">
              {selectedRecommendation.career}
            </h3>
            <div className="w-20"></div>
          </div>

          <div className="rounded-[2rem] border border-slate-800/90 bg-slate-900/80 p-8 shadow-glow space-y-6">
            {/* Header Info */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Match Score</p>
                <p className={`mt-3 text-3xl font-bold ${getScoreColor(selectedRecommendation.matchScore)}`}>
                  {selectedRecommendation.matchScore}%
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Fit Level</p>
                <p className="mt-3 text-xl font-semibold text-white">{selectedRecommendation.strength}</p>
              </div>
              <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Seniority</p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {selectedRecommendation.seniority?.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* Career Info */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white text-lg">About This Role</h4>
              {selectedRecommendation.careerDescription && (
                <p className="text-slate-300 leading-6">{selectedRecommendation.careerDescription}</p>
              )}
              {selectedRecommendation.salaryRange && (
                <p className="text-sm text-slate-400">
                  <strong>Salary Range:</strong> {selectedRecommendation.salaryRange}
                </p>
              )}
            </div>

            {/* Analysis */}
            {selectedRecommendation.analysis && (
              <div className="space-y-3 rounded-3xl border border-slate-800/90 bg-slate-950/80 p-5">
                <h4 className="font-semibold text-white">Our Analysis</h4>
                <p className="text-slate-300 leading-6">{selectedRecommendation.analysis}</p>
              </div>
            )}

            {/* Matched Skills */}
            {selectedRecommendation.matchedSkills && (
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Your Matching Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRecommendation.matchedSkills.split(',').map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills to Improve */}
            {selectedRecommendation.skillsToImprove && (
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Skills to Develop</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRecommendation.skillsToImprove.split(',').map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-yellow-500/50 bg-yellow-500/10 px-3 py-1 text-sm text-yellow-300"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-6 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => setSelectedId(null)}
                className="flex-1 rounded-3xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-brand-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => archiveRecommendation(selectedRecommendation.id)}
                className="flex-1 rounded-3xl border border-red-500/50 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
              >
                Archive This
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-5 text-sm text-slate-400">
        <p className="font-semibold text-slate-100">Career Recommendations Integration</p>
        <p className="mt-2 leading-6">
          This panel integrates with career recommendation APIs: <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-200">POST /api/careers/recommendations/generate</code>, <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-200">GET /api/careers/recommendations/my-recommendations</code>, and <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-200">PUT /api/careers/recommendations/{'{id}'}/archive</code>.
        </p>
      </div>
    </div>
  );
};

export default CareerRecommendationPanel;
