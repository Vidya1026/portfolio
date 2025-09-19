'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const IMAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET || 'cert-images';

function parseSupabasePublicUrl(url?: string | null): { bucket: string; path: string } | null {
  if (!url) return null;
  try {
    // Accepts any bucket: .../storage/v1/object/public/<bucket>/<path>
    const marker = '/storage/v1/object/public/';
    const i = url.indexOf(marker);
    if (i === -1) return null;
    const rest = url.slice(i + marker.length); // "<bucket>/<path>"
    const firstSlash = rest.indexOf('/');
    if (firstSlash === -1) return null;
    const bucket = rest.slice(0, firstSlash);
    const path = rest.slice(firstSlash + 1);
    return { bucket, path };
  } catch {
    return null;
  }
}

type CertRow = {
  id?: string;
  name: string;
  issuer?: string;
  year?: number | string | null;
  proof_url?: string;
  image?: string;
  sort_order?: number;
  published?: boolean;
};

export default function CertsPanel() {
  const [rows, setRows] = useState<CertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState<CertRow>({
    name: '',
    issuer: '',
    year: '',
    proof_url: '',
    image: '',
    sort_order: 999,
    published: true,
  });

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('year', { ascending: false });
    if (!error && data) setRows(data as CertRow[]);
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
      const payload: CertRow = {
        ...form,
        name: (form.name || '').trim(),
        issuer: (form.issuer || '').trim(),
        proof_url: (form.proof_url || '').trim() || undefined,
        image: (form.image || '').trim() || undefined,
        year: form.year === '' || form.year === undefined ? null : Number(form.year),
        sort_order: Number(form.sort_order ?? 999),
        published: !!form.published,
      };
      const { error } = await supabase.from('certifications').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      setMsg('Saved!');
      setTimeout(() => setMsg(null), 1500);
      setForm({
        id: undefined,
        name: '',
        issuer: '',
        year: '',
        proof_url: '',
        image: '',
        sort_order: 999,
        published: true,
      });
      await load();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMsg(err.message || 'Save failed');
      } else {
        setMsg('Save failed');
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(id?: string) {
    if (!id) return;
    const row = rows.find(r => r.id === id);
    const ok = confirm('Delete this certification? This will also remove its image from storage.');
    if (!ok) return;

    // Best-effort: delete the storage object if the URL points to our public bucket
    try {
      const parsed = parseSupabasePublicUrl(row?.image);
      if (parsed) {
        await supabase.storage.from(parsed.bucket).remove([parsed.path]);
      }
    } catch {
      // ignore cleanup errors
    }

    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (!error) await load();
  }

  function editRow(r: CertRow) {
    setForm({
      id: r.id,
      name: r.name || '',
      issuer: r.issuer || '',
      year: r.year || '',
      proof_url: r.proof_url || '',
      image: r.image || '',
      sort_order: r.sort_order ?? 999,
      published: r.published !== false,
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const inputEl = e.currentTarget; // capture before async
    const file = inputEl.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      setMsg(null);

      // base name from cert name or issuer
      const base = (form.name || form.issuer || 'cert')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
      const path = `certs/${base}-${Date.now()}-${safeName}`;

      const { error: upErr } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, file, { upsert: false, cacheControl: '3600' });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
      const publicUrl = data.publicUrl;

      setForm(f => ({ ...f, image: publicUrl }));
      setMsg('Image uploaded ✔');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMsg(err.message || 'Upload failed');
      } else {
        setMsg('Upload failed');
      }
    } finally {
      setUploadingImage(false);
      // clear the file input safely
      if (inputEl) inputEl.value = '';
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <form onSubmit={save} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur space-y-4">
        <h3 className="text-white font-medium">Create / Edit Certification</h3>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">Name*</span>
          <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Issuer</span>
            <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.issuer || ''} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Year</span>
            <input inputMode="numeric" className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.year || ''} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">Proof URL</span>
          <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
            value={form.proof_url || ''} onChange={e => setForm(f => ({ ...f, proof_url: e.target.value }))} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/70">Image URL</span>
          <input className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
            value={form.image || ''} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
        </label>
        <div className="-mt-2 mb-1 flex items-center gap-3">
          <button
            type="button"
            onClick={() => document.getElementById('cert-image-input')?.click()}
            disabled={uploadingImage}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15 disabled:opacity-60"
          >
            {uploadingImage ? 'Uploading…' : `Upload image to ${IMAGE_BUCKET}`}
          </button>
          <input
            id="cert-image-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <span className="text-xs text-white/50">or paste a URL above</span>
        </div>

        {form.image ? (
          <div className="mt-1 flex items-center gap-3">
            <img
              src={form.image}
              alt="preview"
              className="h-16 w-auto rounded border border-white/10 object-cover"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={form.image}
                target="_blank"
                rel="noreferrer"
                className="text-xs rounded-lg border border-sky-400/30 bg-sky-500/10 px-2 py-1 text-sky-100 hover:bg-sky-500/20"
              >
                Open image
              </a>
              <span className="text-[10px] text-white/60 max-w-[22rem] truncate">{form.image}</span>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, image: '' }))}
                className="text-xs rounded-lg border border-white/15 px-2 py-1 text-white/80 hover:bg-white/10"
              >
                Remove image
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Sort Order</span>
            <input type="number" className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
              value={form.sort_order ?? 999} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </label>
          <label className="flex items-center gap-2 text-white/80">
            <input type="checkbox" checked={!!form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
            Published
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/20 px-4 py-2 text-white hover:bg-violet-500/30 transition disabled:opacity-60"
          >
            {saving ? 'Saving…' : (form.id ? 'Update Certification' : 'Create Certification')}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm({ id: undefined, name: '', issuer: '', year: '', proof_url: '', image: '', sort_order: 999, published: true })}
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
        <h3 className="text-white font-medium mb-3">Certifications</h3>
        {loading ? (
          <div className="text-white/70">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-white/60 text-sm">No certifications yet.</div>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {r.image ? (
                    <img
                      src={r.image}
                      alt={r.name}
                      className="h-10 w-10 flex-none rounded border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 flex-none rounded border border-white/10 bg-white/5 grid place-items-center text-[10px] text-white/50">No img</div>
                  )}
                  <div className="min-w-0">
                    <div className="text-white/90 font-medium truncate">{r.name}</div>
                    <div className="text-xs text-white/60 truncate flex items-center gap-2">
                      <span>{r.issuer} {r.year}</span>
                      <span
                        className={
                          "px-1.5 py-0.5 rounded text-[10px] border " +
                          (r.published
                            ? 'border-emerald-400/30 text-emerald-200 bg-emerald-500/10'
                            : 'border-white/15 text-white/60 bg-white/5')
                        }
                      >
                        {r.published ? 'Published' : 'Draft'}
                      </span>
                      {r.proof_url ? (
                        <a
                          href={r.proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-sky-300 underline decoration-dotted hover:text-sky-200"
                        >
                          Proof
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editRow(r)}
                    className="text-xs rounded-lg border border-white/15 px-2 py-1 text-white/80 hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRow(r.id)}
                    className="text-xs rounded-lg border border-red-400/30 px-2 py-1 text-red-200 hover:bg-red-500/15"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}