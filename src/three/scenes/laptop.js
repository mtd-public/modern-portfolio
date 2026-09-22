// About: the Blender laptop, spun by the page scroll (see Laptop3D.jsx).
import { THREE, createStage, inkify, loadModel } from '../toy.js'

export async function mount(canvas) {
  const stage = createStage(canvas, {
    fov: 28,
    camera: [0, 3.2, 9.8],
    target: [0, 0.85, 0],
    floorY: -0.35,
    shadowOpacity: 0.16,
    lightDir: [-3, 10, 5],
    minHalfWidth: 2.3,
  })

  const laptop = inkify(await loadModel('laptop'), stage.outline)
  const spin = new THREE.Group()
  spin.add(laptop)
  stage.scene.add(spin)

  function update(t, dt, params) {
    const rotate = params?.rotateY
    const degrees = typeof rotate === 'number' ? rotate : (rotate?.get() ?? 0)
    spin.rotation.y = THREE.MathUtils.degToRad(degrees)
    spin.position.y = Math.sin(t * 1.2) * 0.06
    spin.rotation.z = Math.sin(t * 0.9) * 0.015
    stage.render()
  }

  return { update, resize: stage.resize, dispose: stage.dispose }
}
