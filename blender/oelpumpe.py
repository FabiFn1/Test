"""Ölpumpe (2 x 2): Pferdekopfpumpe mit Schwengel, Pferdekopf, Gegengewicht, Getriebe und Motor, Bohrlochkopf mit Leitung zum Ausgang."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 2)
T.append(quader("Sockel", S.beton_h, (1.6, 0.6, 0.12), (0, 0, 0.18), 0.015))
for dx in (-0.12, 0.12):
    T.append(zwischen("Bock", S.gelb, (-0.1, dx - 0.18, 0.24), (0.0, 0, 1.25), 0.04, ecken=8))
    T.append(zwischen("Bock", S.gelb, (0.15, dx + 0.18, 0.24), (0.0, 0, 1.25), 0.04, ecken=8))
T.append(quader("Schwengel", S.gelb, (1.5, 0.1, 0.12), (0.05, 0, 1.3), 0.012, drehung=(0, math.radians(-8), 0)))
T.append(quader("Pferdekopf", S.gelb, (0.12, 0.16, 0.5), (-0.7, 0, 1.25), 0.02))
T.append(zwischen("Gestaengeseil", S.stahl_d, (-0.76, 0, 1.0), (-0.76, 0, 0.35), 0.01, ecken=6))
T.append(quader("Gegengewicht", S.stahl_d, (0.3, 0.32, 0.25), (0.6, 0, 0.75), 0.02))
T.append(quader("Getriebe", S.grau, (0.35, 0.3, 0.3), (0.6, 0, 0.4), 0.02))
T.append(quader("Motor", S.blau, (0.3, 0.22, 0.2), (0.85, -0.35, 0.3), 0.02))
T.append(zylinder("Bohrlochkopf", S.rot, 0.08, 0.3, (-0.76, 0, 0.3), ecken=16))
T += ventil("Ventil", S.rot, (-0.76, -0.25, 0.2), r=0.06)
T += rohr_rund("Oelleitung", S.stahl_d, [(-0.76, 0.0, 0.2), (-0.5, 0.5, 0.2), (0.95, 0.5, 0.2)], 0.035)
ausgeben("oelpumpe", T)
vorschau(None, os.path.join(AUS, "oelpumpe_vorschau.png"), abstand=4.5, hoehe=2.8, z_mitte=0.6)
