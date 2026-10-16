import React, {
  useEffect,
  useLayoutEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  Globe2,
  Layers3,
  Radio,
  Search,
  Star,
} from "lucide-react";
import "../controls.css";
export type SourceOption = {
  value: string;
  label: string;
  description?: string;
  count?: number;
  kind?: "doh" | "favorites" | "custom" | "all" | "collection";
};
const icons = {
  doh: Radio,
  favorites: Star,
  custom: Layers3,
  all: Globe2,
  collection: Layers3,
};
export function SourceSelect({
  value,
  options,
  onChange,
  disabled,
  label,
  fa,
  searchable = options.length > 12,
}: {
  value: string;
  options: SourceOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  label: string;
  fa: boolean;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(0);
  const [query, setQuery] = useState(""),
    [limit, setLimit] = useState(80);
  const [position, setPosition] = useState<React.CSSProperties>({});
  const trigger = useRef<HTMLButtonElement>(null),
    shell = useRef<HTMLDivElement>(null),
    popup = useRef<HTMLDivElement>(null),
    search = useRef<HTMLInputElement>(null);
  const typeahead = useRef({ value: "", at: 0 });
  const id = useId().replaceAll(":", "");
  const selected = options.find((o) => o.value === value) || options[0];
  const Icon = icons[selected?.kind || "collection"];
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return term
      ? options.filter((o) =>
          `${o.label} ${o.description || ""}`
            .toLocaleLowerCase()
            .includes(term),
        )
      : options;
  }, [options, query]);
  const shown = filtered.slice(0, Math.max(limit, active + 1));
  const place = () => {
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(
      Math.max(rect.width, searchable ? 360 : 280),
      innerWidth - 24,
    );
    const below = innerHeight - rect.bottom - 12,
      above = rect.top - 12;
    const upward = below < 280 && above > below;
    setPosition({
      position: "fixed",
      width,
      left: Math.max(
        12,
        Math.min(innerWidth - width - 12, fa ? rect.right - width : rect.left),
      ),
      ...(upward
        ? { bottom: innerHeight - rect.top + 8 }
        : { top: rect.bottom + 8 }),
      maxHeight: Math.max(120, Math.min(430, upward ? above : below)),
    });
  };
  useLayoutEffect(() => {
    if (!open) return;
    place();
    if (searchable) search.current?.focus({ preventScroll: true });
    const outside = (e: PointerEvent) => {
      if (
        !trigger.current?.contains(e.target as Node) &&
        !shell.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    const scroll = (e: Event) => {
      if (!shell.current?.contains(e.target as Node)) place();
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", scroll, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", scroll, true);
    };
  }, [open, fa, searchable]);
  useLayoutEffect(() => {
    if (!open || !popup.current) return;
    const option = popup.current.querySelector<HTMLElement>(
      `[data-option="${active}"]`,
    );
    if (!option) return;
    const box = popup.current.getBoundingClientRect(),
      item = option.getBoundingClientRect();
    if (item.top < box.top + 6)
      popup.current.scrollTop += item.top - box.top - 6;
    else if (item.bottom > box.bottom - 6)
      popup.current.scrollTop += item.bottom - box.bottom + 6;
  }, [active, open, position]);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const close = () => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };
  const choose = (index: number) => {
    if (filtered[index]) onChange(filtered[index].value);
    close();
  };
  const reveal = () => {
    setQuery("");
    setLimit(80);
    setActive(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
  };
  const keyboard = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }
    if (
      ["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key) &&
      !(e.target === search.current && ["Home", "End"].includes(e.key))
    ) {
      e.preventDefault();
      if (!open) reveal();
      else
        setActive((i) =>
          !filtered.length
            ? 0
            : e.key === "Home"
              ? 0
              : e.key === "End"
                ? filtered.length - 1
                : (i + (e.key === "ArrowDown" ? 1 : -1) + filtered.length) %
                  filtered.length,
        );
      return;
    }
    if (
      (e.key === "Enter" || (e.key === " " && e.target !== search.current)) &&
      open
    ) {
      e.preventDefault();
      choose(active);
      return;
    }
    if (
      !searchable &&
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      e.key !== " "
    ) {
      const now = Date.now();
      typeahead.current.value =
        now - typeahead.current.at < 600
          ? typeahead.current.value + e.key
          : e.key;
      typeahead.current.at = now;
      const found = options.findIndex((o) =>
        o.label.toLowerCase().startsWith(typeahead.current.value.toLowerCase()),
      );
      if (found >= 0) {
        setOpen(true);
        setActive(found);
      }
    }
  };
  return (
    <div className="source-select">
      <button
        ref={trigger}
        type="button"
        className={`source-trigger ${open ? "is-open" : ""}`}
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-options` : undefined}
        aria-activedescendant={
          open && !searchable && filtered[active]
            ? `${id}-option-${active}`
            : undefined
        }
        disabled={disabled}
        onClick={() => (open ? close() : reveal())}
        onKeyDown={keyboard}
      >
        <Icon size={18} />
        <span>{selected?.label || label}</span>
        <ChevronDown size={16} className="select-chevron" />
      </button>
      {open &&
        createPortal(
          <div
            className="source-popover"
            ref={shell}
            style={position}
            dir={fa ? "rtl" : "ltr"}
          >
            {searchable && (
              <div className="source-search">
                <Search size={17} />
                <input
                  ref={search}
                  type="search"
                  aria-controls={`${id}-options`}
                  aria-activedescendant={
                    filtered[active] ? `${id}-option-${active}` : undefined
                  }
                  aria-autocomplete="list"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                    setLimit(80);
                    if (popup.current) popup.current.scrollTop = 0;
                  }}
                  onKeyDown={keyboard}
                  aria-label={fa ? `جست‌وجو در ${label}` : `Search ${label}`}
                  placeholder={
                    fa
                      ? "نام یا آدرس را جست‌وجو کن…"
                      : "Search a name or address…"
                  }
                />
              </div>
            )}
            <div
              className="source-menu"
              ref={popup}
              id={`${id}-options`}
              role="listbox"
              aria-label={label}
              onScroll={() => {
                const p = popup.current;
                if (p && p.scrollHeight - p.scrollTop - p.clientHeight < 100)
                  setLimit((n) => n + 80);
              }}
            >
              {shown.map((option, index) => {
                const OptionIcon = icons[option.kind || "collection"];
                return (
                  <div
                    key={option.value}
                    id={`${id}-option-${index}`}
                    data-option={index}
                    role="option"
                    aria-selected={option.value === value}
                    className={`source-option ${index === active ? "is-active" : ""} ${option.value === value ? "is-selected" : ""}`}
                    onPointerMove={() => setActive(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(index)}
                  >
                    <span className="source-option-icon">
                      <OptionIcon size={20} />
                    </span>
                    <span className="source-option-copy">
                      <strong>{option.label}</strong>
                      {option.description && (
                        <small>{option.description}</small>
                      )}
                    </span>
                    <span className="source-option-end">
                      {option.value === value ? (
                        <Check size={17} />
                      ) : option.count !== undefined ? (
                        <span>{option.count}</span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>
            {!filtered.length && (
              <p className="source-empty" role="status">
                {fa
                  ? "گزینه‌ای پیدا نشد. نام یا آدرس دیگری بنویس."
                  : "No matches. Try another name or address."}
              </p>
            )}
            {searchable && (
              <div className="source-count" role="status">
                {fa
                  ? `${shown.length.toLocaleString("fa-IR")} از ${filtered.length.toLocaleString("fa-IR")} گزینه`
                  : `${shown.length} of ${filtered.length} options`}
              </div>
            )}
          </div>,
          trigger.current?.closest("dialog") || document.body,
        )}
    </div>
  );
}
