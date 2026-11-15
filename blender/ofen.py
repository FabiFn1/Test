"""Ofen (2 × 2 Felder): Schachtofen aus feuerfestem Ziegel mit Stahlbändern, Haube und Schornstein,
Beschickungstrichter auf der Rückseite, Abstich mit Glut zum Ausgang (+X, erste Feldreihe), Bühne mit Geländer, Windleitung."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
BETON = beton("Beton", 0.58)
BETON_D = beton("Beton_Dunkel", 0.42)
ZIEGEL = ziegel("Schamotte", (0.46, 0.2, 0.11))
STAHL = stahl("Stahl")
STAHL_D = stahl("Stahl_Dunkel", (0.16, 0.16, 0.17), 0.5)
ROST = rost("Rost")
GELB = lack("Lack_Gelb", (0.78, 0.55, 0.06))
BLAU = lack("Lack_Blau", (0.08, 0.2, 0.42))
GLUT = leuchten("Glut")

T = []  # Teile, die in den Atlas gebacken werden
# Fundament mit Sockel
T.append(quader("Fundament", BETON, (1.94, 1.94, 0.16), (0, 0, 0.08), 0.03))
T.append(quader("Sockel", BETON_D, (1.36, 1.36, 0.14), (0, 0, 0.23), 0.02))
# Ofenschacht: unten breiter, oben schmaler, mit Stahlbändern
H0, H1 = 0.3, 1.95
T.append(zylinder("Schacht", ZIEGEL, 0.6, H1 - H0, (0, 0, (H0 + H1) / 2), ecken=28, r_oben=0.52))
for i, z in enumerate((0.42, 0.78, 1.14, 1.5, 1.83)):
    r = 0.6 - (z - H0) / (H1 - H0) * 0.08 + 0.012
    T.append(zylinder(f"Band{i}", STAHL_D, r, 0.05, (0, 0, z), ecken=28, fase=0.008))
# Haube und Schornstein
T.append(zylinder("Haube", STAHL_D, 0.55, 0.32, (0, 0, H1 + 0.16), ecken=28, r_oben=0.24))
T.append(zylinder("Schornstein", ROST, 0.17, 1.15, (0, 0, H1 + 0.32 + 0.575), ecken=20, r_oben=0.15))
for z in (2.55, 2.95, 3.3):
    T.append(zylinder("Schornsteinring", STAHL_D, 0.185, 0.04, (0, 0, z), ecken=20, fase=0.006))
T.append(zylinder("Regenhut", STAHL_D, 0.24, 0.06, (0, 0, 3.44), ecken=20, r_oben=0.08, fase=0.006))
# Beschickungstrichter auf der Rückseite (-X): Trichter auf Stützen mit Schurre in den Schacht
T.append(zylinder("Trichter", GELB, 0.26, 0.38, (-0.78, -0.35, 1.72), ecken=4, r_oben=0.36, drehung=(0, 0, math.radians(45)), fase=0.01))
T.append(rohr("Schurre", STAHL_D, [(-0.75, -0.35, 1.52), (-0.5, -0.18, 1.45)], 0.07))
for dx, dy in ((-0.95, -0.52), (-0.6, -0.52), (-0.95, -0.18), (-0.6, -0.18)):
    T.append(zylinder("Stuetze", GELB, 0.025, 1.4, (dx, dy, 0.85), ecken=8, fase=0))
# Windleitung: Ringleitung mit Düsenstöcken in den Schacht
T.append(ring("Windring", ROST, 0.72, 0.055, (0, 0, 0.62)))
for i in range(6):
    a = i / 6 * math.tau + 0.3
    T.append(rohr("Duese", ROST, [(0.72 * math.cos(a), 0.72 * math.sin(a), 0.62), (0.6 * math.cos(a), 0.6 * math.sin(a), 0.5)], 0.03))
T.append(rohr("Windzufuhr", ROST, [(0.72, -0.25, 0.62), (0.88, -0.6, 0.62), (0.88, -0.6, 1.6), (0.7, -0.75, 1.6)], 0.06))
# Abstich zum Ausgang (+X, Blender-y = +0.5): Rinne aus Stahl mit Glut, Schutzblech
T.append(quader("Rinne", STAHL_D, (0.42, 0.18, 0.08), (0.78, 0.5, 0.34), 0.015))
T.append(quader("Rinnenwand1", STAHL_D, (0.42, 0.03, 0.08), (0.78, 0.6, 0.39), 0.006))
T.append(quader("Rinnenwand2", STAHL_D, (0.42, 0.03, 0.08), (0.78, 0.4, 0.39), 0.006))
T.append(quader("Abstichloch", STAHL_D, (0.12, 0.26, 0.26), (0.57, 0.5, 0.45), 0.02))
glut = [quader("GlutRinne", GLUT, (0.36, 0.13, 0.02), (0.8, 0.5, 0.39), 0.004),
        quader("GlutLoch", GLUT, (0.03, 0.14, 0.14), (0.635, 0.5, 0.45), 0.004)]
# Schauloch mit Glut auf der Vorderseite (-Y)
T.append(quader("Schaurahmen", STAHL_D, (0.24, 0.06, 0.2), (0.05, -0.57, 0.95), 0.015))
glut.append(quader("GlutSchau", GLUT, (0.15, 0.02, 0.11), (0.05, -0.6, 0.95), 0.003))
# Bühne auf halber Höhe mit Geländer und Leiter
T.append(quader("Buehne", STAHL, (0.5, 1.5, 0.05), (0.05, 0, 1.25), 0.01, drehung=(0, 0, 0)))
for dy in (-0.7, 0.7):
    T.append(quader("Konsole", GELB, (0.05, 0.05, 0.3), (0.28, dy, 1.1), 0.006))
T += gelaender("Gelaender", GELB, [(0.3, -0.75, 1.275), (0.3, 0.75, 1.275)])
T += leiter("Leiter", GELB, 0.32, -0.9, 0.3, 1.27, richtung=math.radians(90))
# Schaltkasten
T.append(quader("Schaltkasten", BLAU, (0.22, 0.14, 0.34), (-0.72, 0.72, 0.5), 0.015))
T.append(quader("Schaltkastendach", STAHL_D, (0.26, 0.18, 0.03), (-0.72, 0.72, 0.68), 0.006))

ausgeben("ofen", T, leuchtend=glut, punkte={"rauch": (0, 0, 3.47), "lampe": (-0.72, 0.72, 0.72), "glut": (0.8, 0.5, 0.42)})
vorschau(None, os.path.join(AUS, "ofen_vorschau.png"))
