import { motion } from 'framer-motion'
import { skills } from '../data.js'
import { fadeUp, staggerContainer, staggerItem, viewportOnce } from '../motion.js'

export default function Skills() {
  return (
    <section id="skills" className="section skills">
      <div className="container">
        <motion.p
          className="section__eyebrow"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          02 — Toolkit
        </motion.p>
        <motion.h2
          className="section__heading"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          Skills
        </motion.h2>
        <motion.ul
          className="skills__grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          {skills.map((skill) => (
            <motion.li key={skill} className="skills__item" variants={staggerItem}>
              {skill}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
