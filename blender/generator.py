"""Generator (2 × 2 Felder): Kohlekessel mit Feuertür auf der Rückseite, Dampfmaschine und Generator in grünem Lack,
Kühler mit drehendem Lüfter, Abgasschornstein, Schaltschrank mit Lampe und Isolatoren für die Leitung."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
BETON = beton("Beton", 0.58)
GRUEN = lack("Lack_Gruen", (0.12, 0.3, 0.18))
STAHL = stahl("Stahl")
STAHL_D = stahl("Stahl_Dunkel", (0.15, 0.15, 0.16), 0.5)
ROST = rost("Rost")
GELB = lack("Lack_Gelb", (0.78, 0.55, 0.06))
GRAU = lack("Lack_Grau", (0.42, 0.44, 0.45))
KERAMIK = lack("Keramik", (0.75, 0.73, 0.68), 0.25, 0.0, False)
BLECH = wellblech("Kuehlblech", (0.4, 0.42, 0.42), skala=40)
GLUT = leuchten("Glut")

T = []
T.append(quader("Fundament", BETON, (1.94, 1.94, 0.14), (0, 0, 0.07), 0.03))
# Kessel auf der Rückseite (-X): liegender Zylinder mit Feuertür
T.append(quader("Kesselsockel", STAHL_D, (0.62, 0.9, 0.22), (-0.55, 0.05, 0.25), 0.02))
T.append(zylinder("Kessel", ROST, 0.36, 0.95, (-0.55, 0.05, 0.66), ecken=24, drehung=(math.radians(90), 0, 0)))
for y in (-0.33, 0.05, 0.43):
    T.append(zylinder("Kesselband", STAHL_D, 0.375, 0.04, (-0.55, y, 0.66), ecken=24, drehung=(math.radians(90), 0, 0), fase=0.006))
T.append(quader("Feuertuer", STAHL_D, (0.06, 0.3, 0.22), (-0.93, 0.05, 0.42), 0.015))
glut = [quader("GlutTuer", GLUT, (0.02, 0.2, 0.12), (-0.965, 0.05, 0.42), 0.003)]
T.append(zylinder("Schornstein", STAHL_D, 0.1, 1.1, (-0.62, 0.05, 1.32), ecken=16))
T.append(zylinder("Schornsteinkopf", STAHL_D, 0.14, 0.08, (-0.62, 0.05, 1.86), ecken=16, r_oben=0.1))
# Maschine und Generator (Mitte), Welle zum Generator
T.append(quader("Maschinenrahmen", GRUEN, (0.55, 0.55, 0.4), (0.1, 0.25, 0.34), 0.03))
T.append(zylinder("Zylinder", GRUEN, 0.14, 0.4, (0.1, 0.25, 0.72), ecken=16))
T.append(zylinder("Generator", GRUEN, 0.26, 0.5, (0.32, -0.32, 0.42), ecken=24, drehung=(0, math.radians(90), 0)))
for i in range(10):
    T.append(zylinder("Rippe", GRUEN, 0.285, 0.018, (0.12 + i * 0.045, -0.32, 0.42), ecken=24, drehung=(0, math.radians(90), 0), fase=0))
T.append(zylinder("Welle", STAHL, 0.04, 0.5, (0.1, -0.05, 0.42), ecken=12, drehung=(math.radians(90), 0, 0)))
T.append(rohr("Dampfleitung", STAHL, [(-0.55, 0.38, 1.02), (-0.2, 0.38, 1.0), (0.05, 0.3, 0.92)], 0.04))
# Kühler mit Lüfter (Lüfter dreht, Drehpunkt in Spiel-Koordinaten wie bisher)
T.append(quader("Kuehler", BLECH, (0.5, 0.5, 0.42), (0.62, -0.66, 0.38), 0.02))
T.append(zylinder("Luefterring", STAHL_D, 0.2, 0.05, (0.62, -0.66, 0.6), ecken=24, fase=0.005))
lufter = [zylinder("Nabe", STAHL_D, 0.04, 0.05, (0.62, -0.66, 0.63), ecken=12, fase=0)]
for i in range(5):
    a = i / 5 * math.tau
    lufter.append(quader("Fluegel", STAHL_D, (0.15, 0.05, 0.012), (0.62 + 0.09 * math.cos(a), -0.66 + 0.09 * math.sin(a), 0.63), 0.004, drehung=(math.radians(25), 0, a)))
# Schaltschrank mit Lampe und Isolatoren
T.append(quader("Schaltschrank", GRAU, (0.3, 0.2, 0.55), (0.72, 0.72, 0.42), 0.02))
T.append(quader("Schrankdach", STAHL_D, (0.34, 0.24, 0.03), (0.72, 0.72, 0.71), 0.006))
for dx in (-0.08, 0.08):
    T.append(zylinder("Isolator", KERAMIK, 0.03, 0.12, (0.72 + dx, 0.72, 0.79), ecken=10, r_oben=0.02, fase=0))
T.append(rohr("Kabel", STAHL_D, [(0.72, 0.6, 0.3), (0.5, 0.45, 0.2), (0.3, 0.1, 0.2)], 0.025))
# Geländer um die Maschine
T += gelaender("Gelaender", GELB, [(-0.15, 0.88, 0.14), (0.45, 0.88, 0.14)], hoehe=0.35)

ausgeben("generator", T, leuchtend=glut, bewegt=[(lufter, (0.62, -0.66, 0.63), "Lack_Dunkel")],
         punkte={"lampe": (0.72, 0.72, 0.74), "rauch": (-0.62, 0.05, 1.92), "glut": (-0.95, 0.05, 0.42)})
vorschau(None, os.path.join(AUS, "generator_vorschau.png"), abstand=4.2, hoehe=2.6, z_mitte=0.7)
