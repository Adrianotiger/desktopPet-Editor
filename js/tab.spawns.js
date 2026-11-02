
class SpawnsTabClass extends TabClass
{
  #buttons = [];
  #nextId;
  #canvas = [];

  constructor()
  {
    super("Spawns");
  }
  
  async loadSpawns()
  {
    this.div.innerHTML = "";
    this.#buttons = [];
    _CN("h1", {}, ["Spawns"], this.div);
    _CN("hr", {style:"width:80%;margin:10px auto;"}, [], this.div);
    
    const img = XML.getImage();
    const w = (XML.getImage().getFrameWidth() + 10)+'px';
    const h = (XML.getImage().getFrameHeight() + 10 + 34)+'px';

    this.#nextId = 1;

    this.#canvas.forEach(c=>{c.animate(false);});
    this.#canvas = [];
        
    XML.spawns.forEach(spawn=>{
      const ani = XML.getAnimation(spawn.next[0].value);
      const canv = new AniCanvasClass(ani, img.getFrameWidth(), img.getFrameHeight());
      const i = _CN("i", {}, [`[${spawn.id}]`]);
      const s = _CN("span", {}, [`# ${spawn.id}`]);
      const b = _CN("button", {class:"anidiv", style:`--box-width:${w};--box-height:${h}`}, [canv.getCanvas(), i, s], this.div);
      
      if(spawn.id >= this.#nextId) this.#nextId = spawn.id + 1;

      this.#buttons.push({
        b: b, 
        c: canv
      });

      this.#canvas.push(canv);
      
      b.addEventListener("click", ()=>{
        Menu.execute("spawn", {spawn});
      });
    });

    this.#canvas.forEach(c=>{c.animate(true);});
    
  }
  
  show()
  {
    super.show();

    TabMenu.addIcon("editadd", "Add spawn", ()=>{
      XML.insertSpawn(this.#nextId);
      this.loadSpawns();
    });

    this.loadSpawns();
  }
  
  hide()
  {
    try{this.#canvas?.animate(false);}catch(e){};

    super.hide();
  }
  
  
};

const SpawnsTab = new SpawnsTabClass();