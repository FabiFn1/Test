"""Kraftwerk (3 x 3): Kesselhaus aus Backstein mit hohen Fenstern, Kohlebunker mit Schrägband, Schornstein (Rauch), Kühlturm-Abdampf, Transformator."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 3)
T += halle(S, -1.42, 0.45, -1.3, 1.1, 2.3, dach="sattel", wand=S.ziegel, sockel=S.ziegel_d, sockel_h=0.5)
rx, ry, rz = g2b((0.5, 3.85, -0.95))
T += kamin(S, rx, ry, 0.22, rz - 0.15, mat=S.ziegel, baender=4)
dx, dy, dz = g2b((0.72, 2.7, 0.66))
T.append(zylinder("Abdampfrohr", S.stahl, 0.09, dz - 0.12, (dx, dy, 0.12 + (dz - 0.12) / 2), ecken=16))
T.append(zylinder("Bunker", S.stahl_d, 0.38, 0.6, (1.0, 0.8, 1.35), ecken=4, r_oben=0.5, drehung=(0, 0, math.radians(45))))
for dx2, dy2 in ((0.75, 0.55), (1.25, 0.55), (0.75, 1.05), (1.25, 1.05)):
    T.append(zylinder("Bunkerstuetze", S.gelb, 0.03, 1.05, (dx2, dy2, 0.62), ecken=8))
T.append(zwischen("Schraegband", S.stahl_d, (1.3, -0.8, 0.2), (1.0, 0.6, 1.65), 0.07, ecken=4))
T.append(quader("Trafo", S.grau, (0.5, 0.4, 0.5), (1.0, -1.1, 0.37), 0.02))
for i in range(3):
    T.append(zylinder("Isolator", S.weiss, 0.03, 0.18, (0.85 + i * 0.15, -1.1, 0.71), ecken=10, r_oben=0.02, fase=0))
ausgeben("kraftwerk", T)
vorschau(None, os.path.join(AUS, "kraftwerk_vorschau.png"), abstand=8, hoehe=5.0, z_mitte=1.4)
