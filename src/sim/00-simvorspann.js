/* ====== Vorspann der Simulation: läuft ohne Fenster, Grafik und Oberfläche ======
   Was die Simulation an die Oberfläche meldet (Hinweise, Geräusche), geht über SIMMELD an den Hauptstrang. */
'use strict';
const SIMMELD=[];
// Manche Module lesen Schalter von window (z. B. NEUOPT beim neuen Spiel)
const window=globalThis;
const SPEICHER=SW.speicher,EV=SW.ereignisse;
function toast(s){SIMMELD.push(['toast',s])}
function sfx(n){SIMMELD.push(['sfx',n])}
const SHELL={titel:false,pause:false};
const SET={};
const ERF=[],ERKL={};
let paused=false;
// Bedienung, die in Bau-Funktionen nachgefragt wird
const toastEl={dataset:{}};let pickRez=null;
