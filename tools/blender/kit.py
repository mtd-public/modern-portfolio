"""Small procedural modelling kit on top of bpy/bmesh.

Same approach as the gig-ambulance / space-lion toy kits: every asset is a
`Model` made of named *groups*. `body` is the root mesh; every other group is
exported as a child node whose origin is its pivot, so lids, flaps, knobs and
letters stay separately animatable in three.js.

Conventions (Blender space, Z-up):
  * Assets face -Y. The glTF exporter turns that into +Z forward / +Y up.
  * Origin on the "ground" (z = 0) at the footprint centre unless noted.
  * Every colour comes from PALETTE, which is the portfolio's own palette
    (navy ink, cream paper, antique gold) plus the per-employer theme colours.
"""

import math

import bmesh
import bpy
from mathutils import Euler, Matrix, Vector

# name -> (sRGB hex, roughness, emission strength, metallic)
PALETTE = {
    # site neutrals
    "ink": ("#191333", 0.5),
    "navy": ("#221A45", 0.42),
    "navy2": ("#2E2558", 0.45),
    "navy_deep": ("#120D27", 0.5),
    "cream": ("#FBFAF7", 0.55),
    "paper": ("#F3EFE3", 0.7),
    "linen": ("#ECE7DB", 0.75),
    "muted": ("#8E88A3", 0.6),
    "slate": ("#524D68", 0.6),
    # gold family (the site accent)
    "gold": ("#C99A3D", 0.32, 0.0, 0.35),
    "gold_soft": ("#E6CFA0", 0.5),
    "gold_deep": ("#96701F", 0.4, 0.0, 0.3),
    "gold_pale": ("#F4E6C6", 0.6),
    # accents
    "green": ("#5BD68A", 0.45),
    "white": ("#FFFFFF", 0.4),
    "blush": ("#F2A7A0", 0.7),
    # employer themes
    "msu": ("#18453B", 0.5),
    "bmi": ("#1A56C4", 0.45),
    "caddo": ("#C1272D", 0.45),
    "leviathan": ("#1197B0", 0.45),
    "amber": ("#F2B705", 0.4),
    # emissive
    "screen": ("#FBF6EA", 0.35, 0.55),
    "screen_gold": ("#E2B455", 0.35, 0.5),
    "glow_green": ("#5BD68A", 0.3, 0.6),
}


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgba(h, alpha=1.0):
    h = h.lstrip("#")
    return tuple(srgb_to_linear(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)) + (alpha,)


_MATS = {}


def mat(name):
    m = _MATS.get(name)
    if m is not None and m.name in bpy.data.materials:
        return m
    spec = PALETTE[name]
    rgba = hex_rgba(spec[0])
    rough = spec[1]
    emit = spec[2] if len(spec) > 2 else 0.0
    metal = spec[3] if len(spec) > 3 else 0.0
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if emit:
        bsdf.inputs["Emission Color"].default_value = rgba
        bsdf.inputs["Emission Strength"].default_value = emit
    m.diffuse_color = rgba
    _MATS[name] = m
    return m


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _MATS.clear()


# ---------------------------------------------------------------------------
# Primitives: each returns a fresh bmesh centred on the origin.
# ---------------------------------------------------------------------------
def _bevel(bm, amount, segments, edges=None):
    if amount > 0:
        geom = (edges if edges is not None else list(bm.edges)) + list(bm.verts)
        bmesh.ops.bevel(bm, geom=geom, offset=amount, segments=segments, affect="EDGES",
                        profile=0.5, clamp_overlap=True, offset_type="OFFSET",
                        profile_type="SUPERELLIPSE")
    return bm


def box(sx, sy, sz, bevel=0.0, seg=3):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(sx, sy, sz), verts=bm.verts)
    return _bevel(bm, min(bevel, sx / 2.01, sy / 2.01, sz / 2.01), seg)


def slab(sx, sy, sz, radius, seg=6, edge=0.0):
    """Rounded-rectangle plate (corners rounded in XY), optional edge bevel."""
    pts = rrect_pts(sx, sy, radius, seg)
    bm = prism(pts, sz)
    if edge > 0:
        caps = [e for e in bm.edges if abs(e.verts[0].co.z - e.verts[1].co.z) < 1e-6]
        _bevel(bm, min(edge, sz / 2.01), 2, caps)
    return bm


def cyl(r, h, seg=24, r2=None, bevel=0.0, bseg=2):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg,
                          radius1=r, radius2=r if r2 is None else r2, depth=h)
    if bevel > 0:
        caps = [e for e in bm.edges if abs(e.verts[0].co.z - e.verts[1].co.z) < 1e-6]
        _bevel(bm, bevel, bseg, caps)
    return bm


def cone(r, h, seg=24):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg,
                          radius1=r, radius2=0.0, depth=h)
    return bm


def ball(r, u=24, v=16):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r)
    return bm


def torus(R, r, seg=40, rseg=12, arc=360.0):
    bm = bmesh.new()
    closed = arc >= 359.9
    n = seg if closed else seg + 1
    rings = []
    for i in range(n):
        a = math.radians(arc) * i / seg
        c = Vector((math.cos(a), math.sin(a), 0))
        rings.append([bm.verts.new(c * (R + r * math.cos(b)) + Vector((0, 0, r * math.sin(b))))
                      for b in (2 * math.pi * j / rseg for j in range(rseg))])
    for i in range(seg if closed else n - 1):
        a, b = rings[i], rings[(i + 1) % n]
        for j in range(rseg):
            bm.faces.new((a[j], a[(j + 1) % rseg], b[(j + 1) % rseg], b[j]))
    if not closed:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def prism(pts, depth, bevel=0.0, bseg=2):
    """Extrude a 2D polygon (XY) along Z, centred on z = 0."""
    bm = bmesh.new()
    vs = [bm.verts.new((x, y, -depth / 2)) for x, y in pts]
    f = bm.faces.new(vs)
    res = bmesh.ops.extrude_face_region(bm, geom=[f])
    top = [e for e in res["geom"] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, 0, depth), verts=top)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if bevel > 0:
        caps = [e for e in bm.edges if abs(e.verts[0].co.z - e.verts[1].co.z) < 1e-6]
        _bevel(bm, min(bevel, depth / 2.01), bseg, caps)
    return bm


def tube(points, r, rseg=12, cap=True):
    """Sweep a circle along a 3D polyline."""
    bm = bmesh.new()
    pts = [Vector(p) for p in points]
    rings = []
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        up = Vector((0, 0, 1)) if abs(t.z) < 0.95 else Vector((1, 0, 0))
        n1 = t.cross(up).normalized()
        n2 = t.cross(n1).normalized()
        rings.append([bm.verts.new(p + (n1 * math.cos(a) + n2 * math.sin(a)) * r)
                      for a in (2 * math.pi * j / rseg for j in range(rseg))])
    for a, b in zip(rings, rings[1:]):
        for j in range(rseg):
            bm.faces.new((a[j], a[(j + 1) % rseg], b[(j + 1) % rseg], b[j]))
    if cap:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


# ---------------------------------------------------------------------------
# 2D outlines
# ---------------------------------------------------------------------------
def rrect_pts(w, h, r, seg=6):
    r = min(r, w / 2 - 1e-4, h / 2 - 1e-4)
    pts = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90),
                       (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for i in range(seg + 1):
            a = math.radians(a0 + 90 * i / seg)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def circle_pts(r, n=32):
    return [(r * math.cos(2 * math.pi * i / n), r * math.sin(2 * math.pi * i / n)) for i in range(n)]


def stroke_pts(path, width, n_round=8):
    """Single closed outline of a thick polyline: mitred joins, round end caps
    (checkmarks, brackets). One polygon, so joins have no overlapping caps."""
    r = width / 2
    P = [Vector((x, y)) for x, y in path]

    def normal(a, b):
        d = (b - a).normalized()
        return Vector((-d.y, d.x))

    def side(sign):
        out = []
        for i in range(1, len(P) - 1):
            n0, n1 = normal(P[i - 1], P[i]), normal(P[i], P[i + 1])
            m = (n0 + n1).normalized()
            out.append(P[i] + m * sign * r / max(0.3, m.dot(n0)))
        return out

    def cap(c, start_dir):
        a0 = math.atan2(start_dir.y, start_dir.x)
        return [c + Vector((math.cos(a0 - math.pi * i / n_round),
                            math.sin(a0 - math.pi * i / n_round))) * r for i in range(n_round + 1)]

    left = side(1)
    right = side(-1)
    n_end = normal(P[-2], P[-1])
    n_start = normal(P[0], P[1])
    pts = [P[0] + n_start * r] + left + cap(P[-1], n_end) + list(reversed(right)) + cap(P[0], -n_start)
    pts = pts[:-1]
    return [[(p.x, p.y) for p in pts]]


def star_pts(n=4, R=0.5, r=0.16, rot=90):
    return [((R if i % 2 == 0 else r) * math.cos(math.radians(rot + 180 * i / n)),
             (R if i % 2 == 0 else r) * math.sin(math.radians(rot + 180 * i / n)))
            for i in range(2 * n)]


# ---------------------------------------------------------------------------
# Model
# ---------------------------------------------------------------------------
def _xform(loc, rot, scale):
    return (Matrix.Translation(Vector(loc))
            @ Euler([math.radians(a) for a in rot], "XYZ").to_matrix().to_4x4()
            @ Matrix.Diagonal((*scale, 1.0)))


class Model:
    def __init__(self, name, category, desc=""):
        self.name, self.category, self.desc = name, category, desc
        self.groups = {}
        self.origin = Vector((0, 0, 0))
        self.group("body")

    def group(self, name, pivot=(0, 0, 0), parent="body"):
        if name not in self.groups:
            self.groups[name] = {"pivot": Vector(pivot), "bm": bmesh.new(), "mats": [],
                                 "parent": parent if name != "body" else None}
        return name

    def add(self, part, material, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), group="body",
            smooth=True):
        g = self.groups[group]
        if material not in g["mats"]:
            g["mats"].append(material)
        idx = g["mats"].index(material)
        bmesh.ops.transform(part, matrix=_xform(Vector(loc) + self.origin, rot, scale), verts=part.verts)
        dst = g["bm"]
        vmap = {v: dst.verts.new(v.co) for v in part.verts}
        for f in part.faces:
            nf = dst.faces.new([vmap[v] for v in f.verts])
            nf.material_index = idx
            nf.smooth = smooth
        part.free()

    def build(self):
        coll = bpy.context.scene.collection
        objs = {}
        for gname, g in self.groups.items():
            if gname != "body" and not g["bm"].faces:
                continue
            bm = g["bm"]
            bmesh.ops.translate(bm, vec=-g["pivot"], verts=bm.verts)
            me = bpy.data.meshes.new(f"{self.name}_{gname}")
            bm.to_mesh(me)
            bm.free()
            for m in g["mats"]:
                me.materials.append(mat(m))
            ob = bpy.data.objects.new(self.name if gname == "body" else gname, me)
            coll.objects.link(ob)
            # Flat faces stay crisp, bevels and curves stay soft: area-weighted
            # custom normals give the "smooth-shaded toy" look without the
            # gradients plain smooth shading smears across big flat faces.
            wn = ob.modifiers.new("wn", "WEIGHTED_NORMAL")
            wn.mode = "FACE_AREA"
            wn.weight = 100
            wn.keep_sharp = True
            wn.thresh = 0.01
            objs[gname] = ob
        for gname, ob in objs.items():
            g = self.groups[gname]
            if g["parent"]:
                parent = g["parent"] if g["parent"] in objs else "body"
                ob.parent = objs[parent]
                ob.location = g["pivot"] - self.groups[parent]["pivot"]
        root = objs["body"]
        root.location = self.groups["body"]["pivot"]
        return root


class at:
    """Temporarily offset a model's origin (compose sub-parts)."""

    def __init__(self, m, x=0.0, y=0.0, z=0.0):
        self.m, self.d = m, Vector((x, y, z))

    def __enter__(self):
        self.m.origin += self.d
        return self.m

    def __exit__(self, *a):
        self.m.origin -= self.d
