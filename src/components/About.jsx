import { motion } from 'framer-motion'
import { profile } from '../data.js'
import { fadeUp, viewportOnce } from '../motion.js'

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <motion.h2
          className="section__heading"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          About Me
        </motion.h2>
        <motion.div
          className="about__content"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          transition={{ delay: 0.1 }}
        >
          {profile.about.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
