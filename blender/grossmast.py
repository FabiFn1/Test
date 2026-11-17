"""Hochspannungsmast (1 x 1): Gittermast mit zwei Traversen und Isolatorketten, Betonfüße."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 1)
T = []
for dx in (-0.3, 0.3):
    for dy in (-0.3, 0.3):
        T.append(zylinder("Fuss", S.beton, 0.06, 0.12, (dx, dy, 0.06), ecken=8))
        T.append(zwischen("Eckstiel", S.stahl, (dx, dy, 0.1), (dx * 0.25, dy * 0.25, 5.7), 0.022, ecken=6))
for k in range(9):
    z0, z1 = 0.1 + k * 0.62, 0.1 + (k + 1) * 0.62
    s0, s1 = 0.3 - 0.225 * k / 9, 0.3 - 0.225 * (k + 1) / 9
    for a, b in (((-1, -1), (1, -1)), ((1, -1), (1, 1)), ((1, 1), (-1, 1)), ((-1, 1), (-1, -1))):
        T.append(zwischen("Strebe", S.stahl, (a[0] * s0, a[1] * s0, z0), (b[0] * s1, b[1] * s1, z1), 0.009, ecken=4))
for z, w in ((4.6, 0.88), (5.4, 0.6)):
    T.append(quader("Traverse", S.stahl, (2 * w, 0.06, 0.06), (0, 0, z), 0.0))
    for x in (-w + 0.05, w - 0.05):
        T.append(zylinder("Isolatorkette", S.weiss, 0.03, 0.3, (x, 0, z - 0.17), ecken=10, fase=0))
T.append(quader("Warnschild", S.gelb, (0.15, 0.02, 0.15), (0, -0.2, 1.6), 0.0))
ausgeben("grossmast", T, groesse=512)
vorschau(None, os.path.join(AUS, "grossmast_vorschau.png"), abstand=6.5, hoehe=3.5, z_mitte=2.8)
