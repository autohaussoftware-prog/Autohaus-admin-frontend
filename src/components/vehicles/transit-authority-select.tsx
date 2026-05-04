"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { searchTransitAuthorities } from "@/data/transit-authorities";

type Props = {
  name?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
};

export function TransitAuthoritySelect({
  name = "cityRegistration",
  defaultValue = "",
  required = false,
  placeholder = "Buscar organismo de tránsito…",
}: Props) {
  const [query, setQuery] = useState(defaultValue);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = searchTransitAuthorities(query === value ? "" : query).slice(0, 12);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (!value) setQuery("");
        else setQuery(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  function selectOption(name: string) {
    setValue(name);
    setQuery(name);
    setOpen(false);
  }

  function clear() {
    setValue("");
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} required={required} />
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value !== value) setValue("");
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 pr-16 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-[#D6A93D] focus:ring-1 focus:ring-[#D6A93D]"
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={clear}
              className="rounded p-0.5 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl">
          {results.map((auth) => (
            <button
              key={`${auth.city}-${auth.name}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(auth.name);
              }}
              className={`flex w-full flex-col px-3 py-2 text-left transition-colors hover:bg-zinc-800 ${
                value === auth.name ? "bg-zinc-800" : ""
              }`}
            >
              <span className="text-sm text-white">{auth.name}</span>
              <span className="text-xs text-zinc-500">{auth.city} · {auth.department}</span>
            </button>
          ))}
        </div>
      )}

      {open && query.length > 1 && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm text-zinc-500 shadow-xl">
          Sin resultados para &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
