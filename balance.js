/* ===== Heirloom balance: fairer car prices so players can actually reach the dream cars ===== */
(function(){
'use strict';
if(typeof CARS==='undefined')return;
var P={hatch:4500,camry:9000,sedan:14000,hilux:18000,suv:22000,mustang:25000,lowrider:30000,range:38000,sports:40000,gwagon:52000,monster:60000,tesla:70000,hyper:90000,rolls:105000,peacock:115000,porsche:135000,ferrari:165000,huracan:175000,mclaren:215000,aventador:300000,chiron:420000,koenig:480000,skyfly:560000};
Object.keys(P).forEach(function(k){if(CARS[k])CARS[k].price=P[k]});
})();
