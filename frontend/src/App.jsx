import { useState } from 'react';
import AuthPanel from './components/AuthPanel';
import SkillAssessmentPanel from './components/SkillAssessmentPanel';
import CareerRecommendationPanel from './components/CareerRecommendationPanel';
import CourseRecommendationPanel from './components/CourseRecommendationPanel';
import UserProfilePanel from './components/UserProfilePanel';

const features = [
  {
    title: 'Lộ trình cá nhân hóa',
    description: 'Tạo đường học tùy chỉnh cho các chủ đề, kỹ năng và chứng chỉ phần mềm.',
  },
  {
    title: 'Phân tích khoảng cách kỹ năng',
    description: 'Xác định điểm mạnh và điểm yếu với đề xuất khóa học và dự án phù hợp.',
  },
  {
    title: 'Học qua dự án',
    description: 'Ghép thách thức thực tế với mục tiêu nghề nghiệp và theo dõi tiến độ.',
  },
];

function App() {
  const [section, setSection] = useState('home');
  const [token, setToken] = useState(() => localStorage.getItem('careerpathse_token'));

  const handleTokenChange = (newToken) => {
    setToken(newToken);
    if (newToken) {
      setSection('skills');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('careerpathse_token');
    setToken(null);
    setSection('home');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-300">CareerPathSE</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Định hướng nghề nghiệp cá nhân</h1>
          </div>
          <nav className="flex gap-4 text-sm text-slate-400">
            {!token ? (
              <>
                <button onClick={() => setSection('home')} className="transition hover:text-white">Trang chủ</button>
                <button onClick={() => setSection('auth')} className="transition hover:text-white">Đăng nhập</button>
                <button onClick={() => setSection('features')} className="transition hover:text-white">Tính năng</button>
              </>
            ) : (
              <>
                <button onClick={() => setSection('profile')} className="transition hover:text-white">Hồ sơ</button>
                <button onClick={() => setSection('skills')} className="transition hover:text-white">Kỹ năng</button>
                <button onClick={() => setSection('careers')} className="transition hover:text-white">Nghề nghiệp</button>
                <button onClick={() => setSection('courses')} className="transition hover:text-white">Khóa học</button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {section === 'home' && (
          <section className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-2 text-sm text-brand-200">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-400" />
                Xây dựng lộ trình thành công trong kỹ thuật phần mềm
              </div>
              <div className="space-y-6">
                <h2 className="max-w-3xl text-5xl font-semibold leading-tight tracking-[-0.04em] text-white">
                  CareerPathSE — nền tảng định hướng nghề cho sinh viên software.
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-slate-400">
                  Khám phá hướng nghiệp cá nhân, lộ trình học, theo dõi kỹ năng và hướng dẫn dự án cho bước tiến tiếp theo của bạn.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => setSection('auth')} className="rounded-2xl bg-brand-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400">
                    Bắt đầu đăng nhập
                  </button>
                  <button onClick={() => setSection('features')} className="rounded-2xl border border-slate-700 px-6 py-3 text-sm text-slate-200 transition hover:border-brand-400 hover:text-white">
                    Xem tính năng
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 shadow-glow backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Mục tiêu</p>
                  <p className="mt-4 text-3xl font-semibold text-white">Rõ ràng nghề nghiệp</p>
                </div>
                <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 shadow-glow backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Tập trung</p>
                  <p className="mt-4 text-3xl font-semibold text-white">Kỹ thuật phần mềm</p>
                </div>
                <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 shadow-glow backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Kết quả</p>
                  <p className="mt-4 text-3xl font-semibold text-white">Sẵn sàng lộ trình</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800/90 bg-slate-900/80 p-8 shadow-glow backdrop-blur-xl">
              <div className="rounded-3xl border border-slate-800/90 bg-slate-950/70 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Student dashboard</p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">Learning roadmap</h3>
                  </div>
                  <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">Beta</span>
                </div>
                <div className="mt-8 grid gap-4">
                  <div className="rounded-3xl bg-slate-950/80 p-5">
                    <p className="text-sm text-slate-400">Next milestone</p>
                    <p className="mt-2 text-lg font-semibold text-white">Build a full-stack portfolio</p>
                  </div>
                  <div className="grid gap-3 rounded-3xl bg-slate-950/80 p-5">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Frontend mastery</span>
                      <span>73%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full w-3/4 rounded-full bg-brand-500" />
                    </div>
                  </div>
                  <div className="grid gap-4 rounded-3xl bg-slate-950/80 p-5">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Backend skills</span>
                      <span>60%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full w-3/5 rounded-full bg-cyan-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {section === 'features' && (
          <section className="space-y-10">
            <div className="flex flex-col gap-3 text-center">
                <p className="text-sm uppercase tracking-[0.24em] text-brand-300">Tính năng</p>
              <h2 className="text-4xl font-semibold text-white">Xây dựng cho sinh viên kỹ thuật phần mềm</h2>
              <p className="mx-auto max-w-2xl text-slate-400">
                Nền tảng định hướng hiện đại với lộ trình học hướng dẫn, theo dõi tiến độ và hỗ trợ nghề nghiệp.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-[2rem] border border-slate-800/90 bg-slate-900/80 p-8 shadow-glow backdrop-blur-xl">
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-4 text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {section === 'auth' && (
          <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-6 rounded-[2rem] border border-slate-800/90 bg-slate-900/80 p-8 shadow-glow backdrop-blur-xl">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.24em] text-brand-300">Xác thực</p>
                <h2 className="text-4xl font-semibold text-white">Đăng nhập hoặc tạo tài khoản CareerPathSE.</h2>
                <p className="max-w-2xl text-slate-400">
                  Sử dụng đăng nhập an toàn để truy cập hướng nghiệp cá nhân, lộ trình học và hồ sơ sinh viên.
                </p>
              </div>
              <AuthPanel token={token} onTokenChange={handleTokenChange} onLogout={handleLogout} />
            </div>
            <div className="space-y-6 rounded-[2rem] border border-slate-800/90 bg-slate-900/80 p-8 shadow-glow backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-white">Bạn có thể làm gì tiếp theo</h3>
              <ul className="space-y-4 text-slate-400">
                <li className="rounded-3xl border border-slate-800/90 bg-slate-950/70 p-5">
                  <strong className="text-white">Theo dõi tiến trình</strong>
                  <p className="mt-2 text-sm text-slate-400">Lưu cột mốc học tập và đo lường sự phát triển kỹ năng từng bước.</p>
                </li>
                <li className="rounded-3xl border border-slate-800/90 bg-slate-950/70 p-5">
                  <strong className="text-white">Xây dựng lộ trình</strong>
                  <p className="mt-2 text-sm text-slate-400">Chọn mục tiêu, khóa học và dự án phù hợp với vai trò kỹ thuật phần mềm.</p>
                </li>
                <li className="rounded-3xl border border-slate-800/90 bg-slate-950/70 p-5">
                  <strong className="text-white">Giữ vững tập trung</strong>
                  <p className="mt-2 text-sm text-slate-400">Nhận đề xuất phù hợp với con đường nghề và tốc độ học của bạn.</p>
                </li>
              </ul>
            </div>
          </section>
        )}

        {section === 'profile' && token && (
          <section className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-brand-300">User Profile</p>
              <h2 className="text-4xl font-semibold text-white">Manage your account and settings</h2>
              <p className="max-w-2xl text-slate-400">
                Update your profile information, change your password, and manage your account security.
              </p>
            </div>
            <div className="rounded-[2rem] border border-slate-800/90 bg-slate-900/80 p-8 shadow-glow backdrop-blur-xl">
              <UserProfilePanel token={token} onLogout={handleLogout} />
            </div>
          </section>
        )}

        {section === 'skills' && token && (
          <section className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-brand-300">Skill Assessment</p>
              <h2 className="text-4xl font-semibold text-white">Track and assess your technical skills</h2>
              <p className="max-w-2xl text-slate-400">
                Evaluate your proficiency across different areas of software engineering. Your assessments will help us recommend suitable career paths.
              </p>
            </div>
            <div className="rounded-[2rem] border border-slate-800/90 bg-slate-900/80 p-8 shadow-glow backdrop-blur-xl">
              <SkillAssessmentPanel token={token} />
            </div>
          </section>
        )}

        {section === 'careers' && token && (
          <section className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-brand-300">Career Recommendations</p>
              <h2 className="text-4xl font-semibold text-white">Discover career paths matched to your skills</h2>
              <p className="max-w-2xl text-slate-400">
                Based on your skill assessments, we recommend career paths suited to your proficiency levels and learning goals.
              </p>
            </div>
            <div className="rounded-[2rem] border border-slate-800/90 bg-slate-900/80 p-8 shadow-glow backdrop-blur-xl">
              <CareerRecommendationPanel token={token} />
            </div>
          </section>
        )}

        {section === 'courses' && token && (
          <section className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-brand-300">Course Recommendations</p>
              <h2 className="text-4xl font-semibold text-white">Personalized courses to grow your skills</h2>
              <p className="max-w-2xl text-slate-400">
                Discover courses tailored to your current skill profile and learning gaps.
              </p>
            </div>
            <div className="rounded-[2rem] border border-slate-800/90 bg-slate-900/80 p-8 shadow-glow backdrop-blur-xl">
              <CourseRecommendationPanel token={token} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
