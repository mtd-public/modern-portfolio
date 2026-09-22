// Shared three.js "toy diorama" renderer for the Blender-built GLBs in
// public/models: soft key light + shadows, a warm room environment for the
// gold, and screen-space ink outlines (the inverted-hull trick used in
// splashy-fish / space-lion), so every scene reads as one art style.
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export { THREE }

export const INK = 0x191333
const MODEL_BASE = `${import.meta.env.BASE_URL}models/`

const loader = new GLTFLoader()
const cache = new Map()

/** Load a GLB once and hand back a fresh clone (materials stay shared). */
export function loadModel(name) {
  if (!cache.has(name)) {
    cache.set(
      name,
      loader.loadAsync(`${MODEL_BASE}${name}.glb`).then((gltf) => gltf.scene)
    )
  }
  return cache.get(name).then((scene) => scene.clone(true))
}

/* ------------------------------------------------------------------
   Ink outlines. Each mesh gets a back-faced hull pushed out along its
   smoothed normals in clip space, so the line is a constant pixel width
   whatever the distance. The hull uses a welded copy of the geometry so
   hard edges don't split the line open.
------------------------------------------------------------------ */
const hulls = new WeakMap()

function hullOf(geometry) {
  let hull = hulls.get(geometry)
  if (!hull) {
    const bare = new THREE.BufferGeometry()
    bare.setAttribute('position', geometry.getAttribute('position'))
    if (geometry.index) bare.setIndex(geometry.index)
    hull = mergeVertices(bare, 1e-3)
    hull.computeVertexNormals()
    hulls.set(geometry, hull)
  }
  return hull
}

export function createOutlineMaterial(color = INK, width = 1.6) {
  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      width: { value: width },
      resolution: { value: new THREE.Vector2(1, 1) },
      opacity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      uniform float width;
      uniform vec2 resolution;
      void main() {
        vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec3 viewNormal = normalize(normalMatrix * normal);
        vec2 dir = (projectionMatrix * vec4(viewNormal, 0.0)).xy;
        float len = length(dir);
        if (len > 1e-5) clip.xy += (dir / len) * width * clip.w * 2.0 / resolution;
        gl_Position = clip;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 color;
      uniform float opacity;
      void main() {
        gl_FragColor = vec4(color, opacity);
        #include <colorspace_fragment>
      }
    `,
    side: THREE.BackSide,
    transparent: true,
  })
}

/** Add ink hulls under every mesh of `root`; set up shadows. */
export function inkify(root, outline, { castShadow = true } = {}) {
  const meshes = []
  root.traverse((o) => {
    if (o.isMesh && !o.userData.isHull) meshes.push(o)
  })
  for (const mesh of meshes) {
    mesh.castShadow = castShadow
    mesh.receiveShadow = false
    const hull = new THREE.Mesh(hullOf(mesh.geometry), outline)
    hull.userData.isHull = true
    hull.raycast = () => {}
    mesh.add(hull)
  }
  return root
}

/** Give one instance its own copies of its materials (to animate colour). */
export function ownMaterials(root) {
  root.traverse((o) => {
    if (o.isMesh && !o.userData.isHull) {
      o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone()
    }
  })
  return root
}

export function findMaterial(root, name) {
  let found = null
  root.traverse((o) => {
    if (found || !o.isMesh || o.userData.isHull) return
    const mats = Array.isArray(o.material) ? o.material : [o.material]
    found = mats.find((m) => m.name === name) ?? null
  })
  return found
}

/* ------------------------------------------------------------------
   Stage: renderer + camera + light rig + optional shadow floor.
------------------------------------------------------------------ */
export function createStage(canvas, opts = {}) {
  const {
    fov = 30,
    camera: camPos = [0, 1.5, 12],
    target = [0, 0, 0],
    outlineWidth = 1.6,
    shadowColor = INK,
    shadowOpacity = 0.14,
    floorY = null,
    exposure = 1.0,
    lightDir = [-4, 8, 6],
    // Keep at least this half-width (world units, at the target) in frame on
    // narrow canvases by dollying the camera back.
    minHalfWidth = 0,
  } = opts

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = exposure
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.VSMShadowMap
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTexture
  scene.environmentIntensity = 0.7
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 200)
  const lookAt = new THREE.Vector3(...target)
  const baseOffset = new THREE.Vector3(...camPos).sub(lookAt)
  camera.position.copy(lookAt).add(baseOffset)
  camera.lookAt(lookAt)

  scene.add(new THREE.HemisphereLight(0xfff4de, 0x8c82a8, 1.15))
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.2)
  sun.position.set(...lightDir)
  sun.castShadow = true
  // Soft, blurry drop shadows onto the floor only (VSM), like the toy kits.
  sun.shadow.mapSize.set(512, 512)
  sun.shadow.radius = 14
  sun.shadow.blurSamples = 20
  sun.shadow.bias = -0.002
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 40 })
  scene.add(sun)
  scene.add(sun.target)
  const fill = new THREE.DirectionalLight(0xc9d4ff, 0.5)
  fill.position.set(6, 2, 4)
  scene.add(fill)

  if (floorY !== null) {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ color: shadowColor, opacity: shadowOpacity })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = floorY
    floor.receiveShadow = true
    scene.add(floor)
  }

  const outline = createOutlineMaterial(INK, outlineWidth)

  function resize(width, height) {
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(fov / 2))
    const needed = minHalfWidth / (tanHalf * camera.aspect)
    const scale = Math.max(1, needed / baseOffset.length())
    camera.position.copy(lookAt).addScaledVector(baseOffset, scale)
    camera.lookAt(lookAt)
    camera.updateProjectionMatrix()
    const dpr = renderer.getPixelRatio()
    outline.uniforms.resolution.value.set(width * dpr, height * dpr)
  }

  // Geometry and materials are shared with the GLB cache (other mounts reuse
  // them), so only this stage's own GPU resources and context are released.
  function dispose() {
    envTexture.dispose()
    outline.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }

  return {
    renderer,
    scene,
    camera,
    sun,
    outline,
    resize,
    render: () => renderer.render(scene, camera),
    dispose,
  }
}

/* ------------------------------------------------------------------
   Small animation helpers
------------------------------------------------------------------ */
export const clamp01 = (x) => Math.min(1, Math.max(0, x))
export const lerp = (a, b, t) => a + (b - a) * t
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t) => 1 - Math.pow(1 - t, 3)
export const easeOutBack = (t) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
/** 0..1 progress of `t` through the window [a, b]. */
export const seg = (t, a, b) => clamp01((t - a) / (b - a))
/** Frame-rate independent damping toward a target. */
export const damp = (current, target, lambda, dt) => lerp(current, target, 1 - Math.exp(-lambda * dt))
