import React, { useId, useState } from "react";
export function NetworkName({
  value,
  onChange,
  names,
  disabled,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  names: string[];
  disabled: boolean;
  label: string;
}) {
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(0);
  const id = useId().replaceAll(":", "");
  const filtered = [...new Set(names)]
    .filter(
      (n) =>
        n !== value &&
        n.toLocaleLowerCase().includes(value.toLocaleLowerCase()),
    )
    .slice(0, 12);
  const expanded = open && filtered.length > 0;
  const choose = (index: number) => {
    if (filtered[index]) onChange(filtered[index]);
    setOpen(false);
  };
  return (
    <div className="network-input">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        maxLength={50}
        disabled={disabled}
        aria-label={label}
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? `${id}-names` : undefined}
        aria-activedescendant={expanded ? `${id}-name-${active}` : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            e.stopPropagation();
          }
          if (
            (e.key === "ArrowDown" || e.key === "ArrowUp") &&
            filtered.length
          ) {
            e.preventDefault();
            if (!expanded) setOpen(true);
            else
              setActive(
                (i) =>
                  (i + (e.key === "ArrowDown" ? 1 : -1) + filtered.length) %
                  filtered.length,
              );
          }
          if (e.key === "Enter" && expanded) {
            e.preventDefault();
            choose(active);
          }
        }}
      />
      {expanded && (
        <div
          id={`${id}-names`}
          className="network-suggestions"
          role="listbox"
          aria-label={label}
        >
          {filtered.map((n, i) => (
            <button
              key={n}
              id={`${id}-name-${i}`}
              type="button"
              role="option"
              aria-selected={active === i}
              onMouseDown={(e) => e.preventDefault()}
              onPointerMove={() => setActive(i)}
              onClick={() => choose(i)}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
