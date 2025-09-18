'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const IMAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET ?? 'cert-images';

type SiteSettings = {
  id?: string;
  hero_title?: string;
  hero_tagline?: string;
  metrics_years?: string;
  metrics_projects?: string;
  metrics_certs?: string;
  skills?: string[];          // stored as text[] in DB
  resume_url?: string;
  contact_email?: string;
  avatar_url?: string;
};

function toCSV(a?: string[]) { return (a ?? []).join(', '); }
function toArray(csv?: string) {
  return (csv ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export default function SiteSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState<SiteSettings>({
    hero_title: '',
    hero_tagline: '',
    metrics_years: '',
    metrics_projects: '',
    metrics_certs: '',
    skills: [],
    resume_url: '',
    contact_email: '',
    avatar_url: '',
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[admin/site] load error', error);
      }
      if (mounted) {
        if (data) {
          setForm({
            id: data.id,
            hero_title: data.hero_title ?? '',
            hero_tagline: data.hero_tagline ?? '',
            metrics_years: data.metrics_years ?? '',
            metrics_projects: data.metrics_projects ?? '',
            metrics_certs: data.metrics_certs ?? '',
            skills: Array.isArray(data.skills) ? data.skills : [],
            resume_url: data.resume_url ?? '',
            contact_email: data.contact_email ?? '',
            avatar_url: data.avatar_url ?? '',
          });
        }
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        id: form.id, // if undefined, upsert will insert
        hero_title: form.hero_title,
        hero_tagline: form.hero_tagline,
        metrics_years: form.metrics_years,
        metrics_projects: form.metrics_projects,
        metrics_certs: form.metrics_certs,
        skills: form.skills ?? [],
        resume_url: form.resume_url,
        contact_email: form.contact_email,
        avatar_url: form.avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('site_settings')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
      setMsg('Saved!');
    } catch (err: any) {
      console.error(err);
      setMsg(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Keep a reference to the input so we can reset it after async awaits
    const inputEl = e.currentTarget;

    try {
      setUploadingAvatar(true);
      setMsg(null);

      // Always store avatars in a dedicated folder within the bucket
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
      const path = `avatars/avatar-${Date.now()}-${safeName}`;

      // Upload to Supabase Storage
      const { error: upErr } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, file, { upsert: false, cacheControl: '3600' });

      if (upErr) {
        // Improve the inline error message for common bucket issues
        const msg =
          /Not Found|does not exist/i.test(upErr.message)
            ? `Bucket "${IMAGE_BUCKET}" not found. Create it in Supabase Storage (Public) or set NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET.`
            : upErr.message;
        throw new Error(msg);
      }

      // Get the public URL for immediate preview/use on the site
      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
      const publicUrl = data.publicUrl;

      setForm((f) => ({ ...f, avatar_url: publicUrl }));
      setMsg('Avatar uploaded ✔');
    } catch (err: any) {
      console.error('[avatar upload]', err);
      setMsg(err?.message || 'Upload failed');
    } finally {
      setUploadingAvatar(false);
      if (inputEl) inputEl.value = '';
    }
  }

  if (loading) {
    return <div className="text-white/70">Loading settings…</div>;
  }

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Hero Title</span>
          <input
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-violet-400/50"
            value={form.hero_title ?? ''}
            onChange={e => setForm(f => ({ ...f, hero_title: e.target.value }))}
            placeholder="Bhargava — Full-Stack • AI/RAG"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Hero Tagline</span>
          <input
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-violet-400/50"
            value={form.hero_tagline ?? ''}
            onChange={e => setForm(f => ({ ...f, hero_tagline: e.target.value }))}
            placeholder="Clean React/Next frontends…"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Years (metric)</span>
          <input
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-violet-400/50"
            value={form.metrics_years ?? ''}
            onChange={e => setForm(f => ({ ...f, metrics_years: e.target.value }))}
            placeholder="3"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Projects (metric)</span>
          <input
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-violet-400/50"
            value={form.metrics_projects ?? ''}
            onChange={e => setForm(f => ({ ...f, metrics_projects: e.target.value }))}
            placeholder="8+"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Certifications (metric)</span>
          <input
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-violet-400/50"
            value={form.metrics_certs ?? ''}
            onChange={e => setForm(f => ({ ...f, metrics_certs: e.target.value }))}
            placeholder="9+"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-white/70">Skills (comma-separated)</span>
        <input
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-violet-400/50"
          value={toCSV(form.skills)}
          onChange={e => setForm(f => ({ ...f, skills: toArray(e.target.value) }))}
          placeholder="Next.js, React, TypeScript, Tailwind, LangChain, RAG…"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Resume URL</span>
          <input
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-violet-400/50"
            value={form.resume_url ?? ''}
            onChange={e => setForm(f => ({ ...f, resume_url: e.target.value }))}
            placeholder="https://…/resume.pdf"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Contact Email</span>
          <input
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-violet-400/50"
            value={form.contact_email ?? ''}
            onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
            placeholder="you@example.com"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Avatar (profile photo) URL</span>
          <input
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-violet-400/50"
            value={form.avatar_url ?? ''}
            onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))}
            placeholder="https://…/me.png"
          />
          <div className="-mt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => document.getElementById('avatar-file-input')?.click()}
              disabled={uploadingAvatar}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15 disabled:opacity-60"
            >
              {uploadingAvatar ? 'Uploading…' : 'Upload avatar'}
            </button>
            <input
              id="avatar-file-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            {form.avatar_url && (
              <>
                <a
                  href={form.avatar_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15"
                >
                  Open image
                </a>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, avatar_url: '' }))}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </label>

        {form.avatar_url ? (
          <div className="flex items-end">
            <img
              src={form.avatar_url}
              alt="avatar preview"
              className="h-24 w-24 rounded-full border border-white/10 object-cover"
            />
          </div>
        ) : (
          <div className="flex items-end text-white/40 text-sm">No avatar selected</div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploadingAvatar}
          className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/20 px-4 py-2 text-white hover:bg-violet-500/30 transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {msg && <span className="text-sm text-white/70">{msg}</span>}
      </div>
    </form>
  );
}