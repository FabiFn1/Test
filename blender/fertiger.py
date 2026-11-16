"""Fertiger (3 × 3 Felder): kleine Werkhalle mit Ziegelsockel, Wellblechwänden, Satteldach mit Lichtband,
Rolltor am Ausgang (+X, mittlere Reihe), Dachlüfter (dreht), Abluftrohr, Leuchte über dem Tor."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
BETON = beton("Beton", 0.58)
ZIEGEL = ziegel("Ziegel", (0.4, 0.13, 0.08), radius=0, skala=14)
WAND = wellblech("Wandblech", (0.62, 0.64, 0.62), skala=22)
DACH = wellblech("Dachblech", (0.3, 0.33, 0.36), skala=26, senkrecht=False)
STAHL = stahl("Stahl")
STAHL_D = stahl("Stahl_Dunkel", (0.15, 0.15, 0.16), 0.5)
GELB = lack("Lack_Gelb", (0.78, 0.55, 0.06))
TOR = wellblech("Torblech", (0.55, 0.42, 0.1), skala=30, senkrecht=False)
GLAS = lack("Glas", (0.2, 0.28, 0.32), 0.12, 0.2, False)

W, D, HS, HW, HD = 2.7, 2.7, 0.5, 1.75, 2.35  # Breite, Tiefe, Sockelhöhe, Traufhöhe, Firsthöhe
T = []
T.append(quader("Fundament", BETON, (2.94, 2.94, 0.12), (0, 0, 0.06), 0.03))
T.append(quader("Sockel", ZIEGEL, (W, D, HS), (0, 0, 0.12 + HS / 2), 0.02))
T.append(quader("Wand", WAND, (W - 0.04, D - 0.04, HW - HS - 0.12), (0, 0, (HS + 0.12 + HW) / 2), 0.015))
# Satteldach (First entlang X) aus zwei Flächen mit Überstand, Giebel in Wandblech
for seite in (-1, 1):
    neig = math.atan2(HD - HW, D / 2)
    T.append(quader("Dach", DACH, (W + 0.16, D / 2 / math.cos(neig) + 0.12, 0.05), (0, seite * D / 4, (HW + HD) / 2 + 0.03), 0.01, drehung=(-seite * neig, 0, 0)))
for x in (-W / 2 + 0.01, W / 2 - 0.01):
    T.append(flaeche("Giebel", WAND, [(x, -D / 2, HW), (x, D / 2, HW), (x, 0, HD)]))
T.append(quader("Lichtband", GLAS, (W - 0.4, 0.3, 0.03), (0, -0.55, (HW + HD) / 2 + 0.12), 0.01, drehung=(math.atan2(HD - HW, D / 2), 0, 0)))
# Rolltor auf der Ausgangsseite (+X, Mitte) und Torrahmen, Leuchte darüber
T.append(quader("Torrahmen", GELB, (0.06, 1.1, 1.25), (W / 2 + 0.01, 0, 0.12 + 0.62), 0.015))
T.append(quader("Tor", TOR, (0.05, 0.95, 1.12), (W / 2 + 0.03, 0, 0.12 + 0.56), 0.01))
T.append(quader("Leuchte", STAHL_D, (0.12, 0.25, 0.06), (W / 2 + 0.08, 0, 1.5), 0.01))
# Öffnungen mit Rahmen auf den anderen Seiten (Eingänge)
for x, y, ry in ((-W / 2 - 0.01, 0, 0), (0, -D / 2 - 0.01, 90), (0, D / 2 + 0.01, 90)):
    T.append(quader("Eingang", STAHL_D, (0.05, 0.7, 0.55), (x, y, 0.45), 0.01, drehung=(0, 0, math.radians(ry))))
# Fenster an der Längsseite
for x in (-0.9, 0, 0.9):
    T.append(quader("Fenster", GLAS, (0.5, 0.03, 0.4), (x, -D / 2 - 0.02, 1.2), 0.008))
    T.append(quader("Fensterrahmen", STAHL_D, (0.56, 0.02, 0.46), (x, -D / 2 - 0.005, 1.2), 0.006))
# Dachlüfter (dreht) und Abluftrohr
T.append(zylinder("Luefterhaus", STAHL, 0.2, 0.18, (0.3, 0.62, 2.22), ecken=20))
lufter = [zylinder("Luefterkappe", STAHL_D, 0.18, 0.06, (0.3, 0.62, 2.37), ecken=20, r_oben=0.05)]
for i in range(6):
    a = i / 6 * math.tau
    lufter.append(quader("Lamelle", STAHL_D, (0.14, 0.02, 0.07), (0.3 + 0.11 * math.cos(a), 0.62 + 0.11 * math.sin(a), 2.3), 0.003, drehung=(0, 0, a + 0.5)))
T.append(zylinder("Abluft", STAHL, 0.07, 0.75, (-1.18, -0.6, 2.15), ecken=14))
T.append(zylinder("Abluftkappe", STAHL_D, 0.12, 0.05, (-1.18, -0.6, 2.55), ecken=14, r_oben=0.06))
# Fallrohr und Rinne
for x in (-W / 2 + 0.1, W / 2 - 0.1):
    T.append(zylinder("Fallrohr", STAHL, 0.03, HW - 0.12, (x, -D / 2 - 0.06, (HW + 0.12) / 2), ecken=10, fase=0))

ausgeben("fertiger", T, bewegt=[(lufter, (0.3, 0.62, 2.37), "Lack_Dunkel")],
         punkte={"lampe": (W / 2 + 0.1, 0, 1.45), "rl": (W / 2 + 0.1, 0, 1.55), "dampf": (-1.18, 0.6, 2.6)})
vorschau(None, os.path.join(AUS, "fertiger_vorschau.png"), abstand=6.2, hoehe=4.0, z_mitte=1.1)
