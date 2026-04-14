import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-24 pt-16 pb-8 border-t border-black/[0.07] bg-cream">
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="font-serif text-2xl font-black text-accent no-underline inline-block mb-3">
              🍂 PoetVerse
            </Link>
            <p className="font-sans text-sm text-muted leading-relaxed">
              A sanctuary for poets and poetry lovers.<br />Where words find their wings.
            </p>
          </div>

          <div className="md:col-span-1">
            <h4 className="font-sans text-sm font-bold text-ink mb-5">Explore</h4>
            <ul className="space-y-3">
              {[
                { to: '/browse', label: 'Browse Poems' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="font-sans text-sm text-muted hover:text-ink no-underline transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-black/[0.07] text-center font-sans text-xs text-muted">
          "Built for poets, by lovers of verse." — PoetVerse © 2026
        </div>
      </div>
    </footer>
  );
}

export default Footer;
