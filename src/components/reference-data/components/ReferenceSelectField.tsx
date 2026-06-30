"use client";

import { ChevronDown, Search } from "lucide-react";
import { useId, useMemo, useState } from "react";

export interface ReferenceSelectOption {
  value: string;
  label: string;
  meta?: string;
  icon?: string;
}

interface ReferenceSelectFieldProps {
  label: string;
  value?: string;
  options: ReferenceSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
}

export function ReferenceSelectField({
  label,
  value = "",
  options,
  onChange,
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  disabled = false,
  error,
}: ReferenceSelectFieldProps) {
  const inputId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) =>
      [option.label, option.value, option.meta]
        .filter(Boolean)
        .some((text) => String(text).toLowerCase().includes(query)),
    );
  }, [options, search]);

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <button
          id={inputId}
          type="button"
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onClick={() => setIsOpen((open) => !open)}
          className={`flex min-h-11 w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-left text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)] disabled:cursor-not-allowed disabled:opacity-60 ${
            error ? "border-destructive" : "border-input"
          }`}
        >
          <span className={selected ? "text-foreground" : "text-muted-foreground"}>
            {selected ? (
              <span className="flex items-center gap-2">
                {selected.icon && <span aria-hidden="true">{selected.icon}</span>}
                <span>{selected.label}</span>
                {selected.meta && <span className="text-xs text-muted-foreground">{selected.meta}</span>}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-elevated"
              role="listbox"
            >
              <div className="sticky top-0 flex items-center gap-2 border-b border-border bg-popover px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-[var(--brand-gold)]/10 ${
                      option.value === value ? "bg-[var(--brand-gold)]/15 font-semibold text-foreground" : ""
                    }`}
                  >
                    {option.icon && <span aria-hidden="true">{option.icon}</span>}
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {option.meta && <span className="text-xs text-muted-foreground">{option.meta}</span>}
                  </button>
                ))}
                {filteredOptions.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">No results found</p>
                )}
              </div>
            </div>
            <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setIsOpen(false)} />
          </>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

