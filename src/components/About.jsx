import { useRef } from 'react'
import { motion } from 'framer-motion'
import { profile } from '../data.js'
import { fadeUp, viewportOnce } from '../motion.js'
import Laptop3D from './Laptop3D.jsx'

export default function About() {
  const sectionRef = useRef(null)

  return (
    <section id="about" className="section about" ref={sectionRef}>
      <div className="container about__inner">
        <div className="about__copy">
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
        <div className="about__graphic-wrap" aria-hidden="true">
          <Laptop3D targetRef={sectionRef} />
        </div>
      </div>
    </section>
  )
}
