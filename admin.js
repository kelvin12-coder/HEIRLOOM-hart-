(function(){
'use strict';
var $=function(i){return document.getElementById(i)},key='',timer=0;
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function api(b){return fetch('/api/admin',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({key:key},b))}).then(function(r){return r.json().then(function(j){j.http=r.status;return j})})}
function card(v,l){return'<div class="c"><b>'+esc(v)+'</b><span>'+esc(l)+'</span></div>'}
function draw(d){
  var like=d.yes+d.no?Math.round(d.yes*100/(d.yes+d.no))+'%':'–',today=d.days.length?d.days[d.days.length-1]:{n:0,s:0};
  $('cards').innerHTML=card(d.total,'total players')+card(d.online,'online now')+card(today.n,'new today')+card(today.s,'sessions today')+card(like,'like the game ('+d.yes+' 👍 / '+d.no+' 👎)')+card('₦'+Math.round(d.revenue.naira).toLocaleString('en-US'),'sales ('+d.revenue.count+' orders)');
  var mx=1;d.days.forEach(function(x){mx=Math.max(mx,x.n,x.s)});
  $('bars').innerHTML=d.days.map(function(x){return'<i style="height:'+(x.n/mx*100)+'%" title="'+x.d+' new '+x.n+'"></i><i class="s" style="height:'+(x.s/mx*100)+'%" title="'+x.d+' sessions '+x.s+'"></i>'}).join('');
  $('lab').innerHTML=d.days.map(function(x){return'<span>'+x.d.slice(5)+'</span>'}).join('');
  var pl=Object.keys(d.places).sort(function(a,b){return d.places[b]-d.places[a]});
  $('places').innerHTML=pl.length?pl.slice(0,15).map(function(k){return'<div class="pl"><span>'+esc(k)+'</span><b>'+d.places[k]+'</b></div>'}).join(''):'<span style="opacity:.6">No visits recorded yet</span>';
  var rd=Object.keys(d.revenue.days||{}).sort().slice(-7);$('rev').innerHTML=rd.length?rd.map(function(k){return'<div class="pl"><span>'+k+'</span><b>₦'+Math.round(d.revenue.days[k]).toLocaleString('en-US')+'</b></div>'}).join(''):'<span style="opacity:.6">No sales yet</span>';
  $('fb').innerHTML=d.feedback.length?d.feedback.map(function(f){return'<div class="fb"><span class="tag">'+esc(f.cat)+'</span><b>'+esc(f.name||'player')+'</b> <span style="opacity:.5;font-size:12px">'+new Date(f.t).toLocaleString()+'</span><div>'+esc(f.text)+'</div></div>'}).join(''):'<span style="opacity:.6">No feedback yet</span>';
  $('flags').innerHTML=d.flags.length?d.flags.slice().reverse().map(function(f){return'<div class="fb"><b>'+esc(f.id)+'</b> '+esc(f.user||'')+' · '+esc(f.why)+' <button data-u="'+esc(f.id)+'" style="padding:4px 10px;float:right">Un-suspend</button></div>'}).join(''):'<span style="opacity:.6">Nobody suspended</span>'}
function load(){api({act:'stats'}).then(function(d){if(d.http!==200){$('err').textContent=d.http===429?'Too many tries. Wait an hour.':'Wrong key';$('login').hidden=false;$('app').hidden=true;clearInterval(timer);return}
  $('login').hidden=true;$('app').hidden=false;draw(d)}).catch(function(){$('err').textContent='No connection'})}
$('go').onclick=function(){key=$('k').value.trim();if(!key)return;try{sessionStorage.setItem('hl-ak',key)}catch(e){}load();clearInterval(timer);timer=setInterval(load,30000)};
$('out').onclick=function(e){e.preventDefault();try{sessionStorage.removeItem('hl-ak')}catch(x){}key='';location.reload()};
$('flags').onclick=function(e){var u=e.target.getAttribute&&e.target.getAttribute('data-u');if(!u)return;api({unban:u}).then(load)};
try{var s=sessionStorage.getItem('hl-ak');if(s){key=s;$('k').value=s;load();timer=setInterval(load,30000)}}catch(e){}
})();
