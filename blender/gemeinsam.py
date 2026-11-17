"""Gemeinsame Bausteine für die Gebäudemodelle (Blender 5, ohne Oberfläche: blender -b -P modell.py oder python mit bpy).

Ablauf je Gebäude:
  1. Modell aus Grundkörpern mit gerundeten Kanten bauen, jedes Teil mit einem prozeduralen Material
  2. Alle Teile außer leuchtenden und beweglichen zu einem Körper verbinden und neu abwickeln (ein Atlas je Gebäude)
  3. Farbe mit Umgebungsverdeckung sowie Rauheit und Metall in Texturen backen
  4. Als JSON im Format der Spiel-Modelle ausgeben (Positionen, Normalen, UV, Indizes; Base64), dazu die Texturen als JPEG

Koordinaten: Blender Z oben -> Spiel Y oben. Spiel (x, y, z) = Blender (x, z, -y). Ein Feld ist 1 m.
Ausgang eines Gebäudes mit Größe s liegt bei Drehung 0 auf der +X-Seite, in der ersten Feldreihe (Spiel-z kleiner 0, Blender-y größer 0).
"""
import base64
import json
import math
import os

import bpy
import numpy as np

AUS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ausgabe")
# Foto-Texturen (CC0, Poly Haven, siehe texturen/quellen.json): je Satz farbe, rauh, hoehe als JPEG
TEX = os.path.join(os.path.dirname(os.path.abspath(__file__)), "texturen")


def leeren():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.samples = 48
    s.unit_settings.system = "METRIC"


# ---------- Materialien (prozedural, werden in den Atlas gebacken) ----------

def _knoten(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m, nt, bsdf


def _rauschen(nt, skala, detail=6.0, rauh=0.6):
    tk = nt.nodes.new("ShaderNodeTexCoord")
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = skala
    n.inputs["Detail"].default_value = detail
    n.inputs["Roughness"].default_value = rauh
    nt.links.new(tk.outputs["Object"], n.inputs["Vector"])
    return n


def _mische(nt, fac, a, b):
    mx = nt.nodes.new("ShaderNodeMix")
    mx.data_type = "RGBA"
    nt.links.new(fac, mx.inputs["Factor"])
    mx.inputs[6].default_value = (*a, 1)
    mx.inputs[7].default_value = (*b, 1)
    return mx.outputs[2]


def _kante(nt):
    """Hellere, abgenutzte Kanten (Kantenverschleiß) über die Krümmung."""
    g = nt.nodes.new("ShaderNodeNewGeometry")
    r = nt.nodes.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].position = 0.53
    r.color_ramp.elements[1].position = 0.6
    nt.links.new(g.outputs["Pointiness"], r.inputs["Fac"])
    return r.outputs["Color"]


def _socket_vor(nt, b, eingang):
    l = next((l for l in nt.links if l.to_socket == b.inputs[eingang]), None)
    return l.from_socket if l else None


def _bild(nt, satz, art, skala, farbig):
    pfad = os.path.join(TEX, f"{satz}_{art}.jpg")
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = bpy.data.images.load(pfad, check_existing=True)
    t.image.colorspace_settings.name = "sRGB" if farbig else "Non-Color"
    t.projection = "BOX"
    t.projection_blend = 0.3
    tk = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / skala,) * 3
    nt.links.new(tk.outputs["Object"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], t.inputs["Vector"])
    return t


def foto(name, satz, skala=1.5, tint=None, metall=0.0, relief=0.6, schmutz=0.6, russ=False):
    """Material aus einer Foto-Textur (Würfelprojektion, Kantenlänge einer Kachel = skala Meter).
    tint: Farbe, in die das Foto umgefärbt wird (Helligkeit und Flecken bleiben, z. B. Lack in Gelb)."""
    m, nt, b = _knoten(name)
    f = _bild(nt, satz, "farbe", skala, True)
    c = f.outputs["Color"]
    if tint:
        bw = nt.nodes.new("ShaderNodeRGBToBW")
        nt.links.new(c, bw.inputs["Color"])
        hell = nt.nodes.new("ShaderNodeMath")
        hell.operation = "MULTIPLY"
        hell.inputs[1].default_value = 3.4
        nt.links.new(bw.outputs["Val"], hell.inputs[0])
        um = nt.nodes.new("ShaderNodeMix")
        um.data_type = "RGBA"
        um.blend_type = "MULTIPLY"
        um.inputs["Factor"].default_value = 1.0
        nt.links.new(hell.outputs[0], um.inputs[6])
        um.inputs[7].default_value = (*tint, 1)
        # Rostige Stellen (dunkel, rötlich) im Foto bleiben teilweise erhalten
        mx = nt.nodes.new("ShaderNodeMix")
        mx.data_type = "RGBA"
        mx.inputs["Factor"].default_value = 0.82
        nt.links.new(c, mx.inputs[6])
        nt.links.new(um.outputs[2], mx.inputs[7])
        c = mx.outputs[2]
    nt.links.new(c, b.inputs["Base Color"])
    r = _bild(nt, satz, "rauh", skala, False)
    nt.links.new(r.outputs["Color"], b.inputs["Roughness"])
    b.inputs["Metallic"].default_value = metall
    h = _bild(nt, satz, "hoehe", skala, False)
    return _veredeln(m, hoehe=h.outputs["Color"], relief=relief, schmutz=schmutz, russ=russ, rauh_lassen=True)


def _fotos(satz):
    return os.path.exists(os.path.join(TEX, f"{satz}_farbe.jpg"))


def _veredeln(m, hoehe=None, relief=0.35, laeufer=(0.16, 0.12, 0.09), schmutz=1.0, russ=False, rauh_lassen=False):
    """Realistischere Oberfläche: Bodenschmutz, Schmutz- oder Rostläufer nach unten, Flecken, Ruß oben,
    dazu ein Relief (Bump) aus der Höhe des Musters plus feinem Rauschen. Wird mitgebacken (Farbe, Normalen)."""
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    c = _socket_vor(nt, b, "Base Color")
    if c is None:
        rgb = nt.nodes.new("ShaderNodeRGB")
        rgb.outputs[0].default_value = b.inputs["Base Color"].default_value
        c = rgb.outputs[0]
    tk = nt.nodes.new("ShaderNodeTexCoord")
    sx = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tk.outputs["Object"], sx.inputs["Vector"])

    def mix(fac, a, farbe, art="MIX"):
        mx = nt.nodes.new("ShaderNodeMix")
        mx.data_type = "RGBA"
        mx.blend_type = art
        nt.links.new(fac, mx.inputs["Factor"])
        nt.links.new(a, mx.inputs[6])
        mx.inputs[7].default_value = (*farbe, 1)
        return mx.outputs[2]

    def bereich(wert, a, b2, c2, d):
        r = nt.nodes.new("ShaderNodeMapRange")
        r.inputs["From Min"].default_value, r.inputs["From Max"].default_value = a, b2
        r.inputs["To Min"].default_value, r.inputs["To Max"].default_value = c2, d
        r.clamp = True
        nt.links.new(wert, r.inputs["Value"])
        return r.outputs["Result"]

    # Bodenschmutz: die unteren 40 cm dunkler und bräunlich
    c = mix(bereich(sx.outputs["Z"], 0.0, 0.45, 0.4 * schmutz, 0.0), c, (0.16, 0.13, 0.1))
    # Läufer: in der Höhe gestrecktes Rauschen
    st = nt.nodes.new("ShaderNodeVectorMath")
    st.operation = "MULTIPLY"
    st.inputs[1].default_value = (4.0, 4.0, 0.22)
    nt.links.new(tk.outputs["Object"], st.inputs[0])
    nl = nt.nodes.new("ShaderNodeTexNoise")
    nl.inputs["Scale"].default_value = 3.0
    nl.inputs["Detail"].default_value = 6.0
    nt.links.new(st.outputs["Vector"], nl.inputs["Vector"])
    c = mix(bereich(nl.outputs["Fac"], 0.55, 0.75, 0.0, 0.4 * schmutz + 0.1), c, laeufer)
    # Flecken
    nf = _rauschen(nt, 2.5, 5, 0.6)
    c = mix(bereich(nf.outputs["Fac"], 0.45, 0.75, 0.0, 0.3 * schmutz), c, (0.55, 0.52, 0.48), "MULTIPLY")
    # Ruß oben (Schornsteine, Hauben)
    if russ:
        c = mix(bereich(sx.outputs["Z"], 2.2, 3.4, 0.0, 0.75), c, (0.04, 0.035, 0.03))
    nt.links.new(c, b.inputs["Base Color"])
    # Relief: Musterhöhe plus feines Rauschen
    fein = _rauschen(nt, 60, 8, 0.7)
    h = fein.outputs["Fac"]
    if hoehe is not None:
        add = nt.nodes.new("ShaderNodeMath")
        add.operation = "MULTIPLY_ADD"
        nt.links.new(hoehe, add.inputs[0])
        add.inputs[1].default_value = 4.0
        nt.links.new(fein.outputs["Fac"], add.inputs[2])
        h = add.outputs[0]
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = relief
    bump.inputs["Distance"].default_value = 0.01
    nt.links.new(h, bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    # Rauheit leicht streuen (nicht bei Foto-Texturen, die bringen ihre eigene mit)
    if rauh_lassen:
        return m
    rr = b.inputs["Roughness"].default_value
    nt.links.new(bereich(nf.outputs["Fac"], 0.3, 0.7, max(0, rr - 0.12), min(1, rr + 0.12)), b.inputs["Roughness"])
    return m


def lack(name, farbe, rauh=0.45, metall=0.3, verschleiss=True):
    if verschleiss and _fotos("lack"):
        return foto(name, "lack", 1.1, tint=farbe, metall=metall, relief=0.5, schmutz=0.5)
    m, nt, b = _knoten(name)
    n = _rauschen(nt, 18)
    c = _mische(nt, n.outputs["Fac"], tuple(v * 0.82 for v in farbe), farbe)
    if verschleiss:
        mx = nt.nodes.new("ShaderNodeMix")
        mx.data_type = "RGBA"
        nt.links.new(_kante(nt), mx.inputs["Factor"])
        nt.links.new(c, mx.inputs[6])
        mx.inputs[7].default_value = tuple(v * 0.6 + 0.12 for v in farbe) + (1,)
        c = mx.outputs[2]
    nt.links.new(c, b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rauh
    b.inputs["Metallic"].default_value = metall
    return _veredeln(m, relief=0.2, laeufer=(0.3, 0.12, 0.04) if verschleiss else (0.2, 0.18, 0.16))


def stahl(name, farbe=(0.30, 0.31, 0.32), rauh=0.38):
    m, nt, b = _knoten(name)
    n = _rauschen(nt, 40, 8, 0.7)
    nt.links.new(_mische(nt, n.outputs["Fac"], tuple(v * 0.7 for v in farbe), farbe), b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rauh
    b.inputs["Metallic"].default_value = 0.85
    return _veredeln(m, relief=0.25, laeufer=(0.28, 0.11, 0.04), russ=True)


def rost(name):
    if _fotos("lack"):
        return foto(name, "lack", 1.0, metall=0.45, relief=0.6, schmutz=0.5, russ=True)
    m, nt, b = _knoten(name)
    n = _rauschen(nt, 9, 10, 0.75)
    r = nt.nodes.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].color = (0.09, 0.035, 0.015, 1)
    r.color_ramp.elements[1].color = (0.36, 0.13, 0.04, 1)
    e = r.color_ramp.elements.new(0.5)
    e.color = (0.2, 0.07, 0.025, 1)
    nt.links.new(n.outputs["Fac"], r.inputs["Fac"])
    nt.links.new(r.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.8
    b.inputs["Metallic"].default_value = 0.45
    return _veredeln(m, hoehe=n.outputs["Fac"], relief=0.6, laeufer=(0.15, 0.05, 0.02), russ=True)


def beton(name, hell=0.55):
    if _fotos("beton"):
        return foto(name, "beton", 2.2, tint=(hell * 1.05, hell * 1.03, hell) if hell < 0.5 else None, relief=0.5, schmutz=0.8)
    m, nt, b = _knoten(name)
    n = _rauschen(nt, 14, 9, 0.65)
    c = _mische(nt, n.outputs["Fac"], (hell * 0.78, hell * 0.77, hell * 0.74), (hell, hell * 0.99, hell * 0.95))
    nt.links.new(c, b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.88
    b.inputs["Metallic"].default_value = 0.0
    return _veredeln(m, hoehe=n.outputs["Fac"], relief=0.45, schmutz=0.7)


def ziegel(name, farbe=(0.42, 0.14, 0.08), fuge=(0.48, 0.46, 0.43), skala=11.0, radius=0.56):
    """Mauerwerk. radius > 0: zylindrisch um die Z-Achse des Teils (für runde Schächte), sonst eben (Wände entlang X/Y)."""
    if _fotos("ziegel"):
        return foto(name, "ziegel", 1.4, relief=0.9, schmutz=0.6, russ=True)
    m, nt, b = _knoten(name)
    tk = nt.nodes.new("ShaderNodeTexCoord")
    sx = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tk.outputs["Object"], sx.inputs["Vector"])
    um = nt.nodes.new("ShaderNodeMath")
    if radius > 0:
        um.operation = "ARCTAN2"
        nt.links.new(sx.outputs["Y"], um.inputs[0])
        nt.links.new(sx.outputs["X"], um.inputs[1])
        mal = nt.nodes.new("ShaderNodeMath")
        mal.operation = "MULTIPLY"
        mal.inputs[1].default_value = radius
        nt.links.new(um.outputs[0], mal.inputs[0])
        u = mal.outputs[0]
    else:
        um.operation = "ADD"
        nt.links.new(sx.outputs["X"], um.inputs[0])
        nt.links.new(sx.outputs["Y"], um.inputs[1])
        u = um.outputs[0]
    vec = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(u, vec.inputs["X"])
    nt.links.new(sx.outputs["Z"], vec.inputs["Y"])
    br = nt.nodes.new("ShaderNodeTexBrick")
    br.inputs["Scale"].default_value = skala
    br.inputs["Mortar Size"].default_value = 0.018
    br.inputs["Color1"].default_value = (*farbe, 1)
    br.inputs["Color2"].default_value = tuple(v * 0.55 for v in farbe) + (1,)
    br.inputs["Bias"].default_value = -0.2
    br.inputs["Mortar"].default_value = (*fuge, 1)
    br.offset = 0.5
    nt.links.new(vec.outputs["Vector"], br.inputs["Vector"])
    n = _rauschen(nt, 25)
    mx = nt.nodes.new("ShaderNodeMix")
    mx.data_type = "RGBA"
    mx.blend_type = "MULTIPLY"
    mx.inputs["Factor"].default_value = 0.6
    nt.links.new(br.outputs["Color"], mx.inputs[6])
    nt.links.new(n.outputs["Color"], mx.inputs[7])
    nt.links.new(mx.outputs[2], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.9
    # Fugen liegen tiefer als die Steine
    inv = nt.nodes.new("ShaderNodeMath")
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    nt.links.new(br.outputs["Fac"], inv.inputs[1])
    return _veredeln(m, hoehe=inv.outputs[0], relief=0.9, schmutz=0.6, russ=True)


def wellblech(name, farbe=(0.55, 0.57, 0.58), rauh=0.42, metall=0.6, skala=9.0, senkrecht=True):
    """Trapez- bzw. Wellblech: Rippen als helle und dunkle Streifen, dazu Schmutzschlieren."""
    if _fotos("wellblech"):
        satz = "wellblech_rost" if not senkrecht else "wellblech"
        return foto(name, satz, 1.3, tint=None if satz == "wellblech_rost" else farbe, metall=metall, relief=0.9, schmutz=0.6)
    m, nt, b = _knoten(name)
    tk = nt.nodes.new("ShaderNodeTexCoord")
    w = nt.nodes.new("ShaderNodeTexWave")
    w.wave_type = "BANDS"
    w.bands_direction = "X" if senkrecht else "Z"
    w.inputs["Scale"].default_value = skala
    w.inputs["Distortion"].default_value = 0.0
    nt.links.new(tk.outputs["Object"], w.inputs["Vector"])
    c = _mische(nt, w.outputs["Fac"], tuple(v * 0.72 for v in farbe), farbe)
    n = _rauschen(nt, 6, 4, 0.5)
    mx = nt.nodes.new("ShaderNodeMix")
    mx.data_type = "RGBA"
    mx.blend_type = "MULTIPLY"
    mx.inputs["Factor"].default_value = 0.3
    nt.links.new(c, mx.inputs[6])
    nt.links.new(n.outputs["Color"], mx.inputs[7])
    nt.links.new(mx.outputs[2], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rauh
    b.inputs["Metallic"].default_value = metall
    return _veredeln(m, hoehe=w.outputs["Fac"], relief=0.8, laeufer=(0.26, 0.12, 0.05))


def leuchten(name, farbe=(1.0, 0.42, 0.08), staerke=6.0):
    m, nt, b = _knoten(name)
    b.inputs["Base Color"].default_value = (*farbe, 1)
    b.inputs["Emission Color"].default_value = (*farbe, 1)
    b.inputs["Emission Strength"].default_value = staerke
    m["leuchtet"] = True
    return m


# ---------- Grundkörper ----------

def _fertig(ob, mat, fase=0.0, glatt=True):
    ob.data.materials.append(mat)
    if fase > 0:
        mod = ob.modifiers.new("Fase", "BEVEL")
        mod.width = fase
        mod.segments = 2
        mod.limit_method = "ANGLE"
    if glatt:
        mod = ob.modifiers.new("Normalen", "WEIGHTED_NORMAL")
        mod.keep_sharp = True
        for p in ob.data.polygons:
            p.use_smooth = True
    return ob


def quader(name, mat, groesse, ort, fase=0.02, drehung=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=ort, rotation=drehung)
    ob = bpy.context.object
    ob.name = name
    ob.scale = groesse
    bpy.ops.object.transform_apply(scale=True)
    # Rundungen an sehr dünnen Teilen (Sprossen, Rahmen) sieht man nicht, sie kosten nur Dreiecke
    return _fertig(ob, mat, fase if min(groesse) >= 0.06 else 0)


def flaeche(name, mat, punkte, dicke=0.03):
    """Ebene Fläche aus Eckpunkten (z. B. Giebel), mit Dicke."""
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(p) for p in punkte], [], [list(range(len(punkte)))])
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    mod = ob.modifiers.new("Dicke", "SOLIDIFY")
    mod.thickness = dicke
    mod.offset = 0
    return _fertig(ob, mat, 0)


def zylinder(name, mat, r, h, ort, ecken=24, r_oben=None, fase=0.015, drehung=(0, 0, 0), kappe=True):
    bpy.ops.mesh.primitive_cone_add(vertices=ecken, radius1=r, radius2=r if r_oben is None else r_oben, depth=h,
                                    location=ort, rotation=drehung, end_fill_type="NGON" if kappe else "NOTHING")
    ob = bpy.context.object
    ob.name = name
    return _fertig(ob, mat, fase)


def ring(name, mat, r, dicke, ort, ecken=32):
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=dicke, major_segments=ecken, minor_segments=8, location=ort)
    ob = bpy.context.object
    ob.name = name
    return _fertig(ob, mat, 0)


def rohr(name, mat, punkte, r):
    """Rohr entlang eines Polygonzugs (Kurve mit Querschnitt, danach in ein Netz umgewandelt)."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = r
    cu.bevel_resolution = 4
    cu.use_fill_caps = True
    sp = cu.splines.new("POLY")
    sp.points.add(len(punkte) - 1)
    for p, q in zip(sp.points, punkte):
        p.co = (*q, 1)
    ob = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target="MESH")
    ob = bpy.context.object
    return _fertig(ob, mat, 0)


def _richtung(a, b):
    from mathutils import Vector
    v = Vector(b) - Vector(a)
    return v.length, v.to_track_quat("Z", "Y").to_euler()


def zwischen(name, mat, a, b, r, ecken=16, fase=0.0):
    """Zylinder von Punkt a nach Punkt b (Stäbe, Streben, kurze Rohrstücke)."""
    l, rot = _richtung(a, b)
    m = tuple((p + q) / 2 for p, q in zip(a, b))
    return zylinder(name, mat, r, l, m, ecken=ecken, fase=fase, drehung=rot)


def rohr_rund(name, mat, punkte, r, bogen=None, flansche=True):
    """Rohr mit runden Bögen an den Knickpunkten und Flanschen an den Enden (und an jedem geraden Stück)."""
    from mathutils import Vector
    bogen = bogen if bogen is not None else max(r * 2.5, 0.06)
    P = [Vector(p) for p in punkte]
    pfad = [P[0]]
    for i in range(1, len(P) - 1):
        a, m, b = P[i - 1], P[i], P[i + 1]
        da, db = (a - m), (b - m)
        ra = min(bogen, da.length / 2)
        rb = min(bogen, db.length / 2)
        s0, s1 = m + da.normalized() * ra, m + db.normalized() * rb
        for k in range(9):  # quadratischer Bézier als Bogen
            t = k / 8
            pfad.append((1 - t) ** 2 * s0 + 2 * (1 - t) * t * m + t ** 2 * s1)
    pfad.append(P[-1])
    teile = [rohr(name, mat, [tuple(p) for p in pfad], r)]
    if flansche:
        for i, (a, b) in enumerate(((P[0], P[1]), (P[-1], P[-2]))):
            d = (b - a).normalized()
            teile.append(zwischen(name + "_flansch", mat, tuple(a + d * 0.005), tuple(a + d * 0.035), r * 1.55, ecken=20, fase=0.004))
    return teile


def ventil(name, mat, ort, r=0.06, hoch=0.08):
    """Handrad mit Speichen auf einer Spindel."""
    x, y, z = ort
    t = [zylinder(name + "_spindel", mat, 0.012, hoch, (x, y, z + hoch / 2), ecken=8, fase=0),
         ring(name + "_rad", mat, r, 0.009, (x, y, z + hoch), ecken=24)]
    for i in range(4):
        a = i / 4 * math.tau
        t.append(zwischen(name + "_speiche", mat, (x, y, z + hoch), (x + r * math.cos(a), y + r * math.sin(a), z + hoch), 0.006, ecken=6))
    return t


def gitterrost(name):
    """Gitterrost: dunkle Stäbe mit Zwischenräumen (als Farbe und Relief gebacken)."""
    m, nt, b = _knoten(name)
    tk = nt.nodes.new("ShaderNodeTexCoord")
    br = nt.nodes.new("ShaderNodeTexBrick")
    br.inputs["Scale"].default_value = 40
    br.inputs["Mortar Size"].default_value = 0.09
    br.inputs["Brick Width"].default_value = 0.25
    br.inputs["Row Height"].default_value = 0.25
    br.offset = 0.0
    br.inputs["Color1"].default_value = (0.03, 0.03, 0.03, 1)
    br.inputs["Color2"].default_value = (0.04, 0.035, 0.03, 1)
    br.inputs["Mortar"].default_value = (0.32, 0.32, 0.31, 1)
    nt.links.new(tk.outputs["Object"], br.inputs["Vector"])
    nt.links.new(br.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.55
    b.inputs["Metallic"].default_value = 0.7
    return _veredeln(m, hoehe=br.outputs["Fac"], relief=0.8, schmutz=0.7)


def buehne(name, rost_mat, rahmen_mat, x0, y0, x1, y1, z, gelaender_mat=None, offen=()):
    """Bühne: Gitterrost mit Randträgern und Fußleisten, optional Geländer an den Seiten (ohne die in offen: 'x0','x1','y0','y1')."""
    t = [quader(name, rost_mat, (x1 - x0, y1 - y0, 0.03), ((x0 + x1) / 2, (y0 + y1) / 2, z - 0.015), 0.004)]
    seiten = {"y0": [(x0, y0, z), (x1, y0, z)], "y1": [(x0, y1, z), (x1, y1, z)], "x0": [(x0, y0, z), (x0, y1, z)], "x1": [(x1, y0, z), (x1, y1, z)]}
    for k, (a, b) in seiten.items():
        t.append(zwischen(name + "_traeger", rahmen_mat, (a[0], a[1], z - 0.06), (b[0], b[1], z - 0.06), 0.02, ecken=8))
        if k not in offen:
            t.append(zwischen(name + "_fussleiste", rahmen_mat, (a[0], a[1], z + 0.04), (b[0], b[1], z + 0.04), 0.012, ecken=6))
            if gelaender_mat:
                t += gelaender(name + "_gel_" + k, gelaender_mat, [a, b], hoehe=0.4)
    return t


def treppe(name, mat, a, b, breite=0.3, stufe=0.11, gelaender_mat=None):
    """Gerade Treppe von a (unten) nach b (oben): Wangen, Stufen, Handlauf."""
    from mathutils import Vector
    A, B = Vector(a), Vector(b)
    d = B - A
    hor = Vector((d.x, d.y, 0)).normalized()
    quer = Vector((-hor.y, hor.x, 0)) * (breite / 2)
    t = []
    for s in (-1, 1):
        t.append(zwischen(name + "_wange", mat, tuple(A + quer * s), tuple(B + quer * s), 0.018, ecken=6))
    n = max(2, int(d.z / stufe))
    for i in range(1, n):
        p = A + d * (i / n)
        t.append(quader(name + "_stufe", mat, (breite, 0.09, 0.012), tuple(p), 0.003, drehung=(0, 0, math.atan2(hor.y, hor.x) + math.pi / 2)))
    if gelaender_mat:
        for s in (-1, 1):
            o = Vector((0, 0, 0.42))
            t.append(zwischen(name + "_hand", gelaender_mat, tuple(A + quer * s + o), tuple(B + quer * s + o), 0.012, ecken=8))
            for i in range(0, 4):
                p = A + d * (i / 3) + quer * s
                t.append(zwischen(name + "_pfosten", gelaender_mat, tuple(p), tuple(p + o), 0.01, ecken=6))
    return t


def fenster(name, glas, rahmen, mitte, breite, hoehe, achse="y", seite=1, sprossen=(3, 2), bank=None):
    """Industriefenster in einer Wand: Glas, Rahmen, Sprossen, Fensterbank.
    achse: Normalenrichtung der Wand ('x' oder 'y'), seite: +1/-1 (nach außen), mitte: Mittelpunkt auf der Wandfläche."""
    x, y, z = mitte
    t = []
    d = 0.02 * seite

    def q(nm, mat, bx, bz, dicke, dx=0.0, dz=0.0, aus=0.0):
        if achse == "y":
            return quader(nm, mat, (bx, dicke, bz), (x + dx, y + d + aus * seite, z + dz), 0.004)
        return quader(nm, mat, (dicke, bx, bz), (x + d + aus * seite, y + dx, z + dz), 0.004)
    t.append(q(name + "_glas", glas, breite, hoehe, 0.01, aus=-0.01))
    rb = 0.035
    for dz in (-hoehe / 2, hoehe / 2):
        t.append(q(name + "_rahmen", rahmen, breite + rb, rb, 0.03, dz=dz))
    for dx in (-breite / 2, breite / 2):
        t.append(q(name + "_rahmen", rahmen, rb, hoehe + rb, 0.03, dx=dx))
    nx, nz = sprossen
    for i in range(1, nx):
        t.append(q(name + "_sprosse", rahmen, 0.014, hoehe, 0.02, dx=-breite / 2 + breite * i / nx))
    for i in range(1, nz):
        t.append(q(name + "_sprosse", rahmen, breite, 0.014, 0.02, dz=-hoehe / 2 + hoehe * i / nz))
    if bank:
        t.append(q(name + "_bank", bank, breite + 0.08, 0.035, 0.07, dz=-hoehe / 2 - 0.04, aus=0.02))
    return t


def gelaender(name, mat, punkte, hoehe=0.42, r=0.016, pfosten=0.35):
    """Geländer: Handlauf, Knieleiste und Pfosten entlang eines Polygonzugs (z = Laufhöhe)."""
    teile = [rohr(name + "_hand", mat, [(x, y, z + hoehe) for x, y, z in punkte], r),
             rohr(name + "_knie", mat, [(x, y, z + hoehe * 0.5) for x, y, z in punkte], r * 0.8)]
    for (x0, y0, z0), (x1, y1, z1) in zip(punkte, punkte[1:]):
        l = math.dist((x0, y0), (x1, y1))
        n = max(1, round(l / pfosten))
        for i in range(n + 1):
            t = i / n
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            teile.append(zylinder(name + "_p", mat, r, hoehe, (x, y, z0 + hoehe / 2), ecken=8, fase=0))
    return teile


def leiter(name, mat, x, y, z0, z1, richtung=0.0, breite=0.32):
    c, s = math.cos(richtung), math.sin(richtung)
    teile = []
    for seite in (-1, 1):
        dx, dy = -s * breite / 2 * seite, c * breite / 2 * seite
        teile.append(rohr(name + "_holm", mat, [(x + dx, y + dy, z0), (x + dx, y + dy, z1)], 0.014))
    z = z0 + 0.15
    while z < z1:
        teile.append(rohr(name + "_sprosse", mat, [(x - s * breite / 2, y + c * breite / 2, z), (x + s * breite / 2, y - c * breite / 2, z)], 0.01))
        z += 0.25
    return teile


# ---------- Backen und Ausgeben ----------

def _verbinden(obs, name):
    bpy.ops.object.select_all(action="DESELECT")
    for o in obs:
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.convert(target="MESH")  # Modifikatoren anwenden
    for o in obs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]
    bpy.ops.object.join()
    ob = bpy.context.object
    ob.name = name
    return ob


def _abwickeln(ob):
    me = ob.data
    # Mitgebrachte Abwicklungen der Grundkörper entfernen: Backen, Vorschau und Ausgabe nutzen nur den Atlas
    while me.uv_layers:
        me.uv_layers.remove(me.uv_layers[0])
    uv = me.uv_layers.new(name="Atlas")
    me.uv_layers.active = uv
    uv.active_render = True
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.004, area_weight=0.0, correct_aspect=True, scale_to_bounds=True)
    bpy.ops.uv.pack_islands(margin=0.004, rotate=True)
    bpy.ops.object.mode_set(mode="OBJECT")


def _backe(ob, typ, groesse, filt=None, name="bake"):
    img = bpy.data.images.new(name, groesse, groesse, alpha=False, float_buffer=True)
    for m in ob.data.materials:
        nt = m.node_tree
        n = nt.nodes.new("ShaderNodeTexImage")
        n.image = img
        n.name = "BakeZiel"
        for k in nt.nodes:
            k.select = False
        n.select = True
        nt.nodes.active = n
    s = bpy.context.scene
    s.render.bake.margin = 6
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    kw = {"type": typ}
    if filt:
        kw["pass_filter"] = filt
    bpy.ops.object.bake(**kw)
    px = np.array(img.pixels[:], dtype=np.float32).reshape(groesse, groesse, 4)
    for m in ob.data.materials:
        nt = m.node_tree
        nt.nodes.remove(nt.nodes["BakeZiel"])
    return px


def _metall_als_emission(ob):
    """Metallwert über die Emission ausgeben, damit er gebacken werden kann."""
    for m in ob.data.materials:
        nt = m.node_tree
        b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
        out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
        e = nt.nodes.new("ShaderNodeEmission")
        e.inputs["Color"].default_value = (b.inputs["Metallic"].default_value,) * 3 + (1,)
        nt.links.new(e.outputs["Emission"], out.inputs["Surface"])


def _jpeg(px, pfad, qualitaet=88):
    from PIL import Image
    a = np.clip(px[::-1, :, :3] ** (1 / 2.2) if px.dtype == np.float32 else px[::-1, :, :3], 0, 1)
    Image.fromarray((a * 255).astype(np.uint8)).save(pfad, quality=qualitaet)


def _netz(ob, relativ=False):
    """Dreiecke mit getrennten Ecken je UV-Naht; Spiel-Koordinaten (Y oben)."""
    dg = bpy.context.evaluated_depsgraph_get()
    me = ob.evaluated_get(dg).to_mesh()
    if not relativ:
        me.transform(ob.matrix_world)
    me.calc_loop_triangles()
    uv = me.uv_layers.active.data if me.uv_layers else None
    pos, nor, uvs, idx, schluessel = [], [], [], [], {}
    for t in me.loop_triangles:
        ecken = []
        for li in t.loops:
            l = me.loops[li]
            v = me.vertices[l.vertex_index].co
            n = l.normal if hasattr(l, "normal") else t.normal
            u = uv[li].uv if uv else (0, 0)
            k = (round(v.x, 4), round(v.y, 4), round(v.z, 4), round(n.x, 3), round(n.y, 3), round(n.z, 3), round(u[0], 4), round(u[1], 4))
            i = schluessel.get(k)
            if i is None:
                i = len(pos) // 3
                schluessel[k] = i
                pos += [v.x, v.z, -v.y]
                nor += [n.x, n.z, -n.y]
                uvs += [u[0], u[1]]
            ecken.append(i)
        idx += ecken
    ob.evaluated_get(dg).to_mesh_clear()
    b64 = lambda a, t: base64.b64encode(np.array(a, dtype=t).tobytes()).decode()
    return {"p": b64(pos, np.float32), "n": b64(nor, np.float32), "u": b64(uvs, np.float32),
            "i": b64(idx, np.uint16 if len(pos) // 3 < 65536 else np.uint32), "n_ecken": len(pos) // 3, "n_dreiecke": len(idx) // 3}


def ausgeben(name, teile, leuchtend=(), bewegt=(), groesse=1024, punkte=None):
    """bewegt: [(objekte, drehpunkt, spielmaterial)] – drehen sich im Spiel um die senkrechte Achse durch den Drehpunkt.
    Sie werden nicht gebacken, sondern nutzen ein Material des Spiels (z. B. 'Lack_Dunkel')."""
    """teile: Objekte, die in den Atlas gebacken werden. leuchtend: Objekte mit Leuchtmaterial (bleiben einzeln, Spielmaterial 'Glut').
    bewegt: [(objekte, drehpunkt)] drehende Teile (bleiben einzeln, ebenfalls gebacken)."""
    os.makedirs(AUS, exist_ok=True)
    koerper = _verbinden(list(teile), name)
    _abwickeln(koerper)
    for o in leuchtend:
        o.hide_render = True
    farbe = _backe(koerper, "DIFFUSE", groesse, {"COLOR"}, "farbe")
    ao = _backe(koerper, "AO", groesse, None, "ao")
    rauh = _backe(koerper, "ROUGHNESS", groesse // 2, None, "rauh")
    bpy.context.scene.render.bake.normal_space = "TANGENT"
    normal = _backe(koerper, "NORMAL", groesse // 2, None, "normal")
    from PIL import Image
    Image.fromarray((np.clip(normal[::-1, :, :3], 0, 1) * 255).astype(np.uint8)).save(os.path.join(AUS, f"{name}_normal.jpg"), quality=92)
    # Verdeckung nur in echten Ecken deutlich, Grundhelligkeit leicht angehoben
    farbe[..., :3] *= (0.38 + 0.62 * ao[..., :3] ** 1.1) * 1.12
    _jpeg(farbe, os.path.join(AUS, f"{name}_farbe.jpg"))
    _metall_als_emission(koerper)
    metall = _backe(koerper, "EMIT", groesse // 2, None, "metall")
    orm = np.ones_like(rauh)
    orm[..., 1] = rauh[..., 0]
    orm[..., 2] = metall[..., 0]
    from PIL import Image
    Image.fromarray((np.clip(orm[::-1, :, :3], 0, 1) * 255).astype(np.uint8)).save(os.path.join(AUS, f"{name}_orm.jpg"), quality=90)
    teile_json = [{**_netz(koerper), "m": "Atlas"}]
    if leuchtend:
        glut = _verbinden(list(leuchtend), name + "_glut")
        leuchtend = [glut]
        teile_json.append({**_netz(glut), "m": "Glut"})
    for obs, dp, spielmat in bewegt:
        o = _verbinden(list(obs), name + "_dreh")
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.context.scene.cursor.location = dp
        bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
        teil = _netz(o, relativ=True)
        teile_json.append({**teil, "m": spielmat, "spin": 1, "piv": [round(dp[0], 3), round(dp[2], 3), round(-dp[1], 3)]})
    # Befestigungspunkte (Rauch, Lampe, Glut …) in Spiel-Koordinaten
    sp = {k: [round(x, 3), round(z, 3), round(-y, 3)] for k, (x, y, z) in (punkte or {}).items()}
    with open(os.path.join(AUS, f"{name}.json"), "w") as f:
        json.dump({"name": name, "teile": teile_json, "punkte": sp}, f)
    print(name, sum(t["n_dreiecke"] for t in teile_json), "Dreiecke")
    # Für die Vorschau: gebackene Texturen statt der prozeduralen Materialien, so wie im Spiel
    m, nt, b = _knoten("Atlas")
    nm = nt.nodes.new("ShaderNodeNormalMap")
    tn = nt.nodes.new("ShaderNodeTexImage")
    tn.image = bpy.data.images.load(os.path.join(AUS, f"{name}_normal.jpg"))
    tn.image.colorspace_settings.name = "Non-Color"
    nt.links.new(tn.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    for datei, eingang, farbig in ((f"{name}_farbe.jpg", "Base Color", True), (f"{name}_orm.jpg", None, False)):
        t = nt.nodes.new("ShaderNodeTexImage")
        t.image = bpy.data.images.load(os.path.join(AUS, datei))
        t.image.colorspace_settings.name = "sRGB" if farbig else "Non-Color"
        if eingang:
            nt.links.new(t.outputs["Color"], b.inputs[eingang])
        else:
            sp = nt.nodes.new("ShaderNodeSeparateColor")
            nt.links.new(t.outputs["Color"], sp.inputs["Color"])
            nt.links.new(sp.outputs["Green"], b.inputs["Roughness"])
            nt.links.new(sp.outputs["Blue"], b.inputs["Metallic"])
    koerper.data.materials.clear()
    koerper.data.materials.append(m)
    for o in leuchtend:
        o.hide_render = False
    return koerper


def vorschau(ziel, pfad, abstand=5.5, hoehe=3.2, winkel=0.75, z_mitte=1.2, aufloesung=(900, 700)):
    """Vorschaubild mit den gebackenen Texturen: Sonne, Himmel, Boden."""
    s = bpy.context.scene
    if "Ziel" in bpy.data.objects:  # zweite Ansicht: Licht und Boden stehen schon, nur die Kamera versetzen
        cam = s.camera
        cam.location = (abstand * math.cos(winkel), -abstand * math.sin(winkel), hoehe)
        bpy.data.objects["Ziel"].location = (0, 0, z_mitte)
        s.render.filepath = pfad
        bpy.ops.render.render(write_still=True)
        return
    w = bpy.data.worlds.new("Himmel")
    s.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.55, 0.65, 0.78, 1)
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.8
    bpy.ops.object.light_add(type="SUN", rotation=(math.radians(50), math.radians(10), math.radians(35)))
    bpy.context.object.data.energy = 4.0
    bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, -0.001))
    bpy.context.object.data.materials.append(beton("Boden", 0.5))
    bpy.ops.object.camera_add(location=(abstand * math.cos(winkel), -abstand * math.sin(winkel), hoehe))
    cam = bpy.context.object
    s.camera = cam
    rich = cam.constraints.new("TRACK_TO")
    leer = bpy.data.objects.new("Ziel", None)
    leer.location = (0, 0, z_mitte)
    bpy.context.collection.objects.link(leer)
    rich.target = leer
    rich.track_axis = "TRACK_NEGATIVE_Z"
    rich.up_axis = "UP_Y"
    cam.data.lens = 45
    s.render.resolution_x, s.render.resolution_y = aufloesung
    s.cycles.samples = 64
    s.render.filepath = pfad
    bpy.ops.render.render(write_still=True)


# ---------- Größere Bausteine für ganze Gebäude ----------

class Satz:
    """Gemeinsame Materialien, einmal je Gebäude angelegt."""
    def __init__(self):
        self.beton = beton("Beton", 0.58)
        self.beton_h = beton("Beton_Hell", 0.68)
        self.ziegel = ziegel("Ziegel", (0.42, 0.15, 0.09))
        self.ziegel_d = ziegel("Ziegel_Dunkel", (0.28, 0.1, 0.07))
        self.wand = wellblech("Wandblech", (0.56, 0.59, 0.58), skala=22)
        self.wand_blau = wellblech("Wandblech_Blau", (0.18, 0.3, 0.45), skala=22)
        self.wand_rot = wellblech("Wandblech_Rot", (0.45, 0.13, 0.08), skala=22)
        self.dach = wellblech("Dachblech", (0.3, 0.33, 0.36), skala=26, senkrecht=False)
        self.stahl = stahl("Stahl")
        self.stahl_d = stahl("Stahl_Dunkel", (0.15, 0.15, 0.16), 0.5)
        self.rost = rost("Rost")
        self.gelb = lack("Lack_Gelb", (0.78, 0.55, 0.06))
        self.blau = lack("Lack_Blau", (0.08, 0.2, 0.42))
        self.rot = lack("Lack_Rot", (0.5, 0.08, 0.05))
        self.gruen = lack("Lack_Gruen", (0.12, 0.3, 0.18))
        self.grau = lack("Lack_Grau", (0.4, 0.42, 0.43))
        self.weiss = lack("Lack_Weiss", (0.75, 0.76, 0.74))
        self.glas = lack("Glas", (0.14, 0.2, 0.24), 0.08, 0.3, False)
        self.rahmen = lack("Rahmen", (0.12, 0.13, 0.13), 0.5, 0.4, False)
        self.tor = wellblech("Torblech", (0.5, 0.36, 0.12), skala=30, senkrecht=False)
        self.rost_g = gitterrost("Gitterrost")
        self.glut = leuchten("Glut")
        self.licht = leuchten("Licht", (0.55, 0.85, 1.0), 4.0)


def halle(S, x0, x1, y0, y1, traufe, dach="sattel", wand=None, sockel=None, sockel_h=0.5, first=None,
          fenster_seiten=("y0", "y1"), stuetzen=None, z0=0.12):
    """Werkhalle: Sockel, Wand, Stützen, Fensterbänder, Dach ('sattel' First entlang X, 'pult', 'flach', 'shed'), Rinnen, Fallrohre."""
    wand = wand or S.wand
    sockel = sockel or S.ziegel
    W, D = x1 - x0, y1 - y0
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    t = [quader("Sockel", sockel, (W, D, sockel_h), (cx, cy, z0 + sockel_h / 2), 0.015),
         quader("Sockelgesims", S.beton_h, (W + 0.05, D + 0.05, 0.05), (cx, cy, z0 + sockel_h + 0.025), 0.008),
         quader("Wand", wand, (W - 0.04, D - 0.04, traufe - sockel_h - z0), (cx, cy, z0 + sockel_h + (traufe - sockel_h - z0) / 2), 0.01)]
    n = max(2, round(W / 0.7))
    if stuetzen:
        for i in range(n + 1):
            x = x0 + W * i / n
            for y in (y0 - 0.025, y1 + 0.025):
                t.append(quader("Stuetze", stuetzen, (0.06, 0.05, traufe - z0), (x, y, z0 + (traufe - z0) / 2), 0.006))
    for seite in fenster_seiten:
        y, s = (y0, -1) if seite == "y0" else (y1, 1)
        for i in range(n):
            x = x0 + W * (i + 0.5) / n
            t += fenster("Band", S.glas, S.rahmen, (x, y, (z0 + sockel_h + traufe) / 2 + 0.05), min(0.5, W / n * 0.7), 0.36, "y", s, (3, 1))
    if dach == "sattel":
        hf = first or traufe + D * 0.18
        neig = math.atan2(hf - traufe, D / 2)
        for s in (-1, 1):
            t.append(quader("Dach", S.dach, (W + 0.16, D / 2 / math.cos(neig) + 0.1, 0.04), (cx, cy + s * D / 4, (traufe + hf) / 2 + 0.03), 0.006, drehung=(-s * neig, 0, 0)))
            t.append(zwischen("Rinne", S.stahl, (x0 - 0.06, cy + s * (D / 2 + 0.07), traufe - 0.01), (x1 + 0.06, cy + s * (D / 2 + 0.07), traufe - 0.01), 0.032, ecken=10))
        for x in (x0 + 0.01, x1 - 0.01):
            t.append(flaeche("Giebel", wand, [(x, y0, traufe), (x, y1, traufe), (x, cy, hf)], 0.03))
    elif dach == "pult":
        hf = first or traufe + D * 0.15
        neig = math.atan2(hf - traufe, D)
        t.append(quader("Dach", S.dach, (W + 0.16, D / math.cos(neig) + 0.12, 0.04), (cx, cy, (traufe + hf) / 2 + 0.03), 0.006, drehung=(-neig, 0, 0)))
        for x in (x0 + 0.01, x1 - 0.01):
            t.append(flaeche("Giebel", wand, [(x, y0, traufe), (x, y1, traufe), (x, y1, hf)], 0.03))
        t.append(quader("Wandaufsatz", wand, (W - 0.04, 0.04, hf - traufe), (cx, y1 - 0.02, traufe + (hf - traufe) / 2), 0.004))
    elif dach == "flach":
        t.append(quader("Attika", S.beton_h, (W + 0.04, D + 0.04, 0.12), (cx, cy, traufe + 0.06), 0.012))
        t.append(quader("Flachdach", S.beton, (W - 0.1, D - 0.1, 0.04), (cx, cy, traufe + 0.04), 0.004))
    elif dach == "shed":
        z = 3
        tiefe = D / z
        for k in range(z):
            ya = y0 + k * tiefe
            h = 0.45
            neig = math.atan2(h, tiefe * 0.8)
            t.append(quader("Shed", S.dach, (W + 0.08, math.hypot(h, tiefe * 0.8), 0.04), (cx, ya + tiefe * 0.4, traufe + h / 2 + 0.02), 0.006, drehung=(neig, 0, 0)))
            t.append(quader("Shedglas", S.glas, (W - 0.08, 0.03, h * 0.9), (cx, ya + tiefe * 0.8 + 0.02, traufe + h / 2), 0.004, drehung=(math.radians(-12), 0, 0)))
            for x in (x0 + 0.03, x1 - 0.03):
                t.append(flaeche("Shedgiebel", wand, [(x, ya, traufe), (x, ya + tiefe * 0.8, traufe), (x, ya + tiefe * 0.8, traufe + h)], 0.04))
    for x in (x0 + 0.05, x1 - 0.05):
        for y in (y0 - 0.07, y1 + 0.07):
            t.append(zylinder("Fallrohr", S.stahl, 0.026, traufe - z0, (x, y, z0 + (traufe - z0) / 2), ecken=10))
    return t


def tor(S, x, y, breite=1.0, hoehe=1.15, achse="x", seite=1, z0=0.12):
    """Rolltor in der Wand mit Rahmen, Wickelwelle, Rammschutz und Leuchte. achse: Wandnormale."""
    def q(nm, mat, b, d, h, dx=0.0, dz=0.0, aus=0.0):
        if achse == "x":
            return quader(nm, mat, (d, b, h), (x + aus * seite, y + dx, z0 + dz), 0.008)
        return quader(nm, mat, (b, d, h), (x + dx, y + aus * seite, z0 + dz), 0.008)
    t = [q("Torrahmen", S.gelb, breite + 0.15, 0.07, hoehe + 0.12, dz=(hoehe + 0.12) / 2, aus=0.02),
         q("Tor", S.tor, breite, 0.04, hoehe, dz=hoehe / 2, aus=0.045),
         q("Leuchte", S.stahl_d, 0.26, 0.14, 0.06, dz=hoehe + 0.3, aus=0.09)]
    rot = (math.radians(90), 0, 0) if achse == "x" else (0, math.radians(90), 0)
    wx, wy = (x + 0.08 * seite, y) if achse == "x" else (x, y + 0.08 * seite)
    t.append(zylinder("Torwelle", S.stahl_d, 0.065, breite + 0.15, (wx, wy, z0 + hoehe + 0.12), ecken=16, drehung=rot))
    for d in (-1, 1):
        px, py = (x + 0.18 * seite, y + d * (breite / 2 + 0.12)) if achse == "x" else (x + d * (breite / 2 + 0.12), y + 0.18 * seite)
        t.append(zylinder("Rammschutz", S.gelb, 0.038, 0.45, (px, py, z0 + 0.22), ecken=14, fase=0.006))
    return t


def tank(S, x, y, r, h, z0=0.12, mat=None, dach="kuppel", beine=True, leiter=True):
    """Stehender Tank auf Füßen mit Bändern, Kuppel oder Kegeldach, Leiter und Geländer oben."""
    mat = mat or S.weiss
    zb = z0 + (0.25 if beine else 0)
    t = [zylinder("Tank", mat, r, h, (x, y, zb + h / 2), ecken=32)]
    for i in range(1, int(h / 0.35) + 1):
        t.append(zylinder("Tankband", S.stahl_d, r + 0.008, 0.025, (x, y, zb + i * h / (int(h / 0.35) + 1)), ecken=32, fase=0))
    if dach == "kuppel":
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=12, radius=r, location=(x, y, zb + h))
        k = bpy.context.object
        k.scale = (1, 1, 0.35)
        bpy.ops.object.transform_apply(scale=True)
        t.append(_fertig(k, mat, 0))
    else:
        t.append(zylinder("Tankdach", S.stahl_d, r + 0.02, r * 0.4, (x, y, zb + h + r * 0.2), ecken=32, r_oben=0.04))
    if beine:
        for i in range(4):
            a = i / 4 * math.tau + math.pi / 4
            t.append(zylinder("Tankfuss", S.stahl_d, 0.035, 0.3, (x + r * 0.75 * math.cos(a), y + r * 0.75 * math.sin(a), z0 + 0.15), ecken=8))
    if leiter:
        t += leiter_rohr(S, x + r + 0.05, y, zb, zb + h)
    return t


def leiter_rohr(S, x, y, z0, z1):
    return leiter("Leiter", S.gelb, x, y, z0, z1, richtung=0, breite=0.22)


def kamin(S, x, y, r, h, z0=0.12, mat=None, baender=3):
    """Schornstein: verjüngt, mit Stahlbändern und Kopf."""
    mat = mat or S.ziegel
    t = [zylinder("Kamin", mat, r, h, (x, y, z0 + h / 2), ecken=24, r_oben=r * 0.78)]
    for i in range(1, baender + 1):
        z = z0 + h * i / (baender + 1)
        t.append(zylinder("Kaminband", S.stahl_d, r - (r * 0.22) * (z - z0) / h + 0.01, 0.035, (x, y, z), ecken=24, fase=0.004))
    t.append(zylinder("Kaminkopf", S.stahl_d, r * 0.88, 0.07, (x, y, z0 + h + 0.03), ecken=24, r_oben=r * 0.8, fase=0.005))
    return t


def luefter(S, x, y, z, r=0.18):
    """Dachlüfter: Gehäuse (fest) und Haube mit Schaufeln (dreht). Rückgabe: (feste Teile, drehende Teile, Drehpunkt)."""
    fest = [zylinder("Luefterhaus", S.stahl, r + 0.02, 0.2, (x, y, z + 0.1), ecken=24)]
    dreh = [zylinder("Luefterkappe", S.stahl_d, r, 0.07, (x, y, z + 0.25), ecken=24, r_oben=0.05)]
    for i in range(8):
        a = i / 8 * math.tau
        dreh.append(quader("Schaufel", S.stahl_d, (r * 0.7, 0.015, 0.08), (x + r * 0.62 * math.cos(a), y + r * 0.62 * math.sin(a), z + 0.17), 0.0, drehung=(0, 0, a + 0.6)))
    return fest, dreh, (x, y, z + 0.25)


def fundament(S, groesse, h=0.12):
    return [quader("Fundament", S.beton, (groesse - 0.06, groesse - 0.06, h), (0, 0, h / 2), 0.03)]


def g2b(p):
    """Spiel-Koordinaten (x, y, z) in Blender-Koordinaten."""
    return (p[0], -p[2], p[1])
