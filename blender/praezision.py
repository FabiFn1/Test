"""Präzisionswerk (3 x 3): Reinraumhalle mit weißer Paneelfassade, Lichtband, Klimageräten, Luftschleuse, Dachlüfter (dreht)."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 3)
T += halle(S, -1.42, 1.38, -1.3, 1.3, 1.85, dach="flach", wand=S.weiss, sockel=S.beton_h, sockel_h=0.3, stuetzen=S.grau)
T.append(quader("Lichtband", S.glas, (2.2, 0.03, 0.18), (0, -1.33, 1.55), 0.004))
T += tor(S, 1.4, 0, 0.95, 1.1, "x", 1)
T.append(quader("Schleuse", S.weiss, (0.6, 0.45, 1.0), (-0.6, -1.5, 0.62), 0.02))
T.append(quader("Schleusentuer", S.glas, (0.36, 0.03, 0.72), (-0.6, -1.73, 0.5), 0.004))
for x, y in ((-0.8, 0.5), (0.2, 0.5), (0.8, -0.4)):
    T.append(quader("Klimageraet", S.grau, (0.42, 0.36, 0.22), (x, y, 2.03), 0.015))
    T.append(zylinder("Klimaluefter", S.stahl_d, 0.12, 0.03, (x, y, 2.15), ecken=20, fase=0.004))
T += rohr_rund("Luftkanal", S.stahl, [(-0.8, 0.5, 2.15), (-0.8, 0.0, 2.15), (0.2, 0.0, 2.15)], 0.08, flansche=False)
lx, ly, lz = g2b((-0.55, 2.45, -0.5))
fest, dreh, dp = luefter(S, lx, ly, lz - 0.25)
T += fest
T.append(zylinder("Abluft", S.stahl, 0.06, 0.4, g2b((-1.42, 2.0, -0.9)), ecken=14))
ausgeben("praezision", T, bewegt=[(dreh, dp, "Lack_Dunkel")])
vorschau(None, os.path.join(AUS, "praezision_vorschau.png"), abstand=7, hoehe=4.4, z_mitte=1.0)
