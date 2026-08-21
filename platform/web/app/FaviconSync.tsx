"use client";

import { useEffect } from "react";

const FAVICON_PATH = "/interviewthread-favicon-32-v5.png";

export default function FaviconSync() {
  useEffect(() => {
    const syncFavicon = () => {
      if (document.visibilityState === "hidden") return;

      document
        .querySelectorAll<HTMLLinkElement>(
          'link[rel="icon"], link[rel="shortcut icon"]',
        )
        .forEach((link) => link.remove());

      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      link.setAttribute("sizes", "32x32");
      link.dataset.interviewthreadFavicon = "true";
      link.href = `${FAVICON_PATH}?page=${Date.now()}`;
      document.head.appendChild(link);
    };

    syncFavicon();
    window.addEventListener("pageshow", syncFavicon);
    window.addEventListener("focus", syncFavicon);
    document.addEventListener("visibilitychange", syncFavicon);

    return () => {
      window.removeEventListener("pageshow", syncFavicon);
      window.removeEventListener("focus", syncFavicon);
      document.removeEventListener("visibilitychange", syncFavicon);
    };
  }, []);

  return null;
}
