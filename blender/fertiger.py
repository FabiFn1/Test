"""Fertiger (3 × 3 Felder): Fertigungshalle mit Laternendach.
Backsteinsockel mit Lisenen, darüber Stahlfachwerk mit Wellblech und Fensterbändern, Laterne mit Lüftungslamellen auf dem First,
Rolltor mit Rammschutz am Ausgang (+X, mittlere Reihe), Zyklon-Absaugung mit Rohr aufs Dach, Dachlüfter (dreht), Abluftrohre,
Rinnen und Fallrohre, Schaltschrank mit Kabelpritsche, Leuchte über dem Tor."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
BETON = beton("Beton", 0.58)
BETON_H = beton("Beton_Hell", 0.68)
ZIEGEL = ziegel("Ziegel", (0.4, 0.14, 0.08))
ZIEGEL_D = ziegel("Ziegel_Dunkel", (0.27, 0.1, 0.07))
WAND = wellblech("Wandblech", (0.55, 0.58, 0.57), skala=22)
DACH = wellblech("Dachblech", (0.3, 0.33, 0.36), skala=26, senkrecht=False)
STAHL = stahl("Stahl")
STAHL_D = stahl("Stahl_Dunkel", (0.15, 0.15, 0.16), 0.5)
GELB = lack("Lack_Gelb", (0.78, 0.55, 0.06))
BLAU = lack("Lack_Blau", (0.08, 0.2, 0.42))
GRAU = lack("Lack_Grau", (0.4, 0.42, 0.43))
GLAS = lack("Glas", (0.14, 0.2, 0.24), 0.08, 0.3, False)
RAHMEN = lack("Rahmen", (0.12, 0.13, 0.13), 0.5, 0.4, False)
TOR = wellblech("Torblech", (0.5, 0.36, 0.12), skala=30, senkrecht=False)

W, D, HS, HW, HD = 2.7, 2.5, 0.6, 1.7, 2.15  # Breite (X), Tiefe (Y), Sockel, Traufe, First
X0, X1, Y0, Y1 = -W / 2 - 0.05, W / 2 - 0.05, -D / 2 - 0.1, D / 2 - 0.1
T = []
T.append(quader("Fundament", BETON, (2.94, 2.94, 0.12), (0, 0, 0.06), 0.03))
# Sockel aus Backstein mit Lisenen
T.append(quader("Sockel", ZIEGEL, (W, D, HS), ((X0 + X1) / 2, (Y0 + Y1) / 2, 0.12 + HS / 2), 0.015))
T.append(quader("Sockelgesims", BETON_H, (W + 0.06, D + 0.06, 0.06), ((X0 + X1) / 2, (Y0 + Y1) / 2, 0.12 + HS + 0.03), 0.01))
# Wand aus Wellblech mit Stahlstützen
T.append(quader("Wand", WAND, (W - 0.04, D - 0.04, HW - HS - 0.18), ((X0 + X1) / 2, (Y0 + Y1) / 2, 0.18 + HS + (HW - HS - 0.18) / 2), 0.01))
for i in range(5):
    x = X0 + W * i / 4
    for y in (Y0 - 0.025, Y1 + 0.025):
        T.append(quader("Stuetze", BLAU, (0.07, 0.05, HW - 0.12), (x, y, 0.12 + (HW - 0.12) / 2), 0.008))
        T.append(quader("Lisene", ZIEGEL_D, (0.12, 0.06, HS), (x, y, 0.12 + HS / 2), 0.008))
# Fensterbänder an beiden Längsseiten
for i in range(4):
    x = X0 + W * (i + 0.5) / 4
    for y, s in ((Y0, -1), (Y1, 1)):
        T += fenster("Band", GLAS, RAHMEN, (x, y, 1.22), 0.5, 0.42, "y", s, (3, 1))
# Satteldach mit Laterne (First entlang X)
neig = math.atan2(HD - HW, D / 2)
for s in (-1, 1):
    T.append(quader("Dach", DACH, (W + 0.16, D / 2 / math.cos(neig) + 0.1, 0.04), ((X0 + X1) / 2, (Y0 + Y1) / 2 + s * D / 4, (HW + HD) / 2 + 0.03), 0.008, drehung=(-s * neig, 0, 0)))
    T.append(zwischen("Rinne", STAHL, (X0 - 0.06, (Y0 + Y1) / 2 + s * (D / 2 + 0.07), HW - 0.01), (X1 + 0.06, (Y0 + Y1) / 2 + s * (D / 2 + 0.07), HW - 0.01), 0.035, ecken=12))
for x in (X0 + 0.01, X1 - 0.01):
    T.append(flaeche("Giebel", WAND, [(x, Y0, HW), (x, Y1, HW), (x, (Y0 + Y1) / 2, HD)], 0.03))
LH, LB = 0.32, 0.5  # Laterne: Höhe, Breite
T.append(quader("Laterne", STAHL_D, (W - 0.7, LB, LH), ((X0 + X1) / 2, (Y0 + Y1) / 2, HD + LH / 2 - 0.02), 0.01))
for k in range(9):
    x = (X0 + X1) / 2 - (W - 0.8) / 2 + (W - 0.8) * k / 8
    for s in (-1, 1):
        T.append(quader("Lamelle", GRAU, (0.012, 0.03, LH * 0.8), (x, (Y0 + Y1) / 2 + s * (LB / 2 + 0.01), HD + LH / 2 - 0.02), 0.002))
T.append(quader("Laternendach", DACH, (W - 0.6, LB + 0.2, 0.04), ((X0 + X1) / 2, (Y0 + Y1) / 2, HD + LH + 0.0), 0.006))
# Rolltor mit Rahmen, Rammschutz und Leuchte am Ausgang (+X, Mitte)
T.append(quader("Torrahmen", GELB, (0.07, 1.15, 1.3), (X1 + 0.02, 0, 0.12 + 0.65), 0.012))
T.append(quader("Tor", TOR, (0.04, 1.0, 1.18), (X1 + 0.045, 0, 0.12 + 0.59), 0.008))
T.append(zylinder("Torwelle", STAHL_D, 0.07, 1.15, (X1 + 0.08, 0, 1.38), ecken=16, drehung=(math.radians(90), 0, 0)))
for y in (-0.62, 0.62):
    T.append(zylinder("Rammschutz", GELB, 0.04, 0.5, (X1 + 0.18, y, 0.37), ecken=14, fase=0.006))
T.append(quader("Leuchte", STAHL_D, (0.14, 0.26, 0.06), (X1 + 0.1, 0, 1.58), 0.01))
# Seiteneingänge mit Rahmen (für die Zufuhr) an -X, -Y, +Y
for x, y, dr in ((X0 - 0.01, 0, 90), ((X0 + X1) / 2 + 0.6, Y0 - 0.01, 0), ((X0 + X1) / 2 + 0.6, Y1 + 0.01, 0)):
    T.append(quader("Zufuhr", STAHL_D, (0.62, 0.05, 0.5), (x, y, 0.44), 0.01, drehung=(0, 0, math.radians(dr))))
# Zyklon-Absaugung hinten links mit Rohr aufs Dach
ZX, ZY = X0 - 0.1, Y1 + 0.02
T.append(zylinder("Zyklon", STAHL, 0.24, 0.55, (ZX + 0.25, ZY - 0.05, 1.05), ecken=24))
T.append(zylinder("Zyklonkegel", STAHL, 0.24, 0.5, (ZX + 0.25, ZY - 0.05, 0.53), ecken=24, r_oben=0.24, drehung=(0, 0, 0)) if False else zylinder("Zyklonkegel", STAHL, 0.05, 0.45, (ZX + 0.25, ZY - 0.05, 0.55), ecken=24, r_oben=0.24))
for dx, dy in ((-0.2, -0.2), (0.2, -0.2), (0.2, 0.2), (-0.2, 0.2)):
    T.append(zwischen("Zyklonbein", GELB, (ZX + 0.25 + dx, ZY - 0.05 + dy, 0.12), (ZX + 0.25 + dx * 0.9, ZY - 0.05 + dy * 0.9, 0.85), 0.02, ecken=6))
T += rohr_rund("Absaugrohr", STAHL, [(ZX + 0.25, ZY - 0.05, 1.32), (ZX + 0.25, ZY - 0.05, 1.6), (X0 + 0.5, (Y0 + Y1) / 2 + 0.6, 1.95)], 0.07)
# Dachlüfter (dreht) und Abluftrohre
LX, LY = 0.3, -0.62
T.append(zylinder("Luefterhaus", STAHL, 0.2, 0.2, (LX, LY, 2.05), ecken=24))
lufter = [zylinder("Luefterkappe", STAHL_D, 0.19, 0.07, (LX, LY, 2.2), ecken=24, r_oben=0.06)]
for i in range(8):
    a = i / 8 * math.tau
    lufter.append(quader("Luefterschaufel", STAHL_D, (0.13, 0.015, 0.08), (LX + 0.12 * math.cos(a), LY + 0.12 * math.sin(a), 2.12), 0.0, drehung=(0, 0, a + 0.6)))
for x in (-0.6, 0.9):
    T.append(zylinder("Abluft", STAHL, 0.06, 0.6, (x, 0.75, 2.1), ecken=14))
    T.append(zylinder("Abluftkappe", STAHL_D, 0.11, 0.05, (x, 0.75, 2.42), ecken=14, r_oben=0.05))
# Fallrohre, Schaltschrank mit Kabelpritsche
for x in (X0 + 0.05, X1 - 0.05):
    for y in (Y0 - 0.07, Y1 + 0.07):
        T.append(zylinder("Fallrohr", STAHL, 0.028, HW - 0.12, (x, y, 0.12 + (HW - 0.12) / 2), ecken=10))
T.append(quader("Schaltschrank", GRAU, (0.36, 0.16, 0.6), (X1 - 0.5, Y0 - 0.1, 0.45), 0.015))
T.append(quader("Kabelpritsche", STAHL, (1.2, 0.1, 0.03), (X1 - 1.1, Y0 - 0.08, 0.95), 0.0))

ausgeben("fertiger", T, bewegt=[(lufter, (LX, LY, 2.2), "Lack_Dunkel")],
         punkte={"lampe": (X1 + 0.1, 0, 1.52), "rl": (X1 + 0.1, 0, 1.62), "dampf": (-0.6, 0.75, 2.48)})
vorschau(None, os.path.join(AUS, "fertiger_vorschau.png"), abstand=6.8, hoehe=4.4, z_mitte=1.15)
vorschau(None, os.path.join(AUS, "fertiger_vorschau_hinten.png"), abstand=6.8, hoehe=4.4, z_mitte=1.15, winkel=2.5)
