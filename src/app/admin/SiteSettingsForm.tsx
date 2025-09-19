'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';


const IMAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET ?? 'cert-images';
const MAX_CARDS = 3;

type FeatureCard = {
  id: string;            // local id for React lists
  title: string;
  body: string;
  icon?: string;         // optional emoji / small label
};

type SocialLink = {
  id: string;
  label: string;
  url: string;
  icon?: string; // tabler icon name or emoji
};

type SiteSettings = {
  id?: string;
  hero_title?: string;
  hero_tagline?: string;
  about_me?: string;          // NEW: stored as text in DB
  achievements?: string;      // NEW: stored as text (one per line or pipe-separated)
  metrics_years?: string;
  metrics_projects?: string;
  metrics_certs?: string;
  skills?: string[];          // stored as text[] in DB
  resume_url?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_location?: string;
  social_links?: SocialLink[];
  avatar_url?: string;
  feature_cards?: FeatureCard[];  // NEW: stored as jsonb in DB
};

type SiteRow = {
  id?: string;
  hero_title?: string | null;
  hero_tagline?: string | null;
  about_me?: string | null;
  achievements?: string | null;
  metrics_years?: string | null;
  metrics_projects?: string | null;
  metrics_certs?: string | null;
  skills?: string[] | null;
  resume_url?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_location?: string | null;
  social_links?: SocialLink[] | string | null;
  avatar_url?: string | null;
  feature_cards?: FeatureCard[] | string | null;
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
    about_me: '',
    achievements: '',
    metrics_years: '',
    metrics_projects: '',
    metrics_certs: '',
    skills: [],
    resume_url: '',
    contact_email: '',
    contact_phone: '',
    contact_location: '',
    social_links: [],
    avatar_url: '',
    feature_cards: [],
  });

  function addFeatureCard() {
    setForm(f => {
      const current = f.feature_cards ?? [];
      if (current.length >= MAX_CARDS) return f;
      return {
        ...f,
        feature_cards: [
          ...current,
          { id: crypto.randomUUID?.() ?? String(Date.now()), title: '', body: '', icon: '✨' },
        ],
      };
    });
  }
  function updateFeatureCard(idx: number, patch: Partial<FeatureCard>) {
    setForm(f => {
      const next = [...(f.feature_cards ?? [])];
      next[idx] = { ...next[idx], ...patch };
      return { ...f, feature_cards: next };
    });
  }
  function removeFeatureCard(idx: number) {
    setForm(f => {
      const next = [...(f.feature_cards ?? [])];
      next.splice(idx, 1);
      return { ...f, feature_cards: next };
    });
  }

  function addSocialLink() {
    setForm(f => ({
      ...f,
      social_links: [ ...(f.social_links ?? []), { id: crypto.randomUUID?.() ?? String(Date.now()), label: '', url: '', icon: '🔗' } ]
    }));
  }
  function updateSocialLink(idx: number, patch: Partial<SocialLink>) {
    setForm(f => {
      const next = [...(f.social_links ?? [])];
      next[idx] = { ...next[idx], ...patch };
      return { ...f, social_links: next };
    });
  }
  function removeSocialLink(idx: number) {
    setForm(f => {
      const next = [...(f.social_links ?? [])];
      next.splice(idx, 1);
      return { ...f, social_links: next };
    });
  }

  function moveFeatureCardUp(idx: number) {
    setForm(f => {
      const next = [...(f.feature_cards ?? [])];
      if (idx <= 0) return f;
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return { ...f, feature_cards: next };
    });
  }
  function moveFeatureCardDown(idx: number) {
    setForm(f => {
      const next = [...(f.feature_cards ?? [])];
      if (idx >= next.length - 1) return f;
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return { ...f, feature_cards: next };
    });
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[admin/site] load error', error);
      }
      if (mounted) {
        if (data) {
          const row = data as SiteRow;

          // Normalize feature_cards (may be json string from older rows)
          let featureCards: unknown = row.feature_cards ?? [];
          if (typeof featureCards === 'string') {
            try { featureCards = JSON.parse(featureCards); } catch { featureCards = []; }
          }
          if (!Array.isArray(featureCards)) featureCards = [];

          // Normalize social_links (may be json string from older rows)
          let socialLinks: unknown = row.social_links ?? [];
          if (typeof socialLinks === 'string') {
            try { socialLinks = JSON.parse(socialLinks); } catch { socialLinks = []; }
          }
          if (!Array.isArray(socialLinks)) socialLinks = [];

          setForm({
            id: row.id,
            hero_title: row.hero_title ?? '',
            hero_tagline: row.hero_tagline ?? '',
            about_me: row.about_me ?? '',
            achievements: row.achievements ?? '',
            metrics_years: row.metrics_years ?? '',
            metrics_projects: row.metrics_projects ?? '',
            metrics_certs: row.metrics_certs ?? '',
            skills: Array.isArray(row.skills) ? row.skills : [],
            resume_url: row.resume_url ?? '',
            contact_email: row.contact_email ?? '',
            contact_phone: row.contact_phone ?? '',
            contact_location: row.contact_location ?? '',
            social_links: socialLinks as SocialLink[],
            avatar_url: row.avatar_url ?? '',
            feature_cards: featureCards as FeatureCard[],
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
      const cleanCards = (form.feature_cards ?? [])
        .map(c => ({
          id: c.id,
          title: (c.title ?? '').trim(),
          body: (c.body ?? '').trim(),
          icon: (c.icon ?? '').trim() || '✨',
        }))
        .filter(c => c.title && c.body)
        .slice(0, MAX_CARDS);
      const cleanLinks = (form.social_links ?? [])
        .map(l => ({
          id: l.id,
          label: (l.label ?? '').trim(),
          url: (l.url ?? '').trim(),
          icon: (l.icon ?? '').trim() || '🔗',
        }))
        .filter(l => l.label && l.url);
      const payload = {
        id: form.id, // if undefined, upsert will insert
        hero_title: form.hero_title,
        hero_tagline: form.hero_tagline,
        about_me: form.about_me ?? '',
        achievements: form.achievements ?? '',
        metrics_years: form.metrics_years,
        metrics_projects: form.metrics_projects,
        metrics_certs: form.metrics_certs,
        skills: form.skills ?? [],
        resume_url: form.resume_url,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        contact_location: form.contact_location,
        social_links: cleanLinks,
        avatar_url: form.avatar_url,
        feature_cards: cleanCards,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('site_settings')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
      setMsg('Saved!');
    } catch (err: unknown) {
      console.error(err);
      const m = err instanceof Error ? err.message : 'Save failed';
      setMsg(m);
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
    } catch (err: unknown) {
      console.error('[avatar upload]', err);
      const m = err instanceof Error ? err.message : 'Upload failed';
      setMsg(m);
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

      {/* About Me and Key Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">About Me (short paragraph)</span>
          <textarea
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-violet-400/50 min-h-[120px] resize-y"
            value={form.about_me ?? ''}
            onChange={e => setForm(f => ({ ...f, about_me: e.target.value }))}
            placeholder="Software Engineer with ~3 years' experience in full‑stack, cloud, and applied AI/ML. I build scalable web apps, automate delivery, and design reliable systems…"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Key Achievements (one per line or use “|”)</span>
          <textarea
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-violet-400/50 min-h-[120px] resize-y"
            value={form.achievements ?? ''}
            onChange={e => setForm(f => ({ ...f, achievements: e.target.value }))}
            placeholder={
`Architected and delivered full‑stack apps with Spring Boot, React, SQL
Implemented CI/CD with Docker/K8s + GitHub Actions to speed up releases
Designed RAG assistants with FastAPI/LangChain to improve retrieval accuracy
Enhanced observability with Grafana/Prometheus/Azure Monitor` }
          />
          <span className="text-[11px] text-white/40">
            {(form.achievements ?? '').split(/\r?\n|\|/).filter(Boolean).length} item(s)
          </span>
        </label>
      </div>

      {/* Feature Cards (editable list) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white/80 font-medium">
            Feature Cards <span className="text-white/50">({(form.feature_cards ?? []).length}/{MAX_CARDS})</span>
          </h3>
          <button
            type="button"
            onClick={addFeatureCard}
            disabled={(form.feature_cards ?? []).length >= MAX_CARDS}
            className="rounded-lg border border-violet-400/30 bg-violet-500/20 px-3 py-1.5 text-sm text-white hover:bg-violet-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Add card
          </button>
        </div>

        {(form.feature_cards ?? []).length === 0 && (
          <p className="text-sm text-white/50">No cards yet. Click “Add card” to create up to three cards for the hero section.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(form.feature_cards ?? []).map((c, idx) => (
            <div key={c.id} className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="flex-1 flex items-center gap-2">
                  <span className="text-xs text-white/60">Icon</span>
                  <input
                    className="w-16 rounded bg-white/5 border border-white/10 px-2 py-1 text-white outline-none focus:border-violet-400/50 text-center"
                    value={c.icon ?? ''}
                    onChange={e => updateFeatureCard(idx, { icon: e.target.value })}
                    placeholder="✨"
                    maxLength={4}
                  />
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveFeatureCardUp(idx)}
                    className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/15"
                    aria-label="Move up"
                    disabled={idx === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFeatureCardDown(idx)}
                    className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/15"
                    aria-label="Move down"
                    disabled={idx === (form.feature_cards?.length ?? 1) - 1}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFeatureCard(idx)}
                    className="rounded-md border border-red-400/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-200 hover:bg-red-500/20"
                    aria-label="Remove card"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-white/60">Title</span>
                <input
                  className="rounded bg-white/5 border border-white/10 px-2.5 py-1.5 text-white outline-none focus:border-violet-400/50"
                  value={c.title}
                  onChange={e => updateFeatureCard(idx, { title: e.target.value })}
                  placeholder="GenAI & RAG"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-white/60">Body</span>
                <textarea
                  className="min-h-[92px] rounded bg-white/5 border border-white/10 px-2.5 py-1.5 text-white outline-none focus:border-violet-400/50 resize-y"
                  value={c.body}
                  onChange={e => updateFeatureCard(idx, { body: e.target.value })}
                  placeholder="Grounded answers with RAG over your data. Retrieval‑Augmented Generation that boosts search accuracy."
                />
              </label>
            </div>
          ))}
        </div>

        {/* Small hint */}
        <p className="text-[11px] text-white/40">
          Tip: Up to {MAX_CARDS} cards. Keep titles short (2–3 words). Body can be 2–3 lines. These render under your hero as the feature blocks.
        </p>
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

      {/* Contact (phone, location) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Contact Phone</span>
          <input
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-violet-400/50"
            value={form.contact_phone ?? ''}
            onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
            placeholder="+1 (404) 729 2160"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Location</span>
          <input
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-violet-400/50"
            value={form.contact_location ?? ''}
            onChange={e => setForm(f => ({ ...f, contact_location: e.target.value }))}
            placeholder="Atlanta, Georgia"
          />
        </label>
      </div>

      {/* Social Links */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white/80 font-medium">Social Links</h3>
          <button
            type="button"
            onClick={addSocialLink}
            className="rounded-lg border border-violet-400/30 bg-violet-500/20 px-3 py-1.5 text-sm text-white hover:bg-violet-500/30 transition"
          >
            + Add link
          </button>
        </div>
        {(form.social_links ?? []).length === 0 && (
          <p className="text-sm text-white/50">No social links yet. Add LinkedIn, GitHub, Email, etc.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(form.social_links ?? []).map((l, idx) => (
            <div key={l.id} className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2">
                  <span className="text-xs text-white/60">Icon</span>
                  <input
                    className="w-16 rounded bg-white/5 border border-white/10 px-2 py-1 text-white outline-none focus:border-violet-400/50 text-center"
                    value={l.icon ?? ''}
                    onChange={e => updateSocialLink(idx, { icon: e.target.value })}
                    placeholder="🔗"
                    maxLength={8}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeSocialLink(idx)}
                  className="rounded-md border border-red-400/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-200 hover:bg-red-500/20"
                >
                  Remove
                </button>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-white/60">Label</span>
                <input
                  className="rounded bg-white/5 border border-white/10 px-2.5 py-1.5 text-white outline-none focus:border-violet-400/50"
                  value={l.label}
                  onChange={e => updateSocialLink(idx, { label: e.target.value })}
                  placeholder="LinkedIn"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-white/60">URL</span>
                <input
                  className="rounded bg-white/5 border border-white/10 px-2.5 py-1.5 text-white outline-none focus:border-violet-400/50"
                  value={l.url}
                  onChange={e => updateSocialLink(idx, { url: e.target.value })}
                  placeholder="https://linkedin.com/in/…"
                />
              </label>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/40">Tip: Use emojis or Tabler icon names (e.g., tabler-brand-linkedin) in the icon field.</p>
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