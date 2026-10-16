import React, { useState } from "react";
import { Layers3, Play, Trash2 } from "lucide-react";
export type ResolverCollection = { id: string; name: string; ids: string[] };
export function Collections({
  collections,
  favoriteIds,
  fa,
  onSave,
  onDelete,
  onUse,
}: {
  collections: ResolverCollection[];
  favoriteIds: string[];
  fa: boolean;
  onSave: (item: ResolverCollection) => void;
  onDelete: (id: string) => void;
  onUse: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const f = (a: string, b: string) => (fa ? a : b);
  return (
    <section className="collections-panel">
      <div>
        <h3>
          {f("مجموعه‌ای برای هر موقعیت.", "A collection for each connection.")}
        </h3>
        <p className="muted">
          {f(
            "DNSها را ستاره‌دار کن، بعد این انتخاب را با یک نام ذخیره کن. هر مجموعه جدا می‌ماند.",
            "Star the resolvers you want, then save that selection under a name. Each collection keeps its own entries.",
          )}
        </p>
      </div>
      <form
        className="collection-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !favoriteIds.length) return;
          onSave({
            id: crypto.randomUUID(),
            name: name.trim(),
            ids: [...favoriteIds],
          });
          setName("");
        }}
      >
        <label className="field">
          <span>{f("نام مجموعه", "Collection name")}</span>
          <input
            required
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={f("مثلاً اینترنت همراه", "e.g. Mobile connection")}
          />
        </label>
        <button
          className="button secondary"
          type="submit"
          disabled={!favoriteIds.length}
        >
          <Layers3 size={17} />
          {f(
            `ذخیره ${favoriteIds.length} علاقه‌مندی`,
            `Save ${favoriteIds.length} favorites`,
          )}
        </button>
      </form>
      <div className="saved-collections">
        {collections.map((c) => (
          <article key={c.id}>
            <div>
              <h4>{c.name}</h4>
              <span>{c.ids.length} DNS</span>
            </div>
            <div className="button-row">
              <button className="button secondary" onClick={() => onUse(c.id)}>
                <Play size={15} />
                {f("انتخاب برای تست", "Use for scan")}
              </button>
              <button
                className="icon-button danger"
                aria-label={f("حذف مجموعه ", "Delete collection ") + c.name}
                onClick={() => onDelete(c.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
