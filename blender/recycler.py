"""Recycler (3 x 3): Schrottplatz-Halle mit rostigem Wellblech, Schrotthaufen, Shredder mit Trichter, Förderband nach oben, Dachlüfter (dreht)."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 3)
T += halle(S, -0.3, 1.38, -1.3, 1.3, 1.6, dach="sattel", wand=S.wand_rot, sockel=S.beton_h, sockel_h=0.35)
T += tor(S, 1.4, 0, 0.9, 1.05, "x", 1)
T.append(quader("Shredder", S.gelb, (0.6, 0.6, 0.5), (-0.8, 0.2, 0.37), 0.03))
T.append(zylinder("Trichter", S.stahl_d, 0.32, 0.4, (-0.8, 0.2, 0.82), ecken=4, r_oben=0.45, drehung=(0, 0, math.radians(45))))
T.append(zwischen("Foerderband", S.stahl_d, (-0.8, -0.9, 0.2), (-0.8, -0.1, 1.05), 0.08, ecken=4))
import random  # noqa: E402
random.seed(4)
for i in range(18):
    x, y = -1.1 + random.random() * 0.6, -1.25 + random.random() * 0.6
    T.append(quader("Schrott", random.choice([S.rost, S.stahl_d, S.rot, S.blau]), (0.12 + random.random() * 0.2, 0.08 + random.random() * 0.15, 0.06 + random.random() * 0.1),
                    (x, y, 0.15 + random.random() * 0.2), 0.01, drehung=(random.random(), random.random(), random.random() * 3)))
lx, ly, lz = g2b((0.45, 2.06, -0.45))
fest, dreh, dp = luefter(S, lx, ly, lz - 0.25)
T += fest
T += kamin(S, *g2b((-0.6, 0, -0.45))[:2], 0.1, 2.4, mat=S.rost, baender=2)
ausgeben("recycler", T, bewegt=[(dreh, dp, "Lack_Dunkel")])
vorschau(None, os.path.join(AUS, "recycler_vorschau.png"), abstand=7, hoehe=4.4, z_mitte=1.0)
