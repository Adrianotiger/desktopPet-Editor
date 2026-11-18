
class ChildsTabClass extends TabClass
{
  #buttons = [];
  #nextId;
  #canvas = [];
  #childsDiv = null;
  #childDiv = null;
  #currentChild = null;
  #deleteAdded = false;

  constructor()
  {
    super("Childs");

    loadScripts(["edit.formula"], true);
  }
  
  async loadChilds()
  {
    this.div.innerHTML = "";
    this.#buttons = [];
    this.#currentChild = null;

    this.#deleteAdded = false;

    _CN("h1", {}, ["Childs"], this.div);
    _CN("hr", {style:"width:80%;margin:10px auto;"}, [], this.div);
    
    const img = XML.getImage();
    const w = (XML.getImage().getFrameWidth() + 10)+'px';
    const h = (XML.getImage().getFrameHeight() + 10 + 34)+'px';

    this.#nextId = 1;

    this.#canvas.forEach(c=>{c.animate(false);});
    this.#canvas = [];

    this.#childsDiv = _CN("div", {style:"width:30vw;height:60vh;overflow-y:auto;margin-left:3vw;padding:2vw;float:left;"}, [], this.div);
    this.#childDiv = _CN("div", {style:"width:50vw;padding:2vw;display:inline-block;"}, [], this.div);
        
    XML.childs.forEach(child=>{
      const ani = XML.getAnimation(child.id);
      const canv = new AniCanvasClass(ani, img.getFrameWidth(), img.getFrameHeight());
      const i = _CN("i", {}, [`[${child.id}]`]);
      const s = _CN("span", {}, [`# ${child.id}`]);
      const b = _CN("button", {class:"anidiv", style:`--box-width:${w};--box-height:${h}`}, [canv.getCanvas(), i, s], this.#childsDiv);
      
      if(child.id >= this.#nextId) this.#nextId = child.id + 1;

      this.#buttons.push({
        b: b, 
        c: canv
      });

      this.#canvas.push(canv);
      
      b.addEventListener("click", ()=>{
        this.editChild(child);
      });
    });

    this.#canvas.forEach(c=>{c.animate(true);});
  }

  editChild(child)
  {
    let inputs = [];
    let input = null;
    this.#currentChild = child;

    if(!this.#deleteAdded)
    {
      TabMenu.addIcon("editdelete", "Remove child", ()=>{
        XML.deleteChild(this.#currentChild.id);
        Menu.execute("childs");
      });
      this.#deleteAdded = true;
    }

    this.#childDiv.innerHTML = "";

    _CN("h2", {}, [`Parent #${child.id}`, _CN("br")], this.#childDiv);

    const parentInfo = _CN("div", {class:"infobox aniinfobox", id:child.id, style:`width:100%;position:relative;`}, [_CN("h3", {}, ["Next #" + child.id])], this.#childDiv);
    const neParent = new NextEditor(child, parentInfo, {goto:true, minitems:1, maxitems:1, attributes:[], edit:false}, "animationid");

    _CN("div", {style:"margin-top:20px;"}, ["Child X:"], this.#childDiv);
    input = _CN("input", {type:"text", value:child.xOriginal, placeholder:'formula', name:"x", style:"width:100%;"}, [], this.#childDiv);
    inputs.push(input);

    _CN("div", {style:"margin-top:20px;"}, ["Child Y:"], this.#childDiv);
    input = _CN("input", {type:"text", value:child.yOriginal, placeholder:'formula', name:"y", style:"width:100%;"}, [], this.#childDiv);
    inputs.push(input);

    const nextInfo = _CN("div", {class:"infobox aniinfobox", id:child.id, style:`width:100%;position:relative;`}, [_CN("h3", {}, ["Next #" + child.id])], this.#childDiv);

    const ne = new NextEditor(child, nextInfo, {goto:true, minitems:1, maxitems:1, attributes:[], edit:false});

    setTimeout(()=>{
      inputs.forEach((i)=>{
        i.addEventListener("change", ()=>{
          console.log("Input changed: " + i.name);
          this.updateNode(i);
        });
        if(i.placeholder == "formula")
        {
          i.addEventListener("focus", ()=>{
            Formula.show(i, `Child #${child.id}.${i.name}`, child);
          });
          i.setAttribute("readonly", true);
        }
      });

      ne.onChanged((node)=>{
        if(XML.getChild(this.#currentChild.id))
        {
          if(XML.getChild(this.#currentChild.id)?.next?.length > 0)
          {
            XML.getChild(this.#currentChild.id).next.value = node.value;
            
          }
        }
      });
    }, 500);

  }

  updateNode(input)
  {
    const node = input.name.toLowerCase();
    const value = input.value;
    if(!XML.getChild(this.#currentChild.id)?.next)
    {
      console.error(`Node '${node}' not found in the header XML!`);
      return;
    }
    XML.getChild(this.#currentChild.id).next[node] = value;
  }
  
  show()
  {
    super.show();

    TabMenu.addIcon("editadd", "Add child", ()=>{
      XML.insertChild(this.#nextId);
      this.loadChilds();
    });

    this.loadChilds();
  }
  
  hide()
  {
    try{this.#canvas?.forEach(c=>{c.animate(false);});}catch(e){};

    super.hide();
  }
  
  
};

const ChildsTab = new ChildsTabClass();