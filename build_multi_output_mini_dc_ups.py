"""Generate an illustrative, meter-scale, Y-up Mini DC UPS glTF model (v2).
Prototype board appearance reconstructed from supplied reference photos.
No external texture files are required. Original exterior and animation group names preserved.
Requires numpy, scipy, trimesh, Pillow. Not a mechanical design.
"""
import math, pathlib
import numpy as np
import trimesh as tm
from PIL import Image, ImageDraw, ImageFont
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals

OUT = pathlib.Path(__file__).resolve().parent
scene=tm.Scene(base_frame='world')

def mat(name, rgb, metallic=0, rough=.45, emissive=None):
    return PBRMaterial(name=name,baseColorFactor=[*rgb,255],metallicFactor=metallic,roughnessFactor=rough,emissiveFactor=emissive)
plastic=mat('Graphite ABS',(40,42,45),0,.40)
lidmat=mat('Graphite lid',(58,60,62),0,.38)
edge=mat('Dark edge',(22,24,27),0,.5)
black=mat('Connector recess',(8,10,12),0,.58)
metal=mat('Brushed nickel',(182,186,187),.75,.30)
gold=mat('Gold contacts',(197,150,65),.65,.28)
board=mat('PCB green',(22,91,68),0,.52)
chip=mat('IC package',(33,36,41),0,.63)
cell=mat('Cell sleeve',(64,133,115),0,.40)
cellend=mat('Cell terminal',(170,176,180),.7,.30)
led=mat('Status light',(225,242,237),0,.25,[.45,.65,.58])
linkled=mat('Link LED',(110,158,72),0,.40,[.18,.32,.04])
red=mat('Copper red',(164,80,49),.55,.40)

def group(name,parent='Mini_DC_UPS',pos=(0,0,0)):
    scene.graph.update(frame_to=name,frame_from=parent,matrix=tm.transformations.translation_matrix(pos))

def add(name,mesh,material,parent,xyz=(0,0,0),rot=None):
    if material is not None: mesh.visual=TextureVisuals(material=material)
    t=tm.transformations.translation_matrix(xyz)
    if rot is not None: t=t@rot
    scene.add_geometry(mesh,node_name=name,geom_name=name,parent_node_name=parent,transform=t)

def rounded_box(ext,r=.001,n=4):
    ext=np.array(ext); r=min(r,min(ext)*.49)
    if r<=0: return tm.creation.box(extents=ext)
    # Minkowski sum of an inset cuboid and a sampled sphere.
    core=ext/2-r
    sph=tm.creation.uv_sphere(radius=r,count=[max(8,n*4),max(8,n*4)]).vertices
    # Include axis extrema for exact dimensions.
    sph=np.vstack((sph,np.eye(3)*r,-np.eye(3)*r))
    pts=np.vstack([sph+core*np.array([a,b,c]) for a in [-1,1] for b in [-1,1] for c in [-1,1]])
    return tm.convex.convex_hull(pts)

def box(name,ext,pos,material,parent,r=0):
    add(name,rounded_box(ext,r) if r else tm.creation.box(extents=ext),material,parent,pos)

def cyl(name,r,h,pos,material,parent,axis='z',sections=32):
    rot=None
    if axis=='y':rot=tm.transformations.rotation_matrix(-math.pi/2,[1,0,0])
    if axis=='x':rot=tm.transformations.rotation_matrix(math.pi/2,[0,1,0])
    add(name,tm.creation.cylinder(radius=r,height=h,sections=sections),material,parent,pos,rot)

def ring(name,ri,ro,depth,pos,material,parent,axis='z'):
    m=tm.creation.annulus(r_min=ri,r_max=ro,height=depth,sections=32)
    rot=tm.transformations.rotation_matrix(-math.pi/2,[1,0,0]) if axis=='y' else None
    add(name,m,material,parent,pos,rot)

def outline(w,d,r):
    a=[]
    for cx,cz,start in [(w/2-r,d/2-r,0),(-w/2+r,d/2-r,90),(-w/2+r,-d/2+r,180),(w/2-r,-d/2+r,270)]:
        for t in np.linspace(start,start+90,9):
            a.append([cx+r*math.cos(math.radians(t)),cz+r*math.sin(math.radians(t))])
    return np.array(a)

def shell_wall():
    o=outline(.18,.115,.009); i=outline(.174,.109,.006)
    y0,y1=-.017,.0115
    v=np.vstack([np.column_stack((p[:,0],np.full(len(p),y),p[:,1])) for p,y in [(o,y0),(o,y1),(i,y0),(i,y1)]])
    n=len(o); f=[]
    for j in range(n):
        k=(j+1)%n
        if abs(o[j,1]-.0575)<1e-8 and abs(o[k,1]-.0575)<1e-8: continue
        for a,b,c,d in [(j,k,n+k,n+j),(2*n+j,3*n+j,3*n+k,2*n+k),(n+j,n+k,3*n+k,3*n+j),(j,2*n+j,2*n+k,k)]:f.extend([[a,b,c],[a,c,d]])
    m=tm.Trimesh(vertices=v,faces=f,process=False);m.fix_normals(); m.invert(); return m

group('Mini_DC_UPS','world')
for name in ['Case_Bottom','Case_Top','Battery_Pack','PCB_Charger','PCB_Output','Ports']:
    group(name)
box('Bottom_Plate',(.180,.005,.115),(0,-.019,0),plastic,'Case_Bottom',.0023)
add('Side_Walls',shell_wall(),plastic,'Case_Bottom')
# Actual front cutouts: grid of wall tiles around connector openings.
openings=[(-.061,-.002,.018,.015),(-.037,-.002,.018,.015),(-.010,-.005,.015,.009),(.016,-.005,.016,.008),(.041,-.004,.012,.012),(.065,-.004,.012,.012)]
xs=sorted({-.081,.081,*[x+s*w/2 for x,y,w,h in openings for s in [-1,1]]})
ys=sorted({-.017,.0115,*[y+s*h/2 for x,y,w,h in openings for s in [-1,1]]})
parts=[]
for a,b in zip(xs,xs[1:]):
    for c,d in zip(ys,ys[1:]):
        x,y=(a+b)/2,(c+d)/2
        if any(abs(x-ox)<w/2 and abs(y-oy)<h/2 for ox,oy,w,h in openings):continue
        m=tm.creation.box(extents=(b-a,d-c,.003));m.apply_translation((x,y,.056));parts.append(m)
add('Front_Panel_Cutouts',tm.util.concatenate(parts),plastic,'Case_Bottom')
# Lid: wide-radius corners in XZ with a smaller bevel in Y.
# Build a rounded planar prism with tapered bevel rings.
def lid_mesh():
    layers=[(.178,.113,.009,.0117),(.180,.115,.0095,.0130),(.180,.115,.0095,.0188),(.177,.112,.0088,.0215)]
    v=np.vstack([np.column_stack((p[:,0],np.full(len(p),y),p[:,1])) for w,d,r,y in layers for p in [outline(w,d,r)]])
    n=len(v)//len(layers); f=[]
    for q in range(len(layers)-1):
        for j in range(n):
            k=(j+1)%n; a=q*n+j;b=q*n+k;c=(q+1)*n+k;d=(q+1)*n+j;f.extend([[a,b,c],[a,c,d]])
    for j in range(1,n-1):f.extend([[0,j+1,j],[(len(layers)-1)*n,(len(layers)-1)*n+j,(len(layers)-1)*n+j+1]])
    m=tm.Trimesh(vertices=v,faces=f,process=True);m.fix_normals();return m
add('Lid_Shell',lid_mesh(),lidmat,'Case_Top')
group('Status_LED','Case_Top')
for j in range(4):cyl(f'Status_LED_{j+1:02d}',.0014,.0007,(.032+j*.009,.02165,.036),led,'Status_LED','y',24)
# Four feet underneath.
for j,(x,z) in enumerate([(-.073,-.043),(.073,-.043),(-.073,.043),(.073,.043)]):
    cyl(f'Rubber_Foot_{j+1}',.004,.0015,(x,-.022,z),black,'Case_Bottom','y')
# Cell pack: eight individually addressable 18650-style cells, indicative arrangement.
for j in range(8):
    p=f'Cell_{j+1:02d}'; group(p,'Battery_Pack',((j-3.5)*.0195,-.0073,-.010))
    cyl(p+'_Sleeve',.009,.0615,(0,0,0),cell,p)
    for side in [-1,1]:
        cyl(p+('_Positive' if side==1 else '_Negative'),.0087,.0014,(0,0,side*.0313),cellend,p)
    cyl(p+'_Button',.0038,.0010,(0,0,.0325),cellend,p)
for j,z in enumerate([-.038,.018]):box(f'Battery_Retainer_{j+1}',(.159,.0013,.005),(0,.0024,z),edge,'Battery_Pack',.0005)
# Detailed prototype PCB reconstruction, from the supplied top-view photos.
# Dimensions and mounting inside the case are illustrative, not measured CAD.
import random
copper=mat('Copper winding',(181,99,41),.72,.32)
solder=mat('Solder tin',(185,190,190),.8,.32)
blue=mat('Blue trimmer housing',(25,87,167),0,.5)
terminal_blue=mat('Blue screw terminal',(25,91,167),0,.5)
terminal_green=mat('Green screw terminal',(72,137,64),0,.5)
wire_green=mat('Green wire insulation',(21,125,85),0,.48)
wire_teal=mat('Teal wire insulation',(22,120,116),0,.48)
wire_red=mat('Red wire insulation',(182,33,31),0,.48)
cap_green=mat('Green capacitor sleeve',(25,87,63),0,.46)
purple=mat('Purple breakout PCB',(85,40,104),0,.55)
rf_shield=mat('RF shield',(167,165,151),.75,.39)
light_yellow=mat('Yellow indicator',(244,192,32),0,.32,[.35,.22,.01])
FRONT_SURFACE=.00495

def text_texture(text,size=(256,128),bg=(40,42,45,255),fg=(220,220,215,255),font_size=32):
    im=Image.new('RGBA',size,bg); d=ImageDraw.Draw(im)
    try: f=ImageFont.truetype('DejaVuSans.ttf',font_size)
    except OSError: f=ImageFont.load_default()
    d.multiline_text((size[0]/2,size[1]/2),text,font=f,fill=fg,anchor='mm',align='center',spacing=3)
    return im

def top_texture(name,w,d,x,y,z,image,parent):
    # Top view: image top = back (-Z), image bottom = front (+Z).
    mesh=tm.Trimesh(vertices=[[-w/2,0,-d/2],[-w/2,0,d/2],[w/2,0,d/2],[w/2,0,-d/2]],faces=[[0,1,2],[0,2,3]],process=False)
    mesh.visual=TextureVisuals(uv=np.array([[0,1],[0,0],[1,0],[1,1]]),material=PBRMaterial(name=name+'_texture',baseColorTexture=image,metallicFactor=0,roughnessFactor=.65,doubleSided=True))
    add(name,mesh,None,parent,(x,y,z))

def perf_texture(kind,nx,nz):
    # Thousands of visible perforations as a baked texture, not thousands of meshes.
    step=24; w,h=nx*step,nz*step; rng=random.Random(42 if kind=='brown' else 71)
    base=(142,82,43) if kind=='brown' else (24,88,64)
    im=Image.new('RGB',(w,h),base); dr=ImageDraw.Draw(im)
    for iz in range(nz):
        for ix in range(nx):
            x,y=ix*step+step//2,iz*step+step//2
            shade=rng.randint(-13,13)
            if kind=='brown':
                c=tuple(max(0,min(255,v+shade)) for v in (196,133,75))
                dr.rounded_rectangle((x-9,y-9,x+9,y+9),radius=2,fill=c,outline=(115,66,34),width=1)
                dr.rectangle((x-4,y-4,x+4,y+4),fill=(76,39,23))
            else:
                c=tuple(max(0,min(255,v+shade)) for v in (133,168,148))
                dr.ellipse((x-9,y-9,x+9,y+9),fill=c,outline=(30,66,49),width=1)
                dr.ellipse((x-5,y-5,x+5,y+5),fill=(14,45,33))
    return im

class ProtoBoard:
    def __init__(self,parent,w,d,x,z,kind):
        self.p=parent; self.w=w; self.d=d; self.x=x; self.z=z; self.y=FRONT_SURFACE
        substrate=mat(kind+' perfboard substrate',(139,75,40) if kind=='brown' else (23,88,62),0,.64)
        box(parent+'_Substrate',(w,.0013,d),(x,self.y-.00065,z),substrate,parent)
        top_texture(parent+'_Perfboard',w,d,x,self.y+.000015,z,perf_texture(kind,90 if kind=='brown' else 45,45 if kind=='brown' else 28),parent)
        for i,(u,v) in enumerate([(.025,.055),(.975,.055),(.025,.945),(.975,.945)]):
            a,b=self.point(u,v); ring(parent+'_Mount_Washer_'+str(i),.0010,.0017,.00025,(a,self.y+.00014,b),metal,parent,'y')
    def point(self,u,v): return self.x+(u-.5)*self.w,self.z+(v-.5)*self.d
    def part(self,name,u,v,parent=None):
        x,z=self.point(u,v); group(name,parent or self.p,(x,self.y,z)); return name
    def path(self,name,points,material,r=.00043,parent=None):
        pts=[(*self.point(u,v),h) for u,v,h in points]
        tube(name,[(x,self.y+h,z) for x,z,h in pts],r,material,parent or self.p)
    def pad(self,name,u,v,r=.00048):
        x,z=self.point(u,v); cyl(name,r,.00034,(x,self.y+.00017,z),solder,self.p,'y',10)

def tube(name,points,r,material,parent,sections=8):
    # A continuous polyline with rounded joins; all pieces combined into one mesh.
    pts=np.asarray(points,float); pieces=[]
    for a,b in zip(pts,pts[1:]):
        delta=b-a; length=np.linalg.norm(delta)
        if length<1e-9: continue
        t=tm.geometry.align_vectors([0,0,1],delta/length); t[:3,3]=(a+b)/2
        m=tm.creation.cylinder(radius=r,height=length,sections=sections,transform=t); pieces.append(m)
    for p in pts[1:-1]:
        m=tm.creation.icosphere(subdivisions=1,radius=r); m.apply_translation(p); pieces.append(m)
    if pieces: add(name,tm.util.concatenate(pieces),material,parent)

def trimmer(b,name,u,v):
    p=b.part(name,u,v); box(p+'_Housing',(.0066,.0044,.0051),(0,.0022,0),blue,p,.00035)
    cyl(p+'_Screw',.0011,.0004,(.0015,.00455,-.0008),gold,p,'y',18)
    box(p+'_Slot',(.0015,.00010,.00024),(.0015,.00478,-.0008),black,p)
    for i in range(3): box(p+'_Lead_'+str(i),(.00045,.0003,.001),( (i-1)*.00165,.0002,.0028),metal,p)

def terminal(b,name,u,v,material):
    p=b.part(name,u,v); box(p+'_Body',(.0072,.0056,.0064),(0,.0028,0),material,p,.0003)
    for i,x in enumerate([-.0018,.0018]):
        cyl(p+'_Recess_'+str(i),.0012,.0002,(x,.00572,0),black,p,'y',18)
        cyl(p+'_Screw_'+str(i),.00085,.00024,(x,.0058,0),metal,p,'y',18)
        box(p+'_Slot_'+str(i),(.00115,.00008,.0002),(x,.00596,0),black,p)
        box(p+'_WireOpening_'+str(i),(.0020,.0021,.0002),(x,.0019,.00325),black,p)

def capacitor(b,name,u,v,r=.0018,h=.0051,material=cap_green,parent=None):
    p=b.part(name,u,v,parent); cyl(p+'_Sleeve',r,h,(0,h/2,0),material,p,'y',20)
    cyl(p+'_Top',r*.87,.00028,(0,h+.00005,0),metal,p,'y',20)
    for i,ext in enumerate([(r*1.2,.00008,.00013),(.00013,.00008,r*1.2)]): box(p+'_Vent_'+str(i),ext,(0,h+.00024,0),edge,p)

def ic(b,name,u,v,w=.005,d=.004,pins=5):
    p=b.part(name,u,v); box(p+'_Package',(w,.00165,d),(0,.00115,0),chip,p,.00018)
    for side in [-1,1]:
        for k in range(pins): box(p+'_Lead_%s_%s'%(side,k),(.00042,.00032,.0012),((k-(pins-1)/2)*w/pins,.00035,side*(d/2+.0004)),metal,p)

def header(name,p,x,z,count,along='z',pitch=.0015):
    ext=(.0022,.0023,count*pitch) if along=='z' else (count*pitch,.0023,.0022)
    box(name+'_Housing',ext,(x,.00115,z),black,p,.00012)
    for k in range(count):
        shift=(k-(count-1)/2)*pitch; a=x+(shift if along=='x' else 0); b=z+(shift if along=='z' else 0)
        box(name+'_Contact_'+str(k),(.00042,.0009,.00042),(a,.0026,b),gold,p)

def module_board(name,b,u,v,w,d,material):
    p=b.part(name,u,v); box(p+'_PCB',(w,.00085,d),(0,.001,0),material,p,.00012);return p

# Charger/power-management board: tan board, four trimmers, central green
# daughterboard, two long headers, label strip, terminals and point-to-point wiring.
a=ProtoBoard('PCB_Charger',.154,.064,0,-.021,'brown')
for i,(u,v) in enumerate([(.26,.09),(.375,.115),(.73,.20),(.81,.19)]): trimmer(a,f'Charger_Trimmer_{i+1:02d}',u,v)
for i,(u,v) in enumerate([(.026,.20),(.105,.93),(.975,.48)]): terminal(a,f'Charger_Terminal_{i+1:02d}',u,v,terminal_blue)
for i,(u,v) in enumerate([(.055,.145),(.078,.225),(.087,.77),(.096,.85)]): capacitor(a,f'Charger_Capacitor_{i+1:02d}',u,v,r=.00165,h=.0053)
for i,(u,v) in enumerate([(.11,.54),(.29,.34),(.92,.06),(.79,.83),(.87,.84),(.32,.59),(.16,.33)]): ic(a,f'Charger_Semiconductor_{i+1:02d}',u,v,w=.0048,d=.0040,pins=3)
p=a.part('Charger_Inductor_4R7',.29,.79); box(p+'_Body',(.009,.0042,.0075),(0,.0021,0),edge,p,.0004)
top_texture(p+'_Marking',.0078,.006,0,.00422,0,text_texture('4R7',bg=(49,52,56,255),font_size=48),p)
p=module_board('Charger_Daughterboard',a,.515,.50,.012,.020,board)
box(p+'_IC',(.005,.0015,.005),(0,.0022,0),chip,p,.00015)
for side in [-1,1]:
    for k in range(12): cyl(p+f'_Pad_{side}_{k}',.00047,.00025,(side*.0047,.00155,(k-5.5)*.00145),solder,p,'y',10)
top_texture(p+'_Silk',.005,.003,0,.00146,-.006,text_texture('CTRL',bg=(22,91,68,255),font_size=43),p)
p=a.part('Charger_Left_Header',.417,.50); header(p,p,0,0,13,pitch=.00155)
p=a.part('Charger_Right_Header',.615,.50); header(p,p,0,0,13,pitch=.00155)
p=a.part('Charger_Pin_Label',.568,.50); box(p+'_Base',(.0076,.00032,.0205),(0,.00016,0),metal,p)
# Small schematic signal names; transcription is illustrative, not wiring data.
labelim=Image.new('RGBA',(180,520),(238,236,226,255)); ld=ImageDraw.Draw(labelim)
try: lf=ImageFont.truetype('DejaVuSans.ttf',25)
except OSError: lf=ImageFont.load_default()
for i,t in enumerate(['VFB','ISNS','VREF','STAT2','STAT1','PG','TTC','TS','CE','ACDRV','ACOP','ACN']):
    y=i*43; ld.line((0,y,180,y),fill=(97,97,97,255),width=2);ld.text((90,y+21),t,font=lf,fill=(20,20,20,255),anchor='mm')
top_texture(p+'_Text',.0075,.0204,0,.00034,0,labelim,p)
for i,(u,v) in enumerate([(.378,.45),(.40,.63),(.82,.63)]):
    p=a.part(f'Charger_Indicator_{i+1}',u,v); cyl(p+'_Body',.00125,.0018,(0,.0011,0),light_yellow,p,'y',16)
# Point-to-point wire routes approximated visually from the photograph.
routes=[[(.06,.18),(.20,.18),(.20,.83),(.28,.83)],[(.09,.87),(.16,.91),(.64,.91),(.75,.89)],[(.20,.27),(.32,.27),(.42,.27)],[(.25,.10),(.25,.25),(.32,.25)],[(.35,.76),(.36,.63),(.35,.53),(.42,.53)],[(.65,.83),(.65,.72),(.78,.72),(.78,.47)],[(.88,.88),(.95,.80),(.97,.51)],[(.73,.10),(.94,.10)],[(.19,.53),(.28,.53),(.28,.70)],[(.45,.70),(.46,.78),(.52,.78)]]
for i,route in enumerate(routes): a.path('Charger_Wire_'+str(i),[(u,v,.00065) for u,v in route],wire_teal,.00036)
for i in range(7): a.path('Charger_Header_Jumper_'+str(i),[(.625,.39+i*.033,.00065),(.71,.39+i*.033,.00065),(.76,.42+i*.032,.00065),(.84,.42+i*.032,.00065)],wire_green,.00032)
a.path('Charger_Red_Bus',[(.40,.13,.00065),(.54,.16,.00065),(.87,.16,.00065)],wire_red,.00035)
# Solder at edges and near wire terminations, batched into a single mesh.
rng=random.Random(123); blobs=[]
for i in range(65):
    u=.025+i*.95/64
    for v in [.024,.976]:
        if rng.random()<.22: continue
        x,z=a.point(u,v); m=tm.creation.icosphere(subdivisions=1,radius=1);m.apply_scale((rng.uniform(.00055,.0012),.00032,rng.uniform(.00035,.0007)));m.apply_translation((x,a.y+.00015,z));blobs.append(m)
for route in routes:
    for u,v in [route[0],route[-1]]:
        x,z=a.point(u,v); m=tm.creation.icosphere(subdivisions=1,radius=.00065);m.apply_scale((1,.45,1));m.apply_translation((x,a.y+.00020,z));blobs.append(m)
add('Charger_Solder_Joints',tm.util.concatenate(blobs),solder,a.p)

# Output and MCU board: relative placement follows the green-board close-up.
b=ProtoBoard('PCB_Output',.065,.040,.018,.032,'green')
p=module_board('Output_Purple_Breakout',b,.17,.22,.018,.013,purple)
box(p+'_IC',(.004,.0014,.004),(0,.0022,0),chip,p,.00015)
for i in range(5):
    for s in [-1,1]: ring(p+f'_Pad_{s}_{i}',.0004,.00065,.00015,(s*.0077,.00148,(i-2)*.0024),solder,p,'y')
for i in range(5): box(p+'_Passive_'+str(i),(.001,.00065,.0007),((i-2)*.0022,.0018,.004),metal,p)
p=module_board('Output_MCU_ESP32_Style',b,.215,.77,.025,.012,chip)
box(p+'_RF_Shield',(.011,.0016,.0087),(.004,.00225,0),rf_shield,p,.00018)
top_texture(p+'_Shield_Legend',.0104,.008,.004,.00307,0,text_texture('ESP32\nMCU',bg=(160,160,148,255),fg=(235,235,225,255),font_size=34),p)
box(p+'_USB_Connector',(.004,.0022,.005),(-.011,.0025,0),metal,p,.0002)
box(p+'_USB_Recess',(.0002,.0012,.003),(-.0131,.0025,0),black,p)
for s in [-1,1]: header(p+f'_Header_{s}',p,0,s*.0052,15,'x',.0015)
for i in range(4): box(p+'_Passive_'+str(i),(.0014,.0006,.0012),(-.006+(i%2)*.002,.00175,(i//2-.5)*.003),metal,p)
p=module_board('Output_Buck_Converter',b,.54,.265,.013,.017,chip)
# Copper wound toroidal inductor, with separate ferrite core and winding.
ring(p+'_Toroid_Core',.00145,.00325,.00225,(-.001,.0031,-.003),edge,p,'y')
windings=[]
for k in range(24):
    phi=2*math.pi*k/24; pts=[]
    for t in np.linspace(0,2*math.pi,13):
        rad=.00235+.00112*math.cos(t); pts.append((-.001+rad*math.cos(phi),.0031+.00125*math.sin(t),-.003+rad*math.sin(phi)))
    for x0,x1 in zip(pts,pts[1:]):
        x0=np.array(x0);x1=np.array(x1);d=x1-x0;T=tm.geometry.align_vectors([0,0,1],d/np.linalg.norm(d));T[:3,3]=(x0+x1)/2
        windings.append(tm.creation.cylinder(radius=.00021,height=np.linalg.norm(d)+.00008,sections=6,transform=T))
add(p+'_Copper_Winding',tm.util.concatenate(windings),copper,p)
for i,z in enumerate([-.005,0,.0045]):
    cyl(p+'_Cap_'+str(i),.00145,.0035,(.004,.0032,z),cap_green,p,'y',16);cyl(p+'_CapTop_'+str(i),.00130,.00022,(.004,.00505,z),metal,p,'y',16)
box(p+'_Controller',(.004,.001,.003),(-.001,.002, .0045),chip,p)
p=module_board('Output_Secondary_Converter',b,.37,.29,.008,.012,chip)
box(p+'_Inductor',(.004,.0026,.004),(0,.0028,-.0026),edge,p,.00025)
for i,z in enumerate([.001,.004]): cyl(p+'_Cap_'+str(i),.0015,.003,(0,.003,z),metal,p,'y',16)
for i,(u,v) in enumerate([(.30,.43),(.45,.49),(.51,.58)]): ic(b,f'Output_Semiconductor_{i}',u,v,w=.0032,d=.003,pins=3)
terminal(b,'Output_Green_Terminal',.91,.89,terminal_green)
for i in range(4): b.path('Output_Green_Jumper_'+str(i),[(.18+i*.024,.13,.002),(.30+i*.017,.08,.0035),(.49+i*.013,.07,.0038),(.55,.035+i*.014,.002)],wire_green,.00042)
for i,route in enumerate([[(.28,.36),(.34,.43),(.43,.45)],[(.46,.50),(.54,.54),(.60,.49)],[(.88,.89),(.84,.82),(.79,.80)]]): b.path('Output_Red_Jumper_'+str(i),[(u,v,.0018) for u,v in route],wire_red,.00047)
# No rigid cross-board wires: the exploded groups can move independently.
# The connection is shown as two short harness ends; animate a separate flow path in R3F.
for i in range(3): b.path('Output_Harness_End_'+str(i),[(.50+i*.018,.045,.001),(.52+i*.018,.015,.003)],wire_green,.0004)

# Front ports: rectangular metal frames with visible recesses and contacts.
def rect_frame(prefix,x,y,w,h,parent,material=metal,th=.0011):
    for i,(ext,px,py) in enumerate([((w,th,.009),x,y+h/2-th/2),((w,th,.009),x,y-h/2+th/2),((th,h-2*th,.009),x-w/2+th/2,y),((th,h-2*th,.009),x+w/2-th/2,y)]):
        box(prefix+'_Frame_'+str(i),ext,(px,py,.054),material,parent)
    box(prefix+'_Back',(w-2*th,h-2*th,.001),(x,y,.049),black,parent)
for j,x in enumerate([-.061,-.037]):
    p=f'Port_PoE_{j+1}';group(p,'Ports');rect_frame(p,x,-.002,.0175,.0145,p)
    for k in range(8):box(f'{p}_Contact_{k+1}',(.00065,.00055,.005),(x+(k-3.5)*.00125,-.006,.0524),gold,p)
    for k,s in enumerate([-1,1]):box(f'{p}_Link_{k+1}',(.0027,.002,.001),(x+s*.0055,.0037,.0585),linkled,p,.00025)
p='Port_USB_A';group(p,'Ports');rect_frame(p,-.010,-.005,.0145,.0085,p,metal,.00085)
box('USB_Tongue',(.010,.0013,.006),(-.010,-.006,.053),edge,p)
for j in range(4):box(f'USB_Contact_{j+1}',(.001,.0004,.004),(-.010+(j-1.5)*.002,-.0052,.053),gold,p)
p='Voltage_Selector';group(p,'Ports');rect_frame(p,.016,-.005,.0155,.0075,p,edge,.001)
box('Selector_Slider',(.0045,.0048,.0035),(.013,-.005,.057),plastic,p,.0006)
for j in range(3):box(f'Selector_Grip_{j}',(.00035,.003,.00035),(.012+j*.001,-.005,.0589),edge,p)
for name,x in [('Port_DC_OUT',.041),('Port_DC_IN',.065)]:
    group(name,'Ports');box(name+'_Mount',(.0117,.0117,.007),(x,-.004,.053),edge,name,.0007)
    ring(name+'_Socket',.0032,.0047,.0025,(x,-.004,.057),black,name)
    cyl(name+'_Recess',.0032,.001,(x,-.004,.0525),black,name)
    cyl(name+'_Center_Pin',.0008,.003,(x,-.004,.055),metal,name)
# Front text, baked to a small transparent texture (not a physical specification label).
im=Image.new('RGBA',(1024,256),(0,0,0,0));dr=ImageDraw.Draw(im)
try: font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',26)
except OSError:font=ImageFont.load_default()
for x,y,s in [(0.008,.003,'5V'),(.016,.003,'9V'),(.024,.003,'12V'),(.041,-.0127,'OUT'),(.065,-.0127,'IN')]:
    px=(x+.081)/.162*1024;py=(.0115-y)/.0285*256
    dr.text((px,py),s,font=font,fill=(230,230,230,255),anchor='mm')
verts=np.array([[-.081,-.017,.05764],[.081,-.017,.05764],[.081,.0115,.05764],[-.081,.0115,.05764]])
m=tm.Trimesh(vertices=verts,faces=[[0,1,2],[0,2,3]],process=False)
m.visual=TextureVisuals(uv=np.array([[0,0],[1,0],[1,1],[0,1]]),material=PBRMaterial(name='Front legends',baseColorTexture=im,alphaMode='BLEND',roughnessFactor=.6,doubleSided=True))
add('Front_Legends',m,None,'Case_Bottom')

if __name__=='__main__':
    path=OUT/'mini-ups.glb';path.write_bytes(scene.export(file_type='glb',include_normals=True))
    check=tm.load(path,force='scene'); required=['Case_Top','Case_Bottom','Battery_Pack','PCB_Charger','PCB_Output','Ports','Status_LED','Charger_Daughterboard','Output_MCU_ESP32_Style','Output_Buck_Converter','Output_Purple_Breakout']
    assert all(n in check.graph.nodes for n in required)
    assert all(f'Cell_{j+1:02d}' in check.graph.nodes for j in range(8))
    print(path, path.stat().st_size, 'bytes',len(check.geometry),'meshes',len(check.graph.nodes),'nodes',sum(len(g.faces) for g in check.geometry.values()),'triangles',check.bounds)
