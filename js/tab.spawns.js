
class SpawnsTabClass extends TabClass
{
  #buttons = [];
  #nextId;
  #canvas = [];
  #spawnsDiv = null;
  #spawnDiv = null;
  #currentSpawn = null;
  #deleteAdded = false;

  constructor()
  {
    super("Spawns");

    loadScripts(["edit.formula"], true);
  }
  
  async loadSpawns()
  {
    this.div.innerHTML = "";
    this.#buttons = [];
    this.#currentSpawn = null;

    this.#deleteAdded = false;

    _CN("h1", {}, ["Spawns"], this.div);
    _CN("hr", {style:"width:80%;margin:10px auto;"}, [], this.div);
    
    const img = XML.getImage();
    const w = (XML.getImage().getFrameWidth() + 10)+'px';
    const h = (XML.getImage().getFrameHeight() + 10 + 34)+'px';

    this.#nextId = 1;

    this.#canvas.forEach(c=>{c.animate(false);});
    this.#canvas = [];

    this.#spawnsDiv = _CN("div", {style:"width:30vw;height:60vh;overflow-y:auto;margin-left:3vw;padding:2vw;float:left;"}, [], this.div);
    this.#spawnDiv = _CN("div", {style:"width:50vw;padding:2vw;display:inline-block;"}, [], this.div);
        
    XML.spawns.forEach(spawn=>{
      const ani = XML.getAnimation(spawn.next[0].value);
      const canv = new AniCanvasClass(ani, img.getFrameWidth(), img.getFrameHeight());
      const i = _CN("i", {}, [`[${spawn.id}]`]);
      const s = _CN("span", {}, [`# ${spawn.id}`]);
      const b = _CN("button", {class:"anidiv", style:`--box-width:${w};--box-height:${h}`}, [canv.getCanvas(), i, s], this.#spawnsDiv);
      
      if(spawn.id >= this.#nextId) this.#nextId = spawn.id + 1;

      this.#buttons.push({
        b: b, 
        c: canv
      });

      this.#canvas.push(canv);
      
      b.addEventListener("click", ()=>{
        this.editSpawn(spawn);
      });
    });

    this.#canvas.forEach(c=>{c.animate(true);});
  }

  editSpawn(spawn)
  {
    let inputs = [];
    let input = null;
    this.#currentSpawn = spawn;

    if(!this.#deleteAdded)
    {
      TabMenu.addIcon("editdelete", "Remove spawn", ()=>{
        XML.deleteSpawn(this.#currentSpawn.id);
        Menu.execute("spawns");
      });
      this.#deleteAdded = true;
    }

    this.#spawnDiv.innerHTML = "";

    _CN("h2", {}, [`Spawn #${spawn.id}`, _CN("br")], this.#spawnDiv);

    _CN("div", {style:"margin-top:20px;"}, ["Spawn X:"], this.#spawnDiv);
    input = _CN("input", {type:"text", value:spawn.xOriginal, placeholder:'formula', name:"x", style:"width:100%;"}, [], this.#spawnDiv);
    inputs.push(input);

    _CN("div", {style:"margin-top:20px;"}, ["Spawn Y:"], this.#spawnDiv);
    input = _CN("input", {type:"text", value:spawn.yOriginal, placeholder:'formula', name:"y", style:"width:100%;"}, [], this.#spawnDiv);
    inputs.push(input);

    const nextInfo = _CN("div", {class:"infobox aniinfobox", id:spawn.id, style:`width:100%;position:relative;`}, [_CN("h3", {}, ["Next #" + spawn.id])], this.#spawnDiv);

    const ne = new NextEditor(spawn, nextInfo, {goto:true, minitems:1, maxitems:1, edit:false, attributes:[]});

    setTimeout(()=>{
      inputs.forEach((i)=>{
        i.addEventListener("change", ()=>{
          console.log("Input changed: " + i.name);
          this.updateNode(i);
        });
        if(i.placeholder == "formula")
        {
          Formula.extendInput(i, `Spawn #${spawn.id}.${i.name}`, spawn);
          /*
          i.addEventListener("focus", ()=>{
            Formula.show(i, `Spawn #${spawn.id}.${i.name}`, spawn);
          });
          i.setAttribute("readonly", true);
          */
        }
      });

      ne.onChanged((node)=>{
        if(XML.getSpawn(this.#currentSpawn.id))
        {
          if(XML.getSpawn(this.#currentSpawn.id)?.next?.length > 0)
          {
            XML.getSpawn(this.#currentSpawn.id).next.value = node.value;
            
          }
        }
      });
    }, 500);

  }

  updateNode(input)
  {
    const node = input.name.toLowerCase();
    const value = input.value;
    const spawn = XML.getSpawn(this.#currentSpawn.id);
    if(!spawn || !spawn[node])
    {
      console.error(`Node '${node}' not found in the spawn XML!`);
      return;
    }
    spawn[node] = value;
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
    try{this.#canvas?.forEach(c=>{c.animate(false);});}catch(e){};

    super.hide();
  }
  
};

const SpawnsTab = new SpawnsTabClass();