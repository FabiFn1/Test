"""Greifarm (1 x 1): Sockel mit Drehkranz (fest), Arm mit Gelenken und Greifer (dreht um die senkrechte Achse)."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 1)
T = [quader("Platte", S.beton, (0.7, 0.7, 0.08), (0, 0, 0.04), 0.02),
     zylinder("Sockel", S.grau, 0.2, 0.28, (0, 0, 0.22), ecken=24),
     zylinder("Drehkranz", S.stahl_d, 0.22, 0.04, (0, 0, 0.38), ecken=24, fase=0.004)]
dp = (0, 0, 0.44)
dreh = [zylinder("Gelenk", S.stahl_d, 0.1, 0.12, (0, 0, 0.46), ecken=20),
        quader("Arm", S.gelb, (0.8, 0.09, 0.1), (0, 0, 0.5), 0.012),
        zylinder("Kopf1", S.stahl_d, 0.05, 0.14, (0.38, 0, 0.4), ecken=12), zylinder("Kopf2", S.stahl_d, 0.05, 0.14, (-0.38, 0, 0.4), ecken=12)]
ausgeben("greifer", T, bewegt=[(dreh, dp, "Lack_Gelb")], groesse=512)
vorschau(None, os.path.join(AUS, "greifer_vorschau.png"), abstand=2.6, hoehe=1.6, z_mitte=0.3)
