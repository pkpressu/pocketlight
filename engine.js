export const defaults=()=>({exposure:0,contrast:0,highlights:0,shadows:0,whites:0,blacks:0,temperature:0,tint:0,saturation:0,vibrance:0,sharpness:0,grain:0,vignette:0,rotate:0,flip:1,crop:1,cropX:50,cropY:50});
const clamp=x=>Math.max(0,Math.min(255,x));
// Identical pixel transform for preview and export. Grain is deterministic.
export function processPixels(data,w,h,s){const original=s.sharpness?new Uint8ClampedArray(data):null;const exposure=2**s.exposure,contrast=1+s.contrast/100;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let r=data[i],g=data[i+1],b=data[i+2];const lum=(.2126*r+.7152*g+.0722*b)/255;
 const lift=s.shadows*.65*(1-lum)**2+s.highlights*.65*lum**2+s.blacks*.4*(1-lum)**4+s.whites*.4*lum**4;
 r=(r*exposure+lift-128)*contrast+128+s.temperature*.35+s.tint*.12;g=(g*exposure+lift-128)*contrast+128-s.tint*.24;b=(b*exposure+lift-128)*contrast+128-s.temperature*.35+s.tint*.12;
 const gray=.2126*r+.7152*g+.0722*b;const spread=(Math.max(r,g,b)-Math.min(r,g,b))/255;const sat=1+s.saturation/100+s.vibrance/100*(1-Math.min(1,spread));r=gray+(r-gray)*sat;g=gray+(g-gray)*sat;b=gray+(b-gray)*sat;
 const dist=((x/w-.5)**2+(y/h-.5)**2)*2;const vig=1-s.vignette/100*Math.min(1,dist);const noise=(((Math.sin(x*12.9898+y*78.233)*43758.5453)%1+1)%1-.5)*s.grain*.6;
 for(let k=0;k<3;k++){let v=[r,g,b][k];if(original&&x>0&&y>0&&x<w-1&&y<h-1){const blur=(original[i-4+k]+original[i+4+k]+original[i-w*4+k]+original[i+w*4+k])/4;v+=(original[i+k]-blur)*s.sharpness/100;}data[i+k]=clamp(v*vig+noise);}}
 return data;
}
export function cropRect(w,h,s){const scale=Math.max(.1,Math.min(1,s.crop));const cw=Math.max(1,Math.round(w*scale)),ch=Math.max(1,Math.round(h*scale));return {x:Math.round((w-cw)*s.cropX/100),y:Math.round((h-ch)*s.cropY/100),w:cw,h:ch};}
