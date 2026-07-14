const SOCIALS = [
  { label: "instagram", href: "https://www.instagram.com/cshs_occ/" },
  { label: "discord", href: "https://discord.gg/Qn638vTzp2" },
  { label: "github", href: "https://github.com/OCC-Iota-Xi" },
  { label: "linkedin", href: "https://www.linkedin.com/company/106461068/" },
];

/** The site footer. */
export default function Closer() {
  return (
    <section className="px-6 pb-10">
      <footer className="mt-24 border-t border-border pt-10">
        <div className="flex flex-col items-center gap-5 text-center text-sm text-muted-foreground">
          <span className="select-none font-header text-lg tracking-wider text-[var(--text-primary)]">
            OCC<span className="text-amber-500">Hacks</span>
          </span>
          <div className="flex items-center gap-6">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {social.label}
              </a>
            ))}
          </div>
          <p>
            organized by the Iota Xi (ΙΞ) Society at{" "}
            <a
              href="https://orangecoastcollege.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Orange Coast College
            </a>
          </p>
          <p className="text-muted-foreground/60">occ hacks 2026 · costa mesa, ca</p>
        </div>
      </footer>
    </section>
  );
}
