"""Generate an illustrative, meter-scale, Y-up Mini DC UPS glTF model.
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
    p=f'Cell_{j+1:02d}'; group(p,'Battery_Pack',((j-3.5)*.0195,-.004,-.004))
    cyl(p+'_Sleeve',.009,.0615,(0,0,0),cell,p)
    for side in [-1,1]:
        cyl(p+('_Positive' if side==1 else '_Negative'),.0087,.0014,(0,0,side*.0313),cellend,p)
    cyl(p+'_Button',.0038,.0010,(0,0,.0325),cellend,p)
for j,z in enumerate([-.032,.024]):box(f'Battery_Retainer_{j+1}',(.159,.0013,.005),(0,.0055,z),edge,'Battery_Pack',.0005)
# Two representative boards; independent groups for exploded view.
for p,z,d in [('PCB_Charger',-.046,.014),('PCB_Output',.040,.019)]:
    box(p+'_Substrate',(.153,.0017,d),(0,-.014,z),board,p,.0004)
    for j,x in enumerate(np.linspace(-.061,.061,7)):
        if j%3==0:
            box(f'{p}_IC_{j}',(.012,.003,.008),(x,-.0115,z),chip,p,.0003)
            for side in [-1,1]:
                for k in range(5):box(f'{p}_Pin_{j}_{side}_{k}',(.001,.0005,.0018),(x-.004+k*.002,-.0125,z+side*.0047),metal,p)
        elif j%3==1:
            cyl(f'{p}_Cap_{j}',.0038,.006,(x,-.010,z),chip,p,'y',24)
            cyl(f'{p}_Cap_Top_{j}',.0035,.0006,(x,-.0068,z),metal,p,'y',24)
        else:
            box(f'{p}_Inductor_{j}',(.010,.005,.009),(x,-.010,z),edge,p,.0007)
            box(f'{p}_Coil_{j}',(.006,.0006,.005),(x,-.0072,z),red,p,.0002)
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
    check=tm.load(path,force='scene'); required=['Case_Top','Case_Bottom','Battery_Pack','PCB_Charger','PCB_Output','Ports','Status_LED']
    assert all(n in check.graph.nodes for n in required)
    assert all(f'Cell_{j+1:02d}' in check.graph.nodes for j in range(8))
    print(path, path.stat().st_size, 'bytes',len(check.geometry),'meshes',len(check.graph.nodes),'nodes',sum(len(g.faces) for g in check.geometry.values()),'triangles',check.bounds)
