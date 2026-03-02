export type AnalyticsEventName =
  | "modal_shown"
  | "scenario_selected"
  | "plan_cta_clicked"
  | "skip_clicked"
  | "blob_clicked";

export function trackEvent(
  name: AnalyticsEventName,
  params?: Record<string, any>
) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", name, params || {});
  } else {
    // Fallback stub for environments without gtag configured
    // eslint-disable-next-line no-console
    console.log("[analytics]", name, params || {});
  }
}

