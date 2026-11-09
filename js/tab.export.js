class ExportTabClass extends TabClass
{ 

  constructor()
  {
    super("Export");

    _CN("h1", {}, ["Export"], this.div);
    _CN("hr", {}, [], this.div);

    _CN("hr", {style:"width:80%;margin:10px auto;"}, [], this.div);
  }

  show(params)
  {
    super.show(params);

    let exportGenerated = false;
    
    let butt = _CN("button", {style:"width:30vw;margin:10px;"}, ["Generate.xml..."], this.div);
    butt.addEventListener("click", ()=>{
      if(!exportGenerated)
      {
        exportGenerated = true;
        this.createXml();
        butt.enabled = false;
        butt.style.opacity = 0.5;
      }
    });
  }

  hide()
  {
    super.hide();
  }
  

  createXml()
  {
    const xml = XML.getXml();

    let iconExport = _CN("img", {class:"icon icon64", "data-icon":"export", style:"pointer-events:none;"});
    let spanExport = _CN("i", {}, ["Drag&Drop this file over your pet"]);
    let divExport = _CN("span", {style:"cursor:grab;width:128px;height:86px;display:inline-block;", draggable:"true"}, [
      iconExport, _CN("br"), spanExport
    ], this.div);
    
    let iconSaveAni = _CN("img", {class:"icon icon64", "data-icon":"exportani", style:"pointer-events:none;"});
    let spanExportAni = _CN("button", {}, ["💾 Export entire project"]);
    let divExportAni = _CN("span", {style:"cursor:grab;width:128px;height:86px;display:inline-block;", draggable:"true"}, [
      iconSaveAni, _CN("br"), spanExportAni
    ], this.div);

    let buttSaveCopy = _CN("button", {style:"width:200px;"}, ["💾 Save as..."]);
    _CN("table", {style:"margin:0 auto;padding:20px;"}, [_CN("tr", {}, [
      _CN("td", {}, [divExport]),
      _CN("td", {}, [divExportAni]),
    ])], this.div);
    
    buttSaveCopy.addEventListener("click", ()=>{
      alert("not implemented yet");
    });

    divExport.addEventListener("dragstart", (e)=>{
      divExport.style.cursor = "grabbing";
      e.dataTransfer.setData("text/plain", xml);
    });

  }
  
};

const ExportTab = new ExportTabClass();