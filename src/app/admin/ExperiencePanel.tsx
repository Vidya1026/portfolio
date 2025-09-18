'use client';

import { useEffect, useState } from 'react';
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

type ExperienceRow = {
  id?: string;
  org: string;
  role: string;
  start?: string;
  end?: string;
  bullets?: string[];
  logo_url?: string;
  sort_order?: number;
  published?: boolean;
};

function toPipe(a?: string[]) {
  return (a ?? []).join(' | ');
}
function pipeToArray(s: string) {
  return s.split('|').map(x => x.trim()).filter(Boolean);
}

export default function ExperiencePanel() {
  const [rows, setRows] = useState<ExperienceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [form, setForm] = useState<ExperienceRow>({
    org: '',
    role: '',
    start: '',
    end: '',
    bullets: [],
    logo_url: '',
    sort_order: 999,
    published: true,
  });

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('start', { ascending: false });
    if (!error && data) setRows(data as any);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const payload: ExperienceRow = {
        ...form,
        bullets: form.bullets ?? [],
        sort_order: Number(form.sort_order ?? 999),
        published: !!form.published,
      };
      const { error } = await supabase.from('experience').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      setMsg('Saved!');
      setForm({
        id: undefined,
        org: '',
        role: '',
        start: '',
        end: '',
        bullets: [],
        logo_url: '',
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
    const ok = confirm('Delete this experience entry? This will also remove its logo from storage.');
    if (!ok) return;

    try {
      const path = storagePathFromPublicUrl(row?.logo_url);
      if (path) {
        await supabase.storage.from('images').remove([path]);
      }
    } catch {
      // ignore cleanup errors
    }

    const { error } = await supabase.from('experience').delete().eq('id', id);
    if (!error) await load();
  }

  function editRow(r: ExperienceRow) {
    setForm({
      id: r.id,
      org: r.org || '',
      role: r.role || '',
      start: r.start || '',
      end: r.end || '',
      bullets: r.bullets || [],
      logo_url: r.logo_url || '',
      sort_order: r.sort_order ?? 999,
      published: r.published !== false,
    });
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      setMsg(null);

      const base = `${form.org || 'org'}-${form.role || 'role'}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const path = `logos/${base}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;

      const { error: upErr } = await supabase.storage
        .from('images')
        .upload(path, file, { upsert: false, cacheControl: '3600' });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from('images').getPublicUrl(path);
      const publicUrl = data.publicUrl;
      setForm(f => ({ ...f, logo_url: publicUrl }));
      setMsg('Logo uploaded ✔');
    } catch (err: any) {
      setMsg(err.message || 'Upload failed');
    } finally {
      setUploadingLogo(false);
      e.currentTarget.value = '';
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <form onSubmit={save} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur space-y-4">
        <h3 className="text-white font-medium">Create / Edit Experience</h3>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">Organization*</span>
          <input
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
            value={form.org}
            onChange={e => setForm(f => ({ ...f, org: e.target.value }))}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">Role*</span>
          <input
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            required
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Start</span>
            <input
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.start || ''}
              onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
              placeholder="2022-01"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">End</span>
            <input
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.end || ''}
              onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
              placeholder="2023-05 or Present"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">Bullets (pipe | separated)</span>
          <input
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
            value={toPipe(form.bullets)}
            onChange={e => setForm(f => ({ ...f, bullets: pipeToArray(e.target.value) }))}
            placeholder="Did X | Built Y | Improved Z"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">Logo URL</span>
          <input
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
            value={form.logo_url || ''}
            onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
          />
        </label>
        <div className="-mt-2 mb-1 flex items-center gap-3">
          <button
            type="button"
            onClick={() => document.getElementById('logo-file-input')?.click()}
            disabled={uploadingLogo}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15 disabled:opacity-60"
          >
            {uploadingLogo ? 'Uploading…' : 'Upload logo to Supabase'}
          </button>
          <input
            id="logo-file-input"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <span className="text-xs text-white/50">or paste a URL above</span>
        </div>
        {form.logo_url ? (
          <div className="mt-1 flex items-center gap-3">
            <img src={form.logo_url} alt="logo preview" className="h-14 w-auto rounded border border-white/10 object-contain bg-white/5 p-1" />
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, logo_url: '' }))}
              className="text-xs rounded-lg border border-white/15 px-2 py-1 text-white/80 hover:bg-white/10"
            >
              Remove logo
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Sort Order</span>
            <input
              type="number"
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.sort_order ?? 999}
              onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
            />
          </label>
          <label className="flex items-center gap-2 text-white/80">
            <input
              type="checkbox"
              checked={!!form.published}
              onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
            />
            Published
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || uploadingLogo}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/20 px-4 py-2 text-white hover:bg-violet-500/30 transition disabled:opacity-60"
          >
            {saving ? 'Saving…' : form.id ? 'Update Experience' : 'Create Experience'}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm({ id: undefined, org: '', role: '', start: '', end: '', bullets: [], logo_url: '', sort_order: 999, published: true })}
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
        <h3 className="text-white font-medium mb-3">Experience</h3>
        {loading ? (
          <div className="text-white/70">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-white/60 text-sm">No experience yet.</div>
        ) : (
          <ul className="space-y-2">
            {rows.map(r => (
              <li key={r.id || `${r.org}-${r.role}`} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                <div className="min-w-0">
                  <div className="text-white/90 font-medium truncate">{r.role} @ {r.org}</div>
                  <div className="text-xs text-white/60 truncate flex items-center gap-2">
                    <span>{r.start} - {r.end}</span>
                    <span className={"px-1.5 py-0.5 rounded text-[10px] border " + (r.published ? 'border-emerald-400/30 text-emerald-200 bg-emerald-500/10' : 'border-white/15 text-white/60 bg-white/5')}>
                      {r.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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