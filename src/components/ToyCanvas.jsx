import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

// Hosts one lazily-loaded three.js scene (src/three/scenes/*). The scene
// module - and three.js with it - is only fetched once the canvas is near
// the viewport, the render loop only runs while it's on screen, and a
// Blender-rendered poster stands in if WebGL isn't available.
export default function ToyCanvas({ load, poster, className = '', params }) {
  const wrapRef = useRef(null)
  const paramsRef = useRef(params)
  const shouldReduceMotion = useReducedMotion()
  const [status, setStatus] = useState('idle')

  paramsRef.current = params

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return undefined
    if (!supportsWebGL()) {
      setStatus('fallback')
      return undefined
    }

    // A fresh canvas per mount, so every scene owns (and releases) its own
    // WebGL context - including across StrictMode's double effects.
    const canvas = document.createElement('canvas')
    canvas.className = 'toy-canvas__canvas'
    wrap.appendChild(canvas)

    let disposed = false
    let scene = null
    let frame = 0
    let visible = false
    let last = 0
    let elapsed = 0

    function tick(now) {
      frame = 0
      if (!scene || disposed) return
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0)
      last = now
      elapsed += dt
      scene.update(elapsed, dt, paramsRef.current)
      if (visible && !shouldReduceMotion && !document.hidden) frame = requestAnimationFrame(tick)
    }

    function start() {
      if (!frame && scene) {
        last = 0
        frame = requestAnimationFrame(tick)
      }
    }

    function stop() {
      cancelAnimationFrame(frame)
      frame = 0
    }

    function measure() {
      const rect = wrap.getBoundingClientRect()
      scene?.resize(rect.width, rect.height)
      if (scene && shouldReduceMotion) scene.update(elapsed, 0, paramsRef.current)
    }

    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) start()
        else stop()
      },
      { rootMargin: '120px' }
    )

    const resizeObserver = new ResizeObserver(measure)

    // Start fetching once the canvas is within a screen of the viewport.
    const prefetch = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        prefetch.disconnect()
        setStatus('loading')
        load()
          .then((mod) => mod.mount(canvas, { reducedMotion: shouldReduceMotion }))
          .then((mounted) => {
            if (disposed) {
              mounted.dispose()
              return
            }
            scene = mounted
            measure()
            scene.update(0, 0, paramsRef.current)
            setStatus('ready')
            visibility.observe(wrap)
            resizeObserver.observe(wrap)
          })
          .catch((error) => {
            console.error(error)
            if (!disposed) {
              canvas.remove()
              setStatus('fallback')
            }
          })
      },
      { rootMargin: '100% 0px' }
    )
    prefetch.observe(wrap)

    function onVisibilityChange() {
      if (document.hidden) stop()
      else if (visible) start()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      disposed = true
      stop()
      prefetch.disconnect()
      visibility.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      scene?.dispose()
      canvas.remove()
    }
  }, [load, shouldReduceMotion])

  return (
    <div ref={wrapRef} className={`toy-canvas toy-canvas--${status} ${className}`}>
      {status === 'fallback' && poster && <img className="toy-canvas__poster" src={poster} alt="" />}
    </div>
  )
}
