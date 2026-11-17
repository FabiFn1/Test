"""Raffinerie (3 x 3): Destillationskolonnen, Kugeltank, Rohrbrücken, Fackelturm mit Fackel, Pumpenstand, Steuerhaus."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403
from gemeinsam import _fertig  # noqa: E402,F401

leeren()
S = Satz()
T = fundament(S, 3)
fx, fy, fz = g2b((-1.2, 4.38, -1.2))
T.append(zwischen("Fackelturm", S.rot, (fx, fy, 0.12), (fx, fy, fz - 0.1), 0.06, ecken=12))
for z in (1.2, 2.4, 3.6):
    for a in (0, 2.1, 4.2):
        T.append(zwischen("Abspannung", S.stahl_d, (fx, fy, z), (fx + 0.35 * math.cos(a), fy + 0.35 * math.sin(a), 0.12), 0.006, ecken=4))
T.append(zylinder("Fackelkopf", S.stahl_d, 0.09, 0.12, (fx, fy, fz - 0.06), ecken=12))
for i, (x, y, h, r) in enumerate(((-0.1, -0.5, 3.3, 0.24), (0.55, -0.5, 2.6, 0.2))):
    T.append(zylinder("Kolonne", S.stahl, r, h, (x, y, 0.12 + h / 2), ecken=24))
    for k in range(1, 6):
        T.append(zylinder("Kolonnenring", S.stahl_d, r + 0.015, 0.035, (x, y, 0.12 + h * k / 6), ecken=24, fase=0.004))
    T += buehne(f"Kolonnenbuehne{i}", S.rost_g, S.gelb, x - r - 0.15, y - r - 0.15, x + r + 0.15, y + r + 0.15, 0.12 + h * 0.7, S.gelb)
bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.42, location=(0.85, 0.8, 0.85))
T.append(_fertig(bpy.context.object, S.weiss, 0))
for i in range(6):
    a = i / 6 * math.tau
    T.append(zwischen("Kugelbein", S.stahl_d, (0.85 + 0.38 * math.cos(a), 0.8 + 0.38 * math.sin(a), 0.12), (0.85 + 0.35 * math.cos(a), 0.8 + 0.35 * math.sin(a), 0.85), 0.025, ecken=8))
T += rohr_rund("Leitung1", S.stahl, [(-0.1, -0.5, 3.0), (-0.1, 0.3, 3.0), (0.85, 0.3, 1.5), (0.85, 0.8, 1.27)], 0.045)
T += rohr_rund("Leitung2", S.rot, [(0.55, -0.5, 1.0), (1.3, -0.5, 1.0), (1.3, 0.3, 1.0)], 0.04)
T += halle(S, -1.42, -0.6, 0.4, 1.4, 1.1, dach="flach", wand=S.wand, sockel=S.beton_h, sockel_h=0.3, fenster_seiten=("y0",))
T.append(quader("Pumpenstand", S.blau, (0.5, 0.3, 0.25), (1.0, -1.1, 0.25), 0.015))
glut = [zylinder("Flamme", S.glut, 0.06, 0.12, (fx, fy, fz + 0.04), ecken=12, r_oben=0.01, fase=0)]
ausgeben("raffinerie", T, leuchtend=glut)
vorschau(None, os.path.join(AUS, "raffinerie_vorschau.png"), abstand=8.5, hoehe=5.2, z_mitte=1.7)
