import PatronusButton from '../components/common/PatronusButton'
import '../styles/animations.css'
import './LandingPage.css'

export default function LandingPage({ onCreateCircle, onJoinCircle }) {
  return (
    <div className="landing-page" id="patronus-landing">
      {/* Background Celestial Stars */}
      <div className="landing-page__stars-overlay" aria-hidden="true"></div>

      {/* Top Brand Bar */}
      <header className="landing-nav">
        <div className="landing-nav__brand">
          <svg
            className="landing-nav__emblem"
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="20" cy="20" r="18" stroke="#F2BD53" strokeWidth="1.5" strokeOpacity="0.4" />
            <path
              d="M20 5 L22 17 L34 20 L22 23 L20 35 L18 23 L6 20 L18 17 Z"
              fill="url(#nav-star-gold)"
            />
            <defs>
              <linearGradient id="nav-star-gold" x1="6" y1="5" x2="34" y2="35">
                <stop stopColor="#FED777" />
                <stop offset="1" stopColor="#B88528" />
              </linearGradient>
            </defs>
          </svg>
          <span>PATRONUS</span>
        </div>

        <PatronusButton
          variant="secondary"
          size="sm"
          id="btn-nav-join"
          onClick={onJoinCircle}
        >
          Enter Code
        </PatronusButton>
      </header>

      {/* Main Hero Section */}
      <main className="landing-hero animate-fade-up">
        <div className="landing-hero__badge">
          <span className="landing-hero__badge-sparkle" aria-hidden="true">✦</span>
          <span>A Magical Messaging Sanctuary</span>
          <span className="landing-hero__badge-sparkle" aria-hidden="true">✦</span>
        </div>

        <div className="landing-hero__insignia-wrapper animate-float">
          <div className="landing-hero__glow-halo"></div>
          <svg
            className="landing-hero__insignia"
            viewBox="0 0 120 120"
            fill="none"
            aria-hidden="true"
          >
            {/* Outer enchanted ring */}
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="#F2BD53"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              strokeOpacity="0.5"
            />
            <circle
              cx="60"
              cy="60"
              r="46"
              stroke="#FED777"
              strokeWidth="1"
              strokeOpacity="0.25"
            />

            {/* Inner radiant halo */}
            <circle cx="60" cy="60" r="32" fill="url(#patronus-hero-glow)" opacity="0.4" />

            {/* Magical 8-point silver & gold Patronus star */}
            <path
              d="M60 16 L64.5 50 L98 60 L64.5 70 L60 104 L55.5 70 L22 60 L55.5 50 Z"
              fill="url(#patronus-hero-gold)"
            />
            {/* Minor diagonal sparks */}
            <path
              d="M60 36 L62 55 L81 60 L62 65 L60 84 L58 65 L39 60 L58 55 Z"
              fill="#E8F4FC"
              opacity="0.85"
            />
            <circle cx="60" cy="60" r="4.5" fill="#FFFFFF" />

            <defs>
              <radialGradient id="patronus-hero-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF5C2" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#E5A93C" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0B0E17" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="patronus-hero-gold" x1="22" y1="16" x2="98" y2="104">
                <stop stopColor="#FFF2B8" />
                <stop offset="0.5" stopColor="#F2BD53" />
                <stop offset="1" stopColor="#A8751B" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="landing-hero__title">PATRONUS</h1>
        <p className="landing-hero__tagline">
          Send a little magic to someone you care about.
        </p>

        <p className="landing-hero__description">
          A tranquil, enchanted sanctuary designed for couples, close friends, and small
          chosen circles. Communicate not through noisy chatter, but by casting messages
          steeped in warmth.
        </p>

        <div className="landing-hero__actions">
          <PatronusButton
            variant="primary"
            size="lg"
            id="btn-hero-create"
            fullWidth
            icon={<span aria-hidden="true">✨</span>}
            onClick={onCreateCircle}
          >
            Create a Circle
          </PatronusButton>

          <PatronusButton
            variant="secondary"
            size="lg"
            id="btn-hero-join"
            fullWidth
            icon={<span aria-hidden="true">🗝️</span>}
            onClick={onJoinCircle}
          >
            Join with Code
          </PatronusButton>
        </div>
      </main>

      {/* Feature Teasers */}
      <section className="landing-features" aria-label="Magical Features">
        <article className="feature-card">
          <div className="feature-card__icon" aria-hidden="true">🔮</div>
          <h2 className="feature-card__title">Private Circles</h2>
          <p className="feature-card__text">
            Gather your partner or tight-knit friends into quiet, invite-only spaces
            protected by your unique secret Circle Code.
          </p>
        </article>

        <article className="feature-card">
          <div className="feature-card__icon" aria-hidden="true">✨</div>
          <h2 className="feature-card__title">Patronus Messages</h2>
          <p className="feature-card__text">
            Every message you send is a Patronus cast across the void — intentional,
            affectionate, and crafted to brighten their day.
          </p>
        </article>

        <article className="feature-card">
          <div className="feature-card__icon" aria-hidden="true">🦉</div>
          <h2 className="feature-card__title">Patronus Alerts</h2>
          <p className="feature-card__text">
            Subtle ambient notifications let your recipients know a magical thought
            has arrived without loud, disruptive rings.
          </p>
        </article>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p className="landing-footer__quote">
          &ldquo;Happiness can be found, even in the darkest of times, if one only remembers to turn on the light.&rdquo;
        </p>
        <p>Patronus &bull; Crafted with magic for couples and dear companions</p>
      </footer>
    </div>
  )
}
