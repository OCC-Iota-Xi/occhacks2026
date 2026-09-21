import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!posthogKey || !posthogHost) {
  if (process.env.NODE_ENV === "development") {
    const missingVariable = posthogKey
      ? "NEXT_PUBLIC_POSTHOG_HOST"
      : "NEXT_PUBLIC_POSTHOG_KEY";

    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    );
  }
} else {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: "2025-05-24",
    // PostHog loads its own scripts by inserting them before the first
    // `body > script`, which is the homepage's JSON-LD tag — inside the tree
    // React is hydrating, so React finds a script it never rendered and warns.
    // "head" puts them out of React's reach. It is the default from the
    // 2026-01-30 defaults onward; set explicitly so bumping `defaults` above
    // is a decision about pageview behaviour and nothing else.
    external_scripts_inject_target: "head",
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
  });
}
