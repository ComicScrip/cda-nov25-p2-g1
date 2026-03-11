const linkClass = "text-gray-300 hover:text-white transition-colors text-xs md:text-sm";

export default function Footer() {
  return (
    <footer className="bg-dark-footer text-white py-3 px-4 md:py-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Mobile: single flattened row */}
        <div className="md:hidden flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs">
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

        {/* Desktop: 3 columns */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          <div>
            <h2 className="font-semibold text-base mb-2">Légal</h2>
            <ul className="space-y-1">
              <li>
                <a href="/confidentialite" className={linkClass}>
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="/cgu" className={linkClass}>
                  CGU
                </a>
              </li>
              <li>
                <a href="/rgpd" className={linkClass}>
                  RGPD
                </a>
              </li>
              <li>
                <a href="/mentions-legales" className={linkClass}>
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-base mb-2">À propos</h2>
            <ul className="space-y-1">
              <li>
                <a href="/blog" className={linkClass}>
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-base mb-2">Contact</h2>
          </div>
        </div>
      </div>
    </footer>
  );
}
