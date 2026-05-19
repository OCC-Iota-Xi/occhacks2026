import Link from "next/link";

export default function Navbar() {
  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Mission", href: "#" },
    { name: "Tracks", href: "#" },
    { name: "Schedule", href: "#" },
    { name: "FAQs", href: "#" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-6 bg-[#050509]/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center">
        <Link
          href="#"
          className="font-header text-xl tracking-wider text-white hover:text-amber-500 transition-colors"
        >
          OCC Hacks
        </Link>
      </div>
      <div className="hidden md:flex items-center space-x-10">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="font-body text-[15px] text-gray-300 hover:text-white transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
