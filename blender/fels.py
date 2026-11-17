"""Felsbrocken für die Umwelt und die Erzfelder: verformte Kugel mit Bruchkanten, Foto-Textur Fels (CC0).
Mittelpunkt im Ursprung, Radius etwa 1 (wie ROCKG im Spiel); das Spiel färbt je Instanz ein (Erzsorte)."""
import math
import os
import sys
import bpy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemeinsam import *  # noqa: E402,F403
from gemeinsam import _fertig  # noqa: E402

leeren()
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=5, radius=1.0)
ob = bpy.context.active_object
ob.name = "Fels"
tx = bpy.data.textures.new("FelsForm", type="VORONOI")
tx.noise_scale = 0.9
tx.distance_metric = "DISTANCE"
m = ob.modifiers.new("Bruch", "DISPLACE")
m.texture = tx
m.strength = -0.32
m.mid_level = 0.5
tx2 = bpy.data.textures.new("FelsKorn", type="CLOUDS")
tx2.noise_scale = 0.35
m2 = ob.modifiers.new("Korn", "DISPLACE")
m2.texture = tx2
m2.strength = 0.12
ob.scale = (1.0, 1.0, 0.82)
bpy.ops.object.transform_apply(scale=True)
for mod in list(ob.modifiers):
    bpy.ops.object.modifier_apply(modifier=mod.name)
d = ob.modifiers.new("Weniger", "DECIMATE")
d.ratio = 0.12
bpy.ops.object.modifier_apply(modifier=d.name)
mat = foto("Fels", "fels", skala=1.1, relief=1.0, schmutz=0.25)
_fertig(ob, mat, glatt=True)
ausgeben("fels", [ob], groesse=1024)
vorschau(None, os.path.join(AUS, "fels_vorschau.png"), abstand=4.0, hoehe=2.0, z_mitte=0.0)
