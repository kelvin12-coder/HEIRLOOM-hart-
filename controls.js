/* ===== Car controls: separate steer pad (left) and gas/brake pad (right); nitro + drift buttons already exist ===== */
(function(){
var css=document.createElement('style');
css.textContent='#app[data-m="drive"] #joy{display:none}#cpad{display:none}#app[data-m="drive"] #cpad{display:block}'
 +'.cp{position:absolute;pointer-events:auto;touch-action:none;border-radius:50%;background:rgba(14,18,30,.55);border:2px solid rgba(255,255,255,.35);color:#fff;font:800 28px system-ui,sans-serif;display:flex;align-items:center;justify-content:center;user-select:none;-webkit-user-select:none}.cp.on{background:rgba(255,176,32,.7)}'
 +'#cp_l{left:calc(14px + env(safe-area-inset-left,0px));bottom:16px;width:78px;height:78px}#cp_r{left:calc(104px + env(safe-area-inset-left,0px));bottom:16px;width:78px;height:78px}'
 +'#cp_u{right:178px;bottom:70px;width:70px;height:70px;font-size:30px;background:rgba(40,170,90,.45)}#cp_d{right:178px;bottom:0;width:62px;height:62px;background:rgba(220,70,70,.4)}'
 +'@media (max-height:480px){#cp_l,#cp_r{width:68px;height:68px;bottom:10px}#cp_r{left:calc(90px + env(safe-area-inset-left,0px))}#cp_u{bottom:62px;width:62px;height:62px}#cp_d{width:56px;height:56px}}';
document.head.appendChild(css);
var wrap=document.createElement('div');wrap.id='cpad';wrap.innerHTML='<div class="cp" id="cp_l" data-k="a">◀</div><div class="cp" id="cp_r" data-k="d">▶</div><div class="cp" id="cp_u" data-k="w">▲</div><div class="cp" id="cp_d" data-k="s">▼</div>';
var ctl=document.getElementById('ctl')||document.getElementById('app');ctl.appendChild(wrap);
[].forEach.call(wrap.querySelectorAll('.cp'),function(b){var k=b.getAttribute('data-k');
  b.addEventListener('pointerdown',function(e){e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}keys[k]=true;b.classList.add('on')});
  var up=function(){keys[k]=false;b.classList.remove('on')};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up)});
})();
