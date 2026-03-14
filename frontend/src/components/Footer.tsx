const linkClass = "text-gray-300 hover:text-white transition-colors text-xs md:text-sm";

export default function Footer() {
  return (
    <footer className="bg-dark-footer text-white py-3 px-4 md:py-2 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:gap-x-3">
          <a href="/confidentialite" className={linkClass}>
            Confidentialité
          </a>
          <span className="text-gray-500" aria-hidden="true">
            ·
          </span>
          <a href="/cgu" className={linkClass}>
            CGU
          </a>
          <span className="text-gray-500" aria-hidden="true">
            ·
          </span>
          <a href="/rgpd" className={linkClass}>
            RGPD
          </a>
          <span className="text-gray-500" aria-hidden="true">
            ·
          </span>
          <a href="/mentions-legales" className={linkClass}>
            Mentions légales
          </a>
          <span className="text-gray-500" aria-hidden="true">
            ·
          </span>
          <a href="/blog" className={linkClass}>
            Blog
          </a>
        </div>
      </div>
    </footer>
  );
}
