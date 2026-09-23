"""The portfolio's asset set.

Everything stands up facing the viewer (-Y in Blender, +Z in glTF). 2D
outlines are authored in XY and stood up with UP = (90, 0, 0), which maps
2D x -> X and 2D y -> Z.
"""

import math

from kit import (Model, ball, box, cone, cyl, prism, rrect_pts, slab, star_pts,
                 stroke_pts, torus, tube)

UP = (90, 0, 0)


def glyph(m, path, width, depth, material, loc, group="body", scale=1.0):
    """Raised round-capped stroke glyph (checkmarks, brackets) on the XZ plane."""
    x, y, z = loc
    for pts in stroke_pts([(px * scale, py * scale) for px, py in path], width * scale):
        m.add(prism(pts, depth, bevel=min(depth, width * scale) * 0.3, bseg=3), material, (x, y, z), UP,
              group=group)


def ui_line(m, w, h, material, x, z, y, depth=0.03, group="body"):
    """A rounded 'text line' pill sitting proud of a surface at depth y."""
    m.add(slab(w, h, depth, h / 2, seg=5), material, (x, y - depth / 2, z), UP, group=group)


# ---------------------------------------------------------------------------
# About: laptop
# ---------------------------------------------------------------------------
def laptop():
    m = Model("laptop", "about", "Navy laptop with a lit UI screen; `lid` hinges on local X.")
    W, D, T = 3.2, 2.2, 0.14
    m.add(slab(W, D, T, 0.2, edge=0.05), "navy", (0, 0, T / 2))
    m.add(slab(W - 0.04, D - 0.04, 0.03, 0.19), "navy_deep", (0, 0, 0.015))
    # keyboard well + keys
    m.add(slab(2.84, 1.02, 0.02, 0.08), "navy_deep", (0, 0.36, T + 0.005))
    kw, gap = 0.19, 0.047
    for row in range(4):
        z = T + 0.03
        yk = 0.75 - row * (kw + gap)
        cols = 12
        for col in range(cols):
            xk = -((cols - 1) / 2) * (kw + gap) + col * (kw + gap)
            if row == 3 and 3 <= col <= 8:
                continue
            mat_ = "gold" if (row == 1 and col == 11) or (row == 0 and col == 0) else "navy2"
            m.add(box(kw, kw, 0.05, 0.03, 2), mat_, (xk, yk, z))
    m.add(box(6 * (kw + gap) - gap, kw, 0.05, 0.03, 2), "navy2", (0, 0.75 - 3 * (kw + gap), T + 0.03))
    # trackpad + front lip notch
    m.add(slab(0.95, 0.56, 0.02, 0.08), "gold", (0, -0.62, T + 0.005))
    m.add(slab(0.5, 0.06, 0.03, 0.03), "navy_deep", (0, -D / 2 + 0.02, T - 0.01))

    # lid: pivot on the hinge line at the back edge, tilted back ~12 deg
    hy, hz = D / 2 - 0.08, T + 0.02
    m.group("lid", pivot=(0, hy, hz))
    LW, LH, LT = 3.2, 2.12, 0.09
    tilt = -12
    import mathutils
    rot = mathutils.Euler((math.radians(tilt), 0, 0)).to_matrix()

    def put(part, material, local, r=(0, 0, 0)):
        p = rot @ mathutils.Vector(local)
        m.add(part, material, (p.x, hy + p.y, hz + p.z), (r[0] + tilt, r[1], r[2]), group="lid")

    put(slab(LW, LH, LT, 0.18, edge=0.03), "navy", (0, 0, LH / 2), UP)
    # screen (emissive) + bezel
    fy = -LT / 2
    put(slab(2.92, 1.82, 0.02, 0.08), "navy_deep", (0, fy - 0.005, LH / 2 + 0.03), UP)
    put(slab(2.8, 1.7, 0.02, 0.06), "screen", (0, fy - 0.015, LH / 2 + 0.03), UP)
    # on-screen UI: header, hero card, text lines, sidebar tiles
    sy = fy - 0.03
    top = LH / 2 + 0.03 + 0.85
    put(slab(2.6, 0.16, 0.02, 0.05), "linen", (0, sy, top - 0.14), UP)
    for i, c in enumerate(("gold_soft", "gold_soft", "gold")):
        put(cyl(0.035, 0.02, 16), c, (-1.2 + i * 0.1, sy - 0.012, top - 0.14), UP)
    put(slab(0.9, 0.12, 0.02, 0.06), "gold", (-0.72, sy, top - 0.42), UP)
    put(slab(1.5, 0.07, 0.02, 0.035), "linen", (-0.42, sy, top - 0.6), UP)
    put(slab(1.2, 0.07, 0.02, 0.035), "linen", (-0.57, sy, top - 0.72), UP)
    put(slab(0.55, 0.16, 0.025, 0.08), "ink", (-0.9, sy, top - 0.96), UP)
    put(slab(0.55, 0.16, 0.025, 0.08), "gold_pale", (-0.28, sy, top - 0.96), UP)
    put(slab(0.98, 0.9, 0.025, 0.08), "navy", (0.72, sy, top - 0.78), UP)
    put(slab(0.5, 0.08, 0.02, 0.04), "gold", (0.56, sy - 0.02, top - 0.48), UP)
    put(slab(0.7, 0.06, 0.02, 0.03), "slate", (0.66, sy - 0.02, top - 0.62), UP)
    put(cyl(0.16, 0.03, 24), "green", (0.9, sy - 0.02, top - 0.98), UP)
    put(slab(2.6, 0.06, 0.02, 0.03), "linen", (0, sy, top - 1.38), UP)
    put(slab(1.9, 0.06, 0.02, 0.03), "linen", (-0.35, sy, top - 1.5), UP)
    # back: gold monogram ring
    by = LT / 2
    put(torus(0.26, 0.045, 36, 10), "gold", (0, by + 0.01, LH / 2 + 0.05), (90, 0, 0))
    put(cyl(0.12, 0.03, 24), "gold_soft", (0, by + 0.01, LH / 2 + 0.05), (90, 0, 0))
    # hinge barrel
    m.add(cyl(0.07, 2.6, 20), "navy_deep", (0, hy, hz), (0, 90, 0))
    return m


# ---------------------------------------------------------------------------
# Hero: design canvas + floating UI pieces
# ---------------------------------------------------------------------------
def hero_board():
    m = Model("hero_board", "hero", "Floating design canvas (browser window of UI blocks).")
    W, H, T = 4.2, 3.4, 0.22
    m.add(slab(W, H, T, 0.3, edge=0.06), "cream", (0, 0, 0), UP)
    m.add(slab(W - 0.06, H - 0.06, 0.08, 0.28), "linen", (0, T / 2 - 0.03, 0), UP)
    f = -T / 2
    top = H / 2
    for i, c in enumerate(("gold_soft", "gold_soft", "gold")):
        m.add(cyl(0.075, 0.05, 20, bevel=0.015), c, (-1.72 + i * 0.22, f - 0.02, top - 0.3), UP)
    ui_line(m, 3.6, 0.2, "gold", 0, top - 0.6, f)
    # hero image block with a little landscape
    m.add(slab(3.6, 1.15, 0.04, 0.16), "paper", (0, f - 0.02, top - 1.35), UP)
    m.add(cyl(0.2, 0.05, 28), "gold", (1.15, f - 0.05, top - 1.12), UP)
    hills = [(-1.7, -0.5), (-0.9, 0.25), (-0.35, -0.2), (0.35, 0.3), (1.2, -0.28), (1.7, -0.1),
             (1.7, -0.5)]
    m.add(prism(hills, 0.04), "navy2", (0, f - 0.055, top - 1.4), UP)
    hills2 = [(-1.7, -0.5), (-1.7, -0.3), (-1.1, -0.05), (-0.3, -0.42), (0.6, -0.12), (1.7, -0.45),
              (1.7, -0.5)]
    m.add(prism(hills2, 0.05), "gold_soft", (0, f - 0.07, top - 1.4), UP)
    # two cards
    m.add(slab(1.7, 0.95, 0.1, 0.14, edge=0.03), "navy", (-0.95, f - 0.05, top - 2.55), UP)
    ui_line(m, 0.55, 0.11, "gold", -1.35, top - 2.35, f - 0.1)
    ui_line(m, 0.95, 0.11, "slate", -1.15, top - 2.55, f - 0.1)
    ui_line(m, 0.7, 0.11, "slate", -1.27, top - 2.75, f - 0.1)
    m.add(slab(1.7, 0.95, 0.1, 0.14, edge=0.03), "white", (0.95, f - 0.05, top - 2.55), UP)
    ui_line(m, 1.25, 0.11, "linen", 0.85, top - 2.35, f - 0.1)
    ui_line(m, 0.9, 0.11, "linen", 0.68, top - 2.55, f - 0.1)
    ui_line(m, 0.5, 0.14, "gold_soft", 0.48, top - 2.77, f - 0.1)
    return m


def ui_check():
    m = Model("ui_check", "hero", "Navy tile with a green check (the 'shipped' badge).")
    m.add(slab(1.3, 1.3, 0.34, 0.26, edge=0.08), "navy", (0, 0, 0), UP)
    glyph(m, [(-0.3, 0.02), (-0.08, -0.2), (0.32, 0.22)], 0.2, 0.1, "green", (0, -0.2, 0))
    return m


def ui_toggle():
    m = Model("ui_toggle", "hero", "Pill toggle; `knob` slides on local X (+/-0.33).")
    m.add(slab(1.5, 0.78, 0.26, 0.39, seg=10, edge=0.07), "linen", (0, 0, 0), UP)
    m.add(slab(1.34, 0.62, 0.05, 0.31, seg=10), "gold", (0, -0.13, 0), UP)
    m.group("knob", pivot=(-0.33, -0.2, 0))
    m.add(cyl(0.26, 0.18, 32, bevel=0.07, bseg=3), "cream", (-0.33, -0.2, 0), UP, group="knob")
    return m


def ui_cursor():
    m = Model("ui_cursor", "hero", "Pointer arrow; tip at the origin.")
    arrow = [(0, 0), (0, -1.0), (0.24, -0.78), (0.42, -1.15), (0.58, -1.07), (0.4, -0.7),
             (0.72, -0.7)]
    m.add(prism(arrow, 0.16, bevel=0.035), "ink", (0, 0, 0), UP)
    inner = [(0.07, -0.16), (0.07, -0.82), (0.25, -0.64), (0.44, -1.02), (0.5, -0.99), (0.31, -0.62),
             (0.55, -0.62)]
    m.add(prism(inner, 0.05), "cream", (0, -0.08, 0), UP)
    return m


def ui_code():
    m = Model("ui_code", "hero", "Chunky </> glyph.")
    glyph(m, [(-0.35, 0.4), (-0.8, 0), (-0.35, -0.4)], 0.2, 0.22, "gold", (0, 0, 0))
    glyph(m, [(0.35, 0.4), (0.8, 0), (0.35, -0.4)], 0.2, 0.22, "gold", (0, 0, 0))
    glyph(m, [(0.14, 0.5), (-0.14, -0.5)], 0.2, 0.22, "navy", (0, 0, 0))
    return m


def ui_swatches():
    m = Model("ui_swatches", "hero", "Fan of colour chips pinned at the bottom.")
    for i, c in enumerate(("navy", "leviathan", "green", "gold", "cream")):
        a = -34 + i * 17
        r = math.radians(a)
        L = 1.3
        cx, cz = math.sin(r) * L / 2, math.cos(r) * L / 2
        m.add(slab(0.42, L, 0.05, 0.1, edge=0.015), c, (cx, -0.06 * i, cz), (90, -a, 0))
    m.add(cyl(0.08, 0.5, 20, bevel=0.02), "gold_deep", (0, -0.14, 0.12), UP)
    return m


def ui_pen():
    m = Model("ui_pen", "hero", "Designer stylus.")
    m.add(cyl(0.11, 1.8, 24, bevel=0.03), "navy", (0, 0, 0.9))
    m.add(cyl(0.115, 0.22, 24), "gold", (0, 0, 1.55))
    m.add(cyl(0.11, 0.35, 24, r2=0.02), "gold_soft", (0, 0, -0.18), (180, 0, 0))
    m.add(ball(0.11, 20, 10), "navy", (0, 0, 1.8))
    m.add(box(0.05, 0.05, 0.7, 0.02), "gold", (0, -0.12, 1.2))
    return m


def spark():
    m = Model("spark", "shared", "Four-point sparkle.")
    m.add(prism(star_pts(4, 0.5, 0.13), 0.12, bevel=0.03), "gold", (0, 0, 0), UP)
    return m


# ---------------------------------------------------------------------------
# Contact: envelope, letter, paper plane, pin, orbs
# ---------------------------------------------------------------------------
def envelope():
    m = Model("envelope", "contact",
              "Envelope; `flap` hinges on local X at the top edge, `letter` slides up on Y.")
    W, H, D = 2.8, 1.8, 0.34
    m.add(box(W, D, H, 0.08), "paper", (0, 0, H / 2))
    f = -D / 2
    # front folds: two side triangles and the bottom pocket, raised
    m.add(prism([(-W / 2 + 0.06, 0.06), (0, 0.86), (-W / 2 + 0.06, H - 0.06)], 0.03), "linen",
          (0, f - 0.015, 0), UP)
    m.add(prism([(W / 2 - 0.06, 0.06), (W / 2 - 0.06, H - 0.06), (0, 0.86)], 0.03), "linen",
          (0, f - 0.015, 0), UP)
    m.add(prism([(-W / 2 + 0.06, 0.06), (W / 2 - 0.06, 0.06), (0, 0.86)], 0.05), "cream",
          (0, f - 0.025, 0), UP)
    # letter tucked inside
    m.group("letter", pivot=(0, 0, 0.9))
    m.add(box(W - 0.4, 0.05, H - 0.2, 0.02, 2), "white", (0, 0, 0.9), group="letter")
    for i, (w, c) in enumerate(((1.2, "gold"), (1.9, "linen"), (1.6, "linen"), (1.8, "linen"))):
        x = -(W - 0.4) / 2 + 0.2 + w / 2
        m.add(slab(w, 0.1 if i else 0.14, 0.02, 0.05), c, (x, -0.035, 1.55 - i * 0.2), UP,
              group="letter")
    # flap: triangle hanging from the top edge, hinged there
    m.group("flap", pivot=(0, f - 0.02, H - 0.02))
    tri = [(-W / 2 + 0.02, 0), (W / 2 - 0.02, 0), (0, -0.98)]
    m.add(prism(tri, 0.05, bevel=0.015), "cream", (0, f - 0.045, H - 0.02), UP, group="flap")
    m.add(cyl(0.2, 0.07, 32, bevel=0.025), "gold", (0, f - 0.09, H - 0.84), UP, group="flap")
    m.add(prism(star_pts(4, 0.12, 0.04), 0.03), "gold_pale", (0, f - 0.13, H - 0.84), UP,
          group="flap")
    return m


def paper_plane():
    """Classic dart, nose along -Y (glTF +Z), built from thin plates."""
    import bmesh
    m = Model("paper_plane", "contact", "Folded paper plane; nose points forward.")

    def plate(pts, th=0.025):
        bm = bmesh.new()
        top = [bm.verts.new((x, y, z + th / 2)) for x, y, z in pts]
        bot = [bm.verts.new((x, y, z - th / 2)) for x, y, z in pts]
        bm.faces.new(top)
        bm.faces.new(list(reversed(bot)))
        n = len(pts)
        for i in range(n):
            j = (i + 1) % n
            bm.faces.new((top[i], bot[i], bot[j], top[j]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        return bm

    nose, tail = -1.3, 1.0
    m.add(plate([(0, nose, 0.0), (-0.95, tail, 0.12), (-0.08, tail - 0.08, 0.02)]), "cream",
          smooth=False)
    m.add(plate([(0, nose, 0.0), (0.08, tail - 0.08, 0.02), (0.95, tail, 0.12)]), "cream",
          smooth=False)
    m.add(plate([(0, nose, 0.0), (-0.05, tail - 0.08, 0.0), (-0.02, tail, -0.34)]), "linen",
          smooth=False)
    m.add(plate([(0, nose, 0.0), (0.02, tail, -0.34), (0.05, tail - 0.08, 0.0)]), "linen",
          smooth=False)
    # gold wing-tip stripes
    m.add(plate([(-0.62, 0.5, 0.1), (-0.95, tail, 0.135), (-0.78, tail - 0.02, 0.13)], 0.03), "gold",
          smooth=False)
    m.add(plate([(0.62, 0.5, 0.1), (0.78, tail - 0.02, 0.13), (0.95, tail, 0.135)], 0.03), "gold",
          smooth=False)
    return m


def pin():
    m = Model("pin", "contact", "Map pin (Grand Rapids).")
    m.add(ball(0.42, 32, 20), "navy", (0, 0, 1.0))
    m.add(cone(0.36, 0.72, 32), "navy", (0, 0, 0.5), (180, 0, 0))
    m.add(cyl(0.17, 0.1, 28, bevel=0.03), "gold", (0, -0.38, 1.03), UP)
    m.add(cyl(0.34, 0.04, 32, bevel=0.015), "gold_soft", (0, 0, 0.02))
    return m


def orb():
    m = Model("orb", "shared", "Glossy gold sphere with a thin navy ring.")
    m.add(ball(0.6, 40, 26), "gold", (0, 0, 0))
    m.add(torus(0.92, 0.045, 64, 10), "navy", (0, 0, 0), (74, 12, 0))
    return m


def orb_navy():
    m = Model("orb_navy", "shared", "Navy sphere with a gold ring (the contact card's dark circle).")
    m.add(ball(0.6, 40, 26), "navy", (0, 0, 0))
    m.add(torus(0.92, 0.05, 64, 10), "gold", (0, 0, 0), (74, 12, 0))
    return m


def ring():
    m = Model("ring", "shared", "Chunky gold ring.")
    m.add(torus(0.8, 0.16, 56, 18), "gold", (0, 0, 0), UP)
    return m


def bubble():
    m = Model("bubble", "contact", "Chat bubble with typing dots.")
    body = rrect_pts(1.5, 0.95, 0.42, 8)
    # splice a tail into the bottom edge so it is one clean silhouette
    cut = next(i for i, (x, y) in enumerate(body) if y < -0.47 and x > 0)
    body = body[:cut] + [(-0.46, -0.475), (-0.62, -0.8), (-0.1, -0.475)] + body[cut:]
    m.add(prism(body, 0.24, bevel=0.07, bseg=3), "white", (0, 0, 0), UP)
    for i in range(3):
        name = m.group(f"dot{i}", pivot=(-0.34 + i * 0.34, -0.14, 0.02))
        m.add(ball(0.09, 18, 12), "gold" if i == 1 else "navy2", (-0.34 + i * 0.34, -0.14, 0.02),
              group=name)
    return m


# ---------------------------------------------------------------------------
# Experience icons (rendered to PNG, also exported)
# ---------------------------------------------------------------------------
def icon_cap():
    m = Model("icon_cap", "icons", "Graduation cap.")
    m.add(cyl(0.62, 0.55, 32, r2=0.66, bevel=0.05), "navy", (0, 0, 0.3))
    m.add(box(1.9, 1.9, 0.14, 0.05), "navy2", (0, 0, 0.64), (0, 0, 45))
    m.add(cyl(0.12, 0.1, 20, bevel=0.03), "gold", (0, 0, 0.75))
    m.add(tube([(0, 0, 0.76), (0.5, -0.5, 0.75), (0.9, -0.9, 0.73), (0.93, -0.93, 0.62),
                (0.93, -0.93, 0.3)], 0.055), "gold")
    m.add(cyl(0.16, 0.36, 20, r2=0.06), "gold", (0.93, -0.93, 0.14), (180, 0, 0))
    return m


def icon_chart():
    m = Model("icon_chart", "icons", "Audit board with rising bars.")
    m.add(slab(1.8, 1.6, 0.18, 0.2, edge=0.05), "cream", (0, 0, 0.8), UP)
    for i, (h, c) in enumerate(((0.45, "gold_soft"), (0.75, "gold"), (1.05, "navy"))):
        x = -0.5 + i * 0.5
        m.add(box(0.32, 0.18, h, 0.05), c, (x, -0.14, 0.15 + h / 2 + 0.05))
    glyph(m, [(-0.62, 0.42), (-0.1, 0.72), (0.2, 0.55), (0.62, 1.12)], 0.08, 0.06, "green",
          (0, -0.24, 0.12))
    return m


def icon_gear():
    m = Model("icon_gear", "icons", "Gear with a gold hub.")
    teeth, R, r = 8, 0.78, 0.62
    pts = []
    for i in range(teeth * 4):
        a = 2 * math.pi * i / (teeth * 4)
        rr = R if (i % 4) in (1, 2) else r
        pts.append((rr * math.cos(a + math.pi / (teeth * 4)), rr * math.sin(a + math.pi / (teeth * 4))))
    m.add(prism(pts, 0.34, bevel=0.05), "navy", (0, 0, 0), UP)
    m.add(cyl(0.3, 0.46, 32, bevel=0.06), "gold", (0, 0, 0), UP)
    m.add(cyl(0.12, 0.5, 24), "navy_deep", (0, 0, 0), UP)
    return m


def icon_code():
    m = Model("icon_code", "icons", "</> brackets on a tile.")
    m.add(slab(1.8, 1.4, 0.2, 0.26, edge=0.06), "cream", (0, 0, 0), UP)
    glyph(m, [(-0.3, 0.32), (-0.62, 0), (-0.3, -0.32)], 0.16, 0.12, "navy", (0, -0.14, 0))
    glyph(m, [(0.3, 0.32), (0.62, 0), (0.3, -0.32)], 0.16, 0.12, "navy", (0, -0.14, 0))
    glyph(m, [(0.12, 0.4), (-0.12, -0.4)], 0.16, 0.12, "gold", (0, -0.14, 0))
    return m


def icon_shield():
    m = Model("icon_shield", "icons", "Shield with a check.")
    pts = [(0, 0.9)]
    for i in range(1, 12):
        t = i / 12
        pts.append((0.78 * math.sin(t * math.pi / 2) ** 0.4, 0.9 - 0.18 * t))
    pts += [(0.78, 0.5), (0.74, 0.1), (0.55, -0.4), (0.28, -0.72), (0, -0.9), (-0.28, -0.72),
            (-0.55, -0.4), (-0.74, 0.1), (-0.78, 0.5)]
    for i in range(11, 0, -1):
        t = i / 12
        pts.append((-0.78 * math.sin(t * math.pi / 2) ** 0.4, 0.9 - 0.18 * t))
    m.add(prism(pts, 0.3, bevel=0.07), "navy", (0, 0, 0), UP)
    glyph(m, [(-0.3, 0.02), (-0.08, -0.22), (0.32, 0.26)], 0.17, 0.1, "gold", (0, -0.18, 0))
    return m


ALL = [laptop, hero_board, ui_check, ui_toggle, ui_cursor, ui_code, ui_swatches, ui_pen, spark,
       envelope, paper_plane, pin, orb, orb_navy, ring, bubble,
       icon_cap, icon_chart, icon_gear, icon_code, icon_shield]
