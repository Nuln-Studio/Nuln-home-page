(function(){
'use strict';
var reduceMotion=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
var canvas=document.getElementById('bg-canvas');
if(canvas){
var ctx=canvas.getContext('2d');
var W=0,H=0,DPR=1;
var rafId=null;
var running=true;
var dust=[];
var stars=[];
var beacons=[];
var nebulas=[];
var meteors=[];
var planet=null;
var STAR_COLORS=['255,255,255','216,200,255','168,200,255','255,232,184'];
function rand(a,b){return a+Math.random()*(b-a);}
function resize(){
DPR=Math.min(window.devicePixelRatio||1,2);
W=window.innerWidth;
H=window.innerHeight;
canvas.width=Math.round(W*DPR);
canvas.height=Math.round(H*DPR);
canvas.style.width=W+'px';
canvas.style.height=H+'px';
ctx.setTransform(DPR,0,0,DPR,0,0);
}
function initDust(){
dust=[];
var n=Math.min(140,Math.max(80,Math.round(W*H/14000)));
for(var i=0;i<n;i++){
dust.push({
x:Math.random()*W,
y:Math.random()*H,
r:rand(0.3,0.8),
base:rand(0.18,0.45),
tw:rand(0.6,2.2),
ph:Math.random()*Math.PI*2,
vx:rand(-0.06,0.06),
vy:rand(-0.05,-0.01)
});
}
}
function initStars(){
stars=[];
var n=Math.min(70,Math.max(35,Math.round(W*H/30000)));
for(var i=0;i<n;i++){
stars.push({
x:Math.random()*W,
y:Math.random()*H,
r:rand(0.7,1.6),
color:STAR_COLORS[Math.floor(Math.random()*STAR_COLORS.length)],
base:rand(0.4,0.85),
tw:rand(0.5,1.8),
ph:Math.random()*Math.PI*2,
vx:rand(-0.1,0.1),
vy:rand(-0.08,-0.02)
});
}
}
function initBeacons(){
beacons=[];
for(var i=0;i<8;i++){
beacons.push({
x:Math.random()*W,
y:Math.random()*H,
r:rand(1.8,3),
color:STAR_COLORS[Math.floor(Math.random()*STAR_COLORS.length)],
base:rand(0.6,0.95),
tw:rand(0.4,1.2),
ph:Math.random()*Math.PI*2,
rot:Math.random()*Math.PI*2,
rotSpeed:rand(-0.08,0.08),
vx:rand(-0.04,0.04),
vy:rand(-0.03,0.03)
});
}
}
function initNebulas(){
nebulas=[
{x:0.20,y:0.24,r:0.55,hue:258,sat:60,light:60,a:0.12,sx:0.08,sy:0.05,ph:0.0},
{x:0.80,y:0.55,r:0.62,hue:210,sat:65,light:55,a:0.12,sx:0.06,sy:0.09,ph:2.2},
{x:0.50,y:0.82,r:0.50,hue:310,sat:50,light:62,a:0.09,sx:0.10,sy:0.06,ph:4.1}
];
}
function makeMeteor(){
var ang=Math.random()*Math.PI*2;
return{
x:Math.random()*W,
y:Math.random()*H,
angle:ang,
speed:rand(0.8,1.6),
len:18+Math.floor(Math.random()*10),
trail:[],
hue:[258,215,318][Math.floor(Math.random()*3)],
w:rand(1.0,1.6),
baseA:rand(0.4,0.6),
bendFreq:rand(0.10,0.22),
bendPhase:Math.random()*Math.PI*2
};
}
function initMeteors(){
meteors=[];
for(var i=0;i<4;i++){
var m=makeMeteor();
m.vx=Math.cos(m.angle)*m.speed;
m.vy=Math.sin(m.angle)*m.speed;
for(var k=0;k<m.len;k++){
m.trail.push({x:m.x-m.vx*k,y:m.y-m.vy*k});
}
meteors.push(m);
}
}
function initPlanet(){
planet={
x:0.80,y:0.18,
r:rand(14,18),
tilt:-0.42,
moonAngle:Math.random()*Math.PI*2,
surface:null
};
}
function buildPlanetSurface(){
var r=planet.r;
var tw=Math.ceil(r*6);
var th=Math.ceil(r*2);
var sc=document.createElement('canvas');
sc.width=tw;
sc.height=th;
var sctx=sc.getContext('2d');
var bands=[
{y:0.00,h:0.10,c:'hsla(258,42%,34%,1)'},
{y:0.10,h:0.08,c:'hsla(252,46%,52%,1)'},
{y:0.18,h:0.06,c:'hsla(245,55%,68%,1)'},
{y:0.24,h:0.10,c:'hsla(258,40%,38%,1)'},
{y:0.34,h:0.07,c:'hsla(200,45%,52%,1)'},
{y:0.41,h:0.06,c:'hsla(245,55%,70%,1)'},
{y:0.47,h:0.10,c:'hsla(258,42%,34%,1)'},
{y:0.57,h:0.06,c:'hsla(252,46%,56%,1)'},
{y:0.63,h:0.08,c:'hsla(200,48%,48%,1)'},
{y:0.71,h:0.06,c:'hsla(245,55%,68%,1)'},
{y:0.77,h:0.11,c:'hsla(258,40%,36%,1)'},
{y:0.88,h:0.12,c:'hsla(252,42%,30%,1)'}
];
for(var y=0;y<th;y++){
var ty=(y/th+0.5)%1;
var wob=Math.sin(ty*Math.PI*2*3+Math.PI)*0.02+Math.sin(ty*Math.PI*9)*0.008;
var py2=ty+wob;
var color=bands[0].c;
for(var b=0;b<bands.length;b++){
if(py2>=bands[b].y&&py2<bands[b].y+bands[b].h){color=bands[b].c;break;}
}
sctx.fillStyle=color;
sctx.fillRect(0,y,tw,1);
sctx.fillStyle='rgba(255,255,255,'+(Math.random()*0.05).toFixed(2)+')';
sctx.fillRect(0,y,tw,1);
}
var sw=th*0.30,sh=th*0.16;
var sx=tw*0.42,sy=th*0.52;
sctx.save();
sctx.translate(sx,sy);
sctx.scale(1,sh/sw);
sctx.translate(-sx,-sy);
var sg=sctx.createRadialGradient(sx,sy,0,sx,sy,sw);
sg.addColorStop(0,'hsla(300,55%,66%,0.9)');
sg.addColorStop(0.6,'hsla(285,50%,55%,0.75)');
sg.addColorStop(1,'hsla(270,45%,45%,0)');
sctx.fillStyle=sg;
sctx.fillRect(sx-sw,sy-sh,sw*2,sh*2);
sctx.restore();
var lg=sctx.createLinearGradient(0,0,0,th);
lg.addColorStop(0,'rgba(255,255,255,0.28)');
lg.addColorStop(0.3,'rgba(255,255,255,0.05)');
lg.addColorStop(1,'rgba(0,0,0,0.1)');
sctx.fillStyle=lg;
sctx.fillRect(0,0,tw,th);
planet.surface=sc;
}
function drawRings(px,py,r,tilt){
var rings=[
{rx:r*1.7,ry:r*0.50,w:r*0.14,a:0.38,hue:230},
{rx:r*2.1,ry:r*0.62,w:r*0.22,a:0.50,hue:215},
{rx:r*2.6,ry:r*0.78,w:r*0.14,a:0.30,hue:245}
];
for(var i=0;i<rings.length;i++){
var rg=rings[i];
ctx.save();
ctx.translate(px,py);
ctx.rotate(tilt);
ctx.beginPath();
ctx.ellipse(0,0,rg.rx+rg.w,rg.ry+rg.w*0.45,0,0,Math.PI*2,false);
ctx.ellipse(0,0,rg.rx,rg.ry,0,0,Math.PI*2,true);
ctx.fillStyle='hsla('+rg.hue+',45%,72%,'+rg.a+')';
ctx.fill();
ctx.restore();
}
}
function drift(arr){
for(var i=0;i<arr.length;i++){
var s=arr[i];
s.x+=s.vx;
s.y+=s.vy;
if(s.y<-8){s.y=H+8;s.x=Math.random()*W;}
if(s.x<-8)s.x=W+8;
if(s.x>W+8)s.x=-8;
}
}
function shiftTrail(m,ox,oy){
for(var i=0;i<m.trail.length;i++){
m.trail[i].x+=ox;
m.trail[i].y+=oy;
}
}
function updateMeteors(t){
for(var i=0;i<meteors.length;i++){
var m=meteors[i];
m.angle+=Math.sin(t*m.bendFreq*0.001+m.bendPhase)*0.0012;
m.vx=Math.cos(m.angle)*m.speed;
m.vy=Math.sin(m.angle)*m.speed;
m.x+=m.vx;
m.y+=m.vy;
m.trail.unshift({x:m.x,y:m.y});
if(m.trail.length>m.len)m.trail.pop();
if(m.x<-60){var ox=W+120;m.x+=ox;shiftTrail(m,ox,0);}
else if(m.x>W+60){var ox=-(W+120);m.x+=ox;shiftTrail(m,ox,0);}
if(m.y<-60){var oy=H+120;m.y+=oy;shiftTrail(m,0,oy);}
else if(m.y>H+60){var oy=-(H+120);m.y+=oy;shiftTrail(m,0,oy);}
}
}
function drawNebulas(t){
for(var i=0;i<nebulas.length;i++){
var b=nebulas[i];
var cx=(b.x+Math.sin(t*b.sx*0.0009+b.ph)*0.10)*W;
var cy=(b.y+Math.cos(t*b.sy*0.0009+b.ph)*0.10)*H;
var r=b.r*Math.max(W,H)*0.55;
var breathe=1+0.08*Math.sin(t*0.0004+b.ph);
r*=breathe;
var g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
g.addColorStop(0,'hsla('+b.hue+','+b.sat+'%,'+b.light+'%,'+b.a+')');
g.addColorStop(1,'hsla('+b.hue+','+b.sat+'%,'+b.light+'%,0)');
ctx.fillStyle=g;
ctx.fillRect(cx-r,cy-r,r*2,r*2);
}
}
function drawPlanet(t){
if(!planet)return;
var px=planet.x*W;
var py=planet.y*H;
var r=planet.r;
if(!planet.surface)buildPlanetSurface();
var sc=planet.surface;
var srcW=r*2;
var roll=(t*0.05)%(sc.width-srcW);
ctx.save();
ctx.beginPath();
ctx.rect(0,0,W,py);
ctx.clip();
drawRings(px,py,r,planet.tilt);
ctx.restore();
ctx.save();
ctx.beginPath();
ctx.arc(px,py,r,0,Math.PI*2);
ctx.clip();
ctx.drawImage(sc,roll,0,srcW,r*2,px-r,py-r,srcW,r*2);
var sh=ctx.createRadialGradient(px-r*0.45,py-r*0.45,r*0.15,px,py,r*1.05);
sh.addColorStop(0,'rgba(255,255,255,0.18)');
sh.addColorStop(0.45,'rgba(255,255,255,0)');
sh.addColorStop(0.8,'rgba(0,0,0,0.28)');
sh.addColorStop(1,'rgba(0,0,0,0.55)');
ctx.fillStyle=sh;
ctx.fillRect(px-r,py-r,r*2,r*2);
ctx.restore();
var ag=ctx.createRadialGradient(px,py,r*0.85,px,py,r*1.18);
ag.addColorStop(0,'hsla(225,55%,72%,0.30)');
ag.addColorStop(1,'hsla(225,55%,72%,0)');
ctx.fillStyle=ag;
ctx.fillRect(px-r*1.2,py-r*1.2,r*2.4,r*2.4);
ctx.save();
ctx.beginPath();
ctx.rect(0,py,W,H-py);
ctx.clip();
drawRings(px,py,r,planet.tilt);
ctx.restore();
var ang=t*0.0004+planet.moonAngle;
var md=r*2.9;
var mx=px+Math.cos(ang)*md;
var my=py+Math.sin(ang)*md*0.5;
ctx.fillStyle='rgba(225,220,240,0.85)';
ctx.beginPath();
ctx.arc(mx,my,r*0.2,0,Math.PI*2);
ctx.fill();
}
function drawDust(t){
for(var j=0;j<dust.length;j++){
var s=dust[j];
var a=s.base*(0.6+0.4*Math.sin(t*s.tw*0.001+s.ph));
ctx.fillStyle='rgba(255,255,255,'+a.toFixed(3)+')';
ctx.beginPath();
ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
ctx.fill();
}
}
function drawStars(t){
for(var j=0;j<stars.length;j++){
var s=stars[j];
var a=s.base*(0.6+0.4*Math.sin(t*s.tw*0.001+s.ph));
ctx.fillStyle='rgba('+s.color+','+a.toFixed(3)+')';
ctx.beginPath();
ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
ctx.fill();
}
}
function drawBeacons(t){
for(var i=0;i<beacons.length;i++){
var b=beacons[i];
var a=b.base*(0.6+0.4*Math.sin(t*b.tw*0.001+b.ph));
var rot=b.rot+t*b.rotSpeed*0.001;
ctx.save();
ctx.translate(b.x,b.y);
ctx.rotate(rot);
var len=b.r*(3.2+0.8*Math.sin(t*b.tw*0.0007+b.ph));
ctx.strokeStyle='rgba('+b.color+','+(a*0.5).toFixed(3)+')';
ctx.lineWidth=1;
for(var k=0;k<4;k++){
var ang=k*Math.PI/2;
ctx.beginPath();
ctx.moveTo(Math.cos(ang)*b.r*0.6,Math.sin(ang)*b.r*0.6);
ctx.lineTo(Math.cos(ang)*len,Math.sin(ang)*len);
ctx.stroke();
}
ctx.restore();
ctx.fillStyle='rgba('+b.color+','+a.toFixed(3)+')';
ctx.beginPath();
ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
ctx.fill();
}
}
function drawMeteors(){
ctx.lineCap='round';
ctx.lineJoin='round';
for(var i=0;i<meteors.length;i++){
var m=meteors[i];
var n=m.trail.length;
if(n<2)continue;
for(var k=n-1;k>=1;k--){
var p0=m.trail[k];
var p1=m.trail[k-1];
var tt=k/n;
var fade=Math.pow(1-tt,1.5)*m.baseA;
var w=0.4+m.w*Math.pow(tt,1.2);
ctx.lineWidth=w;
ctx.strokeStyle='hsla('+m.hue+',62%,74%,'+fade.toFixed(3)+')';
ctx.beginPath();
ctx.moveTo(p1.x,p1.y);
ctx.lineTo(p0.x,p0.y);
ctx.stroke();
}
var head=m.trail[0];
ctx.fillStyle='hsla('+m.hue+',65%,82%,0.55)';
ctx.beginPath();
ctx.arc(head.x,head.y,2.4,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='rgba(255,255,255,0.9)';
ctx.beginPath();
ctx.arc(head.x,head.y,1.0,0,Math.PI*2);
ctx.fill();
}
}
function draw(t){
ctx.clearRect(0,0,W,H);
drawNebulas(t);
drawPlanet(t);
drawDust(t);
drawStars(t);
drawBeacons(t);
drawMeteors();
}
function frame(t){
if(!running)return;
drift(dust);
drift(stars);
drift(beacons);
updateMeteors(t);
draw(t);
rafId=requestAnimationFrame(frame);
}
function start(){
if(!running){running=true;rafId=requestAnimationFrame(frame);}
}
function stop(){
running=false;
if(rafId)cancelAnimationFrame(rafId);
}
window.addEventListener('resize',function(){
resize();
initDust();
initStars();
initBeacons();
initMeteors();
});
document.addEventListener('visibilitychange',function(){
if(document.hidden){stop();}else{start();}
});
resize();
initDust();
initStars();
initBeacons();
initNebulas();
initMeteors();
initPlanet();
if(reduceMotion){draw(0);}else{rafId=requestAnimationFrame(frame);}
}
var revealEls=document.querySelectorAll('.reveal');
if(revealEls.length){
revealEls.forEach(function(el){
var parent=el.parentElement;
var idx=0;
if(parent){
var kids=parent.children;
for(var i=0;i<kids.length;i++){
if(kids[i]===el){idx=i;break;}
}
}
el.style.transitionDelay=Math.min(idx*45,240)+'ms';
el.style.transition='opacity 0.4s cubic-bezier(0.22,0.61,0.36,1),transform 0.4s cubic-bezier(0.22,0.61,0.36,1)';
});
if('IntersectionObserver' in window&&!reduceMotion){
var io=new IntersectionObserver(function(entries){
entries.forEach(function(en){
if(en.isIntersecting){en.target.classList.add('in-view');}
else{en.target.classList.remove('in-view');}
});
},{threshold:0.12,rootMargin:'0px 0px -6% 0px'});
revealEls.forEach(function(el){io.observe(el);});
}else{
revealEls.forEach(function(el){el.classList.add('in-view');});
}
}
(function loopTyping(){
var h1El=document.querySelector('.brand h1');
var enEl=document.querySelector('.brand .en');
if(!h1El||!enEl) return;
var textZh='零阑工坊';
var textEn='Nuln Studio';
if(reduceMotion){
h1El.textContent=textZh;
enEl.textContent=textEn;
return;
}
h1El.textContent='';
enEl.textContent='';
function runCycle(){
var posZh=0;
var posEn=0;
function typeZh(){
if(posZh<textZh.length){
h1El.textContent=textZh.slice(0,posZh+1);
posZh++;
setTimeout(typeZh,180);
}else{
setTimeout(typeEn,400);
}
}
function typeEn(){
if(posEn<textEn.length){
enEl.textContent=textEn.slice(0,posEn+1);
posEn++;
setTimeout(typeEn,110);
}else{
setTimeout(delEn,2200);
}
}
function delEn(){
if(posEn>0){
enEl.textContent=textEn.slice(0,posEn-1);
posEn--;
setTimeout(delEn,100);
}else{
setTimeout(delZh,300);
}
}
function delZh(){
if(posZh>0){
h1El.textContent=textZh.slice(0,posZh-1);
posZh--;
setTimeout(delZh,120);
}else{
setTimeout(runCycle,500);
}
}
typeZh();
}
runCycle();
})();
var coarse=window.matchMedia('(pointer:coarse)').matches;
if(!reduceMotion&&!coarse){
document.querySelectorAll('.team-card,.repo-card,.download-card').forEach(function(card){
card.addEventListener('mousemove',function(e){
var r=card.getBoundingClientRect();
var px=(e.clientX-r.left)/r.width-0.5;
var py=(e.clientY-r.top)/r.height-0.5;
card.style.transition='transform 0.15s ease-out';
card.style.transform='perspective(700px) rotateX('+(-py*5).toFixed(2)+'deg) rotateY('+(px*5).toFixed(2)+'deg) translateY(-2px)';
});
card.addEventListener('mouseleave',function(){
card.style.transition='transform 0.35s cubic-bezier(0.22,0.61,0.36,1)';
card.style.transform='';
});
});
}
var nav=document.querySelector('.navbar');
if(nav){
function onScroll(){
nav.classList.toggle('scrolled',window.scrollY>8);
}
window.addEventListener('scroll',onScroll,{passive:true});
onScroll();
}
var yearSpan=document.getElementById('year');
if(yearSpan){
yearSpan.textContent=new Date().getFullYear();
}
})();
