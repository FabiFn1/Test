"""Kernkraftwerk (5 x 5): zwei Kühltürme mit Dampf, Reaktorkuppel, Turbinenhaus, Maschinenhaus mit Schornstein, Trafo."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403
from gemeinsam import _fertig  # noqa: E402,F401

leeren()
S = Satz()
T = fundament(S, 5)
for p in ((1.42, 4.2, 1.28), (1.42, 4.2, -1.22)):
    x, y, z = g2b(p)
    bpy.ops.mesh.primitive_cone_add(vertices=40, radius1=0.95, radius2=0.6, depth=z - 0.12, location=(x, y, 0.12 + (z - 0.12) / 2), end_fill_type="NOTHING")
    kt = bpy.context.object
    for v in kt.data.vertices:  # Hyperboloid: in der Mitte eingeschnürt
        t = (v.co.z + (z - 0.12) / 2) / (z - 0.12)
        f = 1 - 0.28 * math.sin(math.pi * min(1, t * 1.25))
        v.co.x *= f
        v.co.y *= f
    m = kt.modifiers.new("Wand", "SOLIDIFY")
    m.thickness = 0.04
    T.append(_fertig(kt, S.beton_h, 0))
    for k in range(10):
        a = k / 10 * math.tau
        T.append(zwischen("Kuehlturmfuss", S.beton, (x + 0.92 * math.cos(a), y + 0.92 * math.sin(a), 0.12), (x + 0.86 * math.cos(a), y + 0.86 * math.sin(a), 0.4), 0.04, ecken=6))
T.append(zylinder("Reaktor", S.beton_h, 0.75, 1.4, (-1.0, -0.6, 0.82), ecken=40))
bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=16, radius=0.75, location=(-1.0, -0.6, 1.52))
k = bpy.context.object
k.scale = (1, 1, 0.75)
bpy.ops.object.transform_apply(scale=True)
T.append(_fertig(k, S.beton_h, 0))
T += halle(S, -2.4, 0.2, 0.5, 2.4, 1.6, dach="flach", wand=S.wand_blau, sockel=S.beton_h, sockel_h=0.4, stuetzen=S.grau)
T += kamin(S, *g2b((-2.15, 4.5, -2.15))[:2], 0.12, 4.2, mat=S.weiss, baender=4)
T.append(quader("Trafo", S.grau, (0.7, 0.5, 0.6), (-0.3, -1.9, 0.42), 0.02))
T += rohr_rund("Dampfleitung", S.stahl, [(-1.0, 0.1, 1.2), (-1.0, 0.55, 1.2)], 0.08)
ausgeben("kernkraftwerk", T, groesse=1536)
vorschau(None, os.path.join(AUS, "kernkraftwerk_vorschau.png"), abstand=11, hoehe=7, z_mitte=1.8)
