"use client";

import { useEffect, useRef, useState } from "react";

export type MobileNavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export function MobileNav({
  label,
  items,
}: {
  label: string;
  items: MobileNavItem[];
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
