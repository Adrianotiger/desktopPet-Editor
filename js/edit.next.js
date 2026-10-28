class NextEditor
{
  #baseNode;
  #div;
  #trash;
  #addNext;
  next;
  #originalStyle = {};

  constructor(parent, parentDiv)
  {
    this.#baseNode = parent;
    this.#trash = _CN("div", { class: "aniframeeditortrash" }, ["🗑️"]);
    this.#addNext = _CN("div", { class: "aniframeeditoradd" }, ["＋ "]);
    this.#div = _CN("div", {class:"aniframeeditor", style:"padding-right:30px;padding-top:15px;"}, [
        _CN("i", {}, ["Next animation:"]),
        this.#trash,
        this.#addNext
    ], parentDiv);
    this.next = [];

    let resize = _CN("button", {title:"Resize box", style:"position:absolute;right:6px;top:0px;line-height:12px;height:25px;"}, ["🗖"], parentDiv);
    resize.addEventListener("click", ()=>{
      this.#resize(parentDiv, resize);
    });

    this.#trash.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.#trash.style.transform = "scale(1.2)";
    });

    this.#trash.addEventListener("dragleave", () => {
      this.#trash.style.transform = "scale(1.0)";
    });

    this.#trash.addEventListener("drop", (e) => {
      this.#trash.style.transform = "scale(1.0)";
      if(this.#trash.style.opacity < 0.9) return;

      e.preventDefault();

      const removeIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      this.next.splice(removeIndex, 1);
      this.#renderNexts();
    });

    this.#addNext.addEventListener("click", ()=>{
      let xml = XML.createElement("next");
      xml.setAttribute("probability", "100");
      xml.setAttribute("only", "none");
      xml.textContent = "1";
      let newNext = new XMLAnimationsNext(xml);
      this.next.push(newNext);
      this.#baseNode.next.push(newNext);
      this.#renderNexts();
    });
    
    setTimeout(()=>{
      this.#baseNode?.next?.forEach(f=>{
        this.next.push(f);
      });

      this.#renderNexts();
    }, 100);
  }

  get div() { return this.#div; }

  #resize(parent, resize)
  {
    if(parent.style.position == "relative")
    {
      this.#originalStyle.width = parent.style.width;

      parent.style.position = "absolute";
      parent.style.top = "10px";
      parent.style.left = "50%";
      parent.style.transform = "translate(-35%, 0px)";
      parent.style.width = "60vw";
      parent.style.maxWidth = "600px";
      parent.style.height = "80vh";
      parent.style.backgroundColor = "var(--tab-bg)";
      parent.style.zIndex = 100;
      if(resize)resize.textContent = "🗗";
      this.#div.style.height = "60vh";
    }
    else
    {
      parent.style.position = "relative";
      parent.style.top = "";
      parent.style.left = "";
      parent.style.transform = "";
      parent.style.width = this.#originalStyle.width;
      parent.style.height = "";
      parent.style.zIndex = 1;
      if(resize)resize.textContent = "🗖";
      this.#div.style.height = "";
    }
  }

  #openPicker(nextIndex, aniIndex)
  {
    const div = _CN("div", {class:"anispritesheetselector"});
    let canvs = [];
    let img = XML.getImage();
    XML.getAnimations().forEach(ani=>{
      const canv = new AniCanvasClass(ani, img.getFrameWidth(), img.getFrameHeight());
      
      const b = _CN("div", {}, [canv.getCanvas(), _CN("i", {style:"font-size:12px;text-align:center;display:block;"}, [ani.name])], div);

      if(ani.id == aniIndex)
      {
        b.style.boxShadow = "inset 3px 3px 8px white, inset -3px -3px 8px lightblue, 0px 0px 5px var(--hover)";
        canv.getCanvas().style.opacity = 1.0;
      }

      canv.animate(true);
      canvs.push(canv);
      
      b.addEventListener("click", ()=>{
        canvs.forEach(c=>{c.animate(false);});
        this.next[nextIndex].value = ani.id;
        Msg.close();
        this.#renderNexts();
      });
      
    });

    setTimeout(()=>{
      let imgIndex = 0;
      [...div.getElementsByTagName("canvas")].forEach(i=>{
        if(imgIndex++ != aniIndex) i.style.opacity = 0.8;
      });
    }, 1000);

    Msg.show({title:"Select animation", content:div, buttons:["Cancel"]}, ()=>{
      canvs.forEach(c=>{c.animate(false);});
    });
  }

  #renderNexts()
  {
    while(this.#div.children.length > 3) this.#div.removeChild(this.#div.children[3]);
    this.#trash.style.opacity = 0.2;

    let newNexts = [];
    this.next.forEach((n, j)=>{
      const ani = XML.getAnimation(n.value);
      const c = new AniCanvasClass(ani, XML.getImage().getFrameWidth(), XML.getImage().getFrameHeight());
      const div = _CN("div", {class:"aninextitem", draggable:"true", "data-index":j}, [c.getCanvas()], this.#div);
      
      const editAni = _CN("a", {}, ["✏️(Edit) "]);
      editAni.addEventListener("click", (e)=>{
        e.stopPropagation();
        this.#resize(this.#div.parentNode);
      });

      const openAni = _CN("a", {}, ["📂(GoTo) "]);
      openAni.addEventListener("click", (e)=>{
        e.stopPropagation();
        const a = XML.getAnimation(ani.id);
        Menu.execute("animation", {ani:a});
      });
      
      let prob = _CN("input", {type:"number", min:1, max:100, value:n.probability, style:"padding:2px;text-align:center;"});
      let limit = _CN("select", {style:"padding:2px;"}, []);
      Object.entries(XMLValue.Only).forEach(([okey, oval]) => {
        const so = _CN("option", {value:oval}, [okey], limit);
        if(n.only == so.value) {so.selected = true; limit.value=so.value; }
      });

      prob.addEventListener("click", (e)=>{e.preventDefault();e.stopPropagation();});
      limit.addEventListener("click", (e)=>{e.preventDefault();e.stopPropagation();});

      prob.addEventListener("change", ()=>{n.probability = prob.value;});
      limit.addEventListener("change", ()=>{n.only = limit.value;});

      _CN("span", {class:"spanSmall"}, [
        editAni, openAni
      ], div);
      _CN("span", {class:"spanBig"}, [
        "Prob.: ", prob, " - ",
        "Limit: ", limit
      ], div);
      
      _CN("span", {style:"text-align:right;"}, [`[${ani.id}] ${ani.name} `], div);

      c.animate(true);

      newNexts.push(n);

      c.getCanvas().addEventListener("click", (e) => {
        this.#openPicker(j, n.value);
      });
      // remember index
      div.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", j);
        this.#trash.style.opacity = 1;
      });
      div.addEventListener("dragend", (e) => {
        this.#trash.style.opacity = 0.2;
      });
    });
    
    this.#baseNode.next = newNexts;
    
  }
};