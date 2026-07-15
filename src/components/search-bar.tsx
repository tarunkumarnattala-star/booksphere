"use client";

import { Search } from "lucide-react";

export function SearchBar({ value, onChange, placeholder = "Search books, genres, people, discussions" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div className="sticky top-20 z-20">
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)]" size={23} />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onInput={(event) => onChange(event.currentTarget.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-[24px] border-0 bg-white py-5 pl-14 pr-5 text-[19px] font-medium tracking-[-0.02em] shadow-[var(--shadow-soft)] outline-none ring-1 ring-black/[0.05] transition focus:ring-black/20"
        />
      </div>
    </div>
  );
}
