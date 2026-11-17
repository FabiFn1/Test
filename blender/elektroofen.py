"""Elektroofen (3 x 3): Lichtbogenofen mit Gefäß, Deckel und drei Graphitelektroden auf Tragarmen, Transformatorhaus, Abgasrohr, Gießpfanne mit Glut am Ausgang (+X)."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403

leeren()
S = Satz()
T = fundament(S, 3)
T.append(quader("Ofenpodest", S.beton_h, (2.0, 2.0, 0.35), (-0.15, 0, 0.29), 0.03))
bx, by, _ = g2b((0.78, 0.92, 0.5))
T.append(zylinder("Gefaess", S.stahl_d, 0.62, 0.55, (-0.1, 0, 0.75), ecken=32))
for z in (0.6, 0.85):
    T.append(zylinder("Kuehlring", S.blau, 0.635, 0.05, (-0.1, 0, z), ecken=32, fase=0.006))
T.append(zylinder("Deckel", S.stahl_d, 0.66, 0.18, (-0.1, 0, 1.12), ecken=32, r_oben=0.45))
for i in range(3):
    a = i / 3 * math.tau + 0.5
    ex, ey = -0.1 + 0.2 * math.cos(a), 0.2 * math.sin(a)
    T.append(zylinder("Elektrode", S.stahl, 0.07, 1.1, (ex, ey, 1.65), ecken=16))
    T.append(quader("Tragarm", S.gelb, (1.0, 0.1, 0.1), (ex - 0.5, ey, 2.2), 0.012))
    T.append(zwischen("Stromleitung", S.rost, (ex - 1.0, ey, 2.2), (-1.35, ey * 1.2, 1.6), 0.03, ecken=8))
T.append(zylinder("Saeule", S.gelb, 0.1, 2.15, (-1.1, 0, 1.2), ecken=16))
# Transformatorhaus und Abgasrohr
T += halle(S, -1.45, -0.8, 0.6, 1.4, 1.35, dach="flach", wand=S.wand, sockel=S.beton_h, sockel_h=0.3, fenster_seiten=())
T += rohr_rund("Abgas", S.rost, [(-0.1, 0.4, 1.25), (-0.1, 0.8, 1.6), g2b((-0.9, 2.55, 0.8))], 0.1)
# Gießpfanne mit Glut am Ausgang
T.append(zylinder("Pfanne", S.rost, 0.24, 0.32, (bx, by, 0.36), ecken=24, r_oben=0.28))
glut = [zylinder("GlutPfanne", S.glut, 0.25, 0.02, (bx, by, 0.52), ecken=24, fase=0)]
T.append(quader("Abstichrinne", S.stahl_d, (0.45, 0.14, 0.06), (0.45, 0, 0.62), 0.01))
glut.append(quader("GlutRinne", S.glut, (0.4, 0.09, 0.02), (0.45, 0, 0.66), 0.002))
T += buehne("Buehne", S.rost_g, S.gelb, 0.6, -1.4, 1.38, -0.6, 0.85, S.gelb, offen=("x0",))
T += treppe("Treppe", S.gelb, (1.2, -1.2, 0.12), (1.2, -0.62, 0.85), breite=0.25, gelaender_mat=S.gelb)
ausgeben("elektroofen", T, leuchtend=glut)
vorschau(None, os.path.join(AUS, "elektroofen_vorschau.png"), abstand=7, hoehe=4.4, z_mitte=1.0)
