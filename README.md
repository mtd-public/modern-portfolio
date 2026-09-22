# modern-portfolio
## 3D graphics

The hero, About laptop and Contact card are live three.js scenes built from
custom low-poly models, in the same toy style as
[gig-ambulance](https://github.com/mtd-public/gig-ambulance),
[space-lion](https://github.com/mtd-public/space-lion) and
[splashy-fish](https://github.com/mtd-public/splashy-fish): chunky bevelled
shapes, thin navy ink outlines and soft drop shadows, in this site's
cream / navy / gold palette.

- `tools/blender/` builds every model procedurally with Blender's Python API:
  `kit.py` is the modelling kit and palette, `assets.py` defines the models.
  It writes GLBs to `public/models/` and ink-outlined PNG renders (the
  Experience icons and no-WebGL posters) to `public/renders/`.

  ```
  pip install bpy==5.0.1 pillow   # Python 3.11
  python3 tools/blender/build.py            # everything
  python3 tools/blender/build.py --only icon_
  ```

- `src/three/toy.js` is the shared renderer: GLB loading, screen-space ink
  outlines, lights and soft shadows. Each scene lives in `src/three/scenes/`,
  and `src/components/ToyCanvas.jsx` hosts it. three.js is only fetched when a
  scene nears the viewport, the render loop pauses off-screen, and
  `prefers-reduced-motion` gets a single still frame.
