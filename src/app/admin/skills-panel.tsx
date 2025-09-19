"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { SkillGroup, Skill } from "@/types/skills";

type FormG = Omit<SkillGroup, "id"> & { id?: string };
type FormS = Omit<Skill, "id"> & { id?: string };

export default function SkillsPanel() {
  const [groups, setGroups] = useState<SkillGroup[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [gForm, setGForm] = useState<FormG>({
    name: "",
    blurb: "",
    icon: "",
    icon_url: "",
    accent: "emerald",
    sort_order: 999,
    published: true,
  });
  const [sForm, setSForm] = useState<FormS>({
    group_id: "",
    name: "",
    sort_order: 999,
    published: true,
  });
  const [bulkSkills, setBulkSkills] = useState("");
  const [busy, setBusy] = useState(false);

  const byGroup = useMemo(() => {
    const m = new Map<string, Skill[]>();
    for (const s of skills) {
      if (!m.has(s.group_id)) m.set(s.group_id, []);
      m.get(s.group_id)!.push(s);
    }
    return m;
  }, [skills]);

  const load = async () => {
    const { data: g } = await supabase
      .from("skill_groups")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    const { data: s } = await supabase
      .from("skills")
      .select("*")
      .order("group_id", { ascending: true })
      .order("sort_order", { ascending: true });
    setGroups((g ?? []) as SkillGroup[]);
    setSkills((s ?? []) as Skill[]);
  };

  useEffect(() => { load(); }, []);

  const upsertGroup = async () => {
    try {
      setBusy(true);
      const payload = { ...gForm };
      const { error } = await supabase.from("skill_groups").upsert(payload).select();
      if (!error) {
        setGForm({ name:"", blurb:"", icon:"", icon_url:"", accent:"emerald", sort_order:999, published:true });
        await load();
      } else {
        alert("Error saving group: " + (error?.message ?? "Unknown error"));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert("Error saving group: " + msg);
    } finally {
      setBusy(false);
    }
  };

  const editGroup = (g: SkillGroup) => setGForm({ ...g });

  const removeGroup = async (id: string) => {
    setBusy(true);
    await supabase.from("skill_groups").delete().eq("id", id);
    await load();
    setBusy(false);
  };

  const upsertSkill = async () => {
    if (!sForm.group_id) return alert("Please select a skill group before saving.");
    try {
      setBusy(true);
      const { error } = await supabase.from("skills").upsert(sForm).select();
      if (!error) {
        setSForm({ group_id:"", name:"", sort_order:999, published:true });
        await load();
      } else {
        alert("Error saving skill: " + (error?.message ?? "Unknown error"));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert("Error saving skill: " + msg);
    } finally {
      setBusy(false);
    }
  };

  const editSkill = (s: Skill) => setSForm({ ...s });

  const removeSkill = async (id: string) => {
    setBusy(true);
    await supabase.from("skills").delete().eq("id", id);
    await load();
    setBusy(false);
  };

  const saveBulkSkills = async () => {
    if (!bulkSkills.trim()) return alert("Please enter skills to add.");
    if (!sForm.group_id) return alert("Please select a skill group for bulk addition.");
    try {
      setBusy(true);
      const entries = bulkSkills
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map((name, idx) => ({
          group_id: sForm.group_id!,
          name,
          sort_order: 999 + idx,
          published: true,
        }));
      const { error } = await supabase.from("skills").upsert(entries).select();
      if (!error) {
        setBulkSkills("");
        await load();
      } else {
        alert("Error saving bulk skills: " + (error?.message ?? "Unknown error"));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert("Error saving bulk skills: " + msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HELPER TEXT */}
      <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-5 text-sm text-white/70">
        <p><strong>Instructions:</strong> Use the forms below to create or edit skill groups and individual skills.</p>
        <p>For bulk adding skills, enter multiple skill names separated by commas or new lines, select a group, and click "Add Bulk Skills".</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GROUP FORM */}
        <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-6 flex flex-col">
          <h3 className="font-semibold mb-4 text-lg">Create / Edit Skill Group</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
            <input
              className="input"
              placeholder="Group Name (required)"
              value={gForm.name}
              onChange={e => setGForm(v => ({ ...v, name: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Accent color (e.g., emerald, sky, violet, or #hex)"
              value={gForm.accent ?? ""}
              onChange={e => setGForm(v => ({ ...v, accent: e.target.value }))}
            />
            <input
              className="input md:col-span-2"
              placeholder="Brief description or blurb for the group"
              value={gForm.blurb ?? ""}
              onChange={e => setGForm(v => ({ ...v, blurb: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Icon (emoji or icon name)"
              value={gForm.icon ?? ""}
              onChange={e => setGForm(v => ({ ...v, icon: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Icon URL (optional)"
              value={gForm.icon_url ?? ""}
              onChange={e => setGForm(v => ({ ...v, icon_url: e.target.value }))}
            />
            <input
              className="input"
              type="number"
              placeholder="Sort order (lower = higher priority)"
              value={gForm.sort_order}
              onChange={e => setGForm(v => ({ ...v, sort_order: +e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={gForm.published}
                onChange={e => setGForm(v => ({ ...v, published: e.target.checked }))}
              />
              Published
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button className="btn-primary flex-grow" onClick={upsertGroup} disabled={busy || !gForm.name.trim()}>
              {gForm.id ? "Update Group" : "Create Group"}
            </button>
            {gForm.id && (
              <button
                className="btn-danger"
                onClick={() => removeGroup(gForm.id!)}
                disabled={busy}
              >
                Delete Group
              </button>
            )}
          </div>
        </div>

        {/* SKILL FORM */}
        <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-6 flex flex-col">
          <h3 className="font-semibold mb-4 text-lg">Create / Edit Skill</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="input"
              value={sForm.group_id}
              onChange={e => setSForm(v => ({ ...v, group_id: e.target.value }))}
            >
              <option value="">Select group for skill...</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Skill name (required)"
              value={sForm.name}
              onChange={e => setSForm(v => ({ ...v, name: e.target.value }))}
            />
            <input
              className="input"
              type="number"
              placeholder="Sort order (lower = higher priority)"
              value={sForm.sort_order}
              onChange={e => setSForm(v => ({ ...v, sort_order: +e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sForm.published}
                onChange={e => setSForm(v => ({ ...v, published: e.target.checked }))}
              />
              Published
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              className="btn-primary flex-grow"
              onClick={upsertSkill}
              disabled={busy || !sForm.name.trim() || !sForm.group_id}
            >
              {sForm.id ? "Update Skill" : "Create Skill"}
            </button>
            {sForm.id && (
              <button
                className="btn-danger"
                onClick={() => removeSkill(sForm.id!)}
                disabled={busy}
              >
                Delete Skill
              </button>
            )}
          </div>

          {/* BULK SKILLS ENTRY */}
          <div className="mt-8">
            <label htmlFor="bulkSkills" className="block mb-1 font-medium text-sm">
              Bulk Add Skills (comma or newline separated)
            </label>
            <textarea
              id="bulkSkills"
              className="input resize-y min-h-[100px]"
              placeholder="e.g. SQL, Python, TensorFlow, React
(Separate with commas or new lines)"
              value={bulkSkills}
              onChange={e => setBulkSkills(e.target.value)}
              disabled={busy}
            />
            <button
              className="btn-success mt-3"
              onClick={saveBulkSkills}
              disabled={busy || !bulkSkills.trim() || !sForm.group_id}
            >
              Add Bulk Skills
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-6">
        <h3 className="font-semibold mb-5 text-lg">Skills Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((g) => (
            <div key={g.id} className="rounded-lg ring-1 ring-white/10 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-base">{g.name}</div>
                <div className="flex gap-3">
                  <button
                    className="btn-ghost text-xs"
                    onClick={() => editGroup(g)}
                    aria-label={`Edit group ${g.name}`}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger text-xs"
                    onClick={() => removeGroup(g.id)}
                    aria-label={`Delete group ${g.name}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {g.blurb ? <p className="text-xs text-white/60 mb-3">{g.blurb}</p> : null}
              <ul className="flex flex-wrap gap-3 overflow-auto max-h-48">
                {(byGroup.get(g.id) ?? []).map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 bg-white/10 rounded px-3 py-1 text-sm"
                  >
                    <span>{s.name}</span>
                    <button
                      className="btn-ghost text-xs"
                      onClick={() => editSkill(s)}
                      aria-label={`Edit skill ${s.name}`}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger text-xs"
                      onClick={() => removeSkill(s.id)}
                      aria-label={`Delete skill ${s.name}`}
                    >
                      Del
                    </button>
                  </li>
                ))}
                {(byGroup.get(g.id)?.length ?? 0) === 0 && (
                  <li className="text-xs text-white/50 italic">No skills added yet.</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .input {
          @apply rounded-md bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-white/20;
          font-family: inherit;
        }
        .btn-primary {
          @apply rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed;
        }
        .btn-success {
          @apply rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed;
        }
        .btn-ghost {
          @apply rounded-md bg-transparent px-3 py-1 text-sm text-white/80 hover:bg-white/10;
        }
        .btn-danger {
          @apply rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed;
        }
      `}</style>
    </div>
  );
}