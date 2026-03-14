import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
  { href: "/rgpd", label: "RGPD" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/blog", label: "Blog" },
] as const;

export default function UserFooterSlim() {
  return (
    <footer className="bg-dark-footer border-t border-white/10 text-white">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
        <nav className="flex w-full items-center justify-between gap-3 text-[11px] leading-tight">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-gray-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <span className="whitespace-nowrap cursor-default text-[10px] text-gray-400 transition-colors hover:text-white">
            Contact
          </span>
        </nav>
      </div>
    </footer>
  );
}
