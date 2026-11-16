"""Zentrale (6 × 6 Felder): Backstein-Werk um 1900.
Shedhalle mit Lisenen und hohen Sprossenfenstern, Laderampe mit zwei Toren und Vordach,
Verwaltung mit drei Geschossen, Gesimsen und Uhrturm mit Kupferhaube, Wasserturm auf Stahlgerüst,
hoher Schornstein mit Bändern, gepflasterter Hof mit Bordsteinen, Paletten, Fässern und Laternen."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
BETON = beton("Beton", 0.58)
BETON_H = beton("Beton_Hell", 0.68)
ZIEGEL = ziegel("Ziegel", (0.42, 0.15, 0.09))
ZIEGEL_D = ziegel("Ziegel_Dunkel", (0.28, 0.1, 0.07))
SANDST = beton("Sandstein", 0.62)
DACH = wellblech("Dachblech", (0.3, 0.32, 0.34), skala=26, senkrecht=False)
KUPFER = lack("Kupfer", (0.22, 0.48, 0.4), 0.55, 0.4)
GLAS = lack("Glas", (0.14, 0.2, 0.24), 0.08, 0.3, False)
RAHMEN = lack("Rahmen", (0.12, 0.13, 0.13), 0.5, 0.4, False)
STAHL = stahl("Stahl")
STAHL_D = stahl("Stahl_Dunkel", (0.15, 0.15, 0.16), 0.5)
ROST = rost("Rost")
GELB = lack("Lack_Gelb", (0.78, 0.55, 0.06))
GRUEN = lack("Lack_Gruen", (0.1, 0.24, 0.16))
TOR = wellblech("Torblech", (0.45, 0.3, 0.12), skala=30, senkrecht=False)
HOLZ = beton("Holz", 0.45)
UHR = lack("Uhr", (0.92, 0.9, 0.84), 0.4, 0.0, False)

T = []
# Hof mit Bordstein
T.append(quader("Hof", BETON, (5.96, 5.96, 0.1), (0, 0, 0.05), 0.02))
for (sx, sy, l, dr) in ((0, 2.95, 5.9, 0), (0, -2.95, 5.9, 0), (2.95, 0, 5.9, 90), (-2.95, 0, 5.9, 90)):
    T.append(quader("Bordstein", BETON_H, (l, 0.08, 0.06), (sx, sy, 0.12), 0.01, drehung=(0, 0, math.radians(dr))))

# ---------- Shedhalle (links), Front nach -Y ----------
HX0, HX1, HY0, HY1, HW = -2.7, 0.55, -1.2, 2.6, 2.0
T.append(quader("Hallensockel", ZIEGEL_D, (HX1 - HX0, HY1 - HY0, 0.3), ((HX0 + HX1) / 2, (HY0 + HY1) / 2, 0.25), 0.015))
T.append(quader("Hallenwand", ZIEGEL, (HX1 - HX0 - 0.04, HY1 - HY0 - 0.04, HW - 0.4), ((HX0 + HX1) / 2, (HY0 + HY1) / 2, 0.4 + (HW - 0.4) / 2), 0.01))
T.append(quader("Traufgesims", SANDST, (HX1 - HX0 + 0.08, HY1 - HY0 + 0.08, 0.1), ((HX0 + HX1) / 2, (HY0 + HY1) / 2, HW + 0.03), 0.015))
# Lisenen und Fenster an der Front (-Y) und an der linken Seite (-X)
n = 5
for i in range(n + 1):
    x = HX0 + (HX1 - HX0) * i / n
    T.append(quader("Lisene", ZIEGEL_D, (0.14, 0.06, HW - 0.1), (x, HY0 - 0.03, 0.15 + (HW - 0.1) / 2), 0.008))
for i in range(n):
    x = HX0 + (HX1 - HX0) * (i + 0.5) / n
    if i in (1, 3):
        continue  # dort sitzen die Tore
    T += fenster("HFront", GLAS, RAHMEN, (x, HY0, 1.2), 0.42, 1.0, "y", -1, (3, 4), SANDST)
for j in range(5):
    y = HY0 + (HY1 - HY0) * (j + 0.5) / 5
    T += fenster("HSeite", GLAS, RAHMEN, (HX0, y, 1.2), 0.42, 1.0, "x", -1, (3, 4), SANDST)
# Sheddach: vier Zähne quer zur Halle, steile Glasseite nach +Y (Norden)
zaehne = 4
tiefe = (HY1 - HY0) / zaehne
for k in range(zaehne):
    y0 = HY0 + k * tiefe
    y1 = y0 + tiefe
    hoch = 0.7
    neig = math.atan2(hoch, tiefe * 0.8)
    l = math.hypot(hoch, tiefe * 0.8)
    T.append(quader("Shedblech", DACH, (HX1 - HX0 + 0.1, l, 0.04), ((HX0 + HX1) / 2, y0 + tiefe * 0.4, HW + 0.08 + hoch / 2), 0.008, drehung=(neig, 0, 0)))
    T.append(quader("Shedglas", GLAS, (HX1 - HX0 - 0.1, 0.03, hoch * 0.92), ((HX0 + HX1) / 2, y0 + tiefe * 0.8 + 0.02, HW + 0.08 + hoch / 2), 0.006, drehung=(math.radians(-12), 0, 0)))
    for x in (HX0 + 0.05, HX1 - 0.05):
        T.append(flaeche("Shedgiebel", ZIEGEL, [(x, y0, HW + 0.08), (x, y0 + tiefe * 0.8, HW + 0.08), (x, y0 + tiefe * 0.8, HW + 0.08 + hoch)], 0.06))
    for i in range(1, 6):
        x = HX0 + (HX1 - HX0) * i / 6
        T.append(quader("Shedsprosse", RAHMEN, (0.025, 0.04, hoch * 0.9), (x, y0 + tiefe * 0.8 + 0.035, HW + 0.08 + hoch / 2), 0.004, drehung=(math.radians(-12), 0, 0)))
# Laderampe mit zwei Toren und Vordach an der Front
for i in (1, 3):
    x = HX0 + (HX1 - HX0) * (i + 0.5) / n
    T.append(quader("Torrahmen", GELB, (0.62, 0.07, 1.25), (x, HY0 - 0.035, 0.98), 0.012))
    T.append(quader("Tor", TOR, (0.54, 0.04, 1.12), (x, HY0 - 0.06, 0.95), 0.008))
T.append(quader("Rampe", BETON_H, (HX1 - HX0 - 0.4, 0.55, 0.32), ((HX0 + HX1) / 2, HY0 - 0.32, 0.26), 0.02))
for x in (HX0 + 0.3, (HX0 + HX1) / 2, HX1 - 0.3):
    T.append(zylinder("Poller", GELB, 0.035, 0.32, (x, HY0 - 0.6, 0.42), ecken=12, fase=0.006))
T.append(quader("Vordach", STAHL_D, (HX1 - HX0 - 0.3, 0.75, 0.04), ((HX0 + HX1) / 2, HY0 - 0.38, 1.75), 0.008, drehung=(math.radians(-6), 0, 0)))
for x in (HX0 + 0.3, HX1 - 0.3):
    T.append(zwischen("Vordachstrebe", STAHL_D, (x, HY0 - 0.02, 1.4), (x, HY0 - 0.72, 1.72), 0.018, ecken=8))

# ---------- Verwaltung (rechts) mit Uhrturm ----------
VX0, VX1, VY0, VY1, VH = 0.75, 2.75, -1.2, 1.6, 2.9
T.append(quader("Verwaltung", ZIEGEL, (VX1 - VX0, VY1 - VY0, VH), ((VX0 + VX1) / 2, (VY0 + VY1) / 2, 0.1 + VH / 2), 0.012))
for z in (0.12, 1.05, 1.97, VH + 0.08):
    T.append(quader("Gesims", SANDST, (VX1 - VX0 + 0.08, VY1 - VY0 + 0.08, 0.08 if z > 0.2 else 0.18), ((VX0 + VX1) / 2, (VY0 + VY1) / 2, z + (0.04 if z > 0.2 else 0.09)), 0.012))
T.append(quader("Attika", ZIEGEL_D, (VX1 - VX0, VY1 - VY0, 0.25), ((VX0 + VX1) / 2, (VY0 + VY1) / 2, VH + 0.25), 0.01))
T.append(quader("Flachdach", BETON, (VX1 - VX0 - 0.15, VY1 - VY0 - 0.15, 0.05), ((VX0 + VX1) / 2, (VY0 + VY1) / 2, VH + 0.2), 0.005))
for geschoss, z in enumerate((0.6, 1.5, 2.42)):
    for i in range(4):
        x = VX0 + (VX1 - VX0) * (i + 0.5) / 4
        if geschoss == 0 and i == 1:
            continue  # Eingang
        T += fenster("VFront", GLAS, RAHMEN, (x, VY0, z), 0.28, 0.5, "y", -1, (2, 2), SANDST)
    for j in range(5):
        y = VY0 + (VY1 - VY0) * (j + 0.5) / 5
        T += fenster("VSeite", GLAS, RAHMEN, (VX1, y, z), 0.26, 0.5, "x", 1, (2, 2), SANDST)
# Eingang mit Treppe und Vordach
ex = VX0 + (VX1 - VX0) * 1.5 / 4
T.append(quader("Eingangstuer", RAHMEN, (0.32, 0.04, 0.6), (ex, VY0 - 0.03, 0.42), 0.006))
for k in range(3):
    T.append(quader("Stufe", BETON_H, (0.6, 0.14 + 0.12 * (2 - k), 0.05), (ex, VY0 - 0.07 - 0.06 * (2 - k), 0.12 + 0.05 * k), 0.006))
T.append(quader("Eingangsdach", KUPFER, (0.7, 0.4, 0.04), (ex, VY0 - 0.2, 0.86), 0.008))
T.append(quader("Firmenschild", RAHMEN, (1.3, 0.03, 0.22), ((VX0 + VX1) / 2, VY0 - 0.025, 2.0), 0.006))
# Klimageräte auf dem Dach
for x, y in ((1.3, 0.8), (2.2, 0.8)):
    T.append(quader("Klimageraet", STAHL, (0.4, 0.34, 0.22), (x, y, VH + 0.34), 0.015))
    T.append(zylinder("Klimaluefter", STAHL_D, 0.12, 0.03, (x, y, VH + 0.46), ecken=20, fase=0.004))
# Uhrturm an der Ecke vorne links der Verwaltung
TX, TY = 1.05, -0.9
T.append(quader("Turm", ZIEGEL, (0.62, 0.62, 1.6), (TX, TY, VH + 0.25 + 0.8), 0.012))
T.append(quader("Turmgesims", SANDST, (0.72, 0.72, 0.08), (TX, TY, VH + 1.88), 0.012))
for dx, dy, dr in ((0, -0.32, 0), (0, 0.32, 0), (-0.32, 0, 90), (0.32, 0, 90)):
    T.append(zylinder("Zifferblatt", UHR, 0.18, 0.02, (TX + dx, TY + dy, VH + 1.45), ecken=32, drehung=(math.radians(90), 0, math.radians(dr)), fase=0.004))
    T.append(ring("Uhrring", RAHMEN, 0.18, 0.012, (TX + dx, TY + dy, VH + 1.45), ecken=32) if False else zylinder("Uhrrand", RAHMEN, 0.2, 0.012, (TX + dx * 0.97, TY + dy * 0.97, VH + 1.45), ecken=32, drehung=(math.radians(90), 0, math.radians(dr)), fase=0.003))
T.append(zylinder("Haube", KUPFER, 0.52, 0.75, (TX, TY, VH + 2.3), ecken=4, r_oben=0.02, drehung=(0, 0, math.radians(45)), fase=0.01))
T.append(zylinder("Spitze", STAHL_D, 0.015, 0.35, (TX, TY, VH + 2.83), ecken=8, fase=0))

# ---------- Wasserturm (hinten rechts) ----------
WX, WY = 2.15, 2.25
for dx, dy in ((-0.35, -0.35), (0.35, -0.35), (0.35, 0.35), (-0.35, 0.35)):
    T.append(zwischen("Turmbein", STAHL_D, (WX + dx * 1.25, WY + dy * 1.25, 0.1), (WX + dx, WY + dy, 2.4), 0.03, ecken=8))
for z in (0.8, 1.6):
    pts = [(WX + sx * (0.35 + 0.087 * (2.4 - z) / 2.3 * 1.0), WY + sy * (0.35 + 0.087 * (2.4 - z) / 2.3 * 1.0), z) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1), (-1, -1))]
    for a, b in zip(pts, pts[1:]):
        T.append(zwischen("Turmriegel", STAHL_D, a, b, 0.016, ecken=6))
T.append(zylinder("Tank", ROST, 0.55, 0.9, (WX, WY, 2.85), ecken=32))
T.append(zylinder("Tankdach", STAHL_D, 0.6, 0.3, (WX, WY, 3.45), ecken=32, r_oben=0.05))
T.append(zylinder("Tankboden", STAHL_D, 0.55, 0.12, (WX, WY, 2.34), ecken=32, r_oben=0.58))
T += rohr_rund("Fallleitung", STAHL, [(WX, WY, 2.3), (WX, WY, 0.4), (WX - 0.5, WY, 0.25)], 0.04)
T += leiter("Tankleiter", STAHL_D, WX + 0.58, WY, 2.4, 3.3, richtung=0)

# ---------- Schornstein (hinten links) ----------
SX, SY = -2.35, 2.3
T.append(quader("Schornsteinsockel", ZIEGEL_D, (0.6, 0.6, 0.8), (SX, SY, 0.5), 0.015))
T.append(zylinder("Schornstein", ZIEGEL, 0.24, 4.6, (SX, SY, 0.9 + 2.3), ecken=24, r_oben=0.17))
for z in (1.6, 2.6, 3.6, 4.6):
    T.append(zylinder("Schornsteinband", STAHL_D, 0.24 - (z - 0.9) / 4.6 * 0.07 + 0.012, 0.04, (SX, SY, z), ecken=24, fase=0.004))
T.append(zylinder("Schornsteinkopf", ZIEGEL_D, 0.21, 0.18, (SX, SY, 5.25), ecken=24, r_oben=0.2))

# ---------- Hof: Paletten, Fässer, Laternen, Fahnenmast ----------
for i, (x, y) in enumerate(((-1.8, -2.1), (-1.4, -2.35), (-0.9, -2.0))):
    T.append(quader("Palette", HOLZ, (0.34, 0.34, 0.05), (x, y, 0.13), 0.004))
    T.append(quader("Kiste", HOLZ, (0.3, 0.3, 0.22 + 0.05 * i), (x, y, 0.27 + 0.025 * i), 0.01))
for x, y in ((0.2, -2.3), (0.33, -2.15), (0.18, -2.05)):
    T.append(zylinder("Fass", GRUEN, 0.08, 0.24, (x, y, 0.22), ecken=16, fase=0.006))
for x, y in ((-2.75, -2.75), (2.75, -2.75), (0.6, -2.75)):
    T.append(zylinder("Laternenmast", RAHMEN, 0.025, 1.4, (x, y, 0.8), ecken=8, fase=0))
    T.append(quader("Laterne", RAHMEN, (0.1, 0.1, 0.14), (x, y, 1.55), 0.008))
T.append(zylinder("Fahnenmast", STAHL, 0.025, 3.2, (-2.6, -2.6, 1.7), ecken=8, fase=0))

ausgeben("zentrale", T, groesse=2048, punkte={"licht": (TX, TY, VH + 3.0)})
vorschau(None, os.path.join(AUS, "zentrale_vorschau.png"), abstand=12.5, hoehe=8.0, z_mitte=1.5)
vorschau(None, os.path.join(AUS, "zentrale_vorschau_hinten.png"), abstand=12.5, hoehe=8.0, z_mitte=1.5, winkel=2.6)
