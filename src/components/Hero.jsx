import { profile } from '../data.js'

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero__inner">
        <p className="hero__eyebrow">Hello, I&apos;m</p>
        <h1 className="hero__name">{profile.name}</h1>
        <p className="hero__title">{profile.title}</p>
        <p className="hero__location">📍 {profile.location}</p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#contact">
            Get in touch
          </a>
          <a className="btn btn--ghost" href="#experience">
            View experience
          </a>
        </div>
      </div>
    </section>
  )
}
