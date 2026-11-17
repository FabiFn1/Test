"""Strommast (1 x 1): Holzmast mit Querträger, Isolatoren, Erdungsleitung, Betonfuß."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 1)
HOLZ = beton("Holz", 0.42)
T = [zylinder("Fuss", S.beton, 0.12, 0.15, (0, 0, 0.07), ecken=12)]
T.append(zylinder("Mast", HOLZ, 0.07, 3.5, (0, 0, 1.85), ecken=12, r_oben=0.055))
T.append(quader("Traeger", HOLZ, (0.8, 0.07, 0.07), (0, 0, 3.35), 0.008))
for x in (-0.32, 0, 0.32):
    T.append(zylinder("Isolator", S.weiss, 0.025, 0.12, (x, 0, 3.45), ecken=10, r_oben=0.018, fase=0))
T.append(zwischen("Strebe", S.stahl, (-0.28, 0, 3.32), (0, 0, 3.05), 0.012, ecken=6))
T.append(zwischen("Strebe", S.stahl, (0.28, 0, 3.32), (0, 0, 3.05), 0.012, ecken=6))
ausgeben("mast", T, groesse=512)
vorschau(None, os.path.join(AUS, "mast_vorschau.png"), abstand=4.0, hoehe=2.6, z_mitte=1.6)
