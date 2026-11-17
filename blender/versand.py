"""Versandstation (2 x 2): Paketstation mit Förderband ins Haus, Landeplatz für Drohnen auf dem Dach, Antenne, Warnleuchte."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 2)
T += halle(S, -0.95, 0.6, -0.95, 0.95, 1.0, dach="flach", wand=S.wand_blau, sockel=S.beton_h, sockel_h=0.3, fenster_seiten=())
sx, sy, sz = g2b((-0.3, 1.0, -0.3))
T.append(zylinder("Landeplatz", S.beton_h, 0.45, 0.05, (sx, sy, 1.12), ecken=32))
T.append(ring("Landering", S.gelb, 0.38, 0.02, (sx, sy, 1.15), ecken=40))
T.append(quader("Annahme", S.stahl_d, (0.4, 0.5, 0.45), (0.75, 0.0, 0.35), 0.02))
T.append(zwischen("Antenne", S.stahl, (0.4, -0.7, 1.12), (0.4, -0.7, 1.7), 0.015, ecken=6))
ausgeben("versand", T)
vorschau(None, os.path.join(AUS, "versand_vorschau.png"), abstand=4.5, hoehe=2.8, z_mitte=0.6)
