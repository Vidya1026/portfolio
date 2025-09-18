'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const IMAGE_BUCKET = process.env.NEXT_PUBLIC_IMAGE_BUCKET || 'cert-images';
const LOGO_DIR = 'experience'; // folder inside the bucket for experience logos

function storagePathFromPublicUrl(url?: string | null) {
  if (!url) return null;
  try {
    const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
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
  tools?: string[] | string; // ← allow legacy string too
  logo_url?: string;
  sort_order?: number;
  published?: boolean;
};

function toPipe(a?: string[]) {
  // For editing, show one bullet per line
  return (a ?? []).join('\n');
}
function pipeToArray(s: string) {
  return s.split('|').map(x => x.trim()).filter(Boolean);
}
function parseBullets(input: string) {
  return input
    .split(/\r?\n|\|/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseTools(input: string) {
  return input
    .split(/\r?\n|\||,/g)
    .map((x) => x.trim())
    .filter(Boolean);
}
function toComma(a?: string[]) {
  return (a ?? []).join(', ');
}

function normalizeTools(t?: string[] | string | null): string[] {
  if (!t) return [];
  if (Array.isArray(t)) return t.filter(Boolean);
  return parseTools(t);
}

export default function ExperiencePanel() {
  const [rows, setRows] = useState<ExperienceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bulletsText, setBulletsText] = useState("");
  const [toolsText, setToolsText] = useState("");

  const [form, setForm] = useState<ExperienceRow>({
    org: '',
    role: '',
    start: '',
    end: '',
    bullets: [],
    tools: [],
    logo_url: '',
    sort_order: 999,
    published: true,
  });

  useEffect(() => { setBulletsText(""); setToolsText(""); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('start', { ascending: false });
    if (!error && data) {
      const normalized = (data as any[]).map((r) => ({
        ...r,
        tools: normalizeTools(r.tools),
      }));
      setRows(normalized as any);
    }
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
        bullets: parseBullets(bulletsText) ?? [],
        tools: parseTools(toolsText) ?? [],
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
        tools: [],
        logo_url: '',
        sort_order: 999,
        published: true,
      });
      setBulletsText('');
      setToolsText('');
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
        await supabase.storage.from(IMAGE_BUCKET).remove([path]);
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
      tools: normalizeTools(r.tools),
      logo_url: r.logo_url || '',
      sort_order: r.sort_order ?? 999,
      published: r.published !== false,
    });
    setBulletsText(toPipe(r.bullets));
    setToolsText(toComma(normalizeTools(r.tools)));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    // Capture the input element first; React may pool the event
    const inputEl = e.currentTarget;
    const file = inputEl.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));

    try {
      setUploadingLogo(true);
      setMsg(null);

      const base = `${form.org || 'org'}-${form.role || 'role'}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
      const path = `${LOGO_DIR}/${base}-${Date.now()}-${safeName}`;

      const { error: upErr } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, file, { upsert: false, cacheControl: '3600' });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
      const publicUrl = data.publicUrl;
      setForm(f => ({ ...f, logo_url: publicUrl }));
      setPreviewUrl(publicUrl);
      setMsg('Logo uploaded ✔');
    } catch (err: any) {
      setMsg(err.message || 'Upload failed');
    } finally {
      setUploadingLogo(false);
      if (previewUrl && previewUrl.startsWith('blob:')) { URL.revokeObjectURL(previewUrl); }
      // Reset the file input safely
      if (inputEl) inputEl.value = '';
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
          <span className="text-xs text-white/70">Bullets (one per line or use "|")</span>
          <textarea
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white min-h-[120px] resize-y"
            value={bulletsText}
            onChange={e => setBulletsText(e.target.value)}
            placeholder={"Implemented feature X\nReduced latency by 60%\nLed 3-person team"}
          />
          <span className="text-[11px] text-white/40">{parseBullets(bulletsText).length} bullet(s)</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">Tools (comma, | or new line)</span>
          <input
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
            value={toolsText}
            onChange={e => setToolsText(e.target.value)}
            placeholder="TypeScript, React, Next.js, Supabase, Tailwind"
          />
          {parseTools(toolsText).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {parseTools(toolsText).map((t) => (
                <span
                  key={t}
                  className="text-[11px] tracking-wide rounded-md border px-2 py-1 text-emerald-200 border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
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
          <span className="text-xs text-white/50">or paste a URL above (uploads to <code className="text-white/70">{IMAGE_BUCKET}/{LOGO_DIR}</code>)</span>
        </div>
        {(previewUrl || form.logo_url) ? (
          <div className="mt-1 flex items-center gap-3">
            <img
              src={previewUrl || (form.logo_url as string)}
              alt="logo preview"
              className="h-16 w-16 rounded border border-white/10 object-contain bg-white/5 p-1"
            />
            {form.logo_url ? (
              <a
                href={form.logo_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs rounded-lg border border-white/15 px-2 py-1 text-white/80 hover:bg-white/10"
              >
                Open image
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => { setForm(f => ({ ...f, logo_url: '' })); setPreviewUrl(null); }}
              className="text-xs rounded-lg border border-white/15 px-2 py-1 text-white/80 hover:bg-white/10"
            >
              Remove image
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
              onClick={() => { setForm({ id: undefined, org: '', role: '', start: '', end: '', bullets: [], tools: [], logo_url: '', sort_order: 999, published: true }); setBulletsText(''); setToolsText(''); }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-white hover:bg-white/15 transition"
            >
              Cancel Edit
            </button>
          )}
          {msg && <span className="text-sm text-white/70">{msg}</span>}
          <div className="text-xs text-white/40">Using bucket: {IMAGE_BUCKET}</div>
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
                  {normalizeTools(r.tools).length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {normalizeTools(r.tools).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] rounded border px-1.5 py-0.5 text-emerald-200 border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_14px_rgba(16,185,129,0.3)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
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