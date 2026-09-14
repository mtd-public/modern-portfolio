import { profile } from '../data.js'

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <h2 className="section__heading">About Me</h2>
        <div className="about__content">
          {profile.about.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
