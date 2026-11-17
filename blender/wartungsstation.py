"""Wartungsstation (3 x 3): Werkstatt mit rotem Tor, Ersatzteillager mit Regalen unter Vordach, Werkbank, Kompressor, Funkmast."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 3)
T += halle(S, -1.42, 0.6, -1.3, 1.3, 1.55, dach="sattel", wand=S.wand, sockel=S.ziegel, sockel_h=0.45)
T += tor(S, -0.4, -1.32, 1.0, 1.05, "y", -1)
T.append(quader("Vordach", S.dach, (0.85, 2.6, 0.04), (1.0, 0, 1.4), 0.006, drehung=(0, math.radians(8), 0)))
for y in (-1.15, 0, 1.15):
    T.append(zylinder("Vordachstuetze", S.stahl_d, 0.03, 1.25, (1.38, y, 0.75), ecken=8))
for i, y in enumerate((-0.9, -0.3, 0.3, 0.9)):
    T.append(quader("Regal", S.blau, (0.4, 0.5, 1.0), (1.0, y, 0.62), 0.01))
    for z in (0.35, 0.65, 0.95):
        T.append(quader("Ware", [S.gelb, S.rot, S.grau][(i + int(z * 10)) % 3], (0.32, 0.4, 0.12), (1.0, y, z + 0.08), 0.01))
T.append(quader("Werkbank", S.grau, (0.7, 0.3, 0.35), (-1.0, 1.6, 0.3), 0.01))
T.append(zylinder("Kompressor", S.rot, 0.15, 0.55, (-1.15, -1.55, 0.3), ecken=20, drehung=(0, math.radians(90), 0)))
T.append(zwischen("Funkmast", S.stahl, (-1.3, 1.1, 1.8), (-1.3, 1.1, 2.8), 0.025, ecken=8))
ausgeben("wartungsstation", T)
vorschau(None, os.path.join(AUS, "wartungsstation_vorschau.png"), abstand=7, hoehe=4.4, z_mitte=1.0)
