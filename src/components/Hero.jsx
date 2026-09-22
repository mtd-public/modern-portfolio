import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { profile } from '../data.js'
import ToyCanvas from './ToyCanvas.jsx'

const loadHeroScene = () => import('../three/scenes/hero.js')
const heroPoster = `${import.meta.env.BASE_URL}renders/hero_board.png`

const IDLE_DELAY = 200

export default function Hero() {
  // Scroll-linked parallax and the idle float each live on their own inner
  // element so they never fight each other's transform, or the entrance
  // animation's transform/opacity on mount.
  const { scrollY } = useScroll()
  const graphicY = useTransform(scrollY, [0, 600], [0, -70])
  const graphicRotate = useTransform(scrollY, [0, 600], [0, -4])

  const shouldReduceMotion = useReducedMotion()
  const [isIdle, setIsIdle] = useState(true)
  const idleTimeout = useRef(null)

  useMotionValueEvent(scrollY, 'change', () => {
    setIsIdle(false)
    clearTimeout(idleTimeout.current)
    idleTimeout.current = setTimeout(() => setIsIdle(true), IDLE_DELAY)
  })

  useEffect(() => () => clearTimeout(idleTimeout.current), [])

  return (
    <section id="top" className="hero">
      <div className="container hero__inner">
        <motion.div
          className="hero__copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="hero__status">
            <span className="hero__status-dot" aria-hidden="true" />
            Open to senior UI/UX &amp; frontend roles
          </p>
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
        </motion.div>
        <motion.div
          className="hero__graphic-wrap"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div style={{ y: graphicY, rotate: graphicRotate }}>
            <motion.div
              animate={isIdle && !shouldReduceMotion ? { y: [0, -10, 0] } : { y: 0 }}
              transition={
                isIdle && !shouldReduceMotion
                  ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.4, ease: 'easeOut' }
              }
            >
              <ToyCanvas className="hero__graphic" load={loadHeroScene} poster={heroPoster} />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
