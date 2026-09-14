import { profile } from '../data.js'

function HeroGraphic() {
  return (
    <svg
      className="hero__graphic"
      viewBox="0 0 420 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Abstract illustration of a UI design canvas"
    >
      <circle cx="378" cy="52" r="7" fill="#c99a3d" />
      <circle cx="30" cy="330" r="5" fill="#c99a3d" />
      <circle cx="392" cy="300" r="4" fill="#191333" opacity="0.4" />
      <rect x="28" y="34" width="340" height="300" rx="22" fill="#ffffff" stroke="#ece7db" strokeWidth="2" />
      <circle cx="54" cy="60" r="5" fill="#e6cfa0" />
      <circle cx="72" cy="60" r="5" fill="#e6cfa0" />
      <circle cx="90" cy="60" r="5" fill="#c99a3d" />
      <rect x="54" y="84" width="280" height="14" rx="7" fill="#c99a3d" />
      <rect x="54" y="112" width="280" height="86" rx="14" fill="#f3efe3" />
      <rect x="54" y="212" width="130" height="60" rx="12" fill="#191333" />
      <rect x="72" y="230" width="40" height="8" rx="4" fill="#c99a3d" />
      <rect x="72" y="246" width="70" height="8" rx="4" fill="#524d68" />
      <rect x="196" y="212" width="138" height="60" rx="12" fill="#ffffff" stroke="#ece7db" strokeWidth="2" />
      <rect x="214" y="230" width="102" height="8" rx="4" fill="#ece7db" />
      <rect x="214" y="246" width="70" height="8" rx="4" fill="#ece7db" />
      <rect x="54" y="290" width="200" height="10" rx="5" fill="#ece7db" />
      <rect x="238" y="256" width="132" height="112" rx="18" fill="#191333" />
      <path d="M270 312l16 16 32-36" stroke="#5bd68a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow">{profile.title}</p>
          <h1 className="hero__name">Building interfaces people trust.</h1>
          <p className="hero__location">{profile.location}</p>
          <p className="hero__about-snippet">
            I collaborate with designers, product managers, and stakeholders to build functional
            prototypes that bridge design exploration and engineering reality.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#contact">
              Get in touch
            </a>
            <a className="btn btn--ghost" href="#experience">
              View experience
            </a>
          </div>
        </div>
        <div className="hero__graphic-wrap" aria-hidden="true">
          <HeroGraphic />
        </div>
      </div>
    </section>
  )
}
