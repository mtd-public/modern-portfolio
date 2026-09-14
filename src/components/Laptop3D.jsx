import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

export default function Laptop3D({ targetRef }) {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start 0.85', 'end 0.35'],
  })
  const scrollRotate = useTransform(scrollYProgress, [0, 1], [0, 360])
  const rotateY = shouldReduceMotion ? 22 : scrollRotate

  return (
    <div className="laptop3d-scene">
      <motion.div className="laptop3d" style={{ rotateY }}>
        <div className="laptop3d__screen">
          <div className="laptop3d__display">
            <div className="laptop3d__bar" />
            <div className="laptop3d__line laptop3d__line--wide" />
            <div className="laptop3d__line laptop3d__line--narrow" />
          </div>
        </div>
        <div className="laptop3d__hinge" />
        <div className="laptop3d__base">
          <div className="laptop3d__trackpad" />
        </div>
      </motion.div>
    </div>
  )
}
