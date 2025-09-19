"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Education } from "@/types/education";

type Form = Omit<Education, "id" | "highlights" | "coursework"> & {
  highlights_raw: string;   // newline-separated
  coursework_raw: string;   // comma-separated
};

const emptyForm: Form = {
  school: "",
  degree: "",
  field: "",
  location: "",
  start_date: "",
  end_date: "",
  is_current: false,
  gpa: "",
  website: "",
  logo_url: "",
  sort_order: 999,
  published: true,
  highlights_raw: "",
  coursework_raw: "",
};

export default function EducationPanel() {
  const [items, setItems] = useState<Education[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("education")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("start_date", { ascending: false });
    setItems(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const upsert = async () => {
    setBusy(true);
    const payload: Partial<Education> = {
      school: form.school.trim(),
      degree: form.degree.trim(),
      field: form.field?.trim() || null,
      location: form.location?.trim() || null,
      start_date: form.start_date || null,
      end_date: form.is_current ? null : form.end_date || null,
      is_current: form.is_current,
      gpa: form.gpa?.trim() || null,
      website: form.website?.trim() || null,
      logo_url: form.logo_url?.trim() || null,
      highlights: form.highlights_raw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      coursework: form.coursework_raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      sort_order: form.sort_order ?? 999,
      published: form.published,
    };

    if (!payload.school || !payload.degree) {
      alert("School and Degree are required.");
      setBusy(false);
      return;
    }

    const { error } = editingId
      ? await supabase.from("education").update(payload).eq("id", editingId)
      : await supabase.from("education").insert(payload);

    if (error) alert(error.message);
    setBusy(false);
    setEditingId(null);
    setForm(emptyForm);
    load();
  };

  const edit = (e: Education) => {
    setEditingId(e.id);
    setForm({
      school: e.school,
      degree: e.degree,
      field: e.field ?? "",
      location: e.location ?? "",
      start_date: e.start_date ?? "",
      end_date: e.end_date ?? "",
      is_current: e.is_current,
      gpa: e.gpa ?? "",
      website: e.website ?? "",
      logo_url: e.logo_url ?? "",
      sort_order: e.sort_order,
      published: e.published,
      highlights_raw: (e.highlights || []).join("\n"),
      coursework_raw: (e.coursework || []).join(", "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeItem = async (id: string) => {
    if (!confirm("Delete this education entry?")) return;
    const { error } = await supabase.from("education").delete().eq("id", id);
    if (error) alert(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.04] p-6 md:p-8">
        <h3 className="text-lg font-semibold mb-4">Create / Edit Education</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="School *" value={form.school} onChange={(v) => setForm({ ...form, school: v })} />
          <Input label="Degree *" value={form.degree} onChange={(v) => setForm({ ...form, degree: v })} />
          <Input label="Field" value={form.field} onChange={(v) => setForm({ ...form, field: v })} />
          <Input label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <Input label="Start date (yyyy-mm-dd)" value={form.start_date} onChange={(v) => setForm({ ...form, start_date: v })} />
          <Input label="End date (yyyy-mm-dd)" value={form.end_date} onChange={(v) => setForm({ ...form, end_date: v })} disabled={form.is_current} />
          <Check label="Currently studying" checked={form.is_current} onChange={(v) => setForm({ ...form, is_current: v })} />
          <Input label="GPA" value={form.gpa ?? ""} onChange={(v) => setForm({ ...form, gpa: v })} />
          <Input label="Website" value={form.website ?? ""} onChange={(v) => setForm({ ...form, website: v })} />
          <Input label="Logo URL" value={form.logo_url ?? ""} onChange={(v) => setForm({ ...form, logo_url: v })} />
          <Input label="Sort order" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: Number(v) || 999 })} />
          <Check label="Published" checked={form.published} onChange={(v) => setForm({ ...form, published: v })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <TextArea
            label="Highlights (one per line)"
            value={form.highlights_raw}
            onChange={(v) => setForm({ ...form, highlights_raw: v })}
            rows={6}
          />
          <TextArea
            label="Coursework (comma-separated)"
            value={form.coursework_raw}
            onChange={(v) => setForm({ ...form, coursework_raw: v })}
            rows={6}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={upsert}
            disabled={busy}
            className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2"
          >
            {editingId ? "Update" : "Create"}
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
            className="rounded-lg bg-white/5 hover:bg-white/10 px-4 py-2"
          >
            Clear
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.04] p-6 md:p-8">
        <h3 className="text-lg font-semibold mb-4">Education</h3>
        {items.length === 0 && <div className="text-white/60">No entries yet.</div>}
        <div className="grid gap-3">
          {items.map((e) => (
            <div key={e.id} className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {e.degree} — {e.school}
                </div>
                <div className="text-sm text-white/60">
                  {e.field ? `${e.field} · ` : ""}{e.location || ""} ·{" "}
                  {e.is_current
                    ? `${e.start_date || "—"} — Present`
                    : `${e.start_date || "—"} — ${e.end_date || "—"}`}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => edit(e)} className="rounded-md bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm">Edit</button>
                <button onClick={() => removeItem(e.id)} className="rounded-md bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Input({
  label, value, onChange, disabled
}: { label: string; value: string | null | undefined; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-white/70">{label}</span>
      <input
        className="rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 outline-none focus:ring-white/20"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </label>
  );
}

function Check({
  label, checked, onChange
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-white/70">{label}</span>
    </label>
  );
}

function TextArea({
  label, value, onChange, rows = 5
}: { label: string; value: string | null | undefined; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-white/70">{label}</span>
      <textarea
        className="rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 outline-none focus:ring-white/20 resize-y"
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}