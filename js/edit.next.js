class NextEditor
{
  #baseNode;
  #div;
  #trash;
  #addFrame;
  next;

  constructor(parent, parentDiv)
  {
    this.#baseNode = parent;
    this.#trash = _CN("div", { class: "aniframeeditortrash" }, ["🗑️"]);
    this.#addFrame = _CN("div", { class: "aniframeeditoradd" }, ["＋ "]);
    this.#div = _CN("div", {class:"aniframeeditor", style:"padding-right:30px;padding-top:15px;"}, [
        _CN("i", {}, ["Next animation:"]),
        this.#trash,
        this.#addFrame
    ], parentDiv);
    this.next = [];

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

    this.#addFrame.addEventListener("click", ()=>{
      this.next.push(0);
      this.#renderNexts();
    });
    
    setTimeout(()=>{
      this.#baseNode?.next?.forEach(f=>{
        this.next.push(f.value);
      });

      this.#renderNexts();
    }, 100);
  }

  get div() { return this.#div; }

  #openPicker(frameIndex, sheetIndex)
  {
    const div = _CN("div", {class:"anispritesheetselector"});
    let imgIndex = 0;
    while(imgIndex < XML.getImage().tilesx*XML.getImage().tilesy)
    {
      const imgInd = imgIndex++;
      const imgAni = XML.getImage(imgInd);

      const img = _CN("img", {src:imgAni.src}, [], div);
      if(imgInd == sheetIndex)
      {
        //img.style.backgroundColor = "white";
        img.style.boxShadow = "inset 3px 3px 8px white, inset -3px -3px 8px lightblue, 0px 0px 5px yellow";
        img.style.opacity = 1.0;
      }
      img.addEventListener("click", ()=>{
        this.frames[frameIndex] = imgInd;
        Msg.close();
        this.#renderNexts();
      });
    }

    setTimeout(()=>{
      let imgIndex = 0;
      [...div.getElementsByTagName("img")].forEach(i=>{
        if(imgIndex++ != sheetIndex) i.style.opacity = 0.8;
      });
    }, 1000);
    Msg.show({title:"Select frame", content:div, buttons:["Cancel"]});
  }

  #renderNexts()
  {
    while(this.#div.children.length > 3) this.#div.removeChild(this.#div.children[3]);
    this.#trash.style.opacity = 0.2;

    let newFrames = [];
    this.next.forEach((n, j)=>{
      const ani = XML.getAnimation(n);
      const c = new AniCanvasClass(ani, XML.getImage().getFrameWidth(), XML.getImage().getFrameHeight());
      const div = _CN("div", {class:"aninextitem", draggable:"true", "data-index":j}, [c.getCanvas()], this.#div);
      _CN("i", {style:"position:absolute;right:5px;bottom:0px;height:20px;left:unset;top:unset;width:80%;font-size:13px;text-align:right;"}, [`[${ani.id}] ${ani.name} `], div);
      console.log(ani);
      c.animate(true);

      //this.#seq.frame.push(new XMLValue(f, XMLValue.Type.INT));
      newFrames.push(new XMLValue(n, XMLValue.Type.INT));

      div.addEventListener("click", (e) => {
        this.#openPicker(j, n);
      });
      // remember last index
      div.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", j);
        this.#trash.style.opacity = 1;
      });
      div.addEventListener("dragend", (e) => {
        this.#trash.style.opacity = 0.2;
      });
    });
    
    this.#baseNode.frame = newFrames;
    
  }
};