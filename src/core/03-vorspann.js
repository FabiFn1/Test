<script>
'use strict';
/* Kern-Module (src/kern, von Vite gebaut): Ablage, Ereignis-Bus, Simulationstakt, Instanz-Puffer */
const SPEICHER=SW.speicher,EV=SW.ereignisse;
if(!window.THREE){document.body.insertAdjacentHTML('beforeend','<div id="fehler">Die 3D-Bibliothek konnte nicht geladen werden. Bitte lade die Seite neu.</div>');throw new Error('THREE fehlt')}
