class DotViewerTabClass extends TabClass
{ 
  #div = null;
  #dottool = null;
  #viz = null;
  #svgdiv = null;

  constructor()
  {
    super("Dot Viewer");

    _CN("h1", {}, ["Dot Viewer"], this.div);
    _CN("hr", {}, [], this.div);
    
    loadScripts(["dottool"]);

    this.#div = _CN("div", {}, [], this.div);
    
  }

  show(params)
  {
    super.show(params);
    
    this.#dottool = new DotTool(XML);
    
    this.#div.innerHTML = "";

    let butt = _CN("button", {style:"width:30vw;margin:10px;"}, ["Generate DOT-tree"], this.#div);
    butt.addEventListener("click", ()=>{
      butt.style.display = "none";
      this.#genTree();
    });
  }

  #genTree()
  {
    const tree = this.#dottool.createTree();
    const dotText = this.#dottool.toDot(tree);

    _CN("textarea", {style:"width:90vw;height:40vh;overflow-y:scroll;"}, [dotText], this.#div);

    let info = _CN("div", {}, [""], this.#div);

    if(dotText.split("\n").length > 1500)
      info.textContent = "ATTENTION: This is a huge dot-file! This can block your browser for 10-20 minutes!";
    else if(dotText.split("\n").length > 1100)
      info.textContent = "ATTENTION: This is a big dot-file! This can block your browser for 2-3 minutes!";
    else if(dotText.split("\n").length > 800)
      info.textContent = "NOTE: This is a big dot-file! It need up to 1 minute to process!";
    

    let butt = _CN("button", {style:"width:30vw;margin:10px;"}, ["Load viewer (1.2MB)"], this.#div);
    butt.addEventListener("click", ()=>{
      info.textContent = "Loading script...";
      loadScripts(["../3thparty/viz-global"], true).then(()=>{
        info.textContent = "Generating Viz...";
        this.#genViz(info, dotText);

        butt.textContent = "show Graph";
      });
    });

    console.log(tree);
  }

  async #genViz(info, dotText)
  {
    if(this.#viz == null) this.#viz = await Viz.instance();
    info.textContent = "Generating Viz...";
    const svg = this.#viz.renderSVGElement(dotText);
    info.textContent = "";

    if(this.#svgdiv) this.#svgdiv.remove();
    const svgdiv = _CN("div", {
      style:"position:absolute;inset:0;width:100%;height:100%;overflow:hidden;background:var(--tab-bg);"
    }, [svg], this.div);
    this.#svgdiv = svgdiv;

    svg.style.backgroundColor = "#eee";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.display = "block";
    svg.style.touchAction = "none";
    svg.style.cursor = "grab";
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    const initialViewBox = svg.viewBox.baseVal;
    if(initialViewBox.width <= 0 || initialViewBox.height <= 0)
      throw new Error("Cannot pan or zoom an SVG without a valid viewBox");

    const viewBox = {
      x: initialViewBox.x,
      y: initialViewBox.y,
      width: initialViewBox.width,
      height: initialViewBox.height
    };
    const setViewBox = ()=>{
      svg.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    };
    const toSvgPoint = event=>{
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      return point.matrixTransform(svg.getScreenCTM().inverse());
    };

    let zoom = 1;
    let drag = null;
    svg.addEventListener("wheel", event=>{
      event.preventDefault();
      const point = toSvgPoint(event);
      const nextZoom = Math.min(16, Math.max(0.25, zoom * Math.exp(-event.deltaY * 0.0015)));
      const factor = zoom / nextZoom;
      const relativeX = (point.x - viewBox.x) / viewBox.width;
      const relativeY = (point.y - viewBox.y) / viewBox.height;
      viewBox.width *= factor;
      viewBox.height *= factor;
      viewBox.x = point.x - relativeX * viewBox.width;
      viewBox.y = point.y - relativeY * viewBox.height;
      zoom = nextZoom;
      setViewBox();
    }, {passive:false});

    svg.addEventListener("pointerdown", event=>{
      if(event.button !== 0) return;
      const rect = svg.getBoundingClientRect();
      const pixelsPerUnit = Math.min(rect.width / viewBox.width, rect.height / viewBox.height);
      drag = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        viewX: viewBox.x,
        viewY: viewBox.y,
        pixelsPerUnit
      };
      svg.setPointerCapture(event.pointerId);
      svg.style.cursor = "grabbing";
      event.preventDefault();
    });

    svg.addEventListener("pointermove", event=>{
      if(!drag || event.pointerId !== drag.pointerId) return;
      viewBox.x = drag.viewX - (event.clientX - drag.x) / drag.pixelsPerUnit;
      viewBox.y = drag.viewY - (event.clientY - drag.y) / drag.pixelsPerUnit;
      setViewBox();
    });

    const stopDragging = event=>{
      if(!drag || event.pointerId !== drag.pointerId) return;
      drag = null;
      svg.style.cursor = "grab";
    };
    svg.addEventListener("pointerup", stopDragging);
    svg.addEventListener("pointercancel", stopDragging);

    const closeButton = _CN("button", {
      style:"position:absolute;top:10px;right:10px;z-index:1;"
    }, ["Close"], svgdiv);
    closeButton.addEventListener("click", ()=>{
      svgdiv.remove();
      if(this.#svgdiv === svgdiv) this.#svgdiv = null;
    });
  }
  

  hide()
  {
    super.hide();
    if(this.#svgdiv)
    {
      this.#svgdiv.remove();
      this.#svgdiv = null;
    }
    this.#dottool = null;
  }
  
};

const DotViewerTab = new DotViewerTabClass();