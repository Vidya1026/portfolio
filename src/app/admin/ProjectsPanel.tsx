'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

function storagePathFromPublicUrl(url?: string | null) {
  if (!url) return null;
  try {
    const marker = '/storage/v1/object/public/images/';
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length);
  } catch {
    return null;
  }
}

type Row = {
  id?: string;
  slug: string;
  title: string;
  year?: string;
  blurb?: string;
  tags?: string[];        // text[]
  highlights?: string[];  // text[]
  github_url?: string;
  demo_url?: string;
  youtube_url?: string;
  docs_url?: string;
  cover_image?: string;
  featured?: boolean;
  sort_order?: number;
  published?: boolean;
};

function toCSV(a?: string[]) { return (a ?? []).join(', '); }
function toPipe(a?: string[]) { return (a ?? []).join(' | '); }
function csvToArray(s: string) {
  return s.split(',').map(x => x.trim()).filter(Boolean);
}
function pipeToArray(s: string) {
  return s.split('|').map(x => x.trim()).filter(Boolean);
}

export default function ProjectsPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState<Row>({
    slug: '',
    title: '',
    year: '',
    blurb: '',
    tags: [],
    highlights: [],
    github_url: '',
    demo_url: '',
    youtube_url: '',
    docs_url: '',
    cover_image: '',
    featured: false,
    sort_order: 999,
    published: true,
  });

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (!error && data) setRows(data as any);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      // basic validation + auto-slug from title if missing
      let slug = (form.slug || '').trim();
      const title = (form.title || '').trim();
      if (!title) {
        setMsg('Title is required');
        setSaving(false);
        return;
      }
      if (!slug) {
        slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
      const payload: Row = {
        id: form.id,
        slug,
        title,
        year: form.year ?? '',
        blurb: form.blurb ?? '',
        tags: Array.isArray(form.tags) ? form.tags : [],
        highlights: Array.isArray(form.highlights) ? form.highlights : [],
        github_url: form.github_url || '',
        demo_url: form.demo_url || '',
        youtube_url: form.youtube_url || '',
        docs_url: form.docs_url || '',
        cover_image: form.cover_image || '',
        featured: !!form.featured,
        sort_order: Number(form.sort_order ?? 999),
        published: !!form.published,
      };
      const { error } = await supabase.from('projects').upsert(payload, { onConflict: 'slug' });
      if (error) throw error;
      setMsg('Saved!');
      setForm({
        id: undefined,
        slug: '',
        title: '',
        year: '',
        blurb: '',
        tags: [],
        highlights: [],
        github_url: '',
        demo_url: '',
        youtube_url: '',
        docs_url: '',
        cover_image: '',
        featured: false,
        sort_order: 999,
        published: true,
      });
      await load();
    } catch (err: any) {
      setMsg(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(id?: string) {
    if (!id) return;
    const row = rows.find(r => r.id === id);
    const ok = confirm('Delete this project? This will also try to remove its cover image from storage.');
    if (!ok) return;

    try {
      const path = storagePathFromPublicUrl(row?.cover_image);
      if (path) {
        await supabase.storage.from('images').remove([path]);
      }
    } catch {
      // ignore cleanup errors
    }

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) await load();
  }

  function editRow(r: Row) {
    setForm({
      id: r.id,
      slug: r.slug || '',
      title: r.title || '',
      year: r.year || '',
      blurb: r.blurb || '',
      tags: r.tags || [],
      highlights: r.highlights || [],
      github_url: r.github_url || '',
      demo_url: r.demo_url || '',
      youtube_url: r.youtube_url || '',
      docs_url: r.docs_url || '',
      cover_image: r.cover_image || '',
      featured: !!r.featured,
      sort_order: r.sort_order ?? 999,
      published: r.published !== false,
    });
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      setMsg(null);

      // Ensure we have a slug or title to name the file
      const base = (form.slug || form.title || 'project')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const path = `projects/${base}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;

      const { error: upErr } = await supabase.storage
        .from('images')
        .upload(path, file, { upsert: false, cacheControl: '3600' });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from('images').getPublicUrl(path);
      const publicUrl = data.publicUrl;

      setForm(f => ({ ...f, cover_image: publicUrl }));
      setMsg('Cover uploaded ✔');
    } catch (err: any) {
      setMsg(err.message || 'Upload failed');
    } finally {
      setUploadingCover(false);
      // reset the input so the same file can be selected again if needed
      e.currentTarget.value = '';
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <form onSubmit={save} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur space-y-4">
        <h3 className="text-white font-medium">Create / Edit Project</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Slug*</span>
            <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Title*</span>
            <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Year</span>
            <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.year || ''} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1 md:col-span-1 lg:col-span-2">
            <span className="text-xs text-white/70">Blurb</span>
            <textarea className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              rows={3} value={form.blurb || ''} onChange={e => setForm(f => ({ ...f, blurb: e.target.value }))} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Tags (comma)</span>
            <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={toCSV(form.tags)} onChange={e => setForm(f => ({ ...f, tags: csvToArray(e.target.value) }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Highlights (pipe |)</span>
            <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={toPipe(form.highlights)} onChange={e => setForm(f => ({ ...f, highlights: pipeToArray(e.target.value) }))} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">GitHub URL</span>
            <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.github_url || ''} onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Live/Demo URL</span>
            <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.demo_url || ''} onChange={e => setForm(f => ({ ...f, demo_url: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">YouTube URL</span>
            <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.youtube_url || ''} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Docs URL</span>
            <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.docs_url || ''} onChange={e => setForm(f => ({ ...f, docs_url: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs text-white/70">Cover Image URL</span>
            <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.cover_image || ''} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} />
          </label>
          <div className="md:col-span-2 -mt-2 mb-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => document.getElementById('cover-file-input')?.click()}
              disabled={uploadingCover}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15 disabled:opacity-60"
            >
              {uploadingCover ? 'Uploading…' : 'Upload image to Supabase'}
            </button>
            <input
              id="cover-file-input"
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <span className="text-xs text-white/50">or paste a URL above</span>
          </div>
        </div>

        {form.cover_image ? (
          <div className="mt-1 flex items-center gap-3">
            <img src={form.cover_image} alt="cover preview" className="h-20 w-auto rounded border border-white/10 object-cover" />
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, cover_image: '' }))}
              className="text-xs rounded-lg border border-white/15 px-2 py-1 text-white/80 hover:bg-white/10"
            >
              Remove image
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 text-white/80">
            <input type="checkbox" checked={!!form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-white/80">
            <input type="checkbox" checked={!!form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
            Published
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Sort Order</span>
            <input type="number" className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.sort_order ?? 999} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving || uploadingCover}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/20 px-4 py-2 text-white hover:bg-violet-500/30 transition disabled:opacity-60">
            {saving ? 'Saving…' : (form.id ? 'Update Project' : 'Create Project')}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm({ id: undefined, slug: '', title: '', year: '', blurb: '', tags: [], highlights: [], github_url: '', demo_url: '', youtube_url: '', docs_url: '', cover_image: '', featured: false, sort_order: 999, published: true })}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-white hover:bg-white/15 transition"
            >
              Cancel Edit
            </button>
          )}
          {msg && <span className="text-sm text-white/70">{msg}</span>}
        </div>
      </form>

      {/* List */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <h3 className="text-white font-medium mb-3">Projects</h3>
        {loading ? (
          <div className="text-white/70">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-white/60 text-sm">No projects yet.</div>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li key={r.id || r.slug} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                <div className="min-w-0">
                  <div className="text-white/90 font-medium truncate">{r.title}</div>
                  <div className="text-xs text-white/60 truncate flex items-center gap-2">
                    <span>{r.slug}</span>
                    {r.featured ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] border border-amber-400/30 text-amber-200 bg-amber-500/10">Featured</span>
                    ) : null}
                    <span className={"px-1.5 py-0.5 rounded text-[10px] border " + (r.published ? 'border-emerald-400/30 text-emerald-200 bg-emerald-500/10' : 'border-white/15 text-white/60 bg-white/5')}>
                      {r.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.github_url ? (
                    <a href={r.github_url} target="_blank" rel="noreferrer noopener" title="GitHub"
                       className="text-[11px] rounded-md border border-white/15 px-1.5 py-0.5 text-white/80 hover:bg-white/10">GH</a>
                  ) : null}
                  {r.demo_url ? (
                    <a href={r.demo_url} target="_blank" rel="noreferrer noopener" title="Live/Demo"
                       className="text-[11px] rounded-md border border-white/15 px-1.5 py-0.5 text-white/80 hover:bg-white/10">Live</a>
                  ) : null}
                  {r.youtube_url ? (
                    <a href={r.youtube_url} target="_blank" rel="noreferrer noopener" title="YouTube"
                       className="text-[11px] rounded-md border border-white/15 px-1.5 py-0.5 text-white/80 hover:bg-white/10">YT</a>
                  ) : null}
                  {r.docs_url ? (
                    <a href={r.docs_url} target="_blank" rel="noreferrer noopener" title="Docs"
                       className="text-[11px] rounded-md border border-white/15 px-1.5 py-0.5 text-white/80 hover:bg-white/10">Docs</a>
                  ) : null}
                  <button onClick={() => editRow(r)} className="text-xs rounded-lg border border-white/15 px-2 py-1 text-white/80 hover:bg-white/10">Edit</button>
                  <button onClick={() => deleteRow(r.id)} className="text-xs rounded-lg border border-red-400/30 px-2 py-1 text-red-200 hover:bg-red-500/15">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}