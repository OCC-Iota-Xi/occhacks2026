/**
 * Where to send someone after they sign in.
 *
 * The path travels through a query string (`/signin?next=/admin`), which means
 * it arrives as attacker-controllable text: without this, a link to
 * `/signin?next=https://elsewhere.example` would hand someone a sign-in page on
 * this domain that deposits them somewhere else. Only a plain in-site path is
 * allowed through — one leading slash, no scheme, no protocol-relative `//`.
 */
export const DEFAULT_NEXT = "/register";

export function safeNextPath(value: string | null | undefined): string {
  if (!value) return DEFAULT_NEXT;
  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return DEFAULT_NEXT;
  }
  return path;
}
