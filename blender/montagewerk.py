"""Montagewerk (3 x 3): moderne Montagehalle mit Sheddach, blauer Fassade, Rolltor am Ausgang (+X), Kran-Laufbahn außen, Dachlüfter (dreht)."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 3)
T += halle(S, -1.42, 1.38, -1.3, 1.3, 1.75, dach="shed", wand=S.wand_blau, sockel=S.beton_h, sockel_h=0.35, stuetzen=S.gelb)
T += tor(S, 1.4, 0, 1.0, 1.15, "x", 1)
fest, dreh, dp = luefter(S, *g2b((-0.1, 2.17, 0))[:2], 2.17 - 0.25)
T += fest
# Kranbahn an der Längsseite (-Y) mit Laufkatze
for x in (-1.2, 0.0, 1.2):
    T.append(zwischen("Kranstuetze", S.gelb, (x, -1.62, 0.12), (x, -1.62, 1.55), 0.035, ecken=8))
T.append(quader("Kranbahn", S.gelb, (2.7, 0.08, 0.12), (0, -1.62, 1.6), 0.01))
T.append(quader("Katze", S.stahl_d, (0.25, 0.22, 0.16), (0.3, -1.62, 1.45), 0.015))
T.append(zwischen("Seil", S.stahl_d, (0.3, -1.62, 1.37), (0.3, -1.62, 0.7), 0.006, ecken=6))
T.append(quader("Last", S.rot, (0.3, 0.3, 0.25), (0.3, -1.62, 0.55), 0.02))
T += [zylinder("Abluft", S.stahl, 0.06, 0.6, g2b((-1.41, 2.0, -0.7)), ecken=14)]
T.append(quader("Schaltschrank", S.grau, (0.34, 0.16, 0.55), (1.1, 1.42, 0.4), 0.015))
ausgeben("montagewerk", T, bewegt=[(dreh, dp, "Lack_Dunkel")])
vorschau(None, os.path.join(AUS, "montagewerk_vorschau.png"), abstand=7, hoehe=4.4, z_mitte=1.0)
