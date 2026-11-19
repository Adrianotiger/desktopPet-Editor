class XmlViewerTabClass extends TabClass
{ 
  #div = null;

  constructor()
  {
    super("XML Viewer");

    _CN("h1", {}, ["XML Viewer"], this.div);
    _CN("hr", {}, [], this.div);
    
    loadScripts(["../3thparty/qwenxml"], true);
    
  }

  show(params)
  {
    super.show(params);
    
    TabMenu.addIcon("filexml", "Original", ()=>{
      this.#clearDiv();
      this.#showSingle("original");
    });
    TabMenu.addIcon("filexml", "Current", ()=>{
      this.#clearDiv();
      this.#showSingle("current");
    });
    TabMenu.addIcon("filexml", "Compare", ()=>{
      this.#clearDiv();
      this.#showDouble();
    });
  }

  #clearDiv()
  {
    if(this.#div) 
    {
      this.div.removeChild(this.#div);
      this.#div = null;
    }
  }

  #showSingle(origin)
  {
    this.#div = _CN("div", {style:"text-align:left;font-size:12px;line-height:15px;display:flex;flex-direction: column;"}, [], this.div);

    const notepad = new XmlNotepad(
      this.#div, 
      origin == "original" ? 
        XML.xmlOriginalString??sampleXml : 
        XML.xmlNewString??sampleXml
    );
  }

  #showDouble(origin)
  {
    let div1 = _CN("div", {});
    let div2 = _CN("div", {});
    this.#div = _CN("table", {style:"width:100%;"}, [
      _CN("tr", {}, [
        _CN("td", {style:"vertical-align:top;"}, [div1]), 
        _CN("td", {style:"vertical-align:top;"}, [div2])
      ])
    ], this.div);

    const notepad1 = new XmlNotepad(
      div1, 
      XML.xmlOriginalString??sampleXml
    );
    const notepad2 = new XmlNotepad(
      div2, 
      XML.xmlNewString??sampleXml
    );
    notepad2.compare(notepad1);
  }

  hide()
  {
    super.hide();
    // remove div for GC, as this div is really big!
    this.#clearDiv();
  }
  
  
};

const XmlViewerTab = new XmlViewerTabClass();