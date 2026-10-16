import React, { useMemo } from "react";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { DnsProvider } from "../types";
import { protocolName } from "../services/catalog";
import { Guide } from "./LabUI";
import { SourceSelect } from "./SourceSelect";
export function GuidePage({
  all,
  selected,
  onSelect,
  fa,
  notify,
  onBack,
  testHref,
}: {
  all: DnsProvider[];
  selected: string;
  onSelect: (id: string) => void;
  fa: boolean;
  notify: (text: string) => void;
  onBack: () => void;
  testHref: string;
}) {
  const f = (a: string, b: string) => (fa ? a : b);
  const options = useMemo(
    () =>
      all.map((d) => ({
        value: d.id,
        label: d.name,
        description: `${protocolName(d)} · ${d.primary}`,
        kind: d.protocol === "doh" ? ("doh" as const) : ("collection" as const),
      })),
    [all],
  );
  const dns = all.find((d) => d.id === selected) || all[0];
  return (
    <section className="guide-page" aria-labelledby="hero-title">
      <div className="guide-page-intro">
        <div>
          <a
            href={testHref}
            className="guide-return"
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              onBack();
            }}
          >
            <ArrowUpRight size={17} />
            {f("برگشت به تست DNS", "Back to DNS test")}
          </a>
          <h1 id="hero-title" tabIndex={-1}>
            {f("از انتخاب تا اتصال.", "From choice to connection.")}
          </h1>
          <p>
            {f(
              "DNS را انتخاب کن، بعد راهنمای دستگاهت را باز کن. هر راهنما مقدار سازگار، مراحل تنظیم و راه برگشت به حالت قبلی را دارد.",
              "Choose a resolver, then open your device guide. Each guide includes a compatible value, setup steps and how to undo the change.",
            )}
          </p>
        </div>
        <BookOpen size={62} strokeWidth={1.1} className="guide-page-icon" />
      </div>
      <div className="guide-choice">
        <div className="field">
          <span>{f("انتخاب DNS", "Choose resolver")}</span>
          <SourceSelect
            value={selected}
            options={options}
            onChange={onSelect}
            fa={fa}
            label={f("انتخاب DNS", "Choose resolver")}
            searchable
          />
        </div>
        <p>
          {f(
            "نام یا آدرس را جست‌وجو کن. همهٔ پروتکل‌ها روی همهٔ دستگاه‌ها قابل تنظیم نیستند؛ راهنما موارد ناسازگار را مشخص می‌کند.",
            "Search a name or address. Protocol support differs by device; the guide identifies settings that are incompatible.",
          )}
        </p>
      </div>
      <Guide dns={dns} fa={fa} notify={notify} />
    </section>
  );
}
