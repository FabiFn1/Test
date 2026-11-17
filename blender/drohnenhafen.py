"""Drohnenhafen (3 x 3): Landeplattform mit Markierung auf Stützen, Hangar mit Glasfront, Funkmast, Ladestationen."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 3)
T += halle(S, -1.42, 1.38, -1.3, 0.1, 1.2, dach="flach", wand=S.wand, sockel=S.beton_h, sockel_h=0.3, fenster_seiten=("y0",))
T += tor(S, 1.4, -0.6, 0.8, 0.9, "x", 1)
T.append(quader("Plattform", S.beton_h, (2.6, 1.3, 0.1), (0, 0.75, 1.55), 0.02))
for x in (-1.1, 0, 1.1):
    T.append(zwischen("Plattformstuetze", S.stahl_d, (x, 1.3, 0.12), (x, 1.3, 1.5), 0.05, ecken=10))
T.append(ring("Landekreis", S.gelb, 0.45, 0.025, (0, 0.75, 1.61), ecken=40))
T.append(quader("H1", S.weiss, (0.06, 0.4, 0.01), (-0.12, 0.75, 1.605), 0.0))
T.append(quader("H2", S.weiss, (0.06, 0.4, 0.01), (0.12, 0.75, 1.605), 0.0))
T.append(quader("H3", S.weiss, (0.24, 0.06, 0.01), (0, 0.75, 1.605), 0.0))
T += gelaender("Plattformgelaender", S.gelb, [(-1.3, 1.4, 1.6), (1.3, 1.4, 1.6)], hoehe=0.3)
rx, ry, rz = g2b((-1.2, 1.75, -1.2))
T.append(zwischen("Funkmast", S.stahl, (rx, ry, 1.24), (rx, ry, 2.3), 0.025, ecken=8))
for x in (0.6, 1.0):
    T.append(quader("Ladesaeule", S.blau, (0.15, 0.12, 0.4), (x, 1.2, 1.8), 0.012))
ausgeben("drohnenhafen", T)
vorschau(None, os.path.join(AUS, "drohnenhafen_vorschau.png"), abstand=7, hoehe=4.4, z_mitte=1.0)
