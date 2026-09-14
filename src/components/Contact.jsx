import { motion } from 'framer-motion'
import { profile } from '../data.js'
import { fadeUp, viewportOnce } from '../motion.js'

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <motion.div
        className="contact__texture"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="contact__texture-drift" />
        <motion.div
          className="contact__circle contact__circle--gold"
          initial={{ opacity: 0, scale: 0.35, x: -60, y: -40 }}
          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="contact__circle contact__circle--black"
          initial={{ opacity: 0, scale: 0.35, x: 70, y: 50 }}
          whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>
      <motion.div
        className="contact__panel"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
      >
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
      </motion.div>
    </section>
  )
}
