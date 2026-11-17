"""Verteiler (1 x 1): Weichenkasten aus Stahl mit Prallblech, Klappen und Motor, gelbe Warnkanten."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 1)
T = [quader("Kasten", S.grau, (0.9, 0.9, 0.35), (0, 0, 0.3), 0.025),
     quader("Deckel", S.stahl_d, (0.7, 0.7, 0.06), (0, 0, 0.5), 0.01),
     zylinder("Motor", S.blau, 0.09, 0.16, (0.25, 0.25, 0.6), ecken=16),
     quader("Warnkante1", S.gelb, (0.92, 0.04, 0.04), (0, 0.45, 0.46), 0.0),
     quader("Warnkante2", S.gelb, (0.92, 0.04, 0.04), (0, -0.45, 0.46), 0.0)]
ausgeben("verteiler", T, groesse=512)
vorschau(None, os.path.join(AUS, "verteiler_vorschau.png"), abstand=2.6, hoehe=1.6, z_mitte=0.3)
