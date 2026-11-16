"""Bohrer (2 × 2 Felder): Bohrturm aus blauem Fachwerk mit Bohrgestänge (dreht), Antriebshaus, Seiltrommel,
Förderrutsche zum Ausgang (+X, erste Reihe), Bühne mit Geländer."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
BETON = beton("Beton", 0.58)
BLAU = lack("Lack_Blau", (0.08, 0.22, 0.48), 0.5)
GELB = lack("Lack_Gelb", (0.78, 0.55, 0.06))
STAHL = stahl("Stahl")
STAHL_D = stahl("Stahl_Dunkel", (0.15, 0.15, 0.16), 0.5)
HAUS = wellblech("Hausblech", (0.2, 0.22, 0.24), skala=26)
ROST = rost("Rost")

T = []
T.append(quader("Fundament", BETON, (1.94, 1.94, 0.14), (0, 0, 0.07), 0.03))
T.append(quader("Bohrbuehne", STAHL_D, (1.0, 1.0, 0.08), (-0.1, -0.1, 0.32), 0.015))
for x in (-0.5, 0.3):
    for y in (-0.5, 0.3):
        T.append(quader("Buehnenfuss", STAHL_D, (0.08, 0.08, 0.2), (x, y, 0.2), 0.008))
# Fachwerkturm: vier Eckstiele, die sich nach oben verjüngen, mit Riegeln und Streben
unten, oben, z0, z1 = 0.42, 0.12, 0.36, 2.95
def ecke(i, z):
    t = (z - z0) / (z1 - z0)
    h = unten + (oben - unten) * t
    sx, sy = ((-1, -1), (1, -1), (1, 1), (-1, 1))[i]
    return (-0.1 + sx * h, -0.1 + sy * h, z)
for i in range(4):
    T.append(rohr("Stiel", BLAU, [ecke(i, z0), ecke(i, z1)], 0.03))
stufen = [z0 + (z1 - z0) * k / 6 for k in range(7)]
for a, b in zip(stufen, stufen[1:]):
    for i in range(4):
        j = (i + 1) % 4
        T.append(rohr("Riegel", BLAU, [ecke(i, b), ecke(j, b)], 0.016))
        T.append(rohr("Strebe", BLAU, [ecke(i, a), ecke(j, b)], 0.012))
T.append(quader("Turmkopf", GELB, (0.36, 0.36, 0.12), (-0.1, -0.1, z1 + 0.06), 0.015))
T.append(zylinder("Seilrolle", STAHL_D, 0.1, 0.05, (-0.1, -0.1, z1 + 0.16), ecken=20, drehung=(math.radians(90), 0, 0), fase=0.005))
# Antriebshaus mit Seiltrommel, Seil zur Rolle
T.append(quader("Antriebshaus", HAUS, (0.55, 0.45, 0.48), (-0.62, 0.62, 0.38), 0.02))
T.append(quader("Hausdach", STAHL_D, (0.62, 0.52, 0.04), (-0.62, 0.62, 0.64), 0.008))
T.append(zylinder("Seiltrommel", ROST, 0.14, 0.32, (-0.62, 0.22, 0.3), ecken=20, drehung=(0, math.radians(90), 0)))
T.append(rohr("Seil", STAHL_D, [(-0.62, 0.22, 0.44), (-0.12, -0.1, z1 + 0.12)], 0.008))
# Bohrgestänge (dreht um die senkrechte Achse): Gestänge, Kraftdrehkopf, Bohrkrone unter der Bühne
dp = (-0.1, -0.1, 0.88)
gestaenge = [zylinder("Gestaenge", STAHL, 0.05, 2.4, (-0.1, -0.1, 0.88 + 0.5), ecken=14, fase=0),
             zylinder("Drehkopf", GELB, 0.14, 0.2, (-0.1, -0.1, 2.48), ecken=16),
             zylinder("Krone", STAHL_D, 0.15, 0.28, (-0.1, -0.1, 0.25), ecken=16, r_oben=0.09)]
# Förderrutsche zum Ausgang (+X, Blender-y = +0.5) mit Austrag
T.append(quader("Austrag", STAHL_D, (0.35, 0.3, 0.3), (0.55, 0.5, 0.35), 0.02))
T.append(quader("Rutsche", GELB, (0.5, 0.28, 0.06), (0.78, 0.5, 0.28), 0.01, drehung=(0, math.radians(12), 0)))
T.append(quader("Warnschild", GELB, (0.03, 0.25, 0.18), (0.96, 0.5, 0.5), 0.004))
# Geländer an der Bühne und Treppe
T += gelaender("Gelaender", GELB, [(-0.6, -0.6, 0.36), (0.4, -0.6, 0.36), (0.4, 0.4, 0.36)], hoehe=0.35)
T.append(quader("Lampenmast", STAHL_D, (0.04, 0.04, 0.5), (0.72, -0.72, 0.4), 0.004))

ausgeben("bohrer", T, bewegt=[(gestaenge, dp, "Stahl_Verzinkt")],
         punkte={"lampe": (0.72, -0.72, 0.68)})
vorschau(None, os.path.join(AUS, "bohrer_vorschau.png"), abstand=5.2, hoehe=3.4, z_mitte=1.3)
