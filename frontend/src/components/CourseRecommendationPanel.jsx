import { useEffect, useState } from 'react';

const sampleCourses = [
  {
    id: 1,
    title: 'Advanced Java & Spring Boot Development',
    provider: 'CareerPath Academy',
    description: 'Deepen your backend knowledge with Java, Spring Boot, REST API design, and microservice architecture.',
    skills: ['Java', 'Spring Boot', 'Microservices'],
    level: 'Advanced',
    duration: '8 weeks',
    url: 'https://example.com/java-spring-boot',
  },
  {
    id: 2,
    title: 'React and Frontend Architecture',
    provider: 'CareerPath Academy',
    description: 'Master modern frontend development with React, component design, and performance optimization.',
    skills: ['React', 'JavaScript', 'Frontend'],
    level: 'Intermediate',
    duration: '6 weeks',
    url: 'https://example.com/react-frontend',
  },
  {
    id: 3,
    title: 'Database Design & SQL Performance',
    provider: 'CareerPath Academy',
    description: 'Improve database modeling, SQL queries, indexing, and data persistence for production apps.',
    skills: ['SQL', 'Database', 'Data Modeling'],
    level: 'Intermediate',
    duration: '5 weeks',
    url: 'https://example.com/database-sql',
  },
  {
    id: 4,
    title: 'DevOps Fundamentals: Docker & Kubernetes',
    provider: 'CareerPath Academy',
    description: 'Learn containerization, CI/CD pipelines, and deployment practices for modern software teams.',
    skills: ['Docker', 'Kubernetes', 'CI/CD'],
    level: 'Intermediate',
    duration: '7 weeks',
    url: 'https://example.com/devops-docker-k8s',
  },
  {
    id: 5,
    title: 'Algorithms for Software Engineers',
    provider: 'CareerPath Academy',
    description: 'Strengthen your logic and problem solving with algorithms, data structures, and system design patterns.',
    skills: ['Algorithms', 'Data Structures', 'Problem Solving'],
    level: 'Beginner',
    duration: '4 weeks',
    url: 'https://example.com/algorithms',
  },
  {
    id: 6,
    title: 'Full-Stack Project Roadmap',
    provider: 'CareerPath Academy',
    description: 'Build a complete web application from design to deployment with frontend, backend, and database integration.',
    skills: ['Full-Stack', 'React', 'Java', 'SQL'],
    level: 'Intermediate',
    duration: '9 weeks',
    url: 'https://example.com/full-stack-roadmap',
  },
];

const CourseRecommendationPanel = ({ token }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (token) {
      fetchCourseRecommendations();
    }
  }, [token]);

  const fetchCourseRecommendations = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/courses/recommendations', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Unable to load course recommendations');
      }
      setRecommendations(data.courses || []);
      setMessage('Course recommendations loaded from the backend.');
    } catch (err) {
      setError('Unable to load course recommendations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (level) => {
    switch (level) {
      case 'Advanced':
        return 'bg-red-500/10 text-red-300 border-red-500/20';
      case 'Intermediate':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    }
  };

  const visibleRecommendations = recommendations.length > 0 ? recommendations : sampleCourses.slice(0, 4);

  return (
    <div className="space-y-6">
      {(message || error) && (
        <div className={`rounded-3xl border px-5 py-4 text-sm ${error ? 'border-red-500 bg-red-500/10 text-red-200' : 'border-emerald-500 bg-emerald-500/10 text-emerald-200'}`}>
          {error || message}
        </div>
      )}

      <div className="rounded-[1.75rem] border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Course Recommendations</h3>
            <p className="mt-2 text-sm text-slate-400">
              Get suggested learning courses based on the skills you have assessed.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchCourseRecommendations}
            disabled={loading}
            className="rounded-3xl bg-brand-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {loading ? 'Loading…' : 'Refresh Courses'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleRecommendations.map((course) => (
          <div key={course.id} className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow transition hover:border-brand-400/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xl font-semibold text-white">{course.title}</h4>
                  <p className="mt-2 text-sm text-slate-400">{course.provider}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeColor(course.level)}`}>
                  {course.level}
                </span>
              </div>

              <p className="text-slate-400 leading-6">{course.description}</p>

              <div className="flex flex-wrap gap-2">
                {course.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-400">
                <div>
                  <p className="font-semibold text-slate-200">Duration</p>
                  <p className="mt-1">{course.duration}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Match score</p>
                  <p className="mt-1 text-white">{course.matchScore ?? 'N/A'} / 30</p>
                </div>
              </div>

              <p className="text-sm text-slate-400">{course.reason}</p>

              <a
                href={course.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400"
              >
                View Course
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseRecommendationPanel;
