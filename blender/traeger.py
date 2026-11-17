"""Sammelstelle (2 x 2): Holzschuppen mit rotem Blechdach, offene Front mit Kisten und Sackkarre, Tafel."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 2)
HOLZ = beton("Holz", 0.45)
for x in (-0.8, 0.8):
    for y in (-0.6, 0.7):
        T.append(zwischen("Pfosten", HOLZ, (x, y, 0.12), (x, y, 1.05 if y > 0 else 0.9), 0.04, ecken=6))
T.append(quader("Rueckwand", HOLZ, (1.6, 0.05, 0.9), (0, 0.72, 0.58), 0.006))
T.append(quader("Dach", S.wand_rot, (1.8, 1.55, 0.04), (0, 0.05, 1.03), 0.006, drehung=(math.radians(-6), 0, 0)))
for i in range(5):
    T.append(quader("Kiste", HOLZ, (0.25, 0.25, 0.22), (-0.6 + i * 0.3, 0.35, 0.24 + (i % 2) * 0.22), 0.012))
T.append(quader("Tafel", S.rahmen, (0.4, 0.04, 0.3), (0.55, -0.62, 0.7), 0.006))
ausgeben("traeger", T)
vorschau(None, os.path.join(AUS, "traeger_vorschau.png"), abstand=4.5, hoehe=2.8, z_mitte=0.5)
