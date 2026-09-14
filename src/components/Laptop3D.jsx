import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import DigitalRain from './DigitalRain.jsx'

const MIN_SPIN_SCROLL_DISTANCE = 200
// Rest/reduced-motion pose: open-faced but angled slightly left rather than
// flat-on, so its 3D depth reads immediately and the full turn between here
// and the About-centered pose is visible as the user scrolls.
const START_ANGLE = 24

export default function Laptop3D({ targetRef }) {
  const shouldReduceMotion = useReducedMotion()
  const { scrollY } = useScroll()

  // The scrollY at which the About section is centered in the viewport -
  // rotation is scaled so a full -360 turn lands exactly there, keeping the
  // screen/keyboard prominently facing forward both at rest (scrollY 0) and
  // when the section is centered, regardless of the layout above it.
  const [centerScrollY, setCenterScrollY] = useState(MIN_SPIN_SCROLL_DISTANCE)

  useEffect(() => {
    function measure() {
      const el = targetRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const elementTop = rect.top + window.scrollY
      const target = elementTop + rect.height / 2 - window.innerHeight / 2
      setCenterScrollY(Math.max(MIN_SPIN_SCROLL_DISTANCE, target))
    }
    measure()
    window.addEventListener('resize', measure)

    // Re-measure once fonts finish loading and whenever the section's own
    // size changes (e.g. a webfont swap reflowing Hero/About) - a single
    // on-mount measurement goes stale if layout shifts afterward.
    document.fonts?.ready?.then(measure)
    const resizeObserver = new ResizeObserver(measure)
    if (targetRef.current) resizeObserver.observe(targetRef.current)

    return () => {
      window.removeEventListener('resize', measure)
      resizeObserver.disconnect()
    }
  }, [targetRef])

  // Function form so the mapping re-reads the latest centerScrollY on every
  // scroll update - the array-range overload captures its input range once
  // and won't pick up centerScrollY after the measurement effect updates it.
  const scrollRotate = useTransform(scrollY, (latest) => {
    const progress = Math.min(1, Math.max(0, latest / centerScrollY))
    return START_ANGLE + progress * -360
  })
  const rotateY = shouldReduceMotion ? START_ANGLE : scrollRotate

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
