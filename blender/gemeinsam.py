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
    r.color_ramp.elements[0].position = 0.56
    r.color_ramp.elements[1].position = 0.7
    nt.links.new(g.outputs["Pointiness"], r.inputs["Fac"])
    return r.outputs["Color"]


def lack(name, farbe, rauh=0.45, metall=0.3, verschleiss=True):
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
    return m


def stahl(name, farbe=(0.30, 0.31, 0.32), rauh=0.38):
    m, nt, b = _knoten(name)
    n = _rauschen(nt, 40, 8, 0.7)
    nt.links.new(_mische(nt, n.outputs["Fac"], tuple(v * 0.7 for v in farbe), farbe), b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rauh
    b.inputs["Metallic"].default_value = 0.85
    return m


def rost(name):
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
    return m


def beton(name, hell=0.55):
    m, nt, b = _knoten(name)
    n = _rauschen(nt, 14, 9, 0.65)
    c = _mische(nt, n.outputs["Fac"], (hell * 0.78, hell * 0.77, hell * 0.74), (hell, hell * 0.99, hell * 0.95))
    nt.links.new(c, b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.88
    b.inputs["Metallic"].default_value = 0.0
    return m


def ziegel(name, farbe=(0.42, 0.14, 0.08), fuge=(0.48, 0.46, 0.43), skala=11.0, radius=0.56):
    """Mauerwerk. radius > 0: zylindrisch um die Z-Achse des Teils (für runde Schächte), sonst eben (Wände entlang X/Y)."""
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
    br.inputs["Color2"].default_value = tuple(v * 0.72 for v in farbe) + (1,)
    br.inputs["Mortar"].default_value = (*fuge, 1)
    br.offset = 0.5
    nt.links.new(vec.outputs["Vector"], br.inputs["Vector"])
    n = _rauschen(nt, 25)
    mx = nt.nodes.new("ShaderNodeMix")
    mx.data_type = "RGBA"
    mx.blend_type = "MULTIPLY"
    mx.inputs["Factor"].default_value = 0.35
    nt.links.new(br.outputs["Color"], mx.inputs[6])
    nt.links.new(n.outputs["Color"], mx.inputs[7])
    nt.links.new(mx.outputs[2], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.9
    return m


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
    return _fertig(ob, mat, fase)


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


def _netz(ob):
    """Dreiecke mit getrennten Ecken je UV-Naht; Spiel-Koordinaten (Y oben)."""
    dg = bpy.context.evaluated_depsgraph_get()
    me = ob.evaluated_get(dg).to_mesh()
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
    farbe[..., :3] *= (0.35 + 0.65 * ao[..., :3])
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
    # Befestigungspunkte (Rauch, Lampe, Glut …) in Spiel-Koordinaten
    sp = {k: [round(x, 3), round(z, 3), round(-y, 3)] for k, (x, y, z) in (punkte or {}).items()}
    with open(os.path.join(AUS, f"{name}.json"), "w") as f:
        json.dump({"name": name, "teile": teile_json, "punkte": sp}, f)
    print(name, sum(t["n_dreiecke"] for t in teile_json), "Dreiecke")
    # Für die Vorschau: gebackene Texturen statt der prozeduralen Materialien, so wie im Spiel
    m, nt, b = _knoten("Atlas")
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
