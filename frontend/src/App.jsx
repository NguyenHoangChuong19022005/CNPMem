import { useState } from 'react';
import AuthPanel from './components/AuthPanel';

const features = [
  {
    title: 'Personalized roadmaps',
    description: 'Create customized learning paths for software engineering topics, skills, and certifications.',
  },
  {
    title: 'Skill gap analysis',
    description: 'Identify your strengths and weaknesses with targeted course and project recommendations.',
  },
  {
    title: 'Project-based learning',
    description: 'Match real-world engineering challenges to your career goals and track progress.',
  },
];

function App() {
  const [section, setSection] = useState('home');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-300">CareerPathSE</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Personalized Career Orientation</h1>
          </div>
          <nav className="flex gap-4 text-sm text-slate-400">
            <button onClick={() => setSection('home')} className="transition hover:text-white">Home</button>
            <button onClick={() => setSection('auth')} className="transition hover:text-white">Auth</button>
            <button onClick={() => setSection('features')} className="transition hover:text-white">Features</button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {section === 'home' && (
          <section className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-2 text-sm text-brand-200">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-400" />
                Build your pathway to software engineering success
              </div>
              <div className="space-y-6">
                <h2 className="max-w-3xl text-5xl font-semibold leading-tight tracking-[-0.04em] text-white">
                  CareerPathSE — a modern platform for software engineering students.
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-slate-400">
                  Discover personalized career orientation, learning roadmaps, skill tracking, and project guidance designed for your next step in software development.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => setSection('auth')} className="rounded-2xl bg-brand-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400">
                    Start with Login
                  </button>
                  <button onClick={() => setSection('features')} className="rounded-2xl border border-slate-700 px-6 py-3 text-sm text-slate-200 transition hover:border-brand-400 hover:text-white">
                    Explore features
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 shadow-glow backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Goal</p>
                  <p className="mt-4 text-3xl font-semibold text-white">Career clarity</p>
                </div>
                <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 shadow-glow backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Focus</p>
                  <p className="mt-4 text-3xl font-semibold text-white">Software engineering</p>
                </div>
                <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 shadow-glow backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Outcome</p>
                  <p className="mt-4 text-3xl font-semibold text-white">Roadmap-ready</p>
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
              <p className="text-sm uppercase tracking-[0.24em] text-brand-300">Features</p>
              <h2 className="text-4xl font-semibold text-white">Built for software engineering students</h2>
              <p className="mx-auto max-w-2xl text-slate-400">
                A modern orientation platform with guided learning pathways, progress tracking, and career-focused support.
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
                <p className="text-sm uppercase tracking-[0.24em] text-brand-300">Authentication</p>
                <h2 className="text-4xl font-semibold text-white">Sign in or create your CareerPathSE account.</h2>
                <p className="max-w-2xl text-slate-400">
                  Use a secure login to access your personalized career guidance, roadmap planning, and student profile.
                </p>
              </div>
              <AuthPanel />
            </div>
            <div className="space-y-6 rounded-[2rem] border border-slate-800/90 bg-slate-900/80 p-8 shadow-glow backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-white">What you can do next</h3>
              <ul className="space-y-4 text-slate-400">
                <li className="rounded-3xl border border-slate-800/90 bg-slate-950/70 p-5">
                  <strong className="text-white">Track your progress</strong>
                  <p className="mt-2 text-sm text-slate-400">Save learning milestones and measure skill growth step by step.</p>
                </li>
                <li className="rounded-3xl border border-slate-800/90 bg-slate-950/70 p-5">
                  <strong className="text-white">Build a roadmap</strong>
                  <p className="mt-2 text-sm text-slate-400">Choose goals, courses, and projects aligned with software engineering roles.</p>
                </li>
                <li className="rounded-3xl border border-slate-800/90 bg-slate-950/70 p-5">
                  <strong className="text-white">Stay focused</strong>
                  <p className="mt-2 text-sm text-slate-400">Receive recommendations tailored to your career path and learning pace.</p>
                </li>
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
