type Params = Record<string, string | number | boolean>;
declare global { interface Window { gtag?: (...args: unknown[]) => void } }

/** No-op unless Google Analytics is configured. Never pass file names or image data. */
export function track(event: string, params: Params = {}) {
  if (typeof window !== "undefined") window.gtag?.("event", event, params);
}
