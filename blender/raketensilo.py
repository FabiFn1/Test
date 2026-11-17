"""Raketensilo (5 x 5): Startplatz mit Flammenschacht, Startturm aus Fachwerk mit Versorgungsarmen, Tanks, Bunker, Scheinwerfermasten."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 5)
T.append(quader("Startplatte", S.beton_h, (4.2, 4.2, 0.25), (0, 0, 0.24), 0.04))
T.append(zylinder("Flammenschacht", S.stahl_d, 0.7, 0.05, (0, 0, 0.38), ecken=32, fase=0))
for i in range(4):
    a = i / 4 * math.tau + math.pi / 4
    T.append(quader("Halteklammer", S.stahl_d, (0.3, 0.12, 0.6), (0.62 * math.cos(a), 0.62 * math.sin(a), 0.65), 0.01, drehung=(0, 0, a)))
tx = 1.85
for dx in (-0.25, 0.25):
    for dy in (-0.25, 0.25):
        T.append(zwischen("Turmstiel", S.rot, (tx + dx, dy, 0.36), (tx + dx * 0.7, dy * 0.7, 6.9), 0.04, ecken=8))
for k in range(12):
    z0, z1 = 0.36 + k * 0.54, 0.36 + (k + 1) * 0.54
    s0, s1 = 0.25 - 0.075 * k / 12, 0.25 - 0.075 * (k + 1) / 12
    for a, b in (((-1, -1), (1, -1)), ((1, -1), (1, 1)), ((1, 1), (-1, 1)), ((-1, 1), (-1, -1))):
        T.append(zwischen("Turmstrebe", S.rot, (tx + a[0] * s0, a[1] * s0, z0), (tx + b[0] * s1, b[1] * s1, z1), 0.014, ecken=6))
for z in (2.5, 4.5, 6.2):
    T.append(quader("Versorgungsarm", S.gelb, (1.2, 0.12, 0.1), (tx - 0.75, 0, z), 0.01))
T.append(quader("Turmkopf", S.stahl_d, (0.5, 0.5, 0.3), (tx, 0, 7.05), 0.02))
for y in (-1.6, 1.6):
    T += tank(S, -1.5, y, 0.32, 1.0, mat=S.weiss, beine=True, leiter=True)
T.append(quader("Bunker", S.beton, (1.0, 0.8, 0.5), (-1.6, 0, 0.5), 0.05))
for p in ((-2.2, 6.44, -2.2), (2.2, 6.44, 2.2)):
    x, y, z = g2b(p)
    T.append(zwischen("Scheinwerfermast", S.stahl, (x, y, 0.12), (x, y, z - 0.1), 0.035, ecken=8))
    T.append(quader("Scheinwerfer", S.stahl_d, (0.3, 0.15, 0.2), (x, y, z), 0.015))
ausgeben("raketensilo", T, groesse=1536)
vorschau(None, os.path.join(AUS, "raketensilo_vorschau.png"), abstand=13, hoehe=8, z_mitte=2.8)
