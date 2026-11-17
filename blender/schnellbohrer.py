"""Schnellbohrer (2 x 2): moderner Bohrturm aus Vollwandträgern mit Kraftdrehkopf, Spülpumpe, Schlammbecken, Gestänge (dreht)."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 2)
T.append(quader("Bohrdeck", S.stahl_d, (1.2, 1.2, 0.3), (-0.1, -0.1, 0.3), 0.02))
for dx in (-0.35, 0.15):
    for dy in (-0.35, 0.15):
        T.append(zwischen("Mast", S.rot, (dx, dy, 0.45), (-0.1 + (dx + 0.1) * 0.3, -0.1 + (dy + 0.1) * 0.3, 2.95), 0.035, ecken=8))
for z in (1.0, 1.6, 2.2, 2.7):
    T.append(quader("Riegel", S.rot, (0.55 - z * 0.12, 0.55 - z * 0.12, 0.05), (-0.1, -0.1, z), 0.0))
T.append(quader("Krone", S.gelb, (0.3, 0.3, 0.15), (-0.1, -0.1, 3.0), 0.015))
T.append(quader("Spuelpumpe", S.blau, (0.45, 0.3, 0.3), (0.55, 0.65, 0.3), 0.02))
T.append(quader("Schlammbecken", S.stahl_d, (0.5, 0.5, 0.2), (-0.65, 0.6, 0.22), 0.02))
T += rohr_rund("Spuelleitung", S.stahl, [(0.55, 0.5, 0.4), (0.2, 0.2, 0.5), (-0.1, -0.1, 2.3)], 0.03, flansche=False)
T.append(quader("Austrag", S.stahl_d, (0.35, 0.3, 0.3), (0.62, 0.5, 0.3), 0.02))
T.append(quader("Rutsche", S.gelb, (0.45, 0.26, 0.06), (0.8, 0.5, 0.26), 0.01, drehung=(0, math.radians(12), 0)))
dp = (-0.1, -0.1, 0.88)
dreh = [zylinder("Gestaenge", S.stahl, 0.055, 2.4, (-0.1, -0.1, 1.38), ecken=14, fase=0),
        zylinder("Drehkopf", S.gelb, 0.15, 0.22, (-0.1, -0.1, 2.48), ecken=16),
        zylinder("Krone", S.stahl_d, 0.16, 0.3, (-0.1, -0.1, 0.25), ecken=16, r_oben=0.09)]
ausgeben("schnellbohrer", T, bewegt=[(dreh, dp, "Stahl_Verzinkt")])
vorschau(None, os.path.join(AUS, "schnellbohrer_vorschau.png"), abstand=5.2, hoehe=3.4, z_mitte=1.3)
