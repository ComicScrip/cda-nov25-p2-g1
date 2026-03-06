export default function Footer() {
  return (
    <footer className="bg-dark-footer text-white py-4 md:py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-sm md:text-base mb-2">Légal</h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="/confidentialite"
                  className="text-gray-300 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Confidentialité
                </a>
              </li>
              <li>
                <a
                  href="/cgu"
                  className="text-gray-300 hover:text-white transition-colors text-xs md:text-sm"
                >
                  CGU
                </a>
              </li>
              <li>
                <a
                  href="/rgpd"
                  className="text-gray-300 hover:text-white transition-colors text-xs md:text-sm"
                >
                  RGPD
                </a>
              </li>
              <li>
                <a
                  href="/mentions-legales"
                  className="text-gray-300 hover:text-white transition-colors text-xs md:text-sm"
                >
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="font-semibold text-sm md:text-base mb-2">A propos</h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="/blog"
                  className="text-gray-300 hover:text-white transition-colors text-xs md:text-sm"
                >
                  blog
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="font-semibold text-sm md:text-base mb-2">Contact</h3>
            {/* Contact information can be added here later */}
          </div>
        </div>
      </div>
    </footer>
  );
}
