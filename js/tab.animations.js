let aniCanvasLetAnimate = false;

class AniCanvasClass
{
  #ani;
  #canvas;
  #ctx;
  #seq = [];
  #frames = [];
  #frameIndex;
  #lastTimestamp;
  #forceAni;
  #x = 0;
  #y = 0;
  #w = 0;
  #h = 0;
  #fullCanvas = false;
  constructor(ani, w, h)
  {    
    this.#ani = ani;
    this.#w = w;
    this.#h = h;
    this.#canvas = _CN("canvas", {width:w, height:h});
    this.#seq = [];
    this.#frameIndex = 0;

    this.#calcFrames(ani.sequence);

    this.#forceAni = false;
  }
  
  getCanvas()
  {
    return this.#canvas;
  }
  
  animate(force=false)
  {
    this.#forceAni = force;
    this.#lastTimestamp = 0;
    this.#frameIndex = 0;
    this.#ctx = this.#canvas.getContext('2d');
    if(this.#seq.length >= 0)
    {
      requestAnimationFrame((timestamp) => {
        this.#lastTimestamp = timestamp;
        this.#_animate(timestamp);
      });
    }
  }

  resizeCanvasToEmulateScreen(newW, newH)
  {
    this.#x = parseInt((newW - this.#w) / 2);
    this.#y = newH - this.#h;
    this.#canvas.height = newH;
    this.#canvas.width = newW;
    this.#fullCanvas = true;
  }

  updateFrames(seq)
  {
    this.#frames = [];
    this.#calcFrames(seq)
  }

  updateAni(ani)
  {
    this.#ani = ani;
    this.#frames = [];
    this.#calcFrames(ani.sequence)
  }

  #calcFrames(seq)
  {
    const start = this.#ani.start;
    const end = this.#ani.end;
    let totFrames = seq.frame.length;
    if(seq.repeat > 0)
      totFrames += seq.repeat * (seq.frame.length - seq.repeatfrom);

    this.#frameIndex = 0;
    this.#seq = [];
    
    seq.frame.forEach(f=>{
      const frame = {
        f:f.value, 
        i:parseInt(start.interval + (end.interval-start.interval) * this.#seq.length / totFrames), 
        o:start.opacity + (end.opacity-start.opacity) * this.#seq.length / totFrames,
        x:start.x + (end.x-start.x) * this.#seq.length / totFrames,
        y:start.y + (end.y-start.y) * this.#seq.length / totFrames,
        offy:start.offy + (end.offy-start.offy) * this.#seq.length / totFrames
      };
      this.#seq.push(frame);
      this.#frames.push(frame);
    });
    
    let ind = this.#seq.length;
    while(this.#seq.length < totFrames)
    {
      if(++ind >= seq.frame.length) ind = seq.repeatfrom;
      this.#seq.push({
        f:seq.frame[ind].value, 
        i:parseInt(start.interval + (end.interval-start.interval) * this.#seq.length / totFrames), 
        o:start.opacity + (end.opacity-start.opacity) * this.#seq.length / totFrames,
        x:start.x + (end.x-start.x) * this.#seq.length / totFrames,
        y:start.y + (end.y-start.y) * this.#seq.length / totFrames,
        offy:start.offy + (end.offy-start.offy) * this.#seq.length / totFrames
      });
    }
    if(seq.repeat == 0) this.#seq[0].i = 1000;
  }
  
  #_animate(currentTimestamp) 
  {
    if(aniCanvasLetAnimate || this.#forceAni)
      requestAnimationFrame(this.#_animate.bind(this));
    
    const timeElapsed = currentTimestamp - this.#lastTimestamp;

    if (timeElapsed >= this.#seq[this.#frameIndex].i) 
    {
      this.#lastTimestamp = currentTimestamp - (timeElapsed % this.#seq[this.#frameIndex].i);
      this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

      if(this.#fullCanvas) // use full canvas for animation
      {
        this.#x += this.#seq[this.#frameIndex].x;
        this.#y += this.#seq[this.#frameIndex].y;

        if(this.#x < 0) this.#x = this.#canvas.width - this.#w;
        else if(this.#x > this.#canvas.width - this.#w) this.#x = 0;
        if(this.#y < 0) this.#y = this.#canvas.height - this.#h;
        else if(this.#y > this.#canvas.height - this.#h) this.#y = 0;
      }
      
      this.#ctx.globalAlpha = this.#seq[this.#frameIndex].o;
      this.#ctx.drawImage(
        XML.getImage(this.#seq[this.#frameIndex].f), 
        this.#x, 
        this.#y
      );

      this.#frameIndex = (this.#frameIndex + 1) % this.#seq.length;
    }
  }
};

class AnimationsTabClass extends TabClass
{
  #buttons = [];
  constructor()
  {
    super("Animations");
    _CN("h1", {}, ["Animations"], this.div);
    
    document.body.addEventListener("xml", ev=>{
      if(ev?.detail?.action == "load") {
        Tabs.show(this);
        this.loadAnimations();
      }
    });
  }

  reload()
  {
    this.loadAnimations();
  }
  
  async loadAnimations()
  {
    this.div.innerHTML = "";
    this.#buttons = [];
    _CN("h1", {}, ["Animations"], this.div);
    
    const img = XML.getImage();
    const w = (XML.getImage().getFrameWidth() + 10)+'px';
    const h = (XML.getImage().getFrameHeight() + 10 + 34)+'px';
        
    XML.getAnimations().forEach(ani=>{
      const canv = new AniCanvasClass(ani, img.getFrameWidth(), img.getFrameHeight());
      const i = _CN("i", {}, [`[${ani.id}]`]);
      const s = _CN("span", {}, [ani.name]);
      const b = _CN("button", {class:"anidiv", style:`--box-width:${w};--box-height:${h}`}, [canv.getCanvas(), i, s], this.div);
      
      this.#buttons.push({
        b: b, 
        c: canv
      });
      
      b.addEventListener("click", ()=>{
        // As the animation can be changed on the fly, get the current one
        const a = XML.getAnimation(ani.id);
        Menu.execute("animation", {ani:a});
      });
      
    });
    
    setTimeout(()=>{
      XML.getAnimations().forEach((ani, j)=>{
        this.#buttons[j].c.animate();
      });
    }, 500);
  }
  
  show()
  {
    super.show();
    if(!aniCanvasLetAnimate)
    {
      aniCanvasLetAnimate = true;
      
      this.#buttons.forEach(b=>{
        b.c.animate();
      });
    }
    aniCanvasLetAnimate = true;
  }
  
  hide()
  {
    super.hide();
    aniCanvasLetAnimate = false;
  }
  
  
};

const AnimationsTab = new AnimationsTabClass();