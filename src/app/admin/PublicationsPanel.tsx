"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type PubForm = {
  id?: string;
  title: string;
  slug: string;
  pub_url: string;
  abstract: string;
  views: string;       // keep as text inputs, cast on save
  downloads: string;
  tech: string;        // comma or pipe separated
  sort_order: string;
  published: boolean;
};

const emptyForm: PubForm = {
  title: "",
  slug: "",
  pub_url: "",
  abstract: "",
  views: "0",
  downloads: "0",
  tech: "",
  sort_order: "999",
  published: true,
};

export default function PublicationsPanel() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState<PubForm>(emptyForm);
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("publications")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    setList(data || []);
  }

  useEffect(() => { load(); }, []);

  function edit(row: any) {
    setForm({
      id: row.id,
      title: row.title ?? "",
      slug: row.slug ?? "",
      pub_url: row.pub_url ?? "",
      abstract: row.abstract ?? "",
      views: String(row.metrics?.views ?? 0),
      downloads: String(row.metrics?.downloads ?? 0),
      tech: Array.isArray(row.tech) ? row.tech.join(", ") : "",
      sort_order: String(row.sort_order ?? 999),
      published: !!row.published,
    });
  }

  function reset() { setForm(emptyForm); }

  async function save() {
    setLoading(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || null,
      pub_url: form.pub_url.trim() || null,
      abstract: form.abstract.trim() || null,
      metrics: { views: Number(form.views || 0), downloads: Number(form.downloads || 0) },
      tech: form.tech
        .split(/[\n,|]+/)
        .map(s => s.trim())
        .filter(Boolean),
      sort_order: Number(form.sort_order || 999),
      published: form.published,
    };

    if (form.id) {
      await supabase.from("publications").update(payload).eq("id", form.id);
    } else {
      await supabase.from("publications").insert(payload);
    }
    setLoading(false);
    await load();
    reset();
  }

  async function remove(id: string) {
    if (!confirm("Delete this publication?")) return;
    await supabase.from("publications").delete().eq("id", id);
    await load();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Form */}
      <div className="rounded-2xl ring-1 ring-white/10 p-5 bg-white/[0.04]">
        <h3 className="font-semibold text-white/90 mb-4">
          {form.id ? "Edit Publication" : "Create / Edit Publication"}
        </h3>

        <div className="space-y-3">
          <Input placeholder="Title*" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
          <Input placeholder="Slug" value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))}/>
          <Input placeholder="Publication URL" value={form.pub_url} onChange={e=>setForm(f=>({...f,pub_url:e.target.value}))}/>
          <Textarea rows={6} placeholder="Abstract" value={form.abstract} onChange={e=>setForm(f=>({...f,abstract:e.target.value}))}/>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Views" value={form.views} onChange={e=>setForm(f=>({...f,views:e.target.value}))}/>
            <Input placeholder="Downloads" value={form.downloads} onChange={e=>setForm(f=>({...f,downloads:e.target.value}))}/>
          </div>
          <Textarea rows={2} placeholder="Technical implementation (comma, pipe, or new line separated)"
            value={form.tech} onChange={e=>setForm(f=>({...f,tech:e.target.value}))}/>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Sort order" value={form.sort_order} onChange={e=>setForm(f=>({...f,sort_order:e.target.value}))}/>
            <label className="inline-flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))}/>
              Published
            </label>
          </div>

          <div className="flex gap-3">
            <Button onClick={save} disabled={loading}>{form.id ? "Update" : "Create"}</Button>
            <Button variant="secondary" onClick={reset}>Clear</Button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl ring-1 ring-white/10 p-5 bg-white/[0.04]">
        <h3 className="font-semibold text-white/90 mb-4">Publications</h3>
        <div className="space-y-3">
          {list.map((row) => (
            <div key={row.id} className={cn(
              "rounded-xl ring-1 ring-white/10 p-3 bg-white/[0.03] flex items-center justify-between gap-3",
              !row.published && "opacity-60"
            )}>
              <div className="min-w-0">
                <div className="font-medium truncate">{row.title}</div>
                <div className="text-xs text-white/60">{row.metrics?.views ?? 0} views • {row.metrics?.downloads ?? 0} downloads</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="secondary" onClick={()=>edit(row)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={()=>remove(row.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {!list.length && <div className="text-white/60 text-sm">No publications yet.</div>}
        </div>
      </div>
    </div>
  );
}