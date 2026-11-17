"""Solarpark (3 x 3): Reihen aufgeständerter Solarmodule mit Rahmen, Wechselrichterhaus, Kabelkanal."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 3)
SOL = lack("Solar", (0.04, 0.08, 0.16), 0.15, 0.6, False)
for r in range(3):
    y = -1.0 + r * 0.95
    for i in range(3):
        x = -0.95 + i * 0.95
        T.append(quader("Modul", SOL, (0.88, 0.62, 0.03), (x, y, 0.5), 0.006, drehung=(math.radians(-25), 0, 0)))
        T.append(quader("Modulrahmen", S.stahl, (0.9, 0.64, 0.02), (x, y, 0.48), 0.004, drehung=(math.radians(-25), 0, 0)))
        for dx in (-0.35, 0.35):
            T.append(zwischen("Staender", S.stahl, (x + dx, y - 0.15, 0.12), (x + dx, y - 0.15, 0.38), 0.018, ecken=6))
            T.append(zwischen("Staender", S.stahl, (x + dx, y + 0.18, 0.12), (x + dx, y + 0.18, 0.58), 0.018, ecken=6))
lx, ly, _ = g2b((1.3, 0.62, -1.3))
T.append(quader("Wechselrichter", S.grau, (0.3, 0.25, 0.42), (lx, ly, 0.33), 0.015))
T.append(quader("Kabelkanal", S.beton_h, (2.8, 0.08, 0.05), (0, -1.42, 0.14), 0.004))
ausgeben("solar", T)
vorschau(None, os.path.join(AUS, "solar_vorschau.png"), abstand=6.5, hoehe=4.6, z_mitte=0.4)
