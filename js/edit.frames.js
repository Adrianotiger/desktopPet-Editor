class FrameEditor
{
  #seq;
  #div;
  #trash;
  #addFrame;
  #canvas;
  frames;

  constructor(seq, canvas, parent)
  {
    this.#seq = seq;
    this.#canvas = canvas;
    this.#trash = _CN("div", { class: "aniframeeditortrash" }, ["🗑️"]);
    this.#addFrame = _CN("div", { class: "aniframeeditoradd" }, ["＋ "]);
    this.#div = _CN("div", {class:"aniframeeditor"}, [
        _CN("i", {}, ["Frames:"]),
        this.#trash,
        this.#addFrame
    ], parent);
    this.frames = [];

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
      this.frames.splice(removeIndex, 1);
      this.#renderFrames();
    });

    this.#addFrame.addEventListener("click", ()=>{
      this.frames.push(0);
      this.#renderFrames();
    });
    
    setTimeout(()=>{
      this.#seq.frame.forEach(f=>{
        this.frames.push(f.value);
      });

      this.#renderFrames();
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
        this.#renderFrames();
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

  #moveFrame(fromI, toI) {
    const [movedElement] = this.frames.splice(fromI, 1);
    this.frames.splice(toI, 0, movedElement);
    this.#renderFrames();
  }

  #renderFrames()
  {
    while(this.#div.children.length > 3) this.#div.removeChild(this.#div.children[3]);
    this.#trash.style.opacity = 0.2;

    this.#seq.frame = [];
    this.frames.forEach((f, j)=>{
      const em = _CN("em", {}, [`[${j}]`]);
      const b = _CN("b", {}, [`-${f}-`]);
      const im = _CN("img", {src:XML.getImage(f).src});
      const s = _CN("span", {draggable:"true", "data-index":j}, [im, b, em], this.#div);

      this.#seq.frame.push(new XMLValue(f, XMLValue.Type.INT));

      s.addEventListener("click", (e) => {
        this.#openPicker(j, f);
      });
      // remember last index
      s.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", j);
        this.#trash.style.opacity = 1;
      });
      s.addEventListener("dragend", (e) => {
        this.#trash.style.opacity = 0.2;
      });
      s.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move"; 
      });
      s.addEventListener("drop", (e) => {
        e.preventDefault();
        this.#trash.style.opacity = 0.2;
        
        const originIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
        const destIndex = j;

        if (originIndex !== destIndex) {
          this.#moveFrame(originIndex, destIndex);
        }
      });
    });

    
    this.#canvas.updateFrames(this.#seq);
  }
};