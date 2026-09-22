"""Build every portfolio asset -> GLB (+ preview PNGs, + icon PNGs).

    pip install bpy==5.0.1 pillow
    python3 tools/blender/build.py                  # everything
    python3 tools/blender/build.py --only icon_     # names starting with a prefix
    python3 tools/blender/build.py --no-render      # GLBs only (fast)

GLBs land in public/models/, experience icons in public/renders/ (transparent,
ink-outlined, used directly by the job cards) and contact-sheet previews in
tools/blender/previews/.
"""

import argparse
import math
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import bpy  # noqa: E402
import addon_utils  # noqa: E402
from mathutils import Euler, Vector  # noqa: E402

import assets  # noqa: E402
from kit import hex_rgba, reset_scene  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MODELS = os.path.join(ROOT, "public", "models")
RENDERS = os.path.join(ROOT, "public", "renders")
PREVIEWS = os.path.join(HERE, "previews")

# Three-quarter front view, a little from above (camera looks along +Y).
VIEW = (math.radians(74), 0.0, math.radians(-24))
INK = "#191333"
# Previews also shipped to public/renders as no-WebGL fallbacks for the scenes.
POSTERS = {"hero_board", "laptop", "envelope"}


def setup_render(samples, res):
    addon_utils.enable("cycles", default_set=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 4
    sc.render.film_transparent = True
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.render.resolution_x = sc.render.resolution_y = res
    sc.render.resolution_percentage = 100

    world = bpy.data.worlds.new("World")
    sc.world = world
    try:
        world.use_nodes = True
    except Exception:
        pass
    bg = world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = hex_rgba("#FFF6E6")
    bg.inputs["Strength"].default_value = 0.85
    sun_data = bpy.data.lights.new("Sun", "SUN")
    sun_data.energy = 3.0
    sun_data.angle = math.radians(14)
    sun_data.color = (1.0, 0.96, 0.9)
    sun = bpy.data.objects.new("Sun", sun_data)
    sun.rotation_euler = (math.radians(38), math.radians(-18), math.radians(-28))
    sc.collection.objects.link(sun)

    # thin ink outlines (Freestyle), the house style from the game kits
    sc.render.use_freestyle = True
    sc.render.line_thickness_mode = "ABSOLUTE"
    sc.render.line_thickness = max(1.0, res / 360)
    fs = sc.view_layers[0].freestyle_settings
    ls = fs.linesets[0] if fs.linesets else fs.linesets.new("ink")
    if ls.linestyle is None:
        ls.linestyle = bpy.data.linestyles.new("ink")
    ls.select_by_visibility = True
    ls.select_silhouette, ls.select_border, ls.select_crease = True, True, False
    ls.linestyle.color = hex_rgba(INK)[:3]
    ls.linestyle.alpha = 0.9


def frame(pts, pad=1.12, rot=VIEW):
    sc = bpy.context.scene
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.type = "ORTHO"
    cam = bpy.data.objects.new("Cam", cam_data)
    sc.collection.objects.link(cam)
    sc.camera = cam
    rm = Euler(rot).to_matrix()
    local = [rm.transposed() @ p for p in pts]
    xs, ys, zs = [p.x for p in local], [p.y for p in local], [p.z for p in local]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    cam_data.ortho_scale = max(max(xs) - min(xs), max(ys) - min(ys)) * pad
    cam.rotation_euler = rot
    cam.location = rm @ Vector((cx, cy, max(zs) + 30))
    cam_data.clip_end = 200


def shadow_catcher(pts):
    zmin = min(p.z for p in pts)
    bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, zmin - 0.002))
    bpy.context.active_object.is_shadow_catcher = True


def build_one(fn, do_render, samples):
    reset_scene()
    model = fn()
    root = model.build()
    bpy.context.view_layer.update()
    objs = [root] + list(root.children_recursive)
    pts = [ob.matrix_world @ Vector(c) for ob in objs for c in ob.bound_box]
    os.makedirs(MODELS, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(MODELS, model.name + ".glb"),
                              export_format="GLB", use_selection=False, export_apply=True,
                              export_yup=True, export_cameras=False, export_lights=False,
                              export_materials="EXPORT")
    tris = sum(sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in objs)
    if do_render:
        icon = model.category == "icons"
        setup_render(samples, 256 if icon else 512)
        frame(pts, pad=1.06 if icon else 1.14)
        if not icon:
            shadow_catcher(pts)
        out = os.path.join(RENDERS if icon else PREVIEWS, model.name + ".png")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        bpy.context.scene.render.filepath = out
        bpy.ops.render.render(write_still=True)
        if model.name in POSTERS:
            os.makedirs(RENDERS, exist_ok=True)
            shutil.copy(out, os.path.join(RENDERS, model.name + ".png"))
    print(f"[ok] {model.name:16s} {tris:6d} tris", flush=True)


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--no-render", action="store_true")
    ap.add_argument("--samples", type=int, default=48)
    a = ap.parse_args(argv)
    for fn in assets.ALL:
        if a.only and not any(fn.__name__.startswith(p) for p in a.only.split(",")):
            continue
        build_one(fn, not a.no_render, a.samples)


if __name__ == "__main__":
    main(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])
