"use client";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove: (id: string) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile requires a browser"));
  }
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Lazily loads the Cloudflare Turnstile script, renders a widget pinned to the
 * viewport, and resolves with the verification token. Rejects when the site key
 * is unconfigured or the challenge errors, so callers can surface the fallback.
 */
export async function solveTurnstile(): Promise<string> {
  if (!SITE_KEY) throw new Error("Turnstile site key is not configured");
  await loadScript();
  if (!window.turnstile) throw new Error("Turnstile is unavailable");

  return new Promise<string>((resolve, reject) => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.bottom = "1rem";
    container.style.right = "1rem";
    container.style.zIndex = "50";
    document.body.appendChild(container);

    const cleanup = (id?: string) => {
      try {
        if (id) window.turnstile?.remove(id);
      } finally {
        container.remove();
      }
    };

    const widgetId = window.turnstile!.render(container, {
      sitekey: SITE_KEY,
      callback: (token: string) => {
        cleanup(widgetId);
        resolve(token);
      },
      "error-callback": () => {
        cleanup(widgetId);
        reject(new Error("Turnstile challenge failed"));
      },
    });
  });
}
