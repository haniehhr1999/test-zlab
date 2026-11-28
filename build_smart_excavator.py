"""ZLab web visualization generator. Python 3; numpy, scipy, trimesh.
Concept geometry, not manufacturing CAD. Local modelling Z up; GLB root converts to Y up.
Every named group is independently transformable in Three.js. No baked animations.
"""
from pathlib import Path
import math, json
import numpy as np
import trimesh as tm
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals
from trimesh.transformations import translation_matrix as T, rotation_matrix as R
S=tm.Scene(base_frame='world')
S.graph.update(frame_to='Product',frame_from='world',matrix=R(-math.pi/2,[1,0,0]))
M={}
def material(n,c,metal=0,rough=.5,emit=None):
    M[n]=PBRMaterial(name=n,baseColorFactor=[*c,255],metallicFactor=metal,roughnessFactor=rough,emissiveFactor=emit)
for n,c,m,r in [('black',(28,32,36),0,.4),('rubber',(15,18,20),0,.82),('silver',(172,181,188),.72,.33),('steel',(83,92,99),.65,.45),('white',(232,235,233),0,.38),('yellow',(239,171,24),0,.4),('red',(201,43,36),0,.4),('green',(36,127,65),0,.52),('pcb',(24,100,75),0,.53),('blue',(35,87,174),0,.46),('navy',(24,54,90),0,.47),('gold',(209,164,66),.6,.35),('copper',(173,91,48),.65,.38),('purple',(115,51,136),0,.5),('glass',(23,55,73),.25,.18),('rock',(116,105,93),0,.92),('sand',(180,154,115),0,.92),('wood',(160,91,52),0,.65),('orange',(239,108,24),0,.45),('asphalt',(68,73,76),0,.9)]: material(n,c,m,r)
material('cyan',(41,218,231),.1,.25,[.1,.6,.7]);material('lime',(100,239,50),0,.35,[.15,.5,.03]);material('light',(237,246,255),0,.3,[.5,.5,.5]);material('amber',(255,194,30),0,.3,[.55,.2,0]);material('alert',(248,72,58),0,.35,[.55,.03,.02])
count=0
def group(n,p='Product',at=(0,0,0),rot=None):
    base=n; i=2
    while n in S.graph.nodes:
        n=f'{base}_{i:02d}'; i+=1
    S.graph.update(frame_to=n,frame_from=p,matrix=T(at)@(np.eye(4) if rot is None else rot));return n
def mesh(n,g,c,p='Product',at=(0,0,0),rot=None):
    global count
    count+=1;n=f'{n}_{count:04d}';g.visual=TextureVisuals(material=M[c]);S.add_geometry(g,node_name=n,geom_name=n,parent_node_name=p,transform=T(at)@(np.eye(4) if rot is None else rot));return n
def rounded(d,r):
    d=np.array(d,float);r=min(r,min(d)*.47)
    if r<=0:return tm.creation.box(extents=d)
    a=tm.creation.icosphere(subdivisions=2,radius=r).vertices
    corners=tm.creation.box(extents=d-2*r).vertices
    return tm.convex.convex_hull((a[None,:,:]+corners[:,None,:]).reshape(-1,3))
def box(n,d,at,c,p='Product',r=0,rot=None):return mesh(n,rounded(d,r),c,p,at,rot)
def cyl(n,r,h,at,c,p='Product',axis=(0,0,1),sections=24):return mesh(n,tm.creation.cylinder(radius=r,height=h,sections=sections),c,p,at,tm.geometry.align_vectors([0,0,1],axis))
def ball(n,d,at,c,p='Product',sub=2):
    g=tm.creation.icosphere(subdivisions=sub,radius=1);g.apply_scale(np.array(d)/2);return mesh(n,g,c,p,at)
def beam(n,a,b,w,c,p='Product',depth=None):
    a,b=np.array(a),np.array(b);v=b-a;return box(n,(w,depth or w,np.linalg.norm(v)),(a+b)/2,c,p,0,tm.geometry.align_vectors([0,0,1],v))
def rod(n,a,b,r,c,p='Product',sections=12):
    a,b=np.array(a),np.array(b);v=b-a;return cyl(n,r,np.linalg.norm(v),(a+b)/2,c,p,v,sections)
def path(n,pts,r,c,p='Product'):
    for a,b in zip(pts,pts[1:]):rod(n,a,b,r,c,p,8)
def ring(n,major,minor,at,c,p='Product',axis=(0,0,1)):
    g=tm.creation.torus(major_radius=major,minor_radius=minor,major_sections=40,minor_sections=10);return mesh(n,g,c,p,at,tm.geometry.align_vectors([0,0,1],axis))
def shell(n,rx,ry,z,rings,c,p='Product',th=.01):
    # Elliptical annular shell with two surfaces and closed rim.
    ang=np.linspace(0,2*np.pi,64,endpoint=False);verts=[]
    for offset in (0,th):
        for radius,h in rings:
            verts.extend([( (rx*radius-offset)*np.cos(t),(ry*radius-offset)*np.sin(t),z+h-offset) for t in ang])
    N=64;L=len(rings);f=[]
    for s in (0,1):
        for j in range(L-1):
            for i in range(N):
                a=s*N*L+j*N+i;b=s*N*L+j*N+(i+1)%N;face=[[a,b,b+N],[a,b+N,a+N]];f.extend(face if s==0 else [q[::-1] for q in face])
    for j in (0,L-1):
        for i in range(N):
            a=j*N+i;b=j*N+(i+1)%N;f.extend([[a,b,b+N*L],[a,b+N*L,a+N*L]])
    g=tm.Trimesh(vertices=verts,faces=f,process=True);g.fix_normals();return mesh(n,g,c,p)
def wheel(n,at,r,w,p='Product',axis=(1,0,0),tire='rubber',hub='silver'):
    p=group(n,p,at);cyl('Tire',r,w,(0,0,0),tire,p,axis,40);v=np.array(axis)*w*.53
    for side in (-1,1):
        cyl('Rim',r*.67,w*.09,v*side,hub,p,axis,32);cyl('Hub',r*.23,w*.13,v*side*1.1,'steel',p,axis)
        for i in range(5):
            a=i*2*np.pi/5;per=np.array([0,np.cos(a),np.sin(a)]) if axis[0] else np.array([np.cos(a),0,np.sin(a)]);cyl('Lug',r*.055,w*.04,v*side*1.18+per*r*.37,'black',p,axis,8)
    return p
def pcb(n,p,at,d=(.12,.08,.002),color='pcb',detail=True):
    q=group(n,p,at);x,y,z=d;box('Substrate',d,(0,0,0),color,q,.0004)
    for a in (-1,1):
        for b in (-1,1):ring('MountPad',min(x,y)*.035,min(x,y)*.009,(a*x*.43,b*y*.43,z*.65),'gold',q)
    if detail:
        for i in range(7):
            for j in range(3):
                xx=(i-3)*x*.10;yy=(j-1)*y*.19;box('SMD',(x*.035,y*.045,z*.6),(xx,yy,z*.85),'black' if (i+j)%3 else 'gold',q)
        for i in range(10):
            box('Trace',(x*.40,y*.007,z*.08),(0,(i-4.5)*y*.075,z*.54),'gold',q)
    return q
def chip(n,p,at,d=(.018,.022,.003),shield=False):
    q=group(n,p,at);x,y,z=d;box('Package',d,(0,0,0),'black',q,.0005)
    if shield:box('RF_Shield',(x*.86,y*.63,z*.35),(0,0,z*.67),'silver',q,.0004)
    for side in (-1,1):
        for i in range(10):box('Pin',(x*.10,y*.04,z*.25),(side*x*.52,(i-4.5)*y*.087,-z*.30),'gold',q)
    return q
def cap(n,p,at,r,h):
    q=group(n,p,at);cyl('Can',r,h,(0,0,h/2),'black',q);cyl('Top',r*.91,h*.045,(0,0,h*1.02),'silver',q);return q
def camera(n,p,at,s=.05,axis=(0,-1,0)):
    q=group(n,p,at,tm.geometry.align_vectors([0,0,1],axis));box('Housing',(s,s*.68,s*.60),(0,0,0),'black',q,s*.06);cyl('LensBarrel',s*.24,s*.20,(0,0,s*.37),'steel',q);cyl('Lens',s*.17,s*.035,(0,0,s*.49),'glass',q);return q
def screen(n,p,at,w,h,rot=None):
    q=group(n,p,at,rot);box('Bezel',(w,h,w*.055),(0,0,0),'black',q,w*.025);box('Panel',(w*.9,h*.84,w*.012),(0,0,w*.032),'glass',q,w*.009)
    for i in range(5):box('UIBar',(w*(.29+.07*(i%3)),h*.045,w*.004),(-w*.19,h*(.27-i*.115),w*.040),'cyan' if i==0 else 'silver',q)
    return q
def rocks(n,p,at,spread,num,scale,seed=1):
    rng=np.random.default_rng(seed);q=group(n,p,at)
    for i in range(num):
        x,y=rng.uniform(-.5,.5,2)*spread[:2];d=scale*rng.uniform(.6,1.5);g=tm.creation.icosphere(subdivisions=1,radius=d);g.vertices*=rng.uniform(.65,1.2,g.vertices.shape);mesh('Ore',g,'rock' if i%4 else 'sand',q,(x,y,d*.45),R(float(rng.uniform(0,6.28)),[0,0,1]))
    return q
def pit(n,p,at,rx,ry,depth):
    # Continuous terraced depression, descending inward, with alternating bench slopes.
    q=group(n,p,at);N=64;ang=np.linspace(0,2*np.pi,N,endpoint=False)
    profile=[(1.0,0),(.85,0),(.80,-.22),(.65,-.22),(.60,-.46),(.46,-.46),(.41,-.72),(.27,-.72),(.20,-1),(.001,-1)]
    for i,((r0,z0),(r1,z1)) in enumerate(zip(profile,profile[1:])):
        v=np.array([(r*rx*np.cos(t),r*ry*np.sin(t),z*depth) for r,z in [(r0,z0),(r1,z1)] for t in ang]);f=[]
        for j in range(N):
            k=(j+1)%N;f.extend([[j,k,k+N],[j,k+N,j+N]])
        g=tm.Trimesh(vertices=v,faces=f,process=False);mesh('Terrace',g,'sand' if i%2==0 else 'rock',q)
    return q

def finish(slug):
    dest=Path(__file__).resolve().with_name(slug+'.glb');dest.write_bytes(S.export(file_type='glb',include_normals=True));loaded=tm.load(dest,force='scene');assert len(loaded.geometry)>0 and np.isfinite(loaded.bounds).all();print(dest.name,len(loaded.geometry),sum(len(g.faces) for g in loaded.geometry.values()),dest.stat().st_size)

# Excavator | articulated boom, bucket with five highlighted teeth, camera, ore
# Machine geometry inferred from bucket photo; camera placement illustrative.
# Reference: https://z-lab.ir/projects/smart-excavator

def excavator():
    q=group('Track_Base');box('Undercarriage',(2.4,2.9,.4),(0,0,.52),'steel',q,.08)
    for x in (-1.05,1.05):
        box('Crawler',(.52,3.25,.72),(x,0,.43),'rubber',q,.18)
        for y in np.linspace(-1.38,1.38,17):
            box('Track_Shoe',(.58,.12,.07),(x,y,.82),'steel',q,.012)
        for y in np.linspace(-1.05,1.05,6):wheel('Roller',(x,y,.45),.23,.54,q)
    q=group('Upper_Carriage',at=(0,0,.82));cyl('Slew_Ring',.8,.23,(0,0,.1),'steel',q);box('Engine',(2.15,1.65,.93),(0,.35,.65),'yellow',q,.12);box('Cab',(.88,1.4,1.45),(-.66,-.53,1.12),'yellow',q,.10);box('Cab_Glass',(.76,.05,.92),(-.66,-1.24,1.25),'glass',q,.025)
    for j in range(8):box('Vent',(.85,.045,.018),(.48,.05+j*.13,1.13),'black',q)
    a=group('Boom',q,(.45,-.58,.78));beam('Boom_Main',(0,0,0),(0,-1.55,1.85),.36,'yellow',a,.48);rod('Hydraulic_Cylinder',(0,.12,-.15),(0,-.85,1.15),.12,'steel',a);rod('Piston',(0,-.85,1.15),(0,-1.43,1.64),.065,'silver',a)
    b=group('Stick',a,(0,-1.55,1.85));beam('Stick_Main',(0,0,0),(0,-1.48,-.55),.26,'yellow',b,.38);rod('Stick_Ram',(0,.10,.16),(0,-1.12,-.35),.065,'silver',b)
    k=group('Bucket',b,(0,-1.48,-.55));box('Bucket_Back',(1.28,.18,.83),(0,.12,-.38),'steel',k,.04);box('Bucket_Floor',(1.28,.84,.15),(0,-.22,-.76),'steel',k,.04)
    for x in (-.59,.59):box('Bucket_Cheek',(.13,.8,.77),(x,-.22,-.40),'steel',k,.045)
    for i in range(5):
        t=group(f'Tooth_{i+1:02d}',k,((i-2)*.25,-.70,-.75));box('Steel_Tooth',(.16,.35,.14),(0,0,0),'steel',t,.025);box('Detection_Highlight',(.165,.11,.145),(0,-.14,0),'lime',t,.012)
    rocks('Bucket_Ore',k,(0,-.21,-.64),(1,.55),14,.13);camera('Machine_Camera',q,(.76,-1.02,1.28),.20);box('Edge_AI_Unit',(.38,.3,.19),(.55,.4,1.22),'black',q,.025)

if __name__ == "__main__":
    excavator()
    finish('smart-excavator')
