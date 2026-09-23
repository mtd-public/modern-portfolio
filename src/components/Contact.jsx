import { motion } from 'framer-motion'
import { profile } from '../data.js'
import { fadeUp, viewportOnce } from '../motion.js'
import ToyCanvas from './ToyCanvas.jsx'

const loadContactScene = () => import('../three/scenes/contact.js')
const contactPoster = `${import.meta.env.BASE_URL}renders/envelope.png`

export default function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="container">
        <div className="contact__card">
          <motion.div
            className="contact__texture"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="contact__texture-drift" />
            <ToyCanvas className="contact__scene" load={loadContactScene} poster={contactPoster} />
          </motion.div>
          <motion.div
            className="contact__panel"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            <p className="section__eyebrow">04 — Say hello</p>
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
        </div>
      </div>
    </section>
  )
}
