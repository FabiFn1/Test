"""Lagerkiste (2 x 2): kleines Lager aus Wellblech-Containern mit Regal, Paletten und Kisten, Leuchte."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 2)
T.append(quader("Container", S.wand_blau, (1.6, 0.8, 0.9), (0, 0.45, 0.6), 0.02))
for x in (-0.78, 0.78):
    T.append(quader("Eckbeschlag", S.stahl_d, (0.06, 0.82, 0.92), (x, 0.45, 0.6), 0.006))
T.append(quader("Containertuer", S.stahl_d, (0.03, 0.7, 0.8), (0.8, 0.45, 0.58), 0.004))
T.append(quader("Regal", S.gelb, (1.3, 0.35, 0.9), (0, -0.45, 0.58), 0.01))
for i in range(4):
    for z in (0.32, 0.65):
        T.append(quader("Kiste", [S.grau, S.rot, S.gelb, S.gruen][(i + int(z * 10)) % 4], (0.26, 0.28, 0.22), (-0.48 + i * 0.32, -0.45, z + 0.08), 0.012))
T.append(quader("Palette", S.beton_h, (0.4, 0.4, 0.06), (0.65, -0.6, 0.15), 0.004))
ausgeben("lagerkiste", T)
vorschau(None, os.path.join(AUS, "lagerkiste_vorschau.png"), abstand=4.5, hoehe=2.8, z_mitte=0.5)
