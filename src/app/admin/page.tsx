'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import SiteSettingsForm from './SiteSettingsForm';
import ProjectsPanel from './ProjectsPanel';
import CertsPanel from './CertsPanel';
import ExperiencePanel from './ExperiencePanel';
import PublicationsPanel from './PublicationsPanel';
import SkillsPanel from './skills-panel';
import EducationPanel from './EducationPanel';

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'site' | 'projects' | 'certs' | 'education' | 'experience' | 'publications' | 'skills'>('site');

  // email/password login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white/70">
        Loading…
      </div>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-md p-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">Admin Login</h1>
          <p className="mt-2 text-sm text-white/70">
            Sign in with your email and password to edit your portfolio content.
          </p>

          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white"
              required
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {authLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-white hover:bg-white/15 transition"
        >
          Sign out
        </button>
      </div>

      {/* simple tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['site', 'projects', 'certs', 'education', 'experience', 'publications', 'skills'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              'rounded-xl px-4 py-2 text-sm transition border',
              activeTab === tab
                ? 'bg-violet-500/20 border-violet-400/30 text-white'
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10',
            ].join(' ')}
          >
            {tab === 'site'
              ? 'Site'
              : tab === 'projects'
              ? 'Projects'
              : tab === 'certs'
              ? 'Certifications'
              : tab === 'education'
              ? 'Education'
              : tab === 'experience'
              ? 'Experience'
              : tab === 'publications'
              ? 'Publications'
              : 'Skills'}
          </button>
        ))}
      </div>

      {/* panels */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        {activeTab === 'site' && (
          <div className="text-white/80">
            <h2 className="text-lg font-medium text-white mb-4">Site Settings</h2>
            <SiteSettingsForm />
          </div>
        )}
        {activeTab === 'projects' && <ProjectsPanel />}
        {activeTab === 'certs' && <CertsPanel />}
        {activeTab === 'education' && <EducationPanel />}
        {activeTab === 'experience' && <ExperiencePanel />}
        {activeTab === 'publications' && <PublicationsPanel />}
        {activeTab === 'skills' && <SkillsPanel />}
      </div>
    </main>
  );
}