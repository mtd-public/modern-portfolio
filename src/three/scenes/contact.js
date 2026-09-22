// Contact: the envelope's flap swings open, the letter rises out and folds
// into a paper plane, which loops the card and dives back home before the
// flap closes again. A chat bubble types, the map pin and orbs drift.
import {
  THREE,
  createStage,
  damp,
  easeInOut,
  easeOut,
  easeOutBack,
  inkify,
  loadModel,
  seg,
} from '../toy.js'

const CYCLE = 9
const FLAP_OPEN = -0.7 * Math.PI
const TRAIL_DOTS = 22

// Flight path of the paper plane (starts where the letter folds, ends in the envelope).
const FLIGHT = new THREE.CatmullRomCurve3(
  [
    [0, 3.05, 0.35],
    [1.4, 3.7, 0.9],
    [2.7, 2.9, 1.3],
    [2.7, 1.3, 1.8],
    [1.2, 0.45, 2.1],
    [-1.4, 0.75, 2.0],
    [-2.7, 1.9, 1.2],
    [-2.2, 3.5, 0.2],
    [-0.9, 3.9, 0.3],
    [0, 2.6, 0.35],
    [0, 1.6, 0.1],
  ].map((p) => new THREE.Vector3(...p)),
  false,
  'catmullrom',
  0.4
)

export async function mount(canvas) {
  const stage = createStage(canvas, {
    fov: 32,
    camera: [0, 2.6, 13],
    target: [0, 1.55, 0],
    floorY: -0.2,
    shadowColor: 0x3a2e14,
    shadowOpacity: 0.28,
    lightDir: [-4, 10, 6],
    minHalfWidth: 4.1,
  })
  const { scene, outline } = stage

  const [envelope, plane, bubble, pin, ring, orbNavy] = await Promise.all(
    ['envelope', 'paper_plane', 'bubble', 'pin', 'ring', 'orb_navy'].map(loadModel)
  )
  ;[envelope, plane, bubble, pin, ring, orbNavy].forEach((o) => inkify(o, outline))

  const rig = new THREE.Group()
  scene.add(rig)

  envelope.rotation.y = -0.18
  rig.add(envelope)
  const flap = envelope.getObjectByName('flap')
  const letter = envelope.getObjectByName('letter')
  const letterHome = letter.position.clone()

  plane.scale.setScalar(0)
  rig.add(plane)

  bubble.position.set(2.75, 3.35, -0.6)
  bubble.rotation.set(0.05, -0.35, 0.05)
  bubble.scale.setScalar(0.95)
  rig.add(bubble)
  const dots = [0, 1, 2].map((i) => bubble.getObjectByName(`dot${i}`))
  const dotBase = dots.map((d) => d.position.y)

  pin.position.set(-2.9, 0.05, 1.0)
  pin.rotation.y = 0.3
  pin.scale.setScalar(0.85)
  rig.add(pin)

  ring.position.set(-3.1, 3.4, -1.6)
  ring.rotation.set(0.2, 0.5, 0)
  ring.scale.setScalar(0.9)
  rig.add(ring)

  orbNavy.position.set(3.4, 0.6, -0.9)
  orbNavy.scale.setScalar(0.8)
  rig.add(orbNavy)

  // Dotted flight trail
  const trailMaterial = new THREE.MeshBasicMaterial({ color: 0xfbfaf7, transparent: true })
  const trailGeometry = new THREE.SphereGeometry(0.045, 10, 8)
  const trail = new THREE.InstancedMesh(trailGeometry, trailMaterial, TRAIL_DOTS)
  trail.frustumCulled = false
  rig.add(trail)
  const dummy = new THREE.Object3D()

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect()
    pointer.tx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2))
    pointer.ty = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2))
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true })

  const pos = new THREE.Vector3()
  const ahead = new THREE.Vector3()
  const tangent = new THREE.Vector3()
  const prevTangent = new THREE.Vector3(1, 0, 0)
  let bank = 0

  function update(t, dt) {
    pointer.x = damp(pointer.x, pointer.tx, 2.5, dt)
    pointer.y = damp(pointer.y, pointer.ty, 2.5, dt)
    rig.rotation.y = pointer.x * 0.14
    rig.rotation.x = pointer.y * 0.05

    rig.updateMatrixWorld(true)
    const c = t % CYCLE

    // envelope breathes; flap opens, closes
    envelope.position.y = 0.12 + Math.sin(t * 1.3) * 0.05
    const open = easeOutBack(seg(c, 0.2, 1.0)) * (1 - easeInOut(seg(c, 7.2, 7.9)))
    flap.rotation.x = FLAP_OPEN * open

    // letter rises out, then folds away into the plane
    const rise = easeInOut(seg(c, 0.8, 1.9))
    const fold = seg(c, 2.0, 2.45)
    letter.position.set(letterHome.x, letterHome.y + rise * 2.05, letterHome.z + rise * 0.1)
    letter.rotation.z = fold * 0.6
    letter.scale.set(1 - easeOut(fold) * 0.92, 1 - easeOut(fold) * 0.6, 1)
    letter.visible = fold < 1 || c > 7.0
    if (c > 7.0) {
      letter.position.copy(letterHome)
      letter.scale.setScalar(1)
      letter.rotation.z = 0
    }

    // plane flight
    const fly = seg(c, 2.25, 7.1)
    const grow = easeOutBack(seg(c, 2.25, 2.7))
    const shrink = 1 - easeInOut(seg(c, 6.7, 7.1))
    plane.visible = fly > 0 && fly < 1
    if (plane.visible) {
      const u = easeInOut(fly) * 0.94 + fly * 0.06
      FLIGHT.getPointAt(u, pos)
      FLIGHT.getTangentAt(u, tangent)
      plane.position.copy(pos)
      ahead.copy(pos).add(tangent)
      plane.lookAt(rig.localToWorld(ahead))
      // bank into turns
      const turn = prevTangent.x * tangent.z - prevTangent.z * tangent.x
      bank = damp(bank, THREE.MathUtils.clamp(turn * 30, -0.9, 0.9), 6, dt)
      prevTangent.copy(tangent)
      plane.rotateZ(bank)
      plane.scale.setScalar(0.62 * grow * shrink)
    }

    // trail of fading dots behind the plane
    for (let i = 0; i < TRAIL_DOTS; i++) {
      const lag = fly - (i + 1) * 0.012
      const alive = plane.visible && lag > 0.02
      if (alive) {
        FLIGHT.getPointAt(easeInOut(lag) * 0.94 + lag * 0.06, pos)
        dummy.position.copy(pos)
        dummy.scale.setScalar((1 - i / TRAIL_DOTS) * shrink)
      } else {
        dummy.scale.setScalar(0)
      }
      dummy.updateMatrix()
      trail.setMatrixAt(i, dummy.matrix)
    }
    trail.instanceMatrix.needsUpdate = true

    // typing dots
    dots.forEach((d, i) => {
      d.position.y = dotBase[i] + Math.max(0, Math.sin(t * 5 - i * 0.7)) * 0.1
    })
    bubble.position.y = 3.35 + Math.sin(t * 1.1 + 1) * 0.08

    pin.position.y = 0.05 + Math.abs(Math.sin(t * 1.6)) * 0.14
    ring.rotation.y = 0.5 + t * 0.35
    orbNavy.position.y = 0.6 + Math.sin(t * 0.9 + 2) * 0.12
    orbNavy.rotation.y = -t * 0.3

    stage.render()
  }

  return {
    update,
    resize: stage.resize,
    dispose() {
      window.removeEventListener('pointermove', onPointerMove)
      trailGeometry.dispose()
      stage.dispose()
    },
  }
}
