"""Sortierer (1 x 1): Weichenkasten mit Lichtschranke und Signalleuchte."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 1)
T = [quader("Kasten", S.blau, (0.9, 0.9, 0.35), (0, 0, 0.3), 0.025),
     quader("Deckel", S.stahl_d, (0.7, 0.7, 0.06), (0, 0, 0.5), 0.01)]
for x in (-0.3, 0.3):
    T.append(zwischen("Lichtschranke", S.gelb, (x, -0.4, 0.5), (x, -0.4, 0.68), 0.025, ecken=8))
T.append(zwischen("Strahl", S.weiss, (-0.3, -0.4, 0.62), (0.3, -0.4, 0.62), 0.005, ecken=4))
glut = [zylinder("Signal", S.glut, 0.05, 0.06, (0.3, 0.3, 0.6), ecken=12, fase=0)]
ausgeben("sortierer", T, leuchtend=glut, groesse=512)
vorschau(None, os.path.join(AUS, "sortierer_vorschau.png"), abstand=2.6, hoehe=1.6, z_mitte=0.3)
