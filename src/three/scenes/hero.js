// Hero: a floating design canvas surrounded by UI pieces. A pointer glides
// over, flips the toggle on, then clicks the "shipped" check tile, which pops.
import {
  THREE,
  createStage,
  damp,
  easeInOut,
  easeOutBack,
  findMaterial,
  inkify,
  loadModel,
  ownMaterials,
  seg,
} from '../toy.js'

const CYCLE = 7.5
const TRACK_OFF = new THREE.Color('#d9d2c3')
const TRACK_ON = new THREE.Color('#c99a3d')

const LAYOUT = {
  board: { pos: [0, 0.15, 0], rot: [0.04, -0.3, 0], scale: 1 },
  toggle: { pos: [-2.25, 1.75, 1.25], rot: [0.1, 0.25, -0.08], scale: 0.82 },
  check: { pos: [2.15, -1.3, 1.35], rot: [0.05, -0.35, 0.06], scale: 0.9 },
  code: { pos: [2.2, 1.95, -0.5], rot: [0.1, -0.45, 0.12], scale: 0.6 },
  swatches: { pos: [-2.45, -2.05, 0.9], rot: [0, 0.35, -0.08], scale: 0.78 },
  pen: { pos: [2.6, -0.1, 0.4], rot: [0.2, -0.3, -0.42], scale: 0.66 },
  orb: { pos: [-2.9, 0.35, -0.9], rot: [0, 0, 0], scale: 0.42 },
}

function place(object, { pos, rot, scale }) {
  object.position.set(...pos)
  object.rotation.set(...rot)
  object.scale.setScalar(scale)
  object.userData.base = { pos: new THREE.Vector3(...pos), rot: new THREE.Euler(...rot), scale }
  return object
}

export async function mount(canvas) {
  const stage = createStage(canvas, {
    fov: 30,
    camera: [0, 0.5, 14.2],
    target: [0, -0.05, 0],
    floorY: -2.8,
    shadowOpacity: 0.1,
    lightDir: [-3, 9, 7],
    minHalfWidth: 3.5,
  })
  const { scene, outline } = stage

  const names = ['hero_board', 'ui_toggle', 'ui_check', 'ui_code', 'ui_swatches', 'ui_pen', 'orb', 'ui_cursor', 'spark']
  const [board, toggle, check, code, swatches, pen, orb, cursor, sparkModel] = await Promise.all(
    names.map(loadModel)
  )

  const rig = new THREE.Group()
  scene.add(rig)

  const pieces = { board, toggle, check, code, swatches, pen, orb }
  Object.entries(pieces).forEach(([key, object], i) => {
    inkify(object, outline)
    place(object, LAYOUT[key])
    object.userData.phase = i * 1.3
    rig.add(object)
  })

  ownMaterials(toggle)
  const track = findMaterial(toggle, 'gold')
  const knob = toggle.getObjectByName('knob')
  const knobX = knob.position.x

  inkify(cursor, outline)
  cursor.scale.setScalar(0.7)
  rig.add(cursor)

  const sparks = [0, 1, 2].map((i) => {
    const s = inkify(sparkModel.clone(true), outline, { castShadow: false })
    s.scale.setScalar(0)
    s.userData.angle = (i / 3) * Math.PI * 2 + 0.4
    rig.add(s)
    return s
  })

  const cursorRest = new THREE.Vector3(0.7, -0.9, 2.4)
  const toggleTarget = new THREE.Vector3()
  const checkTarget = new THREE.Vector3()
  const tmp = new THREE.Vector3()

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect()
    pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true })

  function update(t, dt) {
    // gentle parallax toward the pointer
    pointer.x = damp(pointer.x, Math.max(-1, Math.min(1, pointer.tx)), 3, dt)
    pointer.y = damp(pointer.y, Math.max(-1, Math.min(1, pointer.ty)), 3, dt)
    rig.rotation.y = pointer.x * 0.12
    rig.rotation.x = pointer.y * 0.06

    // idle bob for every floating piece
    for (const object of Object.values(pieces)) {
      const { pos, rot } = object.userData.base
      const p = object.userData.phase
      object.position.y = pos.y + Math.sin(t * 1.1 + p) * 0.09
      object.rotation.z = rot.z + Math.sin(t * 0.8 + p) * 0.025
      object.rotation.y = rot.y + Math.sin(t * 0.6 + p) * 0.04
    }
    orb.rotation.y = t * 0.4

    // cursor choreography
    const cycle = Math.floor(t / CYCLE)
    const c = t % CYCLE
    const turningOn = cycle % 2 === 0
    rig.updateMatrixWorld(true)
    knob.getWorldPosition(toggleTarget)
    rig.worldToLocal(toggleTarget)
    toggleTarget.add(tmp.set(0.12, -0.05, 0.35))
    check.getWorldPosition(checkTarget)
    rig.worldToLocal(checkTarget)
    checkTarget.add(tmp.set(0.1, 0.05, 0.5))

    const toToggle = easeInOut(seg(c, 0.3, 1.8))
    const toCheck = easeInOut(seg(c, 2.5, 4.0))
    const home = easeInOut(seg(c, 5.0, 6.6))
    const pos = cursor.position
    pos.copy(cursorRest).lerp(toggleTarget, toToggle)
    if (toCheck > 0) pos.lerpVectors(toggleTarget, checkTarget, toCheck)
    if (home > 0) pos.lerpVectors(checkTarget, cursorRest, home)
    // a slight arc on every leg
    const arc = Math.sin(Math.PI * toToggle) * (1 - toCheck) + Math.sin(Math.PI * toCheck) + Math.sin(Math.PI * home)
    pos.y += arc * 0.35

    const pressToggle = Math.sin(Math.PI * seg(c, 1.85, 2.15))
    const pressCheck = Math.sin(Math.PI * seg(c, 4.05, 4.35))
    const press = Math.max(pressToggle, pressCheck)
    cursor.scale.setScalar(0.7 * (1 - press * 0.14))
    cursor.rotation.set(-0.15 - press * 0.25, -0.3, 0.1)

    // toggle state: flips on the click, alternating on/off each cycle
    const flip = easeInOut(seg(c, 1.95, 2.35))
    const on = turningOn ? flip : 1 - flip
    knob.position.x = knobX + on * -2 * knobX
    track.color.lerpColors(TRACK_OFF, TRACK_ON, on)

    // check tile pops when clicked, with a little burst of sparkles
    const pop = seg(c, 4.1, 4.9)
    const popScale = pop > 0 && pop < 1 ? 1 + Math.sin(Math.PI * easeOutBack(pop)) * 0.12 : 1
    check.scale.setScalar(LAYOUT.check.scale * popScale)
    sparks.forEach((s, i) => {
      const k = seg(c, 4.15 + i * 0.05, 5.1 + i * 0.05)
      const r = 0.9 + easeInOut(k) * 0.8
      s.position.set(
        check.position.x + Math.cos(s.userData.angle) * r,
        check.position.y + Math.sin(s.userData.angle) * r,
        check.position.z + 0.4
      )
      s.scale.setScalar(k > 0 && k < 1 ? Math.sin(Math.PI * k) * 0.45 : 0)
      s.rotation.z = k * 2
    })

    stage.render()
  }

  return {
    update,
    resize: stage.resize,
    dispose() {
      window.removeEventListener('pointermove', onPointerMove)
      stage.dispose()
    },
  }
}
