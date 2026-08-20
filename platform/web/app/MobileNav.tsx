"use client";

import { useEffect, useRef, useState } from "react";

export type MobileNavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type MobileNavLanguage = {
  label: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (value: string) => void;
};

export function MobileNav({
  label,
  items,
  language,
}: {
  label: string;
  items: MobileNavItem[];
  language?: MobileNavLanguage;
}) {
  const [open, setOpen] = useState(false);
  // A deterministic id keeps the server-rendered and hydrated trees aligned.
  // Each rendered page has a single MobileNav instance.
  const menuId = "mobile-navigation-menu";
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, []);

  return (
    <div className="mobile-nav" ref={rootRef}>
      <button
        ref={buttonRef}
        className="mobile-nav-button"
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className="mobile-nav-panel" id={menuId} hidden={!open}>
        {language ? (
          <label className="mobile-nav-language">
            <span>{language.label}</span>
            <select
              aria-label={language.label}
              value={language.value}
              onChange={(event) => {
                setOpen(false);
                language.onChange(event.target.value);
              }}
            >
              {language.options.map(([value, optionLabel]) => (
                <option value={value} key={value}>
                  {optionLabel}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {items.map((item) => (
          <a
            href={item.href}
            key={`${item.href}-${item.label}`}
            onClick={() => setOpen(false)}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
          >
            <span>{item.label}</span>
            <b aria-hidden="true">→</b>
          </a>
        ))}
      </nav>
    </div>
  );
}
