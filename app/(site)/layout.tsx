/**
 * The space backdrop used to live here, but the under-page footer needs the
 * page to be opaque, and an opaque layer only works from inside the same
 * stacking context as the stars — so it moved into <main> as SpaceBackdrop.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
