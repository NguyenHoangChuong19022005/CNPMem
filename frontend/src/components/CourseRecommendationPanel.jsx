import { useEffect, useState } from 'react';

const sampleCourses = [
  {
    id: 1,
    title: 'Phát triển Java & Spring Boot Nâng cao',
    provider: 'Học viện CareerPath',
    description: 'Nắm vững kiến thức backend với Java, Spring Boot, thiết kế REST API và kiến trúc vi dịch vụ.',
    skills: ['Java', 'Spring Boot', 'Vi dịch vụ'],
    level: 'Nâng cao',
    duration: '8 tuần',
    url: 'https://spring.io/quickstart',
  },
  {
    id: 2,
    title: 'Kiến trúc React & Frontend',
    provider: 'Học viện CareerPath',
    description: 'Trở thành chuyên gia phát triển frontend hiện đại với React, thiết kế component và tối ưu hóa hiệu suất.',
    skills: ['React', 'JavaScript', 'Frontend'],
    level: 'Trung bình',
    duration: '6 tuần',
    url: 'https://react.dev',
  },
  {
    id: 3,
    title: 'Thiết kế Cơ sở dữ liệu & Tối ưu SQL',
    provider: 'Học viện CareerPath',
    description: 'Cải thiện mô hình hóa dữ liệu, truy vấn SQL, đánh chỉ mục và lưu trữ dữ liệu cho các ứng dụng thực tế.',
    skills: ['SQL', 'Cơ sở dữ liệu', 'Mô hình hóa dữ liệu'],
    level: 'Trung bình',
    duration: '5 tuần',
    url: 'https://www.w3schools.com/sql/',
  },
  {
    id: 4,
    title: 'Cơ bản về DevOps: Docker & Kubernetes',
    provider: 'Học viện CareerPath',
    description: 'Tìm hiểu về container hóa, đường ống CI/CD và các thực tiễn triển khai cho các nhóm phần mềm hiện đại.',
    skills: ['Docker', 'Kubernetes', 'CI/CD'],
    level: 'Trung bình',
    duration: '7 tuần',
    url: 'https://docs.docker.com/get-started/',
  },
  {
    id: 5,
    title: 'Thuật toán cho Kỹ sư Phần mềm',
    provider: 'Học viện CareerPath',
    description: 'Củng cố tư duy logic và giải quyết vấn đề với thuật toán, cấu trúc dữ liệu và các mẫu thiết kế hệ thống.',
    skills: ['Thuật toán', 'Cấu trúc dữ liệu', 'Giải quyết vấn đề'],
    level: 'Cơ bản',
    duration: '4 tuần',
    url: 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/',
  },
  {
    id: 6,
    title: 'Lộ trình Dự án Full-Stack',
    provider: 'Học viện CareerPath',
    description: 'Xây dựng một ứng dụng web hoàn chỉnh từ thiết kế đến triển khai với sự tích hợp của frontend, backend và cơ sở dữ liệu.',
    skills: ['Full-Stack', 'React', 'Java', 'SQL'],
    level: 'Trung bình',
    duration: '9 tuần',
    url: 'https://roadmap.sh/',
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
      case 'Nâng cao':
        return 'bg-red-500/10 text-red-300 border-red-500/20';
      case 'Intermediate':
      case 'Trung bình':
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
            <h3 className="text-lg font-semibold text-white">Gợi ý Khóa học</h3>
            <p className="mt-2 text-sm text-slate-400">
              Nhận các đề xuất khóa học dựa trên kỹ năng bạn đã đánh giá.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchCourseRecommendations}
            disabled={loading}
            className="rounded-3xl bg-brand-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {loading ? 'Đang tải…' : 'Làm mới khóa học'}
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
                  <p className="font-semibold text-slate-200">Thời lượng</p>
                  <p className="mt-1">{course.duration}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Độ phù hợp</p>
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
                Xem khóa học
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseRecommendationPanel;
