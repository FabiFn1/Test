"""Ofen (2 × 2 Felder) nach dem Vorbild eines kleinen Hochofens:
Gestell mit Windring und Blasformen, nach außen gewölbte Rast, sich verjüngender Schacht mit Panzerbändern,
Gichtbühne mit Geländer, Gichtglocke mit zwei Gasabzügen in den Schornstein, Schrägaufzug mit Kübel auf der Rückseite (-X),
Abstich mit Rinne und Schutzdach zum Ausgang (+X, erste Feldreihe), Treppe zur Zwischenbühne, Heißwindleitung mit Ventil."""
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
STAHL_D = stahl("Stahl_Dunkel", (0.15, 0.15, 0.16), 0.5)
ROST = rost("Rost")
GELB = lack("Lack_Gelb", (0.78, 0.55, 0.06))
BLAU = lack("Lack_Blau", (0.08, 0.2, 0.42))
GRAU = lack("Lack_Grau", (0.36, 0.37, 0.38))
ROST_G = gitterrost("Gitterrost")
GLUT = leuchten("Glut")
CX, CY = 0.12, -0.05  # Ofenachse etwas aus der Mitte, damit hinten Platz für den Schrägaufzug bleibt

T = []
T.append(quader("Fundament", BETON, (1.94, 1.94, 0.14), (0, 0, 0.07), 0.03))
T.append(zylinder("Sockel", BETON_D, 0.7, 0.16, (CX, CY, 0.22), ecken=8, fase=0.02))
# Gestell, Rast, Schacht: echte Hochofen-Silhouette
Z = [0.3, 0.68, 1.02, 2.05]
T.append(zylinder("Gestell", ZIEGEL, 0.5, Z[1] - Z[0], (CX, CY, (Z[0] + Z[1]) / 2), ecken=36))
T.append(zylinder("Rast", STAHL_D, 0.5, Z[2] - Z[1], (CX, CY, (Z[1] + Z[2]) / 2), ecken=36, r_oben=0.6))
T.append(zylinder("Schacht", ZIEGEL, 0.6, Z[3] - Z[2], (CX, CY, (Z[2] + Z[3]) / 2), ecken=36, r_oben=0.44))
for i, z in enumerate((1.12, 1.36, 1.6, 1.84, 2.0)):
    r = 0.6 - (z - Z[2]) / (Z[3] - Z[2]) * 0.16 + 0.012
    T.append(zylinder(f"Panzerband{i}", STAHL_D, r, 0.045, (CX, CY, z), ecken=36, fase=0.008))
for i in range(8):  # senkrechte Kühlrippen an der Rast
    a = i / 8 * math.tau
    T.append(zwischen("Rippe", STAHL, (CX + 0.51 * math.cos(a), CY + 0.51 * math.sin(a), Z[1]), (CX + 0.61 * math.cos(a), CY + 0.61 * math.sin(a), Z[2]), 0.015, ecken=6))
# Windring mit Blasformen und Heißwindleitung (mit Ventil)
WR = 0.68
T.append(ring("Windring", ROST, WR, 0.06, (CX, CY, 0.78), ecken=40))
for i in range(8):
    a = i / 8 * math.tau + 0.2
    T += rohr_rund("Blasform", ROST, [(CX + WR * math.cos(a), CY + WR * math.sin(a), 0.78), (CX + 0.62 * math.cos(a), CY + 0.62 * math.sin(a), 0.62), (CX + 0.5 * math.cos(a), CY + 0.5 * math.sin(a), 0.55)], 0.026, flansche=False)
T += rohr_rund("Heisswind", ROST, [(CX + 0.4, CY - WR + 0.06, 0.78), (0.82, -0.85, 0.78), (0.82, -0.85, 1.55), (0.82, -0.3, 1.55)], 0.06)
T += ventil("Ventil", GELB, (0.82, -0.85, 1.12 - 0.04), r=0.07)
# Gichtbühne, Gichtglocke und Gasabzüge in den Schornstein
T += buehne("Gichtbuehne", ROST_G, GELB, CX - 0.55, CY - 0.55, CX + 0.55, CY + 0.55, Z[3] + 0.02, GELB, offen=("x0",))
T.append(zylinder("Glocke", STAHL_D, 0.44, 0.22, (CX, CY, Z[3] + 0.13), ecken=36, r_oben=0.24))
T.append(zylinder("Gichtkopf", STAHL_D, 0.24, 0.12, (CX, CY, Z[3] + 0.3), ecken=24))
for s in (-1, 1):
    T += rohr_rund("Gasabzug", ROST, [(CX + 0.14 * s, CY, Z[3] + 0.34), (CX + 0.2 * s, CY, Z[3] + 0.62), (CX, CY, Z[3] + 0.82)], 0.07, flansche=False)
T.append(zylinder("Schornstein", ROST, 0.13, 0.62, (CX, CY, Z[3] + 1.1), ecken=24, r_oben=0.11))
T.append(zylinder("Schornsteinkopf", STAHL_D, 0.17, 0.06, (CX, CY, Z[3] + 1.43), ecken=24, r_oben=0.12, fase=0.006))
# Schrägaufzug auf der Rückseite: Fachwerkbahn vom Boden zur Gicht, Kübel auf halber Höhe
A, B = (-0.92, 0.72, 0.16), (CX - 0.38, CY + 0.05, Z[3] + 0.35)
from mathutils import Vector  # noqa: E402
a, b = Vector(A), Vector(B)
quer = Vector((-(b - a).y, (b - a).x, 0)).normalized() * 0.13
for s in (-1, 1):
    T.append(zwischen("Schiene", STAHL_D, tuple(a + quer * s), tuple(b + quer * s), 0.02, ecken=8))
    T.append(zwischen("Untergurt", GELB, tuple(a + quer * s + Vector((0, 0, -0.12))), tuple(b + quer * s + Vector((0, 0, -0.12))), 0.016, ecken=6))
for i in range(1, 9):
    p = a + (b - a) * (i / 9)
    T.append(zwischen("Schwelle", GELB, tuple(p - quer), tuple(p + quer), 0.012, ecken=6))
    T.append(zwischen("Pfosten", GELB, tuple(p), (p.x, p.y, 0.14), 0.014, ecken=6))
m = a + (b - a) * 0.55
T.append(quader("Kuebel", STAHL_D, (0.22, 0.24, 0.16), (m.x, m.y, m.z + 0.12), 0.02, drehung=(0, -math.atan2(b.z - a.z, (Vector((b.x, b.y, 0)) - Vector((a.x, a.y, 0))).length), math.atan2(b.y - a.y, b.x - a.x))))
T.append(quader("Windenhaus", GRAU, (0.32, 0.3, 0.3), (-0.75, 0.82 - 0.05, 0.3), 0.02))
T.append(quader("Windendach", STAHL_D, (0.36, 0.34, 0.03), (-0.75, 0.77, 0.47), 0.006))
# Abstich zum Ausgang (+X, Blender-y = +0.5) mit Rinne, Glut und Schutzdach
T.append(quader("Abstichblock", STAHL_D, (0.14, 0.28, 0.28), (CX + 0.5, 0.5, 0.42), 0.02))
T.append(quader("Rinne", BETON_D, (0.4, 0.2, 0.08), (0.8, 0.5, 0.31), 0.02))
for dy in (-0.09, 0.09):
    T.append(quader("Rinnenwand", BETON_D, (0.4, 0.03, 0.08), (0.8, 0.5 + dy, 0.37), 0.008))
glut = [quader("GlutRinne", GLUT, (0.36, 0.13, 0.02), (0.8, 0.5, 0.36), 0.004), quader("GlutLoch", GLUT, (0.03, 0.14, 0.14), (CX + 0.575, 0.5, 0.44), 0.003)]
for dx, dy in ((0.62, 0.32), (0.98, 0.32), (0.62, 0.68), (0.98, 0.68)):
    T.append(zylinder("Dachstuetze", GELB, 0.018, 0.55, (dx, dy, 0.42), ecken=8, fase=0))
T.append(quader("Schutzdach", STAHL_D, (0.46, 0.44, 0.03), (0.8, 0.5, 0.71), 0.006, drehung=(0, math.radians(-8), 0)))
# Schauloch mit Glut
T.append(quader("Schaurahmen", STAHL_D, (0.22, 0.06, 0.16), (CX, CY - 0.5, 0.5), 0.015))
glut.append(quader("GlutSchau", GLUT, (0.14, 0.02, 0.09), (CX, CY - 0.535, 0.5), 0.003))
# Zwischenbühne mit Treppe auf der Vorderseite (-Y), Schaltkasten
T += buehne("Zwischenbuehne", ROST_G, GELB, CX - 0.3, -0.98, CX + 0.42, CY - 0.6, 1.05, GELB, offen=("y1",))
T += treppe("Treppe", GELB, (-0.82, -0.8, 0.14), (CX - 0.3, -0.8, 1.05), breite=0.26, gelaender_mat=GELB)
T.append(quader("Schaltkasten", BLAU, (0.22, 0.14, 0.34), (0.78, 0.82, 0.32), 0.015))
T.append(quader("Schaltkastendach", STAHL_D, (0.26, 0.18, 0.03), (0.78, 0.82, 0.5), 0.006))
T.append(zylinder("Manometer", GRAU, 0.04, 0.02, (0.82, -0.85 + 0.07, 1.3), ecken=16, drehung=(math.radians(90), 0, 0), fase=0.003))

ausgeben("ofen", T, leuchtend=glut, punkte={"rauch": (CX, CY, Z[3] + 1.48), "lampe": (0.78, 0.82, 0.53), "glut": (0.8, 0.5, 0.4)})
vorschau(None, os.path.join(AUS, "ofen_vorschau.png"), abstand=6.6, hoehe=3.6, z_mitte=1.65)
vorschau(None, os.path.join(AUS, "ofen_vorschau_hinten.png"), abstand=6.6, hoehe=3.6, z_mitte=1.65, winkel=2.5)
