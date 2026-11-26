class DotViewerTabClass extends TabClass
{ 
  #div = null;
  #dottool = null;
  #viz = null;
  #svgdiv = null;
  #filecontent = null;

  constructor()
  {
    super("Dot Viewer");

    _CN("h1", {}, ["Dot Viewer"], this.div);
    _CN("hr", {}, [], this.div);
    
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

    const divButtons = _CN("div", {style:"position:absolute;top:10px;right:10px;z-index:1;"}, [], svgdiv);

    const saveDOTButton = _CN("button", {}, ["💾 DOT"], divButtons);
    saveDOTButton.addEventListener("click", ()=>{
      this.#filecontent = null;
      this.#saveFile("VG DOT File", {'text/plain':['.vg', '.vg']});
      this.#filecontent = dotText;
    });

    const saveJPGButton = _CN("button", {}, ["💾 JPG"], divButtons);
    saveJPGButton.addEventListener("click", ()=>{
      this.#filecontent = null;
      this.#saveFile("SVG File", {'image/jpeg':['.jpg', '.jpg']});
      const w = svg.viewBox.baseVal.width;
      const h = svg.viewBox.baseVal.height;
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        const canvas = _CN("canvas", {width:w, height:h});
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob((blob) => {
          this.#filecontent = blob;
        }, 'image/jpeg', 0.92);
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
    });

    const saveSvgButton = _CN("button", {}, ["💾 SVG"], divButtons);
    saveSvgButton.addEventListener("click", ()=>{
      this.#filecontent = null;
      this.#saveFile("SVG File", {'image/svg+xml':['.svg', '.svg']});
      const clonedSvg = svg.cloneNode(true);
      clonedSvg.removeAttribute('style');
      this.#filecontent = new XMLSerializer().serializeToString(clonedSvg);
    });

    const closeButton = _CN("button", {}, ["Close"], divButtons);
    closeButton.addEventListener("click", ()=>{
      svgdiv.remove();
      if(this.#svgdiv === svgdiv) this.#svgdiv = null;
    });
  }

  #saveFile(name, accept)
  {
    window.showSaveFilePicker({
      suggestedName: name,
      id: 'e-sheep-openfolder',
      startIn: 'downloads',
      types: [{
        description: name,
        accept: accept
      }]
    }).then(fileHandle=>{
      // todo: await content?
      fileHandle.createWritable().then(async writableStream=>{
        await writableStream.write(this.#filecontent);
        await writableStream.close();
      });
    }).catch(()=>{
      // abort by user
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

class DotTool
{
  constructor(xml)
  {
    if(!xml || !Array.isArray(xml.spawns) || !Array.isArray(xml.animations))
      throw new TypeError("DotTool requires an XML animation model with spawns and animations");

    this.xml = xml;
  }

  createTree()
  {
    const nodes = [];
    const edges = [];
    const animationsById = new Map(
      this.xml.animations.map(animation=>[String(animation.id), animation])
    );
    const nodeId = (type, id) => `${type}_${String(id).replace(/[^a-zA-Z0-9_]/g, "_")}`;

    const totSpawnsProb = XML.getTotalSpawnProbability();
    this.xml.spawns.forEach(spawn=>{
      nodes.push({
        id: nodeId("spawn", spawn.id),
        type: "spawn",
        xmlId: spawn.id,
        probability: parseInt(spawn.probability * 1000 / totSpawnsProb)/10,
        label: `Spawn ${spawn.id} (${spawn.probability}%)`
      });
    });

    this.xml.animations.forEach(animation=>{
      nodes.push({
        id: nodeId("animation", animation.id),
        type: "animation",
        xmlId: animation.id,
        name: animation.name,
        label: `${animation.name} (#${animation.id})`
      });
    });

    const addTransition = (from, targetId, type, totProb, transition=null)=>{
      const targetKey = String(targetId);
      let target = animationsById.get(targetKey);
      let to = nodeId("animation", targetId);

      if(!target)
      {
        to = nodeId("missing_animation", targetId);
        if(!nodes.some(node=>node.id === to))
        {
          nodes.push({
            id: to,
            type: "missing-animation",
            xmlId: targetId,
            label: `Missing animation #${targetId}`
          });
        }
      }

      const probability = (parseInt(transition?.probability * 100 / totProb) == transition?.probability ? `${transition?.probability}%` : `${parseInt(transition?.probability * 1000 / totProb)/10}% (${transition?.probability})`);
      const only = transition?.only ?? "none";
      const label = type === "spawn" ? "start" :
        `${probability} ${type} ${only=='none' ? "" : only}`;

      edges.push({
        from,
        to,
        type,
        targetAnimationId: targetId,
        ...(probability === undefined ? {} : {probability}),
        ...(only === undefined ? {} : {only}),
        label
      });
    };

    this.xml.spawns.forEach(spawn=>{
      const from = nodeId("spawn", spawn.id);
      (spawn.next ?? []).forEach(next=>{
        if(next) addTransition(from, next.value, "spawn");
      });
    });

    this.xml.animations.forEach(animation=>{
      const from = nodeId("animation", animation.id);
      [
        ["S", animation.sequence?.next, animation.getTotalProbability("sequence")], /* Sequence */
        ["B", animation.border?.next, animation.getTotalProbability("border")],   /* Border */
        ["G", animation.gravity?.next, animation.getTotalProbability("gravity")],   /* Gravity */
        ["I", animation.interact?.next, animation.getTotalProbability("interact")]   /* Interact */
      ].forEach(([type, transitions, totProb])=>{
        (transitions ?? []).forEach(next=>{
          if(next) addTransition(from, next.value, type, totProb, next);
        });
      });
    });

    return {name: "animations", directed: true, nodes, edges};
  }

  toDot(tree=this.createTree())
  {
    if(!tree || !Array.isArray(tree.nodes) || !Array.isArray(tree.edges))
      throw new TypeError("toDot requires a tree with nodes and edges");

    const quote = value=>`"${String(value ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\r?\n/g, "\\n")}"`;
    const lines = [
      "digraph animations {",
      "  graph [rankdir=LR];",
      '  node [fontname="Arial"];'
    ];
    const edgeColors = { /* Sequence, Border, Gravity, Interact */
      S: "#1f77b4",
      B: "#d62728",
      I: "#c68728",
      G: "#2ca02c"
    };
    const nodesWithNext = new Set(tree.edges.map(edge=>edge.from));

    tree.nodes.forEach(node=>{
      const shape = node.type === "spawn" ? "oval" : "box";
      let style = "";
      if(node.type === "missing-animation")
        style = ", color=red, fontcolor=red";
      else if(node.type === "animation" && !nodesWithNext.has(node.id))
        style = ', style=filled, fillcolor="#fff2cc", color="#d6a400"';
      lines.push(`  ${node.id} [shape=${shape}, label=${quote(node.label)}${style}];`);
    });

    tree.edges.forEach(edge=>{
      const color = edgeColors[edge.type];
      const colorAttribute = color ? `, color="${color}", fontcolor="${color}"` : "";
      lines.push(`  ${edge.from} -> ${edge.to} [label=${quote(edge.label)}${colorAttribute}];`);
    });

    // add legend
    lines.push("subgraph cluster_legend {");
    lines.push('label = "Legend";');
    lines.push('l_special1 [shape=box, label="Animation"];');
    lines.push('l_special2 [shape=box, label="End Animation", style=filled, fillcolor="#fff2cc"];');
    lines.push('l_special3 [shape=oval, label="Spawn"];');
    lines.push('l_special3 -> l_special1 [style=invis];');
    lines.push('l_special1 -> l_special2 [style=invis];');
    lines.push("node [shape=point, width=0, height=0, style=invis]; l_s1; l_s2; l_b1; l_b2; l_i1; l_i2; l_g1; l_g2;")
    lines.push('l_s1 -> l_s2 [label=" S (Sequence over)", color="#1f77b4", fontcolor="#1f77b4"];');
    lines.push('l_b1 -> l_b2 [label=" B (Border detected)", color="#d62728", fontcolor="#d62728"];');
    lines.push('l_i1 -> l_i2 [label=" I (Interact detected)", color="#c68728", fontcolor="#c68728"];');
    lines.push('l_g1 -> l_g2 [label=" G (Gravity detected)", color="#2ca02c", fontcolor="#2ca02c"];');
    lines.push("}");
    //lines.push('{ rank=same; l_special1; l_special2; l_s1; l_b1; l_g1 }');
    // end legend
    lines.push("}");
    return lines.join("\n");
  }

  downloadDot(filename="animations.dot")
  {
    if(typeof document === "undefined" || typeof URL === "undefined" || !URL.createObjectURL)
      throw new Error("Downloading a DOT file requires a browser");

    const blob = new Blob([this.toDot()], {type:"text/vnd.graphviz;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 0);
    return blob;
  }
}