'use strict';
// ===================== AVIONES (despegan y aterrizan; los usan la ciudad y Alajuela) =====================
function jetPos(J,t){if(J.st)return J;const ph=((t+J.ph)%J.T+J.T)%J.T;let x,z;const rw=J.rw;if(rw){if(ph>22)return null;const k=ph/22;if(J.kind==='off'){x=rw.x0+rw.L*1.5*k*k;const xa=rw.x0+rw.L*.55;return{x,y:rw.y,z:x>xa?(x-xa)*.12:0,h:0,col:J.col}}x=rw.x0+rw.L*1.6-rw.L*1.5*(1-(1-k)*(1-k));const xb=rw.x0+rw.L*.8;return{x,y:rw.y,z:x>xb?(x-xb)*.12:0,h:Math.PI,col:J.col}}
  if(J.kind==='off'){if(ph>22)return null;const k=ph/22;x=300+2900*k*k;z=x>1700?(x-1700)*.09:0;return{x,y:150,z,h:0,col:J.col}}
  if(ph>22)return null;const k=ph/22;x=3300-2600*(1-(1-k)*(1-k));z=Math.max(0,(2700-x)*-.09+(x>2700?(x-2700)*.09:0));return{x,y:150,z:x>2700?(x-2700)*.1:0,h:Math.PI,col:J.col}}
function jet2D(g,sx,sy,h,z,col){g.save();g.translate(Math.round(sx+z*.4),Math.round(sy+z*.4));g.rotate(h);g.fillStyle='rgba(0,0,0,.28)';g.fillRect(-20,-2,40,5);g.fillRect(-4,-18,8,36);g.restore();
  g.save();g.translate(Math.round(sx),Math.round(sy));g.rotate(h);g.fillStyle='#f4f6f8';g.fillRect(-20,-2,40,5);g.beginPath();g.moveTo(-3,-18);g.lineTo(5,-18);g.lineTo(8,0);g.lineTo(5,18);g.lineTo(-3,18);g.lineTo(0,0);g.fill();
  g.fillRect(-19,-7,5,14);g.fillStyle=col;g.fillRect(-20,-1,40,1);g.fillRect(-19,-1,4,3);g.fillStyle='#2b3a55';g.fillRect(17,-1,2,3);g.restore()}
function jet3D(ctx,C,V,j){const c=Math.cos(j.h),s=Math.sin(j.h),pt=(a,b)=>[j.x+c*a-s*b,j.y+s*a+c*b],R2=(a0,a1,b0,b1)=>[pt(a0,b0),pt(a0,b1),pt(a1,b1),pt(a1,b0)],z=j.z;
  if(z<1)poly(ctx,proj(C,V,R2(20,-20,-2.6,2.6).map(p=>[p[0],p[1],.05])),'rgba(0,0,0,.3)');
  for(const sd of[-1,1])box(ctx,C,V,R2(4,-2,sd*6,sd*9),z+1.2,z+3.4,'#9aa0a6');
  box(ctx,C,V,R2(6,-6,-18,18),z+3,z+3.8,'#e6e9ec');box(ctx,C,V,R2(-14,-19,-7,7),z+6,z+6.6,'#e6e9ec');box(ctx,C,V,R2(-14,-20,-.5,.5),z+6.5,z+14,j.col);
  box(ctx,C,V,R2(20,-20,-2.6,2.6),z+2,z+7,'#f4f6f8',{win:'grid',near:true});box(ctx,C,V,R2(20.5,18,-1.6,1.6),z+4.5,z+6.2,'#2b3a55');box(ctx,C,V,R2(14,-16,-2.65,2.65),z+3.6,z+4.2,j.col)}
