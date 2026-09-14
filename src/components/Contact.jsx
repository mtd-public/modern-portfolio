import { profile } from '../data.js'

export default function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="container contact__inner">
        <h2 className="section__heading">Get In Touch</h2>
        <p className="contact__blurb">
          Interested in working together or have a question? I&apos;d love to hear from you.
        </p>
        <div className="contact__links">
          <a className="btn btn--primary" href="https://www.linkedin.com/in/michael-taddeucci-0ab10b14a/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
        <p className="contact__location">Based in {profile.location}</p>
      </div>
    </section>
  )
}
