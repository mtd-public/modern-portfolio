import { profile } from '../data.js'

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="contact__texture" aria-hidden="true" />
      <div className="contact__panel">
        <h2 className="section__heading">Contact.</h2>
        <p className="contact__blurb">
          Open to senior UI/UX and frontend roles, contract work, or a conversation about your product.
        </p>
        <div className="contact__actions">
          <a className="btn btn--primary" href={`mailto:${profile.email}`}>
            Send email
          </a>
          <a className="btn btn--ghost" href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
        <p className="contact__location">Based in {profile.location}</p>
      </div>
    </section>
  )
}
