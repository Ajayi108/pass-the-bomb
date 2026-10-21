from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math
W,H=1200,630
im=Image.new('RGB',(W,H));pix=im.load()
for y in range(H):
 for x in range(W):
  glow=max(0,1-math.hypot((x-945)/650,(y-315)/500))
  pix[x,y]=(int(10+12*glow),int(29+40*glow),int(61+65*glow))
d=ImageDraw.Draw(im)
font=lambda size,bold=False:ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf',size)
d.rounded_rectangle((54,48,1146,582),radius=30,outline='#365f93',width=2)
d.text((90,95),'THE IN-PERSON PARTY GAME',font=font(20,True),fill='#ffd076',spacing=5)
d.text((86,171),'PASS THE',font=font(86,True),fill='#f4f8ff')
d.text((86,262),'BOMB.',font=font(104,True),fill='#ff8748')
d.text((90,399),'Pass the ball. Keep the beat.',font=font(28),fill='#d5e4f9')
d.text((90,440),'Don’t get caught!',font=font(28),fill='#d5e4f9')
d.rounded_rectangle((90,507,360,554),radius=23,fill='#1c426f',outline='#4c78aa',width=1)
d.text((112,516),'PLAY AT BOMB.AJAYI.NET',font=font(17,True),fill='#fff2d6')
# Original vector-style bomb illustration, drawn locally (no third-party artwork).
for r in [180,148]:d.ellipse((915-r,323-r,915+r,323+r),outline='#3a679a',width=2)
d.ellipse((800,458,1050,500),fill='#081b36')
d.rounded_rectangle((935,193,986,243),radius=10,fill='#15263d',outline='#7d99b6',width=3)
d.line([(962,198),(978,162),(1013,151),(1037,125)],fill='#e9b56b',width=8,joint='curve')
d.ellipse((803,223,1047,467),fill='#091629',outline='#7698be',width=4)
d.arc((827,247,1008,431),190,265,fill='#c3ddf7',width=8)
d.ellipse((844,263,868,289),fill='#6c98c7')
for a in range(0,360,45):
 rad=math.radians(a);d.line([(1038+math.cos(rad)*15,123+math.sin(rad)*15),(1038+math.cos(rad)*35,123+math.sin(rad)*35)],fill='#ffb34f',width=5)
d.ellipse((1028,113,1048,133),fill='#ffe38d')
im.save('assets/images/share-card-v1.png',optimize=True)
