"""Langer Greifarm (1 x 1): Sockel (fest), langer Ausleger mit Zugstange und Greifer (dreht)."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 1)
T = [quader("Platte", S.beton, (0.62, 0.62, 0.08), (0, 0, 0.04), 0.02),
     zylinder("Sockel", S.grau, 0.18, 0.32, (0, 0, 0.24), ecken=24),
     zylinder("Drehkranz", S.stahl_d, 0.2, 0.04, (0, 0, 0.42), ecken=24, fase=0.004)]
dp = (0, 0, 0.5)
dreh = [zylinder("Gelenk", S.stahl_d, 0.11, 0.14, (0, 0, 0.5), ecken=20),
        quader("Ausleger", S.blau, (1.85, 0.09, 0.1), (0.9, 0, 0.55), 0.012),
        zwischen("Zugstange", S.stahl_d, (0, 0, 0.62), (1.8, 0, 0.6), 0.012, ecken=6),
        zylinder("Greifer", S.gelb, 0.06, 0.18, (1.84, 0, 0.42), ecken=12)]
ausgeben("langgreifer", T, bewegt=[(dreh, dp, "Lack_Blau")], groesse=512)
vorschau(None, os.path.join(AUS, "langgreifer_vorschau.png"), abstand=3.5, hoehe=2.0, z_mitte=0.3)
