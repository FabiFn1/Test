"""Zentrifuge (3 x 3): Halle mit Kaskade aus Gaszentrifugen, Strahlenschutz-Warnung, Kühlaggregat, Deckel mit Licht (vom Spiel)."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403
from gemeinsam import _fertig  # noqa: E402,F401

leeren()
S = Satz()
T = fundament(S, 3)
T += halle(S, -1.42, -0.2, -1.3, 1.3, 1.45, dach="flach", wand=S.weiss, sockel=S.beton_h, sockel_h=0.3, fenster_seiten=("y0",))
for i in range(3):
    for j in range(2):
        x, y = 0.25 + i * 0.38, -0.85 + j * 0.45
        T.append(zylinder("Zentrifuge", S.weiss, 0.12, 0.9, (x, y, 0.57), ecken=24))
        T.append(zylinder("Zkappe", S.blau, 0.13, 0.08, (x, y, 1.06), ecken=24, fase=0.008))
T += rohr_rund("Sammelleitung", S.stahl, [(0.15, -1.15, 1.2), (1.2, -1.15, 1.2), (1.2, -0.3, 1.2)], 0.035)
dx, dy, dz = g2b((0.52, 1.08, 0))
T.append(zylinder("Hauptzentrifuge", S.stahl, 0.3, dz - 0.12, (dx, dy, 0.12 + (dz - 0.12) / 2), ecken=32))
T.append(zylinder("Deckelring", S.gelb, 0.32, 0.05, (dx, dy, dz - 0.02), ecken=32, fase=0.006))
T.append(quader("Kuehlung", S.grau, (0.45, 0.6, 0.4), (0.9, 1.0, 0.32), 0.02))
T.append(quader("Warnschild", S.gelb, (0.3, 0.03, 0.3), (-0.8, -1.33, 1.05), 0.006))
glut = [zylinder("Licht", S.licht, 0.22, 0.02, (dx, dy, dz + 0.01), ecken=32, fase=0)]
ausgeben("zentrifuge", T, leuchtend=glut)
vorschau(None, os.path.join(AUS, "zentrifuge_vorschau.png"), abstand=7, hoehe=4.4, z_mitte=0.8)
