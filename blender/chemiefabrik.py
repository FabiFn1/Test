"""Chemiefabrik (3 x 3): zwei offene Rührkessel (Rührwerke vom Spiel), Kolonne, Rohrbrücke, Pumpen, Laborhaus mit Pultdach, Tankfeld."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 3)
for p in ((-0.01, 1.6, -0.52), (-0.01, 1.6, 0.52)):
    x, y, _ = g2b(p)
    T.append(zylinder("Kessel", S.weiss, 0.38, 1.2, (x, y, 0.72), ecken=32))
    T.append(ring("Kesselrand", S.stahl_d, 0.38, 0.03, (x, y, 1.32), ecken=32))
    for z in (0.45, 0.85):
        T.append(zylinder("Kesselband", S.stahl_d, 0.39, 0.03, (x, y, z), ecken=32, fase=0))
    T.append(quader("Ruehrbruecke", S.gelb, (0.85, 0.08, 0.08), (x, y, 1.62), 0.01))
    T.append(zylinder("Ruehrmotor", S.blau, 0.08, 0.16, (x, y, 1.72), ecken=16))
T += buehne("Kesselbuehne", S.rost_g, S.gelb, -0.6, -1.0, 0.6, 1.0, 1.35, S.gelb, offen=("x1",))
T += treppe("Treppe", S.gelb, (1.0, 0.8, 0.12), (0.6, 0.8, 1.35), breite=0.24, gelaender_mat=S.gelb)
T.append(zylinder("Kolonne", S.stahl, 0.18, 2.1, (-1.1, -1.05, 1.17), ecken=24))
for z in (0.6, 1.1, 1.6, 2.1):
    T.append(zylinder("Kolonnenring", S.stahl_d, 0.2, 0.04, (-1.1, -1.05, z), ecken=24, fase=0.004))
T += rohr_rund("Kopfleitung", S.stahl, [(-1.1, -1.05, 2.22), (-1.1, -0.6, 2.3), (-0.4, -0.52, 1.75)], 0.04)
T += halle(S, -1.45, -0.7, 0.4, 1.4, 1.2, dach="pult", wand=S.wand_blau, sockel=S.beton_h, sockel_h=0.3, fenster_seiten=("y1",))
for y in (-1.15, -0.85):
    T += tank(S, 1.05, y, 0.16, 0.6, mat=S.gruen, beine=False, leiter=False)
T.append(quader("Pumpe", S.blau, (0.25, 0.18, 0.16), (0.9, -0.2, 0.2), 0.015))
T += rohr_rund("Pumpleitung", S.stahl, [(1.05, -1.0, 0.25), (0.9, -0.5, 0.25), (0.9, -0.2, 0.3), (0.2, -0.5, 0.6)], 0.035)
T += rohr_rund("Rohrbruecke", S.rot, [(-1.4, 1.42, 1.0), (1.3, 1.42, 1.0)], 0.04)
for x in (-1.2, 0, 1.2):
    T.append(zwischen("Rohrstuetze", S.stahl_d, (x, 1.42, 0.12), (x, 1.42, 0.97), 0.025, ecken=8))
ausgeben("chemiefabrik", T)
vorschau(None, os.path.join(AUS, "chemiefabrik_vorschau.png"), abstand=7, hoehe=4.4, z_mitte=1.0)
