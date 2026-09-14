import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import DigitalRain from './DigitalRain.jsx'

// Absolute scroll distance (not viewport-intersection-based) the laptop
// takes to complete its spin. Tying this to "target enters viewport"
// instead would depend on how tall the content above About renders, which
// can already be less than one viewport tall - meaning the section (and a
// nonzero rotation) would already be visible at rest. Absolute scrollY
// guarantees scrollY 0 -> rotateY 0, so the laptop always rests screen-first.
const SPIN_SCROLL_DISTANCE = 900

export default function Laptop3D() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const scrollRotate = useTransform(scrollY, [0, SPIN_SCROLL_DISTANCE], [0, -360])
  const rotateY = shouldReduceMotion ? 22 : scrollRotate

  return (
    <div className="laptop3d-scene">
      <DigitalRain />
      <motion.div className="laptop3d" style={{ rotateY }}>
        <div className="laptop3d__screen">
          <div className="laptop3d__screen-face laptop3d__screen-face--front">
            <div className="laptop3d__display">
              <div className="laptop3d__bar" />
              <div className="laptop3d__line laptop3d__line--wide" />
              <div className="laptop3d__line laptop3d__line--narrow" />
            </div>
          </div>
          <div className="laptop3d__screen-face laptop3d__screen-face--back" />
        </div>
        <div className="laptop3d__hinge" />
        <div className="laptop3d__base">
          <div className="laptop3d__base-face laptop3d__base-face--front">
            <div className="laptop3d__trackpad" />
          </div>
          <div className="laptop3d__base-face laptop3d__base-face--back" />
        </div>
      </motion.div>
    </div>
  )
}
