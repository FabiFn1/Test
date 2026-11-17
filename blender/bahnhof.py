"""Bahnhof (3 x 3): Güterbahnsteig mit Vordach, Backstein-Güterschuppen mit Schiebetor, Laderampe, Prellbock, Lampe."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 3)
T += halle(S, -1.42, 0.3, 0.3, 1.38, 1.3, dach="sattel", wand=S.ziegel, sockel=S.ziegel_d, sockel_h=0.35, fenster_seiten=("y1",))
T.append(quader("Bahnsteig", S.beton_h, (2.8, 0.9, 0.35), (0, -0.3, 0.29), 0.02))
for x in (-1.2, -0.4, 0.4, 1.2):
    T.append(zwischen("Dachstuetze", S.stahl_d, (x, -0.55, 0.46), (x, -0.55, 1.35), 0.03, ecken=8))
T.append(quader("Bahnsteigdach", S.dach, (2.8, 1.0, 0.04), (0, -0.4, 1.4), 0.006, drehung=(math.radians(6), 0, 0)))
T.append(quader("Schiebetor", S.tor, (0.9, 0.04, 0.85), (-0.5, 0.28, 0.85), 0.006))
T.append(quader("Prellbock", S.rot, (0.15, 0.6, 0.3), (-1.35, -1.15, 0.27), 0.015))
for i in range(4):
    T.append(quader("Kiste", S.grau if i % 2 else S.gelb, (0.25, 0.25, 0.22), (0.4 + i * 0.3, -0.25, 0.58), 0.012))
ausgeben("bahnhof", T)
vorschau(None, os.path.join(AUS, "bahnhof_vorschau.png"), abstand=7, hoehe=4.4, z_mitte=0.8)
